/**
 * UPI deep links. A UPI QR and every wallet button are built from the same
 * payee VPA + amount, so scanning or tapping opens the app with everything
 * prefilled. The generic `upi://pay` link is what a QR encodes and what
 * Android's app chooser understands; branded schemes target a specific app.
 */

export interface UpiParams {
  vpa: string; // payee UPI ID, e.g. ruma-onam@upi
  payeeName: string; // shown in the app
  amount: number; // INR
  note?: string; // transaction note (we pass the booking reference)
}

function query(params: UpiParams): string {
  const q = new URLSearchParams({
    pa: params.vpa,
    pn: params.payeeName,
    am: params.amount.toFixed(2),
    cu: "INR",
  });
  if (params.note) q.set("tn", params.note);
  return q.toString();
}

/** Canonical `upi://pay?...` — used for the QR and the "any UPI app" button. */
export function upiLink(params: UpiParams): string {
  return `upi://pay?${query(params)}`;
}

export interface WalletOption {
  key: string;
  label: string;
  /** Deep link that opens this specific app, or the generic upi:// link. */
  href: (params: UpiParams) => string;
  brandClass: string; // small colour chip for the icon
}

/**
 * Wallet buttons. Schemes vary by app version/OS, so every button also works
 * as a plain UPI intent on Android; the QR is the universal fallback.
 */
export const UPI_WALLETS: WalletOption[] = [
  {
    key: "gpay",
    label: "Google Pay",
    href: (p) => `tez://upi/pay?${query(p)}`,
    brandClass: "bg-[#1a73e8]",
  },
  {
    key: "phonepe",
    label: "PhonePe",
    href: (p) => `phonepe://pay?${query(p)}`,
    brandClass: "bg-[#5f259f]",
  },
  {
    key: "paytm",
    label: "Paytm",
    href: (p) => `paytmmp://pay?${query(p)}`,
    brandClass: "bg-[#00baf2]",
  },
  {
    key: "bhim",
    label: "BHIM / Other",
    href: (p) => upiLink(p),
    brandClass: "bg-[#0f6a4a]",
  },
];
