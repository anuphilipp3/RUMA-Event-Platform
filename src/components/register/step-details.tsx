"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registrationSchema, type RegistrationInput } from "@/lib/domain/validation";

interface StepDetailsProps {
  defaultValues: RegistrationInput;
  onSubmit: (values: RegistrationInput) => void;
}

export function StepDetails({ defaultValues, onSubmit }: StepDetailsProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues,
    mode: "onTouched",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <Label htmlFor="fullName" required>
          Full Name
        </Label>
        <Input
          id="fullName"
          autoComplete="name"
          placeholder="e.g. Priya Menon"
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? "fullName-error" : undefined}
          {...register("fullName")}
        />
        <FieldError id="fullName-error" message={errors.fullName?.message} />
      </div>

      <div>
        <Label htmlFor="flatNumber" required>
          Flat Number
        </Label>
        <Input
          id="flatNumber"
          placeholder="e.g. B-402"
          aria-invalid={!!errors.flatNumber}
          aria-describedby={errors.flatNumber ? "flatNumber-error" : undefined}
          {...register("flatNumber")}
        />
        <FieldError id="flatNumber-error" message={errors.flatNumber?.message} />
      </div>

      <div>
        <Label htmlFor="phone" required>
          Phone Number
        </Label>
        <Input
          id="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="10-digit mobile number"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          {...register("phone")}
        />
        <FieldError id="phone-error" message={errors.phone?.message} />
      </div>

      <div>
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        <FieldError id="email-error" message={errors.email?.message} />
      </div>

      <Button type="submit" size="lg" className="w-full">
        Continue to Tickets
      </Button>
    </form>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-small text-maroon">
      {message}
    </p>
  );
}
