import { message } from "antd";

export const generateCurrentPathToQR = (queryPath: string) => {
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "";

  const URL = `${origin}${queryPath}`;

  return URL;
};

export const copyQRCodeToClipboard = (currentQRPath: string) => {
  if (currentQRPath === "") {
    message.error("Please generate QR Code First!");
    return;
  }

  const canvas = document
    .getElementsByClassName("ant-qrcode")[0]
    ?.querySelector<HTMLCanvasElement>("canvas");

  if (canvas) {
    canvas.toBlob(function (blob) {
      if (!blob) {
        message.error("Blob error!");
        return;
      }
      const item = new ClipboardItem({ "image/png": blob });
      navigator.clipboard.write([item]).then(() => {
        message.info("QRCode has been copied to clipboard!");
      });
    });
  }
};

export const downloadQRCode = (currentQRPath : string) => {
  if (currentQRPath === "") {
    message.error("Please generate QR Code First!");
    return;
  }
  const canvas = document
    .getElementsByClassName("ant-qrcode")[0]
    ?.querySelector<HTMLCanvasElement>("canvas");

  console.log("Canvas ", canvas);

  if (canvas) {
    const url = canvas.toDataURL();
    const a = document.createElement("a");
    a.download = "QRCode.png";
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};