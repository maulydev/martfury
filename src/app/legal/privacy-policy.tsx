import React from 'react';
import { LegalPage } from '@/components/ui/legal-page';

export default function PrivacyPolicyScreen() {
  return (
    <LegalPage
      updatedAt="August 31, 2026"
      intro="Martfury ('we', 'us', 'our') respects your privacy. This policy explains what information we collect, how we use it, and the choices you have when you use our app."
      sections={[
        {
          heading: '1. Information We Collect',
          paragraphs: [
            'We collect information you provide directly to us, such as when you create an account, place an order, or contact support.',
          ],
          bullets: [
            'Account details: name, email address, and password',
            'Order details: shipping address, items purchased, and payment status',
            'Device information: app version, device type, and general usage data',
          ],
        },
        {
          heading: '2. How We Use Your Information',
          paragraphs: ['We use the information we collect to:'],
          bullets: [
            'Create and manage your account',
            'Process and deliver your orders',
            'Provide customer support and respond to your requests',
            'Improve the app and personalize your experience',
            'Send order updates and, where you have opted in, promotional messages',
          ],
        },
        {
          heading: '3. Sharing Your Information',
          paragraphs: [
            'We do not sell your personal information. We share it only with service providers who help us operate the app — such as payment processors and delivery partners — and only to the extent needed to provide our services, or when required by law.',
          ],
        },
        {
          heading: '4. Data Security',
          paragraphs: [
            'We use reasonable technical and organizational measures to protect your information. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.',
          ],
        },
        {
          heading: '5. Your Choices',
          paragraphs: [
            'You can review and update your account information at any time from the Edit Profile screen. You may also request that we delete your account by contacting support.',
          ],
        },
        {
          heading: '6. Changes to This Policy',
          paragraphs: [
            'We may update this policy from time to time. We will notify you of significant changes by updating the "Last updated" date above.',
          ],
        },
        {
          heading: '7. Contact Us',
          paragraphs: [
            'If you have questions about this Privacy Policy, please reach out through Help & Support in your account.',
          ],
        },
      ]}
    />
  );
}
