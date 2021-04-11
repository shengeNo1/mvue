(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.MVue = factory());
}(this, (function () { 'use strict';

    function initLifecycle(vm) {
        vm.$options;

        vm.$parent = parent;
        vm.$root = parent ? parent.$root : vm;

        vm.$children = [];
        vm.$refs = {};

        vm._watcher = null;
    }

    function createElement() {

    }

    function initRender(vm) {
        vm._vnode = null; // the root of the child tree
        vm.$options;
        vm._c = (a, b, c, d) => createElement();
        vm.$createElement = (a, b, c, d) => createElement();
    }

    function polyfillBind(fn, ctx) {
        function boundFn (a){
            const l = arguments.length;
            return l
                ? l > 1
                    ? fn.apply(ctx, arguments)
                    : fn.call(ctx, a)
                : fn.call(ctx)
        }

        boundFn._length = fn.length;
        return boundFn
    }

    function nativeBind (fn, ctx) {
        return fn.bind(ctx)
    }

    const bind = Function.prototype.bind ? nativeBind : polyfillBind;

    const sharedPropertyDefinition = {
        enumerable: true,
        configurable: true,
        get: () => {},
        set: () => {}
    };

    function proxy(target, sourceKey, key) {
        sharedPropertyDefinition.get = function proxyGetter () {
            return this[sourceKey][key]
        };
        sharedPropertyDefinition.set = function proxySetter (val) {
            this[sourceKey][key] = val;
        };
        Object.defineProperty(target, key, sharedPropertyDefinition);
    }

    function initState(vm) {
        vm._watchers = [];
        const opts = vm.$options;
        if (opts.methods) {
            initMethods(vm, opts.methods);
        }
        if (opts.data) {
            initData(vm);
        }
    }



    function initMethods(vm, methods) {
        vm.$options.props;
        for (const key in methods) {
            vm[key] = typeof methods[key] !=='function' ? () => {} : bind(methods[key], vm);
        }
    }

    function initData(vm) {
        let data = vm.$options.data;
        data = vm._data = typeof data === 'function' ? getData(data, vm) : data || {};

        const keys = Object.keys(data);
        vm.$options.props;
        vm.$options.methods;
        let i = keys.length;

        while (--i) {
            const key = keys[i];
            proxy(vm, `_data`, key);
        }

    }

    function getData(data, vm) {
        try{
            return data.call(vm,vm)
        }catch (e) {
            return {}
        }finally {

        }
    }

    function initMixin(Vue) {
        Vue.prototype._init = function (options) {
            const vm = this;

            vm._isVue = true;

            vm._renderProxy = vm;

            vm._self = vm;

            vm.$options = options;

            initLifecycle(vm);
            initRender(vm);
            initState(vm);
        };
    }

    function MVue(options) {
        this._init(options);
    }

    initMixin(MVue);

    return MVue;

})));
