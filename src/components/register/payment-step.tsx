"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Copy, Upload, Loader2, CheckCircle2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { upiLink, UPI_WALLETS, type UpiParams } from "@/lib/upi";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
} from "@/lib/domain/validation";

interface PaymentStepProps {
  registrationId: string;
  bookingReference: string;
  amount: number;
  upiId: string | null;
  upiPayeeName: string | null;
  onUploaded: () => void;
}

export function PaymentStep({
  registrationId,
  bookingReference,
  amount,
  upiId,
  upiPayeeName,
  onUploaded,
}: PaymentStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upiParams: UpiParams | null = upiId
    ? {
        vpa: upiId,
        payeeName: upiPayeeName ?? "RUMA Residents Association",
        amount,
        note: bookingReference,
      }
    : null;

  // Generate the UPI QR in the browser (encodes the same upi://pay link).
  useEffect(() => {
    if (!upiParams) return;
    let active = true;
    import("qrcode").then((QR) => {
      QR.toDataURL(upiLink(upiParams), {
        errorCorrectionLevel: "M",
        margin: 1,
        scale: 6,
        color: { dark: "#1F2933", light: "#FFFFFF" },
      }).then((url) => {
        if (active) setQr(url);
      });
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upiId, amount, bookingReference]);

  function selectFile(f: File | undefined) {
    if (!f) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(f.type as never)) {
      toast.error("Please choose a JPG, PNG, or WebP image.");
      return;
    }
    if (f.size > MAX_UPLOAD_BYTES) {
      toast.error("Image is too large. Please keep it under 5 MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function upload() {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`/api/registrations/${registrationId}/payment`, {
        method: "POST",
        body,
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Upload failed");
      onUploaded();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "We could not upload your screenshot. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  function copyUpi() {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId).then(
      () => toast.success("UPI ID copied"),
      () => toast.error("Could not copy. Please copy it manually."),
    );
  }

  return (
    <div className="space-y-6">
      {/* Amount */}
      <div className="rounded-lg border border-gold/30 bg-cream/60 p-5 text-center">
        <p className="text-small text-text-secondary">Amount to pay</p>
        <p className="text-hero font-bold leading-none text-kerala-700">
          {formatINR(amount)}
        </p>
        <p className="mt-2 text-caption uppercase tracking-wide text-text-muted">
          Booking {bookingReference}
        </p>
      </div>

      {upiParams ? (
        <>
          {/* Wallet buttons — open the app with payee + amount prefilled */}
          <div>
            <p className="mb-2 text-body font-medium text-charcoal">
              Pay with your UPI app
            </p>
            <div className="grid grid-cols-2 gap-2">
              {UPI_WALLETS.map((w) => (
                <a
                  key={w.key}
                  href={w.href(upiParams)}
                  className="flex items-center gap-2.5 rounded-md border border-gold/30 bg-white px-3 py-3 text-body font-medium text-charcoal transition-colors hover:border-kerala-600 hover:bg-kerala-50"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-caption font-bold text-white ${w.brandClass}`}
                  >
                    {w.label[0]}
                  </span>
                  {w.label}
                </a>
              ))}
            </div>
            <p className="mt-2 text-caption text-text-muted">
              Opens your payment app on mobile. On desktop, scan the QR below.
            </p>
          </div>

          {/* QR + copyable UPI ID */}
          <div className="flex flex-col items-center rounded-lg border border-gold/30 bg-white p-5">
            <p className="mb-3 flex items-center gap-1.5 text-small font-medium text-text-secondary">
              <QrCode className="h-4 w-4" /> Scan to pay
            </p>
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qr}
                alt="UPI payment QR code"
                width={180}
                height={180}
                className="rounded-md"
              />
            ) : (
              <div className="h-[180px] w-[180px] animate-pulse rounded-md bg-cream" />
            )}
            <div className="mt-4 flex items-center gap-2">
              <code className="rounded bg-cream px-2 py-1 text-small font-semibold text-charcoal">
                {upiId}
              </code>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={copyUpi}
              >
                <Copy /> Copy
              </Button>
            </div>
            <p className="mt-2 text-caption text-text-muted">
              Paying {upiPayeeName ?? "RUMA Residents Association"}
            </p>
          </div>
        </>
      ) : (
        <p className="rounded-md border border-gold/30 bg-cream/50 p-4 text-small text-text-secondary">
          Payment details will be shared by the organizers.
        </p>
      )}

      {/* Screenshot upload */}
      <div>
        <p className="mb-2 text-body font-medium text-charcoal">
          Upload payment screenshot
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="sr-only"
          onChange={(e) => selectFile(e.target.files?.[0])}
        />

        {preview ? (
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-md border border-gold/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Payment screenshot preview"
                className="max-h-72 w-full bg-white object-contain"
              />
              <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-kerala-600 px-2 py-0.5 text-caption font-semibold text-white">
                <CheckCircle2 className="h-3.5 w-3.5" /> Selected
              </span>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              Choose a different image
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-gold/40 bg-white px-4 py-10 text-center transition-colors hover:border-kerala-600 hover:bg-kerala-50"
          >
            <Upload className="h-6 w-6 text-kerala-600" />
            <span className="text-body font-medium text-charcoal">
              Tap to upload screenshot
            </span>
            <span className="text-small text-text-muted">
              JPG, PNG or WebP · up to 5 MB
            </span>
          </button>
        )}
      </div>

      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={!file || uploading}
        onClick={upload}
      >
        {uploading ? (
          <>
            <Loader2 className="animate-spin" /> Submitting…
          </>
        ) : (
          "Submit for Approval"
        )}
      </Button>
    </div>
  );
}
