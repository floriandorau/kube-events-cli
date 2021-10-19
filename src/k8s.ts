import * as k8s from "@kubernetes/client-node";

const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

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
};

interface ListEventOptions {
  allowWatchBookmarks?: boolean;
  continue?: string;
  fieldSelector?: string;
  labelSelector?: string;
  limit?: number;
  pretty?: string;
  resourceVersion?: string;
  resourceVersionMatch?: string;
  timeoutSeconds?: number;
  watch?: boolean;
}

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
  );

export const fetchEvents = async function (
  resourceVersion?: string
): Promise<k8s.CoreV1EventList> {
  let events: k8s.CoreV1EventList = new k8s.CoreV1EventList();

  const { response, body } = await listEventForAllNamespaces({
    resourceVersion,
  });

  if (response.statusCode === 401) {
    throw Error("Unauthorized");
  } else if (response.statusCode === 200) {
    events = body;
  } else {
    console.log(`Received http status ${response.statusCode} from events api`);
  }

  return events;
};
