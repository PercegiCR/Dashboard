/**
 * Utility functions for product sizes, prices, and formatting.
 */

export const formatRp = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(angka) || 0);
};

/**
 * Normalizes product sizes into an array of { size: string, price: number }.
 * Compatible with legacy array-of-strings and comma-separated string formats.
 */
export const getProductSizes = (product) => {
  if (!product) return [];

  const rawSizes = (Array.isArray(product.sizes) && product.sizes.length > 0)
    ? product.sizes
    : (product.size ? String(product.size).split(',').map(s => s.trim()).filter(Boolean) : []);

  const basePrice = Number(product.price) || 0;

  return rawSizes.map(item => {
    if (typeof item === 'object' && item !== null) {
      const sizeName = String(item.size || item.name || '').trim();
      const priceNum = (item.price !== undefined && item.price !== null && item.price !== '' && !isNaN(Number(item.price)))
        ? Number(item.price)
        : basePrice;
      return {
        size: sizeName,
        price: priceNum
      };
    }

    // If string like "200g" or "200g (Rp 65.000)"
    const rawStr = String(item).trim();
    // Check if it has embedded price like "200g (Rp 65.000)"
    const match = rawStr.match(/^(.*?)\s*\((?:Rp\.?|IDR)?\s*([0-9.,]+)\)$/i);
    if (match) {
      const parsedName = match[1].trim();
      const parsedPrice = Number(match[2].replace(/[.,]/g, '')) || basePrice;
      return { size: parsedName, price: parsedPrice };
    }

    return {
      size: rawStr,
      price: basePrice
    };
  }).filter(s => Boolean(s.size));
};

/**
 * Get the price for a specific size of a product.
 * Falls back to product base price if size not found or product has no sizes.
 */
export const getSizePrice = (product, sizeName) => {
  if (!product) return 0;
  const sizes = getProductSizes(product);
  if (sizes.length === 0) return Number(product.price) || 0;
  if (!sizeName || sizeName === '-') return Number(sizes[0].price) || Number(product.price) || 0;

  const match = sizes.find(s => s.size.toLowerCase() === String(sizeName).toLowerCase().trim());
  if (match) return Number(match.price);

  return Number(sizes[0].price) || Number(product.price) || 0;
};

/**
 * Formats product price for display.
 * If product has multiple sizes with different prices, returns a range e.g. "Rp 65.000 - Rp 150.000".
 */
export const getProductPriceDisplay = (product) => {
  if (!product) return 'Rp 0';
  const sizes = getProductSizes(product);
  if (sizes.length === 0) return formatRp(product.price || 0);

  const prices = sizes.map(s => Number(s.price) || 0);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === max) return formatRp(min);
  return `${formatRp(min)} - ${formatRp(max)}`;
};
