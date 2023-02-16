import Head from "next/head";
import type { NextPage } from "next";
import Container from "@/components/layout";
import HorizontalSplitLayout from "@/components/layout/horizontal-split";
import { PlusOutlined, DeleteOutlined, SaveOutlined } from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Form,
  Input,
  MenuProps,
  message,
  Popconfirm,
  Tooltip,
} from "antd";
import { useRouter } from "next/router";
import Image from "next/image";
import DocumentPic from "@/public/documents.png";
import { useEffect, useState } from "react";
import {
  categoriesformToQueryParser,
  IDynamicForm,
  removeFromDynamicForm,
} from "@/functions/dynamic-form.function";
import { fetchedCategoryParser } from "@/functions/category.function";
import { deleteDoc, getCategories, getDocById, updateDoc } from "@/actions";
import useSWR from "swr";
import { DynamicFormsElement } from "@/components/documents/dynamic-form";
import { REQUIRED_NONMULTIPLE_CATEGORY_KEY } from "@/constants";

const DocumentEdit: NextPage = () => {
  const [mainForm] = Form.useForm();
  const router = useRouter();
  const { id } = router.query;

  const [dynamicForm, setDynamicForm] = useState<IDynamicForm>({});

  const { data: fetchedDocs } = useSWR(id ?? null, (id: number) =>
    getDocById(id)
  );

  const { data: fetchedCategories } = useSWR("/get_category_list", () =>
    getCategories()
  );

  const onDropdownMenuClick: MenuProps["onClick"] = ({ key }) => {
    let parsedKey = parseInt(key);
    if (dynamicForm[parsedKey]) {
      let newElement = {
        [parsedKey]: {
          value: [...dynamicForm[parsedKey].value, ""],
          required: parsedKey === REQUIRED_NONMULTIPLE_CATEGORY_KEY,
        },
      };
      setDynamicForm({ ...dynamicForm, ...newElement });
    } else {
      let newElement = {
        [parsedKey]: {
          value: [],
          required: parsedKey === REQUIRED_NONMULTIPLE_CATEGORY_KEY,
        },
      };
      setDynamicForm({ ...dynamicForm, ...newElement });
    }
  };
  const categories = fetchedCategoryParser(fetchedCategories);

  const applyInitialValue = () => {
    let tempElement: IDynamicForm = {};
    fetchedDocs?.categories.forEach(({ category_id, value }) => {
      if (tempElement[category_id]) {
        const newValue = {
          [category_id]: {
            value: [...tempElement[category_id].value, value],
            required: category_id === 1,
          },
        };
        tempElement = { ...tempElement, ...newValue };
      } else {
        const newValue = {
          [category_id]: { value: [value], required: category_id === 1 },
        };
        tempElement = { ...tempElement, ...newValue };
      }
    });
    setDynamicForm(tempElement);
    mainForm.setFieldValue("nameField", fetchedDocs?.name);
    //To reset default first field initialValue
    if (tempElement[1]) mainForm.setFieldValue("1", tempElement[1].value);
  };

  const resetForm = () => {
    applyInitialValue();
    for (const key in dynamicForm) {
      if (Object.prototype.hasOwnProperty.call(dynamicForm, key)) {
        dynamicForm[key].value.forEach((element, index) => {
          mainForm.setFieldValue(`${key},${index}`, element);
        });
      }
    }
  };

  useEffect(() => {
    applyInitialValue();
  }, [fetchedCategories, fetchedDocs]);

  const onFinishMainForm = async (values: any) => {
    console.log("Value ", values);
    let categoriesPayload = categoriesformToQueryParser(values, ["nameField"]);
    let queryPayload = {
      name: values["nameField"],
      categories: categoriesPayload,
    };
    const editRes = await updateDoc(queryPayload, parseInt(id as string));
    message.success("Successfully edit!");
  };

  const onConfirmDeleteDoc = async () => {
    await deleteDoc(parseInt(id as string));
    await router.push("/document");
    message.success("Successfully Delete!");
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
          <div className="flex flex-1 flex-col bg-white w-full rounded-md gap-5 justify-center items-center p-5">
            <Image
              src={DocumentPic.src}
              width={100}
              height={100}
              alt="document-icon"
            />
            <h1>{fetchedDocs?.name}</h1>
            <Popconfirm
              placement="topLeft"
              title={"Delete Document"}
              onConfirm={() => {
                onConfirmDeleteDoc();
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size={"large"}
                className="flex items-center"
              >
                Delete Document
              </Button>
            </Popconfirm>
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
            onRemoveElementClick={(key: number) => {
              handleRemoveDynamicFormElement(key);
            }}
          />
        </Form>
        <div className="flex h-40 justify-end items-center gap-2 p-2 rounded-md drop-shadow-md">
          <Tooltip title="save">
            <Button
              shape="circle"
              icon={<SaveOutlined />}
              onClick={() => {
                mainForm.submit();
              }}
            />
          </Tooltip>
          <Tooltip title="discard">
            <Button
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={() => {
                resetForm();
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
          <title>Edit Document</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
      </div>
      <Container title="Edit Document" backable>
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

export default DocumentEdit;
