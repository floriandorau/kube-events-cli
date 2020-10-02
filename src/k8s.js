const k8s = require('@kubernetes/client-node');

const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

const fetchEvents = async function () {
    let events = [];

    const { response, body } = await k8sApi.listEventForAllNamespaces();

    if (response.statusCode === 200) {
        events = body;
    } else {
        logger.error(`Received http status ${response.statusCode} from events api`);
    }

    return events;
};

module.exports = { fetchEvents };