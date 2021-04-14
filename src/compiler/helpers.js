import {emptyObject} from "../shared/utils";

import {parseFilters} from "./parser/parser-filter";


export function baseWarn(msg, range) {
    console.error(`[Vue compiler]: ${msg}`)
}

export function pluckModuleFunction(modules, key) {
    return modules
        ? modules.map(m => m[key]).filter(_ => _)
        : []
}

export function addProp(el, name, value, range) {
    (el.props || (el.props = [])).push(rangeSetItem({name, value}, range))
    el.plain = false
}

export function addAttr(el, name, value, range) {
    (el.attrs || (el.attrs = [])).push(rangeSetItem({name, value}, range))
    el.plain = false
}

// add a raw attr (use this in preTransforms)
export function addRawAttr(el, name, value, range) {
    el.attrsMap[name] = value
    el.attrsList.push(rangeSetItem({name, value}, range))
}

export function addDirective(
    el,
    name,
    rawName,
    value,
    arg,
    modifiers,
    range
) {
    (el.directives || (el.directives = [])).push(rangeSetItem({name, rawName, value, arg, modifiers}, range))
    el.plain = false
}

export function addHandler(el, name, value, modifiers, important, range) {
    modifiers = modifiers || emptyObject

    if (name === 'click') {
        if (modifiers.right) {
            name = 'contextmenu'
            delete modifiers.right
        } else if (modifiers.middle) {
            name = 'mouseup'
        }
    }

    // check capture modifier
    if (modifiers.capture) {
        delete modifiers.capture
        name = '!' + name // mark the event as captured
    }
    if (modifiers.once) {
        delete modifiers.once
        name = '~' + name // mark the event as once
    }
    /* istanbul ignore if */
    if (modifiers.passive) {
        delete modifiers.passive
        name = '&' + name // mark the event as passive
    }

    let events
    if (modifiers.native) {
        delete modifiers.native
        events = el.nativeEvents || (el.nativeEvents = {})
    } else {
        events = el.events || (el.events = {})
    }

    const newHandler = rangeSetItem({value: value.trim()}, range)
    if (modifiers !== emptyObject) {
        newHandler.modifiers = modifiers
    }
    const handlers = events[name]
    /* istanbul ignore if */
    if (Array.isArray(handlers)) {
        important ? handlers.unshift(newHandler) : handlers.push(newHandler)
    } else if (handlers) {
        events[name] = important ? [newHandler, handlers] : [handlers, newHandler]
    } else {
        events[name] = newHandler
    }

    el.plain = false
}


export function getRawBindingAttr(el, name) {
    return el.rawAttrsMap[':' + name] ||
        el.rawAttrsMap['v-bind:' + name] ||
        el.rawAttrsMap[name]
}


export function getBindingAttr(
    el,
    name,
    getStatic
) {
    const dynamicValue =
        getAndRemoveAttr(el, ':' + name) ||
        getAndRemoveAttr(el, 'v-bind:' + name)
    if (dynamicValue != null) {
        return parseFilters(dynamicValue)
    } else if (getStatic !== false) {
        const staticValue = getAndRemoveAttr(el, name)
        if (staticValue != null) {
            return JSON.stringify(staticValue)
        }
    }
}

export function getAndRemoveAttr(
    el,
    name,
    removeFromMap
) {
    let val
    if ((val = el.attrsMap[name]) != null) {
        const list = el.attrsList
        for (let i = 0, l = list.length; i < l; i++) {
            if (list[i].name === name) {
                list.splice(i, 1)
                break
            }
        }
    }
    if (removeFromMap) {
        delete el.attrsMap[name]
    }
    return val
}

export function getAndRemoveAttrByRegex(
    el,
    name
) {
    const list = el.attrsList
    for (let i = 0, l = list.length; i < l; i++) {
        const attr = list[i]
        if (name.test(attr.name)) {
            list.splice(i, 1)
            return attr
        }
    }
}


function rangeSetItem(
    item,
    range
) {
    if (range) {
        if (range.start != null) {
            item.start = range.start
        }
        if (range.end != null) {
            item.end = range.end
        }
    }
    return item
}
