/**
 * Indian Real Estate Financial & Taxation Calculations (Maharashtra & Nagpur NMC focus)
 */

export interface LoanParams {
  propertyPriceInLakhs: number; // e.g. 75.0 (for ₹75 Lakh)
  downPaymentPercent: number;    // e.g. 20 (for 20%)
  interestRateAnnual: number;    // e.g. 8.5 (for 8.5% p.a.)
  tenureYears: number;           // e.g. 20 (for 20 years)
  isWomanBuyer?: boolean;        // Maharashtra 1% concession on stamp duty
  isUnderConstruction?: boolean; // Determines GST liability
  isAffordableHousing?: boolean; // <= 45L qualifies for 1% GST if under-construction
}

export interface FinancialBreakdown {
  // Base numbers
  propertyPriceInr: number;
  propertyPriceInLakhs: number;

  // Government Taxes & Statutory Fees (Maharashtra / Nagpur)
  stampDutyPercent: number;
  stampDutyInr: number;
  registrationFeeInr: number; // 1% capped at ₹30,000 max in Maharashtra
  gstPercent: number;
  gstInr: number;             // 0% for Ready-to-move, 1% affordable, 5% standard
  legalAndIncidentalInr: number; // Standard documentation & legal vetting (est. ₹15,000)

  // Net Deal Outlay ("On-Road" Cost)
  totalTaxesAndFeesInr: number;
  netOnRoadPriceInr: number;
  taxImpactPercent: number;   // Total taxes as % of property base price

  // Financing & Loan
  downPaymentPercent: number;
  downPaymentInr: number;
  totalInitialCashRequiredInr: number; // Down payment + all statutory taxes/fees
  loanAmountInr: number;

  // EMI Breakdown
  monthlyEmiInr: number;
  totalTenureMonths: number;
  totalRepaymentInr: number;
  totalInterestPayableInr: number;
  interestToPrincipalRatio: number; // Total interest as % of principal
}

/**
 * Computes exact monthly EMI using standard reducing-balance amortization formula:
 * EMI = [P x r x (1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMonthlyEmi(
  principal: number,
  annualInterestRate: number,
  tenureYears: number
): number {
  if (principal <= 0) return 0;
  if (annualInterestRate <= 0) return Math.round(principal / (tenureYears * 12));

  const monthlyRate = annualInterestRate / 12 / 100;
  const totalMonths = tenureYears * 12;

  const factor = Math.pow(1 + monthlyRate, totalMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);

  return Math.round(emi);
}

/**
 * Calculates complete Indian real estate financial breakdown for a property
 */
export function calculateFinancialBreakdown(params: LoanParams): FinancialBreakdown {
  const propertyPriceInr = Math.round(params.propertyPriceInLakhs * 100000);

  // 1. Stamp Duty: In Nagpur (Maharashtra), standard is 6% (5% Stamp Duty + 1% Metro Cess / Local Body Tax)
  // Women buyers get 1% concession (5%)
  const stampDutyPercent = params.isWomanBuyer ? 5.0 : 6.0;
  const stampDutyInr = Math.round((propertyPriceInr * stampDutyPercent) / 100);

  // 2. Registration Fee: 1% of agreement value, statutory cap is ₹30,000 in Maharashtra
  const rawRegistration = Math.round(propertyPriceInr * 0.01);
  const registrationFeeInr = Math.min(rawRegistration, 30000);

  // 3. GST:
  // - Ready to Move with Completion Certificate (CC/OC): 0%
  // - Under-construction: 1% for affordable (<= 45L), 5% for non-affordable (> 45L)
  let gstPercent = 0;
  if (params.isUnderConstruction) {
    gstPercent = params.propertyPriceInLakhs <= 45 || params.isAffordableHousing ? 1.0 : 5.0;
  }
  const gstInr = Math.round((propertyPriceInr * gstPercent) / 100);

  // 4. Legal, Drafting & Search Report: Standard ₹15,000
  const legalAndIncidentalInr = 15000;

  // 5. Total Statutory Charges
  const totalTaxesAndFeesInr = stampDutyInr + registrationFeeInr + gstInr + legalAndIncidentalInr;
  const netOnRoadPriceInr = propertyPriceInr + totalTaxesAndFeesInr;
  const taxImpactPercent = Number(((totalTaxesAndFeesInr / propertyPriceInr) * 100).toFixed(1));

  // 6. Down Payment & Loan
  const downPaymentInr = Math.round((propertyPriceInr * params.downPaymentPercent) / 100);
  const loanAmountInr = propertyPriceInr - downPaymentInr;

  // Total Initial Cash Needed = Downpayment + All Govt Charges (since banks only finance agreement base)
  const totalInitialCashRequiredInr = downPaymentInr + totalTaxesAndFeesInr;

  // 7. Loan EMI
  const totalTenureMonths = params.tenureYears * 12;
  const monthlyEmiInr = calculateMonthlyEmi(loanAmountInr, params.interestRateAnnual, params.tenureYears);
  const totalRepaymentInr = monthlyEmiInr * totalTenureMonths;
  const totalInterestPayableInr = Math.max(0, totalRepaymentInr - loanAmountInr);
  const interestToPrincipalRatio = loanAmountInr > 0 ? Number(((totalInterestPayableInr / loanAmountInr) * 100).toFixed(1)) : 0;

  return {
    propertyPriceInr,
    propertyPriceInLakhs: params.propertyPriceInLakhs,
    stampDutyPercent,
    stampDutyInr,
    registrationFeeInr,
    gstPercent,
    gstInr,
    legalAndIncidentalInr,
    totalTaxesAndFeesInr,
    netOnRoadPriceInr,
    taxImpactPercent,
    downPaymentPercent: params.downPaymentPercent,
    downPaymentInr,
    totalInitialCashRequiredInr,
    loanAmountInr,
    monthlyEmiInr,
    totalTenureMonths,
    totalRepaymentInr,
    totalInterestPayableInr,
    interestToPrincipalRatio,
  };
}

/**
 * Formats INR with Indian grouping system: ₹XX,XX,XXX
 */
export function formatInr(amount: number): string {
  if (isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Formats Lakhs or Crores nicely
 */
export function formatIndianDenomination(amountInr: number): string {
  if (amountInr >= 10000000) {
    const cr = amountInr / 10000000;
    return `₹${cr.toFixed(2)} Cr`;
  }
  if (amountInr >= 100000) {
    const l = amountInr / 100000;
    return `₹${l.toFixed(2)} L`;
  }
  return formatInr(amountInr);
}

// Alias for convenience
export const calculatePropertyFinancials = calculateFinancialBreakdown;

