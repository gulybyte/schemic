/**
 * `DEFINE FUNCTION fn::…` — custom functions. Chainable: args (the second `defineFunction` argument),
 * `.returns(type)`, `.body(surql`…`)`, `.permissions(...)`, `.comment(...)`. Functions referenced from
 * field/event/access expressions become dependency edges (emitted before their callers).
 */
import { type ExampleGroup, ex } from "./_kit";

const examples = [
  ex({
    title: "Function with args, return type, body",
    code: `defineFunction("greet", { name: s.string() })
  .returns(s.string())
  .body(surql\`RETURN "hi " + $name\`)`,
    ddl: `DEFINE FUNCTION fn::greet($name: string) -> string { RETURN "hi " + $name };`,
  }),
  ex({
    title: "Function with PERMISSIONS and COMMENT",
    code: `defineFunction("tax", { amount: s.float() })
  .returns(s.float())
  .body(surql\`RETURN $amount * 0.21\`)
  .permissions(surql\`$auth.id != NONE\`)
  .comment("VAT helper")`,
    ddl: `DEFINE FUNCTION fn::tax($amount: float) -> float { RETURN $amount * 0.21 } PERMISSIONS $auth.id != NONE COMMENT "VAT helper";`,
  }),
];

export const group: ExampleGroup = {
  file: "06-functions.ts",
  about: "DEFINE FUNCTION — args, returns, body, permissions, comment",
  examples,
};
