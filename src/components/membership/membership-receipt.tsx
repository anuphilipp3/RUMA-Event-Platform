import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";

export interface MembershipReceiptProps {
  associationName: string;
  associationAddress: string;
  receiptNo: string;
  date: string;
  receivedFrom: string;
  flat: string;
  membership: string; // "Annual Membership" | "Long-term Membership"
  amount: string; // formatted ₹
  amountWords: string;
  validUntil: string;
  reference: string;
  paymentMode?: string;
  transactionRef?: string;
  members: string[];
  signatory: string;
}

const GREEN = "#0F6A4A";
const GREEN_DARK = "#0B543A";
const GOLD = "#D4A017";
const CHARCOAL = "#1F2933";
const MUTED = "#7A8794";
const LINE = "#EAE3D2";
const CREAM = "#F8F3E8";

const s = StyleSheet.create({
  page: { backgroundColor: "#FFFFFF", padding: 40, fontSize: 11, color: CHARCOAL },
  frame: { borderWidth: 1, borderColor: LINE, borderRadius: 14, overflow: "hidden" },

  header: { backgroundColor: GREEN, paddingHorizontal: 28, paddingTop: 22, paddingBottom: 20 },
  gold: { height: 3, backgroundColor: GOLD },
  eyebrow: { color: GOLD, fontSize: 8, letterSpacing: 3, marginBottom: 6 },
  org: { color: "#FFFFFF", fontSize: 17, fontWeight: 700 },
  address: { color: "#CFE6DB", fontSize: 8.5, marginTop: 4, lineHeight: 1.4 },

  body: { padding: 28 },
  metaRow: { flexDirection: "row", justifyContent: "space-between" },
  metaLabel: { fontSize: 8, color: MUTED, textTransform: "uppercase", letterSpacing: 1 },
  metaValue: { fontSize: 11, color: CHARCOAL, fontWeight: 700, marginTop: 2 },

  received: { fontSize: 9, color: MUTED, marginTop: 20 },
  name: { fontSize: 20, fontWeight: 700, color: CHARCOAL, marginTop: 2 },

  amountCard: {
    marginTop: 18,
    backgroundColor: CREAM,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: GOLD,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  amountLabel: { fontSize: 8, color: MUTED, textTransform: "uppercase", letterSpacing: 1 },
  amount: { fontSize: 26, fontWeight: 700, color: GREEN, marginTop: 2 },
  amountWords: { fontSize: 10, color: MUTED, marginTop: 4, fontStyle: "italic" },

  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 22 },
  cell: { width: "50%", marginBottom: 14 },
  label: { fontSize: 8, color: MUTED, textTransform: "uppercase", letterSpacing: 1 },
  value: { fontSize: 12, color: CHARCOAL, marginTop: 2 },

  members: { marginTop: 4 },
  membersText: { fontSize: 11, color: CHARCOAL, marginTop: 2, lineHeight: 1.5 },

  sig: { marginTop: 40, flexDirection: "row", justifyContent: "flex-end" },
  sigInner: { alignItems: "center", width: 200 },
  sigLine: { borderTopWidth: 1, borderTopColor: LINE, width: "100%", marginBottom: 6 },
  sigTitle: { fontSize: 9, fontWeight: 700, color: CHARCOAL },
  sigName: { fontSize: 9, color: MUTED, marginTop: 1 },

  footer: { fontSize: 8, color: MUTED, textAlign: "center", marginTop: 26, paddingTop: 12, borderTopWidth: 1, borderTopColor: LINE },
});

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.cell}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}

export function MembershipReceipt(p: MembershipReceiptProps) {
  return (
    <Document title={`Membership Receipt — ${p.receiptNo}`}>
      <Page size="A4" style={s.page}>
        <View style={s.frame}>
          <View style={s.header}>
            <Text style={s.eyebrow}>MEMBERSHIP RECEIPT</Text>
            <Text style={s.org}>{p.associationName}</Text>
            <Text style={s.address}>{p.associationAddress}</Text>
          </View>
          <View style={s.gold} />

          <View style={s.body}>
            <View style={s.metaRow}>
              <View>
                <Text style={s.metaLabel}>Receipt No.</Text>
                <Text style={s.metaValue}>{p.receiptNo}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={s.metaLabel}>Date</Text>
                <Text style={s.metaValue}>{p.date}</Text>
              </View>
            </View>

            <Text style={s.received}>Received with thanks from</Text>
            <Text style={s.name}>{p.receivedFrom}</Text>

            <View style={s.amountCard}>
              <Text style={s.amountLabel}>Amount received · {p.membership}</Text>
              <Text style={s.amount}>{p.amount}</Text>
              <Text style={s.amountWords}>{p.amountWords}</Text>
            </View>

            <View style={s.grid}>
              <Cell label="Flat" value={p.flat} />
              <Cell label="Membership" value={p.membership} />
              <Cell label="Valid until" value={p.validUntil} />
              <Cell label="Reference" value={p.reference} />
              {p.paymentMode ? (
                <Cell label="Mode of payment" value={p.paymentMode} />
              ) : null}
              {p.transactionRef ? (
                <Cell label="Transaction ref" value={p.transactionRef} />
              ) : null}
            </View>

            {p.members.length > 0 && (
              <View style={s.members}>
                <Text style={s.label}>Members ({p.members.length})</Text>
                <Text style={s.membersText}>{p.members.join(" · ")}</Text>
              </View>
            )}

            <View style={s.sig}>
              <View style={s.sigInner}>
                <View style={s.sigLine} />
                <Text style={s.sigTitle}>Authorised Signatory</Text>
                <Text style={s.sigName}>{p.signatory}</Text>
              </View>
            </View>

            <Text style={s.footer}>
              This is a computer-generated receipt and does not require a physical signature.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
