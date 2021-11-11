import dayjs from 'dayjs'
import { CachedEvent } from './cache'

export const buildMessage = (cachedEvent: CachedEvent, stage: string) => {
    const blocks: any[] = [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `Events related to \`${cachedEvent.name}\` on ${stage}:`,
            },
        },
    ]

    const eventMessages = cachedEvent.events.map(
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
                    text: `${dayjs().format(
                        'YYYY-MM-DD HH:mm:ss'
                    )} | namespace: \`${cachedEvent.namespace}\` | kind: \`${
                        cachedEvent.kind
                    }\``,
                },
            ],
        }
    )

    return blocks
}
