import {
  INTERNAL_ERROR_CODE,
  InvalidArgument,
  INVALID_PARAMS_CODE,
} from "../src/3_jet/errors";
import { errorObject, getValue } from "../src/3_jet/utils";

describe("Testing utils", () => {
  describe("Should test getField", () => {
    it("Should return string error Object", () => {
      expect(getValue(5, "")).toBe(5);
      expect(getValue({ id: 5 }, "id")).toBe(5);
      expect(getValue({ id: 5 }, "x")).toBe(undefined);
    });
  });
  describe("Should test error Object", () => {
    it("Should return string error Object", () => {
      const dummy = errorObject("foo");
      expect(dummy.code).toBe(INTERNAL_ERROR_CODE);
      expect(dummy.message).toBe("Internal error");
    });
    it("Should return invalid argument Object", () => {
      const dummy = errorObject(new InvalidArgument("foo"));
      expect(dummy.code).toBe(INVALID_PARAMS_CODE);
      expect(dummy.message).toBe("Invalid params");
    });
    it("Should return stack Object", () => {
      const dummy = errorObject({
        message: "foo",
        stack: {},
        lineNumber: 5,
        fileName: "bar",
      });
      expect(dummy.code).toBe(INTERNAL_ERROR_CODE);
      expect(dummy.message).toBe("Internal error");
    });
    it("Should return error Object", () => {
      const dummy = errorObject({ code: INVALID_PARAMS_CODE, message: "foo" });
      expect(dummy.code).toBe(INVALID_PARAMS_CODE);
      expect(dummy.message).toBe("foo");
    });
  });
});
