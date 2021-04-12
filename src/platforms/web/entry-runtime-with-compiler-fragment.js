
import MVue from './runtime/index'
import Compile from "./compiler/fragment";

MVue.prototype.$mount = function (el, vm) {
    return new Compile(el, vm)
}

export default MVue
