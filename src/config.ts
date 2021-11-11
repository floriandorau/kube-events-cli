import { readFileSync } from 'fs'
import YAML from 'yaml'

export type SlackConfig = {
    enabled: boolean
    defaultChannel?: string
    events: SlackEvent[]
}
export type SlackEvent = { namespace: string; channel: string }

export type Config = {
    stage: string
    debug?: boolean
    events: {
        interval: number
    }
    slack: SlackConfig
}

const defaultConfig = {
    stage: 'local',
    debug: process.env.SLACK_TOKEN?.toLowerCase() === 'true',
    events: {
        interval: 10000,
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
    return config
}

export const getConfig = (): Config => config

export const throwConfigError = function (name: string) {
    throw Error(`Env variable '${name}' not defined`)
}
