
import {
    bind
} from '../utils/index'

const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: () => {},
    set: () => {}
}

export function proxy(target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter () {
        return this[sourceKey][key]
    }
    sharedPropertyDefinition.set = function proxySetter (val) {
        this[sourceKey][key] = val
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
}

export function initState(vm) {
    vm._watchers = []
    const opts = vm.$options
    if (opts.methods) {
        initMethods(vm, opts.methods)
    }
    if (opts.data) {
        initData(vm)
    }
}



function initMethods(vm, methods) {
    const props = vm.$options.props
    for (const key in methods) {
        vm[key] = typeof methods[key] !=='function' ? () => {} : bind(methods[key], vm)
    }
}

function initData(vm) {
    let data = vm.$options.data
    data = vm._data = typeof data === 'function' ? getData(data, vm) : data || {}

    const keys = Object.keys(data)
    const props = vm.$options.props
    const methods = vm.$options.methods
    let i = keys.length

    while (--i) {
        const key = keys[i]
        proxy(vm, `_data`, key)
    }

}

export function getData(data, vm) {
    try{
        return data.call(vm,vm)
    }catch (e) {
        return {}
    }finally {

    }
}

