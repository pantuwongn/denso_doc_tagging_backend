import Head from "next/head";
import type { NextPage } from "next";
import Container from "@/components/layout";
import HorizontalSplitLayout from "@/components/layout/horizontal-split";
import {
  QrcodeOutlined,
  EditOutlined,
  DownloadOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import {
  Button,
  MenuProps,
  message,
  Modal,
  QRCode,
  Space,
  Tag,
  Tooltip,
} from "antd";
import { useRouter } from "next/router";
import DocumentPic from "@/public/documents.png";
import Image from "next/image";
import useSWR from "swr";
import { downloadDoc, getCategories, getDocById } from "@/actions";
import { IDynamicForm } from "@/functions/dynamic-form.function";
import { useEffect, useState } from "react";
import DynamicTag, { IDynamicTag } from "@/components/documents/dynamic-tag";
import { copyQRCodeToClipboard, downloadQRCode, generateCurrentPathToQR } from "@/functions/qr-code.function";
import {
  downloadDocFromFileName,
  getFileNamefromPath,
} from "@/functions/download.function";

const DocumentDetails: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: fetchedDocs } = useSWR(id ?? null, (id: number) =>
    getDocById(id)
  );

  const { data: fetchedCategories } = useSWR("/get_category_list", () =>
    getCategories()
  );

  const [dynamicTag, setDynamicTag] = useState<IDynamicTag>({});
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let tempElement: IDynamicTag = {};
    fetchedDocs?.categories.forEach(({ category_id, value }) => {
      if (tempElement[category_id]) {
        const newValue = {
          [category_id]: [...tempElement[category_id], value],
        };
        tempElement = { ...tempElement, ...newValue };
      } else {
        const newValue = { [category_id]: [value] };
        tempElement = { ...tempElement, ...newValue };
      }
    });
    setDynamicTag(tempElement);
  }, [fetchedCategories, fetchedDocs]);

  const handleDownloadDoc = async () => {
    const fileName = getFileNamefromPath(fetchedDocs?.path || "");
    downloadDocFromFileName(fileName || "");
  };

  const gotoEditPage = (id: string) => {
    router.push(`/document/edit/${id}`);
  };

  const LeftNode = () => {
    return (
      <>
        <div className="mt-5" />
        <div className="flex flex-1 flex-col p-5 rounded-md justify-center items-center gap-5 drop-shadow-md">
          <div className="flex flex-1 flex-col flex-shrink bg-white w-full rounded-md gap-5 justify-center items-center p-5">
            <Image
              src={DocumentPic.src}
              width={100}
              height={100}
              alt="document-icon"
            />
            <h1>{fetchedDocs?.name}</h1>
            <Button
              type="default"
              icon={<DownloadOutlined />}
              size={"large"}
              onClick={() => {
                handleDownloadDoc();
              }}
            >
              Download
            </Button>
          </div>
        </div>
      </>
    );
  };

  const RightNode = () => {
    return (
      <>
        <div className="flex flex-col gap-5 overflow-y-auto h-[2000px] drop-shadow-md">
          <h1>Name: </h1>
          <div>
            <Tag>{fetchedDocs?.name}</Tag>
          </div>
          <DynamicTag dynamicTag={dynamicTag} categories={fetchedCategories} />
        </div>

        <div className="flex h-40 justify-end items-center gap-2 p-2 rounded-md drop-shadow-md">
          <Tooltip title="edit">
            <Button
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => {
                gotoEditPage(id as string);
              }}
            />
          </Tooltip>
          <Tooltip title="QR Code">
            <Button
              shape="circle"
              icon={<QrcodeOutlined />}
              onClick={() => {
                setIsQRModalOpen(true);
              }}
            />
          </Tooltip>
        </div>
      </>
    );
  };

  return (
    <>
      <div>
        <Head>
          <title>Document Details</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
      </div>
      <Container title="Document Details" backable>
        <Modal
          title="QR Code"
          open={isQRModalOpen}
          onCancel={() => {
            setIsQRModalOpen(false);
          }}
          footer={null}
          className="flex justify-center"
          cancelButtonProps={{ hidden: true }}
        >

          <div className="flex flex-1 flex-col max-h-[75vh] bg-white w-full rounded-md gap-5 overflow-y-auto justify-center items-center p-5">
            <QRCode value={generateCurrentPathToQR(router.asPath)} 
              size={256}
              icon="/denso_icon.jpg"
              color="#EE1C29"
            />
          </div>

          <div className="flex flex-shrink bg-white w-full rounded-md gap-5 justify-center p-5">
            <Button
              type="default"
              icon={<CopyOutlined />}
              size={"large"}
              onClick={() => {
                copyQRCodeToClipboard(generateCurrentPathToQR(router.asPath));
              }}
            >
                    Copy To Clipboard
            </Button>

            <Button
              type="default"
              icon={<DownloadOutlined />}
              size={"large"}
              onClick={() => {
                downloadQRCode(generateCurrentPathToQR(router.asPath));
              }}
            >
                    Download
            </Button>
          </div>
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

export default DocumentDetails;
