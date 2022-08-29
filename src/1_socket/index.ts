/* istanbul ignore file */
import { WebSocket as ws } from "ws";

export const isNodeJs = typeof window === "undefined";
export const isBrowser = typeof window !== "undefined";

export const WebSocketImpl = isNodeJs ? ws : WebSocket;

export type socketEvents = "open" | "close" | "error" | "message";
