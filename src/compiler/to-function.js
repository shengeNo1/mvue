export function createCompileToFunctionFn(compile) {
    const cache = Object.create(null)

    return function compileToFunctions(template) {

        const compiled = compile(template)

        console.log(compiled)

        // turn code into functions
        const res = {}
        const fnGenErrors = []
    }
}