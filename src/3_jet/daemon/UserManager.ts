import { NotAuthorized, invalidRequest } from '../errors'
import { access } from './route'

export class UserManager {
  users: Record<string, string>
  groups: Record<string, string[]>
  enabled: boolean

  constructor(adminUser?: string, password?: string) {
    if (adminUser && password) {
      this.enabled = true
      this.users = { [adminUser]: password }
      this.groups = { admin: [adminUser], all: [adminUser] }
    } else {
      this.users = {}
      this.groups = {}
      this.enabled = false
    }
  }

  addUser = (
    requestUser: string,
    newUser: string,
    password: string,
    groups: string[]
  ) => {
    if (!this.groups['admin'].includes(requestUser)) {
      throw new NotAuthorized('Only admin users can create User')
    }
    if (Object.keys(this.users).includes(newUser)) {
      throw new NotAuthorized('User already exists')
    }
    this.users[newUser] = password

    groups.forEach((group) => {
      if (!(group in Object.keys(this.groups))) {
        this.groups[group] = []
      }
      this.groups[group].push(newUser)
    })

    this.groups['all'].push(newUser)
  }

  login = (user: string, password: string) =>
    Object.keys(this.users).includes(user) && password === this.users[user]

  isAllowed = (method: 'get' | 'set', user: string, access?: access) => {
    if (!access) return true
    const group = method === 'get' ? access.read : access.write

    if (group && !(group in this.groups)) {
      throw new invalidRequest(
        'Invalid group',
        'Requested group does not exist'
      )
    }
    return (
      group === '' ||
      typeof group === 'undefined' ||
      this.groups[group].includes(user)
    )
  }
}
