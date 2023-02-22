import Head from "next/head";
import type { NextPage } from "next";
import Container from "@/components/layout";
import HorizontalSplitLayout from "@/components/layout/horizontal-split";
import { PlusOutlined, SendOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Form,
  Input,
  MenuProps,
  message,
  Tooltip,
} from "antd";
import { useRouter } from "next/router";
import Image from "next/image";
import DocumentPic from "@/public/documents.png";
import { useState } from "react";
import {
  formWithNameToQueryParser,
  IDynamicForm,
  removeFromDynamicForm,
} from "@/functions/dynamic-form.function";
import useSWR from "swr";
import { createDoc, getCategories, uploadDoc } from "@/actions";
import { fetchedCategoryParser } from "@/functions/category.function";
import { MAX_FILE_SIZE, REQUIRED_NONMULTIPLE_CATEGORY_KEY, SINGLE_VALUE_KEY } from "@/constants";
import { bytesToMB } from "@/util/size-converter";
import { DynamicFormsElement } from "@/components/documents/dynamic-form";

const UploadDocumentPage: NextPage = () => {
  const [mainForm] = Form.useForm();
  const [nameFieldForm] = Form.useForm();
  const [file, setFile] = useState<File | null>(null);

  const router = useRouter();

  const [dynamicForm, setDynamicForm] = useState<IDynamicForm>({
    1: { value: [], required: true, isSingle: true },
  });

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
          required: parsedKey === REQUIRED_NONMULTIPLE_CATEGORY_KEY,
          isSingle: parsedKey === SINGLE_VALUE_KEY
        },
      };
      setDynamicForm({ ...dynamicForm, ...newElement });
    } else {
      let newElement = {
        [parsedKey]: {
          value: [],
          required: parsedKey === REQUIRED_NONMULTIPLE_CATEGORY_KEY,
          isSingle: parsedKey === SINGLE_VALUE_KEY
        },
      };
      setDynamicForm({ ...dynamicForm, ...newElement });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      message.error(
        `File size exceeds the maximum limit of ${bytesToMB(MAX_FILE_SIZE)} MB`
      );
      return;
    }

    setFile(selectedFile);
  };

  const handleRemoveDynamicFormElement = (key: number) => {
    setDynamicForm(removeFromDynamicForm(key, dynamicForm));
  };

  const onFinishMainForm = async (values: any) => {
    if (!file) {
      message.error("Please upload file first");
      return;
    }
    if (!mainForm.getFieldValue(REQUIRED_NONMULTIPLE_CATEGORY_KEY).length) {
      message.error("Please fill the required form first");
      return;
    }
    let formData = new FormData();
    formData.append("file", file);
    const { file_path, file_type } = await uploadDoc(formData);

    let queryPayload = formWithNameToQueryParser(values, file_type, file_path);
    await createDoc(queryPayload);
    message.info("You have sucessfully created the document!");

    router.push({ pathname: "/home" });
  };

  const LeftNode = () => {
    return (
      <>
        <div className="mt-5" />
        <div className="flex flex-1 flex-col p-5 rounded-md justify-center items-center gap-5 drop-shadow-md">
          <div className="flex flex-1 flex-col max-h-[75vh] bg-white w-full rounded-md gap-5 overflow-y-auto justify-center items-center p-5">
            <Image
              src={DocumentPic.src}
              width={100}
              height={100}
              alt="document-icon"
            />
            <h1>{router.query.id}</h1>
            {file && (
              <p>
                {file.name} ({bytesToMB(file.size)} MB)
              </p>
            )}
            <Button
              type="default"
              icon={<UploadOutlined />}
              size={"large"}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "application/pdf";
                //@ts-ignore
                input.onchange = handleFileChange;
                input.click();
              }}
            >
              Upload
            </Button>
          </div>
        </div>
      </>
    );
  };

  const uploadFormRules = {
    key: 1,
    index: 0,
    rules: [{ required: true ,message: "Please input your name field" }],
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
          <Form.Item
            label="Name Field: "
            name="nameField"
            required
            tooltip="this is a required field"
            rules={[
              {
                required: true,
                message: "Please input your document type field",
              },
            ]}
          >
            <Input placeholder="Name Field" />
          </Form.Item>
          <DynamicFormsElement
            dynamicForm={dynamicForm}
            categories={fetchedCategories}
            formRule={uploadFormRules}
            onRemoveElementClick={(key: number) =>
              handleRemoveDynamicFormElement(key)
            }
            selectKey={[1]}
          />
        </Form>
        <div className="flex h-40 justify-end items-center gap-2 p-2 rounded-md drop-shadow-md">
          <Tooltip title="submit">
            <Button
              shape="circle"
              icon={<SendOutlined />}
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

export default UploadDocumentPage;
