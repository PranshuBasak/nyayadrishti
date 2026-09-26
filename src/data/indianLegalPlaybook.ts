export interface LegalSource {
  id: string;
  actName: string;
  section: string;
  title: string;
  category: "employment" | "tenancy" | "consumer" | "dispute" | "privacy" | "commercial";
  keyPrinciple: string;
  landmarkPrecedent?: string;
  plainSummary: string;
  hinglishSummary: string;
  sourceUrl: string;
}

export const INDIAN_LEGAL_PLAYBOOK: LegalSource[] = [
  {
    id: "ica-sec-27",
    actName: "Indian Contract Act, 1872",
    section: "Section 27",
    title: "Agreement in Restraint of Trade Void",
    category: "employment",
    keyPrinciple: "Every agreement by which anyone is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void. Post-employment non-compete covenants are completely unenforceable in India.",
    landmarkPrecedent: "Percept D'Mark (India) (P) Ltd. v. Zaheer Khan (2006) 4 SCC 227; Niranjan Shankar Golikari (1967) 2 SCR 378",
    plainSummary: "In India, an employer cannot legally prevent you from joining a competitor or starting your own business after you leave, even if you signed a 1-year or 2-year non-compete clause.",
    hinglishSummary: "India mein job chhodne ke baad company aapko kisi competitor ke sath kaam karne ya apna kaam shuru karne se legally nahi rok sakti, chahe contract mein non-compete clause kyu na ho.",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/2187"
  },
  {
    id: "ica-sec-74",
    actName: "Indian Contract Act, 1872",
    section: "Section 74",
    title: "Compensation for Breach of Contract Where Penalty Stipulated",
    category: "employment",
    keyPrinciple: "Where a contract stipulates an arbitrary or disproportionate sum payable upon breach (employment service bonds, exit penalties), courts will only award reasonable compensation for actual proven expenses incurred, not punitive penalties.",
    landmarkPrecedent: "Fateh Chand v. Balkishan Dass (1964) 1 SCR 515; Kailash Nath Associates v. DDA (2015) 4 SCC 136",
    plainSummary: "Disproportionate employment exit bonds (e.g. ₹2-5 Lakhs for leaving before 2 years) cannot be recovered as automatic penalties without proving genuine training costs incurred.",
    hinglishSummary: "Bina actual training kharche ka saboot diye, companies arbitrary service bond amount (jaise 2-3 lakh rupaye) penalty ke taur par zabardasti nahi vasool sakti.",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/2187"
  },
  {
    id: "cpa-sec-2-46",
    actName: "Consumer Protection Act, 2019",
    section: "Section 2(46)",
    title: "Definition of 'Unfair Contract'",
    category: "consumer",
    keyPrinciple: "A contract between a consumer and trader/service provider having terms causing significant disadvantage to the consumer: excessive security deposits, disproportionate breach penalties, refusal to accept early payment, or unilateral termination without reasonable cause.",
    landmarkPrecedent: "Pioneer Urban Land & Infrastructure Ltd. v. Govindan Raghavan (2019) 5 SCC 725",
    plainSummary: "Contracts that contain one-sided, oppressive clauses (such as non-refundable huge deposits, unilateral cancellation, or harsh forfeiture) can be declared null and void by Consumer Commissions.",
    hinglishSummary: "Agar koi company ya seller ek-tarfa shartein thopta hai (jaise non-refundable deposit ya bina wajah cancel karna), to Consumer Commission use cancel ya void declare kar sakta hai.",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/15256"
  },
  {
    id: "mta-sec-11",
    actName: "Model Tenancy Act, 2021",
    section: "Section 11 & Section 15",
    title: "Security Deposit Caps & Entry Notices",
    category: "tenancy",
    keyPrinciple: "Security deposit for residential premises is capped at a maximum of two months' rent. Landlord cannot enter premises without at least 24 hours prior notice. Unilateral arbitrary deductions for painting without wear-and-tear assessment are prohibited.",
    landmarkPrecedent: "Adopted in multiple state rent ordinances and tenancy regulations.",
    plainSummary: "Demands for 10-12 months of rent as security deposit or landlord entry without notice are contrary to modern Indian tenancy principles. Normal wear-and-tear cannot be deducted as painting fees.",
    hinglishSummary: "Rent agreement mein 10-12 mahine ka security deposit mangna ya bina 24 ghante pehle bataye ghar mein aana galat hai. Normal toot-phoot ke liye deposit se paise nahi kaate ja sakte.",
    sourceUrl: "https://mohua.gov.in/upload/uploadfiles/files/Model_Tenancy_Act_English.pdf"
  },
  {
    id: "arb-perkins",
    actName: "Arbitration & Conciliation Act, 1996",
    section: "Section 12(5) & Seventh Schedule",
    title: "Ineligibility to Appoint Sole Arbitrator Unilaterally",
    category: "dispute",
    keyPrinciple: "A party interested in the dispute or having authority to appoint an arbitrator cannot unilaterally appoint a sole arbitrator. Such appointments are invalid ab initio.",
    landmarkPrecedent: "Perkins Eastman Architects DPC v. HSCC (India) Ltd. (2020) 20 SCC 760; TRF Ltd. v. Energo Engineering (2017) 8 SCC 877",
    plainSummary: "A clause where the company or landlord reserves the right to appoint their own lawyer or sole arbitrator without your consent is legally invalid under Supreme Court precedent.",
    hinglishSummary: "Agreement ka aisa clause jisme sirf company ya landlord ko apna manpasand arbitrator appoint karne ka hak diya ho, Supreme Court ke order ke hisaab se invalid hai.",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/1978"
  },
  {
    id: "dpdpa-sec-6",
    actName: "Digital Personal Data Protection Act, 2023",
    section: "Section 6 & Section 11",
    title: "Requirements for Valid Consent & Grievance Redressal",
    category: "privacy",
    keyPrinciple: "Consent must be free, specific, informed, unconditional and unambiguous with a clear affirmative action. Data fiduciaries must provide accessible grievance redressal mechanisms with designated officers.",
    landmarkPrecedent: "K.S. Puttaswamy v. Union of India (2017) 10 SCC 1 (Fundamental Right to Privacy)",
    plainSummary: "Apps and platforms cannot bundle unconditional blanket data sharing or hide data selling in terms of service without specific opt-in consent and a designated Grievance Officer in India.",
    hinglishSummary: "Koi bhi platform aapka data bina clear consent ke kisi ko nahi bech sakta, aur unko ek Grievance Officer ka naam aur contact dena zaroori hai.",
    sourceUrl: "https://www.meity.gov.in/content/digital-personal-data-protection-act-2023"
  }
];

