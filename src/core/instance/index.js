import { initMixin } from './init'
import { lifecycleMixin } from "./lifecycle";

function MVue(options) {
    this._init(options)
}

initMixin(MVue)
lifecycleMixin(MVue)

export default MVue
