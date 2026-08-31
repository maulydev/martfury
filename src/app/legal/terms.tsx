import React from 'react';
import { LegalPage } from '@/components/ui/legal-page';

export default function TermsScreen() {
  return (
    <LegalPage
      updatedAt="August 31, 2026"
      intro="These Terms & Conditions govern your use of the Martfury app. By creating an account or placing an order, you agree to these terms."
      sections={[
        {
          heading: '1. Using Martfury',
          paragraphs: [
            'You must be at least 18 years old, or have a parent/guardian\'s permission, to create an account and place orders. You are responsible for keeping your account credentials secure and for all activity under your account.',
          ],
        },
        {
          heading: '2. Orders & Pricing',
          paragraphs: [
            'All prices are shown in the currency displayed at checkout and include applicable taxes unless stated otherwise. We reserve the right to correct pricing errors and to cancel orders placed at an incorrect price, in which case we will notify you and issue a full refund.',
          ],
        },
        {
          heading: '3. Payment',
          paragraphs: [
            'Payment is processed securely at checkout. By placing an order, you confirm that the payment method used is yours or that you are authorized to use it.',
          ],
        },
        {
          heading: '4. Shipping & Delivery',
          paragraphs: [
            'Delivery times shown at checkout are estimates. See our Shipping and Returns page for full details on delivery windows, costs, and how to return an item.',
          ],
        },
        {
          heading: '5. Cancellations & Returns',
          paragraphs: [
            'You may cancel an order before it ships by contacting support. Returns are accepted in line with our Shipping and Returns policy.',
          ],
        },
        {
          heading: '6. Prohibited Use',
          paragraphs: ['You agree not to:'],
          bullets: [
            'Use the app for any unlawful purpose',
            'Attempt to gain unauthorized access to our systems',
            'Interfere with or disrupt the app\'s operation',
            'Submit false or misleading order or payment information',
          ],
        },
        {
          heading: '7. Limitation of Liability',
          paragraphs: [
            'Martfury is provided on an "as is" basis. To the fullest extent permitted by law, we are not liable for indirect or incidental damages arising from your use of the app.',
          ],
        },
        {
          heading: '8. Changes to These Terms',
          paragraphs: [
            'We may update these terms from time to time. Continued use of the app after changes take effect means you accept the updated terms.',
          ],
        },
        {
          heading: '9. Contact Us',
          paragraphs: [
            'Questions about these terms can be sent through Help & Support in your account.',
          ],
        },
      ]}
    />
  );
}
