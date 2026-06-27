/**
 * HAE SCORECARD — Firebase Rollup Function
 * =========================================
 * HOSPITAL AT EKHAYA · Vuma Development Solutions (Pty) Ltd
 *
 * Direct port of the Apps Script captureWeek() + rollupDept() logic.
 * Reads Firestore submissions, computes weekly RAG scores, writes
 * weeklyRollups and hospitalWeeklySummary documents.
 *
 * Runs entirely in the browser — no server, no Cloud Functions.
 * COO runs this from the admin dashboard after each week closes.
 *
 * Load order in your HTML:
 *   1. Firebase SDK (app + firestore)
 *   2. hae-scorecard-schema.js   (SCHEMA, getWeekEnding, weekLabel etc.)
 *   3. hae-scorecard-rollup.js   (this file)
 *
 * Usage:
 *   const result = await runWeeklyRollup('2026-07-03');  // Thursday date
 *   console.log(result);  // { depts: [...], hospital: {...} }
 *
 * Idempotent — safe to run multiple times for the same week.
 * Latest run always overwrites. No duplicates.
 */

// ─── CONSTANTS (ported exactly from Apps Script) ──────────────────────────

const ANSWER_MAP = { yes: 'GREEN', most: 'AMBER', no: 'RED' };
const NA_WORDS   = ['n/a', 'na', 'not applicable', ''];
const RAG_SCORE  = { GREEN: 5, AMBER: 3, RED: 1 };

const REPORTING = {
  billing:         { expected: 5,  mode: 'exact' },
  caseManagement:  { expected: 5,  mode: 'exact' },
  finance:         { expected: 5,  mode: 'exact' },
  supportServices: { expected: 7,  mode: 'exact' },
  nursing:         { expected: 7,  mode: 'exact' },
  security:        { expected: 14, mode: 'exact' },
  marketing:       { expected: 2,  mode: 'min'   },
};

const KEY_FIGURE_ITEM = {
  billing:         'patientsBilled',
  caseManagement:  'newAdmissions',
  supportServices: 'breakfastServed',
  marketing:       'newFollowers',
  // finance, security → no figure
  // nursing → reconciliation (special case)
};

const DEPT_ORDER = [
  'billing', 'caseManagement', 'finance',
  'supportServices', 'security', 'marketing', 'nursing'
];

const DEPT_LABELS = {
  billing:         'Billing',
  caseManagement:  'Case Management',
  finance:         'Finance',
  supportServices: 'Support Services',
  security:        'Security',
  marketing:       'Marketing',
  nursing:         'Nursing',
};


// ─── ANSWER HELPERS (ported from Apps Script) ─────────────────────────────

function norm(s) {
  return String(s == null ? '' : s).trim().toLowerCase();
}

/**
 * Convert an answer string to GREEN/AMBER/RED or null (N/A or blank).
 * Tolerates trailing punctuation, extra spaces — same as Apps Script.
 */
function answerToRAG(v) {
  const n = norm(v);
  if (NA_WORDS.includes(n)) return null;
  if (ANSWER_MAP[n]) return ANSWER_MAP[n];
  // tolerate "yes "/"most." etc.
  for (const k in ANSWER_MAP) {
    if (n.indexOf(k) === 0) return ANSWER_MAP[k];
  }
  return null;
}

/**
 * True only for a DELIBERATE N/A answer — blank = unanswered, not N/A.
 * This distinction drives the N/A loophole protection.
 */
function isExplicitNA(v) {
  const n = norm(v);
  if (n === '') return false;
  return ['n/a', 'na', 'not applicable'].includes(n);
}


// ─── RAG LOGIC (override rule — ported exactly) ───────────────────────────

/**
 * Section RAG from its answered item RAGs.
 * Override rule — NEVER average. See handoff doc §5.
 *
 * all GREEN       → GREEN
 * 1 RED only      → AMBER
 * any AMBER       → AMBER
 * 2+ RED          → RED
 * nothing answered→ null (PENDING)
 */
