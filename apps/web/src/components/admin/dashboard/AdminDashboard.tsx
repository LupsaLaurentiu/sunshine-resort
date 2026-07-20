import { DashboardCard } from "./DashboardCard";

const mockMetrics = [
  {
    id: "pending",
    label: "În așteptarea aprobării",
    value: 0,
    description:
      "Cereri care necesită verificarea administratorului.",
  },
  {
    id: "check-ins",
    label: "Check-in astăzi",
    value: 0,
    description:
      "Rezervări cu sosirea programată pentru astăzi.",
  },
  {
    id: "check-outs",
    label: "Check-out astăzi",
    value: 0,
    description:
      "Rezervări cu plecarea programată pentru astăzi.",
  },
  {
    id: "occupancy",
    label: "Grad de ocupare",
    value: "0%",
    description:
      "Ocuparea curentă a celor opt apartamente.",
  },
];

export function AdminDashboard() {
  return (
    <section>
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">
            Overview
          </p>

          <h1 className="heading mt-4 text-5xl font-light md:text-7xl">
            Dashboard
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">
            Situația operațională a resortului,
            rezervările și activitatea curentă.
          </p>
        </div>

        <p className="text-xs uppercase tracking-[0.25em] text-white/30">
          Datele reale vor fi conectate la API
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {mockMetrics.map((metric) => (
          <DashboardCard
            key={metric.id}
            label={metric.label}
            value={metric.value}
            description={metric.description}
          />
        ))}
      </div>

      <section className="mt-10 border border-white/10 bg-[#0b0b0b]">
        <div className="flex items-center justify-between border-b border-white/10 px-7 py-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
              Activitate recentă
            </p>

            <h2 className="heading mt-2 text-3xl font-light">
              Rezervări recente
            </h2>
          </div>
        </div>

        <div className="px-7 py-16 text-center">
          <p className="heading text-3xl font-light text-white/60">
            Nu există date încă.
          </p>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/35">
            În etapa următoare conectăm lista
            rezervărilor și indicatorii reali
            din backend.
          </p>
        </div>
      </section>
    </section>
  );
}