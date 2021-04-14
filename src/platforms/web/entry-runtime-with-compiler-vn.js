
import MVue from './runtime/index'

import { compileToFunctions } from './compiler/index'

MVue.prototype.$mount = function (el, vm) {
    el = document.querySelector(el)
    let template = null
    const options = this.$options

    if (!options.render) {
        template = getOuterHTML(el)
    }

    const { render, staticRenderFns } = compileToFunctions(template)


}

function getOuterHTML(el) {
    if (el.outerHTML) {
        return el.outerHTML
    }else {
        const container = document.createElement('div')
        container.appendChild(el.cloneNode(true))
        return container.innerHTML
    }
}

export default MVue