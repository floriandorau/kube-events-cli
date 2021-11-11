import { getConfig, readConfig } from './util/config'
import { Event, Kind, Reason, fetchEvents } from './k8s'
import { enqueMessage, sendQueuedMessages } from './slack'

const relevantKinds = [Kind.Pod, Kind.Node]
const relevantReasons = [
    Reason.Started,
    Reason.Killing,
    Reason.Failed,
    Reason.SystemOOM,
]

const processEvents = (events: Event[]) => {
    const { k8sEvents } = getConfig()
    events
        .filter(
            ({ namespace }) =>
                namespace && k8sEvents.namespaces.includes(namespace)
        )
        .filter(({ kind }) => kind && relevantKinds.includes(kind))
        .filter(({ reason }) => reason && relevantReasons.includes(reason))
        .forEach((item) => enqueMessage(item))

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
