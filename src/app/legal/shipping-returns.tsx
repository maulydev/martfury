import React from 'react';
import { LegalPage } from '@/components/ui/legal-page';

export default function ShippingReturnsScreen() {
  return (
    <LegalPage
      updatedAt="August 31, 2026"
      intro="Here's how shipping, delivery, and returns work when you shop with Martfury."
      sections={[
        {
          heading: 'Shipping',
          paragraphs: [
            'Orders are typically processed within 1-2 business days. Delivery times depend on your location and the shipping method chosen at checkout.',
          ],
          bullets: [
            'Standard delivery: 3-7 business days',
            'Express delivery: 1-3 business days',
            'You will receive an order confirmation and status updates from My Orders',
            'Shipping costs are calculated at checkout based on your delivery address',
          ],
        },
        {
          heading: 'Tracking Your Order',
          paragraphs: [
            'You can check the status of any order at any time from My Orders in your account. Order status moves from Processing to Shipped to Delivered.',
          ],
        },
        {
          heading: 'Returns',
          paragraphs: [
            'If you\'re not satisfied with your purchase, most items can be returned within 14 days of delivery, provided they are unused, in their original packaging, and accompanied by proof of purchase.',
          ],
          bullets: [
            'Perishable goods and personal care items are not eligible for return',
            'Sale items are final unless faulty',
            'Return shipping costs are covered by the customer unless the item arrived damaged or incorrect',
          ],
        },
        {
          heading: 'Refunds',
          paragraphs: [
            'Once we receive and inspect your returned item, we\'ll notify you of the approval status. Approved refunds are issued to your original payment method within 5-10 business days.',
          ],
        },
        {
          heading: 'Damaged or Incorrect Items',
          paragraphs: [
            'If an item arrives damaged or isn\'t what you ordered, contact Help & Support within 48 hours of delivery with photos of the item, and we\'ll arrange a replacement or full refund at no extra cost.',
          ],
        },
        {
          heading: 'Need Help?',
          paragraphs: [
            'For anything not covered here, reach out through Help & Support in your account and our team will assist you.',
          ],
        },
      ]}
    />
  );
}