function sectionRAG(items) {
  let g = 0, a = 0, r = 0;
  for (const item of items) {
    if (item === 'GREEN') g++;
    else if (item === 'AMBER') a++;
    else if (item === 'RED') r++;
  }
  if (g + a + r === 0) return null;
  if (r >= 2) return 'RED';
  if (a === 0 && r === 0) return 'GREEN';
  return 'AMBER';
}

/**
 * Department RAG from its section RAGs — same override rule.
 */
function deptRAGFromSections(secRAGs) {
  let g = 0, a = 0, r = 0;
  for (const rag of secRAGs) {
    if (rag === 'GREEN') g++;
    else if (rag === 'AMBER') a++;
    else if (rag === 'RED') r++;
  }
  if (g + a + r === 0) return 'PENDING';
  if (r >= 2) return 'RED';
  if (a === 0 && r === 0) return 'GREEN';
  return 'AMBER';
}

/**
 * Hospital overall RAG — same override over 7 dept RAGs.
 */
function hospitalRAGFromDepts(deptRAGs) {
  return deptRAGFromSections(deptRAGs);
}

/**
 * Numeric score (info only — never decides RAG colour).
 * GREEN=5, AMBER=3, RED=1. Average across sections.
 */
function ragScore(secRAGs) {
  const rated = secRAGs.filter(r => RAG_SCORE[r]);
  if (!rated.length) return null;
  const sum = rated.reduce((acc, r) => acc + RAG_SCORE[r], 0);
  return Math.round((sum / rated.length) * 10) / 10;
}


// ─── FIRESTORE QUERY HELPERS ──────────────────────────────────────────────

/**
 * Get the Friday start date for a Thursday-ending week.
 * Week runs Friday 00:00 → Thursday 23:59.
 */
function weekStart(weekEndingStr) {
  const thu = new Date(weekEndingStr + 'T00:00:00Z');
  const fri = new Date(thu);
  fri.setUTCDate(thu.getUTCDate() - 6);
  return fri;
}

function weekEnd(weekEndingStr) {
  const thu = new Date(weekEndingStr + 'T23:59:59Z');
  return thu;
}

/**
 * Fetch all submissions for a department within the week window.
 * Reads from flat collection: submissions/{deptId}__{date}__single
 */
async function fetchDeptSubmissions(db, deptId, weekEndingStr) {
  const start = weekStart(weekEndingStr);
  const end   = weekEnd(weekEndingStr);

  const snap = await db.collection('submissions')
    .where('deptId', '==', deptId)
    .where('date', '>=', firebase.firestore.Timestamp.fromDate(start))
    .where('date', '<=', firebase.firestore.Timestamp.fromDate(end))
    .get();

  return snap.docs.map(d => d.data());
}


// ─── CORE ROLLUP: ONE DEPARTMENT ─────────────────────────────────────────

/**
 * Compute the weekly rollup for one department.
 * Direct port of rollupDept() from Apps Script.
 *
 * @param {Array}  submissions  — array of Firestore submission documents
 * @param {string} deptId       — e.g. 'billing'
 * @param {object} schema       — the dept's schema from SCHEMA[deptId]
 * @returns {object}            — rollup result
 */
