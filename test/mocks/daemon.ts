

import * as Daemon from "../../src/3_jet/daemon"

export const DaemonMock = ()=>({...jest.createMockFromModule("../../src/3_jet/daemon") as Daemon.Daemon,
addListener:jest.fn(),
connect: jest.fn().mockReturnValue(Promise.resolve()),
respond: jest.fn(),
send: jest.fn().mockImplementation((method)=>(method==="info")?Promise.resolve({features:{fetch: "full"}}):Promise.resolve([]))
})
