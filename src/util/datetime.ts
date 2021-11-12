import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

const format = (pattern: string, timestamp?: Date) =>
    timestamp ? dayjs(timestamp).format(pattern) : ''

export const formatDateTime = (timestamp?: Date) =>
    format('YYYY-MM-DD HH:mm:ss', timestamp)

export const isAfter = (dateA?: Date, dateB?: Date) =>
    dayjs(dateA).isAfter(dateB)
export const fromNow = (timestamp?: Date) => dayjs(timestamp).fromNow()
