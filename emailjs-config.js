/* ============================================================
   EmailJS configuration — iDream Properties enquiry forms
   ------------------------------------------------------------
   1. Create a free account at https://www.emailjs.com
   2. Add an Email Service      -> copy its SERVICE ID
   3. Create an Email Template  -> copy its TEMPLATE ID
      In the template, use these variables (they match the form field names):
        {{name}}  {{email}}  {{phone}}  {{message}}  {{consent}}  {{page_source}}
      Set the template "To email" to the address that should receive enquiries.
   4. Account -> General -> copy your PUBLIC KEY
   5. Paste all three values below and save. That's it — the forms will send.
   ============================================================ */
window.IDREAM_EMAILJS = {
  publicKey:  "YOUR_PUBLIC_KEY",
  serviceId:  "YOUR_SERVICE_ID",
  templateId: "YOUR_TEMPLATE_ID"
};
