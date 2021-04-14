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

    function makeMap(
        str,
        expectsLowerCase
    ) {
        const map = Object.create(null);
        const list = str.split(',');
        for (let i = 0; i < list.length; i++) {
            map[list[i]] = true;
        }

        return expectsLowerCase
            ? val => map[val.toLowerCase()]
            : val => map[val]
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

    // Regular Expressions for parsing tags and attributes
    const unicodeLetters = 'a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD';
    const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
    const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeLetters}]*`;
    const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
    const startTagOpen = new RegExp(`^<${qnameCapture}`);
    const startTagClose = /^\s*(\/?)>/;
    const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);

    const isIgnoreNewlineTag = makeMap('pre,textarea', true);
    const shouldIgnoreFirstNewline = (tag, html) => tag && isIgnoreNewlineTag(tag) && html[0] === '\n';

    const decodingMap = {
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&amp;': '&',
        '&#10;': '\n',
        '&#9;': '\t'
    };

    const encodedAttr = /&(?:lt|gt|quot|amp);/g;
    const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10|#9);/g;

    function decodeAttr (value, shouldDecodeNewlines) {
        const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
        return value.replace(re, match => decodingMap[match])
    }


    function parseHTML(html, options) {
        let stack = [];
        let index = 0;
        let lastTag;

        while (html) {
            let textEnd = html.indexOf('<');

            if (textEnd === 0) {

                // End tag:
                const endTagMatch = html.match(endTag);
                if (endTagMatch) {
                    advance(endTagMatch[0].length);
                    continue
                }

                // Start tag:
                const startTagMatch = parseStartTag();
                if (startTagMatch) {
                    handleStartTag(startTagMatch);
                    if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
                        advance(1);
                    }
                    continue
                }
            }


            advance(1);
        }

        function advance (n) {
            index += n;
            html = html.substring(n);
        }
        
        function parseStartTag() {
            const start = html.match(startTagOpen);
            if (start) {

                const match = {
                    tagName: start[1],
                    attrs: [],
                    start: index
                };

                advance(start[0].length);
                let end, attr;

                while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                    attr.start = index;
                    advance(attr[0].length);
                    attr.end = index;
                    match.attrs.push(attr);
                }
                if (end) {
                    match.unarySlash = end[1];
                    advance(end[0].length);
                    match.end =index;
                    return match
                }
            }
        }
        
        function handleStartTag(match) {
            const tagName = match.tagName;
            const unarySlash = match.unarySlash;

            {
                if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
                    parseEndTag(lastTag);
                }
            }

            const unary = isUnaryTag(tagName) || !!unarySlash;

            const l = match.attrs.length;
            const attrs = new Array(l);
            for (let i = 0; i < l; i++) {
                const args = match.attrs[i];
                const value = args[3] || args[4] || args[5] || '';
                const shouldDecodeNewlines = false;

                attrs[i] = {
                    name: args[1],
                    value: decodeAttr(value, shouldDecodeNewlines)
                };

                if (!unary) {
                    stack.push({tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs, start: match.start, end: match.end });
                    lastTag = tagName;
                }

                if (options.start) {
                    options.start(tagName, attrs, unary, match.start, match.end);
                }
            }

        }

        function parseEndTag(tagName, start, end) {
            let pos, lowerCasedTagName;
            if (start == null) start = index;
            if (end == null) end = index;

            if (tagName) {
                lowerCasedTagName = tagName.toLowerCase();
                for (pos = stack.length - 1; pos >= 0; pos--) {
                    if (stack[pos].lowerCasedTag === lowerCasedTagName) {
                        break
                    }
                }
            }else {
                pos = 0;
            }

            if (pos >= 0 ){
                for (let i = stack.length - 1; i >= pos; i--) {
                    if (options.end) {
                        options.end(start[i].tag, start, end);
                    }
                }

                // Remove the open elements from the stack
                stack.length = pos;
                lastTag = pos && stack[pos - 1].tag;
            }else if (lowerCasedTagName === 'br') {
                if (options.start) {
                    options.start(tagName, [], true, start, end);
                }
            }else if (lowerCasedTagName === 'p') {
                if (options.start) {
                    options.start(tagName, [], false, start, end);
                }
                if (options.end) {
                    options.end(tagName, start, end);
                }
            }
        }

    }

    const isNonPhrasingTag = makeMap(
        'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
        'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
        'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
        'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
        'title,tr,track'
    );

    const isUnaryTag = makeMap(
        'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
        'link,meta,param,source,track,wbr'
    );

    function createASTElement(tag, attrs, parent) {
        return {
            type: 1,
            tag,
            attrsList: attrs,
            attrsMap: makeAttrsMap(attrs),
            rawAttrsMap: {},
            parent,
            children: []
        }
    }

    function parser(template) {
        let currentParent;

        parseHTML(template,{

            start(tag, attrs, unary, start) {
                createASTElement(tag, attrs, currentParent);

            }

        });
    }


    function makeAttrsMap(attrs) {
        const map = {};
        for (let i = 0, l = attrs.length; i < l; i++) {
            if(!attrs[i]) continue
            map[attrs[i].name] = attrs[i].value;
        }
        return map
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
