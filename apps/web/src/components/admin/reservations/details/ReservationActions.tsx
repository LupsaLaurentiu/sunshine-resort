"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Ban,
  Check,
  Clock3,
  LogIn,
  LogOut,
  ShieldCheck,
  X,
} from "lucide-react";

import { useReservationActions } from "@/hooks/useReservationActions";

import type { AdminReservationDetails } from "@/types/admin-reservation-details";
import type { ReservationActionType } from "@/hooks/useReservationActions";

type ReservationActionsProps = {
  reservation: AdminReservationDetails;
  onActionCompleted: () => void | Promise<void>;
};

type ActionDialog = Exclude<
  ReservationActionType,
  "check-in" | "check-out"
>;

type ActionDefinition = {
  id: ReservationActionType;
  label: string;
  description: string;
  icon: typeof Check;
  variant: "primary" | "danger" | "neutral";
};

type CountdownValue = {
  isExpired: boolean;
  days: number;
  hours: number;
  minutes: number;
  totalMilliseconds: number;
};

const actionButtonClasses: Record<
  ActionDefinition["variant"],
  string
> = {
  primary:
    "border-gold bg-gold text-black hover:border-white hover:bg-white",

  danger:
    "border-red-300/25 bg-red-300/10 text-red-200 hover:border-red-300/50 hover:bg-red-300/15",

  neutral:
    "border-white/15 bg-white/[0.03] text-white/70 hover:border-gold hover:text-gold",
};

function normalizeDateValue(
  value: string,
): string {
  return value.slice(0, 10);
}

function normalizeTimeValue(
  value: string | null | undefined,
  fallback: string,
): string {
  if (!value?.trim()) {
    return fallback;
  }

  return value.trim().slice(0, 5);
}

function createLocalDateTime(
  dateValue: string,
  timeValue: string,
): Date {
  const normalizedDate =
    normalizeDateValue(dateValue);

  const normalizedTime =
    normalizeTimeValue(
      timeValue,
      "00:00",
    );

  return new Date(
    `${normalizedDate}T${normalizedTime}:00`,
  );
}

function calculateCountdown(
  targetDate: Date,
  currentTime: number,
): CountdownValue {
  const difference =
    targetDate.getTime() -
    currentTime;

  if (difference <= 0) {
    return {
      isExpired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      totalMilliseconds: 0,
    };
  }

  const totalMinutes =
    Math.floor(
      difference /
        (1000 * 60),
    );

  const days =
    Math.floor(
      totalMinutes /
        (60 * 24),
    );

  const hours =
    Math.floor(
      (totalMinutes %
        (60 * 24)) /
        60,
    );

  const minutes =
    totalMinutes % 60;

  return {
    isExpired: false,
    days,
    hours,
    minutes,
    totalMilliseconds:
      difference,
  };
}

