// Currency formatting utility for Indian Rupee
export const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString('en-IN')}`;
};

// Format date in a readable way
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Calculate discount percentage from original and sale price
export const calculateDiscountPercentage = (
  originalPrice: number | undefined | null,
  salePrice: number
): number => {
  if (!originalPrice || originalPrice <= salePrice || originalPrice <= 0) {
    return 0;
  }
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};
