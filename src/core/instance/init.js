import { initLifecycle } from "./lifecycle";
import { initRender } from "./render";
import { initState } from "./state";

export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        const vm = this

        vm._isVue = true

        vm._renderProxy = vm

        vm._self = vm

        vm.$options = options

        initLifecycle(vm)
        initRender(vm)
        initState(vm)

        if (vm.$options.el) {
            vm._compiler = vm.$mount(vm.$options.el, vm)
        }
    }
}