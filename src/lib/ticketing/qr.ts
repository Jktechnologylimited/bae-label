import QRCode from "qrcode";

/**
 * Generates a QR code as a data: URL (PNG) for a given ticket code.
 * The QR encodes the ticket code itself — the /verify page reads it as
 * ?code=... so door staff can either scan with a phone camera (which opens
 * the URL) or type the code in manually.
 */
export async function generateTicketQr(ticketCode: string, baseUrl: string): Promise<string> {
  const verifyUrl = `${baseUrl}/verify?code=${encodeURIComponent(ticketCode)}`;
  return QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 320,
    color: { dark: "#0a0a0b", light: "#ffffff" },
  });
}
