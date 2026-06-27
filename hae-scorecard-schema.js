/**
 * HAE SCORECARD — FIREBASE SCHEMA DEFINITION
 * ===========================================
 * HOSPITAL AT EKHAYA · Vuma Development Solutions (Pty) Ltd
 * 
 * This file is the single source of truth for the Firestore data model.
 * Entry forms render FROM this schema. Rollup logic reads FROM this schema.
 * CEO dashboard reads FROM the rollup collections.
 * 
 * Nothing gets built without a corresponding definition here first.
 * 
 * Governing principle: resource allocation visibility, NOT punishment.
 * 
 * Last updated: June 2026 · J. Jacques Bornman, COO
 */

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1 — ITEM TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * RATING   → Yes / Most / No / N-A
 *            Yes=GREEN, Most=AMBER, No=RED, N-A=excluded from score but counted
 * 
 * NUMBER   → positive integer (e.g. patients billed, admissions, meals served)
 *            recorded, not rated
 * 
 * TIME     → HH:MM string (meal serving times)
 *            scored against threshold: on-time=GREEN, late=RED
 *            Thresholds: Breakfast ≤07:20, Lunch ≤12:20, Supper ≤17:20
 * 
 * DATA     → free text or number, recorded but never rated
 *            (e.g. electricity units, stock value, power outage Y/N)
 * 
 * NOTE     → one per section (free text), concatenated into weekly Top Issue
 */

const ITEM_TYPES = ['rating', 'number', 'time', 'data', 'note'];


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2 — DEPARTMENT SCHEMA
// ═══════════════════════════════════════════════════════════════════════════
// Each department has:
//   id          — camelCase key used in Firestore paths
//   label       — display name
//   reportingDays — which days submissions are expected
//   expectedPerWeek — exact number (or minimum for marketing)
//   complianceMode  — 'exact' | 'minimum'
//   keyFigureItem   — the item id whose weekly sum = the headline figure
//   sections    — ordered array of sections
//     Each section has:
//       id      — camelCase key
//       letter  — A/B/C... display prefix
//       label   — display name
//       items   — ordered array of items
//         Each item has:
//           id      — camelCase key (stable, used in Firestore)
//           label   — display name shown to manager entering data
//           type    — one of ITEM_TYPES
//           threshold — (time items only) 'HH:MM'
//           note    — true if this is the section note field