function rollupDept(submissions, deptId, schema) {
  const reporting = REPORTING[deptId] || { expected: 5, mode: 'exact' };
  const submissionCount = submissions.length;

  // Per-section: accumulate item RAGs and N/A counts across all submissions
  const secItems = {};   // sectionId -> [RAG, ...]
  const secNA    = {};   // sectionId -> count of explicit N/A answers
  const secNotes = {};   // sectionId -> [note strings]

  for (const sec of schema.sections) {
    secItems[sec.id] = [];
    secNA[sec.id]    = 0;
    secNotes[sec.id] = [];
  }

  for (const sub of submissions) {
    const sections = sub.sections || {};

    for (const sec of schema.sections) {
      const secData = sections[sec.id] || {};
      const items   = secData.items || {};
      const note    = secData.note || '';

      // Collect note
      if (note.trim()) secNotes[sec.id].push(note.trim());

      // Process each rating item in this section
      for (const item of sec.items) {
        if (item.type === 'note') continue;  // skip note pseudo-items

        const rawVal = items[item.id];

        if (item.type === 'rating') {
          const rag = answerToRAG(rawVal);
          if (rag) {
            secItems[sec.id].push(rag);
          } else if (isExplicitNA(rawVal)) {
            secNA[sec.id]++;
          }
          // blank/unanswered → excluded, NOT counted as N/A

        } else if (item.type === 'time' && item.threshold && rawVal) {
          // Time items: score on-time vs late
          const timeRAG = scoreTimeItem(rawVal, item.threshold);
          if (timeRAG) secItems[sec.id].push(timeRAG);
        }
        // number/data items → not rated, not counted
      }
    }
  }

  // Compute section RAGs
  const sections = [];
  const secRAGList = [];
  let naTotal = 0;
  const naFlaggedSections = [];

  for (const sec of schema.sections) {
    const rag = sectionRAG(secItems[sec.id]);
    const na  = secNA[sec.id] || 0;
    naTotal += na;

    sections.push({
      id:     sec.id,
      letter: sec.letter,
      label:  sec.label,
      rating: rag || 'PENDING',
      naCount: na,
      naFlagged: na >= 2,
    });

    if (rag) secRAGList.push(rag);
    if (na >= 2) naFlaggedSections.push(sec.label);
  }

  // Department RAG
  let deptRAG = deptRAGFromSections(secRAGList);
  const score = ragScore(secRAGList);

  // Compliance flag
  const compliant = reporting.mode === 'min'
    ? submissionCount >= reporting.expected
    : submissionCount === reporting.expected;
  const complianceLabel = submissionCount + '/' + reporting.expected + (compliant ? ' ✓' : ' ⚠');
  const complianceFlag  = !compliant;

  // ── GREEN GATE (N/A loophole protection) ──────────────────────────────
  // A department CANNOT be GREEN if reporting is short OR N/A use is heavy.
  // RED and AMBER are untouched — only false GREENs are caught.
  const dataThin = !compliant || naFlaggedSections.length > 0;
  let greenGatePassed = true;
  let greenGateReason = '';

  if (deptRAG === 'GREEN' && dataThin) {
    deptRAG = 'AMBER';
    greenGatePassed = false;
    greenGateReason = !compliant
      ? (naFlaggedSections.length > 0 ? 'reporting incomplete + heavy N/A use' : 'reporting incomplete')
      : 'heavy N/A use';
  }

  // ── BUILD TOP ISSUE (notes concatenation) ─────────────────────────────
  const noteParts = [];
  for (const sec of schema.sections) {
    const notes = secNotes[sec.id] || [];
    for (const n of notes) noteParts.push(n);
  }

  // Append automatic N/A flag note
  if (naFlaggedSections.length) {
    noteParts.push('⚠ 2+ items marked N/A in: ' + naFlaggedSections.join(', '));
  }

  // Explain a capped GREEN so the CEO sees why a clean dept shows AMBER
  if (!greenGatePassed) {
    noteParts.push('⚠ rating held at AMBER — cannot confirm GREEN on ' + greenGateReason);
  }

  const topIssue = noteParts.join('  |  ');

  // ── KEY FIGURE ────────────────────────────────────────────────────────
  let keyFigure = null;
  const figureItemId = KEY_FIGURE_ITEM[deptId];
  if (figureItemId) {
    let sum = 0;
    let any = false;
    for (const sub of submissions) {
      for (const sec of schema.sections) {
        const val = (sub.sections?.[sec.id]?.items?.[figureItemId]);
        if (val !== undefined && val !== '' && !isNaN(Number(val))) {
          sum += Number(val);
          any = true;
        }
      }
    }
    if (any) keyFigure = sum;
  }

  return {
    deptId,
    deptLabel:       DEPT_LABELS[deptId],
    rating:          deptRAG,
    score:           score,
    sections,
    topIssue,
    keyFigure,
    submissionsExpected: reporting.expected,
    submissionsReceived: submissionCount,
    complianceMode:  reporting.mode,
    complianceFlag,
    complianceLabel,
    naCount:         naTotal,
    naFlaggedSections,
    greenGatePassed,
    greenGateReason,
  };
}

