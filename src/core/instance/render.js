import { createElement } from "../vdom/create-element";


export function initRender(vm) {
    vm._vnode = null // the root of the child tree
    const options = vm.$options
    vm._c = (a, b, c, d) => createElement(vm, a, b, c, d)
    vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d)
}