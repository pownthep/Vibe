import React, { memo } from "react";
import { toHHMMSS, controlBtnColor } from "../utils/utils";

type Props = {
  seconds: number;
};

function Duration({ seconds }: Props) {
  return <div style={controlBtnColor}>{toHHMMSS(seconds)}</div>;
}

export default memo(Duration);
