import * as error from "../src/3_jet/errors"
describe("Testing errors",()=>{
    it("DaemonError",()=>{
        expect(new error.DaemonError("Internal Daemon Error").toString()).toEqual("jet.DaemonError: Internal Daemon Error")
    })
    it("PeerError",()=>{
        expect(new error.PeerError("Internal Peer Error").toString()).toEqual("jet.PeerError: Internal Peer Error")
    })
    it("PeerTimeoutError",()=>{
        expect(new error.PeerTimeout().toString()).toEqual("jet.PeerTimeout: The peer processing the request did not respond within the specified timeout"
        )
    })
    it("BaseError",()=>{
        expect(new error.BaseError("BaseError","foo").toString()).toEqual("jet.BaseError: foo")
    })
    it("ConnectionInUse",()=>{
        expect(new error.ConnectionInUse("foo").toString()).toEqual("jet.ConnectionInUse: foo")
    })
    it("ConnectionClosed",()=>{
        expect(new error.ConnectionClosed("Connection closed").toString()).toEqual("jet.ConnectionClosed: Connection closed")
    })
    it("InvalidArgument",()=>{
        expect(new error.InvalidArgument(undefined).toString()).toEqual("jet.InvalidArgument: The provided argument(s) have been refused by the State/Method")
    })
    
   it("Creating typed errors",()=>{
    var err;
    err= error.createTypedError({code: error.INVALID_PARAMS_CODE,data:{pathNotExists:"foo"}})
    expect(err.toString()).toEqual("jet.NotFound: No State/Method matching the specified path")
    err= error.createTypedError({code: error.INVALID_PARAMS_CODE,data:{pathAlreadyExists:"foo"}})
    expect(err.toString()).toEqual("jet.Occupied: A State/Method with the same path has already been added")
    err= error.createTypedError({code: error.INVALID_PARAMS_CODE,data:{fetchOnly:"foo"}})
    expect(err.toString()).toEqual("jet.FetchOnly: The State cannot be modified")
    err= error.createTypedError({code: error.INVALID_PARAMS_CODE,data:{invalidUser:"foo"}})
    expect(err.toString()).toEqual("jet.InvalidUser: The specified user does not exist")
    err= error.createTypedError({code: error.INVALID_PARAMS_CODE,data:{invalidPassword:"foo"}})
    expect(err.toString()).toEqual("jet.InvalidPassword: The specified password is wrong")
    err= error.createTypedError({code: error.INVALID_PARAMS_CODE,data:{invalidArgument:{message:"foo"}}})
    expect(err.toString()).toEqual("jet.InvalidArgument: foo")
    err= error.createTypedError({code: error.INVALID_PARAMS_CODE,data:{noAccess:"foo"}})
    expect(err.toString()).toEqual("jet.Unauthorized: The request is not authorized for the user")
    err= error.createTypedError({code: error.RESPONSE_TIMEOUT_CODE,data:{noAccess:"foo"}})
    expect(err.toString()).toEqual("jet.PeerTimeout: The peer processing the request did not respond within the specified timeout")
    err= error.createTypedError({code: error.INTERNAL_ERROR_CODE,data:"foo"})
    expect(err.toString()).toEqual("jet.PeerError: foo")
   })

   it("Functions",()=>{
    let msg;
    msg = error.methodNotFound("Method not found")
    expect(msg.message).toBe("Method not found")
    msg = error.invalidRequest("invalid request")
    expect(msg.message).toBe("Invalid Request")
    msg = error.responseTimeout({})
    expect(msg.message).toBe("Response Timeout")
   })
        
})