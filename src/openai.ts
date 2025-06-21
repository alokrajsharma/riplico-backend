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

Agreement Date: ${data.agreement_date}
Agreement Location: ${data.agreement_location}

LANDLORD: ${data.landlord_name}, PAN: ${data.landlord_pan}, Address: ${data.landlord_address}
TENANT: ${data.tenant_name}, Aadhaar: ${data.tenant_aadhaar}, Address: ${data.tenant_address}

Property: ${data.property_address}
Term: ${data.tenancy_months} months (${data.lease_start} to ${data.lease_end})
Monthly Rent: ₹${data.monthly_rent}
Security Deposit: ₹${data.security_deposit}
Payment Date: ${data.rent_payment_date} of each month
Maintenance: ${data.maintenance_included ? "Included in rent" : "Tenant responsible"}
Special Clauses: ${data.special_clauses || "None"}

Create a professional rental agreement following Indian legal standards with all standard clauses including term of tenancy, rent and security deposit, utilities and maintenance, use of property, termination and notice, repairs and alterations, entry and inspection, default and eviction, use of premises, furnishings and appliances, renewal, maintenance charges, notice of absence, dispute resolution, force majeure, indemnity, and notices. Format with proper legal language and structure.`;

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
  
  return `
<h2 style="text-align: center; color: #1a365d; margin-bottom: 30px; text-transform: uppercase; font-weight: bold; border-bottom: 2px solid #1a365d; padding-bottom: 10px;">RENT AGREEMENT</h2>

