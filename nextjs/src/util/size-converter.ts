export const bytesToMB = (bytes: number): number => {
  return Number((bytes / 1024 / 1024).toFixed(2));
};
