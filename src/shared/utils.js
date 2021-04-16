export const emptyObject = Object.freeze({})

export function cached (fn) {
    const cache = Object.create(null)
    return (function cachedFn (str) {
        const hit = cache[str]
        return hit || (cache[str] = fn(str))
    })
}

function polyfillBind(fn, ctx) {
    function boundFn(a) {
        const l = arguments.length
        return l
            ? l > 1
                ? fn.apply(ctx, arguments)
                : fn.call(ctx, a)
            : fn.call(ctx)
    }

    boundFn._length = fn.length
    return boundFn
}

function nativeBind(fn, ctx) {
    return fn.bind(ctx)
}

export function remove(arr, item) {
    if (arr.length) {
        const index = arr.indexOf(item)
        if (index > -1) {
            return arr.splice(index, 1)
        }
    }
}

export function getVal(exp, obj) {
    return exp.split('.').reduce((data, currentVal) => {
        return data[currentVal]
    }, obj)
}

export function makeMap(
    str,
    expectsLowerCase
) {
    const map = Object.create(null)
    const list = str.split(',')
    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true
    }

    return expectsLowerCase
        ? val => map[val.toLowerCase()]
        : val => map[val]
}

export const bind = Function.prototype.bind ? nativeBind : polyfillBind