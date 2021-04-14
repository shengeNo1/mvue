
import { parseHTML } from "./html-parser";

export const onRE = /^@|^v-on:/
export const dirRE = /^v-|^@|^:|^\./
export const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/
export const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/
const stripParensRE = /^\(|\)$/g

const argRE = /:(.*)$/
export const bindRE = /^:|^\.|^v-bind:/
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
    const stack = []
    let currentParent

    let root = parseHTML(template,{

        start(tag, attrs, unary, start) {
            let element = createASTElement(tag, attrs, currentParent)

        }

    })
}


function makeAttrsMap(attrs) {
    const map = {}
    for (let i = 0, l = attrs.length; i < l; i++) {
        if(!attrs[i]) continue
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



























