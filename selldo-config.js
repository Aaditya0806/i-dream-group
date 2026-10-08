/* ============================================================
   Sell.do CRM configuration — iDream Properties
   ------------------------------------------------------------
   Every website enquiry (contact form, project forms, the Enquire
   popup and the callback popup) is pushed to Sell.do CRM using the
   values below. The Sell.do tracking script is also loaded on every
   page (see the <script> before </head>).

   • apiKey — your Sell.do lead-create API key.
   • srd    — default SRD tag for these leads. Leave "" until Sell.do
              sends you SRDs. For campaign leads, ask Sell.do to create
              an SRD (Campaign name / Source / Sub-source) and paste it
              here, or pass it per-campaign via the ?srd= URL parameter.
   ============================================================ */
window.IDREAM_SELLDO = {
  apiKey: "6697cd39978abc537c756cd63cb4e469",
  srd: ""
};
