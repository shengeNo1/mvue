
import { createCompileToFunctionFn } from './to-function'

export function createCompilerCreator(baseCompile) {

    return function createCompiler() {

        function compile(template) {
            const compiled = baseCompile(template.trim())

        }

        return {
            compile,
            compileToFunctions: createCompileToFunctionFn(compile)
        }
    }

}