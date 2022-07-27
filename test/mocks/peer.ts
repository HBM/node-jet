import * as JsonRPC from "../../src/2_jsonrpc"
import * as server from "../../src/2_jsonrpc/server"
import { Logger } from "../../src/3_jet/log";

export const fullFetcherPeer = ()=>({...jest.createMockFromModule("../../src/2_jsonrpc") as JsonRPC.JsonRPC,
addListener:jest.fn(),
connect: jest.fn().mockReturnValue(Promise.resolve()),
respond: jest.fn(),
send: jest.fn().mockImplementation((method)=>(method==="info")?Promise.resolve({features:{fetch: "full"}}):Promise.resolve([])),
close: jest.fn(),
batch: jest.fn()
})

export const simpleFecherPeer = (): any =>{
    const peer = {
        ...jest.createMockFromModule("../../src/2_jsonrpc") as JsonRPC.JsonRPC,
        connect: ()=>Promise.resolve(),
        callbacks: {},
        respond: jest.fn(),
        send: jest.fn().mockImplementation((method)=>(method==="info")?Promise.resolve({features:{fetch: "simple"}}):Promise.resolve([])),
    }
    peer.addListener= (evt:string,cb:Function)=>{
        if(!(evt in peer.callbacks))
            peer.callbacks[evt]=[]
        peer.callbacks[evt].push(cb)
        return peer
    }
    return peer
}



