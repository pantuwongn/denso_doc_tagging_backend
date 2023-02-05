import { IGetCategories } from "@/actions";
import { Tag } from "antd";
import React from "react";

export interface IDynamicTag {
  [key: number]: string[];
}

interface IProps {
  dynamicTag: IDynamicTag;
  categories?: IGetCategories;
}

export default function DynamicTag({ dynamicTag, categories }: IProps) {
  let nodes = [];
  for (const key in dynamicTag) {
    if (Object.prototype.hasOwnProperty.call(dynamicTag, key)) {
      let parsedKey = parseInt(key);
      const fields = dynamicTag[key];
      const targetCategory = categories?.find(
        (category) => category.id === parsedKey
      );
      console.log("Fields ", fields);
      nodes.push(
        <>
          <h1>{targetCategory?.name}: </h1>
          <div>
            {fields?.map((field, index) => {
              return <Tag key={index}>{field}</Tag>;
            })}
          </div>
        </>
      );
    }
  }

  return <>{nodes}</> ?? <></>;
}
