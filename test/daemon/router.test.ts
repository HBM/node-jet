import {Peer} from "../../src/3_jet/peer"
import * as Server from "../../src/2_jsonrpc/server"
import Method from "../../src/3_jet/peer/method"
import State from "../../src/3_jet/peer/state"
import { ValueType } from "../../src/3_jet/types"
import { Daemon, Fetcher } from "../../src/jet"
import {  jsonRPCServer } from "../mocks/jsonrpc"
import { stringify } from "uuid"
import { AddRequest, MethodRequest, SetRequest } from "../../src/3_jet/messages"
import { Router } from "../../src/3_jet/daemon/router"
import { DaemonMock } from "../mocks/daemon"
import { fullFetcherPeer } from "../mocks/peer"
import { AddState } from "../mocks/messages"
describe("Testing Router",()=>{


    
    it("Should test basic functionality",(done)=>{
        const mockPeer = fullFetcherPeer()
        mockPeer.publish = jest.fn().mockReturnValue(Promise.resolve())
        const router = new Router(DaemonMock())
        router.handleAdd({params:{path:"foo",value:1},id:"",method:"add"},mockPeer)
        .then(()=>router.handleAdd({params:{path:"foo2",value:2},id:"",method:"add"},mockPeer))
        .then(()=>router.handleRemove("foo2"))
        .then(()=>router.handleFetch({params:{path:{"startsWith":"f"},id:"__f",sort:{}},id:"",method:"fetch"},mockPeer))
        .then(()=>router.filterRoutesByPeer(mockPeer))
        .then(()=>router.handleAdd({params:{path:"foo2",value:2},id:"",method:"add"},mockPeer))
        .then(()=>router.handleGet({params:{path:{"startsWith":"f"},sort:{},id:""},id:"",method:"get"}))
        .then(()=>router.handleChange({params:{path:"foo",value:4},id:"",method:"change"}))
        .then(()=>router.forward("foo2",{params:{path:"foo",value:4},id:"",method:"set"} as SetRequest))
        .then(()=>router.forward("foo3",{params:{path:"foo3",value:4},id:"",method:"set"} as SetRequest))
        .catch(()=>router.handleUnfetch({params:{id:"__f"},id:"",method:"unfetch"}))
        .then(()=>router.handleFetch({params:{path:{"startsWith":"f"},id:"__f",sort:{}},id:"",method:"fetch"},mockPeer))
        .then(()=>router.handleAdd({params:{path:"foo4"},id:"",method:"add"},mockPeer))
        .then(()=>router.deleteRoutes(["foo","foo2"]))
        .then(()=>router.deleteFetcher(mockPeer))
        .then(()=>done())
        
    })
     
    it("Should test invalid subscription",(done)=>{
        const mockPeer = fullFetcherPeer()
        mockPeer.publish = jest.fn().mockReturnValue(Promise.resolve())
        const router = new Router(DaemonMock())
        router.handleAdd(AddState("foo",1),mockPeer)
        .then(()=>router.handleFetch({params:{path:{"startsWith":"f"},id:"__f",sort:{}},id:"",method:"fetch"},mockPeer))
        .then(()=>{mockPeer.publish = jest.fn().mockReturnValue(Promise.reject())})
        .then(()=>router.handleChange({params:{path:"foo",value:4},id:"",method:"change"}))
        .then(()=>done())
        .catch(()=>done())
        
    })

})