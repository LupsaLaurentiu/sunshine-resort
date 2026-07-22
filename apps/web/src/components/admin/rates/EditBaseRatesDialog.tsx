"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Save,
  X,
} from "lucide-react";

import type {
  AdminRoomType,
  UpdateAdminRoomTypePayload,
} from "@/types/admin-room-type";

type EditBaseRatesDialogProps = {
  isOpen: boolean;
  roomType: AdminRoomType | null;

  isSaving: boolean;
  error: string | null;

  onClose: () => void;

  onSave: (
    roomTypeId: string,
    payload: UpdateAdminRoomTypePayload,
  ) => Promise<AdminRoomType | null>;

  onClearError: () => void;
};

type BaseRatesForm = {
  weekdayBasePrice: string;
  weekendBasePrice: string;
  extraAdultPrice: string;
};

const EMPTY_FORM: BaseRatesForm = {
  weekdayBasePrice: "",
  weekendBasePrice: "",
  extraAdultPrice: "",
};

function getInitialForm(
  roomType: AdminRoomType | null,
): BaseRatesForm {
  if (!roomType) {
    return EMPTY_FORM;
  }

  return {
    weekdayBasePrice: String(
      roomType.weekdayBasePrice,
    ),

    weekendBasePrice: String(
      roomType.weekendBasePrice,
    ),

    extraAdultPrice: String(
      roomType.extraAdultPrice,
    ),
  };
}

function parsePrice(
  value: string,
): number {
  return Number(
    value.replace(",", "."),
  );
}

export function EditBaseRatesDialog({
  isOpen,
  roomType,
  isSaving,
  error,
  onClose,
  onSave,
  onClearError,
}: EditBaseRatesDialogProps) {
  const [
    form,
    setForm,
  ] = useState<BaseRatesForm>(
    EMPTY_FORM,
  );

  const [
    localError,
    setLocalError,
  ] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm(
      getInitialForm(
        roomType,
      ),
    );

    setLocalError(null);
    onClearError();
  }, [
    isOpen,
    roomType,
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

  if (
    !isOpen ||
    !roomType
    
  ) {
    return null;
  }
  const currentRoomType = roomType;
  function updateField(
    field: keyof BaseRatesForm,
    value: string,
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
    const weekdayPrice =
      parsePrice(
        form.weekdayBasePrice,
      );

    const weekendPrice =
      parsePrice(
        form.weekendBasePrice,
      );

    const extraAdultPrice =
      parsePrice(
        form.extraAdultPrice,
      );

    if (
      !Number.isFinite(
        weekdayPrice,
      ) ||
      weekdayPrice < 0
    ) {
      return "Tariful weekday este invalid.";
    }

    if (
      !Number.isFinite(
        weekendPrice,
      ) ||
      weekendPrice < 0
    ) {
      return "Tariful weekend este invalid.";
    }

    if (
      !Number.isFinite(
        extraAdultPrice,
      ) ||
      extraAdultPrice < 0
    ) {
      return "Tariful adultului suplimentar este invalid.";
    }

    return null;
  }

    async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
    ) {
    event.preventDefault();

    const validationError = validate();

    if (validationError) {
        setLocalError(validationError);
        return;
    }

    const updated = await onSave(
        currentRoomType.id,
        {
        weekdayBasePrice: parsePrice(
            form.weekdayBasePrice,
        ),

        weekendBasePrice: parsePrice(
            form.weekendBasePrice,
        ),

        extraAdultPrice: parsePrice(
            form.extraAdultPrice,
        ),
        },
    );

    if (updated) {
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
      aria-labelledby="base-rates-dialog-title"
    >
      <button
        type="button"
        aria-label="Închide dialogul"
        disabled={isSaving}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <section className="relative z-10 w-full max-w-2xl border border-white/10 bg-[#0b0b0b] shadow-2xl">
        <header className="flex items-start justify-between gap-6 border-b border-white/10 px-6 py-6 md:px-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold">
              Base rates
            </p>

            <h2
              id="base-rates-dialog-title"
              className="heading mt-3 text-4xl font-light"
            >
              {currentRoomType.nameRo}
            </h2>

            <p className="mt-3 text-sm leading-7 text-white/40">
              Modifică tarifele implicite folosite în afara perioadelor tarifare configurate.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Închide"
            className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/10 text-white/40 transition hover:border-gold hover:text-gold disabled:opacity-40"
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
            <PriceField
              label="Tarif weekday"
              value={
                form.weekdayBasePrice
              }
              disabled={
                isSaving
              }
              onChange={(value) =>
                updateField(
                  "weekdayBasePrice",
                  value,
                )
              }
            />

            <PriceField
              label="Tarif weekend"
              value={
                form.weekendBasePrice
              }
              disabled={
                isSaving
              }
              onChange={(value) =>
                updateField(
                  "weekendBasePrice",
                  value,
                )
              }
            />

            <div className="md:col-span-2">
              <PriceField
                label="Tarif adult suplimentar / noapte"
                value={
                  form.extraAdultPrice
                }
                disabled={
                  isSaving
                }
                onChange={(value) =>
                  updateField(
                    "extraAdultPrice",
                    value,
                  )
                }
              />

              <p className="mt-3 text-xs leading-6 text-white/30">
                Valoarea 0 înseamnă că tariful adultului suplimentar nu este configurat pentru acest tip.
              </p>
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
                : "Salvează tarifele"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

type PriceFieldProps = {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (
    value: string,
  ) => void;
};

function PriceField({
  label,
  value,
  disabled,
  onChange,
}: PriceFieldProps) {
  return (
    <label className="block">
      <span className="mb-3 block text-[10px] uppercase tracking-[0.25em] text-white/40">
        {label}

        <span className="ml-1 text-gold">
          *
        </span>
      </span>

      <div className="relative">
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className="h-12 w-full border border-white/10 bg-[#050505] px-4 pr-20 text-sm text-white outline-none transition focus:border-gold disabled:cursor-wait disabled:opacity-50"
        />

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-[0.2em] text-white/25">
          RON
        </span>
      </div>
    </label>
  );
}