<p style="margin-bottom: 15px; text-align: justify;">This rent agreement ("Agreement") is made on ${new Date(data.agreement_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} at ${data.agreement_location}</p>

<p style="margin-bottom: 15px; font-weight: bold;">BETWEEN:</p>
<p style="margin-bottom: 10px; font-weight: bold;">LANDLORD(s)</p>
<p style="margin-bottom: 15px; text-align: justify;">${data.landlord_name} having PAN Number: ${data.landlord_pan}, resident of ${data.landlord_address}...(hereinafter referred to as the "LANDLORD") which expression shall, unless repugnant to the context, mean and include his heirs, executors, and permitted assigns.</p>

<p style="margin-bottom: 10px; font-weight: bold;">AND:</p>
<p style="margin-bottom: 10px; font-weight: bold;">TENANT(s)</p>
<p style="margin-bottom: 15px; text-align: justify;">${data.tenant_name} having Aadhaar Number: ${data.tenant_aadhaar}, resident of ${data.tenant_address}...(hereinafter referred to as the "TENANT") which expression shall, unless repugnant to the context, mean and include his heirs, executors, and permitted assigns.</p>

<p style="margin-bottom: 15px; font-weight: bold;">WHEREAS</p>
<p style="margin-bottom: 15px; text-align: justify;">The said LANDLORD(s) is sole and absolute (Landlord/Landlady) of the Property: ${data.property_address} (hereinafter referred as "PROPERTY"), and the above said TENANT(s) has contacted the LANDLORD(s) to take the property on rent and the LANDLORD(s) has agreed to let out the Property to the above TENANT(s) on the below-given terms and conditions.</p>

<p style="margin-bottom: 20px; font-weight: bold;">NOW, THIS DEED FURTHER WITNESSETH AND AGREED BY AND BETWEEN THE SAID PARTIES AS FOLLOWS:</p>

<div style="margin-bottom: 20px;">
  <p style="font-weight: bold; margin-bottom: 10px;">1. Term of Tenancy:</p>
  <p style="margin-left: 20px; text-align: justify;">The term of this agreement shall be for ${data.tenancy_months} months, commencing from ${data.lease_start} and ending on ${data.lease_end}.</p>
</div>

<div style="margin-bottom: 20px;">
  <p style="font-weight: bold; margin-bottom: 10px;">2. Rent and Security Deposit:</p>
  <div style="margin-left: 20px;">
    <p style="margin-bottom: 8px;"><strong>a.</strong> The monthly rent for the property is <strong>₹${data.monthly_rent.toLocaleString('en-IN')} (${rentInWords} Rupees only)</strong> per month.</p>
    <p style="margin-bottom: 8px;"><strong>b.</strong> The tenant agrees to pay the monthly rent on or before <strong>${data.rent_payment_date}${getOrdinalSuffix(data.rent_payment_date)} day</strong> of each month.</p>
    <p style="margin-bottom: 8px; text-align: justify;"><strong>c.</strong> A security deposit of <strong>₹${data.security_deposit.toLocaleString('en-IN')} (${depositInWords} Rupees only)</strong> has been paid by the tenant to the landlord and this amount will carry no interest. The security deposit shall be refunded at the end of the tenancy period, subject to deductions for any damages or outstanding dues.</p>
  </div>
</div>

<div style="margin-bottom: 20px;">
  <p style="font-weight: bold; margin-bottom: 10px;">3. Utilities and Maintenance:</p>
  <div style="margin-left: 20px;">
    <p style="margin-bottom: 8px; text-align: justify;"><strong>a.</strong> The tenant will be responsible for paying utility bills including electricity, water, gas, and any other applicable charges.</p>
    <p style="margin-bottom: 8px;"><strong>b.</strong> ${data.maintenance_included ? 'Society Maintenance charges if any, are included in the monthly rent paid by the Tenant.' : 'Society maintenance charges shall be borne by the tenant separately.'}</p>
    <p style="margin-bottom: 8px; text-align: justify;"><strong>c.</strong> The tenant shall maintain the property in good condition and shall be responsible for any damages caused beyond normal wear and tear.</p>
    <p style="margin-bottom: 8px; text-align: justify;"><strong>d.</strong> The landlord shall be responsible for regular maintenance and repairs, including plumbing, electrical, and structural maintenance.</p>
  </div>
</div>

<div style="margin-bottom: 20px;">
  <p style="font-weight: bold; margin-bottom: 10px;">4. Use of Property:</p>
  <div style="margin-left: 20px;">
    <p style="margin-bottom: 8px;"><strong>a.</strong> The property shall be used solely for residential purposes by the tenant.</p>
    <p style="margin-bottom: 8px; text-align: justify;"><strong>b.</strong> Subletting, assigning, or transferring the property to any third party, in whole or in part, without the prior written consent of the landlord is strictly prohibited. Any subletting or assignment requires the landlord's explicit written approval.</p>
  </div>
</div>

<div style="margin-bottom: 20px;">
  <p style="font-weight: bold; margin-bottom: 10px;">5. Termination and Notice:</p>
  <div style="margin-left: 20px;">
    <p style="margin-bottom: 8px; text-align: justify;"><strong>a.</strong> Either party may terminate this agreement by providing 30 days written notice to the other party through any suitable channel.</p>
    <p style="margin-bottom: 8px; text-align: justify;"><strong>b.</strong> Upon termination, the tenant shall return the property in the same condition as at the beginning of the tenancy, minus normal wear and tear.</p>
  </div>
</div>

<div style="margin-bottom: 20px;">
  <p style="font-weight: bold; margin-bottom: 10px;">6. Additional Terms:</p>
  <div style="margin-left: 20px;">
    <p style="margin-bottom: 8px; text-align: justify;"><strong>a.</strong> The tenant shall promptly inform the landlord of any necessary repairs or maintenance issues.</p>
    <p style="margin-bottom: 8px; text-align: justify;"><strong>b.</strong> The landlord has the right to enter the property with prior notice to inspect its condition or make repairs.</p>
    <p style="margin-bottom: 8px; text-align: justify;"><strong>c.</strong> Failure to make regular rent payments or violation of terms can result in eviction.</p>
    <p style="margin-bottom: 8px; text-align: justify;"><strong>d.</strong> All notices and communications shall be in writing and shall be deemed properly delivered if sent via registered post.</p>
  </div>
</div>

${data.special_clauses ? `<div style="margin-bottom: 20px;"><p style="font-weight: bold; margin-bottom: 10px;">7. Special Clauses:</p><div style="margin-left: 20px;"><p style="text-align: justify;">${data.special_clauses}</p></div></div>` : ''}

<p style="margin: 30px 0 40px 0; text-align: justify;">In Witness Whereof, the Parties hereto have set their hands and signatures on the date and year first above mentioned.</p>

<div style="margin-top: 50px;">
  <p style="font-weight: bold; margin-bottom: 15px;">Landlord(s) Signatures</p>
  <div style="border: 2px solid #000; padding: 20px; margin-bottom: 30px; min-height: 120px; position: relative;">
    <div style="position: absolute; top: 10px; left: 10px; background: #fff9c4; padding: 8px 15px; font-weight: bold; border: 1px solid #ddd;">LandlordSign</div>
    <div style="position: absolute; bottom: 10px; left: 10px; font-weight: bold;">
      ${data.landlord_name} resident of ${data.landlord_address.split(',')[0]}, having PAN Number: ${data.landlord_pan}
    </div>
  </div>
  
  <p style="font-weight: bold; margin-bottom: 15px;">Tenant(s) Signatures</p>
  <div style="border: 2px solid #000; padding: 20px; margin-bottom: 30px; min-height: 120px; position: relative;">
    <div style="position: absolute; top: 10px; left: 10px; background: #fff9c4; padding: 8px 15px; font-weight: bold; border: 1px solid #ddd;">TenantSign</div>
    <div style="position: absolute; bottom: 10px; left: 10px; font-weight: bold;">
      ${data.tenant_name} resident of ${data.tenant_address.split(',')[0]}, having Aadhaar Number: ${data.tenant_aadhaar}
    </div>
  </div>
</div>

<p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
<em>Generated by Riplico Legal AI Platform on ${new Date().toLocaleDateString('en-IN')}</em>
</p>
  `.trim();
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