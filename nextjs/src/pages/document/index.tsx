import Head from "next/head";
import type { NextPage } from "next";
import Container from "@/components/layout";
import HorizontalSplitLayout from "@/components/layout/horizontal-split";
import {
  SearchOutlined,
  PlusOutlined,
  QrcodeOutlined,
  UploadOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Form,
  MenuProps,
  message,
  Modal,
  Tooltip,
} from "antd";
import DocumentItem from "@/components/documents/document";
import { useRouter } from "next/router";
import useSWR from "swr";
import {
  getCategories,
  IQueryDoc,
  IStatuslessCategory,
  queryDoc,
} from "@/actions";
import { useEffect, useRef, useState } from "react";
import {
  categoriesformToQueryParser,
  IDynamicForm,
  mapPayloadToSearchParams,
  removeFromDynamicForm,
} from "@/functions/dynamic-form.function";
import { fetchedCategoryParser } from "@/functions/category.function";
import { QrReader } from "react-qr-reader";
import { DynamicFormsElement } from "@/components/documents/dynamic-form";
import {
  downloadAndOpenFromFileName,
  downloadDocFromFileName,
  getFileNamefromPath,
} from "@/functions/download.function";
import { MdSearchOff } from "react-icons/md";
import { BrowserQRCodeReader } from "@zxing/browser";
import { SINGLE_VALUE_KEY } from "@/constants";

