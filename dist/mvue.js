(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.MVue = factory());
}(this, (function () { 'use strict';

    function initLifecycle(vm) {
        const options = vm.$options;

        vm.$parent = parent;
        vm.$root = parent ? parent.$root : vm;

        vm.$children = [];
        vm.$refs = {};
        vm.$data = options.data;

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

    Object.freeze({});

    function polyfillBind(fn, ctx) {
        function boundFn(a) {
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

    function nativeBind(fn, ctx) {
        return fn.bind(ctx)
    }

    function remove(arr, item) {
        if (arr.length) {
            const index = arr.indexOf(item);
            if (index > -1) {
                return arr.splice(index, 1)
            }
        }
    }

    const bind = Function.prototype.bind ? nativeBind : polyfillBind;

    let uid = 0;

    class Dep{

        constructor() {
            this.id = ++ uid;
            this.subs = [];
        }

        addSub(sub) {
            this.subs.push(sub);
        }

        removeSub(sub) {
            remove(this.subs, sub);
        }

        notify() {
            this.subs.forEach(sub => {
                sub.update();
            });
        }
    }

    class Observer {
        constructor(data) {
            this.list = [];
            this.data = data;
            if (!data || typeof data !== 'object') {
                return
            }else {
                Object.keys(data).forEach((key) => {
                    this.defineReactive(this.data, key, data[key]);
                });
            }
        }

        defineReactive(data, key, value){
            new Observer(value);
            let dep = new Dep();
            this.list.push(dep);
            Object.defineProperty(data, key, {
                enumerable: true,
                configurable: true,
                set: function (newValue) {
                    new Observer(newValue);
                    if (newValue === value) {
                        return
                    }else {
                        value = newValue;
                        dep.notify();
                    }
                },
                get: function () {
                    Dep.target && dep.addSub(Dep.target);
                    return value
                }
            });
        }


    }

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
        vm.$data = data;
        const keys = Object.keys(data);
        vm.$options.props;
        vm.$options.methods;
        let i = keys.length;
        while (i--) {
            const key = keys[i];
            proxy(vm, `_data`, key);
        }
        vm._observe = new Observer(data);
    }

    function getData(data, vm) {
        try{
            let d = data.call(vm,vm);
            return d
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

            if (vm.$options.el) {
                vm._compiler = vm.$mount(vm.$options.el, vm);
            }
        };
    }

    function MVue(options) {
        this._init(options);
    }

    initMixin(MVue);

    function parseHTML(html) {

        while (html) {
            advance(1);
        }

        function advance(n) {
            html = html.substring(n);
        }
    }

    function parser(template) {

        parseHTML(template);
    }

    function createCompileToFunctionFn(compile) {

        return function compileToFunctions(template) {

            const compiled = compile(template);

            console.log(compiled);
        }
    }

    function createCompilerCreator(baseCompile) {

        return function createCompiler() {

            function compile(template) {
                baseCompile(template.trim());

            }

            return {
                compile,
                compileToFunctions: createCompileToFunctionFn(compile)
            }
        }

    }

    const createCompiler = createCompilerCreator(function baseCompile(template) {
        parser(template);
    });

    const { compile, compileToFunctions } = createCompiler({ts: 123});

    MVue.prototype.$mount = function (el, vm) {
        el = document.querySelector(el);
        let template = null;
        const options = this.$options;

        if (!options.render) {
            template = getOuterHTML(el);
        }

        compileToFunctions(template);


    };

    function getOuterHTML(el) {
        if (el.outerHTML) {
            return el.outerHTML
        }else {
            const container = document.createElement('div');
            container.appendChild(el.cloneNode(true));
            return container.innerHTML
        }
    }

    return MVue;

})));
