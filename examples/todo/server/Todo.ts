
export class Todo {
    title: string;
    id: string
    completed = false
    constructor(title:string){
        this.title = this.id = title

    }

    merge = (toMerge:Todo)=>{
        if(toMerge.completed)
        this.completed = true
        if (toMerge.title) {
            this.title = toMerge.title
          }
    }
}