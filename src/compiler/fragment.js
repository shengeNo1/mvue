import Watcher from "../core/observer/Watcher";


export default class Compile{
    constructor(el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el)
        this.vm = vm
        this.fragment = null;

        if (this.el) {
            this.fragment = this.nodeToFragment(this.el)
            this.compileElement(this.fragment)
            this.el.appendChild(this.fragment)
        }
    }

    isElementNode(node) {
        return node.nodeType === 1
    }

    nodeToFragment(el) {
        let fragment = document.createDocumentFragment()
        let child = null;
        while (child = el.firstChild) {
            fragment.appendChild(child)
        }
        return fragment;
    }

    compileElement(el) {
        let childNodes = el.childNodes;
        let self = this
        let reg = /\{\{(.*)\}\}/;
        [...childNodes].forEach(node => {
            let text = node.textContent

            if (self.isElementNode(node)) {
                this.compile(node)
            }else if (self.isTextNode(node) && reg.test(text)){
                this.compileText(node, reg.exec(text)[1])
            }

            if (node.childNodes && node.childNodes.length) {
                self.compileElement(node)
            }
        })
    }

    compile(node) {
        let nodeAttrs = node.attributes;
        let self = this;
        [...nodeAttrs].forEach(attr => {
            const {name, value} = attr
            if (self.isDirective(name)) {
                const [, dirctive] = name.split('-');
                const [dirName, event] = dirctive.split(':');
                compileUtils[dirName](node, value, this.vm, event)
                node.removeAttribute(name)
            } else if (self.isEventName(name)) {
                let event = name.substring(1)
                compileUtils['on'](node, value, this.vm, event)
                node.removeAttribute(name)
            }
        })
    }

    compileText(node, exp) {
        let self = this;
        let initText = exp.split('.').reduce((data, currentVal) => {
            return data[currentVal]
        }, this.vm.$data)
        new Watcher(this.vm,exp,(newValue)=> {
            this.updateText(node, newValue)
        })
        this.updateText(node, initText)
    }

    isDirective(attrName) {
        return attrName.startsWith('v-')
    }

    isEventName(attrName) {
        return attrName.startsWith('@')
    }

    updateText(node, value) {
        node.textContent = value
    }

    isTextNode(node) {
        return node.nodeType === 3
    }
}


const compileUtils = {
    text(node, exp, vm) {
        const value = this.getVal(exp, vm)
        new Watcher(vm,exp, (newValue) => {
            this.updater.textUpdater(node, newValue)
        })
        this.updater.textUpdater(node, value)
    },
    html(node, exp, vm) {
        const value = this.getVal(exp, vm)
        new Watcher(vm,exp,(newValue) => {
            this.updater.htmlUpdater(node, newValue)
        })
        this.updater.htmlUpdater(node, value)
    },
    model(node, exp, vm) {
        let self = this
        const value = this.getVal(exp, vm)
        new Watcher(vm,exp,(newValue) => {
            this.updater.modelUpdater(node, newValue)
        })
        this.updater.modelUpdater(node, value)
        node.addEventListener('input', (e) => {
            exp.split('.').reduce((data,current) => {
                if (typeof data[current] !== 'object'){
                    data[current] = e.target.value
                }
                return data[current]
            },vm.$data)
        },false)
    },
    on(node, exp, vm, event) {
        let method = vm.$options.methods[exp]
        node.addEventListener(event, method.bind(vm), false);
    },
    updater: {
        textUpdater(node, value) {
            node.textContent = value;
        },
        htmlUpdater(node, value) {
            node.innerHTML = value
        },
        modelUpdater(node, value) {
            node.value = value
        }
    },
    getVal(exp, vm) {
        return exp.split('.').reduce((data, currentVal) => {
            return data[currentVal]
        }, vm.$data)
    }
}
