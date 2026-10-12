/**
 * Shipping calculation rules:
 * - Bottles: ₹80 each
 * - Testers: ₹80 per group of 5 (rounded up)
 * - Empty cart: ₹0
 */
export function calculateShipping(items = []) {
  if (!items || items.length === 0) {
    return {
      bottlesCount: 0,
      testersCount: 0,
      bottlesShipping: 0,
      testersShipping: 0,
      totalShipping: 0,
      formattedShipping: "₹0",
      testerBundleSize: 5,
      testersNeededForNextBundle: 0,
      isTesterDiscountEligible: false,
    };
  }

  let bottlesCount = 0;
  let testersCount = 0;

  for (const item of items) {
    const qty = item.quantity || 1;
    if (item.variantType?.toLowerCase() === "tester" || item.isTester) {
      testersCount += qty;
    } else {
      bottlesCount += qty;
    }
  }

  const bottlesShipping = bottlesCount * 80;
  const testersShipping = Math.ceil(testersCount / 5) * 80;
  const totalShipping = bottlesShipping + testersShipping;

  const remainder = testersCount % 5;
  const testersNeededForNextBundle = remainder === 0 ? 0 : 5 - remainder;
  const isTesterDiscountEligible = testersCount >= 5;

  return {
    bottlesCount,
    testersCount,
    bottlesShipping,
    testersShipping,
    totalShipping,
    formattedShipping: totalShipping === 0 ? "Free" : `₹${totalShipping.toLocaleString("en-IN")}`,
    testerBundleSize: 5,
    testersNeededForNextBundle,
    isTesterDiscountEligible,
  };
}

export function formatPrice(rawNumber) {
  if (typeof rawNumber !== "number") return rawNumber;
  return `₹${rawNumber.toLocaleString("en-IN")}`;
}
