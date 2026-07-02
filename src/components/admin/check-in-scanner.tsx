"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ScanLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkInTicketAction, type CheckInResult } from "@/app/admin/actions";

const SCANNER_ID = "ruma-qr-reader";

/** Extracts the qr_token from either a raw token or a full /ticket/<token> URL. */
function extractToken(text: string): string {
  const trimmed = text.trim();
  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? trimmed;
  } catch {
    return trimmed;
  }
}

type Outcome = NonNullable<CheckInResult["data"]>;

export function CheckInScanner() {
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [manual, setManual] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any>(null);
  const lockRef = useRef(false);

  async function submitToken(raw: string) {
    const token = extractToken(raw);
    if (!token || lockRef.current) return;
    lockRef.current = true;
    setBusy(true);
    await stopScanner();
    const res = await checkInTicketAction(token);
    setBusy(false);
    if (!res.ok) {
      setOutcome({ result: "invalid" });
    } else {
      setOutcome(res.data ?? { result: "invalid" });
    }
    lockRef.current = false;
  }

  async function startScanner() {
    setOutcome(null);
    setScanning(true);
    const { Html5Qrcode } = await import("html5-qrcode");
    const scanner = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded: string) => void submitToken(decoded),
        () => {},
      );
    } catch {
      setScanning(false);
    }
  }

  async function stopScanner() {
    const scanner = scannerRef.current;
    if (scanner) {
      try {
        await scanner.stop();
        await scanner.clear();
      } catch {
        /* already stopped */
      }
      scannerRef.current = null;
    }
    setScanning(false);
  }

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, []);

  return (
    <div className="space-y-5">
      {outcome ? (
        <OutcomeCard
          outcome={outcome}
          onNext={() => {
            setOutcome(null);
            void startScanner();
          }}
        />
      ) : (
        <>
          <div
            id={SCANNER_ID}
            className="aspect-square w-full overflow-hidden rounded-lg border border-gold/30 bg-charcoal/90"
          />
          {!scanning && (
            <Button
              size="lg"
              className="w-full"
              onClick={startScanner}
              disabled={busy}
            >
              {busy ? (
                <Loader2 className="animate-spin" />
              ) : (
                <ScanLine />
              )}
              Start scanning
            </Button>
          )}
          {scanning && (
            <Button
              size="lg"
              variant="secondary"
              className="w-full"
              onClick={stopScanner}
            >
              Stop
            </Button>
          )}
        </>
      )}

      {/* Manual fallback (accessibility / camera unavailable) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submitToken(manual);
          setManual("");
        }}
        className="rounded-lg border border-gold/20 bg-cream/50 p-4"
      >
        <Label htmlFor="manual-token">Enter ticket number manually</Label>
        <div className="flex gap-2">
          <Input
            id="manual-token"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="e.g. RUMA-AB12-CD34-01"
            autoCapitalize="characters"
          />
          <Button type="submit" variant="secondary" disabled={busy || !manual}>
            Check
          </Button>
        </div>
      </form>
    </div>
  );
}

function OutcomeCard({
  outcome,
  onNext,
}: {
  outcome: Outcome;
  onNext: () => void;
}) {
  const config = {
    valid: {
      icon: CheckCircle2,
      title: "Valid Ticket",
      cls: "border-kerala-600 bg-kerala-50 text-kerala-700",
    },
    already_checked_in: {
      icon: AlertTriangle,
      title: "Already Checked In",
      cls: "border-gold-600 bg-gold/10 text-gold-700",
    },
    invalid: {
      icon: XCircle,
      title: "Invalid Ticket",
      cls: "border-red-300 bg-red-50 text-maroon",
    },
    no_coupons: {
      icon: XCircle,
      title: "Invalid Ticket",
      cls: "border-red-300 bg-red-50 text-maroon",
    },
  }[outcome.result];

  const Icon = config.icon;

  return (
    <div className={`rounded-lg border-2 p-6 text-center ${config.cls}`}>
      <Icon className="mx-auto h-14 w-14" />
      <h2 className="mt-3 text-section-title font-bold">{config.title}</h2>
      {outcome.attendee && (
        <div className="mt-3 space-y-0.5 text-body text-charcoal">
          <p className="font-semibold">{outcome.attendee}</p>
          <p className="text-text-secondary">
            Flat {outcome.flat} · {outcome.ticket_type}
          </p>
          <p className="font-mono text-small text-text-secondary">
            {outcome.ticket_number}
          </p>
        </div>
      )}
      <Button size="lg" className="mt-5 w-full" onClick={onNext}>
        Scan next
      </Button>
    </div>
  );
}
