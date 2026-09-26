export interface SampleContract {
  id: string;
  title: string;
  category: "tenancy" | "employment" | "freelance" | "consumer";
  badge: string;
  description: string;
  parties: { partyA: string; partyB: string };
  rawText: string;
  clauses: {
    id: string;
    clauseNumber: string;
    title: string;
    text: string;
    attentionLevel: "low" | "review_recommended" | "high_attention" | "legal_review_recommended";
    explanation: string;
    hinglishExplanation: string;
    whyItMatters: string;
    statutoryRef?: string;
    suggestedAlternative?: string;
    negotiationTips: string;
    questionsForLawyer: string[];
  }[];
}

export const SAMPLE_CONTRACTS: SampleContract[] = [
  {
    id: "rental-bengaluru",
    title: "Bengaluru Residential Tenancy Agreement",
    category: "tenancy",
    badge: "11-Month Rental Lease",
    description: "Standard residential lease agreement containing typical Bengaluru/Mumbai landlord clauses: 10-month security deposit, 1-month painting deduction, and arbitrary eviction rules.",
    parties: {
      partyA: "Sri. K. Ramesh Rao (Lessor / Landlord)",
      partyB: "Ms. Ananya Sharma (Lessee / Tenant)"
    },
    rawText: `RESIDENTIAL LEASE AGREEMENT

THIS LEASE AGREEMENT is entered into at Bengaluru on this 1st day of August, 2026 by and between:
Sri. K. Ramesh Rao, residing at Indiranagar, Bengaluru (hereinafter called the "LESSOR") of the ONE PART;
AND
Ms. Ananya Sharma, employed at Tech Park, Bengaluru (hereinafter called the "LESSEE") of the OTHER PART.

WHEREAS the Lessor is the absolute owner of Flat No. 402, Green Meadows, Bellandur, Bengaluru - 560103.

NOW THIS AGREEMENT WITNESSETH AS FOLLOWS:

1. DURATION: The lease shall be for an initial period of 11 (eleven) months commencing from 1st August, 2026.

2. MONTHLY RENT: The Lessee shall pay a monthly rent of Rs. 42,000/- (Rupees Forty-Two Thousand only), payable on or before the 5th day of every calendar month.

3. SECURITY DEPOSIT: The Lessee has deposited with the Lessor a sum of Rs. 4,20,000/- (Rupees Four Lakhs Twenty Thousand only), being equivalent to 10 (ten) months rent, as interest-free refundable security deposit.

4. MANDATORY PAINTING & CLEANING CHARGES: Upon vacating the premises, irrespective of the physical condition or length of stay, the Lessor shall deduct an absolute and non-negotiable sum equal to 1 (one) full month rent (Rs. 42,000/-) from the security deposit towards professional painting and deep cleaning.

5. LESSOR INSPECTION & RIGHT OF ENTRY: The Lessor or his authorized representative reserves the absolute right to inspect the premises at any hour of the day or night without prior notice to the Lessee.

6. REPAIRS AND MAINTENANCE: The Lessee shall bear all costs of electrical, plumbing, structural seepage, and appliance maintenance whatsoever exceeding Rs. 500/-.

7. TERMINATION & SUMMARY EVICTION: The Lessor reserves the right to terminate this lease agreement by giving 24 (twenty-four) hours written notice via WhatsApp or Email if the Lessor requires the premises for personal urgency or in case of any neighbor grievance, and the Lessee shall vacate immediately without claiming any refund until 60 days after handover.

8. JURISDICTION: Any dispute arising out of this agreement shall be subject to the exclusive jurisdiction of the civil courts in Bengaluru.`,
    clauses: [
      {
        id: "c-rent-3",
        clauseNumber: "Clause 3",
        title: "Security Deposit (10 Months Rent)",
        text: "The Lessee has deposited with the Lessor a sum of Rs. 4,20,000/-, being equivalent to 10 months rent, as interest-free refundable security deposit.",
        attentionLevel: "high_attention",
        explanation: "Demanding 10 months' rent locks up significant capital without interest. The Model Tenancy Act, 2021 caps residential deposits at 2 months' rent.",
        hinglishExplanation: "10 mahine ka rent security deposit ke naam par lock karna bohot zyada hai. Model Tenancy Act ke hisaab se residential property par maximum 2 mahine ka deposit hona chahiye.",
        whyItMatters: "High upfront lock-in of Rs. 4.2 Lakhs creates liquidity strain and leaves you vulnerable to arbitrary withholding upon move-out.",
        statutoryRef: "Model Tenancy Act, 2021 (Section 11) & Consumer Protection Act 2019 Section 2(46)",
        suggestedAlternative: "The Lessee shall deposit an interest-free refundable security deposit equivalent to 2 (two) months' rent (Rs. 84,000/-), refundable in full within 7 banking days of peaceful handover.",
        negotiationTips: "Cite prevailing rental benchmarks and the Model Tenancy Act guideline to negotiate down to 2-3 months.",
        questionsForLawyer: [
          "Is the 10-month deposit legally enforceable if dispute arises in Bengaluru Small Causes Court?",
          "Can I insist on placing the deposit in an escrow or registered joint account?"
        ]
      },
      {
        id: "c-rent-4",
        clauseNumber: "Clause 4",
        title: "Mandatory 1-Month Painting Deduction",
        text: "Upon vacating the premises, irrespective of the physical condition or length of stay, the Lessor shall deduct an absolute and non-negotiable sum equal to 1 full month rent (Rs. 42,000/-) from the security deposit towards professional painting and deep cleaning.",
        attentionLevel: "legal_review_recommended",
        explanation: "Automatic deduction of an entire month's rent without assessing actual wear-and-tear or painting bills is an unfair contract term under consumer principles.",
        hinglishExplanation: "Bina actual damage ya painting bill dekhe seedha 1 mahine ka pura rent (₹42,000) kaat lena galat aur one-sided clause hai.",
        whyItMatters: "Even if you reside for only 6 months and keep the flat immaculate, you forfeit Rs. 42,000 automatically.",
        statutoryRef: "Transfer of Property Act, 1882 (Section 108) - Normal wear and tear excepted; CPA 2019 Sec 2(46)",
        suggestedAlternative: "Lessor may deduct actual painting costs only if walls suffer damage beyond normal wear and tear, supported by GST invoices from an independent vendor.",
        negotiationTips: "Offer to get the flat repainted yourself via Urban Company / licensed painters upon exit instead of automatic lump-sum forfeiture.",
        questionsForLawyer: [
          "Can normal wear-and-tear deductions be challenged in the Consumer Forum?",
          "Does paying this deduction waive other claims for deposit recovery?"
        ]
      },
      {
        id: "c-rent-5",
        clauseNumber: "Clause 5",
        title: "Unrestricted Lessor Right of Entry",
        text: "The Lessor or his authorized representative reserves the absolute right to inspect the premises at any hour of the day or night without prior notice to the Lessee.",
        attentionLevel: "high_attention",
        explanation: "Violates the tenant's right to quiet enjoyment and fundamental privacy under Article 21 (Puttaswamy). Tenancy law requires at least 24 hours prior written notice.",
        hinglishExplanation: "Makan malik bina kisi prior notice ke raat-din kabhi bhi flat mein nahi aa sakta. Yeh tenant ki privacy ka direct violation hai.",
        whyItMatters: "Direct intrusion on privacy and security of resident occupants.",
        statutoryRef: "Model Tenancy Act 2021, Section 15 (Mandatory 24-hr advance notice between 7 AM and 8 PM)",
        suggestedAlternative: "The Lessor may inspect the premises with minimum 24 hours prior written notice to the Lessee, during daytime hours (9:00 AM to 7:00 PM), in the presence of the Lessee.",
        negotiationTips: "Politely clarify that advance notice is standard practice for tenant privacy and mutual convenience.",
        questionsForLawyer: ["Does an unannounced entry constitute civil trespass under Indian law?"]
      },
      {
        id: "c-rent-7",
        clauseNumber: "Clause 7",
        title: "24-Hour Summary Eviction & 60-Day Deposit Hold",
        text: "The Lessor reserves the right to terminate this lease agreement by giving 24 hours written notice via WhatsApp or Email... Lessee shall vacate immediately without claiming any refund until 60 days after handover.",
        attentionLevel: "legal_review_recommended",
        explanation: "A 24-hour eviction notice is prima facie unconscionable. Indian tenancy statutes require minimum 30 days notice for termination of residential tenancies.",
        hinglishExplanation: "24 ghante mein ghar khali karne ka notice legal taur par invalid hai. Law ke mutabiq kam se kam 30 din ka written notice milna zaroori hai.",
        whyItMatters: "High risk of sudden homelessness with zero transition time and zero immediate refund.",
        statutoryRef: "Transfer of Property Act, 1882 (Section 106 - Minimum 15 to 30 days notice to quit)",
        suggestedAlternative: "Either party may terminate this agreement by giving 30 (thirty) days prior written notice. The security deposit shall be refunded upon peaceful handover.",
        negotiationTips: "Insist on reciprocal 30-day notice periods for both tenant and landlord.",
        questionsForLawyer: [
          "Can a landlord legally evict via police or lock change without a court decree?",
          "How to obtain an interim injunction if threatened with 24-hr eviction?"
        ]
      }
    ]
  },
  {
    id: "employment-it-bond",
    title: "IT Employment Agreement & Service Bond",
    category: "employment",
    badge: "Service Bond & Non-Compete",
    description: "Standard Indian IT services employment contract with 2-year post-exit non-compete, ₹2.5 Lakh service bond forfeiture, and 90-day unilateral notice period.",
    parties: {
      partyA: "Apex Technologies India Pvt. Ltd. (Employer)",
      partyB: "Mr. Rohan Verma (Employee / Software Engineer)"
    },
    rawText: `EMPLOYMENT AND TRAINING AGREEMENT

THIS AGREEMENT made at Pune on this 15th day of July, 2026 between Apex Technologies India Pvt. Ltd. (hereinafter "Company") and Mr. Rohan Verma (hereinafter "Employee").

1. POSITION AND DUTIES: The Employee shall serve as Senior Software Engineer and perform all duties assigned by the Company.

2. SERVICE BOND & TRAINING RECOVERY: The Employee agrees to serve the Company for a minimum period of 36 (thirty-six) months. If the Employee resigns or departs prior to the expiry of 36 months, the Employee shall immediately pay the Company a liquidated sum of Rs. 2,50,000/- (Rupees Two Lakhs Fifty Thousand only) as pre-estimated damages, and the Company shall withhold all experience certificates and final settlement till receipt.

3. POST-TERMINATION NON-COMPETE: For a period of 24 (twenty-four) months following the cessation of employment for any reason, the Employee shall not directly or indirectly work for, consult, advise, or engage with any entity operating in IT services, cloud computing, or software development anywhere in India or abroad.

4. INTELLECTUAL PROPERTY ASSIGNMENT: The Employee agrees that any code, invention, patent, copyright, or software created by the Employee during the term of employment, whether during office hours or on weekends/personal devices, shall be the sole and exclusive property of the Company.

5. TERMINATION AND NOTICE: The Company may terminate the Employee's service with 7 days notice or pay in lieu thereof. The Employee must provide minimum 90 (ninety) days notice, and the Company reserves the absolute discretion to reject buyout of notice period.

6. GOVERNING LAW & ARBITRATION: This agreement is governed by the laws of India. Any dispute shall be referred to a Sole Arbitrator appointed exclusively by the Managing Director of the Company.`,
    clauses: [
      {
        id: "c-emp-2",
        clauseNumber: "Clause 2",
        title: "Service Bond (Rs. 2.5 Lakh Liquidated Damages & Certificate Withholding)",
        text: "If the Employee resigns or departs prior to the expiry of 36 months, the Employee shall immediately pay the Company a liquidated sum of Rs. 2,50,000/-... and the Company shall withhold all experience certificates...",
        attentionLevel: "high_attention",
        explanation: "Service bonds are only enforceable if the employer can prove genuine, quantifiable expenditure on specialized overseas/technical training. Arbitrary penalties violate Section 74 of the Contract Act. Withholding experience certificates is unlawful.",
        hinglishExplanation: "Bina specific costly training ka saboot diye company arbitrary bond amount (₹2.5 Lakh) zabardasti nahi maang sakti. Aur experience letter rokna illegal practice hai.",
        whyItMatters: "Threat of certificate withholding and monetary penalty traps employees in unfavorable workplace conditions.",
        statutoryRef: "Indian Contract Act, 1872 (Section 74) & High Court rulings on release of service certificates",
        suggestedAlternative: "In the event of resignation prior to 12 months, Employee shall reimburse verifiable, non-routine specialized external training costs on pro-rata basis against documented receipts.",
        negotiationTips: "Request an explicit itemized annexure of any specialized training before agreeing to financial liability.",
        questionsForLawyer: [
          "Can an employer legally withhold my experience letter and Form 16 if I leave before 36 months?",
          "What is the burden of proof on the company to claim bond damages under Section 74?"
        ]
      },
      {
        id: "c-emp-3",
        clauseNumber: "Clause 3",
        title: "Post-Termination Non-Compete (24 Months)",
        text: "For a period of 24 months following the cessation of employment... the Employee shall not directly or indirectly work for, consult, advise, or engage with any entity operating in IT services anywhere in India...",
        attentionLevel: "legal_review_recommended",
        explanation: "Post-employment non-compete clauses are VOID and unenforceable in India under Section 27 of the Indian Contract Act, 1872. Indian courts repeatedly affirm that an individual cannot be restrained from earning a livelihood.",
        hinglishExplanation: "Job chhodne ke baad 2 saal tak competitor ke paas kaam na karne ki shart Indian law (Section 27) ke mutabiq VOID (khatam/invalid) hai. Company isko enforce nahi kar sakti.",
        whyItMatters: "Clauses like this create severe anxiety and intimidation, even though the Supreme Court (Percept D'Mark v. Zaheer Khan) has ruled them void.",
        statutoryRef: "Indian Contract Act, 1872 (Section 27) & Supreme Court of India: Percept D'Mark (2006) 4 SCC 227",
        suggestedAlternative: "During the active term of employment, the Employee shall not engage in competing business. Following termination, standard non-solicitation of clients and confidentiality obligations shall apply for 6 months.",
        negotiationTips: "Inform HR gently that post-employment non-competes are void under Section 27 and propose standard non-solicitation instead.",
        questionsForLawyer: [
          "Can the company obtain an interim injunction preventing me from joining a competitor in Bengaluru/Pune?",
          "How has the High Court treated similar non-compete claims in recent IT sector cases?"
        ]
      },
      {
        id: "c-emp-4",
        clauseNumber: "Clause 4",
        title: "Broad IP Assignment (Including Weekend / Personal Projects)",
        text: "...any code, invention, patent, copyright, or software created by the Employee... whether during office hours or on weekends/personal devices, shall be the sole and exclusive property of the Company.",
        attentionLevel: "high_attention",
        explanation: "Assigning ownership of software developed on personal devices during weekends outside company business is overbroad and claims rights beyond the scope of employment.",
        hinglishExplanation: "Aapke weekend ya personal time mein banaye gaye personal software par company apna haq nahi jata sakti jab tak company ke resources use na huye hon.",
        whyItMatters: "You surrender copyright over personal side projects, open-source contributions, or startup ideas created on personal time.",
        statutoryRef: "Copyright Act, 1957 (Section 17 - First owner of copyright in course of employment)",
        suggestedAlternative: "Company shall own IP created specifically in the course of employment utilizing Company equipment and relating directly to Company business.",
        negotiationTips: "Carve out pre-existing personal projects and side endeavors via an explicit schedule.",
        questionsForLawyer: ["Does Section 17 of Copyright Act protect code created on personal laptops?"]
      },
      {
        id: "c-emp-6",
        clauseNumber: "Clause 6",
        title: "Unilateral Appointment of Sole Arbitrator",
        text: "Any dispute shall be referred to a Sole Arbitrator appointed exclusively by the Managing Director of the Company.",
        attentionLevel: "legal_review_recommended",
        explanation: "Unilateral appointment of a sole arbitrator by one interested party is invalid ab initio under the Arbitration & Conciliation Act as ruled by the Supreme Court in Perkins Eastman (2020).",
        hinglishExplanation: "Arbitrator ko sirf company ka Managing Director appoint karega, yeh shart Supreme Court ke 'Perkins Eastman' judgment ke hisaab se invalid hai.",
        whyItMatters: "Biased arbitration proceedings in the company's favor.",
        statutoryRef: "Arbitration & Conciliation Act 1996, Section 12(5); Perkins Eastman (2020) 20 SCC 760",
        suggestedAlternative: "Arbitration by a sole arbitrator mutually agreed upon by both parties, or appointed in accordance with Section 11 of the Arbitration & Conciliation Act.",
        negotiationTips: "Propose mutual consent for arbitrator appointment.",
        questionsForLawyer: ["Can a unilaterally appointed arbitrator's award be challenged under Section 34?"]
      }
    ]
  },
  {
    id: "freelance-consultant",
    title: "Freelance Consultant & Vendor Agreement",
    category: "freelance",
    badge: "Consultancy Contract",
    description: "Consultancy agreement containing 90-day payment deferral, unlimited indemnification, and unilateral IP transfer without full compensation.",
    parties: {
      partyA: "Nexus Brands Digital LLP (Client)",
      partyB: "Arjun Nair (Independent Design Consultant)"
    },
    rawText: `INDEPENDENT CONTRACTOR AGREEMENT

This Agreement is entered into on 10th May 2026 by Nexus Brands Digital LLP ("Client") and Arjun Nair ("Consultant").

1. SCOPE: Consultant shall deliver UI/UX design mockups and design systems.
2. PAYMENT TERMS: Client shall pay fees within 90 days of receipt of undisputed invoice. Client reserves right to hold payment if client's end-client delays release.
3. INDEMNITY: Consultant shall indemnify, defend, and hold harmless Client against any and all claims, damages, losses, or legal fees without any financial cap.
4. IP ASSIGNMENT: All designs transfer to Client immediately upon creation, irrespective of whether payments are cleared.`,
    clauses: [
      {
        id: "c-free-2",
        clauseNumber: "Clause 2",
        title: "90-Day Payment Terms & Pay-When-Paid Clause",
        text: "Client shall pay fees within 90 days of receipt of undisputed invoice. Client reserves right to hold payment if client's end-client delays release.",
        attentionLevel: "high_attention",
        explanation: "90-day payment terms create severe cashflow risk. For MSME registered entities, Section 15 of the MSMED Act mandates payment within maximum 45 days.",
        hinglishExplanation: "90 din ka payment delay aur 'end-client paisa dega tab denge' wali shart MSME Act ke khilaaf hai. MSME mein maximum 45 days ka rule hai.",
        whyItMatters: "You carry client's commercial risk without timely compensation.",
        statutoryRef: "MSMED Act, 2006 (Section 15 & 16 - Mandatory payment within 45 days with 3x bank rate interest)",
        suggestedAlternative: "Payment shall be made within 15 days of invoice date. Late payments shall attract interest at 1.5% per month.",
        negotiationTips: "Mention your MSME Udyam registration to mandate 45-day payment statutory protection.",
        questionsForLawyer: ["How to file a claim on MSME Samadhaan portal for delayed freelance invoices?"]
      }
    ]
  },
  {
    id: "ecommerce-terms",
    title: "E-Commerce Platform Seller & Consumer Terms",
    category: "consumer",
    badge: "Digital Terms & DPDPA",
    description: "Online marketplace terms featuring unilateral fee changes, mandatory waiver of consumer court access, and broad data sharing.",
    parties: {
      partyA: "ZippoCart Marketplace India Pvt. Ltd.",
      partyB: "Registered User / Merchant"
    },
    rawText: `TERMS OF USE & PRIVACY POLICY

1. MODIFICATION: ZippoCart may modify terms, commission rates, or penalties at any time without notice. Continued use constitutes acceptance.
2. DATA PROCESSING: User grants irrevocable license to collect, process, and share personal and transaction data with third-party commercial partners globally.
3. WAIVER OF JURISDICTION: Users agree to resolve disputes solely through internal portal support and waive right to initiate proceedings in Consumer Commissions.`,
    clauses: [
      {
        id: "c-ecom-3",
        clauseNumber: "Clause 3",
        title: "Waiver of Consumer Commission Jurisdiction",
        text: "Users agree to resolve disputes solely through internal portal support and waive right to initiate proceedings in Consumer Commissions.",
        attentionLevel: "legal_review_recommended",
        explanation: "Section 28 of the Indian Contract Act states agreements restraining legal proceedings are void. Statutory consumer protection rights cannot be contracted out of.",
        hinglishExplanation: "Consumer court jaane ka adhikar koi bhi contract nahi chheen sakta. Section 28 Contract Act ke mutabiq yeh clause VOID hai.",
        whyItMatters: "Users mistakenly believe they surrendered their right to approach Consumer Commission.",
        statutoryRef: "Indian Contract Act, 1872 (Section 28) & Consumer Protection Act 2019",
        suggestedAlternative: "Disputes may first be submitted to internal grievance redressal. If unresolved, consumer retains full rights to approach competent Consumer Commissions.",
        negotiationTips: "Standard consumer terms are non-negotiable but statutory rights remain intact.",
        questionsForLawyer: ["Can a consumer file on e-Daakhil despite signing this waiver?"]
      }
    ]
  }
];
