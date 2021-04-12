import Dep from "./Dep";
import { getVal } from '../utils/index'

let uid = 0

export default class Watcher{

    constructor(vm, exp, cb) {
        this.vm = vm;
        this.exp = exp;
        this.cb = cb;
        vm._watchers.push(this)
        this.id = ++uid
        this.value = this.get()
    }

    get() {
        Dep.target = this
        let oldValue = getVal(this.exp, this.vm.$data)
        Dep.target = null;
        return oldValue;
    }

    update() {
        let newValue = getVal(this.exp, this.vm.$data)
        if (newValue !== this.value) {
            this.cb.call(this.vm, newValue, this.value)
        }
    }
}
