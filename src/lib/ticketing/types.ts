export type OrderStatus = "pending" | "paid" | "failed" | "cancelled";
export type TicketStatus = "valid" | "used" | "void";

export interface OrderItem {
  tierName: string;
  quantity: number;
  unitPrice: number;
  unitFee: number;
}

export interface Order {
  id: string; // e.g. BAE-8923
  eventId: string;
  userId?: string;
  buyerName: string;
  buyerEmail: string;
  items: OrderItem[];
  subtotal: number;
  fees: number;
  total: number;
  status: OrderStatus;
  paystackReference?: string;
  createdAt: string;
  paidAt?: string;
}

export interface Ticket {
  code: string; // unique redemption code, e.g. BAE-8923-01, encoded in the QR
  orderId: string;
  eventId: string;
  tierName: string;
  holderName: string;
  status: TicketStatus;
  issuedAt: string;
  usedAt?: string;
  usedBy?: string; // door staff identifier, optional
}
