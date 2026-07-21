import type { CalendarSummary } from "@/types/admin-calendar";

type CalendarLegendProps = {
  summary: CalendarSummary;
};

const ITEMS = [
  {
    color: "bg-emerald-500",
    label: "Rezervare confirmată",
  },
  {
    color: "bg-amber-500",
    label: "În așteptarea plății",
  },
  {
    color: "bg-sky-500",
    label: "Cerere nouă",
  },
  {
    color: "bg-rose-500",
    label: "Blocată",
  },
  {
    color: "bg-violet-500",
    label: "Calendar extern",
  },
];

export function CalendarLegend({
  summary,
}: CalendarLegendProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-6">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold">
            Calendar
          </p>

          <h2 className="heading mt-3 text-3xl font-light">
            Legendă
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
            Calendarul afișează rezervările, blocările administrative și
            evenimentele sincronizate prin iCal.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
            >
              <span
                className={`h-3 w-3 rounded-full ${item.color}`}
              />

              <span className="text-xs text-white/70">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-5">
        <SummaryCard
          title="Camere"
          value={summary.roomCount}
        />

        <SummaryCard
          title="Rezervări"
          value={summary.reservationEventCount}
        />

        <SummaryCard
          title="Blocări"
          value={summary.blockedPeriodCount}
        />

        <SummaryCard
          title="iCal"
          value={summary.externalEventCount}
        />

        <SummaryCard
          title="Nealocate"
          value={summary.unassignedReservationCount}
        />
      </div>
    </section>
  );
}

type SummaryCardProps = {
  title: string;
  value: number;
};

function SummaryCard({
  title,
  value,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
        {title}
      </p>

      <p className="heading mt-3 text-3xl font-light">
        {value}
      </p>
    </div>
  );
}