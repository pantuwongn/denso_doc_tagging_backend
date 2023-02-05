export const generateCurrentPathToQR = (queryPath: string) => {
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "";

  const URL = `${origin}${queryPath}`;

  return URL;
};
