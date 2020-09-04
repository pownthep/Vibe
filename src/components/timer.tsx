import React, { memo } from "react";
import { toHHMMSS } from "../utils/utils";

type Props = {
  seconds: number;
};

function Timer({ seconds }: Props) {
  return <>{toHHMMSS(seconds)}</>;
}

export default memo(Timer);
