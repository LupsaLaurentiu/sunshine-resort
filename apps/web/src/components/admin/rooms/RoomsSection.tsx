"use client";

import {
  Plus,
  RefreshCw,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

import { useAdminRooms } from "@/hooks/useAdminRooms";

import type {
  AdminRoom,
} from "@/types/admin-room";

import { RoomCard } from "./RoomCard";
import { RoomFormDialog } from "./RoomFormDialog";

export function RoomsSection() {
  const {
    rooms,
    roomTypes,

    error,
    isLoading,
    isSaving,

    createRoom,
    updateRoom,
    refresh,
    clearError,
  } = useAdminRooms();

  const [
    isDialogOpen,
    setIsDialogOpen,
  ] = useState(false);

  const [
    selectedRoom,
    setSelectedRoom,
  ] = useState<AdminRoom | null>(
    null,
  );

  const groupedRooms = useMemo(() => {
    const groups = new Map<
      string,
      {
        roomTypeName: string;
        rooms: AdminRoom[];
      }
    >();

    for (const room of rooms) {
      const existingGroup =
        groups.get(
          room.roomTypeId,
        );

      if (existingGroup) {
        existingGroup.rooms.push(
          room,
        );

        continue;
      }

      groups.set(
        room.roomTypeId,
        {
          roomTypeName:
            room.roomType.nameRo,

          rooms: [
            room,
          ],
        },
      );
    }

    return Array.from(
      groups.entries(),
    )
      .map(
        ([
          roomTypeId,
          group,
        ]) => ({
          roomTypeId,
          roomTypeName:
            group.roomTypeName,

          rooms:
            [...group.rooms].sort(
              (
                firstRoom,
                secondRoom,
              ) =>
                firstRoom.code.localeCompare(
                  secondRoom.code,
                  undefined,
                  {
                    numeric: true,
                    sensitivity:
                      "base",
                  },
                ),
            ),
        }),
      )
      .sort(
        (
          firstGroup,
          secondGroup,
        ) =>
          firstGroup.roomTypeName.localeCompare(
            secondGroup.roomTypeName,
            "ro",
          ),
      );
  }, [rooms]);

  function openCreateDialog() {
    setSelectedRoom(null);
    clearError();
    setIsDialogOpen(true);
  }

  function openEditDialog(
    room: AdminRoom,
  ) {
    setSelectedRoom(room);
    clearError();
    setIsDialogOpen(true);
  }

  function closeDialog() {
    if (isSaving) {
      return;
    }

    setIsDialogOpen(false);
    setSelectedRoom(null);
    clearError();
  }

  return (
    <section className="space-y-10">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">
            Inventory
          </p>

          <h1 className="heading mt-4 text-5xl font-light md:text-7xl">
            Camere
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">
            Configurează inventarul fizic al celor opt
            apartamente, codurile interne, tipurile,
            etajele și dispozitivele TV asociate.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              void refresh();
            }}
            disabled={isLoading}
            aria-label="Reîncarcă apartamentele"
            className="flex h-12 w-12 items-center justify-center border border-white/10 text-white/45 transition hover:border-gold hover:text-gold disabled:cursor-wait disabled:opacity-40"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isLoading
                  ? "animate-spin"
                  : ""
              }`}
            />
          </button>

          <button
            type="button"
            onClick={
              openCreateDialog
            }
            disabled={
              isLoading ||
              roomTypes.length === 0
            }
            className="inline-flex h-12 items-center justify-center gap-3 bg-gold px-7 text-[10px] font-semibold uppercase tracking-[0.25em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />

            Adaugă apartament
          </button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <InventoryMetric
          label="Apartamente"
          value={rooms.length}
          description="Unități active în inventarul resortului."
        />

        <InventoryMetric
          label="Tipuri"
          value={roomTypes.length}
          description="Categorii de apartamente configurate."
        />

        <InventoryMetric
          label="TV asociate"
          value={
            rooms.filter(
              (room) =>
                Boolean(
                  room.tvDeviceId?.trim(),
                ),
            ).length
          }
          description="Apartamente conectate la sistemul TV Welcome."
        />

        <InventoryMetric
          label="Fără TV"
          value={
            rooms.filter(
              (room) =>
                !room.tvDeviceId?.trim(),
            ).length
          }
          description="Apartamente care necesită asocierea unui dispozitiv."
        />
      </div>

      {error && !isDialogOpen && (
        <div
          role="alert"
          className="border border-red-300/20 bg-red-300/5 px-6 py-5 text-sm leading-7 text-red-200"
        >
          {error}
        </div>
      )}

      {isLoading &&
      rooms.length === 0 ? (
        <div className="flex min-h-[420px] items-center justify-center border border-white/10 bg-[#0b0b0b]">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border border-gold border-t-transparent" />

            <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-white/35">
              Se încarcă apartamentele
            </p>
          </div>
        </div>
      ) : groupedRooms.length === 0 ? (
        <div className="border border-white/10 bg-[#0b0b0b] px-8 py-20 text-center">
          <p className="heading text-3xl font-light text-white/60">
            Nu există apartamente configurate.
          </p>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/35">
            Adaugă prima unitate fizică pentru a începe
            configurarea inventarului Sunshine Resort.
          </p>

          <button
            type="button"
            onClick={
              openCreateDialog
            }
            disabled={
              roomTypes.length === 0
            }
            className="mt-8 inline-flex h-12 items-center justify-center gap-3 bg-gold px-7 text-[10px] font-semibold uppercase tracking-[0.25em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />

            Adaugă apartament
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {groupedRooms.map(
            (group) => (
              <section
                key={
                  group.roomTypeId
                }
              >
                <div className="flex items-end justify-between gap-6 border-b border-white/10 pb-5">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-white/25">
                      Tip apartament
                    </p>

                    <h2 className="heading mt-2 text-3xl font-light">
                      {
                        group.roomTypeName
                      }
                    </h2>
                  </div>

                  <span className="border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-white/45">
                    {
                      group.rooms.length
                    }{" "}
                    {group.rooms.length ===
                    1
                      ? "apartament"
                      : "apartamente"}
                  </span>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
                  {group.rooms.map(
                    (room) => (
                      <RoomCard
                        key={room.id}
                        room={room}
                        onEdit={
                          openEditDialog
                        }
                      />
                    ),
                  )}
                </div>
              </section>
            ),
          )}
        </div>
      )}

      <RoomFormDialog
        isOpen={isDialogOpen}
        room={selectedRoom}
        roomTypes={roomTypes}
        isSaving={isSaving}
        error={error}
        onClose={closeDialog}
        onCreate={createRoom}
        onUpdate={updateRoom}
        onClearError={clearError}
      />
    </section>
  );
}

type InventoryMetricProps = {
  label: string;
  value: number;
  description: string;
};

function InventoryMetric({
  label,
  value,
  description,
}: InventoryMetricProps) {
  return (
    <article className="border border-white/10 bg-[#0b0b0b] p-6">
      <p className="text-[9px] uppercase tracking-[0.28em] text-white/30">
        {label}
      </p>

      <p className="heading mt-4 text-4xl font-light">
        {value}
      </p>

      <p className="mt-3 text-xs leading-6 text-white/30">
        {description}
      </p>
    </article>
  );
}