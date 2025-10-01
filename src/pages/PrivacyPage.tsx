import { ScrollArea } from "@/components/ui/scroll-area"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import rocLogo from "@/assets/roc-logo.png"

const PrivacyPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </button>
            <img src={rocLogo} alt="ROC" className="h-8 w-auto" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Aviso de Privacidad</h1>
            <p className="text-sm text-muted-foreground">Última actualización: 1 de enero de 2025</p>
          </div>

          <ScrollArea className="max-h-[calc(100vh-200px)]">
            <div className="prose prose-sm max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
                <p className="mb-4">
                  At ROC, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Notice explains how we collect, use, disclose, and safeguard your information when you use our platform and services. By using ROC, you consent to the data practices described in this notice.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
                
                <h3 className="text-lg font-medium mb-3">2.1 Personal Information You Provide</h3>
                <div className="space-y-3 mb-4">
                  <p>When you create an account or use our services, we may collect:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Contact Information:</strong> Name, email address, phone number, mailing address</li>
                    <li><strong>Account Information:</strong> Username, password, profile picture</li>
                    <li><strong>Identity Verification:</strong> Government-issued ID, date of birth, social security number (when required)</li>
                    <li><strong>Financial Information:</strong> Payment method details, billing address, transaction history</li>
                    <li><strong>Property Information:</strong> Rental history, income verification, employment details</li>
                    <li><strong>Communication Data:</strong> Messages, reviews, support inquiries</li>
                  </ul>
                </div>

                <h3 className="text-lg font-medium mb-3">2.2 Information We Collect Automatically</h3>
                <div className="space-y-3 mb-4">
                  <p>When you use our platform, we automatically collect:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                    <li><strong>Usage Data:</strong> Pages visited, time spent, search queries, click patterns</li>
                    <li><strong>Location Data:</strong> Approximate location based on IP address, precise location (with permission)</li>
                    <li><strong>Cookies and Tracking:</strong> Session cookies, preference cookies, analytics cookies</li>
                  </ul>
                </div>

                <h3 className="text-lg font-medium mb-3">2.3 Information from Third Parties</h3>
                <div className="space-y-3">
                  <p>We may receive information from:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Social media platforms (when you connect your accounts)</li>
                    <li>Payment processors and financial institutions</li>
                    <li>Background check and verification services</li>
                    <li>Property owners and managers</li>
                    <li>Marketing partners and analytics providers</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
                <div className="space-y-3">
                  <p>We use your information to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Provide Services:</strong> Create accounts, process applications, facilitate communications</li>
                    <li><strong>Improve Platform:</strong> Analyze usage patterns, develop new features, enhance user experience</li>
                    <li><strong>Safety and Security:</strong> Verify identities, prevent fraud, ensure platform safety</li>
                    <li><strong>Communication:</strong> Send notifications, updates, marketing communications (with consent)</li>
                    <li><strong>Legal Compliance:</strong> Meet regulatory requirements, respond to legal requests</li>
                    <li><strong>Business Operations:</strong> Analytics, research, customer support</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
                
                <h3 className="text-lg font-medium mb-3">4.1 With Your Consent</h3>
                <p className="mb-4">
                  We share your information when you explicitly consent, such as when connecting with property owners or sharing your profile with potential roommates.
                </p>

                <h3 className="text-lg font-medium mb-3">4.2 Service Providers</h3>
                <p className="mb-4">
                  We work with trusted third-party service providers who help us operate our platform, including payment processors, background check services, cloud storage providers, and analytics companies.
                </p>

                <h3 className="text-lg font-medium mb-3">4.3 Legal Requirements</h3>
                <p className="mb-4">
                  We may disclose your information when required by law, to protect our rights, prevent fraud, or ensure user safety.
                </p>

                <h3 className="text-lg font-medium mb-3">4.4 Business Transfers</h3>
                <p className="mb-4">
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">5. Data Security</h2>
                <div className="space-y-3">
                  <p>We implement comprehensive security measures to protect your information:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Encryption:</strong> Data is encrypted in transit and at rest</li>
                    <li><strong>Access Controls:</strong> Limited access on a need-to-know basis</li>
                    <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
                    <li><strong>Secure Infrastructure:</strong> Industry-standard hosting and database security</li>
                    <li><strong>Employee Training:</strong> Regular privacy and security training for staff</li>
                  </ul>
                  <p className="mt-4">
                    While we strive to protect your information, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security but are committed to using industry best practices.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">6. Your Privacy Rights</h2>
                <div className="space-y-3">
                  <p>Depending on your location, you may have the following rights:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Access:</strong> Request a copy of your personal information</li>
                    <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                    <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                    <li><strong>Portability:</strong> Receive your data in a portable format</li>
                    <li><strong>Restriction:</strong> Limit how we process your information</li>
                    <li><strong>Objection:</strong> Object to certain types of processing</li>
                    <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  </ul>
                  <p className="mt-4">
                    To exercise these rights, please contact us at privacy@roc.space. We will respond to your request within the timeframe required by applicable law.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">7. Cookies and Tracking Technologies</h2>
                <div className="space-y-3">
                  <p>We use cookies and similar technologies to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Remember your preferences and settings</li>
                    <li>Analyze platform usage and performance</li>
                    <li>Provide personalized content and recommendations</li>
                    <li>Enable social media features</li>
                    <li>Deliver targeted advertising</li>
                  </ul>
                  <p className="mt-4">
                    You can control cookies through your browser settings. However, disabling cookies may affect the functionality of our platform.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">8. Data Retention</h2>
                <p className="mb-4">
                  We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. When information is no longer needed, we securely delete or anonymize it.
                </p>
                <div className="space-y-2">
                  <p><strong>Account Information:</strong> Retained while your account is active and for a reasonable period after closure</p>
                  <p><strong>Transaction Records:</strong> Retained for legal and accounting purposes as required by law</p>
                  <p><strong>Communication Data:</strong> Retained for customer service and legal purposes</p>
                  <p><strong>Analytics Data:</strong> May be retained in aggregated, anonymized form indefinitely</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">9. International Data Transfers</h2>
                <p className="mb-4">
                  Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information during international transfers, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Adequacy decisions by relevant authorities</li>
                  <li>Standard contractual clauses</li>
                  <li>Binding corporate rules</li>
                  <li>Certification schemes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">10. Children's Privacy</h2>
                <p className="mb-4">
                  Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected information from a child under 18, we will take steps to delete such information promptly.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">11. Third-Party Links and Services</h2>
                <p className="mb-4">
                  Our platform may contain links to third-party websites or integrate with third-party services. This Privacy Notice does not apply to those external sites or services. We encourage you to review the privacy policies of any third-party sites you visit.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">12. Changes to This Privacy Notice</h2>
                <p className="mb-4">
                  We may update this Privacy Notice from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of significant changes by posting the updated notice on our platform and updating the "Last updated" date. Your continued use of our services after such changes constitutes acceptance of the updated Privacy Notice.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">13. Contact Us</h2>
                <p className="mb-4">
                  If you have any questions, concerns, or requests regarding this Privacy Notice or our privacy practices, please contact us:
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p><strong>ROC Privacy Team</strong></p>
                  <p>Email: privacy@roc.space</p>
                  <p>Address: [Company Address]</p>
                  <p>Phone: [Phone Number]</p>
                </div>
                <p className="mt-4">
                  We are committed to addressing your privacy concerns and will respond to your inquiries in a timely manner.
                </p>
              </section>
            </div>
          </ScrollArea>
        </div>
      </main>
    </div>
  )
}

export default PrivacyPage 