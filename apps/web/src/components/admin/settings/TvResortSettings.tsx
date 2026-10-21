"use client";

import Image from "next/image";
import { Check, Eye, EyeOff, Save, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

const sections = [
  { key: "tagline", title: "Mesaj de prezentare", description: "Textul scurt afișat sub mesajul de întâmpinare.", limit: 160 },
  { key: "houseRules", title: "Regulile casei", description: "Liniște, fumat, utilizarea spațiilor comune și alte reguli ale resortului.", limit: 6000 },
  { key: "facilities", title: "Facilități", description: "Serviciile și facilitățile disponibile, împreună cu programul lor.", limit: 6000 },
  { key: "attractions", title: "Atracții turistice", description: "Recomandări pentru explorarea Maramureșului.", limit: 6000 },
  { key: "usefulInfo", title: "Informații utile", description: "Check-in, check-out și alte detalii pentru un sejur liniștit.", limit: 6000 },
  { key: "contact", title: "Contact", description: "Numărul și datele de contact pe care dorești să le vadă oaspeții.", limit: 2000 },
] as const;
type SettingsKey = `${typeof sections[number]["key"]}${"Ro" | "En"}`;
type Settings = Record<SettingsKey | "wifiSsid" | "wifiPassword", string> & { updatedAt?: string | null };

export function TvResortSettings() {
  const [form, setForm] = useState<Settings | null>(null);
  const [language, setLanguage] = useState<"Ro" | "En">("Ro");
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    apiRequest<Settings>("/admin/tv/settings", { cache: "no-store" })
      .then(data => { if (active) { setForm(data); setError(""); } })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : "Setările nu au putut fi încărcate."); });
    return () => { active = false; };
  }, [reload]);
  const update = (key: SettingsKey | "wifiSsid" | "wifiPassword", value: string) => {
    setForm(current => current ? { ...current, [key]: value } : current); setSaved(false);
  };
  const field = "w-full border border-white/10 bg-[#050505] px-4 py-3 text-sm leading-7 text-white/80 outline-none transition placeholder:text-white/20 focus:border-gold/70 disabled:opacity-50";
  return <section className="border border-white/10 bg-[#0b0b0b]">
    <header className="flex flex-col gap-6 border-b border-white/10 p-6 md:flex-row md:items-center md:p-8">
      <Image src="/logo-sunshine.png" alt="Sunshine Resort" width={160} height={160} className="h-20 w-20 object-contain brightness-0 invert" />
      <div><p className="text-[10px] uppercase tracking-[0.35em] text-gold">Experiența oaspeților</p><h2 className="heading mt-3 text-4xl font-light">Un sejur, toate detaliile.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/40">Informațiile afișate pe televizoare, în română și engleză. Se păstrează și pe ecranul standard, după check-out.</p></div>
    </header>
    {error && <div role="alert" className="m-6 border border-red-300/20 bg-red-300/5 p-4 text-sm text-red-200">{error}{!form && <button type="button" className="ml-4 underline" onClick={() => setReload(value => value + 1)}>Reîncearcă</button>}</div>}
    {!form ? !error && <p className="p-8 text-sm text-white/40">Se încarcă informațiile resortului…</p> : <form onSubmit={async event => {
      event.preventDefault(); setBusy(true); setError(""); setSaved(false);
      try {
        const body = Object.fromEntries(["wifiSsid", "wifiPassword", ...sections.flatMap(section => [`${section.key}Ro`, `${section.key}En`])].map(key => [key, form[key as keyof Settings]]));
        await apiRequest("/admin/tv/settings", { method: "PUT", body }); setSaved(true);
      } catch (e) { setError(e instanceof Error ? e.message : "Salvarea a eșuat."); }
      finally { setBusy(false); }
    }}>
      <fieldset disabled={busy} className="p-6 md:p-8">
        <legend className="sr-only">Conținut TV Welcome</legend>
        <div className="mb-8 grid gap-6 border-b border-white/10 pb-8 md:grid-cols-2">
          <div className="md:col-span-2"><p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-gold"><Wifi size={16} /> Conectare Wi-Fi</p><p className="mt-2 text-xs leading-6 text-white/35">Aceste date sunt afișate doar pe televizoarele asociate. Nu sunt publicate pe website.</p></div>
          <label className="space-y-3 text-xs text-white/50"><span className="block">Numele rețelei (SSID)</span><input autoComplete="off" maxLength={128} value={form.wifiSsid} onChange={e => update("wifiSsid", e.target.value)} className={field} placeholder="Completează rețeaua pentru oaspeți" /></label>
          <div><label className="mb-3 block text-xs text-white/50" htmlFor="tv-wifi-password">Parola rețelei</label><div className="flex"><input id="tv-wifi-password" type={visiblePassword ? "text" : "password"} autoComplete="new-password" maxLength={128} value={form.wifiPassword} onChange={e => update("wifiPassword", e.target.value)} className={field} /><button type="button" aria-label={visiblePassword ? "Ascunde parola" : "Arată parola"} aria-pressed={visiblePassword} onClick={() => setVisiblePassword(value => !value)} className="border border-l-0 border-white/10 px-4 text-gold focus-visible:outline focus-visible:outline-gold">{visiblePassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
        </div>
        <div className="mb-8 flex items-center justify-between gap-4"><p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Limba conținutului</p><div className="flex gap-2" role="group" aria-label="Limba conținutului">{([['Ro', 'Română'], ['En', 'English']] as const).map(([value, label]) => <button type="button" key={value} aria-pressed={language === value} onClick={() => setLanguage(value)} className={`border px-5 py-3 text-xs transition focus-visible:outline focus-visible:outline-gold ${language === value ? "border-gold/40 bg-gold/10 text-gold" : "border-white/10 text-white/40"}`}>{label}</button>)}</div></div>
        <div className="grid items-start gap-7 lg:grid-cols-2">{sections.map(section => {
          const key: SettingsKey = `${section.key}${language}`;
          return <label key={section.key} className={section.key === "tagline" ? "lg:col-span-2" : ""}><span className="heading block text-2xl text-white/85">{section.title}</span><span className="mb-3 mt-2 block text-xs leading-6 text-white/35">{section.description}</span><textarea lang={language === "Ro" ? "ro" : "en"} rows={section.key === "tagline" ? 2 : 5} maxLength={section.limit} value={form[key]} onChange={e => update(key, e.target.value)} className={`${field} resize-y`} /><span className="mt-2 block text-right text-[10px] text-white/25">{form[key].length} / {section.limit}</span></label>;
        })}</div>
      </fieldset>
      <footer className="flex flex-col justify-between gap-5 border-t border-white/10 p-6 sm:flex-row sm:items-center md:px-8"><div className="max-w-xl text-xs leading-6 text-white/40" role="status">{saved ? <span className="flex items-center gap-2 text-emerald-300"><Check size={16} /> Informațiile au fost salvate. Televizoarele le vor prelua automat.</span> : "Fiecare paragraf poate fi afișat pe TV. Textele necompletate rămân nepublicate; parola nu este tradusă."}</div><button type="submit" disabled={busy} className="inline-flex shrink-0 items-center justify-center gap-3 bg-gold px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-white disabled:opacity-40"><Save size={16} />{busy ? "Se salvează…" : "Salvează informațiile TV"}</button></footer>
    </form>}
  </section>;
}
