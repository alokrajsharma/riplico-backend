import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API || process.env.OPENAI_API_KEY || "default_key"
});

export async function generateRentalAgreement(data: {
  agreement_date: string;
  agreement_location: string;
  landlord_name: string;
  landlord_pan: string;
  landlord_address: string;
  tenant_name: string;
  tenant_aadhaar: string;
  tenant_address: string;
  property_address: string;
  tenancy_months: number;
  lease_start: string;
  lease_end: string;
  monthly_rent: number;
  security_deposit: number;
  rent_payment_date: number;
  maintenance_included: boolean;
  special_clauses?: string;
}): Promise<string> {
  const prompt = `Generate a comprehensive rental agreement under Indian law with the following details:

CRITICAL FORMATTING REQUIREMENTS:
- Use ONLY plain text formatting 
- NO markdown symbols (**, __, *, etc.)
- NO HTML tags (<strong>, <b>, etc.)
- Use CAPITAL LETTERS for emphasis and section headers
- Use proper indentation and numbering for clauses
- Professional legal document format only

Agreement Date: ${data.agreement_date}
Agreement Location: ${data.agreement_location}

LANDLORD: ${data.landlord_name}, PAN: ${data.landlord_pan}, Address: ${data.landlord_address}
TENANT: ${data.tenant_name}, Aadhaar: ${data.tenant_aadhaar}, Address: ${data.tenant_address}

Property: ${data.property_address}
Term: ${data.tenancy_months} months (${data.lease_start} to ${data.lease_end})
Monthly Rent: Rs. ${data.monthly_rent}
Security Deposit: Rs. ${data.security_deposit}
Payment Date: ${data.rent_payment_date} of each month
Maintenance: ${data.maintenance_included ? "Included in rent" : "Tenant responsible"}
Special Clauses: ${data.special_clauses || "None"}

Create a professional rental agreement following Indian legal standards. Use plain text formatting with proper legal structure, clear numbering, and appropriate use of capital letters for emphasis. Include all essential clauses for Indian rental agreements.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
    });

    return response.choices[0].message.content || "Error generating agreement";
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    
    // Fallback demo content when API quota is exceeded
    if (error.code === 'insufficient_quota' || error.status === 429) {
      return generateDemoAgreement(data);
    }
    
    throw new Error("Failed to generate agreement. Please try again.");
  }
}

function generateDemoAgreement(data: {
  agreement_date: string;
  agreement_location: string;
  landlord_name: string;
  landlord_pan: string;
  landlord_address: string;
  tenant_name: string;
  tenant_aadhaar: string;
  tenant_address: string;
  property_address: string;
  tenancy_months: number;
  lease_start: string;
  lease_end: string;
  monthly_rent: number;
  security_deposit: number;
  rent_payment_date: number;
  maintenance_included: boolean;
  special_clauses?: string;
}): string {
  const rentInWords = numberToWords(data.monthly_rent);
  const depositInWords = numberToWords(data.security_deposit);
  
  return `                                RENTAL AGREEMENT

This Rental Agreement is made on ${data.agreement_date} at ${data.agreement_location} between:

LANDLORD (First Party):
Name: ${data.landlord_name}
PAN Number: ${data.landlord_pan}
Address: ${data.landlord_address}

TENANT (Second Party):
Name: ${data.tenant_name}
Aadhaar Number: ${data.tenant_aadhaar}
Address: ${data.tenant_address}

WHEREAS

The said LANDLORD is sole and absolute owner of the Property: ${data.property_address} (hereinafter referred as "PROPERTY"), and the above said TENANT has contacted the LANDLORD to take the property on rent and the LANDLORD has agreed to let out the Property to the above TENANT on the below-given terms and conditions.

NOW, THIS DEED FURTHER WITNESSETH AND AGREED BY AND BETWEEN THE SAID PARTIES AS FOLLOWS:

1. TERM OF TENANCY:
   The term of this agreement shall be for ${data.tenancy_months} months, commencing from ${data.lease_start} and ending on ${data.lease_end}.

2. RENT AND SECURITY DEPOSIT:
   a. The monthly rent for the property is Rs. ${data.monthly_rent.toLocaleString('en-IN')} (${rentInWords} Rupees only) per month.
   b. The tenant agrees to pay the monthly rent on or before ${data.rent_payment_date}${getOrdinalSuffix(data.rent_payment_date)} day of each month.
   c. A security deposit of Rs. ${data.security_deposit.toLocaleString('en-IN')} (${depositInWords} Rupees only) has been paid by the tenant to the landlord and this amount will carry no interest. The security deposit shall be refunded at the end of the tenancy period, subject to deductions for any damages or outstanding dues.

3. UTILITIES AND MAINTENANCE:
   a. The tenant will be responsible for paying utility bills including electricity, water, gas, and any other applicable charges.
   b. ${data.maintenance_included ? 'Society Maintenance charges if any, are included in the monthly rent paid by the Tenant.' : 'Society maintenance charges shall be borne by the tenant separately.'}
   c. The tenant shall maintain the property in good condition and shall be responsible for any damages caused beyond normal wear and tear.
   d. The landlord shall be responsible for regular maintenance and repairs, including plumbing, electrical, and structural maintenance.

4. USE OF PROPERTY:
   a. The property shall be used solely for residential purposes by the tenant.
   b. Subletting, assigning, or transferring the property to any third party, in whole or in part, without the prior written consent of the landlord is strictly prohibited.

5. TERMINATION AND NOTICE:
   a. Either party may terminate this agreement by providing 30 days written notice to the other party.
   b. Upon termination, the tenant shall return the property in the same condition as at the beginning of the tenancy, minus normal wear and tear.

6. ADDITIONAL TERMS:
   a. The tenant shall promptly inform the landlord of any necessary repairs or maintenance issues.
   b. The landlord has the right to enter the property with prior notice to inspect its condition or make repairs.
   c. Failure to make regular rent payments or violation of terms can result in eviction.
   d. All notices and communications shall be in writing and shall be deemed properly delivered if sent via registered post.

${data.special_clauses ? `7. SPECIAL CLAUSES:\n   ${data.special_clauses}\n\n` : ''}

In Witness Whereof, the Parties hereto have set their hands and signatures on the date and year first above mentioned.


LANDLORD SIGNATURE:                           TENANT SIGNATURE:

_____________________                         _____________________
${data.landlord_name}                           ${data.tenant_name}
PAN: ${data.landlord_pan}                       Aadhaar: ${data.tenant_aadhaar}


Generated by Riplico Legal AI Platform on ${new Date().toLocaleDateString('en-IN')}`;
}

function numberToWords(num: number): string {
  // Simple number to words conversion for Indian format
  if (num === 0) return "Zero";
  
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
  if (num < 10) return units[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + units[num % 10] : "");
  if (num < 1000) return units[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + numberToWords(num % 100) : "");
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + numberToWords(num % 1000) : "");
  if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + numberToWords(num % 100000) : "");
  
  return num.toLocaleString('en-IN');
}

function getOrdinalSuffix(num: number): string {
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return "th";
  if (lastDigit === 1) return "st";
  if (lastDigit === 2) return "nd";
  if (lastDigit === 3) return "rd";
  return "th";
}