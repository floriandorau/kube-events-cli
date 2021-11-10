import { WebClient } from '@slack/web-api'
import { Event, Kind, CachedEvent } from './model'
import dayjs from 'dayjs'

import * as cache from './cache'

const token = process.env.SLACK_TOKEN
const channel = process.env.SLACK_CHANNEL ?? ''
const web = new WebClient(token)

const buildMessage = (queuedEvent: CachedEvent) => {
    const blocks: any[] = [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `Events related to ${queuedEvent.kind} \`${queuedEvent.name}\` in namespace \`${queuedEvent.namespace}\`:`,
            },
        },
    ]

    const eventMessages = queuedEvent.events.map(
        (e) =>
            `> \`${e.reason}\` - ${e.message} (${
                e.lastTimestamp
                    ? dayjs(e.lastTimestamp).format('YYYY-MM-DD HH:mm:ss')
                    : ''
            })  \n`
    )

    blocks.push(
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: eventMessages.join('') ?? '',
            },
        },
        {
            type: 'context',
            elements: [
                {
                    type: 'mrkdwn',
                    text: `${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
                },
            ],
        }
    )

    return blocks
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
        } as CachedEvent)

    cachedEvent.events.push(event)
    cache.set(event.name!, cachedEvent)
}

export const sendQueuedMessages = async () => {
    if (cache.size() === 0) {
        console.log('no message to send')
    } else {
        cache.forEach(async (key, cachedEvent) => {
            if (cachedEvent.processed === false) {
                const message = buildMessage(cachedEvent) ?? ''

                console.log(`Send message: [${message}]`)

                console.log(JSON.stringify(message))
                const result = await web.chat.postMessage({
                    blocks: message,
                    //mrkdwn: true,
                    channel: channel,
                })

                console.log(
                    `Successfully send message ${result.ts} in conversation ${channel}`
                )

                cache.set(key, {
                    ...cachedEvent,
                    processed: true,
                    ts: result.ts,
                })
            } else {
                console.log(`${cachedEvent.name} already processed`)
            }
        })
    }
}
