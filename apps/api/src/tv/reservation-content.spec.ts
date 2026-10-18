import { bucharestInstant, resolveGuest, type TvReservation } from './reservation-content';

const date = (day: string) => new Date(`${day}T00:00:00Z`);
const reservation = (overrides: Partial<TvReservation> = {}): TvReservation => ({
  id: 'stay', status: 'CONFIRMED', checkInDate: date('2026-11-15'), checkOutDate: date('2026-11-18'),
  guest: { firstName: 'Ana', lastName: 'Test' }, cancelledAt: null, checkedOutAt: null, ...overrides,
});

describe('reservation-driven TV content', () => {
  it('includes 14:00 check-in and excludes 10:00 check-out in Bucharest', () => {
    const stays = [reservation()];
    expect(resolveGuest(stays, new Date('2026-11-15T11:59:59Z'))).toBeNull();
    expect(resolveGuest(stays, new Date('2026-11-15T12:00:00Z'))?.displayName).toBe('Ana Test');
    expect(resolveGuest(stays, new Date('2026-11-18T07:59:59Z'))).not.toBeNull();
    expect(resolveGuest(stays, new Date('2026-11-18T08:00:00Z'))).toBeNull();
  });

  it.each([
    ['2026-03-28', '2026-03-28T12:00:00.000Z'],
    ['2026-03-29', '2026-03-29T11:00:00.000Z'],
    ['2026-10-24', '2026-10-24T11:00:00.000Z'],
    ['2026-10-25', '2026-10-25T12:00:00.000Z'],
  ])('uses the offset valid on %s', (day, expected) => {
    expect(bucharestInstant(date(day), '14:00').toISOString()).toBe(expected);
  });

  it('does not require the scheduler to mark a confirmed booking checked-in', () => {
    expect(resolveGuest([reservation()], new Date('2026-11-16T12:00:00Z'))).not.toBeNull();
  });

  it.each(['PENDING_APPROVAL', 'APPROVED_AWAITING_PAYMENT', 'REJECTED', 'CANCELLED', 'EXPIRED', 'CHECKED_OUT', 'NO_SHOW'])('excludes %s', status => {
    expect(resolveGuest([reservation({ status })], new Date('2026-11-16T12:00:00Z'))).toBeNull();
  });

  it('fails closed on overlapping reservations, even when one has no guest name', () => {
    expect(resolveGuest([reservation(), reservation({ id: 'other', guest: { firstName: '', lastName: '' } })], new Date('2026-11-16T12:00:00Z'))).toBeNull();
  });

  it('clears the old guest between same-day checkout and the next check-in', () => {
    const stays = [reservation(), reservation({ id: 'next', checkInDate: date('2026-11-18'), checkOutDate: date('2026-11-20'), guest: { firstName: 'Next', lastName: 'Guest' } })];
    expect(resolveGuest(stays, new Date('2026-11-18T10:00:00Z'))).toBeNull();
    expect(resolveGuest(stays, new Date('2026-11-18T12:00:00Z'))?.displayName).toBe('Next Guest');
  });

  it('excludes early departure, cancellation and invalid intervals', () => {
    const now = new Date('2026-11-16T12:00:00Z');
    for (const stay of [reservation({ checkedOutAt: now }), reservation({ cancelledAt: now }), reservation({ checkOutDate: date('2026-11-14') })]) {
      expect(resolveGuest([stay], now)).toBeNull();
    }
  });
});
