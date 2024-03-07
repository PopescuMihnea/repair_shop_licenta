export function isRecordString(obj: any): obj is Record<string, string> {
  if (typeof obj !== "object" || !obj || Array.isArray(obj)) {
    return false;
  }
  const typeGuard = (value: unknown): value is string =>
    typeof value === "string";

  for (const key in obj) {
    if (obj.hasOwnProperty(key) && !typeGuard(obj[key])) {
      return false;
    }
  }

  return true;
}
