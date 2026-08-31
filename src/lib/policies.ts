/**
 * Static store policy text, mirrored verbatim from the backend's own
 * src/lib/policies.ts (~/Desktop/ecommerce-project — read-only reference,
 * never edited). The AI assistant's getStorePolicy tool (see
 * ai-assistant.ts) hands these to Gemini so it can summarize them
 * conversationally, the same way the web assistant does.
 */

export const REFUND_POLICY = `
# Refund Policy

**Last Updated: May 2026**

At MartFury, we want you to be completely satisfied with your purchase. If you are not entirely happy with your order, we are here to help.

## Returns
- You have **30 calendar days** to return an item from the date you received it.
- To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging.
- Your item must have the receipt or proof of purchase.

## Refunds
- Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.
- If your return is approved, we will initiate a refund to your original payment method (Stripe/Paystack).
- You will receive the credit within a certain amount of days, depending on your card issuer's policies (usually 5-10 business days).

## Shipping
- You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable.
- If you receive a refund, the cost of return shipping will be deducted from your refund.

## Contact Us
If you have any questions on how to return your item to us, contact our support team at support@martfury.com.
`;

export const PRIVACY_POLICY = `
# Privacy Policy

**Last Updated: May 2026**

MartFury ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by MartFury.

## Information We Collect
- **Personal Information**: When you make a purchase or sign up, we collect personal information such as your name, email address, shipping address, billing address, phone number, and payment details.
- **Usage Data**: We may collect information about how you access and use our store, including IP address, browser type, and pages visited.

## How We Use Your Information
- To process and deliver your orders.
- To manage payments, fees, and charges via secure processors (Stripe/Paystack).
- To communicate with you regarding your orders, inquiries, or marketing promotions (if opted-in).
- To improve our website performance, layout, and user experience.

## Sharing Your Information
We do not sell, rent, or trade your personal information. We only share information with trusted third-party services necessary for store operation:
- Payment processors (Stripe and Paystack) for processing checkouts.
- Database and hosting providers.

## Security of Your Information
We implement state-of-the-art security measures (SSL encryption, secure APIs) to protect your personal data. However, no method of transmission over the Internet is 100% secure.

## Your Rights
You have the right to access, update, or request deletion of the personal information we hold about you. Contact support@martfury.com for assistance.
`;

export const TERMS_OF_SERVICE = `
# Terms of Service

**Last Updated: May 2026**

Welcome to MartFury. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions.

## 1. Use of the Site
- You must be at least 18 years old or accessing the site under the supervision of a parent or guardian.
- You agree to use the site only for lawful purposes and in a way that does not infringe the rights of others.

## 2. Products and Pricing
- All descriptions, images, and prices of products are subject to change at any time without notice.
- We reserve the right to limit the sales of our products to any person, geographic region, or jurisdiction.
- In the event a product is listed at an incorrect price, we reserve the right to refuse or cancel orders placed for the product.

## 3. Payments
- All payments are processed securely. You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store.

## 4. Limitation of Liability
- MartFury shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the site or products purchased.

## 5. Governing Law
- These Terms of Service shall be governed by and construed in accordance with local ecommerce regulations and laws.
`;

export const RETURN_POLICY = `
# Return Policy

**Last Updated: May 2026**

We offer a flexible **30-day return policy** on most items. If you would like to return an item, please read the conditions below:

## Conditions for Returns
- Items must be returned within **30 calendar days** of delivery.
- Items must be unused, in the same condition you received them, and in their original packaging.
- You must provide a valid receipt or proof of purchase.

## How to Initiate a Return
1. Contact our customer service team at support@martfury.com.
2. Provide your order number and details about the product you wish to return.
3. Our team will provide shipping instructions.

## Return Shipping Costs
- Customers are responsible for their own return shipping fees. Shipping fees are non-refundable.
- If you receive a refund, the cost of return shipping will be deducted from your final refund amount.
`;
