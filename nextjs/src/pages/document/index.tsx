import Head from "next/head";
import type { NextPage } from "next";
import Container from "@/components/layout";
import HorizontalSplitLayout from "@/components/layout/horizontal-split";
import {
  SearchOutlined,
  PlusOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Form,
  Input,
  MenuProps,
  message,
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
  queryInitialDoc,
} from "@/actions";
import { useEffect, useState } from "react";
import {
  DynamicFormsElement,
  categoriesformToQueryParser,
  IDynamicForm,
  mapPayloadToSearchParams,
} from "@/functions/dynamic-form.function";
import { fetchedCategoryParser } from "@/functions/category.function";

const DocumentPage: NextPage = () => {
  const [mainForm] = Form.useForm();
  const router = useRouter();

  const [searchedDoc, setSearchedDoc] = useState<IQueryDoc | undefined>(
    undefined
  );
  const [dynamicForm, setDynamicForm] = useState<IDynamicForm>({
    1: [""],
  });

  const { data: fetchedDocs } = useSWR(
    Object.keys(router.query).length === 0 ? "/query_doc" : null,
    () => queryInitialDoc()
  );

  const { data: fetchedCategories } = useSWR("/get_category_list", () =>
    getCategories()
  );

  const categories = fetchedCategoryParser(fetchedCategories);

  const onDropdownMenuClick: MenuProps["onClick"] = ({ key }) => {
    message.info(`Click on item ${key}`);
    let parsedKey = parseInt(key);
    if (dynamicForm[parsedKey]) {
      let newElement = { [parsedKey]: [...dynamicForm[parsedKey], ""] };
      setDynamicForm({ ...dynamicForm, ...newElement });
    } else {
      let newElement = { [parsedKey]: [""] };
      setDynamicForm({ ...dynamicForm, ...newElement });
    }
  };

  useEffect(() => {
    initialize();
    console.log("router query ", Object.keys(router.query).length);
  }, [router.query, fetchedCategories]);

  const initialize = async () => {
    if (router.query && Object.keys(router.query).length) {
      let tempElement: IDynamicForm = {};
      for (const key in router.query) {
        if (Object.prototype.hasOwnProperty.call(router.query, key)) {
          let parsedKey = parseInt(key);
          let param = (router.query[key] as string).split(",");
          let newElement = {
            [parsedKey]: param,
          };
          tempElement = { ...tempElement, ...newElement };
        }
      }
      setDynamicForm(tempElement);

      //To reset default first field initialValue
      if (tempElement[1]) mainForm.setFieldValue("1,0", tempElement[1][0]);

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
        element.forEach((e) => {
          result.push({
            category_id: parsedKey,
            value: e,
          });
        });
      }
    }
    return result;
  };

  //tempting to use this instead of parser above
  //add should router push
  //but it did not really make any sense
  //so i made the function above to parse the query then fetch instead
  const onFinishMainForm = async (values: any) => {
    console.log("Main Form Value ", values);
    let queryPayload = categoriesformToQueryParser(values);
    let data = await queryDoc(queryPayload);
    console.log("Res query", data);
    setSearchedDoc(data);

    let searchParam = mapPayloadToSearchParams(queryPayload);

    console.log(searchParam);
    router.push(`/document?${searchParam}`);
  };

  const docs = searchedDoc ?? fetchedDocs;

  const LeftNode = () => {
    return (
      <>
        <div className="mt-5" />
        <div className="flex flex-1 flex-col p-5 rounded-md justify-center items-center gap-5 drop-shadow-md">
          <div className="flex h-full flex-col max-h-[75vh] bg-white w-full rounded-md p-5 overflow-y-auto">
            {docs?.map((e) => (
              <DocumentItem
                key={e.id}
                id={`${e.id}`}
                name={e.name}
                onDetailClick={function (id: string): void {
                  router.push(`/document/details/${id}`);
                }}
                onEditClick={function (id: string): void {
                  router.push(`/document/edit/${id}`);
                }}
              />
            ))}
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
          {DynamicFormsElement(dynamicForm, fetchedCategories)}
        </Form>
        <div className="flex h-40 justify-end items-center gap-2 p-2 rounded-md drop-shadow-md">
          <Tooltip title="qr scan">
            <Button shape="circle" icon={<QrcodeOutlined />} />
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
      <Container title="Search Document" backable>
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
