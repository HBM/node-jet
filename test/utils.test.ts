import { INTERNAL_ERROR_CODE, InvalidArgument, INVALID_PARAMS_CODE } from "../src/3_jet/errors"
import {isDefined, accessField, errorObject} from "../src/3_jet/utils"

describe("Testing utils",()=>{

   
    describe ("Should test isDefined",()=>{

        it("Should return undefined",()=>{
            expect(isDefined(null)).toBe(false)
            expect(isDefined(undefined)).toBe(false)
        })
        it("Schould return true",()=>{
            expect(isDefined(5)).toBe(true)
            expect(isDefined({})).toBe(true)
            expect(isDefined("")).toBe(true)
        })
       
    })
     
    describe ("Should access field",()=>{

        it("Should return field",()=>{
            const getField=accessField("foo.bar")
            expect(getField({foo:{bar:5}})).toBe(5)
        })
      
       
    })
    describe ("Should test error Object",()=>{

        it("Should return string error Object",()=>{
            const dummy = errorObject("foo")
            expect(dummy.code).toBe(INTERNAL_ERROR_CODE)
            expect(dummy.message).toBe("Internal error")
        })
        it("Should return invalid argument Object",()=>{
            const dummy = errorObject(new InvalidArgument("foo"))
            expect(dummy.code).toBe(INVALID_PARAMS_CODE)
            expect(dummy.message).toBe("Invalid params")
        })
        it("Should return stack Object",()=>{
            const dummy = errorObject({ message : "foo",
                stack: {},
                lineNumber: 5,
                fileName : "bar"})
            expect(dummy.code).toBe(INTERNAL_ERROR_CODE)
            expect(dummy.message).toBe("Internal error")
        })
        it("Should return error Object",()=>{
            const dummy = errorObject({code:INVALID_PARAMS_CODE,message:"foo"})
            expect(dummy.code).toBe(INVALID_PARAMS_CODE)
            expect(dummy.message).toBe("foo")
        })
      
       
    })
        
    
   
})