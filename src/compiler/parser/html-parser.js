
// Regular Expressions for parsing tags and attributes
const unicodeLetters = 'a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD'
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeLetters}]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const doctype = /^<!DOCTYPE [^>]+>/i
// #7298: escape - to avoid being pased as HTML comment when inlined in page
const comment = /^<!\--/
const conditionalComment = /^<!\[/

const isIgnoreNewlineTag = makeMap('pre,textarea', true)
const shouldIgnoreFirstNewline = (tag, html) => tag && isIgnoreNewlineTag(tag) && html[0] === '\n'

const decodingMap = {
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&amp;': '&',
    '&#10;': '\n',
    '&#9;': '\t'
}

const encodedAttr = /&(?:lt|gt|quot|amp);/g
const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10|#9);/g

function decodeAttr (value, shouldDecodeNewlines) {
    const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr
    return value.replace(re, match => decodingMap[match])
}

import {makeMap} from "../../shared/utils";


export function parseHTML(html, options) {
    let stack = [];
    const expectHTML = true
    let index = 0
    let last, lastTag

    while (html) {
        last = html
        let textEnd = html.indexOf('<')

        if (textEnd === 0) {

            // End tag:
            const endTagMatch = html.match(endTag)
            if (endTagMatch) {
                const curIndex = index
                advance(endTagMatch[0].length)
                continue
            }

            // Start tag:
            const startTagMatch = parseStartTag()
            if (startTagMatch) {
                handleStartTag(startTagMatch)
                if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
                    advance(1)
                }
                continue
            }
        }


        advance(1)
    }

    function advance (n) {
        index += n
        html = html.substring(n)
    }
    
    function parseStartTag() {
        const start = html.match(startTagOpen)
        if (start) {

            const match = {
                tagName: start[1],
                attrs: [],
                start: index
            }

            advance(start[0].length)
            let end, attr

            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                attr.start = index
                advance(attr[0].length)
                attr.end = index
                match.attrs.push(attr)
            }
            if (end) {
                match.unarySlash = end[1]
                advance(end[0].length)
                match.end =index
                return match
            }
        }
    }
    
    function handleStartTag(match) {
        const tagName = match.tagName
        const unarySlash = match.unarySlash

        if (expectHTML) {
            if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
                parseEndTag(lastTag)
            }
        }

        const unary = isUnaryTag(tagName) || !!unarySlash

        const l = match.attrs.length
        const attrs = new Array(l)
        for (let i = 0; i < l; i++) {
            const args = match.attrs[i]
            const value = args[3] || args[4] || args[5] || ''
            const shouldDecodeNewlines = false

            attrs[i] = {
                name: args[1],
                value: decodeAttr(value, shouldDecodeNewlines)
            }

            if (!unary) {
                stack.push({tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs, start: match.start, end: match.end })
                lastTag = tagName
            }

            if (options.start) {
                options.start(tagName, attrs, unary, match.start, match.end)
            }
        }

    }

    function parseEndTag(tagName, start, end) {
        let pos, lowerCasedTagName
        if (start == null) start = index
        if (end == null) end = index

        if (tagName) {
            lowerCasedTagName = tagName.toLowerCase()
            for (pos = stack.length - 1; pos >= 0; pos--) {
                if (stack[pos].lowerCasedTag === lowerCasedTagName) {
                    break
                }
            }
        }else {
            pos = 0
        }

        if (pos >= 0 ){
            for (let i = stack.length - 1; i >= pos; i--) {
                if (options.end) {
                    options.end(start[i].tag, start, end)
                }
            }

            // Remove the open elements from the stack
            stack.length = pos
            lastTag = pos && stack[pos - 1].tag
        }else if (lowerCasedTagName === 'br') {
            if (options.start) {
                options.start(tagName, [], true, start, end)
            }
        }else if (lowerCasedTagName === 'p') {
            if (options.start) {
                options.start(tagName, [], false, start, end)
            }
            if (options.end) {
                options.end(tagName, start, end)
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
)

const isUnaryTag = makeMap(
    'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
    'link,meta,param,source,track,wbr'
);