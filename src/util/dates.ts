import type { DateTime, Interval } from 'luxon'

export const eachDayOfInterval = (interval: Interval): DateTime[] => {
  if (!interval.start || !interval.end) return []

  const days: DateTime[] = []
  let cursor = interval.start
  while (cursor <= interval.end!) {
    days.push(cursor)
    cursor = cursor.plus({ days: 1 })
  }
  return days
}
