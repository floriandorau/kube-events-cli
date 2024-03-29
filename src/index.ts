import { isAfter } from './util/datetime'
import { Event, fetchEvents } from './k8s'
import { getConfig, readConfig } from './util/config'
import { enqueMessage, sendQueuedMessages } from './slack'
import { includes } from './util'

// remember cli started to filter for past dates
const startedAt = new Date()

const filterEvents = (events: Event[]): Event[] => {
    const { k8sEvents, processPastEvents } = getConfig()
    return events
        .filter(
            ({ lastTimestamp }) =>
                processPastEvents || isAfter(lastTimestamp, startedAt)
        )
        .filter(
            ({ namespace }) =>
                k8sEvents.namespaces.length === 0 ||
                includes(k8sEvents.namespaces, namespace)
        )
        .filter(
            ({ kind }) =>
                k8sEvents.kinds.length === 0 || includes(k8sEvents.kinds, kind)
        )
        .filter(
            ({ reason }) =>
                k8sEvents.reasons.length === 0 ||
                includes(k8sEvents.reasons, reason)
        )
}

const processEvents = (events: Event[]) => {
    filterEvents(events).forEach((event) => enqueMessage(event))
    sendQueuedMessages()
}

export type Options = {
    config: string
}

export const fetchK8sEvents = (options: Options) => {
    const config = readConfig(options.config)

    return new Promise((_, reject) => {
        const interval = config?.fetchInterval
        console.log(`Run fetch events in interval of '${interval}ms'`)

        const timeout = setInterval(async () => {
            fetchEvents()
                .then(processEvents)
                .catch((err) => {
                    console.error(
                        'Erro while fetching events. Clearing interval timeout'
                    )
                    clearInterval(timeout)
                    reject(err)
                })
        }, interval)
    })
}
