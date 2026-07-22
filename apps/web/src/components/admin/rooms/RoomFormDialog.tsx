"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Monitor,
  Save,
  Users,
  X,
} from "lucide-react";

import type {
  AdminRoom,
  AdminRoomTypeSummary,
  CreateAdminRoomRequest,
  UpdateAdminRoomRequest,
} from "@/types/admin-room";

type RoomFormDialogProps = {
  isOpen: boolean;
  room: AdminRoom | null;
  roomTypes: AdminRoomTypeSummary[];
  isSaving: boolean;
  error: string | null;

  onClose: () => void;

  onCreate: (
    payload: CreateAdminRoomRequest,
  ) => Promise<AdminRoom | null>;

  onUpdate: (
    roomId: string,
    payload: UpdateAdminRoomRequest,
  ) => Promise<AdminRoom | null>;

  onClearError: () => void;
};

type RoomFormState = {
  name: string;
  code: string;
  roomTypeId: string;
  tvDeviceId: string;
  allowsExtraAdult: boolean;
};

const EMPTY_FORM: RoomFormState = {
  name: "",
  code: "",
  roomTypeId: "",
  tvDeviceId: "",
  allowsExtraAdult: false,
};

function getInitialForm(
  room: AdminRoom | null,
): RoomFormState {
  if (!room) {
    return EMPTY_FORM;
  }

  return {
    name: room.name,
    code: room.code,
    roomTypeId: room.roomTypeId,
    tvDeviceId:
      room.tvDeviceId ?? "",
    allowsExtraAdult:
      room.allowsExtraAdult,
  };
}