/**
 * Score a time item against its threshold.
 * on-time → GREEN, late → RED
 * e.g. '07:15' vs threshold '07:20' → GREEN
 */
function scoreTimeItem(timeStr, threshold) {
  if (!timeStr || !threshold) return null;
  const parse = t => {
    const parts = String(t).trim().split(':');
    if (parts.length < 2) return null;
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  };
  const actual = parse(timeStr);
  const limit  = parse(threshold);
  if (actual === null || limit === null) return null;
  return actual <= limit ? 'GREEN' : 'RED';
}


// ─── NURSING RECONCILIATION ───────────────────────────────────────────────

/**
 * Nursing admissionsProcessed (weekly sum) minus
 * CaseManagement newAdmissions (weekly sum).
 * Gap === 0 → GREEN, Gap !== 0 → RED.
 */
function nursingReconciliation(nursingSubmissions, casemSubmissions) {
  const sumField = (submissions, sectionId, itemId) => {
    let sum = 0, any = false;
    for (const sub of submissions) {
      const val = sub.sections?.[sectionId]?.items?.[itemId];
      if (val !== undefined && val !== '' && !isNaN(Number(val))) {
        sum += Number(val);
        any = true;
      }
    }
    return any ? sum : null;
  };

  const nursingAdmissions = sumField(nursingSubmissions, 'admissionsDischarges', 'admissionsProcessed');
  const casemAdmissions   = sumField(casemSubmissions,   'admissions',           'newAdmissions');

  if (nursingAdmissions === null || casemAdmissions === null) {
    return { gap: null, status: 'PENDING', nursingAdmissions, casemAdmissions };
  }

  const gap = nursingAdmissions - casemAdmissions;
  return {
    gap,
    status: gap === 0 ? 'GREEN' : 'RED',
    nursingAdmissions,
    casemAdmissions,
  };
}


// ─── MAIN ROLLUP ENTRY POINT ──────────────────────────────────────────────

/**
 * Run the full weekly rollup for all 7 departments.
 * Writes weeklyRollups/{weekEnding}/{deptId} and hospitalWeeklySummary/{weekEnding}.
 * Idempotent — safe to run multiple times.
 *
 * @param {object} db              — Firestore instance
 * @param {string} weekEndingStr   — 'YYYY-MM-DD' Thursday
 * @param {object} schema          — HAE_SCHEMA from hae-scorecard-schema.js
 * @param {function} onProgress    — optional callback(message) for UI updates
 * @returns {object}               — { depts: [...], hospital: {...} }
 */
