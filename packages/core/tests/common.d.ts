import { type ZodTest } from "./utils";
import { core } from "zod";
export declare function setupSurrealTests(): {
    defineTest: (typeName: string, schemas: core.$ZodType | core.$ZodType[], expected: ZodTest) => void;
};
