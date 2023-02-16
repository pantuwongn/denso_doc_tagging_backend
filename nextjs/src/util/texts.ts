export const truncatedText = (text: string, maxLength: number) => {
  return text.length > 20 ? `${text.substring(0, maxLength)}...` : text;
};
