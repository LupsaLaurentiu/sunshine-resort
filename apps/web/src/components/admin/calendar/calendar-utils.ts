import type {
  CalendarDateRange,
  CalendarDay,
  CalendarEvent,
} from "@/types/admin-calendar";

const MILLISECONDS_PER_DAY = 86_400_000;

function createUtcDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatDateValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(
  date: Date,
  amount: number,
): Date {
  const nextDate = new Date(date);

  nextDate.setUTCDate(
    nextDate.getUTCDate() + amount,
  );

  return nextDate;
}

function getStartOfMonth(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      1,
    ),
  );
}

function getStartOfNextMonth(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      1,
    ),
  );
}

export function getTodayDateValue(): string {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Europe/Bucharest",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).format(new Date());
}

export function getMonthRange(
  anchorDate: Date,
): CalendarDateRange {
  return {
    from: formatDateValue(
      getStartOfMonth(anchorDate),
    ),
    to: formatDateValue(
      getStartOfNextMonth(anchorDate),
    ),
  };
}

export function getThirtyDayRange(
  anchorDate: Date,
): CalendarDateRange {
  const startDate = new Date(
    Date.UTC(
      anchorDate.getUTCFullYear(),
      anchorDate.getUTCMonth(),
      anchorDate.getUTCDate(),
    ),
  );

  return {
    from: formatDateValue(startDate),
    to: formatDateValue(
      addDays(startDate, 30),
    ),
  };
}

export function getPreviousMonth(
  anchorDate: Date,
): Date {
  return new Date(
    Date.UTC(
      anchorDate.getUTCFullYear(),
      anchorDate.getUTCMonth() - 1,
      1,
    ),
  );
}

export function getNextMonth(
  anchorDate: Date,
): Date {
  return new Date(
    Date.UTC(
      anchorDate.getUTCFullYear(),
      anchorDate.getUTCMonth() + 1,
      1,
    ),
  );
}

export function getPreviousThirtyDays(
  anchorDate: Date,
): Date {
  return addDays(anchorDate, -30);
}

export function getNextThirtyDays(
  anchorDate: Date,
): Date {
  return addDays(anchorDate, 30);
}

export function getCalendarDays(
  range: CalendarDateRange,
  primaryMonth: number,
): CalendarDay[] {
  const fromDate = createUtcDate(
    range.from,
  );

  const toDate = createUtcDate(
    range.to,
  );

  const today = getTodayDateValue();

  const days: CalendarDay[] = [];

  for (
    let currentDate = fromDate;
    currentDate < toDate;
    currentDate = addDays(currentDate, 1)
  ) {
    const dateValue =
      formatDateValue(currentDate);

    const weekdayIndex =
      currentDate.getUTCDay();

    days.push({
      date: dateValue,

      dayNumber:
        currentDate.getUTCDate(),

      weekdayLabel:
        new Intl.DateTimeFormat(
          "ro-RO",
          {
            weekday: "short",
            timeZone: "UTC",
          },
        ).format(currentDate),

      isToday:
        dateValue === today,

      isWeekend:
        weekdayIndex === 0 ||
        weekdayIndex === 6,

      isOutsidePrimaryMonth:
        currentDate.getUTCMonth() !==
        primaryMonth,
    });
  }

  return days;
}

export function getDaysBetween(
  start: string,
  end: string,
): number {
  const startDate =
    createUtcDate(start);

  const endDate =
    createUtcDate(end);

  return Math.max(
    0,
    Math.round(
      (
        endDate.getTime() -
        startDate.getTime()
      ) /
        MILLISECONDS_PER_DAY,
    ),
  );
}

export function clampEventToRange(
  event: CalendarEvent,
  range: CalendarDateRange,
): {
  start: string;
  end: string;
} | null {
  const eventStart =
    createUtcDate(event.start);

  const eventEnd =
    createUtcDate(event.end);

  const rangeStart =
    createUtcDate(range.from);

  const rangeEnd =
    createUtcDate(range.to);

  const visibleStart =
    eventStart < rangeStart
      ? rangeStart
      : eventStart;

  const visibleEnd =
    eventEnd > rangeEnd
      ? rangeEnd
      : eventEnd;

  if (
    visibleEnd <= visibleStart
  ) {
    return null;
  }

  return {
    start:
      formatDateValue(visibleStart),

    end:
      formatDateValue(visibleEnd),
  };
}

export function getEventGridPosition(
  event: CalendarEvent,
  range: CalendarDateRange,
): {
  columnStart: number;
  columnSpan: number;
} | null {
  const visibleEvent =
    clampEventToRange(
      event,
      range,
    );

  if (!visibleEvent) {
    return null;
  }

  const offset =
    getDaysBetween(
      range.from,
      visibleEvent.start,
    );

  const duration =
    getDaysBetween(
      visibleEvent.start,
      visibleEvent.end,
    );

  if (duration <= 0) {
    return null;
  }

  return {
    columnStart: offset + 1,
    columnSpan: duration,
  };
}

export function formatCalendarRangeTitle(
  range: CalendarDateRange,
): string {
  const startDate =
    createUtcDate(range.from);

  const endExclusive =
    createUtcDate(range.to);

  const endDate =
    addDays(endExclusive, -1);

  const formatter =
    new Intl.DateTimeFormat(
      "ro-RO",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      },
    );

  if (
    startDate.getUTCFullYear() ===
      endDate.getUTCFullYear() &&
    startDate.getUTCMonth() ===
      endDate.getUTCMonth()
  ) {
    return new Intl.DateTimeFormat(
      "ro-RO",
      {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      },
    ).format(startDate);
  }

  return `${formatter.format(
    startDate,
  )} – ${formatter.format(endDate)}`;
}

export function getRoomEvents(
  events: CalendarEvent[],
  roomId: string,
): CalendarEvent[] {
  return events
    .filter(
      (event) =>
        event.roomId === roomId,
    )
    .sort((firstEvent, secondEvent) =>
      firstEvent.start.localeCompare(
        secondEvent.start,
      ),
    );
}