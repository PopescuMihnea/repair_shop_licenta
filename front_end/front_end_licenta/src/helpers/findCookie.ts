export const findCookie = (cookieName: string): string | undefined => {
  return document.cookie
    .split("; ")
    .filter((row) => row.startsWith(`${cookieName}=`))
    .map((c) => c.split("=")[1])[0];
};
