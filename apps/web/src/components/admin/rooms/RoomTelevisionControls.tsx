"use client";

import { useState } from "react";
import type { RoomTelevision, TvMutation } from "@/hooks/useRoomTelevisions";

export type RoomTelevisionControlsProps = {
  roomId: string;
  device: RoomTelevision | null | undefined;
  availableRooms: { id: string; code: string; name: string }[];
  busy: boolean;
  mutate: TvMutation;
};

export function RoomTelevisionControls({ roomId, device, availableRooms, busy, mutate }: RoomTelevisionControlsProps) {
  const [code, setCode] = useState("");
  const control = "min-h-11 border border-white/15 bg-[#050505] px-3 py-2 text-xs text-white/70 outline-none focus-visible:border-gold disabled:cursor-not-allowed disabled:opacity-40";
  const patch = (body: unknown) => device && void mutate(`/admin/tv/devices/${device.id}`, "PATCH", body);
  return <section aria-label="Configurare TV Welcome" className="border-t border-white/10 px-6 py-5">
    <p className="mb-3 text-[9px] uppercase tracking-[0.24em] text-gold">TV Welcome</p>
    {device === undefined ? <p className="text-xs text-white/40">Starea TV nu este disponibilă momentan.</p> : device ? <>
      <p className="mb-4 text-sm text-white/65">{device.content.guest ? `Welcome, ${device.content.guest.displayName}` : "Welcome to Sunshine Resort"}</p>
      <div className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-white/60">
        <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={device.hideGuestName} disabled={busy} onChange={e => patch({ hideGuestName: e.target.checked })} />Ascunde numele</label>
        <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={device.forceStandard} disabled={busy} onChange={e => patch({ forceStandard: e.target.checked })} />Ecran standard</label>
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        {availableRooms.length > 0 && <select aria-label="Mută televizorul în alt apartament" value="" disabled={busy} className={`${control} min-w-0 flex-1`} onChange={e => { if (e.target.value) patch({ roomId: e.target.value }); }}><option value="">Mută în alt apartament</option>{availableRooms.map(r => <option key={r.id} value={r.id}>{r.code} · {r.name}</option>)}</select>}
        <button type="button" disabled={busy} className={control} onClick={() => {
          if (window.confirm("Revoci accesul televizorului? Va necesita o nouă asociere prin cod.")) void mutate(`/admin/tv/devices/${device.id}/revoke`, "POST");
        }}>Revocă accesul</button>
      </div>
    </> : <>
      <p className="mb-4 text-xs leading-6 text-white/40">Introdu codul afișat pe televizor. Asocierea se face o singură dată.</p>
      <form className="flex flex-wrap gap-3" onSubmit={async e => {
        e.preventDefault();
        if (await mutate("/admin/tv/pairings/approve", "POST", { code: code.trim().toUpperCase(), roomId })) setCode("");
      }}>
        <input aria-label="Cod de asociere TV" required pattern="[a-fA-F0-9]{8}" maxLength={8} autoComplete="off" placeholder="Cod TV" value={code} disabled={busy} onChange={e => setCode(e.target.value)} className={`${control} w-32 uppercase`} />
        <button type="submit" disabled={busy} className={`${control} border-gold/30 text-gold`}>Asociază TV</button>
      </form>
    </>}
  </section>;
}
