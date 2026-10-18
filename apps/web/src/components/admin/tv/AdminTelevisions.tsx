"use client";

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';

type TvState = {
  rooms: { id: string; code: string; name: string }[];
  devices: { id: string; roomId: string | null; lastSeenAt: string | null; online: boolean;
    hideGuestName: boolean; forceStandard: boolean;
    content: { mode: string; guest: { displayName: string } | null } }[];
};

export function AdminTelevisions() {
  const [state, setState] = useState<TvState | null>(null);
  const [code, setCode] = useState('');
  const [room, setRoom] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const refresh = async () => { setState(await apiRequest<TvState>('/admin/tv/devices')); };
  useEffect(() => {
    let mounted = true;
    const load = () => apiRequest<TvState>('/admin/tv/devices').then(value => { if (mounted) setState(value); }).catch(e => { if (mounted) setError(e.message); });
    void load(); const timer = setInterval(load, 30000);
    return () => { mounted = false; clearInterval(timer); };
  }, []);
  const mutate = async (path: string, method: 'POST' | 'PATCH', body?: unknown) => {
    setBusy(true); setError('');
    try { await apiRequest(path, { method, body }); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Operația a eșuat.'); }
    finally { setBusy(false); }
  };
  const available = state?.rooms.filter(r => !state.devices.some(d => d.roomId === r.id)) ?? [];
  const selectedRoom = room || available[0]?.id || '';
  const control = 'border border-white/20 bg-[#151515] px-4 py-3 text-white disabled:opacity-40';

  return <section>
    <h1 className="heading text-5xl">Televizoare</h1>
    <p className="mt-4 text-white/60">Asociază codul afișat pe TV cu apartamentul fizic. Mesajul se actualizează automat din rezervările confirmate, între 14:00 și 10:00, ora României.</p>
    {error && <p role="alert" className="mt-6 text-red-300">{error}</p>}
    <form className="my-8 flex flex-wrap gap-4" onSubmit={e => { e.preventDefault(); void mutate('/admin/tv/pairings/approve', 'POST', { code: code.trim().toUpperCase(), roomId: selectedRoom }); }}>
      <label>Cod TV<input required pattern="[a-fA-F0-9]{8}" maxLength={8} value={code} onChange={e => setCode(e.target.value)} className={`${control} ml-3 w-40 uppercase`} /></label>
      <label>Apartament<select required value={selectedRoom} onChange={e => setRoom(e.target.value)} className={`${control} ml-3`}><option value="">Selectează</option>{available.map(r => <option key={r.id} value={r.id}>{r.code} · {r.name}</option>)}</select></label>
      <button disabled={busy || !selectedRoom} className={control}>Asociază televizorul</button>
    </form>
    {!state && !error && <p>Se încarcă…</p>}
    <div className="space-y-5">{state?.devices.map(d => <article key={d.id} className="border border-white/10 p-6">
      <h2 className="text-xl">{state.rooms.find(r => r.id === d.roomId)?.name ?? 'Apartament indisponibil'} · {d.online ? 'Online recent' : 'Fără conexiune recentă'}</h2>
      <p className="my-3 text-white/60">{d.content.guest ? `Welcome, ${d.content.guest.displayName}` : 'Welcome to Sunshine Resort'}</p>
      <div className="flex flex-wrap items-center gap-5">
        <label>Apartament<select className={`${control} ml-2`} value={d.roomId ?? ''} disabled={busy} onChange={e => void mutate(`/admin/tv/devices/${d.id}`, 'PATCH', { roomId: e.target.value })}>{state.rooms.filter(r => r.id === d.roomId || available.some(a => a.id === r.id)).map(r => <option key={r.id} value={r.id}>{r.code} · {r.name}</option>)}</select></label>
        <label><input type="checkbox" checked={d.hideGuestName} disabled={busy} onChange={e => void mutate(`/admin/tv/devices/${d.id}`, 'PATCH', { hideGuestName: e.target.checked })} /> Ascunde numele</label>
        <label><input type="checkbox" checked={d.forceStandard} disabled={busy} onChange={e => void mutate(`/admin/tv/devices/${d.id}`, 'PATCH', { forceStandard: e.target.checked })} /> Ecran standard</label>
        <button className={control} disabled={busy} onClick={() => { if (window.confirm('Revoci accesul acestui televizor? Va necesita o nouă asociere.')) void mutate(`/admin/tv/devices/${d.id}/revoke`, 'POST'); }}>Revocă accesul</button>
      </div>
    </article>)}</div>
    {state && state.devices.length === 0 && <p className="text-white/60">Niciun televizor asociat încă.</p>}
  </section>;
}
