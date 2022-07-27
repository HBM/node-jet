import {Peer} from "../../src/3_jet/peer"
import * as JsonRPC from "../../src/2_jsonrpc/index"
import Method from "../../src/3_jet/peer/method"
import State from "../../src/3_jet/peer/state"
import { ValueType } from "../../src/3_jet/types"
import { Fetcher } from "../../src/jet"
describe("Testing Fetcher",()=>{

    it("Should create Fetcher",()=>{
        const fetch = new Fetcher()
        .path("equals","test")
        .range(4,6)
        .descending()
        .ascending()
        .sortByPath(true)
        .sortByValue(true)
        .sortByKey("value","number")
        .differential()
        
    })
   
    
    
     
})