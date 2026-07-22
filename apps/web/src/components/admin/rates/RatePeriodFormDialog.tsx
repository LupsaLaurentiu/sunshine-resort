"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Save,
  X,
} from "lucide-react";

import type { AdminRoomTypeSummary } from "@/types/admin-room-type";

import type {
  AdminRatePeriod,
  CreateAdminRatePeriodRequest,
  UpdateAdminRatePeriodRequest,
} from "@/types/admin-rate-period";

type RatePeriodFormDialogProps = {
  isOpen: boolean;

  ratePeriod: AdminRatePeriod | null;

  roomTypes: AdminRoomTypeSummary[];

  isSaving: boolean;
  error: string | null;

  onClose: () => void;

  onCreate: (
    payload: CreateAdminRatePeriodRequest,
  ) => Promise<AdminRatePeriod | null>;

  onUpdate: (
    ratePeriodId: string,
    payload: UpdateAdminRatePeriodRequest,
  ) => Promise<AdminRatePeriod | null>;

  onClearError: () => void;
};

type RatePeriodFormState = {
  roomTypeId: string;

  startDate: string;
  endDate: string;

  weekdayPrice: string;
  weekendPrice: string;

  isPromotion: boolean;

  originalWeekdayPrice: string;
  originalWeekendPrice: string;

  titleRo: string;
  titleEn: string;

  isActive: boolean;
};

const EMPTY_FORM: RatePeriodFormState = {
  roomTypeId: "",

  startDate: "",
  endDate: "",

  weekdayPrice: "",
  weekendPrice: "",

  isPromotion: false,

  originalWeekdayPrice: "",
  originalWeekendPrice: "",

  titleRo: "",
  titleEn: "",

  isActive: true,
};

function toDateInputValue(
  value: string,
): string {
  return value.slice(0, 10);
}

function getInitialForm(
  ratePeriod: AdminRatePeriod | null,
): RatePeriodFormState {
  if (!ratePeriod) {
    return EMPTY_FORM;
  }

  return {
    roomTypeId:
      ratePeriod.roomTypeId,

    startDate:
      toDateInputValue(
        ratePeriod.startDate,
      ),

    endDate:
      toDateInputValue(
        ratePeriod.endDate,
      ),

    weekdayPrice:
      String(
        ratePeriod.weekdayPrice,
      ),

    weekendPrice:
      String(
        ratePeriod.weekendPrice,
      ),

    isPromotion:
      ratePeriod.isPromotion,

    originalWeekdayPrice:
      ratePeriod.originalWeekdayPrice ===
      null
        ? ""
        : String(
            ratePeriod.originalWeekdayPrice,
          ),

    originalWeekendPrice:
      ratePeriod.originalWeekendPrice ===
      null
        ? ""
        : String(
            ratePeriod.originalWeekendPrice,
          ),

    titleRo:
      ratePeriod.titleRo ?? "",

    titleEn:
      ratePeriod.titleEn ?? "",

    isActive:
      ratePeriod.isActive,
  };
}

function parsePrice(
  value: string,
): number {
  return Number(
    value.replace(",", "."),
  );
}

