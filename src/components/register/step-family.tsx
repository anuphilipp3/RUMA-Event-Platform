"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Users, Loader2, CheckCircle2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { lookupFamily } from "@/app/e/[slug]/register/actions";
import type { FamilyMatch } from "@/lib/data/families-lookup";

interface StepFamilyProps {
  onUseFamily: (family: FamilyMatch) => void;
  onGuest: () => void;
}

export function StepFamily({ onUseFamily, onGuest }: StepFamilyProps) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [match, setMatch] = useState<FamilyMatch | null>(null);
  const [searched, setSearched] = useState(false);

  async function search() {
    if (!/^[6-9]\d{9}$/.test(phone.trim())) return;
    setLoading(true);
    const res = await lookupFamily(phone.trim());
    setLoading(false);
    setSearched(true);
    setMatch(res.found ? (res.family ?? null) : null);
  }

  return (
    <div>
      <h1 className="font-display text-section-title font-semibold text-charcoal">
        Is your family with RUMA?
      </h1>
      <p className="mt-1 text-small text-text-secondary">
        Find your family to auto-fill your details, or register as a guest.
      </p>

      <div className="mt-5">
        <Label htmlFor="family-phone">Registered mobile number</Label>
        <div className="flex gap-2">
          <Input
            id="family-phone"
            inputMode="numeric"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setSearched(false);
              setMatch(null);
            }}
            placeholder="10-digit mobile number"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={search}
            disabled={loading || !/^[6-9]\d{9}$/.test(phone.trim())}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
            Find
          </Button>
        </div>
      </div>

      {match && (
        <Card className="mt-4 border-kerala-600/30 bg-kerala-50/60 p-4">
          <div className="flex items-center gap-2 text-kerala-700">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-body font-semibold">
              {match.familyName} Family
            </p>
          </div>
          <p className="mt-0.5 text-small text-text-secondary">
            Flat {match.flatNumber} · {match.memberCount} member
            {match.memberCount === 1 ? "" : "s"}
          </p>
          <Button
            size="lg"
            className="mt-3 w-full"
            onClick={() => onUseFamily(match)}
          >
            <Users /> Use this family
          </Button>
        </Card>
      )}

      {searched && !match && (
        <Card className="mt-4 border-gold/30 bg-gold/5 p-4">
          <p className="text-body font-medium text-charcoal">
            No family found with that number.
          </p>
          <p className="mt-0.5 text-small text-text-secondary">
            You can still register as a guest, or become a member to save your
            family for next time.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button variant="secondary" className="flex-1" asChild>
              <Link href="/membership" target="_blank">
                <UserPlus /> Become a member
              </Link>
            </Button>
            <Button className="flex-1" onClick={onGuest}>
              Continue as guest
            </Button>
          </div>
        </Card>
      )}

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onGuest}
          className="text-small text-text-secondary underline-offset-2 hover:underline"
        >
          Skip — register as a guest
        </button>
      </div>
    </div>
  );
}
