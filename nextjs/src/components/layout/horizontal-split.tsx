import React from "react";
import { Divider } from "antd";

interface IProps {
  leftTitle?: string;
  LeftNode?: React.FC;
  rightTitle?: string;
  RightNode?: React.FC;
}

export default function HorizontalSplitLayout({
  leftTitle,
  LeftNode,
  RightNode,
  rightTitle,
}: IProps) {
  return (
    <div className="p-5 flex h-full gap-5 animate__animated animate__fadeIn">
      <div className="flex flex-1 flex-col">
        <h1 className="text-2xl">{leftTitle}</h1>
        {LeftNode && <LeftNode />}
      </div>
      <Divider type="vertical" style={{ height: "100%" }} />
      <div className="flex flex-1 flex-col gap-5">
        <h1 className="text-2xl">{rightTitle}</h1>
        {RightNode && <RightNode />}
      </div>
    </div>
  );
}
