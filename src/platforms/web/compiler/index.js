
import { createCompiler } from "../../../compiler/index";

const { compile, compileToFunctions } = createCompiler({ts: 123})

export { compile, compileToFunctions }