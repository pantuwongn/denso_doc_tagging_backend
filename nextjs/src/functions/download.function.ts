import { downloadDoc } from "@/actions";

export const downloadDocFromFileName = async (fileName: string) => {
  let resPDF = await downloadDoc(fileName);

  const link = document.createElement("a");
  const url = URL.createObjectURL(resPDF as Blob);
  link.href = url;
  link.download = `${fileName}`;
  link.click();
};

export const downloadAndOpenFromFileName = async (fileName: string) => {
  let resPDF = await downloadDoc(fileName);
  const url = URL.createObjectURL(resPDF as Blob);
  window.open(url, "_blank");
};

export const getFileNamefromPath = (path: string) => {
  const splittedName = path.split("/");
  if (!splittedName) return;
  return splittedName[splittedName?.length - 1];
};
