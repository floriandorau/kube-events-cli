import { readFileSync } from 'fs'
import YAML from 'yaml'
import { Kind, Reason } from '../k8s'

export type K8sEventsConfig = {
    namespaces: string[]
    reasons: Reason[]
    kinds: Kind[]
}

export type SlackConfig = {
    enabled: boolean
    defaultChannel?: string
    events: SlackEvent[]
}

export type SlackEvent = { namespace: string; channel: string }

export type Config = {
    stage: string
    debug?: boolean
    fetchInterval: number
    processPastEvents: boolean
    k8sEvents: K8sEventsConfig
    slack: SlackConfig
}

const defaultConfig = {
    stage: 'local',
    debug: process.env.SLACK_TOKEN?.toLowerCase() === 'true',
    fetchInterval: 10000,
    processPastEvents: false,
    k8sEvents: {
        namespaces: [],
        reasons: [],
        kinds: [],
    },
    slack: {
        enabled: false,
        defaultChannel: undefined,
        events: [],
    },
}

let config: Config = defaultConfig

const assignConfig = (config: object) => Object.assign(defaultConfig, config)

export const readConfig = (path: string): Config => {
    const file = readFileSync(path, 'utf8')
    config = assignConfig(YAML.parse(file))
    console.log('-- Run with config --')
    console.dir(config)
    console.log('---------------------')
    return config
}

export const getConfig = (): Config => config

export const throwConfigError = function (name: string) {
    throw Error(`Env variable '${name}' not defined`)
}
