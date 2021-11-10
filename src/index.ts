import { CoreV1Event, CoreV1EventList } from '@kubernetes/client-node'
import * as k8s from './k8s'
import { enqueMessage, sendQueuedMessages } from './slack'
import { Event, Kind, Reason } from './model'
import { readConfig } from './config'

const flatten = (event: CoreV1Event): Event => {
    return {
        name: event.involvedObject.name,
        kind: event.involvedObject.kind
            ? Kind[event.involvedObject.kind as keyof typeof Kind]
            : undefined,
        namespace: event.involvedObject.namespace,
        fieldPath: event.involvedObject.fieldPath,
        reason: event.reason
            ? Reason[event.reason as keyof typeof Reason]
            : undefined,
        message: event.message,
        type: event.type,
        firstTimestamp: event.firstTimestamp,
        lastTimestamp: event.lastTimestamp,
    }
}

const processEvents = (events: CoreV1EventList) => {
    events.items
        .map((item) => flatten(item))
        .filter(
            (item) => item.kind && [Kind.Pod, Kind.Node].includes(item.kind)
        )
        .filter(
            (item) =>
                item.reason &&
                [
                    Reason.Started,
                    Reason.Killing,
                    Reason.Failed,
                    Reason.SystemOOM,
                ].includes(item.reason)
        )
        .forEach((item) => enqueMessage(item))

    sendQueuedMessages()
}

export type Options = {
    config: string
}

export const fetchEvents = (options: Options) => {
    const config = readConfig(options.config)

    const resourceVersion: string | undefined = undefined

    return new Promise((_, reject) => {
        const interval = config?.events?.interval
        console.log(`Run fetch events in interval of '${interval}ms'`)

        const timeout = setInterval(async () => {
            k8s.fetchEvents(resourceVersion)
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
