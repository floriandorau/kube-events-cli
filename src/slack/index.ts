import { WebClient } from '@slack/web-api'

import { Event, Kind } from '../k8s'
import * as cache from './cache'
import { buildMessage } from './builder'
import { getConfig, throwConfigError, SlackConfig } from '../util/config'

const web = new WebClient(
    process.env.SLACK_TOKEN || throwConfigError('SLACK_TOKEN')
)

const determineEventChannel = (
    cachedEvent: cache.CachedEvent,
    { defaultChannel, events }: SlackConfig
) => {
    const slackEvent = events.find((e) => e.namespace === cachedEvent.namespace)
    return slackEvent?.channel ?? defaultChannel
}

export const enqueMessage = (event: Event) => {
    const cachedEvent =
        cache.get(event.name!) ??
        ({
            name: event.name ?? '',
            kind: event.kind ?? Kind.Unknown,
            namespace: event.namespace,
            events: [],
            processed: false,
        } as cache.CachedEvent)

    cachedEvent.events.push(event)
    cache.set(event.name!, cachedEvent)
}

export const sendQueuedMessages = async () => {
    const { stage, slack: slackConfig } = getConfig()

    if (!slackConfig.enabled) {
        console.log('Slack disabled by config')
        return
    }

    if (cache.size() === 0) {
        console.log('no messages to send')
        return
    }

    cache.forEach(async (key, cachedEvent) => {
        if (cachedEvent.processed === false) {
            const channel = determineEventChannel(cachedEvent, slackConfig)
            if (channel) {
                const message = buildMessage(cachedEvent, stage) ?? ''

                web.chat
                    .postMessage({ blocks: message, channel })
                    .then((result) => {
                        console.log(
                            `Successfully send message ${result.ts} in conversation ${channel}`
                        )

                        cache.set(key, {
                            ...cachedEvent,
                            processed: true,
                            ts: result.ts,
                        })
                    })
            }
        } else {
            console.log(`${cachedEvent.name} already processed`)
        }
    })
}
