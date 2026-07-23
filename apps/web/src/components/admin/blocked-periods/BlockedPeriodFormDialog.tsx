"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Save,
  X,
} from "lucide-react";

import type {
  AdminBlockedPeriod,
  CreateAdminBlockedPeriodRequest,
  UpdateAdminBlockedPeriodRequest,
} from "@/types/admin-blocked-period";

import type {
  AdminRoom,
} from "@/types/admin-room";

type BlockedPeriodFormDialogProps = {
  isOpen: boolean;

  blockedPeriod:
    | AdminBlockedPeriod
    | null;

  rooms: AdminRoom[];

  isSaving: boolean;
  error: string | null;

  onClose: () => void;

  onCreate: (
    payload: CreateAdminBlockedPeriodRequest,
  ) => Promise<AdminBlockedPeriod | null>;

  onUpdate: (
    blockedPeriodId: string,
    payload: UpdateAdminBlockedPeriodRequest,
  ) => Promise<AdminBlockedPeriod | null>;

  onClearError: () => void;
};

type BlockedPeriodFormState = {
  roomId: string;
  startDate: string;
  endDate: string;
  reason: string;
};

const EMPTY_FORM: BlockedPeriodFormState = {
  roomId: "",
  startDate: "",
  endDate: "",
  reason: "",
};

function toDateInputValue(
  value: string,
): string {
  return value.slice(0, 10);
}

function getInitialForm(
  blockedPeriod:
    | AdminBlockedPeriod
    | null,
): BlockedPeriodFormState {
  if (!blockedPeriod) {
    return EMPTY_FORM;
  }

  return {
    roomId:
      blockedPeriod.roomId,

    startDate:
      toDateInputValue(
        blockedPeriod.startDate,
      ),

    endDate:
      toDateInputValue(
        blockedPeriod.endDate,
      ),

    reason:
      blockedPeriod.reason ?? "",
  };
}

