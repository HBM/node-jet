import { NotAuthorized } from "../errors"
import { access } from "./route"

export class Authenticator {

    users: Record<string,string>
    groups: Record<string,string[]>
    enabled: boolean

    constructor(adminUser?:string,password?:string){
        if(adminUser && password){
            this.enabled=true
            this.users = {[adminUser]:password}
            this.groups = {"admin": [adminUser]}
        }else {
            this.users = {}
            this.groups = {}
            this.enabled = false
        }
    }

    addUser = (requestUser: string, newUser: string, password:string, groups: string[])=>{
        if(!(requestUser in this.groups["admin"])){
            throw new NotAuthorized("Only admin users can create User")
        }
        if(newUser in Object.keys(this.users)){
            throw new NotAuthorized("User already exists")
        }
        this.users[newUser] = password

        groups.forEach((group)=>{
            if(!(group in Object.keys(this.groups))){
                this.groups[group]= []
            }
            this.groups[group].push(newUser)
        })
    }

    login = (user:string,password:string) => user in this.users && password === this.users[user]

    isAllowed = (method:"get"|"set",user:string,access?:access)=>{
        console.log(method,user,access)
        if(!access)
            return true
        
        return user in this.groups[method==="get"?access.readgroup:access.writegroup]
     
    }
    

}