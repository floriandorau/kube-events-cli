import { WebClient } from '@slack/web-api'

import * as cache from './cache'
import { includes } from '../util'
import { Event, Kind } from '../k8s'
import { buildMessage } from './builder'
import { getConfig, throwConfigError, SlackConfig } from '../util/config'

const web = new WebClient(
    process.env.SLACK_TOKEN || throwConfigError('SLACK_TOKEN')
)

const getDefaultChannel = ({ defaultChannel }: SlackConfig) =>
    defaultChannel ? [defaultChannel] : []

const determineEventChannel = (
    cachedEvent: cache.CachedEvent,
    config: SlackConfig
): string[] => {
    const channels = config.events
        .filter((e) => includes(e.namespaces, cachedEvent.namespace))
        .map((e) => e.channel)
    return channels.length > 0 ? channels : getDefaultChannel(config)
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
    if (cache.size() === 0) {
        console.log('no messages to send')
        return
    }

    cache.forEach(async (key, cachedEvent) => {
        if (cachedEvent.processed) {
            console.log(`${cachedEvent.name} already processed`)
            return
        }

        sendCachedEvent(key, cachedEvent)
    })
}

const sendCachedEvent = (key: string, cachedEvent: cache.CachedEvent) => {
    const { stage, slack: slackConfig } = getConfig()

    if (!slackConfig.enabled) {
        console.log('Slack disabled by config')
        return
    }

    const channels = determineEventChannel(cachedEvent, slackConfig)
    channels.forEach((channel) => {
        const { text, blocks } = buildMessage(cachedEvent, stage) ?? ''

        web.chat
            .postMessage({ text, blocks: blocks as any[], channel })
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
            .catch((err) => {
                console.log('Error while posting message', err)
            })
    })
}
