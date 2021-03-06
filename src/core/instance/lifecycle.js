
export function initLifecycle(vm) {
    const options = vm.$options

    vm.$parent = parent
    vm.$root = parent ? parent.$root : vm

    vm.$children = []
    vm.$refs = {}
    vm.$data = options.data

    vm._watcher = null
}


export function lifecycleMixin(Vue) {

}