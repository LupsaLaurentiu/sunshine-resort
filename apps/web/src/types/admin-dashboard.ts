import type {
  ReservationSource,
  ReservationStatus,
} from "@/types/reservation";

export type DashboardRoomSummary = {
  id: string;
  name: string;
  code: string;
  roomTypeName: string;
};

export type DashboardReservationItem = {
  id: string;

  status: ReservationStatus;
  source: ReservationSource;

  guestName: string;
  guestEmail: string;
  guestPhone: string;

  checkIn: string;
  checkOut: string;

  checkInTime: string;
  checkOutTime: string;

  nights: number;
  adults: number;

  roomNames: string[];
  allocatedRooms: DashboardRoomSummary[];

  totalPrice: number;
  paidAmount: number;
  remainingAmount: number;

  approvalExpiresAt: string | null;
  paymentExpiresAt: string | null;

  createdAt: string;
};

export type DashboardPaymentItem =
  DashboardReservationItem & {
    paymentExpiresAt: string | null;
    isPaymentExpiringSoon: boolean;
    paymentExpiresInMinutes: number | null;
  };

export type AdminDashboardMetrics = {
  pendingApprovalCount: number;
  awaitingPaymentCount: number;

  checkInsTodayCount: number;
  checkOutsTodayCount: number;

  occupiedRoomsCount: number;
  activeRoomsCount: number;
  occupancyRate: number;

  paidRevenue: number;
  currency: string;
};

export type AdminDashboardResponse = {
  generatedAt: string;

  metrics: AdminDashboardMetrics;

  pendingApprovals: DashboardReservationItem[];
  awaitingPayments: DashboardPaymentItem[];

  checkInsToday: DashboardReservationItem[];
  checkOutsToday: DashboardReservationItem[];

  recentReservations: DashboardReservationItem[];
};