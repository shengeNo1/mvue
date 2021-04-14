import { parser } from "./parser/index";

import { createCompilerCreator } from "./create-compiler";

export const createCompiler = createCompilerCreator(function baseCompile(template) {
    const ast = parser(template)
})
