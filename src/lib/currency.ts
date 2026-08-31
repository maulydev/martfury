/**
 * Currency formatting utilities for Ghana Cedis (GHS)
 */

export function formatGHS(amount: number | string, showCode: boolean = true): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '₵0.00';
  }

  const formatted = numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return showCode ? `₵${formatted} GHS` : `₵${formatted}`;
}

export function formatCurrency(
  amount: number | string,
  symbol: string = '₵',
  showCode?: string
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return `${symbol}0.00`;
  }

  const formatted = numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return showCode ? `${symbol}${formatted} ${showCode}` : `${symbol}${formatted}`;
}

export function parseCurrency(currencyString: string): number {
  const cleaned = currencyString
    .replace(/[₵$€£¥]/g, '')
    .replace(/\s/g, '')
    .replace(/GHS|USD|EUR|GBP|JPY/gi, '')
    .replace(/,/g, '');
  
  return parseFloat(cleaned) || 0;
}

export function getDiscountAmount(
  originalPrice: number,
  discountPercent: number
): number {
  return (originalPrice * discountPercent) / 100;
}

export function getPriceAfterDiscount(
  originalPrice: number,
  discountPercent: number
): number {
  return originalPrice - getDiscountAmount(originalPrice, discountPercent);
}

export function getDiscountPercent(
  originalPrice: number,
  salePrice: number
): number {
  if (originalPrice === 0) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}
