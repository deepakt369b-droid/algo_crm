export default function PrivacyPolicyPage() {
  return (
    <div className="py-24 px-6 max-w-4xl mx-auto prose dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p>Last updated: October 2023</p>
      
      <h2>1. Information We Collect</h2>
      <p>We collect information that you provide directly to us when you register for an account, create or modify your profile, use our services, request customer support, or otherwise communicate with us. This information may include:</p>
      <ul>
        <li>Name, email address, and contact information.</li>
        <li>Billing and payment information.</li>
        <li>Data you upload or sync from third-party services (e.g., WhatsApp, Email).</li>
      </ul>

      <h2>2. How We Use Information</h2>
      <p>We use the information we collect to provide, maintain, and improve our services, including to:</p>
      <ul>
        <li>Process transactions and send related information.</li>
        <li>Send technical notices, updates, security alerts, and support messages.</li>
        <li>Respond to your comments, questions, and requests.</li>
      </ul>

      <h2>3. Data Security</h2>
      <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>

      <h2>4. Multi-Tenant Data Isolation</h2>
      <p>Your workspace data is strictly isolated from other tenants. We employ robust database-level isolation policies to ensure cross-tenant data access is impossible under standard operation.</p>
    </div>
  );
}
