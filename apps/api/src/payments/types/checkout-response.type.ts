import type {
  PaymentStatus,
  PaymentType,
} from '@prisma/client';

export type CheckoutResponse = {
  paymentId: string;
  reservationId: string;
  paymentType: PaymentType;
  paymentStatus: PaymentStatus;
  amount: number;
  currency: string;
  checkoutSessionId: string;
  checkoutUrl: string;
  expiresAt: string | null;
};