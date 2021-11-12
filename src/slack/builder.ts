import { CachedEvent } from './cache'
import { formatDateTime, fromNow } from '../util/datetime'

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
        ({ message, lastTimestamp }) =>
            `>*${message}* (${fromNow(lastTimestamp)})`
    )

    const blocks = [
        buildingBlock.section(text),
        buildingBlock.context(
            `${formatDateTime(new Date())} | stage: *${stage}* | namespace: *${
                cachedEvent.namespace
            }*`
        ),
        buildingBlock.section(eventMessages.join('\n') ?? ''),
    ]

    return { text, blocks }
}
