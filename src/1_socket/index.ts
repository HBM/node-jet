/* istanbul ignore file */
import { WebSocket as ws } from 'ws'
import { EventEmitter as ee } from 'events'
export const isNodeJs = typeof window === 'undefined'
export const isBrowser = typeof window !== 'undefined'

export const WebSocketImpl = isNodeJs ? ws : WebSocket

export const EventEmitter = ee
