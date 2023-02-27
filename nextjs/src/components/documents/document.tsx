import React from "react";
import {
  FileTextOutlined,
  FileSearchOutlined,
  EditOutlined,
  DownloadOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { Button, Space, Tooltip } from "antd";
import { IDoc } from "@/actions";

interface IProps {
  id: string;
  document: IDoc;
  path: string;
  type: string;
  onOpenClick: (id: string) => void;
  onDetailClick: (id: string) => void;
  onEditClick: (id: string) => void;
  onDownloadClick: (id: string) => void;
}

export default function DocumentItem({
  id,
  document,
  path,
  type,
  onOpenClick,
  onDetailClick,
  onEditClick,
  onDownloadClick,
}: IProps) {
  return (
    <div className="flex justify-around space-y-5">
      <Space className="flex-1">
        <FileTextOutlined />
        <h1>{`${document?.name}.${document?.path.split(".")[document.path.split(".").length - 1]}`}</h1>
      </Space>
      <Space>
        <Tooltip title="View PDF">
          <Button
            icon={<FolderOpenOutlined />}
            onClick={() => {
              onOpenClick(path);
            }}
          />
        </Tooltip>

        <Tooltip title="Document Details">
          <Button
            icon={<FileSearchOutlined />}
            onClick={() => {
              onDetailClick(id);
            }}
          />
        </Tooltip>
        <Tooltip title="Edit Document">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              onEditClick(id);
            }}
          />
        </Tooltip>
        <Tooltip title="Download">
          <Button
            icon={<DownloadOutlined />}
            onClick={() => {
              onDownloadClick(path);
            }}
          />
        </Tooltip>
      </Space>
    </div>
  );
}
