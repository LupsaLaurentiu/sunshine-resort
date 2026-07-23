"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  CalendarOff,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { useAdminBlockedPeriods } from "@/hooks/useAdminBlockedPeriods";
import { useAdminRooms } from "@/hooks/useAdminRooms";

import type { AdminBlockedPeriod } from "@/types/admin-blocked-period";

import { BlockedPeriodFormDialog } from "./BlockedPeriodFormDialog";

function formatDate(
  value: string,
): string {
  const dateValue =
    value.slice(0, 10);

  const [
    year,
    month,
    day,
  ] = dateValue
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
  );

  return new Intl.DateTimeFormat(
    "ro-RO",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function getAdminName(
  blockedPeriod: AdminBlockedPeriod,
): string {
  if (
    !blockedPeriod.createdByAdmin
  ) {
    return "Administrator";
  }

  const fullName = [
    blockedPeriod.createdByAdmin
      .firstName,
    blockedPeriod.createdByAdmin
      .lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    fullName ||
    blockedPeriod.createdByAdmin
      .email
  );
}

export function AdminBlockedPeriods() {
  const {
    blockedPeriods,
    error:
      blockedPeriodsError,
    isLoading:
      isLoadingBlockedPeriods,
    isSaving,
    isDeleting,
    refresh:
      refreshBlockedPeriods,
    createBlockedPeriod,
    updateBlockedPeriod,
    removeBlockedPeriod,
    clearError,
  } = useAdminBlockedPeriods();

  const {
    rooms,
    error:
      roomsError,
    isLoading:
      isLoadingRooms,
    refresh:
      refreshRooms,
  } = useAdminRooms();

  const [
    isDialogOpen,
    setIsDialogOpen,
  ] = useState(false);

  const [
    selectedBlockedPeriod,
    setSelectedBlockedPeriod,
  ] =
    useState<AdminBlockedPeriod | null>(
      null,
    );

  const [
    selectedRoomId,
    setSelectedRoomId,
  ] = useState("");

  const displayedBlockedPeriods =
    useMemo(() => {
      if (!selectedRoomId) {
        return blockedPeriods;
      }

      return blockedPeriods.filter(
        (blockedPeriod) =>
          blockedPeriod.roomId ===
          selectedRoomId,
      );
    }, [
      blockedPeriods,
      selectedRoomId,
    ]);

  const affectedRoomCount =
    useMemo(
      () =>
        new Set(
          blockedPeriods.map(
            (blockedPeriod) =>
              blockedPeriod.roomId,
          ),
        ).size,
      [blockedPeriods],
    );

  const affectedRoomTypeCount =
    useMemo(
      () =>
        new Set(
          blockedPeriods.map(
            (blockedPeriod) =>
              blockedPeriod.room
                .roomTypeId,
          ),
        ).size,
      [blockedPeriods],
    );

  const displayedError =
    blockedPeriodsError ??
    roomsError;

  const isRefreshing =
    isLoadingBlockedPeriods ||
    isLoadingRooms;

  const initialLoading =
    isRefreshing &&
    blockedPeriods.length === 0 &&
    rooms.length === 0;

  function openCreateDialog() {
    clearError();

    setSelectedBlockedPeriod(
      null,
    );

    setIsDialogOpen(true);
  }

  function openEditDialog(
    blockedPeriod: AdminBlockedPeriod,
  ) {
    clearError();

    setSelectedBlockedPeriod(
      blockedPeriod,
    );

    setIsDialogOpen(true);
  }

  function closeDialog() {
    if (isSaving) {
      return;
    }

    clearError();

    setIsDialogOpen(false);

    setSelectedBlockedPeriod(
      null,
    );
  }

  async function handleRefresh() {
    await Promise.all([
      refreshBlockedPeriods(),
      refreshRooms(),
    ]);
  }

  async function handleDelete(
    blockedPeriod: AdminBlockedPeriod,
  ) {
    const confirmed =
      window.confirm(
        `Ștergi blocarea pentru ${blockedPeriod.room.name}, ${formatDate(
          blockedPeriod.startDate,
        )} – ${formatDate(
          blockedPeriod.endDate,
        )}?`,
      );

    if (!confirmed) {
      return;
    }

    await removeBlockedPeriod(
      blockedPeriod.id,
    );
  }

  return (
    <section>
      <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">
            Availability
          </p>

          <h1 className="heading mt-4 text-5xl font-light md:text-7xl">
            Blocări
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">
            Gestionează perioadele în care
            apartamentele sunt indisponibile
            pentru mentenanță, reparații sau
            utilizare internă.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isRefreshing}
            onClick={() => {
              void handleRefresh();
            }}
            className="inline-flex h-12 items-center justify-center gap-3 border border-white/10 px-5 text-[10px] uppercase tracking-[0.25em] text-white/45 transition hover:border-white/25 hover:text-white disabled:cursor-wait disabled:opacity-40"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isRefreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Actualizează
          </button>

          <button
            type="button"
            disabled={
              rooms.length === 0 ||
              isLoadingRooms
            }
            onClick={
              openCreateDialog
            }
            className="inline-flex h-12 items-center justify-center gap-3 bg-gold px-6 text-[10px] font-semibold uppercase tracking-[0.25em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />

            Adaugă blocare
          </button>
        </div>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Blocări"
          value={
            blockedPeriods.length
          }
          description="Perioade de indisponibilitate configurate."
        />

        <MetricCard
          label="Apartamente afectate"
          value={
            affectedRoomCount
          }
          description="Apartamente fizice care au cel puțin o blocare."
        />

        <MetricCard
          label="Tipuri afectate"
          value={
            affectedRoomTypeCount
          }
          description="Tipuri de apartamente care conțin unități blocate."
        />
      </div>

      {displayedError && (
        <div
          role="alert"
          className="mt-8 border border-red-300/20 bg-red-300/5 px-6 py-5 text-sm leading-7 text-red-200"
        >
          {displayedError}
        </div>
      )}

      <section className="mt-10 border border-white/10 bg-[#0b0b0b]">
        <header className="flex flex-col justify-between gap-6 border-b border-white/10 px-6 py-6 md:flex-row md:items-center md:px-7">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
              Unavailable periods
            </p>

            <h2 className="heading mt-2 text-3xl font-light">
              Perioade blocate
            </h2>

            <p className="mt-2 max-w-2xl text-xs leading-6 text-white/35">
              O blocare împiedică rezervarea
              apartamentului în intervalul
              configurat.
            </p>
          </div>

          <select
            aria-label="Filtrează după apartament"
            value={selectedRoomId}
            onChange={(event) =>
              setSelectedRoomId(
                event.target.value,
              )
            }
            className="h-12 min-w-64 border border-white/10 bg-[#050505] px-4 text-sm text-white outline-none transition focus:border-gold"
          >
            <option value="">
              Toate apartamentele
            </option>

            {[...rooms]
              .sort(
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
              )
              .map((room) => (
                <option
                  key={room.id}
                  value={room.id}
                >
                  {room.code} —{" "}
                  {room.name}
                </option>
              ))}
          </select>
        </header>

        {initialLoading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border border-gold border-t-transparent" />

              <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-white/35">
                Se încarcă blocările
              </p>
            </div>
          </div>
        ) : displayedBlockedPeriods.length ===
          0 ? (
          <div className="px-8 py-20 text-center">
            <CalendarOff className="mx-auto h-9 w-9 text-gold/60" />

            <p className="heading mt-6 text-3xl font-light text-white/60">
              Nu există blocări.
            </p>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/35">
              Apartamentele sunt disponibile
              conform rezervărilor și
              calendarelor externe existente.
            </p>

            <button
              type="button"
              onClick={
                openCreateDialog
              }
              disabled={
                rooms.length === 0
              }
              className="mt-8 inline-flex h-12 items-center justify-center gap-3 bg-gold px-6 text-[10px] font-semibold uppercase tracking-[0.25em] text-black transition hover:bg-white disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />

              Adaugă blocare
            </button>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[950px] border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <TableHeading>
                      Apartament
                    </TableHeading>

                    <TableHeading>
                      Tip
                    </TableHeading>

                    <TableHeading>
                      Perioadă
                    </TableHeading>

                    <TableHeading>
                      Motiv
                    </TableHeading>

                    <TableHeading>
                      Creat de
                    </TableHeading>

                    <th className="px-6 py-5 text-right text-[9px] font-normal uppercase tracking-[0.25em] text-white/30">
                      Acțiuni
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {displayedBlockedPeriods.map(
                    (blockedPeriod) => (
                      <tr
                        key={
                          blockedPeriod.id
                        }
                        className="border-b border-white/10 transition last:border-b-0 hover:bg-white/[0.02]"
                      >
                        <td className="px-6 py-6">
                          <p className="text-sm text-white/80">
                            {
                              blockedPeriod
                                .room.name
                            }
                          </p>

                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gold/65">
                            {
                              blockedPeriod
                                .room.code
                            }
                          </p>
                        </td>

                        <td className="px-6 py-6">
                          <p className="text-sm text-white/55">
                            {
                              blockedPeriod
                                .room
                                .roomType
                                .nameRo
                            }
                          </p>
                        </td>

                        <td className="px-6 py-6">
                          <p className="text-sm text-white/65">
                            {formatDate(
                              blockedPeriod.startDate,
                            )}
                          </p>

                          <p className="mt-1 text-xs text-white/30">
                            până la{" "}
                            {formatDate(
                              blockedPeriod.endDate,
                            )}
                          </p>
                        </td>

                        <td className="px-6 py-6">
                          <p className="max-w-xs text-sm leading-6 text-white/45">
                            {blockedPeriod.reason ??
                              "Fără motiv specificat"}
                          </p>
                        </td>

                        <td className="px-6 py-6">
                          <p className="max-w-44 truncate text-xs text-white/40">
                            {getAdminName(
                              blockedPeriod,
                            )}
                          </p>
                        </td>

                        <td className="px-6 py-6">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditDialog(
                                  blockedPeriod,
                                )
                              }
                              className="inline-flex h-10 items-center justify-center gap-2 border border-white/10 px-4 text-[9px] uppercase tracking-[0.2em] text-white/45 transition hover:border-gold hover:text-gold"
                            >
                              <Pencil className="h-3.5 w-3.5" />

                              Editează
                            </button>

                            <button
                              type="button"
                              disabled={
                                isDeleting
                              }
                              onClick={() => {
                                void handleDelete(
                                  blockedPeriod,
                                );
                              }}
                              className="inline-flex h-10 items-center justify-center gap-2 border border-red-300/15 px-4 text-[9px] uppercase tracking-[0.2em] text-red-200/55 transition hover:border-red-300/40 hover:text-red-200 disabled:cursor-wait disabled:opacity-40"
                            >
                              <Trash2 className="h-3.5 w-3.5" />

                              Șterge
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-white/10 lg:hidden">
              {displayedBlockedPeriods.map(
                (blockedPeriod) => (
                  <article
                    key={
                      blockedPeriod.id
                    }
                    className="p-6"
                  >
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <p className="text-sm text-white/80">
                          {
                            blockedPeriod
                              .room.name
                          }
                        </p>

                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gold/65">
                          {
                            blockedPeriod
                              .room.code
                          }
                        </p>
                      </div>

                      <p className="text-right text-xs leading-5 text-white/35">
                        {formatDate(
                          blockedPeriod.startDate,
                        )}
                        <br />
                        {formatDate(
                          blockedPeriod.endDate,
                        )}
                      </p>
                    </div>

                    <div className="mt-5 border-l border-white/10 pl-4">
                      <p className="text-[9px] uppercase tracking-[0.22em] text-white/25">
                        Motiv
                      </p>

                      <p className="mt-2 text-sm leading-6 text-white/45">
                        {blockedPeriod.reason ??
                          "Fără motiv specificat"}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          openEditDialog(
                            blockedPeriod,
                          )
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 border border-white/10 px-4 text-[9px] uppercase tracking-[0.2em] text-white/45 transition hover:border-gold hover:text-gold"
                      >
                        <Pencil className="h-3.5 w-3.5" />

                        Editează
                      </button>

                      <button
                        type="button"
                        disabled={
                          isDeleting
                        }
                        onClick={() => {
                          void handleDelete(
                            blockedPeriod,
                          );
                        }}
                        className="inline-flex h-10 items-center justify-center gap-2 border border-red-300/15 px-4 text-[9px] uppercase tracking-[0.2em] text-red-200/55 transition hover:border-red-300/40 hover:text-red-200 disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />

                        Șterge
                      </button>
                    </div>
                  </article>
                ),
              )}
            </div>
          </>
        )}
      </section>

      <BlockedPeriodFormDialog
        isOpen={isDialogOpen}
        blockedPeriod={
          selectedBlockedPeriod
        }
        rooms={rooms}
        isSaving={isSaving}
        error={
          blockedPeriodsError
        }
        onClose={closeDialog}
        onCreate={
          createBlockedPeriod
        }
        onUpdate={
          updateBlockedPeriod
        }
        onClearError={
          clearError
        }
      />
    </section>
  );
}

type MetricCardProps = {
  label: string;
  value: string | number;
  description: string;
};

function MetricCard({
  label,
  value,
  description,
}: MetricCardProps) {
  return (
    <article className="border border-white/10 bg-[#0b0b0b] p-6">
      <p className="text-[9px] uppercase tracking-[0.28em] text-white/35">
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

function TableHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-6 py-5 text-[9px] font-normal uppercase tracking-[0.25em] text-white/30">
      {children}
    </th>
  );
}