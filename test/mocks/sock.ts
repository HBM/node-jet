import * as socket from "../../src/1_socket/socket";

export const sockMock = (): any => {
  const mock: any = {
    ...(jest.createMockFromModule("../../src/1_socket") as socket.Socket),
    connect: () => Promise.resolve(),
    callbacks: {},
    respond: jest.fn(),
    send: jest
      .fn()
      .mockImplementation((method) =>
        method === "info"
          ? Promise.resolve({ features: { fetch: "simple" } })
          : Promise.resolve([])
      ),
    addEventListener: jest.fn(),
    close: jest.fn(),
  };

  mock.addEventListener = (evt, cb) => {
    if (!(evt in mock.callbacks)) mock.callbacks[evt] = [];
    mock.callbacks[evt].push(cb);
    return mock;
  };
  mock.emit = (evt, args) => {
    if (!(evt in mock.callbacks)) return;
    mock.callbacks[evt].forEach((cb) => cb(args));
  };

  return mock;
};