function formatExtraAdultPrice(
  value: number | null | undefined,
): string {
  if (
    value === null ||
    value === undefined
  ) {
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

export function RoomFormDialog({
  isOpen,
  room,
  roomTypes,
  isSaving,
  error,
  onClose,
  onCreate,
  onUpdate,
  onClearError,
}: RoomFormDialogProps) {
  const [form, setForm] =
    useState<RoomFormState>(() =>
      getInitialForm(room),
    );

  const [localError, setLocalError] =
    useState<string | null>(null);

  const isEditing = room !== null;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm(
      getInitialForm(room),
    );

    setLocalError(null);
    onClearError();
  }, [
    isOpen,
    room,
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

  const selectedRoomType =
    useMemo(
      () =>
        roomTypes.find(
          (roomType) =>
            roomType.id ===
            form.roomTypeId,
        ) ?? null,
      [
        form.roomTypeId,
        roomTypes,
      ],
    );

  if (!isOpen) {
    return null;
  }

  function updateField<
    Key extends keyof RoomFormState,
  >(
    field: Key,
    value: RoomFormState[Key],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    setLocalError(null);
    onClearError();
  }

  function validateForm(): string | null {
    if (!form.name.trim()) {
      return "Numele apartamentului este obligatoriu.";
    }

    if (!form.code.trim()) {
      return "Codul apartamentului este obligatoriu.";
    }

    if (!form.roomTypeId) {
      return "Selectează tipul apartamentului.";
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

    const payload: CreateAdminRoomRequest = {
      name:
        form.name.trim(),

      code:
        form.code
          .trim()
          .toUpperCase(),

      roomTypeId:
        form.roomTypeId,

      allowsExtraAdult:
        form.allowsExtraAdult,

      ...(form.tvDeviceId.trim() && {
        tvDeviceId:
          form.tvDeviceId.trim(),
      }),
    };

    const savedRoom =
      isEditing
        ? await onUpdate(
            room.id,
            payload,
          )
        : await onCreate(
            payload,
          );

    if (savedRoom) {
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
      aria-labelledby="room-form-title"
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
              Inventory
            </p>

            <h2
              id="room-form-title"
              className="heading mt-3 text-4xl font-light"
            >
              {isEditing
                ? "Editează apartamentul"
                : "Adaugă apartament"}
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-white/40">
              Configurează apartamentul fizic, tipul său, capacitatea și asocierea cu sistemul TV Welcome.
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
              label="Nume apartament"
              required
            >
              <input
                type="text"
                value={form.name}
                disabled={isSaving}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value,
                  )
                }
                placeholder="Ex. Premium 1"
                className="h-12 w-full border border-white/10 bg-[#050505] px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-gold disabled:cursor-wait disabled:opacity-50"
              />
            </FormField>

            <FormField
              label="Cod"
              required
            >
              <input
                type="text"
                value={form.code}
                disabled={isSaving}
                onChange={(event) =>
                  updateField(
                    "code",
                    event.target.value.toUpperCase(),
                  )
                }
                placeholder="Ex. P1"
                className="h-12 w-full border border-white/10 bg-[#050505] px-4 text-sm uppercase text-white outline-none transition placeholder:text-white/20 focus:border-gold disabled:cursor-wait disabled:opacity-50"
              />
            </FormField>

            <FormField
              label="Tip apartament"
              required
            >
              <select
                value={form.roomTypeId}
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

                {roomTypes.map(
                  (roomType) => (
                    <option
                      key={roomType.id}
                      value={roomType.id}
                    >
                      {roomType.nameRo}
                    </option>
                  ),
                )}
              </select>

              {selectedRoomType && (
                <p className="mt-2 text-xs text-white/25">
                  {selectedRoomType.nameEn}
                </p>
              )}
            </FormField>

            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-white/40">
                Adult suplimentar
              </p>

              <div
                className={`flex min-h-[72px] items-center justify-between gap-5 border px-5 py-4 transition ${
                  form.allowsExtraAdult
                    ? "border-gold/35 bg-gold/[0.06]"
                    : "border-white/10 bg-[#050505]"
                }`}
              >
                <div className="flex min-w-0 items-start gap-4">
                  <Users
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      form.allowsExtraAdult
                        ? "text-gold"
                        : "text-white/25"
                    }`}
                  />

                  <div className="min-w-0">
                    <p
                      className={`text-sm ${
                        form.allowsExtraAdult
                          ? "text-white/80"
                          : "text-white/45"
                      }`}
                    >
                      Permite un adult suplimentar
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/25">
                      Maximum o persoană în plus pentru acest apartament.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={
                    form.allowsExtraAdult
                  }
                  aria-label="Permite un adult suplimentar"
                  disabled={isSaving}
                  onClick={() =>
                    updateField(
                      "allowsExtraAdult",
                      !form.allowsExtraAdult,
                    )
                  }
                  className={`relative h-7 w-14 shrink-0 rounded-full border transition-all duration-300 disabled:cursor-wait disabled:opacity-50 ${
                    form.allowsExtraAdult
                      ? "border-gold bg-gold/20"
                      : "border-white/15 bg-black"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full transition-all duration-300 ${
                      form.allowsExtraAdult
                        ? "left-8 bg-gold"
                        : "left-1 bg-white/45"
                    }`}
                  />
                </button>
              </div>

              {selectedRoomType &&
                form.allowsExtraAdult && (
                  <p className="mt-2 text-xs leading-6 text-white/30">
                    Tarif configurat pentru{" "}
                    {selectedRoomType.nameRo}:{" "}
                    <span className="text-gold">
                      {formatExtraAdultPrice(
                        selectedRoomType.extraAdultPrice,
                      )}{" "}
                      / noapte
                    </span>
                  </p>
                )}
            </div>
          </div>

          <div className="mt-6">
            <FormField label="TV Device ID">
              <div className="relative">
                <Monitor className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />

                <input
                  type="text"
                  value={form.tvDeviceId}
                  disabled={isSaving}
                  onChange={(event) =>
                    updateField(
                      "tvDeviceId",
                      event.target.value,
                    )
                  }
                  placeholder="Ex. TV-APT-01"
                  className="h-12 w-full border border-white/10 bg-[#050505] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-gold disabled:cursor-wait disabled:opacity-50"
                />
              </div>

              <p className="mt-2 text-xs leading-6 text-white/25">
                Identificatorul unic folosit de sistemul TV Welcome pentru acest apartament.
              </p>
            </FormField>
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
              className="h-12 border border-white/10 px-6 text-[10px] uppercase tracking-[0.25em] text-white/45 transition hover:border-white/25 hover:text-white disabled:cursor-wait disabled:opacity-40"
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
                  : "Adaugă apartamentul"}
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