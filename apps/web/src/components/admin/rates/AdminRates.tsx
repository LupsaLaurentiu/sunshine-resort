"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  Pencil,
  Plus,
  RefreshCw,
  Tag,
} from "lucide-react";

import { useAdminRatePeriods } from "@/hooks/useAdminRatePeriods";
import { useAdminRoomTypes } from "@/hooks/useAdminRoomTypes";

import type { AdminRatePeriod } from "@/types/admin-rate-period";
import type { AdminRoomType } from "@/types/admin-room-type";

import { EditBaseRatesDialog } from "./EditBaseRatesDialog";
import { RatePeriodFormDialog } from "./RatePeriodFormDialog";

function formatPrice(
  value: number,
): string {
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

export function AdminRates() {
  const {
    ratePeriods,
    error:
      ratePeriodsError,
    isLoading:
      isLoadingRatePeriods,
    isSaving:
      isSavingRatePeriod,
    refresh:
      refreshRatePeriods,
    createRatePeriod,
    updateRatePeriod,
    deactivateRatePeriod,
    clearError:
      clearRatePeriodError,
  } = useAdminRatePeriods();

  const {
    roomTypes,
    isLoading:
      isLoadingRoomTypes,
    isSaving:
      isSavingRoomType,
    error:
      roomTypesError,
    refresh:
      refreshRoomTypes,
    updateRoomType,
    clearError:
      clearRoomTypeError,
  } = useAdminRoomTypes();

  const [
    isRatePeriodDialogOpen,
    setIsRatePeriodDialogOpen,
  ] = useState(false);

  const [
    selectedRatePeriod,
    setSelectedRatePeriod,
  ] = useState<AdminRatePeriod | null>(
    null,
  );

  const [
    isBaseRatesDialogOpen,
    setIsBaseRatesDialogOpen,
  ] = useState(false);

  const [
    selectedRoomType,
    setSelectedRoomType,
  ] = useState<AdminRoomType | null>(
    null,
  );

  const activeRoomTypes =
    useMemo(
      () =>
        roomTypes.filter(
          (roomType) =>
            roomType.isActive,
        ),
      [roomTypes],
    );

  const activeRatePeriods =
    useMemo(
      () =>
        ratePeriods.filter(
          (period) =>
            period.isActive,
        ),
      [ratePeriods],
    );

  const displayedError =
    ratePeriodsError ??
    roomTypesError;

  const isRefreshing =
    isLoadingRatePeriods ||
    isLoadingRoomTypes;

  const isSaving =
    isSavingRatePeriod ||
    isSavingRoomType;

  const initialLoading =
    isRefreshing &&
    roomTypes.length === 0 &&
    ratePeriods.length === 0;

  function openCreateRatePeriodDialog() {
    clearRatePeriodError();

    setSelectedRatePeriod(
      null,
    );

    setIsRatePeriodDialogOpen(
      true,
    );
  }

  function openEditRatePeriodDialog(
    period: AdminRatePeriod,
  ) {
    clearRatePeriodError();

    setSelectedRatePeriod(
      period,
    );

    setIsRatePeriodDialogOpen(
      true,
    );
  }

  function closeRatePeriodDialog() {
    if (isSavingRatePeriod) {
      return;
    }

    clearRatePeriodError();

    setIsRatePeriodDialogOpen(
      false,
    );

    setSelectedRatePeriod(
      null,
    );
  }

  function openBaseRatesDialog(
    roomType: AdminRoomType,
  ) {
    clearRoomTypeError();

    setSelectedRoomType(
      roomType,
    );

    setIsBaseRatesDialogOpen(
      true,
    );
  }

  function closeBaseRatesDialog() {
    if (isSavingRoomType) {
      return;
    }

    clearRoomTypeError();

    setIsBaseRatesDialogOpen(
      false,
    );

    setSelectedRoomType(
      null,
    );
  }

  async function handleRefresh() {
    await Promise.all([
      refreshRatePeriods(),
      refreshRoomTypes(),
    ]);
  }

  async function handleDeactivate(
    period: AdminRatePeriod,
  ) {
    const confirmed =
      window.confirm(
        `Dezactivezi perioada tarifară pentru ${period.roomType.nameRo}, ${formatDate(
          period.startDate,
        )} – ${formatDate(
          period.endDate,
        )}?`,
      );

    if (!confirmed) {
      return;
    }

    await deactivateRatePeriod(
      period.id,
    );
  }

  return (
    <section>
      <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">
            Pricing
          </p>

          <h1 className="heading mt-4 text-5xl font-light md:text-7xl">
            Tarife
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">
            Configurează tarifele de bază ale
            apartamentelor și perioadele care
            suprascriu aceste prețuri.
          </p>
        </div>

        <button
          type="button"
          disabled={
            isRefreshing
          }
          onClick={() => {
            void handleRefresh();
          }}
          className="inline-flex h-12 items-center justify-center gap-3 self-start border border-white/10 px-5 text-[10px] uppercase tracking-[0.25em] text-white/45 transition hover:border-white/25 hover:text-white disabled:cursor-wait disabled:opacity-40 lg:self-auto"
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
      </div>

      {displayedError && (
        <div
          role="alert"
          className="mt-8 border border-red-300/20 bg-red-300/5 px-6 py-5 text-sm leading-7 text-red-200"
        >
          {displayedError}
        </div>
      )}

      {initialLoading ? (
        <div className="mt-12 flex min-h-[420px] items-center justify-center border border-white/10 bg-[#0b0b0b]">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border border-gold border-t-transparent" />

            <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-white/35">
              Se încarcă tarifele
            </p>
          </div>
        </div>
      ) : (
        <>
          <section className="mt-12">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-gold">
                Base rates
              </p>

              <h2 className="heading mt-3 text-4xl font-light">
                Tarife de bază
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/40">
                Aceste prețuri se aplică atunci
                când nu există o perioadă
                tarifară activă pentru data
                rezervării.
              </p>
            </div>

            {activeRoomTypes.length ===
            0 ? (
              <div className="mt-8 border border-white/10 bg-[#0b0b0b] px-8 py-16 text-center">
                <p className="heading text-3xl font-light text-white/55">
                  Nu există tipuri de apartament
                  active.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {activeRoomTypes.map(
                  (roomType) => (
                    <BaseRateCard
                      key={
                        roomType.id
                      }
                      roomType={
                        roomType
                      }
                      onEdit={() =>
                        openBaseRatesDialog(
                          roomType,
                        )
                      }
                    />
                  ),
                )}
              </div>
            )}
          </section>

          <section className="mt-14 border border-white/10 bg-[#0b0b0b]">
            <header className="flex flex-col justify-between gap-6 border-b border-white/10 px-6 py-6 md:flex-row md:items-center md:px-7">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
                  Rate overrides
                </p>

                <h2 className="heading mt-2 text-3xl font-light">
                  Perioade tarifare
                </h2>

                <p className="mt-2 max-w-2xl text-xs leading-6 text-white/35">
                  Aceste intervale suprascriu
                  tarifele de bază pentru tipul
                  de apartament selectat.
                </p>
              </div>

              <button
                type="button"
                disabled={
                  activeRoomTypes.length ===
                    0 ||
                  isLoadingRoomTypes
                }
                onClick={
                  openCreateRatePeriodDialog
                }
                className="inline-flex h-12 items-center justify-center gap-3 self-start bg-gold px-6 text-[10px] font-semibold uppercase tracking-[0.25em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 md:self-auto"
              >
                <Plus className="h-4 w-4" />

                Adaugă perioadă
              </button>
            </header>

            {activeRatePeriods.length ===
            0 ? (
              <div className="px-8 py-20 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-gold/60" />

                <p className="heading mt-6 text-3xl font-light text-white/60">
                  Nu există perioade tarifare.
                </p>

                <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/35">
                  Tarifele de bază se aplică
                  pentru toate datele până când
                  adaugi un interval de
                  suprascriere.
                </p>

                <button
                  type="button"
                  onClick={
                    openCreateRatePeriodDialog
                  }
                  disabled={
                    activeRoomTypes.length ===
                    0
                  }
                  className="mt-8 inline-flex h-12 items-center justify-center gap-3 bg-gold px-6 text-[10px] font-semibold uppercase tracking-[0.25em] text-black transition hover:bg-white disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />

                  Adaugă perioadă
                </button>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[900px] border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-left">
                        <TableHeading>
                          Tip apartament
                        </TableHeading>

                        <TableHeading>
                          Perioadă
                        </TableHeading>

                        <TableHeading>
                          Weekday
                        </TableHeading>

                        <TableHeading>
                          Weekend
                        </TableHeading>

                        <TableHeading>
                          Tip tarif
                        </TableHeading>

                        <th className="px-6 py-5 text-right text-[9px] font-normal uppercase tracking-[0.25em] text-white/30">
                          Acțiuni
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {activeRatePeriods.map(
                        (period) => (
                          <tr
                            key={
                              period.id
                            }
                            className="border-b border-white/10 transition last:border-b-0 hover:bg-white/[0.02]"
                          >
                            <td className="px-6 py-6">
                              <p className="text-sm text-white/80">
                                {
                                  period
                                    .roomType
                                    .nameRo
                                }
                              </p>

                              <p className="mt-1 text-xs text-white/25">
                                {
                                  period
                                    .roomType
                                    .nameEn
                                }
                              </p>
                            </td>

                            <td className="px-6 py-6">
                              <p className="text-sm text-white/65">
                                {formatDate(
                                  period.startDate,
                                )}
                              </p>

                              <p className="mt-1 text-xs text-white/30">
                                până la{" "}
                                {formatDate(
                                  period.endDate,
                                )}
                              </p>
                            </td>

                            <td className="px-6 py-6">
                              <PriceDisplay
                                currentPrice={
                                  period.weekdayPrice
                                }
                                originalPrice={
                                  period.originalWeekdayPrice
                                }
                                isPromotion={
                                  period.isPromotion
                                }
                              />
                            </td>

                            <td className="px-6 py-6">
                              <PriceDisplay
                                currentPrice={
                                  period.weekendPrice
                                }
                                originalPrice={
                                  period.originalWeekendPrice
                                }
                                isPromotion={
                                  period.isPromotion
                                }
                              />
                            </td>

                            <td className="px-6 py-6">
                              {period.isPromotion ? (
                                <div>
                                  <span className="inline-flex items-center gap-2 border border-gold/25 bg-gold/[0.07] px-3 py-2 text-[9px] uppercase tracking-[0.2em] text-gold">
                                    <Tag className="h-3 w-3" />

                                    Promoție
                                  </span>

                                  {period.titleRo && (
                                    <p className="mt-2 max-w-44 truncate text-xs text-white/30">
                                      {
                                        period.titleRo
                                      }
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                                  Sezonier
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-6">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditRatePeriodDialog(
                                      period,
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
                                    isSaving
                                  }
                                  onClick={() => {
                                    void handleDeactivate(
                                      period,
                                    );
                                  }}
                                  className="h-10 border border-red-300/15 px-4 text-[9px] uppercase tracking-[0.2em] text-red-200/55 transition hover:border-red-300/40 hover:text-red-200 disabled:cursor-wait disabled:opacity-40"
                                >
                                  Dezactivează
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
                  {activeRatePeriods.map(
                    (period) => (
                      <article
                        key={period.id}
                        className="p-6"
                      >
                        <div>
                          <p className="text-sm text-white/80">
                            {
                              period
                                .roomType
                                .nameRo
                            }
                          </p>

                          <p className="mt-1 text-xs text-white/30">
                            {formatDate(
                              period.startDate,
                            )}{" "}
                            –{" "}
                            {formatDate(
                              period.endDate,
                            )}
                          </p>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                          <MobilePriceCard
                            label="Weekday"
                            currentPrice={
                              period.weekdayPrice
                            }
                            originalPrice={
                              period.originalWeekdayPrice
                            }
                            isPromotion={
                              period.isPromotion
                            }
                          />

                          <MobilePriceCard
                            label="Weekend"
                            currentPrice={
                              period.weekendPrice
                            }
                            originalPrice={
                              period.originalWeekendPrice
                            }
                            isPromotion={
                              period.isPromotion
                            }
                          />
                        </div>

                        {period.isPromotion && (
                          <div className="mt-5 border-l border-gold/40 pl-4">
                            <p className="text-[9px] uppercase tracking-[0.22em] text-gold">
                              Promoție
                            </p>

                            {period.titleRo && (
                              <p className="mt-2 text-xs text-white/45">
                                {
                                  period.titleRo
                                }
                              </p>
                            )}
                          </div>
                        )}

                        <div className="mt-6 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              openEditRatePeriodDialog(
                                period,
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
                              isSaving
                            }
                            onClick={() => {
                              void handleDeactivate(
                                period,
                              );
                            }}
                            className="h-10 border border-red-300/15 px-4 text-[9px] uppercase tracking-[0.2em] text-red-200/55 transition hover:border-red-300/40 hover:text-red-200 disabled:opacity-40"
                          >
                            Dezactivează
                          </button>
                        </div>
                      </article>
                    ),
                  )}
                </div>
              </>
            )}
          </section>
        </>
      )}

      <RatePeriodFormDialog
        isOpen={
          isRatePeriodDialogOpen
        }
        ratePeriod={
          selectedRatePeriod
        }
        roomTypes={
          activeRoomTypes
        }
        isSaving={
          isSavingRatePeriod
        }
        error={
          ratePeriodsError
        }
        onClose={
          closeRatePeriodDialog
        }
        onCreate={
          createRatePeriod
        }
        onUpdate={
          updateRatePeriod
        }
        onClearError={
          clearRatePeriodError
        }
      />

      <EditBaseRatesDialog
        isOpen={
          isBaseRatesDialogOpen
        }
        roomType={
          selectedRoomType
        }
        isSaving={
          isSavingRoomType
        }
        error={
          roomTypesError
        }
        onClose={
          closeBaseRatesDialog
        }
        onSave={
          updateRoomType
        }
        onClearError={
          clearRoomTypeError
        }
      />
    </section>
  );
}

type BaseRateCardProps = {
  roomType: AdminRoomType;
  onEdit: () => void;
};

function BaseRateCard({
  roomType,
  onEdit,
}: BaseRateCardProps) {
  return (
    <article className="flex min-h-[300px] flex-col border border-white/10 bg-[#0b0b0b] p-6 transition hover:border-white/20">
      <div>
        <p className="text-[9px] uppercase tracking-[0.3em] text-gold">
          {roomType.slug}
        </p>

        <h3 className="heading mt-3 text-3xl font-light">
          {roomType.nameRo}
        </h3>

        <p className="mt-2 text-xs text-white/30">
          {roomType.nameEn}
        </p>
      </div>

      <div className="mt-7 space-y-4 border-y border-white/10 py-5">
        <RateLine
          label="Weekday"
          value={
            roomType.weekdayBasePrice
          }
        />

        <RateLine
          label="Weekend"
          value={
            roomType.weekendBasePrice
          }
        />

        <RateLine
          label="Adult suplimentar"
          value={
            roomType.extraAdultPrice
          }
          emptyLabel="Neconfigurat"
        />
      </div>

      <button
        type="button"
        onClick={onEdit}
        className="mt-auto inline-flex h-11 items-center justify-center gap-2 self-start border border-white/10 px-4 text-[9px] uppercase tracking-[0.22em] text-white/45 transition hover:border-gold hover:text-gold"
      >
        <Pencil className="h-3.5 w-3.5" />

        Editează
      </button>
    </article>
  );
}

type RateLineProps = {
  label: string;
  value: number;
  emptyLabel?: string;
};

function RateLine({
  label,
  value,
  emptyLabel,
}: RateLineProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-white/35">
        {label}
      </span>

      <span
        className={
          value > 0
            ? "text-sm text-white/75"
            : "text-xs text-white/25"
        }
      >
        {value > 0
          ? formatPrice(value)
          : emptyLabel ??
            formatPrice(value)}
      </span>
    </div>
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

type PriceDisplayProps = {
  currentPrice: number;
  originalPrice: number | null;
  isPromotion: boolean;
};

function PriceDisplay({
  currentPrice,
  originalPrice,
  isPromotion,
}: PriceDisplayProps) {
  return (
    <div>
      <p
        className={`text-sm ${
          isPromotion
            ? "text-gold"
            : "text-white/65"
        }`}
      >
        {formatPrice(
          currentPrice,
        )}
      </p>

      {isPromotion &&
        originalPrice !== null && (
          <p className="mt-1 text-xs text-white/25 line-through">
            {formatPrice(
              originalPrice,
            )}
          </p>
        )}
    </div>
  );
}

type MobilePriceCardProps = {
  label: string;
  currentPrice: number;
  originalPrice: number | null;
  isPromotion: boolean;
};

function MobilePriceCard({
  label,
  currentPrice,
  originalPrice,
  isPromotion,
}: MobilePriceCardProps) {
  return (
    <div className="border border-white/10 bg-[#050505] p-4">
      <p className="text-[9px] uppercase tracking-[0.22em] text-white/30">
        {label}
      </p>

      <div className="mt-3">
        <PriceDisplay
          currentPrice={
            currentPrice
          }
          originalPrice={
            originalPrice
          }
          isPromotion={
            isPromotion
          }
        />
      </div>
    </div>
  );
}