import type * as core from "zod/v4/core";

const formatMap: Partial<Record<core.$ZodStringFormats, string | undefined>> = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: "", // do not set
};

export const stringProcessor: core.Processor<core.$ZodString> = (
  schema,
  ctx,
  _json,
  _params,
) => {
  const json = _json as core.JSONSchema.StringSchema;
  json.type = "string";
  const { minimum, maximum, format, patterns, contentEncoding } = schema._zod
    .bag as core.$ZodStringInternals<unknown>["bag"];
  if (typeof minimum === "number") json.minLength = minimum;
  if (typeof maximum === "number") json.maxLength = maximum;
  // custom pattern overrides format
  if (format) {
    json.format = formatMap[format as core.$ZodStringFormats] ?? format;
    if (json.format === "") delete json.format; // empty format is not valid

    // JSON Schema format: "time" requires a full time with offset or Z
    // z.iso.time() does not include timezone information, so format: "time" should never be used
    if (format === "time") {
      delete json.format;
    }
  }
  if (contentEncoding) json.contentEncoding = contentEncoding;
  if (patterns && patterns.size > 0) {
    const regexes = [...patterns];
    if (regexes.length === 1) json.pattern = regexes[0]!.source;
    else if (regexes.length > 1) {
      json.allOf = [
        ...regexes.map((regex) => ({
          ...(ctx.target === "draft-07" ||
          ctx.target === "draft-04" ||
          ctx.target === "openapi-3.0"
            ? ({ type: "string" } as const)
            : {}),
          pattern: regex.source,
        })),
      ];
    }
  }
};

export const processors = {
  stringProcessor,
};
