import { SortOrder } from "mongoose";

export function isRecordSortOrder(obj: any): obj is Record<string, SortOrder> {
  if (typeof obj !== "object" || !obj || Array.isArray(obj)) {
    return false;
  }
  const typeGuard = (value: unknown): value is SortOrder =>
    value === 1 ||
    value === -1 ||
    value === "ascending" ||
    value === "asc" ||
    value === "descending" ||
    value === "desc";

  for (const key in obj) {
    if (obj.hasOwnProperty(key) && !typeGuard(obj[key])) {
      return false;
    }
  }

  return true;
}
