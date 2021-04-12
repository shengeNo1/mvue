import Dep from "./Dep";

export default class Observer {
    constructor(data) {
        this.list = []
        this.data = data
        if (!data || typeof data !== 'object') {
            return
        }else {
            Object.keys(data).forEach((key) => {
                this.defineReactive(this.data, key, data[key])
            })
        }
    }

    defineReactive(data, key, value){
        new Observer(value)
        let dep = new Dep()
        this.list.push(dep)
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            set: function (newValue) {
                new Observer(newValue)
                if (newValue === value) {
                    return
                }else {
                    value = newValue
                    dep.notify()
                }
            },
            get: function () {
                Dep.target && dep.addSub(Dep.target)
                return value
            }
        })
    }


}