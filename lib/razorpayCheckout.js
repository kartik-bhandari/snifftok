/**
 * lib/razorpayCheckout.js
 * Opens Razorpay Checkout for an order created by the API. The script is only
 * loaded when someone actually checks out.
 */

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let scriptPromise = null;

function loadScript() {
  if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SCRIPT_SRC;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error("Couldn't load the payment window. Check your connection and try again."));
      };
      document.body.appendChild(s);
    });
  }
  return scriptPromise;
}

/**
 * @param {{ keyId, orderId, amount, currency }} razorpay  from the API
 * @param {{ orderNumber, prefill: { name, email, contact } }} details
 * @returns {Promise<{ status: 'paid', response } | { status: 'dismissed', error? }>}
 *   response = { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export async function openRazorpayCheckout(razorpay, { orderNumber, prefill }) {
  await loadScript();

  return new Promise((resolve) => {
    let lastError = null;
    const rzp = new window.Razorpay({
      key:         razorpay.keyId,
      order_id:    razorpay.orderId,
      amount:      razorpay.amount,
      currency:    razorpay.currency,
      name:        "snifftok",
      description: `Order ${orderNumber}`,
      prefill,
      theme:       { color: "#0A0A0A" },
      handler:     (response) => resolve({ status: "paid", response }),
      modal:       { ondismiss: () => resolve({ status: "dismissed", error: lastError }) },
    });
    // Razorpay keeps its window open after a failure so the shopper can retry;
    // remember the reason in case they close it.
    rzp.on("payment.failed", (resp) => {
      lastError = resp?.error?.description || "Payment failed.";
    });
    rzp.open();
  });
}
