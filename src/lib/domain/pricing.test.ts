// Run: node --test src/lib/domain/pricing.test.ts  (Node 22.18+/24 strips TS types)
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSummary } from "./pricing.ts";

const types = [
  { id: "a", name: "Adult", category: "adult" as const, price: 500 },
  { id: "c", name: "Child 5-12", category: "child_5_12" as const, price: 250 },
  { id: "f", name: "Child <5", category: "child_below_5" as const, price: 0 },
];

test("totals, paid-ticket count, and coupons", () => {
  const s = buildSummary(
    types,
    [
      { ticketTypeId: "a", quantity: 2 },
      { ticketTypeId: "c", quantity: 1 },
      { ticketTypeId: "f", quantity: 3 },
    ],
    1,
  );
  assert.equal(s.totalPayable, 1250); // 2*500 + 1*250
  assert.equal(s.totalTickets, 6);
  assert.equal(s.paidTickets, 3); // free children excluded
  assert.equal(s.luckyDrawCoupons, 3); // 1 per paid ticket
});

test("zero-quantity lines are dropped", () => {
  const s = buildSummary(types, [{ ticketTypeId: "a", quantity: 0 }], 1);
  assert.equal(s.lines.length, 0);
  assert.equal(s.totalPayable, 0);
});

test("unknown ticket type throws", () => {
  assert.throws(() => buildSummary(types, [{ ticketTypeId: "x", quantity: 1 }], 1));
});
