"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListToolbar } from "@/components/admin/list-toolbar";
import {
  createUserAction,
  updateUserRoleAction,
  setUserStatusAction,
  setUserPasswordAction,
} from "@/app/admin/(protected)/users/actions";
import type { StaffRole, UserStatus } from "@/lib/supabase/database.types";
import type { StaffListItem } from "@/lib/data/users";

const ROLE_OPTIONS: { value: StaffRole; label: string }[] = [
  { value: "admin", label: "Administrator" },
  { value: "committee", label: "Committee" },
  { value: "volunteer", label: "Volunteer" },
  { value: "scanner", label: "Scanner (check-in)" },
];

const ROLE_LABEL = Object.fromEntries(
  ROLE_OPTIONS.map((r) => [r.value, r.label]),
) as Record<StaffRole, string>;

const STATUS_VARIANT: Record<UserStatus, "success" | "neutral" | "danger"> = {
  active: "success",
  inactive: "neutral",
  suspended: "danger",
};

export function UsersManager({
  users,
  currentUserId,
}: {
  users: StaffListItem[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      `${u.fullName ?? ""} ${u.email} ${u.role}`.toLowerCase().includes(q),
    );
  }, [users, query]);

  function changeRole(userId: string, role: StaffRole) {
    startTransition(async () => {
      const res = await updateUserRoleAction(userId, role);
      if (!res.ok) {
        toast.error(res.error ?? "Could not update role.");
        return;
      }
      toast.success("Role updated.");
      router.refresh();
    });
  }

  function toggleStatus(userId: string, current: UserStatus) {
    const next: UserStatus = current === "active" ? "inactive" : "active";
    startTransition(async () => {
      const res = await setUserStatusAction(userId, next);
      if (!res.ok) {
        toast.error(res.error ?? "Could not update status.");
        return;
      }
      toast.success(next === "active" ? "User reactivated." : "User deactivated.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setShowAdd((s) => !s)}>
          <UserPlus /> Add user
        </Button>
      </div>

      {showAdd && (
        <AddUserForm
          pending={pending}
          onDone={() => {
            setShowAdd(false);
            router.refresh();
          }}
        />
      )}

      <ListToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search by name, email or role"
        count={filtered.length}
      />

      <Card className="divide-y divide-gold/15">
        {filtered.map((u) => {
          const isSelf = u.userId === currentUserId;
          return (
            <div
              key={u.userId}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-body font-semibold text-charcoal">
                  {u.fullName ?? u.email}
                  {isSelf && (
                    <span className="rounded bg-cream px-1.5 py-0.5 text-caption text-text-secondary">
                      You
                    </span>
                  )}
                </p>
                <p className="truncate text-small text-text-secondary">{u.email}</p>
                <p className="text-caption text-text-muted">
                  {u.lastSignInAt
                    ? `Last active ${new Date(u.lastSignInAt).toLocaleDateString("en-IN")}`
                    : "Never signed in"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={STATUS_VARIANT[u.status]}>{u.status}</Badge>
                {isSelf ? (
                  <span className="flex items-center gap-1 rounded-md border border-gold/30 px-3 py-2 text-small text-text-secondary">
                    <ShieldCheck className="h-4 w-4" /> {ROLE_LABEL[u.role]}
                  </span>
                ) : (
                  <>
                    <select
                      value={u.role}
                      disabled={pending}
                      onChange={(e) => changeRole(u.userId, e.target.value as StaffRole)}
                      className="h-10 rounded-md border border-field bg-white px-3 text-small text-charcoal"
                      aria-label={`Role for ${u.email}`}
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant={u.status === "active" ? "danger" : "secondary"}
                      size="sm"
                      disabled={pending}
                      onClick={() => toggleStatus(u.userId, u.status)}
                    >
                      {u.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                  </>
                )}
                <PasswordReset userId={u.userId} />
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function PasswordReset({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await setUserPasswordAction(userId, password);
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error ?? "Could not set password.");
      return;
    }
    toast.success("Password updated. Share it with the user.");
    setOpen(false);
    setPassword("");
  }

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Set password
      </Button>
    );
  }
  return (
    <span className="flex items-center gap-1.5">
      <Input
        type="text"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password (min 8)"
        className="h-10 w-44"
      />
      <Button size="sm" onClick={save} disabled={saving || password.length < 8}>
        {saving ? <Loader2 className="animate-spin" /> : "Save"}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </span>
  );
}

function AddUserForm({
  pending,
  onDone,
}: {
  pending: boolean;
  onDone: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("volunteer");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await createUserAction({ fullName, email, password, role });
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error ?? "Could not add user.");
      return;
    }
    toast.success("User added. Share their email and password to sign in.");
    onDone();
  }

  return (
    <Card className="p-5">
      <h2 className="mb-4 text-card-title font-semibold text-charcoal">
        Add a dashboard user
      </h2>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label required>Full name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <Label required>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label required>Temporary password</Label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
            />
          </div>
          <div>
            <Label required>Role</Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as StaffRole)}
              className="h-12 w-full rounded-md border border-field bg-white px-4 text-body text-charcoal"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-caption text-text-muted">
          The user signs in at /admin/login with this email and password, and can
          change their password later.
        </p>
        <Button type="submit" size="lg" className="w-full" disabled={submitting || pending}>
          {submitting ? <Loader2 className="animate-spin" /> : <UserPlus />}
          Create user
        </Button>
      </form>
    </Card>
  );
}
