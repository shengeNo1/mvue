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

    function cached (fn) {
        const cache = Object.create(null);
        return (function cachedFn (str) {
            const hit = cache[str];
            return hit || (cache[str] = fn(str))
        })
    }

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

    const unicodeLetters = 'a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD';

    // Regular Expressions for parsing tags and attributes
    const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
    const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeLetters}]*`;
    const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
    const startTagOpen = new RegExp(`^<${qnameCapture}`);
    const startTagClose = /^\s*(\/?)>/;
    const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
    // #7298: escape - to avoid being pased as HTML comment when inlined in page
    const comment = /^<!\--/;
    const conditionalComment = /^<!\[/;

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

    // #5992
    const isIgnoreNewlineTag = makeMap('pre,textarea', true);
    const shouldIgnoreFirstNewline = (tag, html) => tag && isIgnoreNewlineTag(tag) && html[0] === '\n';


    function decodeAttr(value, shouldDecodeNewlines) {
        const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
        return value.replace(re, match => decodingMap[match])
    }


    function parseHTML(html, options) {
        let index = 0;
        let last;
        // 准备两个栈
        let stack = [];

        while (html) {

            let textEnd = html.indexOf('<');

            if (textEnd === 0) {

                // Start tag:
                const startTagMatch = parseStartTag();
                if (startTagMatch) {
                    handleStartTag(startTagMatch);
                    if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
                        advance(1);
                    }
                    continue
                }

                // End tag:
                const endTagMatch = html.match(endTag);
                if (endTagMatch) {
                    const curIndex = index;
                    advance(endTagMatch[0].length);
                    parseEndTag(endTagMatch[1], curIndex, index);
                    continue
                }

            }

            let text, rest, next;
            if (textEnd) {
                rest = html.slice(textEnd);
                while (
                    !endTag.test(rest) &&
                    !startTagOpen.test(rest) &&
                    !comment.test(rest) &&
                    !conditionalComment.test(rest)
                    ){
                    next = rest.indexOf('<', 1);
                    if (next < 0) break
                    textEnd += next;
                    rest = html.slice(textEnd);
                }
                text = html.substring(0, textEnd);
            }

            if (textEnd < 0) {
                text = html;
            }

            if (text) {
                advance(text.length);
            }

            if (options.chars && text) {
                options.chars(text, index - text.length, index);
            }

            if (html === last) {
                options.chars && options.chars(html);
                break
            }
        }

        function advance(n) {
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
                    match.end = index;
                    return match
                }
            }
        }

        function handleStartTag(match) {
            const tagName = match.tagName;
            const unarySlash = match.unarySlash;

            const unary = isUnaryTag(tagName) || !!unarySlash;
            const l = match.attrs.length;
            const attrs = new Array(l);
            for (let i = 0; i < l; i++) {
                const args = match.attrs[i];
                const value = args[3] || args[4] || args[5] || '';

                attrs[i] = {
                    name: args[1],
                    value: decodeAttr(value, false)
                };

            }

            if (!unary) {
                stack.push({
                    tag: tagName,
                    lowerCasedTag: tagName.toLowerCase(),
                    attrs: attrs,
                    start: match.start,
                    end: match.end
                });
            }

            if (options.start) {
                options.start(tagName, attrs, unary, match.start, match.end);
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
            } else {
                pos = 0;
            }

            if (pos >= 0) {
                for (let i = stack.length - 1; i >= pos; i--) {
                    if (options.end) {
                        options.end(stack[i].tag, start, end);
                    }
                }
                stack.length = pos;
                pos && stack[pos - 1].tag;

            } else if (lowerCasedTagName === 'br') {
                if (options.start) {
                    options.start(tagName, [], true, start, end);
                }
            } else if (lowerCasedTagName === 'p') {
                if (options.start) {
                    options.start(tagName, [], false, start, end);
                }
                if (options.end) {
                    options.end(tagName, start, end);
                }
            }
        }

    }

    var isUnaryTag = makeMap(
        'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
        'link,meta,param,source,track,wbr'
    );

    // Elements that you can, intentionally, leave open
    // (and which close themselves)
    makeMap(
        'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
    );

    // HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
    // Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
    makeMap(
        'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
        'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
        'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
        'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
        'title,tr,track'
    );

    const validDivisionCharRE = /[\w).+\-_$\]]/;

    function parseFilters(exp) {
        let inSingle = false;
        let inDouble = false;
        let inTemplateString = false;
        let inRegex = false;
        let curly = 0;
        let square = 0;
        let paren = 0;
        let lastFilterIndex = 0;
        let c, prev, i, expression, filters;

        for (i = 0; i < exp.length; i++) {
            prev = c;
            c = exp.charCodeAt(i);
            if (inSingle) {
                if (c === 0x27 && prev !== 0x5C) inSingle = false;
            } else if (inDouble) {
                if (c === 0x22 && prev !== 0x5C) inDouble = false;
            } else if (inTemplateString) {
                if (c === 0x60 && prev !== 0x5C) inTemplateString = false;
            } else if (inRegex) {
                if (c === 0x2f && prev !== 0x5C) inRegex = false;
            } else if (
                c === 0x7C && // pipe
                exp.charCodeAt(i + 1) !== 0x7C &&
                exp.charCodeAt(i - 1) !== 0x7C &&
                !curly && !square && !paren
            ) {
                if (expression === undefined) {
                    // first filter, end of expression
                    lastFilterIndex = i + 1;
                    expression = exp.slice(0, i).trim();
                } else {
                    pushFilter();
                }
            } else {
                switch (c) {
                    case 0x22: inDouble = true; break         // "
                    case 0x27: inSingle = true; break         // '
                    case 0x60: inTemplateString = true; break // `
                    case 0x28: paren++; break                 // (
                    case 0x29: paren--; break                 // )
                    case 0x5B: square++; break                // [
                    case 0x5D: square--; break                // ]
                    case 0x7B: curly++; break                 // {
                    case 0x7D: curly--; break                 // }
                }
                if (c === 0x2f) { // /
                    let j = i - 1;
                    let p;
                    // find first non-whitespace prev char
                    for (; j >= 0; j--) {
                        p = exp.charAt(j);
                        if (p !== ' ') break
                    }
                    if (!p || !validDivisionCharRE.test(p)) {
                        inRegex = true;
                    }
                }
            }
        }

        if (expression === undefined) {
            expression = exp.slice(0, i).trim();
        } else if (lastFilterIndex !== 0) {
            pushFilter();
        }
        function pushFilter () {
            (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
            lastFilterIndex = i + 1;
        }

        if (filters) {
            for (i = 0; i < filters.length; i++) {
                expression = wrapFilter(expression, filters[i]);
            }
        }

        return expression

    }

    function wrapFilter (exp, filter) {
        const i = filter.indexOf('(');
        if (i < 0) {
            // _f: resolveFilter
            return `_f("${filter}")(${exp})`
        } else {
            const name = filter.slice(0, i);
            const args = filter.slice(i + 1);
            return `_f("${name}")(${exp}${args !== ')' ? ',' + args : args}`
        }
    }

    const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
    const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

    const buildRegex = cached(delimiters => {
        const open = delimiters[0].replace(regexEscapeRE, '\\$&');
        const close = delimiters[1].replace(regexEscapeRE, '\\$&');
        return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
    });

    function parseText(text, delimiters) {
        const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
        if (!tagRE.test(text)) {
            return
        }
        const tokens = [];
        const rawTokens = [];
        let lastIndex = tagRE.lastIndex = 0;
        let match, index, tokenValue;
        while ((match = tagRE.exec(text))) {
            index = match.index;
            if (index > lastIndex) {
                rawTokens.push(tokenValue = text.slice(lastIndex, index));
                tokens.push(JSON.stringify(tokenValue));
            }
            const exp = parseFilters(match[1].trim());
            tokens.push(`_s(${exp})`);
            rawTokens.push({ '@binding': exp });
            lastIndex = index + match[0].length;
        }
        if (lastIndex < text.length) {
            rawTokens.push(tokenValue = text.slice(lastIndex));
            tokens.push(JSON.stringify(tokenValue));
        }
        return {
            expression: tokens.join('+'),
            tokens: rawTokens
        }
    }

    var decodeHTMLCached = cached(decode);

    const lineBreakRE = /[\r\n]/;
    const whitespaceRE = /\s+/g;

    let delimiters;

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
        let inPre = false;
        let root;
        const stack = [];
        let currentParent;

        function closeElement(element) {
            if (!stack.length && element !== root) {
                if (root.if && (element.elseif || element.else)) {
                    addIfCondition(root, {
                        exp: element.elseif,
                        block: element
                    });
                }
            }

            if (currentParent && !element.forbidden) {
                if (element.elseif || element.else) ; else if (element.slotScope) ; else {
                    currentParent.children.push(element);
                    element.parent = currentParent;
                }
            }

            if (isPreTag(element.tag)) {
                inPre = false;
            }
        }

        parseHTML(template, {

            start(tag, attrs, unary, start) {

                let element = createASTElement(tag, attrs, currentParent);

                if (isPreTag(element.tag)) {
                    inPre = true;
                }

                if (!root) {
                    root = element;
                }

                if (!unary) {
                    currentParent = element;
                    stack.push(element);
                } else {
                    closeElement(element);
                }
            },

            end(tag, start, end) {
                const element = stack[stack.length - 1];
                if (!inPre) {
                    const lastNode = element.children[element.children.length - 1];
                    if (lastNode && lastNode.type === 3 && lastNode.text === ' ') {
                        element.children.pop();
                    }
                }

                stack.length -= 1;
                currentParent = stack[stack.length - 1];
                element.end = end;
                closeElement(element);
            },

            chars(text, start, end) {
                if (!currentParent) {
                    return
                }
                const children = currentParent.children;
                if (inPre || text.trim()) {
                    text = isTextTag(currentParent) ? text : decodeHTMLCached(text);
                } else if (!children.length) {
                    text = '';
                } else {
                    {
                        // in condense mode, remove the whitespace node if it contains
                        // line break, otherwise condense to a single space
                        text = lineBreakRE.test(text) ? '' : ' ';
                    }
                }

                if (text) {
                    {
                        text = text.replace(whitespaceRE, ' ');
                    }
                    let res;
                    let child;
                    if (text !== ' ' && (res = parseText(text, delimiters))) {
                        child = {
                            type: 2,
                            expression: res.expression,
                            tokens: res.tokens,
                            text
                        };
                    }else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
                        child = {
                            type: 3,
                            text
                        };
                    }

                    if (child) {
                        children.push(child);
                    }
                }

            }
        });

        return root
    }


    function makeAttrsMap(attrs) {
        const map = {};
        for (let i = 0, l = attrs.length; i < l; i++) {
            if (!attrs[i]) continue
            map[attrs[i].name] = attrs[i].value;
        }
        return map
    }

    // for script (e.g. type="x/template") or style, do not decode content
    function isTextTag(el) {
        return el.tag === 'script' || el.tag === 'style'
    }

    var isPreTag = function (tag) {
        return tag === 'pre';
    };

    function addIfCondition(el, condition) {
        if (!el.ifConditions) {
            el.ifConditions = [];
        }
        el.ifConditions.push(condition);
    }

    function decode(html) {
        let decoder = document.createElement('div');
        decoder.innerHTML = html;
        return decoder.textContent
    }

    function createCompileToFunctionFn(compile) {

        return function compileToFunctions(template) {

            compile(template);
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
        const ast = parser(template);

        console.log('ast:', ast);
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
