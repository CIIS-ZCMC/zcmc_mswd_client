export interface FamilyMember {
  id: string
  fullName: string
  relationship: string
  age: number
  civilStatus: string
  occupation: string
  monthlyIncome: number
  isDependent: boolean
}

export interface Watcher {
  id: string
  fullName: string
  relationship: string
  contactNo: string
  passNo: string
  validUntil: string
  status: "Active" | "Expired" | "Revoked"
}

export interface StaffAssignment {
  socialWorker: string
  socialWorkerId: string
  caseOfficer: string
  attendingPhysician: string
  assignedDate: string
  shift: "Morning" | "Afternoon" | "Night"
}

export interface SocialCaseStudy {
  caseNumber: string
  assessmentDate: string
  category: "Category C1" | "Category C2" | "Category C3" | "Category D"
  classificationDetails: string
  presentingProblem: string
  socialWorkerNotes: string
  recommendedAssistance: string
  approvedAmount?: number
}

export interface DocumentItem {
  id: string
  title: string
  category: "Indigency" | "Medical Abstract" | "Billing Statement" | "Prescription" | "Government ID"
  uploadDate: string
  status: "Verified" | "Pending Review" | "Action Needed"
  fileSize: string
}

export interface AuditHistory {
  id: string
  timestamp: string
  action: string
  performedBy: string
  details: string
}

export interface PatientRecord {
  id: string
  hospitalNo: string
  mswdNo: string
  fullName: string
  age: number
  gender: "Male" | "Female" | "Other"
  birthDate: string
  civilStatus: "Single" | "Married" | "Widowed" | "Separated"
  contactNo: string
  address: string
  barangay: string
  city: string
  intakeDate: string
  admissionStatus: "In-Patient" | "Out-Patient" | "ER Emergency"
  ward: string
  bedNo: string
  diagnosis: string
  category: "Category C1" | "Category C2" | "Category C3" | "Category D"
  philHealthNo: string
  seniorCitizenId?: string
  pwdId?: string
  familyMembers: FamilyMember[]
  watchers: Watcher[]
  assignedStaff: StaffAssignment
  caseStudy: SocialCaseStudy
  documents: DocumentItem[]
  history: AuditHistory[]
}

