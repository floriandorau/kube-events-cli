import dayjs from 'dayjs'
import { Event } from '../k8s'
import { formatDateTime } from '../util/datetime'
import { CachedEvent } from './cache'

export type Message = {
    text: string
    blocks: object[]
}

const buildingBlock = {
    section: (text: string) => ({
        type: 'section',
        text: { type: 'mrkdwn', text },
    }),

    context: (text: string) => ({
        type: 'context',
        elements: [{ type: 'mrkdwn', text }],
    }),
}

export const buildMessage = (
    cachedEvent: CachedEvent,
    stage: string
): Message => {
    const text = `Event(s) occured on ${cachedEvent.kind.toLowerCase()} \`${
        cachedEvent.name
    }\``

    const eventMessages = cachedEvent.events.map(
        ({ message }) => `>*${message}*`
    )

    const blocks = [
        buildingBlock.section(text),
        buildingBlock.section(eventMessages.join('\n') ?? ''),
        buildingBlock.context(
            `${formatDateTime(new Date())} | namespace: \`${
                cachedEvent.namespace
            }\` | stage: \`${stage}\``
        ),
    ]

    return { text, blocks }
}