function formatScheduledDateTime(
  dateValue: string,
  timeValue: string,
): string {
  const date =
    createLocalDateTime(
      dateValue,
      timeValue,
    );

  return new Intl.DateTimeFormat(
    "ro-RO",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

export function ReservationActions({
  reservation,
  onActionCompleted,
}: ReservationActionsProps) {
  const [
    dialog,
    setDialog,
  ] =
    useState<ActionDialog | null>(
      null,
    );

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    adminNotes,
    setAdminNotes,
  ] = useState("");

  const [
    currentTime,
    setCurrentTime,
  ] = useState<number>(
    () => Date.now(),
  );

  const {
    activeAction,
    error,
    successMessage,

    isLoading,
    isApproving,
    isRejecting,
    isCancelling,
    isCheckingIn,
    isCheckingOut,

    approve,
    reject,
    cancel,
    checkIn,
    checkOut,
    clearFeedback,
  } = useReservationActions(
    reservation.id,
  );

  useEffect(() => {
    setCurrentTime(
      Date.now(),
    );

    const intervalId =
      window.setInterval(
        () => {
          setCurrentTime(
            Date.now(),
          );
        },
        30_000,
      );

    return () => {
      window.clearInterval(
        intervalId,
      );
    };
  }, []);

  const checkInTime =
    normalizeTimeValue(
      reservation.checkInTime,
      "14:00",
    );

  const checkOutTime =
    normalizeTimeValue(
      reservation.checkOutTime,
      "10:00",
    );

  const checkInDateTime =
    useMemo(
      () =>
        createLocalDateTime(
          reservation.checkInDate,
          checkInTime,
        ),
      [
        reservation.checkInDate,
        checkInTime,
      ],
    );

  const checkOutDateTime =
    useMemo(
      () =>
        createLocalDateTime(
          reservation.checkOutDate,
          checkOutTime,
        ),
      [
        reservation.checkOutDate,
        checkOutTime,
      ],
    );

  const countdownTarget =
    useMemo(() => {
      if (
        reservation.status ===
        "CONFIRMED"
      ) {
        return {
          type:
            "check-in" as const,

          label:
            "Timp rămas până la check-in",

          scheduledLabel:
            "Check-in programat",

          target:
            checkInDateTime,

          icon:
            LogIn,
        };
      }

      if (
        reservation.status ===
        "CHECKED_IN"
      ) {
        return {
          type:
            "check-out" as const,

          label:
            "Timp rămas până la check-out",

          scheduledLabel:
            "Check-out programat",

          target:
            checkOutDateTime,

          icon:
            LogOut,
        };
      }

      return null;
    }, [
      reservation.status,
      checkInDateTime,
      checkOutDateTime,
    ]);

  const countdown =
    useMemo(
      () =>
        countdownTarget
          ? calculateCountdown(
              countdownTarget.target,
              currentTime,
            )
          : null,
      [
        countdownTarget,
        currentTime,
      ],
    );

  const actions =
    useMemo<
      ActionDefinition[]
    >(() => {
      const availableActions:
        ActionDefinition[] = [];

      if (
        reservation.status ===
        "PENDING_APPROVAL"
      ) {
        availableActions.push(
          {
            id: "approve",
            label:
              "Aprobă rezervarea",
            description:
              "Clientul va primi linkul securizat pentru plată.",
            icon:
              ShieldCheck,
            variant:
              "primary",
          },

          {
            id: "reject",
            label:
              "Respinge rezervarea",
            description:
              "Inventarul va fi eliberat, iar clientul va fi notificat.",
            icon: X,
            variant:
              "danger",
          },
        );
      }

      if (
        reservation.status ===
          "APPROVED_AWAITING_PAYMENT" ||
        reservation.status ===
          "CONFIRMED" ||
        reservation.status ===
          "CHECKED_IN"
      ) {
        availableActions.push({
          id: "cancel",
          label:
            "Anulează rezervarea",
          description:
            "Backend-ul va aplica automat politica de rambursare.",
          icon: Ban,
          variant:
            "danger",
        });
      }

      if (
        reservation.status ===
        "CONFIRMED"
      ) {
        availableActions.push({
          id: "check-in",
          label:
            "Efectuează check-in manual",
          description:
            countdown?.isExpired
              ? "Ora programată pentru check-in a sosit. Poți confirma manual sosirea clientului."
              : "Folosește această acțiune doar dacă dorești să confirmi sosirea înaintea procesării automate.",
          icon: LogIn,
          variant:
            "neutral",
        });
      }

      if (
        reservation.status ===
        "CHECKED_IN"
      ) {
        availableActions.push({
          id: "check-out",
          label:
            "Efectuează check-out manual",
          description:
            countdown?.isExpired
              ? "Ora programată pentru check-out a sosit. Poți finaliza manual sejurul."
              : "Folosește această acțiune dacă clientul pleacă mai devreme sau dacă dorești finalizarea manuală.",
          icon: LogOut,
          variant:
            "neutral",
        });
      }

      return availableActions;
    }, [
      reservation.status,
      countdown?.isExpired,
    ]);

  function resetDialogState() {
    setDialog(null);
    setReason("");
    setAdminNotes("");
  }

  function openDialog(
    action: ActionDialog,
  ) {
    clearFeedback();
    setReason("");
    setAdminNotes("");
    setDialog(action);
  }

  async function finishAction(
    action: () => Promise<unknown>,
  ) {
    const result =
      await action();

    if (!result) {
      return;
    }

    resetDialogState();

    await onActionCompleted();
  }

  async function handleApprove() {
    await finishAction(() =>
      approve({
        adminNotes:
          adminNotes.trim() ||
          undefined,
      }),
    );
  }

  async function handleReject() {
    if (
      reason.trim().length <
      3
    ) {
      return;
    }

    await finishAction(() =>
      reject({
        reason:
          reason.trim(),

        adminNotes:
          adminNotes.trim() ||
          undefined,
      }),
    );
  }

  async function handleCancel() {
    if (
      reason.trim().length <
      3
    ) {
      return;
    }

    await finishAction(() =>
      cancel({
        reason:
          reason.trim(),

        adminNotes:
          adminNotes.trim() ||
          undefined,
      }),
    );
  }

  async function handleCheckIn() {
    const confirmed =
      window.confirm(
        "Confirmi efectuarea manuală a check-in-ului pentru această rezervare?",
      );

    if (!confirmed) {
      return;
    }

    await finishAction(
      checkIn,
    );
  }

  async function handleCheckOut() {
    const confirmed =
      window.confirm(
        "Confirmi efectuarea manuală a check-out-ului pentru această rezervare?",
      );

    if (!confirmed) {
      return;
    }

    await finishAction(
      checkOut,
    );
  }

  function handleActionClick(
    action: ReservationActionType,
  ) {
    clearFeedback();

    switch (action) {
      case "approve":
      case "reject":
      case "cancel":
        openDialog(action);
        return;

      case "check-in":
        void handleCheckIn();
        return;

      case "check-out":
        void handleCheckOut();
        return;
    }
  }

  const dialogTitle =
    dialog === "approve"
      ? "Aprobă rezervarea"
      : dialog === "reject"
        ? "Respinge rezervarea"
        : "Anulează rezervarea";

  const dialogDescription =
    dialog === "approve"
      ? "După aprobare, clientul va primi pe email linkul securizat pentru plată."
      : dialog === "reject"
        ? "Clientul va fi notificat, iar apartamentele vor fi eliberate."
        : "Politica de anulare și eventualele rambursări vor fi calculate automat de backend.";

  const dialogIsLoading =
    dialog === "approve"
      ? isApproving
      : dialog === "reject"
        ? isRejecting
        : isCancelling;

  const canConfirmDialog =
    dialog === "approve" ||
    reason.trim().length >= 3;

  return (
    <>
      <section className="border border-white/10 bg-[#0b0b0b] p-7">
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold">
          Operațiuni
        </p>

        <h2 className="heading mt-3 text-3xl font-light">
          Acțiuni disponibile
        </h2>

        {countdownTarget &&
          countdown && (
            <CountdownCard
              label={
                countdownTarget.label
              }
              scheduledLabel={
                countdownTarget.scheduledLabel
              }
              scheduledDateTime={formatScheduledDateTime(
                countdownTarget.type ===
                  "check-in"
                  ? reservation.checkInDate
                  : reservation.checkOutDate,

                countdownTarget.type ===
                  "check-in"
                  ? checkInTime
                  : checkOutTime,
              )}
              countdown={
                countdown
              }
              icon={
                countdownTarget.icon
              }
            />
          )}

        {successMessage && (
          <div className="mt-6 border border-emerald-300/20 bg-emerald-300/5 px-4 py-4 text-sm leading-6 text-emerald-200">
            <div className="flex items-start gap-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0" />

              <span>
                {successMessage}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 border border-red-300/20 bg-red-300/5 px-4 py-4 text-sm leading-6 text-red-200">
            {error}
          </div>
        )}

        {actions.length === 0 ? (
          <p className="mt-7 text-sm leading-7 text-white/35">
            Rezervarea nu permite momentan alte operațiuni.
          </p>
        ) : (
          <div className="mt-7 space-y-3">
            {actions.map(
              (action) => {
                const Icon =
                  action.icon;

                const isCurrentAction =
                  activeAction ===
                  action.id;

                return (
                  <button
                    key={
                      action.id
                    }
                    type="button"
                    disabled={
                      isLoading
                    }
                    onClick={() =>
                      handleActionClick(
                        action.id,
                      )
                    }
                    className={`flex w-full items-start gap-4 border px-5 py-5 text-left transition disabled:cursor-wait disabled:opacity-45 ${
                      actionButtonClasses[
                        action.variant
                      ]
                    }`}
                  >
                    <Icon
                      className={`mt-0.5 h-5 w-5 shrink-0 ${
                        isCurrentAction
                          ? "animate-pulse"
                          : ""
                      }`}
                    />

                    <span>
                      <span className="block text-xs font-semibold uppercase tracking-[0.22em]">
                        {isCurrentAction
                          ? "Se procesează..."
                          : action.label}
                      </span>

                      <span className="mt-2 block text-xs leading-6 opacity-65">
                        {
                          action.description
                        }
                      </span>
                    </span>
                  </button>
                );
              },
            )}
          </div>
        )}

        {(isCheckingIn ||
          isCheckingOut) && (
          <p className="mt-5 text-xs leading-6 text-white/35">
            Operațiunea este procesată. Nu închide pagina.
          </p>
        )}
      </section>

      {dialog && (
        <div
          role="presentation"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-5 py-10 backdrop-blur-sm"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
                event.currentTarget &&
              !dialogIsLoading
            ) {
              resetDialogState();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="reservation-action-title"
            className="w-full max-w-xl border border-white/10 bg-[#0b0b0b] p-7 shadow-2xl md:p-9"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-gold">
                  Confirmare operațiune
                </p>

                <h3
                  id="reservation-action-title"
                  className="heading mt-3 text-4xl font-light"
                >
                  {dialogTitle}
                </h3>

                <p className="mt-4 text-sm leading-7 text-white/45">
                  {
                    dialogDescription
                  }
                </p>
              </div>

              <button
                type="button"
                disabled={
                  dialogIsLoading
                }
                onClick={
                  resetDialogState
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/10 text-white/45 transition hover:border-gold hover:text-gold disabled:opacity-40"
                aria-label="Închide dialogul"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {dialog !==
              "approve" && (
              <label className="mt-8 block">
                <span className="mb-3 block text-[10px] uppercase tracking-[0.28em] text-white/40">
                  Motivul operațiunii
                </span>

                <textarea
                  value={reason}
                  onChange={(
                    event,
                  ) =>
                    setReason(
                      event.target
                        .value,
                    )
                  }
                  disabled={
                    dialogIsLoading
                  }
                  maxLength={500}
                  rows={4}
                  placeholder={
                    dialog ===
                    "reject"
                      ? "Introdu motivul respingerii..."
                      : "Introdu motivul anulării..."
                  }
                  className="w-full resize-none border border-white/10 bg-[#050505] px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-white/20 focus:border-gold disabled:opacity-50"
                />

                <div className="mt-2 flex items-center justify-between gap-5 text-[10px] text-white/25">
                  <span>
                    Minimum 3 caractere
                  </span>

                  <span>
                    {reason.length}
                    /500
                  </span>
                </div>
              </label>
            )}

            <label className="mt-6 block">
              <span className="mb-3 block text-[10px] uppercase tracking-[0.28em] text-white/40">
                Notă internă opțională
              </span>

              <textarea
                value={
                  adminNotes
                }
                onChange={(
                  event,
                ) =>
                  setAdminNotes(
                    event.target
                      .value,
                  )
                }
                disabled={
                  dialogIsLoading
                }
                maxLength={1000}
                rows={4}
                placeholder="Observație vizibilă doar în panoul administrativ..."
                className="w-full resize-none border border-white/10 bg-[#050505] px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-white/20 focus:border-gold disabled:opacity-50"
              />

              <p className="mt-2 text-right text-[10px] text-white/25">
                {
                  adminNotes.length
                }
                /1000
              </p>
            </label>

            {error && (
              <div className="mt-6 border border-red-300/20 bg-red-300/5 px-4 py-4 text-sm leading-6 text-red-200">
                {error}
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={
                  dialogIsLoading
                }
                onClick={
                  resetDialogState
                }
                className="h-12 border border-white/10 px-7 text-[10px] uppercase tracking-[0.25em] text-white/50 transition hover:border-white/25 hover:text-white disabled:opacity-40"
              >
                Renunță
              </button>

              <button
                type="button"
                disabled={
                  dialogIsLoading ||
                  !canConfirmDialog
                }
                onClick={() => {
                  if (
                    dialog ===
                    "approve"
                  ) {
                    void handleApprove();
                    return;
                  }

                  if (
                    dialog ===
                    "reject"
                  ) {
                    void handleReject();
                    return;
                  }

                  void handleCancel();
                }}
                className={`h-12 min-w-[190px] px-7 text-[10px] font-semibold uppercase tracking-[0.25em] transition disabled:cursor-not-allowed disabled:opacity-35 ${
                  dialog ===
                  "approve"
                    ? "bg-gold text-black hover:bg-white"
                    : "bg-red-300 text-black hover:bg-white"
                }`}
              >
                {dialogIsLoading
                  ? "Se procesează..."
                  : dialogTitle}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

type CountdownCardProps = {
  label: string;
  scheduledLabel: string;
  scheduledDateTime: string;
  countdown: CountdownValue;
  icon: typeof LogIn;
};

function CountdownCard({
  label,
  scheduledLabel,
  scheduledDateTime,
  countdown,
  icon: Icon,
}: CountdownCardProps) {
  return (
    <div className="mt-7 border border-gold/20 bg-gold/[0.035] p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-gold/25 text-gold">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-gold">
                {label}
              </p>

              <p className="mt-2 text-xs leading-6 text-white/35">
                {scheduledLabel}:{" "}
                <span className="text-white/60">
                  {scheduledDateTime}
                </span>
              </p>
            </div>

            <Clock3 className="h-4 w-4 shrink-0 text-white/30" />
          </div>

          {countdown.isExpired ? (
            <div className="mt-5 border-l border-gold pl-4">
              <p className="heading text-2xl font-light text-gold">
                Ora programată a sosit
              </p>

              <p className="mt-2 text-xs leading-6 text-white/35">
                Procesarea automată poate avea loc acum. Butonul manual rămâne disponibil mai jos.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-3 gap-3">
              <CountdownUnit
                value={
                  countdown.days
                }
                label="Zile"
              />

              <CountdownUnit
                value={
                  countdown.hours
                }
                label="Ore"
              />

              <CountdownUnit
                value={
                  countdown.minutes
                }
                label="Minute"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type CountdownUnitProps = {
  value: number;
  label: string;
};

function CountdownUnit({
  value,
  label,
}: CountdownUnitProps) {
  return (
    <div className="border border-white/10 bg-[#050505] px-3 py-4 text-center">
      <p className="heading text-3xl font-light text-white">
        {String(value).padStart(
          2,
          "0",
        )}
      </p>

      <p className="mt-2 text-[9px] uppercase tracking-[0.22em] text-white/30">
        {label}
      </p>
    </div>
  );
}