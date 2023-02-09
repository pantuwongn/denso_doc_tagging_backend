import Head from "next/head";
import type { NextPage } from "next";
import Container from "@/components/layout";
import HorizontalSplitLayout from "@/components/layout/horizontal-split";
import {
  PlusOutlined,
  DownloadOutlined,
  CopyOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Form,
  MenuProps,
  message,
  QRCode,
  Tooltip,
} from "antd";
import { useRouter } from "next/router";
import {
  categoriesformToQueryParser,
  // DynamicFormsElement,
  IDynamicForm,
  mapPayloadToSearchParams,
} from "@/functions/dynamic-form.function";
import { useState } from "react";
import { getCategories } from "@/actions";
import useSWR from "swr";
import { fetchedCategoryParser } from "@/functions/category.function";
import { generateCurrentPathToQR } from "@/functions/qr-code.function";

const DocumentQRPage: NextPage = () => {
  const [mainForm] = Form.useForm();
  const router = useRouter();

  const [dynamicForm, setDynamicForm] = useState<IDynamicForm>({
    1: [""],
  });

  const { data: fetchedCategories } = useSWR("/get_category_list", () =>
    getCategories()
  );

  const [currentQRPath, setCurrentQRPath] = useState<string>("");

  const categories = fetchedCategoryParser(fetchedCategories);

  const onDropdownMenuClick: MenuProps["onClick"] = ({ key }) => {
    let parsedKey = parseInt(key);
    if (dynamicForm[parsedKey]) {
      let newElement = { [parsedKey]: [...dynamicForm[parsedKey], ""] };
      setDynamicForm({ ...dynamicForm, ...newElement });
    } else {
      let newElement = { [parsedKey]: [""] };
      setDynamicForm({ ...dynamicForm, ...newElement });
    }
  };

  const onFinishMainForm = (values: any) => {
    const queryPayload = categoriesformToQueryParser(values);
    const searchParam = mapPayloadToSearchParams(queryPayload);
    let URL = generateCurrentPathToQR(`/document?${searchParam.toString()}`);
    console.log("URL ", URL);
    setCurrentQRPath(URL);
  };

  const copyQRCodeToClipboard = () => {
    if (currentQRPath === "") {
      message.error("Please generate QR Code First!");
      return;
    }

    const canvas = document
      .getElementsByClassName("ant-qrcode")[0]
      ?.querySelector<HTMLCanvasElement>("canvas");

    if (canvas) {
      const ctx = canvas.getContext("2d");
      const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
      ctx?.putImageData(imageData, 0, 0);

      canvas.toBlob(function (blob) {
        if (!blob) {
          message.error("Blob error!");
          return;
        }
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]).then(() => {
          message.info("QRCode has been copied to clipboard!");

          const ctx = canvas.getContext("2d");
          const imageData = ctx!.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
          }
          ctx?.putImageData(imageData, 0, 0);
        });
      });
    }
  };

  const downloadQRCode = () => {
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

  const LeftNode = () => {
    return (
      <>
        <div className="mt-5" />
        <div className="flex flex-1 flex-col p-5 rounded-md justify-center items-center gap-5 drop-shadow-md">
          <div className="flex flex-1 flex-col max-h-[75vh] bg-white w-full rounded-md gap-5 overflow-y-auto justify-center items-center p-5">
            <QRCode value={currentQRPath || ""} />
            <h1>{router.query.id}</h1>
            <div className="flex flex-shrink bg-white w-full rounded-md gap-5 justify-center p-5">
              <Button
                type="default"
                icon={<CopyOutlined />}
                size={"large"}
                onClick={() => {
                  copyQRCodeToClipboard();
                }}
              >
                Copy To Clipboard
              </Button>

              <Button
                type="default"
                icon={<DownloadOutlined />}
                size={"large"}
                onClick={() => {
                  downloadQRCode();
                }}
              >
                Download
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  };

  const RightNode = () => {
    return (
      <>
        <Form
          form={mainForm}
          layout="vertical"
          className="overflow-y-auto h-[2000px] drop-shadow-md"
          onFinish={(values) => onFinishMainForm(values)}
        >
          {/* {DynamicFormsElement(dynamicForm, fetchedCategories)} */}
        </Form>
        <div className="flex h-40 justify-end items-center gap-2 p-2 rounded-md drop-shadow-md">
          <Tooltip title="qr scan">
            <Button
              shape="circle"
              icon={<QrcodeOutlined />}
              onClick={() => {
                mainForm.submit();
              }}
            />
          </Tooltip>

          <Dropdown menu={{ items: categories, onClick: onDropdownMenuClick }}>
            <Button shape="circle" icon={<PlusOutlined />} />
          </Dropdown>
        </div>
      </>
    );
  };

  return (
    <>
      <div>
        <Head>
          <title>Upload Document</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
      </div>
      <Container title="Upload Document" backable>
        <HorizontalSplitLayout
          leftTitle="Documents"
          LeftNode={LeftNode}
          rightTitle="Categories"
          RightNode={RightNode}
        />
      </Container>
    </>
  );
};

export default DocumentQRPage;
