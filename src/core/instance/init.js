import { initLifecycle } from "./lifecycle";

export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        const vm = this

        vm._isVue = true

        vm._renderProxy = vm

        vm._self = vm

        initLifecycle(vm)

    }
}
