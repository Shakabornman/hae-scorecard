/**
 * HAE SCORECARD — FIREBASE SCHEMA DEFINITION v2.0
 * =================================================
 * HOSPITAL AT EKHAYA · Vuma Development Solutions (Pty) Ltd
 *
 * VERSION 2.0 — June 2026
 * Reconciled against actual legacy Google Form exports (all 7 departments).
 * All item labels match exactly what managers see and answer in the forms.
 * All number/time/data fields present in legacy data are included.
 *
 * This file is the single source of truth for the Firestore data model.
 * Entry forms render FROM this schema. Rollup logic reads FROM this schema.
 * CEO dashboard reads FROM the rollup collections.
 *
 * Governing principle: resource allocation visibility, NOT punishment.
 *
 * Last updated: June 2026 · J. Jacques Bornman, COO
 */

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1 — ITEM TYPES
// ═══════════════════════════════════════════════════════════════════════════
//
// RATING  → Yes / Most / No / N-A
//           Yes=GREEN, Most=AMBER, No=RED, N-A=excluded from score but counted
//
// NUMBER  → positive integer (counts, staff numbers, beds, etc.)
//           recorded, never rated
//
// TIME    → HH:MM string (meal serving times)
//           scored: on-time=GREEN, late=RED
//           Thresholds: Breakfast ≤07:20, Lunch ≤12:20, Supper ≤17:20
//
// DATA    → free text or Y/N, recorded but never rated
//           (electricity units, stock value, power outage, etc.)
//
// NOTE    → one per section (free text), concatenated into weekly Top Issue

