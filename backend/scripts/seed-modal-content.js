const mongoose = require('mongoose');
const config = require('../config/config');
const ModalContent = require('../src/models/ModalContent');

// Connect to MongoDB
mongoose.connect(config.DATABASE_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('✅ Connected to MongoDB');
        seedModalContent();
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    });

const seedModalContent = async() => {
    try {
        // Clear existing modal content
        await ModalContent.deleteMany({});
        console.log('🗑️ Cleared existing modal content');

        // Modal content data
        const modalContentData = [{
                modalType: 'about',
                title: 'About KuralApp',
                content: `About KuralApp
KuralApp is India's first comprehensive ElectionTech SaaS platform designed to simplify and supercharge election management. From booth-level voter mapping, volunteer management, to real-time data tracking and strategic insights, KURAL App empowers political candidates, parties, and organizations to manage campaigns digitally and efficiently. Whether you are contesting a local body election or a major assembly poll, KURAL App is your all-in-one toolkit to plan, execute, and win smartly.

Key Highlights:
1. Booth-level voter visualization with geo-tagging
2. Cadre and volunteer management tools
3. Real-time voter data verification and analytics
4. Customizable campaign dashboards
5. Mobile-first and cloud-based accessibility

About Thedal
Kuralis a pioneering ElectionTech company committed to transforming how political campaigns are managed in India.

Founded with a vision to digitize elections and empower candidates with cutting-edge technology, Kuralblends deep political insights with modern SaaS solutions to create a new era of smart campaigning. Our flagship product, KuralApp, is already creating waves across all parts of India and global, helping candidates build data-driven, organized, and winning campaigns.

Our Mission:
• Digitize the election management process
• Make political campaigns data-centric and efficient
• Empower leaders and aspirants with easy-to-use technology
• Create a level-playing field for new and emerging political faces

Website: www.thedal.co.in
Email: contact@thedal.co.in
Mobile: 861-862-7199`
            },
            {
                modalType: 'help',
                title: 'Help',
                content: `Website: www.thedal.co.in
Email: contact@thedal.co.in
Mobile: 861-862-7199
Linkedin: https://www.linkedin.com/company/thedalappindia/

KuralElection Analytics Manager (KURAL App) is India's first ElectionTech SaaS platform designed to revolutionize election campaign management through data-driven strategies and advanced digital tools. Whether you're a political candidate, party worker, strategist, or grassroots organizer, KURAL App provides a seamless solution to manage voter outreach, coordinate campaign teams, and optimize booth-level activities. With features like digital voter lists, cadre tracking, geo-spatial insights, and real-time data analytics, the app ensures that every decision is backed by accurate information, making your campaign smarter and more effective.

Built for efficiency, KURAL App enables streamlined volunteer management, task assignment, and campaign monitoring, all in one place. The platform supports multiple languages, ensuring accessibility across diverse user bases. By integrating AI-powered insights and election-specific features, KURAL App transforms traditional political campaigns into high-impact, technology-driven movements. Download now and take your election campaign to the next level!`
            },
            {
                modalType: 'terms',
                title: 'Terms & Conditions',
                content: `Terms & Conditions for KURAL App

Welcome to KURAL (KuralElection Analytics Manager). By accessing or using our SaaS platform, you agree to comply with and be bound by these Terms & Conditions (T&C). If you do not agree, do not use the platform.

1. Acceptance of Terms
By signing up for, accessing, or using the KURAL App, you accept these T&Cs and any policies incorporated by reference. These terms govern your use of the platform, including any associated features, tools, and services provided by us.

2. Nature of Service
The KURAL App is a Software-as-a-Service (SaaS) platform designed to manage campaigns, voter data, and election-related analytics.
• We provide the software and secure data storage.
• We do not own, access, sell, or control the data uploaded to the platform without explicit user consent.
• You are responsible for ensuring compliance with applicable laws and regulations when using the platform.

3. User Responsibilities
By using the KURAL App, you agree to:
• Provide accurate and current information during account registration.
• Maintain the confidentiality of your login credentials.
• Ensure data entered into the platform complies with all applicable data protection and privacy laws.
• Use the platform solely for lawful purposes.

Prohibited Activities:
You agree not to:
• Upload malicious or unauthorized content.
• Use the platform for illegal activities or activities infringing on third-party rights.
• Reverse-engineer, copy, or exploit any part of the software without prior consent.
• Circumvent security protocols or conduct unauthorized penetration tests.

4. Data Ownership and Security
• Ownership: All data uploaded remains your property.
• Access: We do not access your data without your explicit consent.
• Security: Your data is encrypted both at rest (AES-256) and in transit (TLS 1.2+).
• Third-Party Integrations: Any data shared with third-party services or APIs you choose to integrate is your responsibility.
• Data Backup: While we take precautions to ensure data integrity, maintaining independent backups is your responsibility.

5. Data Retention and Deletion
Upon account termination, your data will be retained for a limited period of 30 days for reactivation or retrieval. After this period, data will be permanently deleted unless required by law.
Users can request immediate data deletion by contacting support.

6. Service Availability and Support
We strive to provide 99.9% uptime monthly. Scheduled maintenance will be communicated in advance.
Support requests are handled within 24-48 hours. We are not liable for losses caused by service interruptions due to maintenance, upgrades, or force majeure events.

7. Subscription and Payment
• Fees: Subscription fees are payable as per the selected plan and are non-refundable except where required by law.
• Suspension: Non-payment may result in suspension or termination of access.
• Taxes: Users are responsible for any applicable taxes associated with the subscription.

8. Beta Features
Any beta features offered are provided "as-is" for testing purposes and may be modified or discontinued at our discretion without prior notice.

9. Intellectual Property
The KURAL App, its design, and underlying technology are the property of the service provider.
Users may not copy, modify, or redistribute any part of the platform without written permission.

10. Limitation of Liability
To the extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from the use of the KURAL App.
Our total liability is limited to the subscription fees paid by you only during the subscription active period.

11. Indemnification
You agree to indemnify and hold harmless our company, employees, and affiliates from claims, damages, or liabilities arising from your use of the platform, including violations of these T&Cs or applicable laws.

12. Compliance with Laws
You are solely responsible for ensuring that your use of the KURAL App complies with all applicable laws, including but not limited to data protection and election regulations.

13. Data Localization
Your data may be stored in specific jurisdictions to comply with local laws. Requests for specific data residency must be communicated during account setup.

14. Force Majeure
We are not liable for delays or failures caused by events beyond our reasonable control, such as natural disasters, cyberattacks, or government actions.

15. Updates to the Terms
We may update these T&Cs periodically to reflect changes to our services or applicable laws. Users will be notified of significant changes. Continued use of the platform after updates constitutes acceptance of the revised terms.

16. Governing Law
These T&Cs are governed by and construed in accordance with the laws of Chennai, Tamil Nadu. Disputes will be resolved exclusively in the courts of Chennai.

17. Contact Us
For any questions or concerns regarding these Terms & Conditions, please contact:
Email: contact@thedal.co.in

By clicking "Sign In" or "Create Account," you acknowledge that you have read, understood, and agreed to these Terms & Conditions.`
            },
            {
                modalType: 'privacy',
                title: 'Privacy Policy',
                content: `Privacy Policy for KURAL App SaaS Platform

Welcome to KURAL (KuralElection Analytics Manager), a Software-as-a-Service (SaaS) platform designed to empower organizations with secure and efficient tools for election campaign management. This Privacy Policy outlines how we, as a SaaS provider, handle data, ensuring transparency, security, and compliance with applicable laws.

By using the KURAL App, you agree to the terms of this Privacy Policy. If you do not agree, please refrain from using the service.

1. Scope of the Policy
This Privacy Policy applies to all users of the KURAL App, including organizations and their authorized representatives. As a SaaS provider, we facilitate the secure storage, processing, and management of data on behalf of our clients, adhering to strict data protection and privacy standards.

2. Data Ownership and Control
• Client Ownership: All data entered, uploaded, or processed through the KURAL App is owned by the client.
• No Unauthorized Access: We do not access, modify, or sell your data under any circumstances. Access to your data is only possible with your explicit knowledge and consent (e.g., during support or troubleshooting).
• Encrypted Data: All data stored within the platform is encrypted both in transit and at rest, ensuring that even our team cannot view the data without authorized access.

3. Data Collection and Usage
As a SaaS provider, we collect minimal data necessary to provide the service:

Data We Collect:
• Account Information: Names, contact details, and payment information for account setup and subscription management.
• Usage Data: Aggregated and anonymized usage data (e.g., app performance metrics) to improve our services.

How We Use This Data:
• To provide and maintain the KURAL App.
• To communicate with users regarding updates, support, or billing.
• To analyze service usage trends (aggregated and anonymized data).
• To comply with legal obligations.
We do not access, view, or use your operational data (e.g., voter data) without your explicit request and consent.

4. Data Security
We implement robust security measures to protect your data, including:
• Encryption: All sensitive data is encrypted both at rest and during transmission using industry-standard protocols.
• Role-Based Access Control: Only authorized personnel have restricted access to the system, and even they cannot view client data unless explicitly permitted by the client.
• Secure Hosting: Data is stored in secure, compliant data centers with advanced security measures.
• Regular Audits: Periodic security assessments and compliance audits are conducted.
• Data Breach Response: In the unlikely event of a data breach, affected clients will be promptly notified, and corrective measures will be taken immediately.

5. Compliance with Data Protection Laws
We comply with global data protection laws, including:
• GDPR: Ensuring that data collection, processing, and storage adhere to the principles of lawfulness, transparency, purpose limitation, and data minimization.
• Data Localization Requirements: Complying with local regulations for data residency, where applicable.
Clients are responsible for ensuring their use of the KURAL App complies with local laws and for obtaining any necessary consents for data processing.

6. Data Sharing and Disclosure
We do not sell, rent, or share client data with third parties. Data may only be shared in the following limited circumstances:
• Third-Party Services: With trusted third-party service providers essential to platform operation (e.g., cloud hosting), bound by strict confidentiality agreements.
• Legal Obligations: If required by law, court order, or governmental authority, but only after notifying the client whenever possible.
• Support Requests: If troubleshooting or support requires temporary access, it will only occur with the client's explicit knowledge and consent.

7. Data Retention
• Active Accounts: Data is retained for the duration of the service subscription.
• Terminated Accounts: Upon termination of the account, data is retained for a limited period (as legally required or agreed) and then securely deleted or anonymized.
• Client Requests: Clients may request the export or deletion of their data at any time, subject to applicable legal or contractual obligations.

8. Client Responsibilities
As a client, you are responsible for:
• Ensuring that data entered into the KURAL App complies with applicable laws and regulations.
• Obtaining necessary consents from individuals whose data is uploaded or processed.
• Controlling access to your account and ensuring appropriate use by authorized personnel only.

9. User Rights
We respect your rights as a user of the KURAL App, including:
• Access: You can request access to any data we hold about your account.
• Rectification: Correct inaccuracies in your account information.
• Data Portability: Request an export of your data in a structured format.
• Deletion: Request deletion of your data, subject to legal and contractual limitations.

10. Updates to This Privacy Policy
This Privacy Policy may be updated periodically to reflect changes in laws, services, or industry practices. Significant updates will be communicated via the KURAL App or email. Continued use of the platform constitutes acceptance of the updated terms.

11. Contact Information
For any questions, concerns, or data-related requests, please contact us:
Email: contact@thedal.co.in

By using the KURAL App, you acknowledge and agree to this Privacy Policy.`
            }
        ];

        // Insert modal content
        await ModalContent.insertMany(modalContentData);
        console.log('✅ Modal content seeded successfully');

        // Display seeded data
        const seededContent = await ModalContent.find({});
        console.log(`📊 Seeded ${seededContent.length} modal content entries:`);
        seededContent.forEach(content => {
            console.log(`   - ${content.modalType}: ${content.title}`);
        });

    } catch (error) {
        console.error('❌ Error seeding modal content:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};