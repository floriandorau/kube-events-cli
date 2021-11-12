import dayjs from 'dayjs'

const format = (pattern: string, timestamp?: Date) =>
    timestamp ? dayjs(timestamp).format(pattern) : ''

export const formatDateTime = (timestamp?: Date) =>
    format('YYYY-MM-DD HH:mm:ss', timestamp)