export function BlockedPeriodFormDialog({
  isOpen,
  blockedPeriod,
  rooms,
  isSaving,
  error,
  onClose,
  onCreate,
  onUpdate,
  onClearError,
}: BlockedPeriodFormDialogProps) {
  const [
    form,
    setForm,
  ] =
    useState<BlockedPeriodFormState>(
      EMPTY_FORM,
    );

  const [
    localError,
    setLocalError,
  ] = useState<string | null>(
    null,
  );

  const isEditing =
    blockedPeriod !== null;

  const activeRooms =
    useMemo(
      () =>
        rooms
          .filter(
            (room) =>
              room.isActive,
          )
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
          ),
      [rooms],
    );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm(
      getInitialForm(
        blockedPeriod,
      ),
    );

    setLocalError(null);
    onClearError();
  }, [
    isOpen,
    blockedPeriod,
    onClearError,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape" &&
        !isSaving
      ) {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );

      document.body.style.overflow =
        "";
    };
  }, [
    isOpen,
    isSaving,
    onClose,
  ]);

  if (!isOpen) {
    return null;
  }

  function updateField<
    Key extends keyof BlockedPeriodFormState,
  >(
    field: Key,
    value: BlockedPeriodFormState[Key],
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );

    setLocalError(null);
    onClearError();
  }

  function validate():
    | string
    | null {
    if (!form.roomId) {
      return "Selectează apartamentul.";
    }

    if (
      !form.startDate ||
      !form.endDate
    ) {
      return "Completează perioada de blocare.";
    }

    if (
      form.startDate >=
      form.endDate
    ) {
      return "Data de final trebuie să fie după data de început.";
    }

    return null;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const validationError =
      validate();

    if (validationError) {
      setLocalError(
        validationError,
      );

      return;
    }

    const payload: CreateAdminBlockedPeriodRequest =
      {
        roomId:
          form.roomId,

        startDate:
          form.startDate,

        endDate:
          form.endDate,

        reason:
          form.reason.trim() ||
          undefined,
      };

    const savedBlockedPeriod =
      isEditing &&
      blockedPeriod
        ? await onUpdate(
            blockedPeriod.id,
            payload,
          )
        : await onCreate(
            payload,
          );

    if (savedBlockedPeriod) {
      onClose();
    }
  }

  const displayedError =
    localError ?? error;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="blocked-period-form-title"
    >
      <button
        type="button"
        aria-label="Închide dialogul"
        disabled={isSaving}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <section className="relative z-10 max-h-full w-full max-w-3xl overflow-y-auto border border-white/10 bg-[#0b0b0b] shadow-2xl">
        <header className="flex items-start justify-between gap-6 border-b border-white/10 px-6 py-6 md:px-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold">
              Availability
            </p>

            <h2
              id="blocked-period-form-title"
              className="heading mt-3 text-4xl font-light"
            >
              {isEditing
                ? "Editează blocarea"
                : "Adaugă blocare"}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/40">
              Apartamentul selectat nu va putea fi rezervat în perioada configurată.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Închide"
            className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/10 text-white/40 transition hover:border-gold hover:text-gold disabled:cursor-wait disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form
          onSubmit={
            handleSubmit
          }
          className="px-6 py-7 md:px-8 md:py-8"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormField
                label="Apartament"
                required
              >
                <select
                  value={
                    form.roomId
                  }
                  disabled={
                    isSaving
                  }
                  onChange={(event) =>
                    updateField(
                      "roomId",
                      event.target.value,
                    )
                  }
                  className="h-12 w-full border border-white/10 bg-[#050505] px-4 text-sm text-white outline-none transition focus:border-gold disabled:cursor-wait disabled:opacity-50"
                >
                  <option value="">
                    Selectează apartamentul
                  </option>

                  {activeRooms.map(
                    (room) => (
                      <option
                        key={
                          room.id
                        }
                        value={
                          room.id
                        }
                      >
                        {room.code} —{" "}
                        {room.name}
                      </option>
                    ),
                  )}
                </select>
              </FormField>
            </div>

            <FormField
              label="Data început"
              required
            >
              <input
                type="date"
                value={
                  form.startDate
                }
                disabled={
                  isSaving
                }
                onChange={(event) =>
                  updateField(
                    "startDate",
                    event.target.value,
                  )
                }
                className="h-12 w-full border border-white/10 bg-[#050505] px-4 text-sm text-white outline-none transition focus:border-gold disabled:cursor-wait disabled:opacity-50"
              />
            </FormField>

            <FormField
              label="Data final"
              required
            >
              <input
                type="date"
                value={
                  form.endDate
                }
                min={
                  form.startDate ||
                  undefined
                }
                disabled={
                  isSaving
                }
                onChange={(event) =>
                  updateField(
                    "endDate",
                    event.target.value,
                  )
                }
                className="h-12 w-full border border-white/10 bg-[#050505] px-4 text-sm text-white outline-none transition focus:border-gold disabled:cursor-wait disabled:opacity-50"
              />
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Motiv">
                <textarea
                  value={
                    form.reason
                  }
                  disabled={
                    isSaving
                  }
                  onChange={(event) =>
                    updateField(
                      "reason",
                      event.target.value,
                    )
                  }
                  rows={5}
                  maxLength={500}
                  placeholder="Ex. mentenanță, reparații, utilizare internă"
                  className="w-full resize-none border border-white/10 bg-[#050505] px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-white/20 focus:border-gold disabled:cursor-wait disabled:opacity-50"
                />
              </FormField>
            </div>
          </div>

          {displayedError && (
            <div
              role="alert"
              className="mt-7 border border-red-300/20 bg-red-300/5 px-5 py-4 text-sm leading-7 text-red-200"
            >
              {displayedError}
            </div>
          )}

          <footer className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-7 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="h-12 border border-white/10 px-6 text-[10px] uppercase tracking-[0.25em] text-white/45 transition hover:border-white/25 hover:text-white disabled:opacity-40"
            >
              Anulează
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-12 items-center justify-center gap-3 bg-gold px-7 text-[10px] font-semibold uppercase tracking-[0.25em] text-black transition hover:bg-white disabled:cursor-wait disabled:opacity-50"
            >
              <Save className="h-4 w-4" />

              {isSaving
                ? "Se salvează..."
                : isEditing
                  ? "Salvează modificările"
                  : "Adaugă blocarea"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  required?: boolean;
  children: React.ReactNode;
};

function FormField({
  label,
  required = false,
  children,
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-3 block text-[10px] uppercase tracking-[0.25em] text-white/40">
        {label}

        {required && (
          <span className="ml-1 text-gold">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}