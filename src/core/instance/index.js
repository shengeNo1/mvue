import { initMixin } from './init'

function MVue(options) {
    this._init(options)
}

initMixin(MVue)

export default MVue
