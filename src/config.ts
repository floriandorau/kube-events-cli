import { readFileSync } from 'fs'
import YAML from 'yaml'

const throwConfigError = function (name: string) {
    throw Error(`Env variable '${name}' not defined`)
}

type Config = {
    debug: boolean
    events: {
        interval: number
    }
    slack: {
        enabled: boolean
        defaultChannel: string
        events: [{ namespace: string; channel: string }]
    }
}

const defaultConfig = {
    debug: process.env.DEBUG || false,
    events: {
        interval: 10000,
    },
    slack: {
        senderEnabled: false,
        apiToken: process.env.SLACK_TOKEN || throwConfigError('SLACK_TOKEN'),
    },
}

let config: Config | undefined = undefined

export const readConfig = (path: string): Config => {
    const file = readFileSync(path, 'utf8')
    config = assignConfig(YAML.parse(file))
    return config!
}

const assignConfig = (config: any) => Object.assign(defaultConfig, config)

export const getConfig = (): Config => {
    if (!config) throw Error('config not initialized. Use readConfig first')
    return config!
}