async function runWeeklyRollup(db, weekEndingStr, schema, onProgress) {
  const log = onProgress || (msg => console.log(msg));
  const now = new Date().toISOString();

  log(`Starting rollup for week ending ${weekEndingStr}...`);

  // Fetch all submissions for the week (all depts in parallel)
  log('Fetching submissions from Firestore...');
  const allSubmissions = {};
  await Promise.all(DEPT_ORDER.map(async deptId => {
    allSubmissions[deptId] = await fetchDeptSubmissions(db, deptId, weekEndingStr);
    log(`  ${DEPT_LABELS[deptId]}: ${allSubmissions[deptId].length} submissions`);
  }));

  // Rollup each department
  log('Computing department rollups...');
  const deptResults = {};
  for (const deptId of DEPT_ORDER) {
    deptResults[deptId] = rollupDept(
      allSubmissions[deptId],
      deptId,
      schema[deptId]
    );
  }

  // Nursing reconciliation (special case)
  const recon = nursingReconciliation(
    allSubmissions['nursing'],
    allSubmissions['caseManagement']
  );
  // Override nursing key figure with reconciliation gap
  deptResults['nursing'].keyFigure = recon.gap;
  deptResults['nursing'].reconciliation = recon;

  // Hospital overall
  const deptRAGs  = DEPT_ORDER.map(d => deptResults[d].rating);
  const hospRAG   = hospitalRAGFromDepts(deptRAGs);
  const allScores = DEPT_ORDER
    .map(d => deptResults[d].score)
    .filter(s => s !== null);
  const hospScore = allScores.length
    ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10
    : null;

  const deptsInRed   = DEPT_ORDER.filter(d => deptResults[d].rating === 'RED');
  const deptsInAmber = DEPT_ORDER.filter(d => deptResults[d].rating === 'AMBER');
  const reportingGaps = DEPT_ORDER.filter(d => deptResults[d].complianceFlag);

  // Write to Firestore
  log('Writing rollups to Firestore...');
  const batch = db.batch();

  // weeklyRollups/{weekEnding}/{deptId}
  for (const deptId of DEPT_ORDER) {
    const ref = db.collection('weeklyRollups')
      .doc(weekEndingStr)
      .collection('departments')
      .doc(deptId);
    batch.set(ref, {
      ...deptResults[deptId],
      weekEnding:  weekEndingStr,
      capturedAt:  now,
      capturedBy:  'rollup_function_v1',
    });
  }

  // hospitalWeeklySummary/{weekEnding}
  const summaryRef = db.collection('hospitalWeeklySummary').doc(weekEndingStr);
  const summary = {
    weekEnding:    weekEndingStr,
    capturedAt:    now,
    overallRating: hospRAG,
    overallScore:  hospScore,
    deptsInRed,
    deptsInAmber,
    reportingGaps,
    nursingCaseMReconciliation: recon,
    departments: {},
  };
  for (const deptId of DEPT_ORDER) {
    const r = deptResults[deptId];
    summary.departments[deptId] = {
      label:          r.deptLabel,
      rating:         r.rating,
      score:          r.score,
      complianceFlag: r.complianceFlag,
      complianceLabel: r.complianceLabel,
      keyFigure:      r.keyFigure,
      topIssue:       r.topIssue,
      naCount:        r.naCount,
      greenGatePassed: r.greenGatePassed,
    };
  }
  batch.set(summaryRef, summary);

  await batch.commit();
  log(`✅ Rollup complete for ${weekEndingStr}`);

  return {
    weekEnding: weekEndingStr,
    hospital: {
      rating: hospRAG,
      score:  hospScore,
      deptsInRed,
      deptsInAmber,
      reportingGaps,
      reconciliation: recon,
    },
    depts: DEPT_ORDER.map(d => deptResults[d]),
  };
}


// ─── EXPORTS ─────────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  window.HAE_ROLLUP = {
    runWeeklyRollup,
    rollupDept,
    sectionRAG,
    deptRAGFromSections,
    hospitalRAGFromDepts,
    ragScore,
    answerToRAG,
    isExplicitNA,
    nursingReconciliation,
    DEPT_ORDER,
    DEPT_LABELS,
    REPORTING,
    KEY_FIGURE_ITEM,
    RAG_SCORE,
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    runWeeklyRollup, rollupDept, sectionRAG,
    deptRAGFromSections, hospitalRAGFromDepts, ragScore,
    answerToRAG, isExplicitNA, nursingReconciliation,
    DEPT_ORDER, DEPT_LABELS, REPORTING, RAG_SCORE,
  };
}
