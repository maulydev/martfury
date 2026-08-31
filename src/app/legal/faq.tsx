import React from 'react';
import { FaqPage } from '@/components/ui/faq-page';

export default function FaqScreen() {
  return (
    <FaqPage
      sections={[
        {
          heading: 'Orders',
          items: [
            {
              question: 'How do I track my order?',
              answer: 'Open your account and tap My Orders to see the status of every order, from Processing through to Delivered.',
            },
            {
              question: 'Can I cancel or change an order after placing it?',
              answer: 'You can cancel an order before it ships by contacting Help & Support. Once an order has shipped, it can no longer be changed or cancelled.',
            },
            {
              question: 'What payment methods do you accept?',
              answer: 'We accept major debit and credit cards, along with any other payment options shown to you at checkout.',
            },
          ],
        },
        {
          heading: 'Shipping & Returns',
          items: [
            {
              question: 'How long does delivery take?',
              answer: 'Standard delivery takes 3-7 business days, and express delivery takes 1-3 business days, depending on your location.',
            },
            {
              question: 'What is your return policy?',
              answer: 'Most items can be returned within 14 days of delivery if unused and in their original packaging. See Shipping and Returns for full details.',
            },
            {
              question: 'My item arrived damaged, what do I do?',
              answer: 'Contact Help & Support within 48 hours of delivery with photos of the item, and we\'ll arrange a replacement or refund at no extra cost.',
            },
          ],
        },
        {
          heading: 'Account',
          items: [
            {
              question: 'How do I update my profile information?',
              answer: 'Go to Account Settings > Edit Profile to update your name. Your email is tied to your account and can\'t be changed there.',
            },
            {
              question: 'How do I sign out of my account?',
              answer: 'Open your account and tap Sign Out at the bottom of the screen.',
            },
            {
              question: 'How do I delete my account?',
              answer: 'Contact Help & Support to request account deletion. We\'ll confirm and remove your data in line with our Privacy Policy.',
            },
          ],
        },
      ]}
    />
  );
}