const ITEM_TYPES = ['rating', 'number', 'time', 'data', 'note'];

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2 — DEPARTMENT SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

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
          { id: 'patientsBilled',            label: 'No of patients Billed',                                   type: 'number' },
          { id: 'detailsVerified',           label: 'Patient details verified (ID, medical aid, contact)',     type: 'rating' },
          { id: 'codingVerified',            label: 'Coding / tariffs verified before billing',                type: 'rating' },
          { id: 'preAuthConfirmed',          label: 'Pre-authorisation confirmed (where applicable)',          type: 'rating' },
          { id: 'noteA',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'claims',
        letter: 'B',
        label: 'Claims',
        items: [
          { id: 'claimsCount',               label: 'No of Claims submitted',                                  type: 'number' },
          { id: 'rejectionsCount',           label: 'Rejections re-submitted',                                 type: 'number' },
          { id: 'claimsOnTime',              label: 'Claims submitted within agreed timeline',                 type: 'rating' },
          { id: 'docsAttached',              label: 'Supporting documents attached (authorisation, clinical)', type: 'rating' },
          { id: 'rejectionsMonitored',       label: 'Rejections monitored and re-submitted promptly',         type: 'rating' },
          { id: 'noteB',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'queries',
        letter: 'C',
        label: 'Queries',
        items: [
          { id: 'queriesLogged',             label: 'Queries logged and assigned',                            type: 'rating' },
          { id: 'queriesWithinSLA',          label: 'Responses sent within SLA',                              type: 'rating' },
          { id: 'escalationsCompleted',      label: 'Escalations completed where required',                   type: 'rating' },
          { id: 'noteC',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'cashPostings',
        letter: 'D',
        label: 'Cash Postings',
        items: [
          { id: 'paymentsAllocated',         label: 'Payments allocated correctly',                           type: 'rating' },
          { id: 'adjustmentsAuthorised',     label: 'Adjustments authorised and documented',                  type: 'rating' },
          { id: 'dailyCashSummary',          label: 'Daily cash / remittance summary',                        type: 'rating' },
          { id: 'noteD',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'reporting',
        letter: 'E',
        label: 'Reporting',
        items: [
          { id: 'dashboardUpdated',          label: 'Daily billing dashboard updated',                        type: 'rating' },
          { id: 'variancesInvestigated',     label: 'Variances investigated and corrected',                   type: 'rating' },
          { id: 'complianceChecked',         label: 'Compliance checks completed (files, consent, coding)',   type: 'rating' },
          { id: 'noteE',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
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
    reconcilesWith: { dept: 'nursing', item: 'admissionsProcessed' },
    sections: [
      {
        id: 'admissions',
        letter: 'A',
        label: 'Admissions',
        items: [
          { id: 'newAdmissions',             label: 'No of new admissions for the day',                       type: 'number' },
          { id: 'authorisationConfirmed',    label: 'Authorisation Confirmed',                                type: 'rating' },
          { id: 'casesOpened',               label: 'New admissions reviewed and cases opened',               type: 'rating' },
          { id: 'coverVerified',             label: 'Benefits / cover verified and documented',               type: 'rating' },
          { id: 'initialAssessment',         label: 'Initial assessment completed',                           type: 'rating' },
          { id: 'noteA',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'careCoordination',
        letter: 'B',
        label: 'Care Coordination',
        items: [
          { id: 'mdtCoordination',           label: 'Multidisciplinary coordination completed',               type: 'rating' },
          { id: 'doctorComms',               label: 'Communication with treating doctor documented',          type: 'rating' },
          { id: 'carePlanUpdated',           label: 'Care plan updated as needed',                            type: 'rating' },
          { id: 'noteB',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'utilisation',
        letter: 'C',
        label: 'Utilisation',
        items: [
          { id: 'dischargesCount',           label: 'No of Discharges',                                       type: 'number' },
          { id: 'dischargePlanInPlace',      label: 'Discharge plan in place',                                type: 'rating' },
          { id: 'followUpArranged',          label: 'Follow-up appointments / referrals arranged',            type: 'rating' },
          { id: 'patientEducation',          label: 'Patient/family education provided',                      type: 'rating' },
          { id: 'noteC',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'discharging',
        letter: 'D',
        label: 'Discharging',
        items: [
          { id: 'losMonitored',              label: 'Length of stay monitored against plan',                  type: 'rating' },
          { id: 'barriersIdentified',        label: 'Barriers to discharge identified',                       type: 'rating' },
          { id: 'actionsEscalated',          label: 'Actions escalated timeously',                            type: 'rating' },
          { id: 'noteD',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'documentation',
        letter: 'E',
        label: 'Documentation',
        items: [
          { id: 'notesSameDay',              label: 'Notes completed same day',                               type: 'rating' },
          { id: 'filesCompliant',            label: 'Files complete and compliant',                           type: 'rating' },
          { id: 'reportSubmitted',           label: 'Daily case management report submitted',                 type: 'rating' },
          { id: 'noteE',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
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
        id: 'newAdmissions',
        letter: 'A',
        label: 'New Admissions',
        items: [
          { id: 'recordsCaptured',           label: 'Patient records captured in system',                     type: 'rating' },
          { id: 'statusUpdated',             label: 'Status updated by COB',                                  type: 'rating' },
          { id: 'accuracyChecked',           label: 'Detail accuracy checked',                                type: 'rating' },
          { id: 'noteA',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'authorisations',
        letter: 'B',
        label: 'Authorisations',
        items: [
          { id: 'pendingFollowedUp',         label: 'Pending authorisations followed up',                     type: 'rating' },
          { id: 'approvalsConfirmed',        label: 'Approvals confirmed',                                    type: 'rating' },
          { id: 'deniedFlagged',             label: 'Denied claims flagged',                                  type: 'rating' },
          { id: 'noteB',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'billing',
        letter: 'C',
        label: 'Billing',
        items: [
          { id: 'chargesCaptured',           label: 'Charges captured correctly',                             type: 'rating' },
          { id: 'rejectionsFlagged',         label: 'Rejections flagged at COB',                              type: 'rating' },
          { id: 'auditTrailChecked',         label: 'Billing audit trail checked',                            type: 'rating' },
          { id: 'denialsAppealed',           label: 'Denials appealed',                                       type: 'rating' },
          { id: 'noteC',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'recons',
        letter: 'D',
        label: 'Recons',
        items: [
          { id: 'remittanceRecon',           label: 'Recon of remittance statements',                         type: 'rating' },
          { id: 'agedDebtorsDown',           label: 'Aged debtors down',                                      type: 'rating' },
          { id: 'costRisksFlagged',          label: 'Cost risks flagged',                                     type: 'rating' },
          { id: 'unusualItemsRecon',         label: 'Unusual items reconciled',                               type: 'rating' },
          { id: 'noteD',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'creditControl',
        letter: 'E',
        label: 'Credit Control',
        items: [
          { id: 'overdueFollowedUp',         label: 'Follow up on overdue accounts',                          type: 'rating' },
          { id: 'paymentArrangements',       label: 'Payment arrangements made',                              type: 'rating' },
          { id: 'collectionTargetsMet',      label: 'Collection targets set and met',                         type: 'rating' },
          { id: 'noteE',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'financeReporting',
        letter: 'F',
        label: 'Reporting',
        items: [
          { id: 'reportSentCOO',             label: 'Finance report sent to COO',                             type: 'rating' },
          { id: 'risksEscalated',            label: 'Risks escalated to COO',                                 type: 'rating' },
          { id: 'opportunitiesShared',       label: 'Opportunities shared',                                   type: 'rating' },
          { id: 'tomorrowFocusDefined',      label: "Tomorrow's focus defined",                               type: 'rating' },
          { id: 'noteF',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
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
          { id: 'staffAllocated',            label: 'No of Staff Allocated',                                  type: 'number' },
          { id: 'bedsChanged',               label: 'No of Beds Changed',                                     type: 'number' },
          { id: 'linenOnTime',               label: 'Linen collected, cleaned on time',                       type: 'rating' },
          { id: 'linenSeparated',            label: 'Different linens separated',                             type: 'rating' },
          { id: 'tornRepaired',              label: 'Torn linens repaired',                                   type: 'rating' },
          { id: 'laundryRoomClean',          label: 'Laundry room kept clean',                                type: 'rating' },
          { id: 'suppliesRestocked',         label: 'Supplies restocked',                                     type: 'rating' },
          { id: 'noteA',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'cleaning',
        letter: 'B',
        label: 'Cleaning',
        items: [
          { id: 'cleaningStaffCount',        label: 'No of Cleaning Staff on duty',                           type: 'number' },
          { id: 'wardBedsCleaned',           label: 'All ward beds Cleaned',                                  type: 'rating' },
          { id: 'deepCleanSchedule',         label: 'Deep cleaning schedule followed',                        type: 'rating' },
          { id: 'highTouchDisinfected',      label: 'High-touch areas disinfected',                           type: 'rating' },
          { id: 'floorsCleaned',             label: 'Floors, restrooms cleaned',                              type: 'rating' },
          { id: 'medWasteHandled',           label: 'Medicinal waste handled properly',                       type: 'rating' },
          { id: 'suppliesAvailable',         label: 'Supplies present & ordered',                             type: 'rating' },
          { id: 'noteB',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'cookingKitchen',
        letter: 'C',
        label: 'Cooking & Kitchen',
        items: [
          { id: 'kitchenStaffCount',         label: 'No of Kitchen Staff on duty',                            type: 'number' },
          { id: 'breakfastServed',           label: 'No of Breakfast served',                                 type: 'number' },
          { id: 'breakfastTime',             label: 'Time Breakfast Served',                                  type: 'time',   threshold: '07:20' },
          { id: 'lunchServed',               label: 'No of Lunch served',                                     type: 'number' },
          { id: 'lunchTime',                 label: 'Time Lunch served',                                      type: 'time',   threshold: '12:20' },
          { id: 'dinnerServed',              label: 'No of Dinner/Supper served',                             type: 'number' },
          { id: 'dinnerTime',                label: 'Time Dinner/Supper served',                              type: 'time',   threshold: '17:20' },
          { id: 'foodCompliant',             label: 'Food compliant and Checked',                             type: 'rating' },
          { id: 'fridgeTemps',               label: 'Fridge temperatures Checked',                            type: 'rating' },
          { id: 'kitchenClean',              label: 'Kitchen clean & organized',                              type: 'rating' },
          { id: 'foodSafety',                label: 'Food safety standards followed',                         type: 'rating' },
          { id: 'stockCounted',              label: 'Stock Counted and calculated',                           type: 'rating' },
          { id: 'criticalSupplies',          label: 'Critical supplies sufficient',                           type: 'rating' },
          { id: 'stocklistAttached',         label: 'Stocklist attached',                                     type: 'rating' },
          { id: 'invoicesReconciled',        label: 'Invoices and cash slips reconciled',                     type: 'rating' },
          { id: 'totalStockValue',           label: 'Total Calculated Stock Value (R)',                       type: 'data'   },
          { id: 'totalPurchases',            label: 'Total Purchases for the day (R)',                        type: 'data'   },
          { id: 'noteC',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'patientExperience',
        letter: 'D',
        label: 'Patient Experience',
        items: [
          { id: 'commonAreasTidy',           label: 'Common areas tidy & inviting',                           type: 'rating' },
          { id: 'restroomsClean',            label: 'Restrooms clean & stocked',                              type: 'rating' },
          { id: 'laundryOnTime',             label: 'Laundry available on time',                              type: 'rating' },
          { id: 'patientRequests',           label: 'Patient requests responded to',                          type: 'rating' },
          { id: 'noteD',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  security: {
    id: 'security',
    label: 'Security',
    reportingDays: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    expectedPerWeek: 14,
    complianceMode: 'exact',
    shiftSelector: true,
    keyFigureItem: null,
    sections: [
      {
        id: 'mainGateEntrance',
        letter: 'A',
        label: 'Main Gate & Entrance Area',
        items: [
          { id: 'guardOnTime',               label: 'Guard reported on time and present',                     type: 'rating' },
          { id: 'gateAreaClean',             label: 'Gate area clean and tidy and Trash bins emptied',        type: 'rating' },
          { id: 'noCigaretteButts',          label: 'No cigarette butts, matches, lighter',                   type: 'rating' },
          { id: 'accessControlBook',         label: 'Access control book completed',                          type: 'rating' },
          { id: 'visitorRegister',           label: 'Visitor register in use',                                type: 'rating' },
          { id: 'noUnauthorisedVisitors',    label: 'No Visitors or Off-duty Staff',                          type: 'rating' },
          { id: 'noteA',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'wellnessCentre',
        letter: 'B',
        label: 'Wellness Centre Area',
        items: [
          { id: 'recAreaChairs',             label: 'Recreation area chairs under roof',                      type: 'rating' },
          { id: 'gateDoorsLocked',           label: 'Gate and Doors locked after hours',                      type: 'rating' },
          { id: 'fountainOff',               label: 'Water fountain switched off',                            type: 'rating' },
          { id: 'tapsClosed',                label: 'All taps closed',                                        type: 'rating' },
          { id: 'lightsOnNight',             label: 'Lights switched on at night',                            type: 'rating' },
          { id: 'lightsOffDay',              label: 'Lights off during day',                                  type: 'rating' },
          { id: 'areaCleanSecure',           label: 'Area clean and secure',                                  type: 'rating' },
          { id: 'noteB',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'backOfBuilding',
        letter: 'C',
        label: 'Back of Building',
        items: [
          { id: 'airconOff',                 label: 'Aircons switched off after hours',                       type: 'rating' },
          { id: 'geysersSchedule',           label: 'Geysers switched off to schedule',                       type: 'rating' },
          { id: 'externalLights',            label: 'External lights functioning',                            type: 'rating' },
          { id: 'noSuspiciousPersons',       label: 'No suspicious persons loitering',                        type: 'rating' },
          { id: 'areaFreeRubbish',           label: 'Area free of rubbish',                                   type: 'rating' },
          { id: 'noteC',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'generatorPower',
        letter: 'D',
        label: 'Generator & Power',
        items: [
          { id: 'electricityUnits',          label: 'Electricity Units Left',                                 type: 'data'   },
          { id: 'powerOutage',               label: 'Was there a power outage',                               type: 'data'   },
          { id: 'generatorFull',             label: 'Generator Full',                                         type: 'rating' },
          { id: 'petrolChecked',             label: 'Petrol Checked',                                         type: 'rating' },
          { id: 'noteD',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'rondavelToolRoom',
        letter: 'E',
        label: 'Rondavel Area & Tool Room',
        items: [
          { id: 'toolRoomLocked',            label: 'Tool room locked and key at gate',                       type: 'rating' },
          { id: 'noToolsOutside',            label: 'No tools left outside',                                  type: 'rating' },
          { id: 'windowsSecure',             label: 'Windows closed and Area secure',                         type: 'rating' },
          { id: 'noteE',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'wasteRoom',
        letter: 'F',
        label: 'Waste Room',
        items: [
          { id: 'wasteRoomLocked',           label: 'Waste room door locked',                                 type: 'rating' },
          { id: 'binsClosed',                label: 'Bins properly closed',                                   type: 'rating' },
          { id: 'noSpillage',                label: 'No spillage or hazards visible',                         type: 'rating' },
          { id: 'noteF',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'mainBuildingNight',
        letter: 'G',
        label: 'Main Building – Night Security',
        items: [
          { id: 'externalDoorsLocked',       label: 'All external doors locked after 20h00',                  type: 'rating' },
          { id: 'windowsClosed',             label: 'All windows closed',                                     type: 'rating' },
          { id: 'passageLights',             label: 'Passage lights working',                                  type: 'rating' },
          { id: 'emergencyLights',           label: 'Emergency lights functional',                             type: 'rating' },
          { id: 'noUnauthorisedInside',      label: 'No unauthorised persons inside',                         type: 'rating' },
          { id: 'noteG',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'generalSecurityChecks',
        letter: 'H',
        label: 'General Security Checks',
        items: [
          { id: 'noSuspiciousActivity',      label: 'No suspicious activity observed',                        type: 'rating' },
          { id: 'camerasOperational',        label: 'Cameras operational',                                    type: 'rating' },
          { id: 'radioCharged',              label: 'Radio Charged',                                          type: 'rating' },
          { id: 'perimeterSecure',           label: 'Perimeter secure',                                       type: 'rating' },
          { id: 'fireExitsClear',            label: 'Fire exits clear',                                       type: 'rating' },
          { id: 'noHazards',                 label: 'No hazards identified',                                  type: 'rating' },
          { id: 'parkingSecure',             label: 'Parking area secure',                                    type: 'rating' },
          { id: 'noteH',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
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
    complianceMode: 'minimum',
    keyFigureItem: 'newFollowers',
    sections: [
      {
        id: 'whatsappChannelGrowth',
        letter: 'A',
        label: 'WhatsApp Channel Growth',
        items: [
          { id: 'newFollowers',              label: 'New followers gained',                                   type: 'number' },
          { id: 'qrPostersVisible',          label: 'QR posters visible at key points',                       type: 'rating' },
          { id: 'visitorsAssisted',          label: 'Patients/visitors assisted to follow',                   type: 'rating' },
          { id: 'linkShared',                label: 'Channel link shared / encouraged',                       type: 'rating' },
          { id: 'followerNumberReported',    label: 'Daily follower number reported',                         type: 'rating' },
          { id: 'noteA',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'staffWhatsappStatus',
        letter: 'B',
        label: 'Staff WhatsApp Status Drive',
        items: [
          { id: 'deptVisitedCount',          label: 'Departments visited for status drive',                   type: 'number' },
          { id: 'staffPostedStatus',         label: 'Staff posted approved Status message',                   type: 'rating' },
          { id: 'repostReminder',            label: 'Repost reminder given (24h expiry)',                     type: 'rating' },
          { id: 'checklistUpdated',          label: 'Status checklist updated',                               type: 'rating' },
          { id: 'noteB',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'facebook',
        letter: 'C',
        label: 'Facebook',
        items: [
          { id: 'postsPublished',            label: 'Posts published today',                                  type: 'number' },
          { id: 'postingCadence',            label: 'Posting cadence on track (3-4/week)',                    type: 'rating' },
          { id: 'commentsResponded',         label: 'Comments / messages responded < 60 min',                 type: 'rating' },
          { id: 'queriesBridged',            label: 'Public queries bridged to private/phone',                type: 'rating' },
          { id: 'reviewDrive',               label: 'Review drive actioned (cards/follow-ups)',               type: 'rating' },
          { id: 'noteC',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'patientFollowUpCalls',
        letter: 'D',
        label: 'Patient Follow-up Calls',
        items: [
          { id: 'callsMade',                 label: 'Post-discharge calls made today',                        type: 'number' },
          { id: 'callsWithinWindow',         label: 'Calls within 3-week window',                             type: 'rating' },
          { id: 'callLogCompleted',          label: 'Call log completed',                                     type: 'rating' },
          { id: 'concernsEscalated',         label: 'Flagged concerns escalated to COO',                      type: 'rating' },
          { id: 'noteD',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'popUpActivation',
        letter: 'E',
        label: 'Pop-Up Community Activation',
        items: [
          { id: 'patientsContacted',         label: 'Patients contacted at activation',                       type: 'number' },
          { id: 'referralsCount',            label: 'Referrals into hospital',                                 type: 'number' },
          { id: 'unitBranded',               label: 'Unit set up & branded correctly',                        type: 'rating' },
          { id: 'nurseScreening',            label: 'Nurse screening within scope',                            type: 'rating' },
          { id: 'activationLog',             label: 'Activation log submitted',                               type: 'rating' },
          { id: 'noteE',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'reviewsSocialProof',
        letter: 'F',
        label: 'Reviews & Social Proof',
        items: [
          { id: 'googleReviews',             label: 'New Google reviews this week',                           type: 'number' },
          { id: 'facebookReviews',           label: 'New Facebook reviews this week',                         type: 'number' },
          { id: 'reviewCardsHandedOut',      label: 'Review request cards handed out',                        type: 'rating' },
          { id: 'positiveReviewReposted',    label: 'Positive review reposted as spotlight',                  type: 'rating' },
          { id: 'noteF',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'strategyInfrastructure',
        letter: 'G',
        label: 'Strategy & Infrastructure',
        items: [
          { id: 'metaPixel',                 label: 'Meta Pixel installed & firing',                          type: 'rating' },
          { id: 'gbpUpdated',                label: 'Google Business Profile updated (photos/posts/Q&A)',     type: 'rating' },
          { id: 'websiteButtonLive',         label: 'Website button live on GBP',                             type: 'rating' },
          { id: 'anchorContent',             label: 'Anchor content session / assets on track',               type: 'rating' },
          { id: 'adSpendTracked',            label: 'Ad spend tracked vs bookings',                           type: 'rating' },
          { id: 'noteG',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
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
    reconcilesWith: { dept: 'caseManagement', item: 'newAdmissions' },
    sections: [
      {
        id: 'clinicalOperations',
        letter: 'A',
        label: 'Clinical Operations',
        items: [
          { id: 'wardsStaffed',              label: 'Wards fully staffed',                                    type: 'rating' },
          { id: 'medicationOnTime',          label: 'Medication rounds on time',                              type: 'rating' },
          { id: 'doctorsRounds',             label: 'Doctors rounds completed',                               type: 'rating' },
          { id: 'clinicalDocsUpToDate',      label: 'Clinical documentation up to date',                      type: 'rating' },
          { id: 'infectionControl',          label: 'Infection control compliance',                           type: 'rating' },
          { id: 'incidentReports',           label: 'Incident reports completed',                             type: 'rating' },
          { id: 'noteA',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'patientCareSafety',
        letter: 'B',
        label: 'Patient Care & Safety',
        items: [
          { id: 'deepCleaning',              label: 'Deep cleaning schedule followed',                        type: 'rating' },
          { id: 'highTouchDisinfected',      label: 'High-touch areas disinfected',                           type: 'rating' },
          { id: 'floorsCleaned',             label: 'Floors, restrooms cleaned',                              type: 'rating' },
          { id: 'medWasteHandled',           label: 'Medicinal waste handled properly',                       type: 'rating' },
          { id: 'suppliesOrdered',           label: 'Supplies present & ordered',                             type: 'rating' },
          { id: 'noteB',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
      {
        id: 'admissionsDischarges',
        letter: 'C',
        label: 'Admissions & Discharges',
        items: [
          { id: 'admissionsProcessed',       label: 'Admissions processed',                                   type: 'number' },
          { id: 'admissionsCorrect',         label: 'Admissions processed correctly',                         type: 'rating' },
          { id: 'authorisationsInPlace',     label: 'Authorisations in place',                                type: 'rating' },
          { id: 'dischargesOnSystem',        label: 'Discharges completed on system',                         type: 'rating' },
          { id: 'ttoMedications',            label: 'TTO medications arranged',                               type: 'rating' },
          { id: 'bedAvailability',           label: 'Bed availability updated',                               type: 'rating' },
          { id: 'noteC',                     label: 'Notes (add note if any answers above are not Yes)',       type: 'note'   },
        ]
      },
    ]
  },

};  // end SCHEMA


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3 — COLUMN MAP (legacy CSV → Firebase field)
// ═══════════════════════════════════════════════════════════════════════════
// Used by the migration script to map legacy form exports to Firebase schema.
// Each department maps its CSV column index to a Firebase field path.

const LEGACY_COLUMN_MAP = {

  billing: {
    0: '_timestamp', 1: '_submittedBy', 2: '_date',
    3:  'sections.patientDetailsReadiness.items.patientsBilled',
    4:  'sections.patientDetailsReadiness.items.detailsVerified',
    5:  'sections.patientDetailsReadiness.items.codingVerified',
    6:  'sections.patientDetailsReadiness.items.preAuthConfirmed',
    7:  'sections.patientDetailsReadiness.note',   // A Notes (col 9 in some exports — handled in script)
    9:  'sections.patientDetailsReadiness.note',
    10: 'sections.claims.items.claimsCount',
    11: 'sections.claims.items.rejectionsCount',
    12: 'sections.claims.items.claimsOnTime',
    13: 'sections.claims.items.docsAttached',
    16: 'sections.claims.items.rejectionsMonitored',
    17: 'sections.claims.note',
    18: 'sections.queries.items.queriesLogged',
    19: 'sections.queries.items.queriesWithinSLA',
    20: 'sections.queries.items.escalationsCompleted',
    21: 'sections.queries.note',
    22: 'sections.cashPostings.items.paymentsAllocated',
    23: 'sections.cashPostings.items.adjustmentsAuthorised',
    24: 'sections.cashPostings.items.dailyCashSummary',
    25: 'sections.cashPostings.note',
    26: 'sections.reporting.items.dashboardUpdated',
    27: 'sections.reporting.items.variancesInvestigated',
    28: 'sections.reporting.items.complianceChecked',
    31: 'sections.reporting.note',
  },

  caseManagement: {
    0: '_timestamp', 1: '_submittedBy', 2: '_date',
    3:  'sections.admissions.items.newAdmissions',
    4:  'sections.admissions.items.authorisationConfirmed',
    5:  'sections.admissions.items.casesOpened',
    6:  'sections.admissions.items.coverVerified',
    7:  'sections.admissions.items.initialAssessment',
    8:  'sections.admissions.note',
    9:  'sections.careCoordination.items.mdtCoordination',
    10: 'sections.careCoordination.items.doctorComms',
    11: 'sections.careCoordination.items.carePlanUpdated',
    12: 'sections.careCoordination.note',
    13: 'sections.utilisation.items.dischargesCount',
    14: 'sections.utilisation.items.dischargePlanInPlace',
    15: 'sections.utilisation.items.followUpArranged',
    16: 'sections.utilisation.items.patientEducation',
    17: 'sections.utilisation.note',
    18: 'sections.discharging.items.losMonitored',
    19: 'sections.discharging.items.barriersIdentified',
    20: 'sections.discharging.items.actionsEscalated',
    21: 'sections.discharging.note',
    22: 'sections.documentation.items.notesSameDay',
    23: 'sections.documentation.items.filesCompliant',
    24: 'sections.documentation.items.reportSubmitted',
    25: 'sections.documentation.note',
  },

  finance: {
    0: '_timestamp', 1: '_submittedBy', 2: '_date',
    3:  'sections.newAdmissions.items.recordsCaptured',
    4:  'sections.newAdmissions.items.statusUpdated',
    5:  'sections.newAdmissions.items.accuracyChecked',
    6:  'sections.newAdmissions.note',
    7:  'sections.authorisations.items.pendingFollowedUp',
    8:  'sections.authorisations.items.approvalsConfirmed',
    9:  'sections.authorisations.items.deniedFlagged',
    10: 'sections.authorisations.note',
    11: 'sections.billing.items.chargesCaptured',
    12: 'sections.billing.items.rejectionsFlagged',
    13: 'sections.billing.items.auditTrailChecked',
    14: 'sections.billing.items.denialsAppealed',
    15: 'sections.billing.note',
    16: 'sections.recons.items.remittanceRecon',
    17: 'sections.recons.items.agedDebtorsDown',
    18: 'sections.recons.items.costRisksFlagged',
    19: 'sections.recons.items.unusualItemsRecon',
    20: 'sections.recons.note',
    21: 'sections.creditControl.items.overdueFollowedUp',
    22: 'sections.creditControl.items.paymentArrangements',
    23: 'sections.creditControl.items.collectionTargetsMet',
    24: 'sections.creditControl.note',
    25: 'sections.financeReporting.items.reportSentCOO',
    26: 'sections.financeReporting.items.risksEscalated',
    27: 'sections.financeReporting.items.opportunitiesShared',
    28: 'sections.financeReporting.items.tomorrowFocusDefined',
    29: 'sections.financeReporting.note',
  },

  supportServices: {
    0: '_timestamp', 1: '_submittedBy', 2: '_date',
    3:  'sections.laundry.items.staffAllocated',
    4:  'sections.laundry.items.bedsChanged',
    5:  'sections.laundry.items.linenOnTime',
    6:  'sections.laundry.items.linenSeparated',
    7:  'sections.laundry.items.tornRepaired',
    8:  'sections.laundry.items.laundryRoomClean',
    9:  'sections.laundry.items.suppliesRestocked',
    10: 'sections.laundry.note',
    11: 'sections.cleaning.items.cleaningStaffCount',
    12: 'sections.cleaning.items.wardBedsCleaned',
    13: 'sections.cleaning.items.deepCleanSchedule',
    14: 'sections.cleaning.items.highTouchDisinfected',
    15: 'sections.cleaning.items.floorsCleaned',
    16: 'sections.cleaning.items.medWasteHandled',
    17: 'sections.cleaning.items.suppliesAvailable',
    18: 'sections.cleaning.note',
    19: 'sections.cookingKitchen.items.kitchenStaffCount',
    20: 'sections.cookingKitchen.items.breakfastServed',
    21: 'sections.cookingKitchen.items.breakfastTime',
    22: 'sections.cookingKitchen.items.lunchServed',
    23: 'sections.cookingKitchen.items.lunchTime',
    24: 'sections.cookingKitchen.items.dinnerServed',
    25: 'sections.cookingKitchen.items.dinnerTime',
    26: 'sections.cookingKitchen.items.foodCompliant',
    27: 'sections.cookingKitchen.items.fridgeTemps',
    28: 'sections.cookingKitchen.items.kitchenClean',
    29: 'sections.cookingKitchen.items.foodSafety',
    30: 'sections.cookingKitchen.items.stockCounted',
    31: 'sections.cookingKitchen.items.criticalSupplies',
    32: 'sections.cookingKitchen.items.stocklistAttached',
    33: 'sections.cookingKitchen.items.invoicesReconciled',
    34: 'sections.cookingKitchen.note',
    35: 'sections.cookingKitchen.items.totalStockValue',
    36: 'sections.cookingKitchen.items.totalPurchases',
    37: 'sections.patientExperience.items.commonAreasTidy',
    38: 'sections.patientExperience.items.restroomsClean',
    39: 'sections.patientExperience.items.laundryOnTime',
    40: 'sections.patientExperience.items.patientRequests',
    41: 'sections.patientExperience.note',
  },

  security: {
    0: '_timestamp', 1: '_submittedBy', 2: '_date',
    3:  'sections.mainGateEntrance.items.guardOnTime',
    4:  'sections.mainGateEntrance.items.gateAreaClean',
    5:  'sections.mainGateEntrance.items.noCigaretteButts',
    6:  'sections.mainGateEntrance.items.accessControlBook',
    7:  'sections.mainGateEntrance.items.visitorRegister',
    8:  'sections.mainGateEntrance.items.noUnauthorisedVisitors',
    9:  'sections.mainGateEntrance.note',
    10: 'sections.wellnessCentre.items.recAreaChairs',
    11: 'sections.wellnessCentre.items.gateDoorsLocked',
    12: 'sections.wellnessCentre.items.fountainOff',
    13: 'sections.wellnessCentre.items.tapsClosed',
    14: 'sections.wellnessCentre.items.lightsOnNight',
    15: 'sections.wellnessCentre.items.lightsOffDay',
    16: 'sections.wellnessCentre.items.areaCleanSecure',
    17: 'sections.wellnessCentre.note',
    18: 'sections.backOfBuilding.items.airconOff',
    19: 'sections.backOfBuilding.items.geysersSchedule',
    20: 'sections.backOfBuilding.items.externalLights',
    21: 'sections.backOfBuilding.items.noSuspiciousPersons',
    22: 'sections.backOfBuilding.items.areaFreeRubbish',
    23: 'sections.backOfBuilding.note',
    24: 'sections.generatorPower.items.electricityUnits',
    25: 'sections.generatorPower.items.powerOutage',
    26: 'sections.generatorPower.items.generatorFull',
    27: 'sections.generatorPower.items.petrolChecked',
    28: 'sections.generatorPower.note',
    29: 'sections.rondavelToolRoom.items.toolRoomLocked',
    30: 'sections.rondavelToolRoom.items.noToolsOutside',
    31: 'sections.rondavelToolRoom.items.windowsSecure',
    32: 'sections.rondavelToolRoom.note',
    33: 'sections.wasteRoom.items.wasteRoomLocked',
    34: 'sections.wasteRoom.items.binsClosed',
    35: 'sections.wasteRoom.items.noSpillage',
    36: 'sections.wasteRoom.note',
    37: 'sections.mainBuildingNight.items.externalDoorsLocked',
    38: 'sections.mainBuildingNight.items.windowsClosed',
    39: 'sections.mainBuildingNight.items.passageLights',
    40: 'sections.mainBuildingNight.items.emergencyLights',
    41: 'sections.mainBuildingNight.items.noUnauthorisedInside',
    42: 'sections.mainBuildingNight.note',
    43: 'sections.generalSecurityChecks.items.noSuspiciousActivity',
    44: 'sections.generalSecurityChecks.items.camerasOperational',
    45: 'sections.generalSecurityChecks.items.radioCharged',
    46: 'sections.generalSecurityChecks.items.perimeterSecure',
    47: 'sections.generalSecurityChecks.items.fireExitsClear',
    48: 'sections.generalSecurityChecks.items.noHazards',
    49: 'sections.generalSecurityChecks.items.parkingSecure',
    50: 'sections.generalSecurityChecks.note',
  },

  marketing: {
    0: '_timestamp', 1: '_submittedBy', 2: '_date',
    3:  'sections.whatsappChannelGrowth.items.newFollowers',
    4:  'sections.whatsappChannelGrowth.items.qrPostersVisible',
    5:  'sections.whatsappChannelGrowth.items.visitorsAssisted',
    6:  'sections.whatsappChannelGrowth.items.linkShared',
    7:  'sections.whatsappChannelGrowth.items.followerNumberReported',
    8:  'sections.whatsappChannelGrowth.note',
    9:  'sections.staffWhatsappStatus.items.deptVisitedCount',
    10: 'sections.staffWhatsappStatus.items.staffPostedStatus',
    11: 'sections.staffWhatsappStatus.items.repostReminder',
    12: 'sections.staffWhatsappStatus.items.checklistUpdated',
    13: 'sections.staffWhatsappStatus.note',
    14: 'sections.facebook.items.postsPublished',
    15: 'sections.facebook.items.postingCadence',
    16: 'sections.facebook.items.commentsResponded',
    17: 'sections.facebook.items.queriesBridged',
    18: 'sections.facebook.items.reviewDrive',
    19: 'sections.facebook.note',
    20: 'sections.patientFollowUpCalls.items.callsMade',
    21: 'sections.patientFollowUpCalls.items.callsWithinWindow',
    22: 'sections.patientFollowUpCalls.items.callLogCompleted',
    23: 'sections.patientFollowUpCalls.items.concernsEscalated',
    24: 'sections.patientFollowUpCalls.note',
    25: 'sections.popUpActivation.items.patientsContacted',
    26: 'sections.popUpActivation.items.referralsCount',
    27: 'sections.popUpActivation.items.unitBranded',
    28: 'sections.popUpActivation.items.nurseScreening',
    29: 'sections.popUpActivation.items.activationLog',
    30: 'sections.popUpActivation.note',
    31: 'sections.reviewsSocialProof.items.googleReviews',
    32: 'sections.reviewsSocialProof.items.facebookReviews',
    33: 'sections.reviewsSocialProof.items.reviewCardsHandedOut',
    34: 'sections.reviewsSocialProof.items.positiveReviewReposted',
    35: 'sections.reviewsSocialProof.note',
    36: 'sections.strategyInfrastructure.items.metaPixel',
    37: 'sections.strategyInfrastructure.items.gbpUpdated',
    38: 'sections.strategyInfrastructure.items.websiteButtonLive',
    39: 'sections.strategyInfrastructure.items.anchorContent',
    40: 'sections.strategyInfrastructure.items.adSpendTracked',
    41: 'sections.strategyInfrastructure.note',
  },

  nursing: {
    0: '_timestamp', 1: '_submittedBy', 2: '_date',
    3:  'sections.clinicalOperations.items.wardsStaffed',
    4:  'sections.clinicalOperations.items.medicationOnTime',
    5:  'sections.clinicalOperations.items.doctorsRounds',
    6:  'sections.clinicalOperations.items.clinicalDocsUpToDate',
    7:  'sections.clinicalOperations.items.infectionControl',
    8:  'sections.clinicalOperations.items.incidentReports',
    9:  'sections.clinicalOperations.note',
    10: 'sections.patientCareSafety.items.deepCleaning',
    11: 'sections.patientCareSafety.items.highTouchDisinfected',
    12: 'sections.patientCareSafety.items.floorsCleaned',
    13: 'sections.patientCareSafety.items.medWasteHandled',
    14: 'sections.patientCareSafety.items.suppliesOrdered',
    15: 'sections.patientCareSafety.note',
    16: 'sections.admissionsDischarges.items.admissionsProcessed',
    17: 'sections.admissionsDischarges.items.admissionsCorrect',
    18: 'sections.admissionsDischarges.items.authorisationsInPlace',
    19: 'sections.admissionsDischarges.items.dischargesOnSystem',
    20: 'sections.admissionsDischarges.items.ttoMedications',
    21: 'sections.admissionsDischarges.items.bedAvailability',
    22: 'sections.admissionsDischarges.note',
  },

};


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4 — BUSINESS LOGIC
// ═══════════════════════════════════════════════════════════════════════════

const BUSINESS_LOGIC = {
  sectionRating:    'override — all GREEN=GREEN, one RED=AMBER, any AMBER=AMBER, 2+RED=RED, nothing=PENDING. NEVER average.',
  departmentRating: 'same override over section RAGs',
  hospitalRating:   'same override over 7 dept RAGs — shown with avg score as info only',
  naLoophole:       '3 rules: count N/A, flag sections with ≥2 N/A, cap GREEN→AMBER if short reporting or N/A flagged',
  compliance:       'count actual vs expected. Marketing: flag only if below 2. Security: 14/week (day+night).',
  reconciliation:   'nursing.admissionsProcessed weekly sum vs caseManagement.newAdmissions weekly sum. Gap≠0=RED.',
  upsert:           'Firestore .set() on weeklyRollups/{weekEnding}/{deptId} — idempotent, latest wins',
  dates:            'Timestamp for sort fields, YYYY-MM-DD string for keys. Week ends Thursday.',
  answers:          'Yes | Most | No | N-A. Compound values (N/A, Yes) → take last value.',
  weekBoundary:     'No hard cutoff. Week Fri→Thu. Dashboard shows current week live + week selector dropdown.',
};


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5 — FIRESTORE COLLECTIONS (unchanged from v1)
// ═══════════════════════════════════════════════════════════════════════════
// submissions/{deptId}/{YYYY-MM-DD}_{shift}
// weeklyRollups/{weekEnding}/{deptId}
// hospitalWeeklySummary/{weekEnding}


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6 — WEEK UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function getWeekEnding(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const daysToThursday = (4 - day + 7) % 7;
  const thursday = new Date(d);
  thursday.setDate(d.getDate() + daysToThursday);
  return thursday.toISOString().split('T')[0];
}

function getPreviousWeekEnding(weekEndingStr) {
  const thursday = new Date(weekEndingStr);
  thursday.setDate(thursday.getDate() - 7);
  return thursday.toISOString().split('T')[0];
}

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

function isInWeek(date, weekEndingStr) {
  const thursday = new Date(weekEndingStr);
  const friday   = new Date(thursday);
  friday.setDate(thursday.getDate() - 6);
  const d = new Date(date);
  d.setHours(0,0,0,0);
  friday.setHours(0,0,0,0);
  thursday.setHours(23,59,59,999);
  return d >= friday && d <= thursday;
}

function weekLabel(weekEndingStr) {
  const thursday = new Date(weekEndingStr);
  const friday   = new Date(thursday);
  friday.setDate(thursday.getDate() - 6);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fDay = friday.getDate(), fMon = months[friday.getMonth()];
  const tDay = thursday.getDate(), tMon = months[thursday.getMonth()];
  const year = thursday.getFullYear();
  return fMon === tMon
    ? `${fDay} – ${tDay} ${tMon} ${year}`
    : `${fDay} ${fMon} – ${tDay} ${tMon} ${year}`;
}


// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
  window.HAE_SCHEMA            = SCHEMA;
  window.HAE_LEGACY_MAP        = LEGACY_COLUMN_MAP;
  window.HAE_BUSINESS_LOGIC    = BUSINESS_LOGIC;
  window.getWeekEnding         = getWeekEnding;
  window.getPreviousWeekEnding = getPreviousWeekEnding;
  window.getLastNWeekEndings   = getLastNWeekEndings;
  window.isInWeek              = isInWeek;
  window.weekLabel             = weekLabel;
}

if (typeof module !== 'undefined') {
  module.exports = {
    SCHEMA,
    LEGACY_COLUMN_MAP,
    BUSINESS_LOGIC,
    getWeekEnding,
    getPreviousWeekEnding,
    getLastNWeekEndings,
    isInWeek,
    weekLabel,
  };
}
