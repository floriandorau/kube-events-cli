import * as k8s from '@kubernetes/client-node'
import { Event, Kind, Reason } from './types'

interface ListEventOptions {
    allowWatchBookmarks?: boolean
    continue?: string
    fieldSelector?: string
    labelSelector?: string
    limit?: number
    pretty?: string
    resourceVersion?: string
    resourceVersionMatch?: string
    timeoutSeconds?: number
    watch?: boolean
}

const defaultEventOptions: ListEventOptions = {
    allowWatchBookmarks: undefined,
    continue: undefined,
    fieldSelector: undefined,
    labelSelector: undefined,
    limit: undefined,
    pretty: undefined,
    resourceVersion: undefined,
    resourceVersionMatch: undefined,
    timeoutSeconds: undefined,
    watch: false,
}

const kc = new k8s.KubeConfig()
kc.loadFromDefault()
const k8sApi = kc.makeApiClient(k8s.CoreV1Api)

const listEventForAllNamespaces = (
    options: ListEventOptions = defaultEventOptions
) =>
    k8sApi.listEventForAllNamespaces(
        options.allowWatchBookmarks,
        options.continue,
        options.fieldSelector,
        options.labelSelector,
        options.limit,
        options.pretty,
        options.resourceVersion,
        options.resourceVersionMatch,
        options.timeoutSeconds,
        options.watch
    )

const convert = (event: k8s.CoreV1Event): Event => {
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

export const fetchEvents = async (): Promise<Event[]> => {
    console.debug('Fetch events for all namespaces')

    let events: k8s.CoreV1EventList = new k8s.CoreV1EventList()

    const { response, body } = await listEventForAllNamespaces()
    if (response.statusCode === 401) {
        throw Error('Unauthorized')
    } else if (response.statusCode === 200) {
        events = body
    } else {
        console.log(
            `Received http status ${response.statusCode} from events api`
        )
    }

    return events.items.map(convert)
}
