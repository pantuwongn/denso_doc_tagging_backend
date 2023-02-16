import React from "react";
import { Select, Tag } from "antd";
import type { CustomTagProps } from "rc-select/lib/BaseSelect";
import { truncatedText } from "@/util/texts";

const TruncateTag = (props: CustomTagProps) => {
  const { label, value, closable, onClose } = props;

  const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{ marginRight: 3 }}
    >
      {truncatedText(value, 20)}
    </Tag>
  );
};

export default TruncateTag;
