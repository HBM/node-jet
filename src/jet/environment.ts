import { WebSocket as ws } from "ws";
import * as net from 'net'
export const WebSocketImpl = typeof window === 'undefined'? ws : WebSocket
export const netImpl =  net || { Socket: function () {} }