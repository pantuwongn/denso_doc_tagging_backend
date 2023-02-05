import React from "react";
import {
  FileTextOutlined,
  FileSearchOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Button, Space } from "antd";

interface IProps {
  id: string;
  name: string;
  onDetailClick: (id: string) => void;
  onEditClick: (id: string) => void;
}

export default function DocumentItem({
  id,
  name,
  onDetailClick,
  onEditClick,
}: IProps) {
  return (
    <div className="flex justify-around space-y-5">
      <Space className="flex-1">
        <FileTextOutlined />
        <h1>{name}</h1>
      </Space>
      <Space>
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
      </Space>
    </div>
  );
}
