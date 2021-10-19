import { WebClient } from "@slack/web-api";
import { Event, Kind } from "./model/Event";
import dayjs from "dayjs";

const token = process.env.SLACK_TOKEN;
const channel = process.env.SLACK_CHANNEL ?? "";
const web = new WebClient(token);

type QueuedEvent = {
  name: string;
  kind: Kind;
  namespace: string;
  events: Event[];
  processed: boolean;
  ts?: string;
};

const cache = new Map<string, QueuedEvent>();

const buildMessage = (queuedEvent: QueuedEvent) => {
  const blocks: any[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Events related to ${queuedEvent.kind} \`${queuedEvent.name}\` in namespace \`${queuedEvent.namespace}\`:`,
      },
    },
  ];

  const eventMessages = queuedEvent.events.map(
    (e) =>
      `> \`${e.reason}\` - ${e.message} (${
        e.lastTimestamp
          ? dayjs(e.lastTimestamp).format("YYYY-MM-DD HH:mm:ss")
          : ""
      })  \n`
  );
  console.log;
  blocks.push(
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: eventMessages.join("") ?? "",
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `${dayjs().format("YYYY-MM-DD HH:mm:ss")}`,
        },
      ],
    }
  );

  return blocks;
};

export const enqueMessage = (event: Event) => {
  console.debug("Eneque message", event);

  const queuedEvent: QueuedEvent = cache.get(event.name!!) ?? {
    name: event.name ?? "",
    kind: event.kind ?? Kind.Unknown,
    namespace: event.namespace ?? "",
    events: [],
    processed: false,
  };

  queuedEvent.events.push(event);
  cache.set(event.name!!, queuedEvent);
};

export const sendQueuedMessages = async () => {
  if (cache.size === 0) {
    console.log("no message to send");
  } else {
    cache.forEach(async (queuedEvent, key) => {
      if (queuedEvent.processed === false) {
        const message = buildMessage(queuedEvent) ?? "";

        console.log(`Send message: [${message}]`);

        console.log(JSON.stringify(message));
        const result = await web.chat.postMessage({
          blocks: message,
          //mrkdwn: true,
          channel: channel,
        });

        console.log(
          `Successfully send message ${result.ts} in conversation ${channel}`
        );

        cache.set(key, { ...queuedEvent, processed: true, ts: result.ts });
      }
    });
  }
};