const SCHEMA = {

  // ─────────────────────────────────────────────────────────────────────────
  billing: {
    id: 'billing',
    label: 'Billing',
    reportingDays: ['Mon','Tue','Wed','Thu','Fri'],
    expectedPerWeek: 5,
    complianceMode: 'exact',
    keyFigureItem: 'patientsBilled',
    sections: [
      {
        id: 'patientDetailsReadiness',
        letter: 'A',
        label: 'Patient Details & Readiness',
        items: [
          { id: 'admissionDetailsCapture',   label: 'Admission details captured on day of admission',           type: 'rating' },
          { id: 'medicalAidDetails',         label: 'Medical aid details verified and on file',                  type: 'rating' },
          { id: 'patientConsentSigned',      label: 'Patient consent form signed',                              type: 'rating' },
          { id: 'authorisationRequested',    label: 'Medical aid authorisation requested within 24hrs',          type: 'rating' },
          { id: 'patientsBilled',            label: 'No of patients billed today',                              type: 'number' },
          { id: 'noteA',                     label: 'Notes / issues',                                           type: 'note'   },
        ]
      },
      {
        id: 'claims',
        letter: 'B',
        label: 'Claims',
        items: [
          { id: 'claimsSubmittedSameDay',    label: 'Claims submitted same day as discharge',                   type: 'rating' },
          { id: 'claimsChased',              label: 'Outstanding claims followed up',                           type: 'rating' },
          { id: 'rejectionsFlagged',         label: 'Rejections and queries flagged same day',                  type: 'rating' },
          { id: 'noteB',                     label: 'Notes / issues',                                           type: 'note'   },
        ]
      },
      {
        id: 'queries',
        letter: 'C',
        label: 'Queries',
        items: [
          { id: 'queriesLogged',             label: 'Medical aid queries logged and actioned',                  type: 'rating' },
          { id: 'queryResponseTimeMet',      label: 'Query response within agreed turnaround',                  type: 'rating' },
          { id: 'noteC',                     label: 'Notes / issues',                                           type: 'note'   },
        ]
      },
      {
        id: 'cashPostings',
        letter: 'D',
        label: 'Cash Postings',
        items: [
          { id: 'cashPostedSameDay',         label: 'Cash receipts posted same day',                            type: 'rating' },
          { id: 'cashReconciled',            label: 'Daily cash reconciliation completed',                      type: 'rating' },
          { id: 'noteD',                     label: 'Notes / issues',                                           type: 'note'   },
        ]
      },
      {
        id: 'reporting',
        letter: 'E',
        label: 'Reporting',
        items: [
          { id: 'billingReportSubmitted',    label: 'Daily billing summary submitted to management',            type: 'rating' },
          { id: 'outstandingFlagged',        label: 'Outstanding authorisations flagged in report',             type: 'rating' },
          { id: 'noteE',                     label: 'Notes / issues',                                           type: 'note'   },
        ]
      },
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  caseManagement: {
    id: 'caseManagement',
    label: 'Case Management',
    reportingDays: ['Mon','Tue','Wed','Thu','Fri'],
    expectedPerWeek: 5,
    complianceMode: 'exact',
    keyFigureItem: 'newAdmissions',
    sections: [
      {
        id: 'admissions',
        letter: 'A',
        label: 'Admissions',
        items: [
          { id: 'newAdmissions',             label: 'No of new admissions for the day',                         type: 'number' },
          { id: 'authorisationOnAdmission',  label: 'Authorisation obtained on or before admission',            type: 'rating' },
          { id: 'admissionPackComplete',     label: 'Admission pack complete and filed',                        type: 'rating' },
          { id: 'noteA',                     label: 'Notes / issues',                                           type: 'note'   },
        ]
      },
      {
        id: 'careCoordination',
        letter: 'B',
        label: 'Care Coordination',
        items: [
          { id: 'careplanUpdated',           label: 'Care plan updated or confirmed with clinical team',        type: 'rating' },
          { id: 'familyCommunication',       label: 'Family / next-of-kin communication done where required',  type: 'rating' },
          { id: 'mdtFlagged',               label: 'Complex cases flagged for MDT review',                    type: 'rating' },
          { id: 'noteB',                     label: 'Notes / issues',                                           type: 'note'   },
        ]
      },
      {
        id: 'utilisation',
        letter: 'C',
        label: 'Utilisation',
        items: [
          { id: 'losDaysReviewed',           label: 'Length of stay reviewed against authorised days',         type: 'rating' },
          { id: 'reauthorisationRequested',  label: 'Re-authorisation requested before expiry',                type: 'rating' },
          { id: 'noteC',                     label: 'Notes / issues',                                           type: 'note'   },
        ]
      },
      {
        id: 'discharging',
        letter: 'D',
        label: 'Discharging',
        items: [
          { id: 'dischargePlanInPlace',      label: 'Discharge plan in place for scheduled discharges',        type: 'rating' },
          { id: 'medicalAidNotified',        label: 'Medical aid notified of discharge same day',              type: 'rating' },
          { id: 'noteD',                     label: 'Notes / issues',                                           type: 'note'   },
        ]
      },
      {
        id: 'documentation',
        letter: 'E',
        label: 'Documentation',
        items: [
          { id: 'motivationLettersFiled',    label: 'Motivation letters filed and tracked',                    type: 'rating' },
          { id: 'clinicalNotesLinked',       label: 'Clinical notes linked to case file',                      type: 'rating' },
          { id: 'noteE',                     label: 'Notes / issues',                                           type: 'note'   },
        ]
      },
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  finance: {
    id: 'finance',
    label: 'Finance',
    reportingDays: ['Mon','Tue','Wed','Thu','Fri'],
    expectedPerWeek: 5,
    complianceMode: 'exact',
    keyFigureItem: null,
    sections: [
      {
        id: 'krcPatientCapture',
        letter: 'A',
        label: 'KRC Patient Capture',
        items: [
          { id: 'krcPatientsCapured',        label: 'KRC patient records captured in system',                  type: 'rating' },
          { id: 'krcBillingCurrent',         label: 'KRC billing up to date',                                  type: 'rating' },
          { id: 'noteA',                     label: 'Notes / issues',                                           type: 'note'   },
        ]
      },
      {
        id: 'authorisations',
        letter: 'B',
        label: 'Authorisations',
        items: [
          { id: 'authsTracked',              label: 'All active authorisations tracked and current',           type: 'rating' },
          { id: 'expiringAuthsActioned',     label: 'Expiring authorisations actioned before expiry',         type: 'rating' },
          { id: 'noteB',                     label: 'Notes / issues',                                           type: 'note'   },
        ]
      },
      {
        id: 'billing',
        letter: 'C',
        label: 'Billing',
        items: [
          { id: 'invoicesRaisedSameDay',     label: 'Invoices raised same day as service',                    type: 'rating' },
          { id: 'billingAccurate',           label: 'Billing codes verified for accuracy',                    type: 'rating' },
          { id: 'noteC',                     label: 'Notes / issues',                                           type: 'note'   },
        ]
      },
      {
        id: 'remittanceRecons',
        letter: 'D',
        label: 'Remittance & Reconciliation',
        items: [
          { id: 'remittancesProcessed',      label: 'Remittances processed same day received',                type: 'rating' },
          { id: 'reconsDoneDaily',           label: 'Daily reconciliation completed and signed off',          type: 'rating' },
          { id: 'noteD',                     label: 'Notes / issues',                                           type: 'note'   },
        ]
      },
      {
        id: 'creditControl',
        letter: 'E',
        label: 'Credit Control',
        items: [
          { id: 'agedDebtorsReviewed',       label: 'Aged debtors reviewed and actioned',                    type: 'rating' },
          { id: 'overdueAccountsChased',     label: 'Overdue accounts followed up',                          type: 'rating' },
          { id: 'noteE',                     label: 'Notes / issues',                                           type: 'note'   },
        ]
      },
      {
        id: 'financeReporting',
        letter: 'F',
        label: 'Reporting',
        items: [
          { id: 'dailyFinanceReportDone',    label: 'Daily finance summary submitted to COO',                type: 'rating' },
          { id: 'cashPositionReported',      label: 'Cash position reported accurately',                     type: 'rating' },
          { id: 'noteF',                     label: 'Notes / issues',                                           type: 'note'   },
        ]
      },
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  supportServices: {
    id: 'supportServices',
    label: 'Support Services',
    reportingDays: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    expectedPerWeek: 7,
    complianceMode: 'exact',
    keyFigureItem: 'breakfastServed',
    sections: [
      {
        id: 'laundry',
        letter: 'A',
        label: 'Laundry',
        items: [
          { id: 'laundryDoneOnTime',         label: 'Laundry collected, washed and returned on schedule',     type: 'rating' },
          { id: 'linenConditionChecked',     label: 'Linen condition checked — damaged items removed',       type: 'rating' },
          { id: 'laundryLogSigned',          label: 'Laundry log signed off',                                type: 'rating' },
          { id: 'noteA',                     label: 'Notes / issues',                                         type: 'note'   },
        ]
      },
      {
        id: 'cleaning',
        letter: 'B',
        label: 'Cleaning',
        items: [
          { id: 'wardsCleanedMorning',       label: 'Wards cleaned and checked by 07:30',                   type: 'rating' },
          { id: 'bathroomsCheckedHourly',    label: 'Bathrooms checked hourly and signed off',               type: 'rating' },
          { id: 'commonAreasClean',          label: 'Common areas and corridors clean throughout the day',   type: 'rating' },
          { id: 'cleaningProductsAvailable', label: 'Cleaning products stocked and available',               type: 'rating' },
          { id: 'noteB',                     label: 'Notes / issues',                                         type: 'note'   },
        ]
      },
      {
        id: 'cookingKitchen',
        letter: 'C',
        label: 'Cooking & Kitchen',
        items: [
          { id: 'breakfastTime',             label: 'Breakfast serving time',                                 type: 'time',   threshold: '07:20' },
          { id: 'lunchTime',                 label: 'Lunch serving time',                                    type: 'time',   threshold: '12:20' },
          { id: 'supperTime',                label: 'Supper serving time',                                   type: 'time',   threshold: '17:20' },
          { id: 'breakfastServed',           label: 'No of breakfasts served',                               type: 'number' },
          { id: 'menuFollowed',              label: 'Approved menu followed for all meals',                  type: 'rating' },
          { id: 'portionSizesCorrect',       label: 'Portion sizes correct per dietician standard',         type: 'rating' },
          { id: 'kitchenCleanAfterMeals',    label: 'Kitchen clean and sanitised after each meal service',  type: 'rating' },
          { id: 'totalStockValue',           label: 'Total calculated stock value (R)',                      type: 'data'   },
          { id: 'totalPurchasesDay',         label: 'Total purchases for the day (R)',                       type: 'data'   },
          { id: 'noteC',                     label: 'Notes / issues',                                         type: 'note'   },
        ]
      },
      {
        id: 'patientExperience',
        letter: 'D',
        label: 'Patient Experience',
        items: [
          { id: 'complaintsLogged',          label: 'Patient complaints or concerns logged and actioned',    type: 'rating' },
          { id: 'patientEnvironmentChecked', label: 'Patient environment comfort check completed',           type: 'rating' },
          { id: 'noteD',                     label: 'Notes / issues',                                         type: 'note'   },
        ]
      },
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  security: {
    id: 'security',
    label: 'Security',
    reportingDays: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    expectedPerWeek: 14,   // 2 per day — day shift + night shift
    complianceMode: 'exact',
    keyFigureItem: null,
    shiftSelector: true,   // day / night — new in Firebase rebuild
    sections: [
      {
        id: 'mainGateEntrance',
        letter: 'A',
        label: 'Main Gate & Entrance',
        items: [
          { id: 'gateSecured',               label: 'Main gate secured and operational',                      type: 'rating' },
          { id: 'visitorRegisterComplete',   label: 'Visitor register completed for all entries',             type: 'rating' },
          { id: 'unauthorisedAccessPrevented', label: 'No unauthorised access during shift',                  type: 'rating' },
          { id: 'noteA',                     label: 'Notes / issues',                                          type: 'note'   },
        ]
      },
      {
        id: 'wellnessCentre',
        letter: 'B',
        label: 'Wellness Centre',
        items: [
          { id: 'wcDoorsChecked',            label: 'Wellness Centre doors and access points checked',        type: 'rating' },
          { id: 'wcPatientsAccountedFor',    label: 'All Wellness Centre patients accounted for',             type: 'rating' },
          { id: 'noteB',                     label: 'Notes / issues',                                          type: 'note'   },
        ]
      },
      {
        id: 'backOfBuilding',
        letter: 'C',
        label: 'Back of Building',
        items: [
          { id: 'backAccessSecured',         label: 'Back of building access secured',                       type: 'rating' },
          { id: 'deliveryAreaClear',         label: 'Delivery area clear and monitored',                     type: 'rating' },
          { id: 'noteC',                     label: 'Notes / issues',                                          type: 'note'   },
        ]
      },
      {
        id: 'generatorPower',
        letter: 'D',
        label: 'Generator & Power',
        items: [
          { id: 'electricityUnitsLeft',      label: 'Electricity units remaining',                           type: 'data'   },
          { id: 'powerOutage',               label: 'Was there a power outage during this shift?',           type: 'data'   },
          { id: 'generatorChecked',          label: 'Generator checked and operational',                     type: 'rating' },
          { id: 'generatorFuelLevel',        label: 'Generator fuel level adequate',                         type: 'rating' },
          { id: 'noteD',                     label: 'Notes / issues',                                          type: 'note'   },
        ]
      },
      {
        id: 'rondavelToolRoom',
        letter: 'E',
        label: 'Rondavel & Tool Room',
        items: [
          { id: 'rondavelSecured',           label: 'Rondavel secured and checked',                         type: 'rating' },
          { id: 'toolRoomLocked',            label: 'Tool room locked and inventory intact',                 type: 'rating' },
          { id: 'noteE',                     label: 'Notes / issues',                                          type: 'note'   },
        ]
      },
      {
        id: 'wasteRoom',
        letter: 'F',
        label: 'Waste Room',
        items: [
          { id: 'wasteRoomLocked',           label: 'Waste room locked and secured',                        type: 'rating' },
          { id: 'wasteSegregated',           label: 'Waste correctly segregated (clinical vs general)',      type: 'rating' },
          { id: 'noteF',                     label: 'Notes / issues',                                          type: 'note'   },
        ]
      },
      {
        id: 'mainBuildingNight',
        letter: 'G',
        label: 'Main Building Night Security',
        items: [
          { id: 'nightPatrolsCompleted',     label: 'Night patrols completed at scheduled intervals',       type: 'rating' },
          { id: 'nightLogSigned',            label: 'Night patrol log signed and timestamped',              type: 'rating' },
          { id: 'noteG',                     label: 'Notes / issues',                                          type: 'note'   },
        ]
      },
      {
        id: 'generalSecurityChecks',
        letter: 'H',
        label: 'General Security Checks',
        items: [
          { id: 'cctvOperational',           label: 'CCTV cameras operational and recording',               type: 'rating' },
          { id: 'incidentsReported',         label: 'All incidents reported and logged',                    type: 'rating' },
          { id: 'handoverCompleted',         label: 'Shift handover completed and documented',              type: 'rating' },
          { id: 'noteH',                     label: 'Notes / issues',                                          type: 'note'   },
        ]
      },
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  marketing: {
    id: 'marketing',
    label: 'Marketing',
    reportingDays: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    expectedPerWeek: 2,
    complianceMode: 'minimum',   // flag only if BELOW 2, not exact match
    keyFigureItem: 'newFollowers',
    sections: [
      {
        id: 'whatsappChannelGrowth',
        letter: 'A',
        label: 'WhatsApp Channel Growth',
        items: [
          { id: 'channelPostPublished',      label: 'WhatsApp Channel post published',                      type: 'rating' },
          { id: 'newFollowers',              label: 'New followers gained',                                 type: 'number' },
          { id: 'noteA',                     label: 'Notes / issues',                                        type: 'note'   },
        ]
      },
      {
        id: 'staffWhatsappStatus',
        letter: 'B',
        label: 'Staff WhatsApp Status Drive',
        items: [
          { id: 'staffStatusUpdated',        label: 'Staff WhatsApp status content shared and updated',    type: 'rating' },
          { id: 'noteB',                     label: 'Notes / issues',                                        type: 'note'   },
        ]
      },
      {
        id: 'facebook',
        letter: 'C',
        label: 'Facebook',
        items: [
          { id: 'facebookPostPublished',     label: 'Facebook post published',                             type: 'rating' },
          { id: 'facebookEngagementChecked', label: 'Engagement (likes/comments/shares) checked and responded to', type: 'rating' },
          { id: 'noteC',                     label: 'Notes / issues',                                        type: 'note'   },
        ]
      },
      {
        id: 'patientFollowUpCalls',
        letter: 'D',
        label: 'Patient Follow-up Calls',
        items: [
          { id: 'callsMadeToday',            label: 'Post-discharge follow-up calls made today',           type: 'number' },
          { id: 'callsLogged',               label: 'All calls logged with outcome notes',                 type: 'rating' },
          { id: 'noteD',                     label: 'Notes / issues',                                        type: 'note'   },
        ]
      },
      {
        id: 'popUpActivation',
        letter: 'E',
        label: 'Pop-Up Community Activation',
        items: [
          { id: 'popUpActivityDone',         label: 'Community activation activity completed',             type: 'rating' },
          { id: 'popUpLeadsGenerated',       label: 'Leads or contacts generated at activation',          type: 'number' },
          { id: 'noteE',                     label: 'Notes / issues',                                        type: 'note'   },
        ]
      },
      {
        id: 'reviewsSocialProof',
        letter: 'F',
        label: 'Reviews & Social Proof',
        items: [
          { id: 'reviewsRequested',          label: 'Google / Facebook reviews requested from eligible patients', type: 'rating' },
          { id: 'reviewsResponded',          label: 'New reviews responded to',                            type: 'rating' },
          { id: 'noteF',                     label: 'Notes / issues',                                        type: 'note'   },
        ]
      },
      {
        id: 'strategyInfrastructure',
        letter: 'G',
        label: 'Strategy & Infrastructure',
        items: [
          { id: 'strategyTaskCompleted',     label: 'Strategic or infrastructure task completed today',   type: 'rating' },
          { id: 'noteG',                     label: 'Notes / issues',                                        type: 'note'   },
        ]
      },
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  nursing: {
    id: 'nursing',
    label: 'Nursing',
    reportingDays: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    expectedPerWeek: 7,
    complianceMode: 'exact',
    keyFigureItem: 'admissionsProcessed',
    // NOTE: nursing admissionsProcessed (weekly sum) is reconciled against
    // caseManagement newAdmissions (weekly sum). Gap must be 0 for GREEN.
    reconcilesWith: { dept: 'caseManagement', item: 'newAdmissions' },
    sections: [
      {
        id: 'clinicalOperations',
        letter: 'A',
        label: 'Clinical Operations',
        items: [
          { id: 'nursingRatioMet',           label: 'Nursing ratios met for all shifts',                   type: 'rating' },
          { id: 'medicationAdministered',    label: 'Medication administered on time and documented',      type: 'rating' },
          { id: 'incidentsFreeDay',          label: 'No clinical incidents during shift',                  type: 'rating' },
          { id: 'incidentsLogged',           label: 'Any incidents logged and reported (if applicable)',   type: 'rating' },
          { id: 'noteA',                     label: 'Notes / issues',                                       type: 'note'   },
        ]
      },
      {
        id: 'patientCareSafety',
        letter: 'B',
        label: 'Patient Care & Safety',
        items: [
          { id: 'patientObsCompleted',       label: 'Patient observations completed at scheduled intervals', type: 'rating' },
          { id: 'fallsRiskAssessed',         label: 'Falls risk assessed for all patients',                type: 'rating' },
          { id: 'restraintCheckDone',        label: 'Restraint check completed where applicable',          type: 'rating' },
          { id: 'noteB',                     label: 'Notes / issues',                                       type: 'note'   },
        ]
      },
      {
        id: 'admissionsDischarges',
        letter: 'C',
        label: 'Admissions & Discharges',
        items: [
          { id: 'admissionsProcessed',       label: 'No of admissions processed by nursing today',         type: 'number' },
          { id: 'dischargesProcessed',       label: 'No of discharges processed by nursing today',         type: 'number' },
          { id: 'admissionDocComplete',      label: 'Admission documentation complete for all new admissions', type: 'rating' },
          { id: 'dischargeDocComplete',      label: 'Discharge documentation complete for all discharges', type: 'rating' },
          { id: 'noteC',                     label: 'Notes / issues',                                       type: 'note'   },
        ]
      },
    ]
  },

};  // end SCHEMA


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3 — FIRESTORE COLLECTION STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * COLLECTION: submissions
 * ─────────────────────────────────────────────────────────────────────────
 * Path: submissions/{deptId}/{YYYY-MM-DD}_{shift}
 *       shift = 'day' | 'night' | 'single' (single for non-security depts)
 *
 * Document structure:
 * {
 *   deptId:        string         // e.g. 'billing'
 *   date:          Timestamp      // real Firestore timestamp — no text dates
 *   dateStr:       string         // 'YYYY-MM-DD' for display and keying
 *   dayOfWeek:     string         // 'Mon' | 'Tue' etc — for compliance checks
 *   shift:         string         // 'day' | 'night' | 'single'
 *   submittedBy:   string         // Firebase Auth UID
 *   submittedByEmail: string
 *   submittedAt:   Timestamp
 *   weekEnding:    string         // 'YYYY-MM-DD' of the Friday of that week
 *
 *   sections: {
 *     [sectionId]: {
 *       items: {
 *         [itemId]: string | number   // rating: 'Yes'|'Most'|'No'|'N-A'
 *                                     // number: integer
 *                                     // time:   'HH:MM'
 *                                     // data:   string
 *       },
 *       note: string                  // section note, may be empty
 *     }
 *   }
 * }
 *
 * NOTE: Security has two submissions per day (day + night).
 *       All other depts have one submission per day ('single').
 *       Document ID = '{dateStr}_{shift}' ensures uniqueness per dept per day.
 *
 *
 * COLLECTION: weeklyRollups
 * ─────────────────────────────────────────────────────────────────────────
 * Path: weeklyRollups/{weekEnding}/{deptId}
 *       weekEnding = 'YYYY-MM-DD' of that week's Friday
 *
 * UPSERT ONLY — overwrite the same doc if capture is run again.
 * This is the IDEMPOTENT guarantee: latest rollup always wins, never duplicates.
 *
 * Document structure:
 * {
 *   weekEnding:    string
 *   deptId:        string
 *   deptLabel:     string
 *   capturedAt:    Timestamp
 *   capturedBy:    string
 *
 *   // COMPLIANCE
 *   submissionsExpected: number    // from SCHEMA.expectedPerWeek
 *   submissionsReceived: number    // actual count this week
 *   complianceMode:      string    // 'exact' | 'minimum'
 *   complianceFlag:      boolean   // true = short or below minimum
 *   complianceLabel:     string    // e.g. '4/5 ⚠' or '2/2 ✓'
 *
 *   // N/A TRACKING
 *   naCount:             number    // total N/A answers across all sections
 *   naFlaggedSections:   string[]  // section ids with ≥2 N/A answers
 *
 *   // KEY FIGURE
 *   keyFigure:           number | null   // weekly sum of keyFigureItem
 *
 *   // SECTIONS
 *   sections: {
 *     [sectionId]: {
 *       letter:   string
 *       label:    string
 *       rating:   'GREEN' | 'AMBER' | 'RED' | 'PENDING'
 *       naCount:  number
 *       naFlagged: boolean         // true if ≥2 N/A in this section
 *     }
 *   }
 *
 *   // DEPARTMENT LEVEL
 *   rating:   'GREEN' | 'AMBER' | 'RED' | 'PENDING'
 *   score:    number               // 1–5 numeric (informational only, never decides colour)
 *   topIssue: string               // concatenated section notes for the week
 *
 *   // QUALITY GATE (N/A loophole protection)
 *   greenGatePassed: boolean       // false = held at AMBER despite GREEN sections
 *   greenGateReason: string        // explains why held: 'reporting incomplete' | 'heavy N/A use'
 * }
 *
 *
 * COLLECTION: hospitalWeeklySummary
 * ─────────────────────────────────────────────────────────────────────────
 * Path: hospitalWeeklySummary/{weekEnding}
 *
 * One document per week, computed after all dept rollups are done.
 * {
 *   weekEnding:          string
 *   capturedAt:          Timestamp
 *   overallRating:       'GREEN' | 'AMBER' | 'RED' | 'PENDING'
 *   overallScore:        number             // avg of dept scores (info only)
 *   deptsInRed:          string[]           // dept ids
 *   deptsInAmber:        string[]
 *   reportingGaps:       string[]           // dept ids with compliance flags
 *   nursingCaseMReconciliation: {
 *     nursingAdmissions: number
 *     caseMAdmissions:   number
 *     gap:               number             // 0 = GREEN, non-zero = RED
 *     status:            'GREEN' | 'RED'
 *   }
 *   departments: {
 *     [deptId]: {
 *       rating:          string
 *       score:           number
 *       complianceFlag:  boolean
 *       keyFigure:       number | null
 *       topIssue:        string
 *     }
 *   }
 * }
 */


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4 — BUSINESS LOGIC (reference — implement in rollup function)
// ═══════════════════════════════════════════════════════════════════════════

const BUSINESS_LOGIC = {

  /**
   * SECTION RATING — override rule (not averaging)
   * Applied to ANSWERED items only (N/A and blank excluded from pool)
   *
   * All GREEN           → GREEN
   * One RED only        → AMBER
   * Any AMBER present   → AMBER
   * Two or more RED     → RED
   * Nothing answered    → PENDING
   *
   * RATIONALE: averaging lets failures hide behind passing items.
   * A single RED must surface. This was a deliberate design decision.
   * DO NOT revert to averaging.
   */
  sectionRating: 'override — see above',

  /**
   * DEPARTMENT RATING
   * Same override rule applied across section RAGs.
   * All sections GREEN  → GREEN
   * One section RED     → AMBER
   * Any section AMBER   → AMBER
   * 2+ sections RED     → RED
   */
  departmentRating: 'same override over section RAGs',

  /**
   * HOSPITAL OVERALL
   * Same override applied across 7 department RAGs.
   * Shown with avg score in brackets as information only.
   */
  hospitalRating: 'same override over 7 dept RAGs',

  /**
   * N/A LOOPHOLE PROTECTION (ALL three rules must be enforced)
   *
   * Rule 1: Count N/A answers per section and per department.
   *
   * Rule 2: Flag any section with ≥2 N/A answers.
   *         Auto-append to notes: "⚠ 2+ items marked N/A in: [section names]"
   *
   * Rule 3: GREEN GATE — a department CANNOT be GREEN if:
   *         - Reporting is short (complianceFlag = true), OR
   *         - Any section is N/A-flagged (naFlagged = true)
   *         In those cases: cap rating at AMBER
   *         Set greenGatePassed = false
   *         Set greenGateReason = 'reporting incomplete' | 'heavy N/A use' | 'both'
   *         RED and AMBER are UNTOUCHED — only false GREENs are caught.
   *
   * BACKGROUND: Support Services exploited this — 2 of 7 days reported,
   * 10 items marked N/A, few answered items all YES → false GREEN.
   * This was caught and these three rules were the fix.
   */
  naLoopholeProtection: 'see three rules above — all mandatory',

  /**
   * REPORTING COMPLIANCE
   * Count actual submissions vs expectedPerWeek.
   * Show as "4/5 ⚠" or "5/5 ✓" etc.
   * Flag (red) when short.
   * Marketing: flag only if BELOW minimum (2). "2+ ✓" is fine.
   * Security: 14 expected (2/day × 7). With shift selector: count by shift type.
   * Non-reporting is a tracked failure — not a blank.
   * "Avoid a bad score by not reporting" loophole is closed by this flag.
   */
  reportingCompliance: 'see rules above',

  /**
   * NURSING ↔ CASE MANAGEMENT RECONCILIATION
   * nursing.admissionsProcessed (weekly sum)
   * minus
   * caseManagement.newAdmissions (weekly sum)
   * = gap
   * Gap = 0 → GREEN
   * Gap ≠ 0 → RED (surface on dashboard)
   * Shown in hospitalWeeklySummary.nursingCaseMReconciliation
   * A gap of -6 once appeared and was a tick-vs-number data entry error.
   */
  nursingCaseMReconciliation: 'see above',

  /**
   * IDEMPOTENT WEEKLY UPSERT
   * Rollup keyed by (weekEnding, deptId).
   * Running rollup multiple times in same week = safe overwrite, not duplicate.
   * Firestore .set() with merge:false on the document path achieves this.
   * Legacy used delete-then-insert. Firestore .set() is cleaner.
   */
  idempotentUpsert: 'Firestore .set() on weeklyRollups/{weekEnding}/{deptId}',

  /**
   * DATE HANDLING
   * Always store as Firestore Timestamp. Never as text string for sort fields.
   * weekEnding and dateStr stored as 'YYYY-MM-DD' text for display keying only.
   * All sort operations use Timestamp fields.
   * Legacy text-date sort bug (10/06 sorted before 19/06) is eliminated.
   */
  dateHandling: 'Timestamp for all sort fields, YYYY-MM-DD string for keys only',

  /**
   * ANSWER VALUES
   * Rating items: 'Yes' | 'Most' | 'No' | 'N-A'
   * (Friendly words, not G/A/R/NA — for phone usability)
   * Map to RAG: Yes→GREEN, Most→AMBER, No→RED, N-A→excluded
   * Blank/unanswered → excluded, NOT counted as N/A
   */
  answerValues: 'Yes | Most | No | N-A',

};


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5 — ACCESS ROLES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ROLE: admin (COO)
 *   - Read and write all collections
 *   - Run rollups manually
 *   - View all dashboards
 *   - Manage user access
 *   Email: shakabornman@gmail.com
 *
 * ROLE: manager (department manager)
 *   - Submit to their assigned department only
 *   - Cannot submit for other departments
 *   - Cannot view historical rollups (entry-only view)
 *   Department assignment stored in employees/{empId}.scorecardDept
 *
 * ROLE: ceo (CEO — read-only dashboard)
 *   - Read weeklyRollups and hospitalWeeklySummary
 *   - Cannot submit or edit anything
 *   - Dashboard-only access
 *
 * ROLE: authenticated (general staff)
 *   - No scorecard access by default
 *   - Must be explicitly assigned a role
 *
 * FIRESTORE SECURITY RULES EXTENSION NEEDED:
 * Add to existing rules in hae-vuma project:
 *
 *   match /submissions/{dept}/{docId} {
 *     allow read: if request.auth != null && isAdminOrCOO();
 *     allow create, update: if request.auth != null && canSubmitForDept(dept);
 *   }
 *
 *   match /weeklyRollups/{weekEnding}/{dept} {
 *     allow read: if request.auth != null;
 *     allow write: if isAdminOrCOO();
 *   }
 *
 *   match /hospitalWeeklySummary/{weekEnding} {
 *     allow read: if request.auth != null;
 *     allow write: if isAdminOrCOO();
 *   }
 */


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6 — FIRESTORE SECURITY RULES ADDITION
// ═══════════════════════════════════════════════════════════════════════════

const SECURITY_RULES_ADDITION = `
    // ── SCORECARD COLLECTIONS ──────────────────────────────────────────────

    match /submissions/{deptId}/{docId} {
      allow read: if request.auth != null &&
        request.auth.token.email in [
          'shakabornman@gmail.com'
        ];
      allow create, update: if request.auth != null;
    }

    match /weeklyRollups/{weekEnding}/{deptId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.auth.token.email == 'shakabornman@gmail.com';
    }

    match /hospitalWeeklySummary/{weekEnding} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.auth.token.email == 'shakabornman@gmail.com';
    }
`;


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 7 — WEEK ENDING CALCULATION UTILITY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * WEEK DEFINITION — HAE SCORECARD
 * ─────────────────────────────────
 * Week runs Friday → Thursday (inclusive).
 * Week-ending date = the Thursday that closes the week.
 *
 * Examples:
 *   Monday    23 Jun 2026  → week ending Thursday 26 Jun 2026
 *   Wednesday 25 Jun 2026  → week ending Thursday 26 Jun 2026
 *   Thursday  26 Jun 2026  → week ending Thursday 26 Jun 2026  (today IS the close)
 *   Friday    27 Jun 2026  → week ending Thursday  2 Jul 2026  (new week just opened)
 *
 * Dashboard behaviour:
 *   - Default view: current in-progress week, live data as it arrives.
 *   - Week selector dropdown: all weeks with data, most recent first.
 *   - No hard cutoff. Friday submissions go into the new week naturally.
 *   - Security Friday morning shift submits into the new week — CEO switches
 *     to previous week view to see the closed week complete.
 *   - Mid-week view shows partial data — compliance shows e.g. "3/7" not "0/7".
 *   - No manual date entry ever required.
 *   - Six-week trend chart pulls from last 6 closed Thursday week-endings.
 *   - Previous week always one click away from the default view.
 *
 * @param {Date} date — defaults to today
 * @returns {string} 'YYYY-MM-DD' of the Thursday closing this week
 */
function getWeekEnding(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

  // Days until next Thursday (or 0 if today IS Thursday)
  // Thu=4. If today is Fri(5) we want +6, Sat(6)+5, Sun(0)+4, Mon(1)+3,
  // Tue(2)+2, Wed(3)+1, Thu(4)+0
  const daysToThursday = (4 - day + 7) % 7;

  const thursday = new Date(d);
  thursday.setDate(d.getDate() + daysToThursday);
  return thursday.toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

/**
 * Returns true if a given date falls within the week ending on weekEndingStr.
 * Useful for compliance checks — only count submissions within the correct window.
 *
 * @param {Date}   date           — the submission date to check
 * @param {string} weekEndingStr  — 'YYYY-MM-DD' Thursday
 * @returns {boolean}
 */
function isInWeek(date, weekEndingStr) {
  const thursday = new Date(weekEndingStr);
  const friday   = new Date(thursday);
  friday.setDate(thursday.getDate() - 6); // Friday = Thursday minus 6 days

  const d = new Date(date);
  d.setHours(0,0,0,0);
  friday.setHours(0,0,0,0);
  thursday.setHours(23,59,59,999);

  return d >= friday && d <= thursday;
}

/**
 * Returns a display label for a week given its Thursday closing date.
 * e.g. '20 Jun – 26 Jun 2026'
 *
 * @param {string} weekEndingStr — 'YYYY-MM-DD' Thursday
 * @returns {string}
 */
function weekLabel(weekEndingStr) {
  const thursday = new Date(weekEndingStr);
  const friday   = new Date(thursday);
  friday.setDate(thursday.getDate() - 6);

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fDay   = friday.getDate();
  const fMon   = months[friday.getMonth()];
  const tDay   = thursday.getDate();
  const tMon   = months[thursday.getMonth()];
  const year   = thursday.getFullYear();

  return fMon === tMon
    ? `${fDay} – ${tDay} ${tMon} ${year}`
    : `${fDay} ${fMon} – ${tDay} ${tMon} ${year}`;
}


/**
 * Returns the weekEnding string for the previous closed week.
 * Used by the dashboard "Previous Week" button and default fallback.
 *
 * @param {string} weekEndingStr — current week's Thursday 'YYYY-MM-DD'
 * @returns {string} previous Thursday 'YYYY-MM-DD'
 */
function getPreviousWeekEnding(weekEndingStr) {
  const thursday = new Date(weekEndingStr);
  thursday.setDate(thursday.getDate() - 7);
  return thursday.toISOString().split('T')[0];
}

/**
 * Returns an array of the last N week-ending strings (most recent first).
 * Used to populate the week selector dropdown and the six-week trend chart.
 * Excludes the current in-progress week — only returns closed weeks.
 *
 * @param {number} n        — number of weeks to return (default 6 for trend chart)
 * @param {Date}   fromDate — defaults to today
 * @returns {string[]}      — array of 'YYYY-MM-DD' Thursday dates, most recent first
 */
function getLastNWeekEndings(n = 6, fromDate = new Date()) {
  const currentWeek = getWeekEnding(fromDate);
  const results = [];
  let cursor = getPreviousWeekEnding(currentWeek);
  for (let i = 0; i < n; i++) {
    results.push(cursor);
    cursor = getPreviousWeekEnding(cursor);
  }
  return results;
}


// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS (for use in web app and rollup functions)
// ═══════════════════════════════════════════════════════════════════════════

// In browser context (GitHub Pages):
if (typeof window !== 'undefined') {
  window.HAE_SCHEMA              = SCHEMA;
  window.HAE_BUSINESS_LOGIC      = BUSINESS_LOGIC;
  window.getWeekEnding           = getWeekEnding;
  window.isInWeek                = isInWeek;
  window.weekLabel               = weekLabel;
  window.getPreviousWeekEnding   = getPreviousWeekEnding;
  window.getLastNWeekEndings     = getLastNWeekEndings;
}

// In Node context (if used for testing or Cloud Functions):
if (typeof module !== 'undefined') {
  module.exports = {
    SCHEMA,
    BUSINESS_LOGIC,
    getWeekEnding,
    isInWeek,
    weekLabel,
    getPreviousWeekEnding,
    getLastNWeekEndings,
    SECURITY_RULES_ADDITION,
  };
}
    weekLabel,
    SECURITY_RULES_ADDITION
  };
}
