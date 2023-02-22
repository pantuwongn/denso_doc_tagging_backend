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
  QRCode,
  Tooltip,
} from "antd";
import { useRouter } from "next/router";
import {
  categoriesformToQueryParser,
  IDynamicForm,
  mapPayloadToSearchParams,
  removeFromDynamicForm,
} from "@/functions/dynamic-form.function";
import { useState } from "react";
import { getCategories } from "@/actions";
import useSWR from "swr";
import { fetchedCategoryParser } from "@/functions/category.function";
import { copyQRCodeToClipboard, downloadQRCode, generateCurrentPathToQR } from "@/functions/qr-code.function";
import { DynamicFormsElement } from "@/components/documents/dynamic-form";
import { BsLayoutTextWindowReverse } from "react-icons/bs";
import { SINGLE_VALUE_KEY } from "@/constants";

const DocumentQRPage: NextPage = () => {
  const [mainForm] = Form.useForm();
  const router = useRouter();

  const [dynamicForm, setDynamicForm] = useState<IDynamicForm>({});

  const { data: fetchedCategories } = useSWR("/get_category_list", () =>
    getCategories()
  );

  const [currentQRPath, setCurrentQRPath] = useState<string>("");

  const categories = fetchedCategoryParser(fetchedCategories);

  const onDropdownMenuClick: MenuProps["onClick"] = ({ key }) => {
    let parsedKey = parseInt(key);
    if (dynamicForm[parsedKey]) {
      let newElement = {
        [parsedKey]: {
          value: [...dynamicForm[parsedKey].value, ""],
          required: false,
          isSingle: parsedKey === SINGLE_VALUE_KEY
        },
      };
      setDynamicForm({ ...dynamicForm, ...newElement });
    } else {
      let newElement = { [parsedKey]: { value: [], required: false, isSingle: parsedKey === SINGLE_VALUE_KEY } };
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

  const handleRemoveDynamicFormElement = (key: number) => {
    console.log("New dynamic form ", removeFromDynamicForm(key, dynamicForm));
    setDynamicForm(removeFromDynamicForm(key, dynamicForm));
  };

  const LeftNode = () => {
    return (
      <>
        <div className="mt-5" />
        <div className="flex flex-1 flex-col p-5 rounded-md justify-center items-center gap-5 drop-shadow-md">
          <div className="flex flex-1 flex-col max-h-[75vh] bg-white w-full rounded-md gap-5 overflow-y-auto justify-center items-center p-5">
            {Object.keys(dynamicForm).length > 0 && (
              <QRCode value={currentQRPath || ""}
                size={256}
                icon="/denso_icon.jpg"
                color="#EE1C29"
              />
            )}
            <h1>{router.query.id}</h1>
            <div className="flex flex-shrink bg-white w-full rounded-md gap-5 justify-center p-5">
              {Object.keys(dynamicForm).length ? (
                <>
                  <Button
                    type="default"
                    icon={<CopyOutlined />}
                    size={"large"}
                    onClick={() => {
                      copyQRCodeToClipboard(currentQRPath);
                    }}
                  >
                    Copy To Clipboard
                  </Button>

                  <Button
                    type="default"
                    icon={<DownloadOutlined />}
                    size={"large"}
                    onClick={() => {
                      downloadQRCode(currentQRPath);
                    }}
                  >
                    Download
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <BsLayoutTextWindowReverse className="text-2xl mb-2"/>
                  <h1 className="text-xl">Please specify categories for generating QR Code</h1>
                </div>
              )}
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
          <DynamicFormsElement
            dynamicForm={dynamicForm}
            categories={fetchedCategories}
            onRemoveElementClick={(key: number) =>
              handleRemoveDynamicFormElement(key)
            }
          />
        </Form>
        <div className="flex h-40 justify-end items-center gap-2 p-2 rounded-md drop-shadow-md">
          <Tooltip title="Generate QR">
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
