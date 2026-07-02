import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

export interface PdfTicket {
  ticketNumber: string;
  ticketTypeName: string;
  status: string;
  qrPngDataUrl: string;
}

export interface TicketPdfProps {
  eventName: string;
  venue: string;
  attendeeName: string;
  flatNumber: string;
  bookingReference: string;
  tickets: PdfTicket[];
}

const KERALA = "#0F6A4A";
const GOLD = "#D4A017";
const IVORY = "#FFFDF8";
const CHARCOAL = "#1F2933";
const MUTED = "#667085";

const s = StyleSheet.create({
  // Portrait A4, one ticket centred per page.
  page: {
    backgroundColor: IVORY,
    paddingVertical: 48,
    paddingHorizontal: 60,
    color: CHARCOAL,
    alignItems: "center",
  },
  card: {
    width: 300,
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  header: {
    backgroundColor: KERALA,
    paddingVertical: 20,
    paddingHorizontal: 22,
    alignItems: "center",
  },
  goldLine: { height: 3, backgroundColor: GOLD },
  eyebrow: { color: GOLD, fontSize: 8, letterSpacing: 3 },
  eventName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: 700,
    marginTop: 6,
    textAlign: "center",
  },
  typePill: {
    marginTop: 10,
    backgroundColor: GOLD,
    color: CHARCOAL,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  body: { paddingVertical: 22, paddingHorizontal: 24, alignItems: "center" },
  smallLabel: {
    fontSize: 7,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  attendee: { fontSize: 16, fontWeight: 700, color: CHARCOAL, marginTop: 2 },
  flat: { fontSize: 10, color: MUTED, marginTop: 1 },
  qr: {
    width: 168,
    height: 168,
    marginVertical: 18,
    borderWidth: 1,
    borderColor: "#EAE3D2",
    borderRadius: 10,
    padding: 6,
  },
  scan: { fontSize: 7, color: MUTED, letterSpacing: 2, textTransform: "uppercase" },
  divider: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#EAE3D2",
    borderStyle: "dashed",
    marginTop: 18,
    paddingTop: 12,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  rowLabel: { fontSize: 7, color: MUTED, textTransform: "uppercase", letterSpacing: 1 },
  rowValue: { fontSize: 9, fontWeight: 700, color: CHARCOAL },
  footer: {
    marginTop: 20,
    fontSize: 8,
    color: MUTED,
    textAlign: "center",
    maxWidth: 300,
  },
});

function TicketPage({
  t,
  props,
}: {
  t: PdfTicket;
  props: TicketPdfProps;
}) {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.card}>
        <View style={s.header}>
          <Text style={s.eyebrow}>RUMA ONAM · DIGITAL PASS</Text>
          <Text style={s.eventName}>{props.eventName}</Text>
          <Text style={s.typePill}>{t.ticketTypeName}</Text>
        </View>
        <View style={s.goldLine} />

        <View style={s.body}>
          <Text style={s.smallLabel}>Attendee</Text>
          <Text style={s.attendee}>{props.attendeeName}</Text>
          <Text style={s.flat}>Flat {props.flatNumber}</Text>

          <Image style={s.qr} src={t.qrPngDataUrl} />
          <Text style={s.scan}>Scan at entry</Text>

          <View style={s.divider}>
            <View style={s.row}>
              <Text style={s.rowLabel}>Ticket No.</Text>
              <Text style={s.rowValue}>{t.ticketNumber}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.rowLabel}>Booking</Text>
              <Text style={s.rowValue}>{props.bookingReference}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.rowLabel}>Venue</Text>
              <Text style={s.rowValue}>{props.venue}</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={s.footer}>
        Show this pass and the QR code at the entrance. One QR per attendee.
      </Text>
    </Page>
  );
}

export function TicketPdf(props: TicketPdfProps) {
  return (
    <Document title={`RUMA Tickets — ${props.bookingReference}`}>
      {props.tickets.map((t) => (
        <TicketPage key={t.ticketNumber} t={t} props={props} />
      ))}
    </Document>
  );
}
