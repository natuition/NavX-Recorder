export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function cast(value: string, to: "number" | "boolean" | "string" | string): number | boolean | string {
  switch (to) {
    case "number":
      return Number(value);
    case "boolean":
      return value === "true";
    case "string":
    default:
      return value;
  }
}
