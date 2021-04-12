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

    function remove(arr, item) {
        if (arr.length) {
            const index = arr.indexOf(item);
            if (index > -1) {
                return arr.splice(index, 1)
            }
        }
    }

    function getVal(exp, obj) {
        return exp.split('.').reduce((data, currentVal) => {
            return data[currentVal]
        }, obj)
    }

    const bind = Function.prototype.bind ? nativeBind : polyfillBind;

    let uid$1 = 0;

    class Dep{

        constructor() {
            this.id = ++ uid$1;
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

    let uid = 0;

    class Watcher{

        constructor(vm, exp, cb) {
            this.vm = vm;
            this.exp = exp;
            this.cb = cb;
            vm._watchers.push(this);
            this.id = ++uid;
            this.value = this.get();
        }

        get() {
            Dep.target = this;
            let oldValue = getVal(this.exp, this.vm.$data);
            Dep.target = null;
            return oldValue;
        }

        update() {
            let newValue = getVal(this.exp, this.vm.$data);
            if (newValue !== this.value) {
                this.cb.call(this.vm, newValue, this.value);
            }
        }
    }

    class Compile{
        constructor(el, vm) {
            this.el = this.isElementNode(el) ? el : document.querySelector(el);
            this.vm = vm;
            this.fragment = null;

            if (this.el) {
                this.fragment = this.nodeToFragment(this.el);
                this.compileElement(this.fragment);
                this.el.appendChild(this.fragment);
            }
        }

        isElementNode(node) {
            return node.nodeType === 1
        }

        nodeToFragment(el) {
            let fragment = document.createDocumentFragment();
            let child = null;
            while (child = el.firstChild) {
                fragment.appendChild(child);
            }
            return fragment;
        }

        compileElement(el) {
            let childNodes = el.childNodes;
            let self = this;
            let reg = /\{\{(.*)\}\}/;
            [...childNodes].forEach(node => {
                let text = node.textContent;

                if (self.isElementNode(node)) {
                    this.compile(node);
                }else if (self.isTextNode(node) && reg.test(text)){
                    this.compileText(node, reg.exec(text)[1]);
                }

                if (node.childNodes && node.childNodes.length) {
                    self.compileElement(node);
                }
            });
        }

        compile(node) {
            let nodeAttrs = node.attributes;
            let self = this;
            [...nodeAttrs].forEach(attr => {
                const {name, value} = attr;
                if (self.isDirective(name)) {
                    const [, dirctive] = name.split('-');
                    const [dirName, event] = dirctive.split(':');
                    compileUtils[dirName](node, value, this.vm, event);
                    node.removeAttribute(name);
                } else if (self.isEventName(name)) {
                    let event = name.substring(1);
                    compileUtils['on'](node, value, this.vm, event);
                    node.removeAttribute(name);
                }
            });
        }

        compileText(node, exp) {
            let initText = exp.split('.').reduce((data, currentVal) => {
                return data[currentVal]
            }, this.vm.$data);
            new Watcher(this.vm,exp,(newValue)=> {
                this.updateText(node, newValue);
            });
            this.updateText(node, initText);
        }

        isDirective(attrName) {
            return attrName.startsWith('v-')
        }

        isEventName(attrName) {
            return attrName.startsWith('@')
        }

        updateText(node, value) {
            node.textContent = value;
        }

        isTextNode(node) {
            return node.nodeType === 3
        }
    }


    const compileUtils = {
        text(node, exp, vm) {
            const value = this.getVal(exp, vm);
            new Watcher(vm,exp, (newValue) => {
                this.updater.textUpdater(node, newValue);
            });
            this.updater.textUpdater(node, value);
        },
        html(node, exp, vm) {
            const value = this.getVal(exp, vm);
            new Watcher(vm,exp,(newValue) => {
                this.updater.htmlUpdater(node, newValue);
            });
            this.updater.htmlUpdater(node, value);
        },
        model(node, exp, vm) {
            const value = this.getVal(exp, vm);
            new Watcher(vm,exp,(newValue) => {
                this.updater.modelUpdater(node, newValue);
            });
            this.updater.modelUpdater(node, value);
            node.addEventListener('input', (e) => {
                exp.split('.').reduce((data,current) => {
                    if (typeof data[current] !== 'object'){
                        data[current] = e.target.value;
                    }
                    return data[current]
                },vm.$data);
            },false);
        },
        on(node, exp, vm, event) {
            let method = vm.$options.methods[exp];
            node.addEventListener(event, method.bind(vm), false);
        },
        updater: {
            textUpdater(node, value) {
                node.textContent = value;
            },
            htmlUpdater(node, value) {
                node.innerHTML = value;
            },
            modelUpdater(node, value) {
                node.value = value;
            }
        },
        getVal(exp, vm) {
            return exp.split('.').reduce((data, currentVal) => {
                return data[currentVal]
            }, vm.$data)
        }
    };

    MVue.prototype.$mount = function (el, vm) {
        return new Compile(el, vm)
    };

    return MVue;

})));
