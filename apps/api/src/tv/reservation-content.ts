// Date-only columns are calendar dates, not instants. Convert using the resort's
// IANA timezone on each endpoint date (offsets can differ across a DST change).
const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Bucharest', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});

export function bucharestInstant(date: Date, time: string): Date {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Invalid stay time');
  const [hours, minutes] = time.split(':').map(Number);
  const wall = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hours, minutes);
  let instant = wall;
  for (let pass = 0; pass < 3; pass++) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(instant)).map(p => [p.type, p.value]));
    const represented = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
    instant += wall - represented;
  }
  return new Date(instant);
}

export type TvReservation = {
  id: string; status: string; checkInDate: Date; checkOutDate: Date;
  cancelledAt: Date | null; checkedOutAt: Date | null;
  guest: { firstName: string; lastName: string };
};

export function resolveGuest(reservations: TvReservation[], now: Date) {
  const active = reservations.filter(r => {
    if (!['CONFIRMED', 'CHECKED_IN'].includes(r.status) || r.cancelledAt || r.checkedOutAt) return false;
    const start = bucharestInstant(r.checkInDate, '14:00');
    const end = bucharestInstant(r.checkOutDate, '10:00');
    return start < end && now >= start && now < end;
  });
  // Count reservations before checking identity: an unnamed overlapping stay is
  // still a conflict and must never result in choosing another guest.
  if (active.length !== 1) return null;
  const selected = active[0];
  const displayName = `${selected.guest.firstName.trim()} ${selected.guest.lastName.trim()}`.trim();
  if (!displayName || displayName.length > 100) return null;
  return { displayName, checkOut: bucharestInstant(selected.checkOutDate, '10:00') };
}
