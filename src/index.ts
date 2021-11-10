import { CoreV1Event, CoreV1EventList } from '@kubernetes/client-node'
import * as k8s from './k8s'
import { enqueMessage, sendQueuedMessages } from './slack'
import { Event, Kind, Reason } from './model/Event'

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

const print = (events: CoreV1EventList) => {
    events.items
        .map((item) => flatten(item))
        .filter(
            (item) => item.kind && [Kind.Pod, Kind.Node].includes(item.kind)
        )
        .filter(
            (item) =>
                item.reason &&
                [Reason.Started, Reason.Failed, Reason.SystemOOM].includes(
                    item.reason
                )
        )
        .forEach((item) => enqueMessage(item))

    sendQueuedMessages()
}

export const fetchEvents = async () => {
    const resourceVersion: string | undefined = undefined
    const events: CoreV1EventList = await k8s.fetchEvents(resourceVersion)
    print(events)

    //   const timeout = setInterval(async () => {
    //     events = await k8s.fetchEvents(resourceVersion);
    //     print(events);
    //   }, 5000);

    //   setTimeout(() => {
    //     console.log("clear timeout");
    //     clearInterval(timeout);
    //   }, 6000);
}
