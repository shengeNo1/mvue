
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

export const bind = Function.prototype.bind ? nativeBind : polyfillBind