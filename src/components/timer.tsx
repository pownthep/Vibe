import React, { memo } from "react";
import { toHHMMSS, controlBtnColor } from "../utils/utils";

type Props = {
  seconds: number;
};

function Timer({ seconds }: Props) {
  return <div style={controlBtnColor}>{toHHMMSS(seconds)}</div>;
}

export default memo(Timer);
