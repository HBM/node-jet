import { InvalidArgument } from '../errors.js'
import type { FetchParams } from '../messages.js'
import { type PathRule, pathRules } from '../types.js'

type functionGenerator =
  | ((what: string) => (path: string) => boolean)
  | ((what: string[]) => (path: string) => boolean)

const contains = (what: string) => (path: string) => path.includes(what)

const containsAllOf = (whatArray: string[]) => (path: string) => {
  let i
  for (i = 0; i < whatArray.length; i = i + 1) {
    if (!path.includes(whatArray[i])) {
      return false
    }
  }
  return true
}

const containsOneOf = (whatArray: string[]) => (path: string) => {
  let i
  for (i = 0; i < whatArray.length; i = i + 1) {
    if (path.includes(whatArray[i])) {
      return true
    }
  }
  return false
}

const startsWith = (what: string) => (path: string) => path.startsWith(what)

const endsWith = (what: string) => (path: string) => path.endsWith(what)

const equals = (what: string) => (path: string) => path === what

const equalsOneOf = (whatArray: string[]) => (path: string) => {
  let i
  for (i = 0; i < whatArray.length; i = i + 1) {
    if (path === whatArray[i]) {
      return true
    }
  }
  return false
}

const negate = (gen: functionGenerator): functionGenerator =>
   
  ((args: any) => () => !gen(args)) as functionGenerator

const generators: Record<PathRule, functionGenerator> = {
  equals,
  equalsNot: negate(equals),
  contains,
  containsNot: negate(contains),
  containsAllOf,
  containsOneOf,
  startsWith,
  startsNotWith: negate(startsWith),
  endsWith,
  endsNotWith: negate(endsWith),
  equalsOneOf,
  equalsNotOneOf: negate(equalsOneOf)
}

export const createPathMatcher = (options: FetchParams) => {
  if (!options.path) {
    return () => true
  }
  const po = options.path
  Object.keys(po).forEach((key) => {
    if (!(key in generators) && key !== 'caseInsensitive') {
      throw new InvalidArgument('unknown rule ' + key)
    }
  })
  const predicates: Array<(path: string) => boolean> = []
  pathRules.forEach((name) => {
    let option = po[name]
    if (option) {
      const gen = generators[name]
      if (po.caseInsensitive) {
        if (Array.isArray(option)) {
          option = option.map((op) => op.toLowerCase())
        } else {
          option = option.toLowerCase()
        }
      }
       
      predicates.push(gen(option as any))
    }
  })

  const applyPredicates = (path: string) => {
    for (let i = 0; i < predicates.length; ++i) {
      if (!predicates[i](path)) {
        return false
      }
    }
    return true
  }

  return predicates.length === 1
    ? (path: string) => predicates[0](path)
    : (path: string) => applyPredicates(path)
}
