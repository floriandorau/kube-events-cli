import NodeCache from 'node-cache'

import { CachedEvent } from './model'

const cache = new NodeCache({
    stdTTL: 24 * 60 * 60, // seconds
    checkperiod: 120, // seconds
    deleteOnExpire: true,
})

export const set = (key: string, val: CachedEvent) => cache.set(key, val)
export const get = (key: string): CachedEvent | undefined => cache.get(key)
export const size = () => cache.keys().length

export const forEach = (
    consumer: (key: string, cachedEvent: CachedEvent) => void
) => {
    cache.keys().forEach((key) => consumer(key, cache.get(key)!))
}