export const MOCK_PATIENTS: PatientRecord[] = [
  {
    id: "pat-101",
    hospitalNo: "ZCMC-2026-08912",
    mswdNo: "MSWD-2026-0412",
    fullName: "Juanita Dela Cruz San Juan",
    age: 48,
    gender: "Female",
    birthDate: "1978-03-14",
    civilStatus: "Married",
    contactNo: "+63 917 842 1092",
    address: "Zone 3, Barangay Sta. Maria",
    barangay: "Sta. Maria",
    city: "Zamboanga City",
    intakeDate: "2026-08-22",
    admissionStatus: "In-Patient",
    ward: "Internal Medicine Ward 2",
    bedNo: "Bed 14A",
    diagnosis: "Acute Coronary Syndrome, Hypertension Stage II",
    category: "Category C3",
    philHealthNo: "12-054918239-1",
    seniorCitizenId: undefined,
    pwdId: undefined,
    familyMembers: [
      {
        id: "fam-1",
        fullName: "Roberto San Juan",
        relationship: "Husband",
        age: 52,
        civilStatus: "Married",
        occupation: "Tricycle Driver",
        monthlyIncome: 6500,
        isDependent: false,
      },
      {
        id: "fam-2",
        fullName: "Angelica San Juan",
        relationship: "Daughter",
        age: 17,
        civilStatus: "Single",
        occupation: "Student",
        monthlyIncome: 0,
        isDependent: true,
      },
      {
        id: "fam-3",
        fullName: "Mark San Juan",
        relationship: "Son",
        age: 12,
        civilStatus: "Single",
        occupation: "Student",
        monthlyIncome: 0,
        isDependent: true,
      },
    ],
    watchers: [
      {
        id: "watch-1",
        fullName: "Roberto San Juan",
        relationship: "Husband",
        contactNo: "+63 917 842 1092",
        passNo: "WP-2026-881",
        validUntil: "2026-08-29",
        status: "Active",
      },
      {
        id: "watch-2",
        fullName: "Maria San Juan (Sister-in-law)",
        relationship: "Relative",
        contactNo: "+63 905 112 4490",
        passNo: "WP-2026-882",
        validUntil: "2026-08-28",
        status: "Active",
      },
    ],
    assignedStaff: {
      socialWorker: "Maria Santos, RSW",
      socialWorkerId: "RSW-9412",
      caseOfficer: "Dra. Clarissa Ramos",
      attendingPhysician: "Dr. Fernando Gutierrez",
      assignedDate: "2026-08-22",
      shift: "Morning",
    },
    caseStudy: {
      caseNumber: "CS-2026-0412",
      assessmentDate: "2026-08-22",
      category: "Category C3",
      classificationDetails: "Indigent household with 2 minor dependents; primary earner earns below monthly threshold.",
      presentingProblem: "Patient requires urgent cardiac monitoring and specialized medication not covered under standard PhilHealth limits.",
      socialWorkerNotes: "Conducted intake interview with spouse. Verified indigency certificate from Barangay Sta. Maria. Qualified for Partial Financial Subsidy (MAIFIP).",
      recommendedAssistance: "Medical Assistance for Indigent Patients (MAIFIP) grant of ₱15,000 for hospital billing and diagnostic labs.",
      approvedAmount: 15000,
    },
    documents: [
      {
        id: "doc-1",
        title: "Barangay Certificate of Indigency",
        category: "Indigency",
        uploadDate: "2026-08-22",
        status: "Verified",
        fileSize: "1.2 MB",
      },
      {
        id: "doc-2",
        title: "Clinical Abstract & Doctor Prescription",
        category: "Medical Abstract",
        uploadDate: "2026-08-22",
        status: "Verified",
        fileSize: "2.4 MB",
      },
      {
        id: "doc-3",
        title: "ZCMC Partial Billing Statement",
        category: "Billing Statement",
        uploadDate: "2026-08-23",
        status: "Verified",
        fileSize: "850 KB",
      },
      {
        id: "doc-4",
        title: "PhilHealth Member Data Record (MDR)",
        category: "Government ID",
        uploadDate: "2026-08-22",
        status: "Verified",
        fileSize: "980 KB",
      },
    ],
    history: [
      {
        id: "hist-1",
        timestamp: "2026-08-22 09:15 AM",
        action: "Intake Assessment Created",
        performedBy: "Maria Santos, RSW",
        details: "Patient registered and initial intake interview conducted at MSWD Counter 3.",
      },
      {
        id: "hist-2",
        timestamp: "2026-08-22 11:30 AM",
        action: "Category Assigned: Category C3",
        performedBy: "Maria Santos, RSW",
        details: "Assessed under Safety Net Category C3 based on household income verification.",
      },
      {
        id: "hist-3",
        timestamp: "2026-08-23 02:00 PM",
        action: "MAIFIP Guarantee Letter Issued",
        performedBy: "Chief MSWD Officer",
        details: "Approved financial guarantee letter worth ₱15,000 sent to ZCMC Billing Section.",
      },
    ],
  },
  {
    id: "pat-102",
    hospitalNo: "ZCMC-2026-09204",
    mswdNo: "MSWD-2026-0428",
    fullName: "Rodrigo Alcantara Mendoza",
    age: 64,
    gender: "Male",
    birthDate: "1962-07-21",
    civilStatus: "Widowed",
    contactNo: "+63 928 331 9901",
    address: "Purok 4, Barangay Calarian",
    barangay: "Calarian",
    city: "Zamboanga City",
    intakeDate: "2026-08-23",
    admissionStatus: "In-Patient",
    ward: "Surgical Ward 3",
    bedNo: "Bed 08B",
    diagnosis: "Cholelithiasis s/p Laparoscopic Cholecystectomy",
    category: "Category D",
    philHealthNo: "03-019284712-4",
    seniorCitizenId: "SC-ZCM-84192",
    pwdId: undefined,
    familyMembers: [
      {
        id: "fam-4",
        fullName: "Jonard Mendoza",
        relationship: "Son",
        age: 32,
        civilStatus: "Married",
        occupation: "Construction Worker",
        monthlyIncome: 8000,
        isDependent: false,
      },
    ],
    watchers: [
      {
        id: "watch-3",
        fullName: "Jonard Mendoza",
        relationship: "Son",
        contactNo: "+63 928 331 9901",
        passNo: "WP-2026-905",
        validUntil: "2026-08-30",
        status: "Active",
      },
    ],
    assignedStaff: {
      socialWorker: "Janice Torres, RSW",
      socialWorkerId: "RSW-8814",
      caseOfficer: "Dr. Arnaldo Cruz",
      attendingPhysician: "Dr. Beatrice Valenzuela",
      assignedDate: "2026-08-23",
      shift: "Morning",
    },
    caseStudy: {
      caseNumber: "CS-2026-0428",
      assessmentDate: "2026-08-23",
      category: "Category D",
      classificationDetails: "Totally indigent senior citizen patient with zero independent personal income.",
      presentingProblem: "Surgical procedure requirement with surgical mesh and post-op medication.",
      socialWorkerNotes: "Senior citizen living with son's family. Full 100% medical subsidy approved under No Balance Billing (NBB) policy.",
      recommendedAssistance: "100% No Balance Billing (NBB) Coverage plus DSWD Assistance to Individuals in Crisis Situations (AICS).",
      approvedAmount: 28500,
    },
    documents: [
      {
        id: "doc-5",
        title: "Barangay Indigency Certificate",
        category: "Indigency",
        uploadDate: "2026-08-23",
        status: "Verified",
        fileSize: "1.1 MB",
      },
      {
        id: "doc-6",
        title: "Senior Citizen OSCA ID Copy",
        category: "Government ID",
        uploadDate: "2026-08-23",
        status: "Verified",
        fileSize: "720 KB",
      },
      {
        id: "doc-7",
        title: "Surgical Consent & Clinical Abstract",
        category: "Medical Abstract",
        uploadDate: "2026-08-23",
        status: "Verified",
        fileSize: "3.1 MB",
      },
    ],
    history: [
      {
        id: "hist-4",
        timestamp: "2026-08-23 10:00 AM",
        action: "Intake Evaluation Completed",
        performedBy: "Janice Torres, RSW",
        details: "Assessed under Category D (Fully Indigent / Senior Citizen).",
      },
      {
        id: "hist-5",
        timestamp: "2026-08-23 01:15 PM",
        action: "NBB Classification Applied",
        performedBy: "Janice Torres, RSW",
        details: "No Balance Billing status activated in ZCMC Health Information System.",
      },
    ],
  },
  {
    id: "pat-103",
    hospitalNo: "ZCMC-2026-09551",
    mswdNo: "MSWD-2026-0451",
    fullName: "Elena Basa Tan",
    age: 35,
    gender: "Female",
    birthDate: "1991-11-05",
    civilStatus: "Single",
    contactNo: "+63 936 554 1120",
    address: "Block 12, Barangay Tetuan",
    barangay: "Tetuan",
    city: "Zamboanga City",
    intakeDate: "2026-08-24",
    admissionStatus: "Out-Patient",
    ward: "OPD Chemotherapy Unit",
    bedNo: "Chair 04",
    diagnosis: "Breast Carcinoma Stage IIB (Cycle 3 Chemotherapy)",
    category: "Category C2",
    philHealthNo: "19-091248172-8",
    seniorCitizenId: undefined,
    pwdId: "PWD-ZCM-2024-912",
    familyMembers: [
      {
        id: "fam-5",
        fullName: "Luz Basa Tan",
        relationship: "Mother",
        age: 61,
        civilStatus: "Widowed",
        occupation: "Vendor",
        monthlyIncome: 4500,
        isDependent: false,
      },
    ],
    watchers: [
      {
        id: "watch-4",
        fullName: "Luz Basa Tan",
        relationship: "Mother",
        contactNo: "+63 936 554 1120",
        passNo: "WP-2026-940",
        validUntil: "2026-09-10",
        status: "Active",
      },
    ],
    assignedStaff: {
      socialWorker: "Maria Santos, RSW",
      socialWorkerId: "RSW-9412",
      caseOfficer: "Dr. Ronald Reyes",
      attendingPhysician: "Dra. Patricia Lim",
      assignedDate: "2026-08-24",
      shift: "Morning",
    },
    caseStudy: {
      caseNumber: "CS-2026-0451",
      assessmentDate: "2026-08-24",
      category: "Category C2",
      classificationDetails: "Outpatient cancer patient requiring recurring specialized chemotherapy drugs.",
      presentingProblem: "Patient requires financial assistance for Chemotherapy Vials (Trastuzumab / Paclitaxel).",
      socialWorkerNotes: "Case evaluated for PCSO / DOH Cancer Assistance Fund endorsement.",
      recommendedAssistance: "Endorsement to DOH Cancer Specialty Fund & DSWD AICS Medicine Voucher (₱20,000).",
      approvedAmount: 20000,
    },
    documents: [
      {
        id: "doc-8",
        title: "Histopathology & Oncology Report",
        category: "Medical Abstract",
        uploadDate: "2026-08-24",
        status: "Verified",
        fileSize: "4.2 MB",
      },
      {
        id: "doc-9",
        title: "Barangay Indigency",
        category: "Indigency",
        uploadDate: "2026-08-24",
        status: "Verified",
        fileSize: "1.0 MB",
      },
    ],
    history: [
      {
        id: "hist-6",
        timestamp: "2026-08-24 08:30 AM",
        action: "OPD Chemotherapy Intake",
        performedBy: "Maria Santos, RSW",
        details: "Outpatient intake logged and Category C2 assigned.",
      },
    ],
  },
  {
    id: "pat-104",
    hospitalNo: "ZCMC-2026-09710",
    mswdNo: "MSWD-2026-0466",
    fullName: "Gabriel Echevarria Villanueva",
    age: 8,
    gender: "Male",
    birthDate: "2018-01-29",
    civilStatus: "Single",
    contactNo: "+63 917 220 8491",
    address: "Km 5, Barangay Pasonanca",
    barangay: "Pasonanca",
    city: "Zamboanga City",
    intakeDate: "2026-08-25",
    admissionStatus: "ER Emergency",
    ward: "Pediatric ICU",
    bedNo: "PICU Bed 02",
    diagnosis: "Severe Dengue Hemorrhagic Fever with Thrombocytopenia",
    category: "Category C1",
    philHealthNo: "14-029418291-0",
    seniorCitizenId: undefined,
    pwdId: undefined,
    familyMembers: [
      {
        id: "fam-6",
        fullName: "Marco Villanueva",
        relationship: "Father",
        age: 38,
        civilStatus: "Married",
        occupation: "Security Guard",
        monthlyIncome: 14000,
        isDependent: false,
      },
      {
        id: "fam-7",
        fullName: "Clarice Villanueva",
        relationship: "Mother",
        age: 36,
        civilStatus: "Married",
        occupation: "Housewife",
        monthlyIncome: 0,
        isDependent: true,
      },
    ],
    watchers: [
      {
        id: "watch-5",
        fullName: "Clarice Villanueva",
        relationship: "Mother",
        contactNo: "+63 917 220 8491",
        passNo: "WP-2026-980",
        validUntil: "2026-09-01",
        status: "Active",
      },
    ],
    assignedStaff: {
      socialWorker: "Janice Torres, RSW",
      socialWorkerId: "RSW-8814",
      caseOfficer: "Dr. Hernan Gomez",
      attendingPhysician: "Dra. Sophia Morales",
      assignedDate: "2026-08-25",
      shift: "Morning",
    },
    caseStudy: {
      caseNumber: "CS-2026-0466",
      assessmentDate: "2026-08-25",
      category: "Category C1",
      classificationDetails: "Emergency pediatric admission requiring blood transfusions and ICU monitoring.",
      presentingProblem: "Urgent need for Platelet Concentrate blood units and ICU medicine support.",
      socialWorkerNotes: "Fast-tracked social intake conducted in ER. Blood bank coordination initiated.",
      recommendedAssistance: "Blood Transfusion Guarantee & MAIFIP Emergency Voucher (₱10,000).",
      approvedAmount: 10000,
    },
    documents: [
      {
        id: "doc-10",
        title: "Emergency Room Intake Record",
        category: "Medical Abstract",
        uploadDate: "2026-08-25",
        status: "Verified",
        fileSize: "1.8 MB",
      },
    ],
    history: [
      {
        id: "hist-7",
        timestamp: "2026-08-25 07:10 AM",
        action: "Emergency Intake Created",
        performedBy: "Janice Torres, RSW",
        details: "ER Fast-track intake initiated for Pediatric ICU admission.",
      },
    ],
  },
]