export interface PortalGuide {
  portalName: string;
  hindiName: string;
  badge: string;
  description: string;
  url: string;
  helpline: string;
  applicability: string[];
}

export const INDIAN_GOV_PORTALS: PortalGuide[] = [
  {
    portalName: "e-Daakhil (National Consumer Disputes Redressal)",
    hindiName: "ई-दाखिल पोर्टल",
    badge: "Official Central Gov",
    description: "Online portal developed by NIC for filing consumer complaints across District, State, and National Consumer Commissions without physically visiting court.",
    url: "https://edaakhil.nic.in/",
    helpline: "Toll-Free: 1915 / 1800-11-4000",
    applicability: ["Defective products", "Deficiency in service", "Unfair trade practices", "Refusal of refund", "Rental deposit disputes"]
  },
  {
    portalName: "National Consumer Helpline (NCH / INGRAM)",
    hindiName: "राष्ट्रीय उपभोक्ता हेल्पलाइन",
    badge: "Dept of Consumer Affairs",
    description: "Pre-litigation grievance redressal mechanism operated by Department of Consumer Affairs with 800+ convergence partner companies.",
    url: "https://consumerhelpline.gov.in/",
    helpline: "Call 1915 or SMS 8800001915",
    applicability: ["E-commerce fraud", "Delayed delivery", "Flight/Train cancellations", "Telecom disputes", "Warranty service denial"]
  },
  {
    portalName: "MSME Samadhaan (Delayed Payment Redressal)",
    hindiName: "एमएसएमई समाधान",
    badge: "Ministry of MSME",
    description: "Statutory online delayed payment monitoring system for micro and small enterprises & registered freelancers under MSMED Act, 2006 (entitled to compound interest at 3x bank rate).",
    url: "https://samadhaan.msme.gov.in/",
    helpline: "011-23063800",
    applicability: ["Unpaid freelancer invoices after 45 days", "Consultancy payment withholding", "Vendor disputes"]
  },
  {
    portalName: "NALSA / State Legal Services Authority (DLSA)",
    hindiName: "राष्ट्रीय विधिक सेवा प्राधिकरण",
    badge: "Statutory Legal Aid",
    description: "Constitutional free legal aid under Legal Services Authorities Act, 1987 for women, children, scheduled castes/tribes, industrial workmen, and persons with annual income under specified caps.",
    url: "https://nalsa.gov.in/",
    helpline: "National Legal Aid Helpline: 15100",
    applicability: ["Free lawyer assistance", "Lok Adalat settlements", "Domestic disputes", "Tenancy disputes for underprivileged"]
  }
];
