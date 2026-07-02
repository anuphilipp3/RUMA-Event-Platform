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
const CREAM = "#F8F3E8";
const CHARCOAL = "#1F2933";
const MUTED = "#667085";

const styles = StyleSheet.create({
  page: { backgroundColor: IVORY, padding: 28, fontSize: 11, color: CHARCOAL },
  brand: { fontSize: 10, color: MUTED, marginBottom: 12, letterSpacing: 1 },
  ticket: {
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  header: {
    backgroundColor: KERALA,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  headerLabel: { color: GOLD, fontSize: 8, letterSpacing: 2 },
  headerTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: 700 },
  body: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    backgroundColor: CREAM,
  },
  fields: { flexGrow: 1, paddingRight: 12 },
  label: { fontSize: 7, color: MUTED, textTransform: "uppercase", marginTop: 6 },
  value: { fontSize: 11, color: CHARCOAL },
  qrWrap: {
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderLeftColor: GOLD,
    borderStyle: "dashed",
    paddingLeft: 12,
  },
  qr: { width: 96, height: 96 },
  scan: { fontSize: 7, color: MUTED, marginTop: 3 },
  footer: { fontSize: 8, color: MUTED, textAlign: "center", marginTop: 8 },
});

export function TicketPdf(props: TicketPdfProps) {
  return (
    <Document title={`RUMA Tickets — ${props.bookingReference}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>RUMA ONAM · DIGITAL PASS</Text>

        {props.tickets.map((t) => (
          <View key={t.ticketNumber} style={styles.ticket} wrap={false}>
            <View style={styles.header}>
              <Text style={styles.headerLabel}>RUMA ONAM</Text>
              <Text style={styles.headerTitle}>{props.eventName}</Text>
            </View>
            <View style={styles.body}>
              <View style={styles.fields}>
                <Text style={styles.label}>Attendee</Text>
                <Text style={styles.value}>{props.attendeeName}</Text>
                <Text style={styles.label}>Flat / Ticket Type</Text>
                <Text style={styles.value}>
                  {props.flatNumber} · {t.ticketTypeName}
                </Text>
                <Text style={styles.label}>Ticket Number</Text>
                <Text style={styles.value}>{t.ticketNumber}</Text>
                <Text style={styles.label}>Booking</Text>
                <Text style={styles.value}>{props.bookingReference}</Text>
                <Text style={styles.label}>Venue</Text>
                <Text style={styles.value}>{props.venue}</Text>
              </View>
              <View style={styles.qrWrap}>
                <Image style={styles.qr} src={t.qrPngDataUrl} />
                <Text style={styles.scan}>Scan at entry</Text>
              </View>
            </View>
          </View>
        ))}

        <Text style={styles.footer}>
          Show this pass and the QR code at the entrance. One QR per attendee.
        </Text>
      </Page>
    </Document>
  );
}
