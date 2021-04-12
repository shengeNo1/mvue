let uid = 0
import { remove } from "../../shared/utils";

export default class Dep{

    constructor() {
        this.id = ++ uid;
        this.subs = []
    }

    addSub(sub) {
        this.subs.push(sub)
    }

    removeSub(sub) {
        remove(this.subs, sub)
    }

    notify() {
        this.subs.forEach(sub => {
            sub.update()
        })
    }
}