export function RatePeriodFormDialog({
  isOpen,
  ratePeriod,
  roomTypes,
  isSaving,
  error,
  onClose,
  onCreate,
  onUpdate,
  onClearError,
}: RatePeriodFormDialogProps) {
  const [
    form,
    setForm,
  ] = useState<RatePeriodFormState>(
    () =>
      getInitialForm(ratePeriod),
  );

  const [
    localError,
    setLocalError,
  ] = useState<string | null>(null);

  const isEditing =
    ratePeriod !== null;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm(
      getInitialForm(ratePeriod),
    );

    setLocalError(null);
    onClearError();
  }, [
    isOpen,
    ratePeriod,
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
    Key extends keyof RatePeriodFormState,
  >(
    field: Key,
    value: RatePeriodFormState[Key],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setLocalError(null);
    onClearError();
  }

  function validateForm():
    | string
    | null {
    if (!form.roomTypeId) {
      return "Selectează tipul apartamentului.";
    }

    if (
      !form.startDate ||
      !form.endDate
    ) {
      return "Completează perioada tarifară.";
    }

    if (
      form.startDate >=
      form.endDate
    ) {
      return "Data de final trebuie să fie după data de început.";
    }

    const weekdayPrice =
      parsePrice(
        form.weekdayPrice,
      );

    const weekendPrice =
      parsePrice(
        form.weekendPrice,
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

    if (form.isPromotion) {
      const originalWeekdayPrice =
        parsePrice(
          form.originalWeekdayPrice,
        );

      const originalWeekendPrice =
        parsePrice(
          form.originalWeekendPrice,
        );

      if (
        !Number.isFinite(
          originalWeekdayPrice,
        ) ||
        originalWeekdayPrice <=
          weekdayPrice
      ) {
        return "Prețul original weekday trebuie să fie mai mare decât tariful promoțional.";
      }

      if (
        !Number.isFinite(
          originalWeekendPrice,
        ) ||
        originalWeekendPrice <=
          weekendPrice
      ) {
        return "Prețul original weekend trebuie să fie mai mare decât tariful promoțional.";
      }
    }

    return null;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setLocalError(
        validationError,
      );

      return;
    }

    const payload: CreateAdminRatePeriodRequest =
      {
        roomTypeId:
          form.roomTypeId,

        startDate:
          form.startDate,

        endDate:
          form.endDate,

        weekdayPrice:
          parsePrice(
            form.weekdayPrice,
          ),

        weekendPrice:
          parsePrice(
            form.weekendPrice,
          ),

        isPromotion:
          form.isPromotion,

        titleRo:
          form.titleRo.trim() ||
          undefined,

        titleEn:
          form.titleEn.trim() ||
          undefined,

        isActive:
          form.isActive,

        ...(form.isPromotion && {
          originalWeekdayPrice:
            parsePrice(
              form.originalWeekdayPrice,
            ),

          originalWeekendPrice:
            parsePrice(
              form.originalWeekendPrice,
            ),
        }),
      };

    const savedRatePeriod =
      isEditing
        ? await onUpdate(
            ratePeriod.id,
            payload,
          )
        : await onCreate(
            payload,
          );

    if (savedRatePeriod) {
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
      aria-labelledby="rate-period-form-title"
    >
      <button
        type="button"
        aria-label="Închide dialogul"
        disabled={isSaving}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <section className="relative z-10 max-h-full w-full max-w-4xl overflow-y-auto border border-white/10 bg-[#0b0b0b] shadow-2xl">
        <header className="flex items-start justify-between gap-6 border-b border-white/10 px-6 py-6 md:px-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold">
              Pricing
            </p>

            <h2
              id="rate-period-form-title"
              className="heading mt-3 text-4xl font-light"
            >
              {isEditing
                ? "Editează perioada"
                : "Adaugă perioadă tarifară"}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/40">
              Tarifele definite aici înlocuiesc tarifele de bază pentru perioada selectată.
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
          onSubmit={handleSubmit}
          className="px-6 py-7 md:px-8 md:py-8"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              label="Tip apartament"
              required
            >
              <select
                value={
                  form.roomTypeId
                }
                disabled={isSaving}
                onChange={(event) =>
                  updateField(
                    "roomTypeId",
                    event.target.value,
                  )
                }
                className="h-12 w-full border border-white/10 bg-[#050505] px-4 text-sm text-white outline-none transition focus:border-gold disabled:cursor-wait disabled:opacity-50"
              >
                <option value="">
                  Selectează tipul
                </option>

                {roomTypes
                  .filter(
                    (roomType) =>
                      roomType.isActive,
                  )
                  .map(
                    (roomType) => (
                      <option
                        key={
                          roomType.id
                        }
                        value={
                          roomType.id
                        }
                      >
                        {
                          roomType.nameRo
                        }
                      </option>
                    ),
                  )}
              </select>
            </FormField>

            <div />

            <FormField
              label="Data început"
              required
            >
              <input
                type="date"
                value={
                  form.startDate
                }
                disabled={isSaving}
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
                disabled={isSaving}
                min={
                  form.startDate ||
                  undefined
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

            <PriceField
              label="Tarif weekday"
              value={
                form.weekdayPrice
              }
              disabled={isSaving}
              onChange={(value) =>
                updateField(
                  "weekdayPrice",
                  value,
                )
              }
            />

            <PriceField
              label="Tarif weekend"
              value={
                form.weekendPrice
              }
              disabled={isSaving}
              onChange={(value) =>
                updateField(
                  "weekendPrice",
                  value,
                )
              }
            />
          </div>

          <div className="mt-7 border border-white/10 bg-[#050505] p-5">
            <label className="flex cursor-pointer items-center justify-between gap-6">
              <div>
                <p className="text-sm text-white/70">
                  Perioadă promoțională
                </p>

                <p className="mt-1 text-xs leading-5 text-white/30">
                  Afișează prețurile originale și evidențiază reducerea pe website.
                </p>
              </div>

              <input
                type="checkbox"
                checked={
                  form.isPromotion
                }
                disabled={isSaving}
                onChange={(event) =>
                  updateField(
                    "isPromotion",
                    event.target.checked,
                  )
                }
                className="h-5 w-5 accent-[#c9a55c]"
              />
            </label>
          </div>

          {form.isPromotion && (
            <div className="mt-6 grid gap-6 border border-gold/20 bg-gold/[0.03] p-5 md:grid-cols-2">
              <PriceField
                label="Preț original weekday"
                value={
                  form.originalWeekdayPrice
                }
                disabled={isSaving}
                onChange={(value) =>
                  updateField(
                    "originalWeekdayPrice",
                    value,
                  )
                }
              />

              <PriceField
                label="Preț original weekend"
                value={
                  form.originalWeekendPrice
                }
                disabled={isSaving}
                onChange={(value) =>
                  updateField(
                    "originalWeekendPrice",
                    value,
                  )
                }
              />

              <FormField label="Titlu promoție RO">
                <input
                  type="text"
                  value={
                    form.titleRo
                  }
                  disabled={isSaving}
                  onChange={(event) =>
                    updateField(
                      "titleRo",
                      event.target.value,
                    )
                  }
                  placeholder="Ex. Ofertă de vară"
                  className="h-12 w-full border border-white/10 bg-[#050505] px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-gold"
                />
              </FormField>

              <FormField label="Titlu promoție EN">
                <input
                  type="text"
                  value={
                    form.titleEn
                  }
                  disabled={isSaving}
                  onChange={(event) =>
                    updateField(
                      "titleEn",
                      event.target.value,
                    )
                  }
                  placeholder="Ex. Summer offer"
                  className="h-12 w-full border border-white/10 bg-[#050505] px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-gold"
                />
              </FormField>
            </div>
          )}

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
                  : "Adaugă perioada"}
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

type PriceFieldProps = {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
};

function PriceField({
  label,
  value,
  disabled,
  onChange,
}: PriceFieldProps) {
  return (
    <FormField
      label={label}
      required
    >
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
    </FormField>
  );
}