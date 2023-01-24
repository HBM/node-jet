// import { Notification } from "./fetcher";
import { InvalidArgument } from '../errors'
import { FetchParams } from '../messages'
import { PathRule, pathRules } from '../types'

type functionGenerator =
  | ((what: string) => (path: string) => boolean)
  | ((what: string[]) => (path: string) => boolean)

const contains = (what: string) => (path: string) => path.indexOf(what) !== -1

const containsAllOf = (whatArray: string[]) => {
  return (path: string) => {
    let i
    for (i = 0; i < whatArray.length; i = i + 1) {
      if (path.indexOf(whatArray[i]) === -1) {
        return false
      }
    }
    return true
  }
}

const containsOneOf = (whatArray: string[]) => {
  return (path: string) => {
    let i
    for (i = 0; i < whatArray.length; i = i + 1) {
      if (path.indexOf(whatArray[i]) !== -1) {
        return true
      }
    }
    return false
  }
}

const startsWith = (what: string) => (path: string) =>
  path.substring(0, what.length) === what

const endsWith = (what: string) => (path: string) =>
  path.lastIndexOf(what) === path.length - what.length

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((args: any) => () => !gen(args)) as functionGenerator

const generators: Record<PathRule, functionGenerator> = {
  equals: equals,
  equalsNot: negate(equals),
  contains: contains,
  containsNot: negate(contains),
  containsAllOf: containsAllOf,
  containsOneOf: containsOneOf,
  startsWith: startsWith,
  startsNotWith: negate(startsWith),
  endsWith: endsWith,
  endsNotWith: negate(endsWith),
  equalsOneOf: equalsOneOf,
  equalsNotOneOf: negate(equalsOneOf)
}

export const createPathMatcher = (options: FetchParams) => {
  if (!options.path) {
    return () => true
  }
  const po = options.path
  Object.keys(po).forEach((key) => {
    if (!(key in generators) && key !== 'caseInsensitive')
      throw new InvalidArgument('unknown rule ' + key)
  })
  const predicates: ((path: string) => boolean)[] = []
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
