/**
 * lib/checkoutResume.js
 * Checkout needs an account. When a guest presses checkout we send them to
 * sign in and remember to reopen checkout once they're back.
 */

const KEY = "snifftok_resume_checkout";

export function rememberCheckout() {
  try { sessionStorage.setItem(KEY, "1"); } catch { /* storage blocked — they'll reopen the bag themselves */ }
}

/** True once, right after sign-in, if checkout should reopen */
export function takeResumeCheckout() {
  try {
    if (sessionStorage.getItem(KEY) !== "1") return false;
    sessionStorage.removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}
