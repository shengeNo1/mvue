
function polyfillBind(fn, ctx) {
    function boundFn (a){
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

function nativeBind (fn, ctx) {
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

export const bind = Function.prototype.bind ? nativeBind : polyfillBind