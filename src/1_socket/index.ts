/* istanbul ignore file */

import { EventEmitter as ee } from 'events'
export const isNodeJs = typeof window === 'undefined'
export const isBrowser = typeof window !== 'undefined'

export const WebSocketImpl = WebSocket

export const EventEmitter = ee
