const jet = require('../lib')
const rpcJson = require('../lib/2_jsonrpc')
const log = require('../lib/3_jet/log')
const _ = require('lodash')
const addRequest = (path, value = 4) => ({
  value,
  path,
  method: 'add'
})
const removeRequest = (path, value = 4) => ({
  value,
  path,
  method: 'remove'
})
const fetchRequest = (path, value = 4) => ({
  value,
  path,
  method: 'fetch'
})
//{log:{logName:"daemon",logCallbacks:[console.log],logLevel: 6}}
const daemon = new jet.Daemon()
daemon.listen()

const testSegments = {
  state: {
    missingPath: [{ req: {value:4,method: 'add'}, throws: {
      "code":-32600,
      "message":"Message could not be parsed",
      "data":{
        "name":"jet.ParseError",
        "url":"https://github.com/lipp/node-jet/blob/master/doc/peer.markdown#jetparseerror",
        "details":JSON.stringify({id:"1",method:"add","params":{value:4,method: 'add'}})
    },
    "name":"jet.ParseError"}}],
    add: [{ req: addRequest('foo'), res: {} }],
    remove: [{ req: removeRequest('foo'), res: {} }],
    occupied: [{ req: addRequest('foo'), res: {} },{ req: addRequest('foo'), throws: {
      "code":-32602,
      "message":"A State/Method with the same path has already been added",
      "data":{
        "name":"jet.Occupied",
        "url":"https://github.com/lipp/node-jet/blob/master/doc/peer.markdown#jetoccupied",
        "details":"foo"
      },
      "name":"jet.Occupied"} }],
      notfound: [{ req: removeRequest('foo'), res: {} },{ req: removeRequest('foo'), throws: {
        "code":-32602,
        "message":"No State/Method matching the specified path",
        "data":{
          "name":"jet.NotFound",
          "url":"https://github.com/lipp/node-jet/blob/master/doc/peer.markdown#jetnotfound",
          "details":"foo"
        },
        "name":"jet.NotFound"
      } }],
  }
}
//{logName:"peer",logCallbacks:[console.log],logLevel: 6}
const logger = new log.Logger()
const rpc = new rpcJson.JsonRPC(logger)
console.log("started test")

runTestCase = async(req)=>{
  await rpc.sendRequest(req.req.method,{...req.req}).then((res)=>{
    if(req.throws)throw new Error(`Expected thrown:${JSON.stringify(req.throws)} but resolved`)
    if(!_.isEqual(res,req.res)){
      throw new Error(`\n Expected:${JSON.stringify(res)} \n Received ${JSON.stringify(req.res)} `)
     }
  }).catch((ex)=>{
    if(!req.throws)throw new Error(`Unexpected thrown:${JSON.stringify(ex)}`)
    if(!_.isEqual(ex,req.throws)){
      throw new Error(`\n Expected:${JSON.stringify(ex)} \n Received ${JSON.stringify(req.throws)} `)
     }
  })
}
rpc.connect().then(() => {
  Object.keys(testSegments).forEach(async (key) => {
    console.log('Segment:', key)
    const segment = testSegments[key]
    const testCases = Object.keys(segment)
    for (let ii = 0; ii < Object.keys(segment).length; ii++) {
      try {
        const testCase = Object.keys(segment[testCases[ii]])
        for (let i = 0; i < testCase.length; i++) {
          await runTestCase(segment[testCases[ii]][i]) 
        }
        console.log(`\t${testCases[ii]} succeeded`)
      }catch (ex){
        console.log(`\t${testCases[ii]} Failed \n ${ex}`)
      }

    }
  })
})
