export function isErrorNode(error: any): error is NodeJS.ErrnoException {
  if (!error.code) {
    return false;
  }
  return error instanceof Error;
}
