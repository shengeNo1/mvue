import {parseHTML} from "./html-parser";

import {cached} from "../../shared/utils";
import {parseText} from "./text-parser";
var decodeHTMLCached = cached(decode);

export const onRE = /^@|^v-on:/
export const dirRE = /^v-|^@|^:|^\./
export const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/
export const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/
const stripParensRE = /^\(|\)$/g



const argRE = /:(.*)$/
const bindRE = /^:|^\.|^v-bind:/
const propBindRE = /^\./
const modifierRE = /\.[^.]+/g

const scopedSlotShorthandRE = /^:?\(.*\)$/

const lineBreakRE = /[\r\n]/
const whitespaceRE = /\s+/g

let delimiters
let transforms
let preTransforms
let postTransforms
let platformIsPreTag
let platformMustUseProp
let platformGetTagNamespace
let maybeComponent
let whitespaceOption = 'condense'

export function createASTElement(tag, attrs, parent) {
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

export function parser(template) {
    let inPre = false
    let root
    const stack = []
    let currentParent

    function closeElement(element) {
        if (!stack.length && element !== root) {
            if (root.if && (element.elseif || element.else)) {
                addIfCondition(root, {
                    exp: element.elseif,
                    block: element
                })
            }
        }

        if (currentParent && !element.forbidden) {
            if (element.elseif || element.else) {

            } else if (element.slotScope) {

            } else {
                currentParent.children.push(element)
                element.parent = currentParent
            }
        }

        if (isPreTag(element.tag)) {
            inPre = false
        }
    }

    parseHTML(template, {

        start(tag, attrs, unary, start) {

            let element = createASTElement(tag, attrs, currentParent)

            if (isPreTag(element.tag)) {
                inPre = true
            }

            if (!root) {
                root = element
            }

            if (!unary) {
                currentParent = element
                stack.push(element)
            } else {
                closeElement(element)
            }
        },

        end(tag, start, end) {
            const element = stack[stack.length - 1]
            if (!inPre) {
                const lastNode = element.children[element.children.length - 1]
                if (lastNode && lastNode.type === 3 && lastNode.text === ' ') {
                    element.children.pop()
                }
            }

            stack.length -= 1
            currentParent = stack[stack.length - 1]
            element.end = end
            closeElement(element)
        },

        chars(text, start, end) {
            if (!currentParent) {
                return
            }
            const children = currentParent.children
            if (inPre || text.trim()) {
                text = isTextTag(currentParent) ? text : decodeHTMLCached(text)
            } else if (!children.length) {
                text = ''
            } else if (whitespaceOption) {
                if (whitespaceOption === 'condense') {
                    // in condense mode, remove the whitespace node if it contains
                    // line break, otherwise condense to a single space
                    text = lineBreakRE.test(text) ? '' : ' '
                } else {
                    text = ' '
                }
            } else {
                text =  ''
            }

            if (text) {
                if (whitespaceOption === 'condense') {
                    text = text.replace(whitespaceRE, ' ')
                }
                let res
                let child
                if (text !== ' ' && (res = parseText(text, delimiters))) {
                    child = {
                        type: 2,
                        expression: res.expression,
                        tokens: res.tokens,
                        text
                    }
                }else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
                    child = {
                        type: 3,
                        text
                    }
                }

                if (child) {
                    children.push(child)
                }
            }

        }
    })

    return root
}


function makeAttrsMap(attrs) {
    const map = {}
    for (let i = 0, l = attrs.length; i < l; i++) {
        if (!attrs[i]) continue
        map[attrs[i].name] = attrs[i].value
    }
    return map
}

// for script (e.g. type="x/template") or style, do not decode content
function isTextTag(el) {
    return el.tag === 'script' || el.tag === 'style'
}

function isForbiddenTag(el) {
    return (
        el.tag === 'style' ||
        (el.tag === 'script' && (
            !el.attrsMap.type ||
            el.attrsMap.type === 'text/javascript'
        ))
    )
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


var decoder;

var he = {
    decode: function decode(html) {
        decoder = decoder || document.createElement('div');
        decoder.innerHTML = html;
        return decoder.textContent
    }
};

function decode(html) {
    let decoder = document.createElement('div');
    decoder.innerHTML = html;
    return decoder.textContent
}
















