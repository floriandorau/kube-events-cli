import NodeCache from 'node-cache'

import { Kind, Event } from '../k8s'

export type CachedEvent = {
    name: string
    kind: Kind
    namespace?: string
    events: Event[]
    processed: boolean
    ts?: string
}

const cache = new NodeCache({
    stdTTL: 2 * 60 * 60, // seconds
    checkperiod: 600, // seconds
    deleteOnExpire: true,
})

cache.on('expired', (key) => console.log(`Cached event ${key} expired`))
cache.on('del', (key) => console.log(`Cached event ${key} deleted`))

export const set = (key: string, val: CachedEvent) => cache.set(key, val)
export const get = (key: string): CachedEvent | undefined => cache.get(key)
export const size = () => cache.keys().length

export const forEach = (
    consumer: (key: string, cachedEvent: CachedEvent) => void
) => {
    cache.keys().forEach((key) => consumer(key, cache.get(key)!))
}