const DocumentPage: NextPage = () => {
  const [mainForm] = Form.useForm();
  const router = useRouter();

  const [searchedDoc, setSearchedDoc] = useState<IQueryDoc | undefined>(
    undefined
  );
  const [dynamicForm, setDynamicForm] = useState<IDynamicForm>({});

  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);

  const [qrScanResult, setQRScanResult] = useState<string>("");

  const [qrImagefile, setQRFile] = useState<File | null>(null);
  // const QRImageRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: fetchedCategories } = useSWR("/get_category_list", () =>
    getCategories()
  );

  const categories = fetchedCategoryParser(fetchedCategories);

  const onDropdownMenuClick: MenuProps["onClick"] = ({ key }) => {
    let parsedKey = parseInt(key);
    
    if (dynamicForm[parsedKey]) {
      let newElement = {
        [parsedKey]: {
          value: [...dynamicForm[parsedKey].value, ""],
          required: false,
          isSingle: parsedKey === SINGLE_VALUE_KEY,
        },
      };
      setDynamicForm({ ...dynamicForm, ...newElement });
    } else {
      let newElement = { [parsedKey]: { value: [], required: false, isSingle: parsedKey === SINGLE_VALUE_KEY } };
      setDynamicForm({ ...dynamicForm, ...newElement });
    }
  };

  useEffect(() => {
    initialize();
  }, [router.query, fetchedCategories]);

  const initialize = async () => {
    if (router.query && Object.keys(router.query).length) {
      let tempElement: IDynamicForm = {};
      for (const key in router.query) {
        if (Object.prototype.hasOwnProperty.call(router.query, key)) {
          let parsedKey = parseInt(key);
          let param = (router.query[key] as string).split(",");
          let newElement = {
            [parsedKey]: { value: param, required: false, isSingle: parsedKey === SINGLE_VALUE_KEY },
          };
          tempElement = { ...tempElement, ...newElement };
        }
      }
      setDynamicForm(tempElement);

      //To reset default first field initialValue
      if (tempElement[1]) mainForm.setFieldValue("1", tempElement[1].value);

      // for (const key in tempElement) {
      //   if (Object.prototype.hasOwnProperty.call(tempElement, key)) {
      //     const element = tempElement[key];
      //     console.log("Key ", key);
      //     console.log("Value ", element);

      //     mainForm.setFieldValue(key.toString(), element);
      //   }
      // }

      let queryPayload = dynamicFormToSearchParser(tempElement);
      let data = await queryDoc(queryPayload);
      setSearchedDoc(data);
    }
  };

  const dynamicFormToSearchParser = (dynamicForm: IDynamicForm) => {
    let result: IStatuslessCategory[] = [];
    for (const key in dynamicForm) {
      if (Object.prototype.hasOwnProperty.call(dynamicForm, key)) {
        const element = dynamicForm[key];
        const parsedKey = parseInt(key);
        element.value.forEach((e) => {
          result.push({
            category_id: parsedKey,
            value: e,
          });
        });
      }
    }
    return result;
  };

  const handleRemoveDynamicFormElement = (key: number) => {
    console.log("New dynamic form ", removeFromDynamicForm(key, dynamicForm));
    setDynamicForm(removeFromDynamicForm(key, dynamicForm));
  };

  const onFinishMainForm = async (values: any) => {
    if(!Object.keys(dynamicForm).length) {
      message.info("Please add some catogories before trying to search!")
      return
    }

    let queryPayload = categoriesformToQueryParser(values);
    let data = await queryDoc(queryPayload);
    setSearchedDoc(data);

    let searchParam = mapPayloadToSearchParams(queryPayload);

    router.push(`/document?${searchParam}`);
  };

  const handleOpen = (path: string) => {
    const fileName = getFileNamefromPath(path);
    downloadAndOpenFromFileName(fileName || "");
  };

  const handleDownloadDoc = (path: string) => {
    const fileName = getFileNamefromPath(path);
    downloadDocFromFileName(fileName || "");
  };

  const handleUploadQRCodeFile = async (file: File) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((resolve) => (img.onload = resolve));

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  };

  const handleDecodeQR = async (file: File) => {
    const codeReader = new BrowserQRCodeReader();
    const imgElm = document.createElement('img')
    imgElm.style.display = 'none'
    document.body.appendChild(imgElm)
    const imageObjUrl = URL.createObjectURL(file)
    imgElm.src = imageObjUrl
    const result = await codeReader.decodeFromImageElement(imgElm)
    document.body.removeChild(imgElm)
    URL.revokeObjectURL(imageObjUrl)
    return result.getText();
  };

  const handleQRFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      let redirectURL = await handleDecodeQR(file);
      await router.push(redirectURL);
      //Not necessary just want it to sync style with webcam scan
      //To do hacky webcam disable
      router.reload();
    } catch (error) {
      message.error("QR Scan Error ");
    }
  };

  const docs = searchedDoc;

  const LeftNode = () => {
    return (
      <>
        <div className="mt-5" />
        <div className="flex flex-1 flex-col p-5 rounded-md justify-center items-center gap-5 drop-shadow-md">
          <div className="flex h-full flex-col max-h-[75vh] bg-white w-full rounded-md p-5 overflow-y-auto">
            {docs?.length ? (
              docs?.map((e) => (
                <DocumentItem
                  key={e.id}
                  id={`${e.id}`}
                  name={e.name}
                  path={e.path}
                  type={e.type}
                  onOpenClick={(path: string) => {
                    handleOpen(path);
                  }}
                  onDetailClick={(id: string) => {
                    router.push(`/document/details/${id}`);
                  }}
                  onEditClick={(id: string) => {
                    router.push(`/document/edit/${id}`);
                  }}
                  onDownloadClick={(path: string) => {
                    handleDownloadDoc(path);
                  }}
                />
              ))
            ) : (
              <div className="w-full h-full flex flex-col justify-center items-center">
                <MdSearchOff className="text-2xl text-gray-500" />
                <h1 className="text-2xl text-gray-500">No document found.</h1>
              </div>
            )}
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
          onFinish={(values: any) => onFinishMainForm(values)}
          className="overflow-y-auto h-[2000px] drop-shadow-md"
        >
          <DynamicFormsElement
            dynamicForm={dynamicForm}
            categories={fetchedCategories}
            onRemoveElementClick={(key: number) =>
              handleRemoveDynamicFormElement(key)
            }
          />
        </Form>
        <div className="flex h-40 justify-end items-center gap-2 p-2 rounded-md drop-shadow-md">
          <Tooltip title="QR Scan">
            <Button
              shape="circle"
              icon={<QrcodeOutlined />}
              onClick={() => {
                setIsQRModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="search">
            <Button
              shape="circle"
              icon={<SearchOutlined />}
              onClick={() => mainForm.submit()}
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
          <title>Search Document</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
      </div>
      <Container title="Search Document" backRoute="/home" backable>
        <Modal
          title="QR Code Scanner"
          open={isQRModalOpen}
          onOk={() => setIsQRModalOpen(false)}
          onCancel={() => setIsQRModalOpen(false)}
          footer={[
            <Button
              type="default"
              icon={<FileImageOutlined />}
              size={"large"}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "images/*";
                //@ts-ignore
                input.onchange = handleQRFileChange;
                input.click();
              }}
              key="upload"
            >
              Choose QR Image
            </Button>
          ]}
        >
          <QrReader
            onResult={async (result, error) => {
              if (!!result) {
                setQRScanResult(result?.getText());
                console.log("QR Result: ", result?.getText());
                await router.push(result.getText());
                //Hacky disable webcam
                router.reload();
              }

              if (!!error) {
                console.info(error);
              }
            }}
            constraints={{ facingMode: "environment" }}
          />
          {/* {qrImageSrc && <img src={qrImageSrc} alt="QR code" />} */}

          {/* If redirect is ok will remove these */}
          {/* {qrScanResult !== "" && (
            <Link href={qrScanResult}>
              <Button>Go To QR Path!</Button>
            </Link>
          )} */}
        </Modal>

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

export default DocumentPage;
