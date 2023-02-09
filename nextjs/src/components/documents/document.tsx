import React from "react";
import {
  FileTextOutlined,
  FileSearchOutlined,
  EditOutlined,
  DownloadOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { Button, Space } from "antd";

interface IProps {
  id: string;
  name: string;
  path: string;
  type: string;
  onOpenClick: (id: string) => void;
  onDetailClick: (id: string) => void;
  onEditClick: (id: string) => void;
  onDownloadClick: (id: string) => void;
}

export default function DocumentItem({
  id,
  name,
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
        <h1>{name}</h1>
      </Space>
      <Space>
        <Button
          icon={<FolderOpenOutlined />}
          onClick={() => {
            onOpenClick(path);
          }}
        />

        <Button
          icon={<FileSearchOutlined />}
          onClick={() => {
            onDetailClick(id);
          }}
        />
        <Button
          icon={<EditOutlined />}
          onClick={() => {
            onEditClick(id);
          }}
        />
        <Button
          icon={<DownloadOutlined />}
          onClick={() => {
            onDownloadClick(path);
          }}
        />
      </Space>
    </div>
  );
}
