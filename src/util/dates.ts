import type { ReadonlyDateTime, ReadonlyInterval } from "./readonly-types";

export const eachDayOfInterval = (interval: ReadonlyInterval) => {
  if (!interval.start || !interval.end) return [];

  const days: ReadonlyDateTime[] = [];
  let cursor = interval.start;
  while (cursor <= interval.end!) {
    days.push(cursor);
    cursor = cursor.plus({ days: 1 });
  }
  return days;
};
