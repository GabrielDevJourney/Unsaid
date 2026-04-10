import PolicyLayout from "@/components/legal/policy-layout";

const LEGAL_ENTITY_NAME = "Gabriel Pereira, trading as Unsaid";
const LEGAL_EMAIL = "legal@byunsaid.com";

const TermsPage = () => {
    return (
        <PolicyLayout title="Terms of Service" lastUpdated="March 16, 2026">
            <section>
                <h2 className="font-semibold mt-6 mb-2">
                    1. Acceptance of Terms
                </h2>
                <p>
                    By creating an account, accessing, or using Unsaid
                    (&ldquo;the Service&rdquo;), you agree to be bound by these
                    Terms of Service (&ldquo;Terms&rdquo;). Please read them
                    carefully before using the Service.
                </p>
                <p className="mt-2">
                    If you do not agree to these Terms, do not create an account
                    or use the Service.
                </p>
                <p className="mt-2">
                    These Terms constitute a legally binding agreement between
                    you (&ldquo;User,&rdquo; &ldquo;you,&rdquo; or
                    &ldquo;your&rdquo;) and {LEGAL_ENTITY_NAME}{" "}
                    (&ldquo;Unsaid,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo;
                    or &ldquo;our&rdquo;), the company that operates the Unsaid
                    application.
                </p>
                <p className="mt-2">
                    <strong>Age requirement.</strong> You must be at least 18
                    years old to use Unsaid. By accepting these Terms, you
                    represent and warrant that you are at least 18 years of age.
                    If we learn that a user is under 18, we will terminate their
                    account and delete their data promptly.
                </p>
                <p className="mt-2">
                    <strong>Capacity.</strong> By accepting these Terms, you
                    also represent that you have the legal capacity to enter
                    into a binding agreement in your jurisdiction.
                </p>
            </section>

            <section>
                <h2 className="font-semibold mt-6 mb-2">
                    2. Description of Service
                </h2>
                <p>
                    Unsaid is an AI-powered journaling application. The Service
                    allows you to:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Write and store private journal entries</li>
                    <li>
                        Receive AI-generated insights on individual journal
                        entries
                    </li>
                    <li>
                        Receive AI-generated weekly pattern analysis based on
                        your journaling history
                    </li>
                    <li>
                        Receive periodic AI-generated progress reports as you
                        build a journaling habit
                    </li>
                    <li>
                        Search past entries using semantic (meaning-based)
                        search
                    </li>
                </ul>
                <p className="mt-2">
                    The Service is intended as a personal reflection and
                    journaling tool.{" "}
                    <strong>
                        It is not a mental health service, therapy, or medical
                        product.
                    </strong>{" "}
                    See Section 10 (Disclaimers) for important limitations.
                </p>
                <p className="mt-2">
                    We reserve the right to modify, suspend, or discontinue
                    features of the Service at any time, with reasonable efforts
                    to notify you of material changes.
                </p>
            </section>

            <section>
                <h2 className="font-semibold mt-6 mb-2">3. User Accounts</h2>
                <p>
                    <strong>3.1 Account Creation.</strong> You may register
                    using an email address and password, or via Google social
                    login. Authentication is handled by Clerk, Inc. By creating
                    an account, you also agree to Clerk&rsquo;s terms and
                    privacy policy.
                </p>
                <p className="mt-2">
                    <strong>3.2 Account Accuracy.</strong> You agree to provide
                    accurate, current, and complete information and to keep it
                    updated.
                </p>
                <p className="mt-2">
                    <strong>3.3 Account Security.</strong> You are responsible
                    for maintaining the confidentiality of your credentials and
                    for all activity under your account. Notify us immediately
                    at {LEGAL_EMAIL} if you suspect unauthorized access.
                </p>
                <p className="mt-2">
                    <strong>3.4 One Account Per Person.</strong> Accounts are
                    for individual use only. You may not share your account or
                    create multiple accounts to circumvent subscription limits.
                </p>
            </section>

            <section>
                <h2 className="font-semibold mt-6 mb-2">4. User Content</h2>
                <p>
                    <strong>4.1 Your Ownership.</strong> You retain full
                    ownership of all journal entries and other content you
                    create within Unsaid (&ldquo;User Content&rdquo;). We do not
                    claim any ownership rights over your User Content.
                </p>
                <p className="mt-2">
                    <strong>4.2 License to Process.</strong> By using the
                    Service, you grant {LEGAL_ENTITY_NAME} a limited,
                    non-exclusive, non-transferable, revocable license to
                    access, store, process, and transmit your User Content
                    strictly to the extent necessary to provide, operate, and
                    maintain the Service - including generating AI insights,
                    semantic search indexing, and diagnosing technical problems.
                    This license does not grant us any right to sell, license,
                    or commercially exploit your User Content.
                </p>
                <p className="mt-2">
                    <strong>4.3 On Deletion.</strong> When you delete a journal
                    entry or close your account, your User Content is deleted in
                    accordance with Section 12.
                </p>
            </section>

            <section>
                <h2 className="font-semibold mt-6 mb-2">
                    5. AI Processing Disclosure
                </h2>
                <p>
                    <strong>
                        Please read this section carefully before using the
                        Service.
                    </strong>
                </p>
                <p className="mt-2">
                    <strong>5.1 How AI Processing Works.</strong> Unsaid uses AI
                    models to generate insights, pattern analyses, and progress
                    reports from your journal entries. To deliver this, the text
                    of your journal entries is transmitted to third-party AI
                    providers:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>
                        <strong>Anthropic, Inc.</strong> - Your entry text is
                        sent to Anthropic&rsquo;s Claude AI models (Haiku and
                        Sonnet) to generate per-entry insights, weekly pattern
                        analysis, and periodic progress reports.
                    </li>
                    <li>
                        <strong>OpenAI, L.L.C.</strong> - Your entry text is
                        sent to OpenAI&rsquo;s text-embedding-3-small model to
                        generate vector representations used exclusively to
                        power semantic search within your own account.
                    </li>
                </ul>
                <p className="mt-2">
                    <strong>5.2 What Is Not Done With Your Content.</strong>
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>
                        We do not sell your journal content to any third party.
                    </li>
                    <li>
                        Neither Anthropic nor OpenAI are permitted to use your
                        content to train their models under our agreements with
                        them. Review their current policies directly for the
                        most up-to-date information.
                    </li>
                    <li>Your content is not shared with other Unsaid users.</li>
                    <li>
                        Your content is not used for advertising or marketing
                        profiling.
                    </li>
                </ul>
                <p className="mt-2">
                    <strong>5.3 Opt-Out.</strong> AI processing is a core,
                    non-optional feature of Unsaid. If you do not wish your
                    journal entries to be processed by third-party AI models,
                    you should not use this Service.
                </p>
                <p className="mt-2">
                    <strong>5.4 AI Outputs Are Not Advice.</strong> AI-generated
                    insights, patterns, and progress reports are for reflective
                    and informational purposes only. They are not professional
                    advice of any kind.
                </p>
            </section>

            <section>
                <h2 className="font-semibold mt-6 mb-2">
                    6. Subscription and Billing
                </h2>
                <p>
                    <strong>6.1 Free Trial.</strong> New accounts receive a
                    7-day free trial with full access. No charge is made during
                    the trial. At the end of the trial, your account transitions
                    to the paid subscription unless you cancel before the trial
                    ends.
                </p>
                <p className="mt-2">
                    <strong>6.2 Paid Subscriptions.</strong>
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Monthly plan: $10.99/month</li>
                    <li>Annual plan: $99.00/year</li>
                </ul>
                <p className="mt-2">
                    We reserve the right to change prices with at least 30
                    days&rsquo; advance notice. Price changes take effect at
                    your next billing cycle.
                </p>
                <p className="mt-2">
                    <strong>6.3 Billing.</strong> All payment processing is
                    handled by LemonSqueezy (Lemon Squeezy LLC). By subscribing,
                    you authorize recurring charges to your selected payment
                    method. {LEGAL_ENTITY_NAME} does not store your full payment
                    card details.
                </p>
                <p className="mt-2">
                    <strong>6.4 Automatic Renewal.</strong> Subscriptions renew
                    automatically unless cancelled before the end of the current
                    billing period.
                </p>
                <p className="mt-2">
                    <strong>6.5 Cancellation.</strong> Cancel at any time
                    through the LemonSqueezy customer portal in your account
                    settings. Access continues until the end of the current
                    billing period.
                </p>
                <p className="mt-2">
                    <strong>6.6 Refunds.</strong> Because Unsaid offers a 7-day
                    free trial before any charge, we generally do not offer
                    refunds after billing. Contact us at {LEGAL_EMAIL} within 14
                    days of a charge if you believe you were charged in error.
                    Nothing in this section limits any statutory rights you may
                    have under applicable consumer protection law, including
                    Portuguese consumer protection law.
                </p>
                <p className="mt-2">
                    <strong>6.7 Taxes.</strong> You are responsible for all
                    applicable taxes on your subscription, except for taxes
                    based on our net income.
                </p>
            </section>

            <section>
                <h2 className="font-semibold mt-6 mb-2">7. Acceptable Use</h2>
                <p>
                    You may use Unsaid only for personal journaling and
                    self-reflection in accordance with these Terms and
                    applicable law. You agree not to:
                </p>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                    <li>Use the Service for any unlawful purpose.</li>
                    <li>Harass, threaten, defame, or harm any person.</li>
                    <li>
                        Probe, scan, or test the vulnerability of the Service;
                        circumvent authentication or security measures;
                        introduce malware; or conduct denial-of-service attacks.
                    </li>
                    <li>
                        Decompile, disassemble, or reverse engineer the Service
                        or its AI models.
                    </li>
                    <li>
                        Use automated scripts or bots to scrape or extract data
                        in bulk.
                    </li>
                    <li>Impersonate any person or entity.</li>
                    <li>
                        Create multiple accounts to exploit the free trial more
                        than once.
                    </li>
                    <li>
                        Resell or sublicense the Service without our express
                        written permission.
                    </li>
                </ol>
                <p className="mt-2">
                    We reserve the right to suspend or terminate accounts for
                    violations, without prior notice where necessary.
                </p>
            </section>

            <section>
                <h2 className="font-semibold mt-6 mb-2">
                    8. Intellectual Property
                </h2>
                <p>
                    <strong>8.1 Unsaid&rsquo;s IP.</strong> The Service,
                    including its software, design, branding, and UI - excluding
                    User Content - is owned by or licensed to{" "}
                    {LEGAL_ENTITY_NAME}. You are granted a limited,
                    non-exclusive, non-transferable license to use the Service
                    for its intended purpose during your subscription.
                </p>
                <p className="mt-2">
                    <strong>8.2 Feedback.</strong> If you submit feedback,
                    feature requests, or suggestions, you grant us an
                    irrevocable, worldwide, royalty-free license to use that
                    Feedback for any purpose, including improving the Service.
                </p>
                <p className="mt-2">
                    <strong>8.3 Your Content.</strong> You retain full ownership
                    of your User Content. Nothing in these Terms transfers
                    ownership to us.
                </p>
            </section>

            <section>
                <h2 className="font-semibold mt-6 mb-2">9. Privacy</h2>
                <p>
                    Our collection, use, and storage of your personal data is
                    governed by our{" "}
                    <a href="/privacy" className="underline">
                        Privacy Policy
                    </a>
                    , which is incorporated into these Terms by reference. Key
                    points:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>
                        We do not sell your personal data to any third party.
                    </li>
                    <li>
                        We do not use your journal content for advertising or
                        behavioral profiling.
                    </li>
                    <li>
                        All journal content is encrypted at rest with AES-GCM.
                    </li>
                    <li>
                        You have rights under GDPR and CCPA, including access,
                        correction, erasure, and portability.
                    </li>
                </ul>
                <p className="mt-2">
                    Third-party services used: Clerk (authentication), Anthropic
                    (AI insights), OpenAI (embeddings), Supabase (database),
                    Vercel (hosting), PostHog (analytics), Resend (email),
                    Sentry (error tracking), LemonSqueezy (payments).
                </p>
            </section>

            <section>
                <h2 className="font-semibold mt-6 mb-2">10. Disclaimers</h2>
                <p>
                    <strong>
                        10.1 Not a Mental Health or Medical Service.
                    </strong>{" "}
                    Unsaid is a personal journaling and self-reflection tool.{" "}
                    <strong>
                        It is not a mental health service, therapy service,
                        counseling service, medical device, or crisis
                        intervention service.
                    </strong>{" "}
                    AI-generated insights are for personal reflection only -
                    they are not psychological assessments, diagnoses, or
                    clinical recommendations.
                </p>
                <p className="mt-2">
                    If you are experiencing a mental health crisis, suicidal
                    thoughts, or require psychological or medical help, please
                    contact a qualified mental health professional, your primary
                    care physician, or an emergency service immediately. Do not
                    rely on Unsaid as a substitute for professional mental
                    health care.
                </p>
                <p className="mt-2">
                    <strong>10.2 No Warranty.</strong> The Service is provided
                    &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
                    warranty of any kind. To the fullest extent permitted by
                    applicable law, {LEGAL_ENTITY_NAME} disclaims all
                    warranties, including implied warranties of merchantability,
                    fitness for a particular purpose, and non-infringement. We
                    do not warrant that the Service will be uninterrupted,
                    error-free, or secure at all times.
                </p>
                <p className="mt-2">
                    <strong>10.3 AI Output Accuracy.</strong> AI-generated
                    content is probabilistic and may contain inaccuracies.
                    Exercise your own judgment and do not act solely on the
                    basis of AI-generated content.
                </p>
                <p className="mt-2">
                    <strong>10.4 Consumer Rights Preservation.</strong> Nothing
                    in these disclaimers limits any mandatory statutory rights
                    under applicable consumer protection law.
                </p>
            </section>

            <section>
                <h2 className="font-semibold mt-6 mb-2">
                    11. Limitation of Liability
                </h2>
                <p>
                    <strong>11.1 Exclusion of Indirect Damages.</strong> To the
                    fullest extent permitted by applicable law,{" "}
                    {LEGAL_ENTITY_NAME} shall not be liable for any indirect,
                    incidental, special, consequential, punitive, or exemplary
                    damages, including loss of data, loss of profits, business
                    interruption, emotional distress, or any reliance on
                    AI-generated content.
                </p>
                <p className="mt-2">
                    <strong>11.2 Cap on Liability.</strong> Our total aggregate
                    liability shall not exceed the greater of (a) the total
                    amount you paid us in the 12 months preceding the claim, or
                    (b) $50.00 USD.
                </p>
                <p className="mt-2">
                    <strong>11.3 Mandatory Consumer Rights.</strong> Nothing in
                    this Section limits our liability for: death or personal
                    injury caused by our negligence; fraud or fraudulent
                    misrepresentation; or any other liability that cannot be
                    excluded under applicable law. EU consumers retain all
                    rights afforded under mandatory EU consumer protection law.
                </p>
            </section>

            <section>
                <h2 className="font-semibold mt-6 mb-2">12. Termination</h2>
                <p>
                    <strong>12.1 By You.</strong> Close your account at any time
                    from account settings or by contacting us at {LEGAL_EMAIL}.
                    Your subscription cancels and access ends at the end of the
                    current billing period.
                </p>
                <p className="mt-2">
                    <strong>12.2 By Us.</strong> We may suspend or terminate
                    your account if: you materially breach these Terms; your
                    continued use creates legal risk; we are required to by law;
                    or we discontinue the Service. If we discontinue the
                    Service, we will provide reasonable advance notice and a
                    pro-rata refund of prepaid fees.
                </p>
                <p className="mt-2">
                    <strong>12.3 Data Deletion on Termination.</strong> Upon
                    account deletion:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>
                        Your journal entries, AI-generated insights, vector
                        embeddings, and user profile are{" "}
                        <strong>
                            permanently deleted from our active systems within
                            30 days
                        </strong>{" "}
                        of the account closure date.
                    </li>
                    <li>
                        Billing records and payment webhook data are retained
                        for as long as legally required (7 years under
                        Portuguese/EU tax law) and are not used for any other
                        purpose.
                    </li>
                    <li>
                        Deletion is permanent and irreversible. We recommend
                        exporting your entries before closing your account.
                    </li>
                </ul>
                <p className="mt-2">
                    <strong>12.4 Survival.</strong> Sections 4.1, 7, 8, 10, 11,
                    13, and provisions that by their nature should survive, will
                    survive termination.
                </p>
            </section>

            <section>
                <h2 className="font-semibold mt-6 mb-2">
                    13. Governing Law and Dispute Resolution
                </h2>
                <p>
                    <strong>13.1 Governing Law.</strong> These Terms are
                    governed by the laws of Portugal. Where EU law applies
                    (GDPR, consumer protection directives), EU law governs.
                </p>
                <p className="mt-2">
                    <strong>13.2 Jurisdiction.</strong> EU users may bring
                    disputes before the courts of their country of residence.
                    Users outside the EU submit to the exclusive jurisdiction of
                    the courts of Portugal.
                </p>
                <p className="mt-2">
                    <strong>13.3 Informal Resolution First.</strong> Contact us
                    at {LEGAL_EMAIL} before filing a formal legal claim.
                </p>
                <p className="mt-2">
                    <strong>13.4 EU ODR Platform.</strong> EU consumers may
                    submit complaints via the European Commission&rsquo;s Online
                    Dispute Resolution platform at{" "}
                    <a
                        href="https://ec.europa.eu/consumers/odr/"
                        className="underline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        https://ec.europa.eu/consumers/odr/
                    </a>
                </p>
            </section>

            <section>
                <h2 className="font-semibold mt-6 mb-2">
                    14. Changes to These Terms
                </h2>
                <p>
                    We may update these Terms from time to time. For material
                    changes, we will post the updated Terms and send email
                    notification at least <strong>14 days before</strong> the
                    changes take effect. Continued use after the effective date
                    constitutes acceptance.
                </p>
            </section>

            <section>
                <h2 className="font-semibold mt-6 mb-2">
                    15. Contact Information
                </h2>
                <p>{LEGAL_ENTITY_NAME}</p>
                <p>Email: {LEGAL_EMAIL}</p>
                <p className="mt-2">
                    For billing issues, contact LemonSqueezy via your customer
                    portal, or reach us at {LEGAL_EMAIL}.
                </p>
                <p className="mt-4">
                    <strong>Supervisory Authority.</strong> EU users may lodge a
                    complaint with the{" "}
                    <strong>
                        Comissão Nacional de Proteção de Dados (CNPD)
                    </strong>{" "}
                    at{" "}
                    <a
                        href="https://www.cnpd.pt"
                        className="underline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        www.cnpd.pt
                    </a>
                    , or with the supervisory authority in their country of
                    residence.
                </p>
            </section>
        </PolicyLayout>
    );
};

export default TermsPage;
