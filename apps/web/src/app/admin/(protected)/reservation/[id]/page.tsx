import { ReservationDetailsView } from "@/components/admin/reservations/details/ReservationDetailsView";

type AdminReservationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminReservationPage({
  params,
}: AdminReservationPageProps) {
  const { id } = await params;

  return <ReservationDetailsView reservationId={id} />;
}