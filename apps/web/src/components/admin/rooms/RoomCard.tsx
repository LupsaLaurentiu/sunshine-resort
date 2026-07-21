"use client";

import {
  Monitor,
  Pencil,
  Users,
} from "lucide-react";

import type { AdminRoom } from "@/types/admin-room";

type RoomCardProps = {
  room: AdminRoom;
  onEdit: (room: AdminRoom) => void;
};

function formatExtraAdultPrice(
  value: number | null | undefined,
): string {
  if (value === null || value === undefined) {
    return "Tarif neconfigurat";
  }

  return new Intl.NumberFormat(
    "ro-RO",
    {
      style: "currency",
      currency: "RON",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  ).format(value);
}

export function RoomCard({
  room,
  onEdit,
}: RoomCardProps) {
  const allowsExtraAdult =
    room.roomType.allowsExtraAdult === true;

  const includedAdults =
    room.roomType.maxAdults;

  const maximumAdults =
    allowsExtraAdult
      ? includedAdults + 1
      : includedAdults;

  return (
    <article className="group border border-white/10 bg-[#0b0b0b] transition hover:border-white/20">
      <div className="flex items-start justify-between gap-6 border-b border-white/10 px-6 py-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="border border-gold/25 bg-gold/10 px-3 py-1 text-[9px] uppercase tracking-[0.24em] text-gold">
              {room.code}
            </span>

            <span className="text-[9px] uppercase tracking-[0.22em] text-white/25">
              {room.roomType.nameRo}
            </span>
          </div>

          <h2 className="heading mt-4 truncate text-3xl font-light text-white">
            {room.name}
          </h2>

          <p className="mt-2 text-xs text-white/35">
            {room.roomType.nameEn}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onEdit(room)}
          aria-label={`Editează ${room.name}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/10 text-white/40 transition hover:border-gold hover:text-gold"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-px bg-white/10 sm:grid-cols-2">
        <RoomDetail
          icon={Users}
          label="Capacitate"
          value={`${maximumAdults} adulți`}
          secondaryValue={
            allowsExtraAdult
              ? `${includedAdults} incluși + 1 extra`
              : `${includedAdults} incluși`
          }
        />

        <RoomDetail
          icon={Monitor}
          label="TV Welcome"
          value={
            room.tvDeviceId?.trim() ||
            "Neconfigurat"
          }
          muted={!room.tvDeviceId}
          secondaryValue={
            room.tvDeviceId
              ? "Dispozitiv asociat"
              : "Necesită configurare"
          }
        />
      </div>

      <div className="grid gap-px bg-white/10 sm:grid-cols-2">
        <div className="bg-[#0b0b0b] px-6 py-5">
          <p className="text-[9px] uppercase tracking-[0.24em] text-white/25">
            Adult suplimentar
          </p>

          <p
            className={`mt-2 text-sm ${
              allowsExtraAdult
                ? "text-emerald-300"
                : "text-white/35"
            }`}
          >
            {allowsExtraAdult
              ? "Permis"
              : "Nu este permis"}
          </p>
        </div>

        <div className="bg-[#0b0b0b] px-6 py-5">
          <p className="text-[9px] uppercase tracking-[0.24em] text-white/25">
            Tarif extra
          </p>

          <p
            className={`mt-2 text-sm ${
              allowsExtraAdult
                ? "text-gold"
                : "text-white/25"
            }`}
          >
            {allowsExtraAdult
              ? `${formatExtraAdultPrice(
                  room.roomType.extraAdultPrice,
                )} / noapte`
              : "—"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-5 px-6 py-5">
        <div>
          <p className="text-[9px] uppercase tracking-[0.24em] text-white/25">
            Tip apartament
          </p>

          <p className="mt-2 text-sm text-white/65">
            {room.roomType.nameRo}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onEdit(room)}
          className="border border-white/10 px-5 py-3 text-[9px] uppercase tracking-[0.24em] text-white/45 transition hover:border-gold hover:text-gold"
        >
          Editează
        </button>
      </div>
    </article>
  );
}

type RoomDetailProps = {
  icon: typeof Users;
  label: string;
  value: string;
  secondaryValue?: string;
  muted?: boolean;
};

function RoomDetail({
  icon: Icon,
  label,
  value,
  secondaryValue,
  muted = false,
}: RoomDetailProps) {
  return (
    <div className="bg-[#0b0b0b] px-6 py-5">
      <div className="flex items-start gap-4">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />

        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.24em] text-white/25">
            {label}
          </p>

          <p
            className={`mt-2 truncate text-sm ${
              muted
                ? "text-white/30"
                : "text-white/65"
            }`}
            title={value}
          >
            {value}
          </p>

          {secondaryValue && (
            <p className="mt-1 text-xs text-white/25">
              {secondaryValue}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}