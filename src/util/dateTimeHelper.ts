export function formatDateTimeUTC(dateString: string): string {
  const date = new Date(dateString);

  return date
    .toLocaleString('en-US', {
      timeZone: 'UTC',
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .replace(',', '');
}

// "2026-08-20" -> "August 20 2026" (accessible name of cheapflights calendar day cells).
export function formatDateAsCalendarCellLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const monthName = new Date(Date.UTC(year, month - 1, day)).toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
  return `${monthName} ${day} ${year}`;
}

// "2026-08-20" -> "August 2026" (accessible name of cheapflights calendar month grids).
export function formatDateAsCalendarMonthLabel(isoDate: string): string {
  const [year, month] = isoDate.split('-').map(Number);
  const monthName = new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
  return `${monthName} ${year}`;
}

// "2026-08-20" -> "20/8" (day/month label the cheapflights date buttons echo, e.g. "Thu 20/8").
export function formatDateAsDayMonthShort(isoDate: string): string {
  const [, month, day] = isoDate.split('-').map(Number);
  return `${day}/${month}`;
}

export async function generateFutureDate(days: number): Promise<string> {
  const currentDate = new Date();
  const futureStartDate = new Date(currentDate); // Clone current date
  futureStartDate.setDate(currentDate.getDate() + days);
  // Format as YYYY-MM-DD
  const year = futureStartDate.getFullYear();
  const month = String(futureStartDate.getMonth() + 1).padStart(2, "0");
  const day = String(futureStartDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
