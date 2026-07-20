"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";

import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import type { AdminReservationDetails } from "@/types/admin-reservation-details";

import {
  formatAdminDateTime,
  getReservationSourceLabel,
} from "./reservation-formatters";

type ReservationHeaderProps = {
  reservation: AdminReservationDetails;
  isRefreshing: boolean;
  onRefresh: () => void;
};

export function ReservationHeader({
  reservation,
  isRefreshing,
  onRefresh,
}: ReservationHeaderProps) {
  return (
    <header>
      <div className="flex flex-col justify-between gap-8 xl:flex-row xl:items-end">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-gold transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Înapoi la rezervări
          </Link>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold">
              Detalii rezervare
            </p>

            <StatusBadge status={reservation.status} />
          </div>

          <h1 className="heading mt-5 text-5xl font-light md:text-7xl">
            {reservation.guest.firstName}{" "}
            {reservation.guest.lastName}
          </h1>

          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-xs text-white/35">
            <span>ID: {reservation.id}</span>

            <span>
              {getReservationSourceLabel(reservation.source)}
            </span>

            <span>
              Creată la {formatAdminDateTime(reservation.createdAt)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex h-12 items-center justify-center gap-3 border border-white/10 px-6 text-[10px] uppercase tracking-[0.28em] text-white/55 transition hover:border-gold hover:text-gold disabled:cursor-wait disabled:opacity-40"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />

          Reîncarcă
        </button>
      </div>
    </header>
  );
}