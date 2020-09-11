import React, { memo } from "react";
import { toHHMMSS } from "../../utils/utils";

type Props = {
  seconds: number;
  color?: string;
};

function Timer({ seconds, color }: Props) {
  return (
    <div
      style={{
        color: color ? color : "inherit",
      }}
    >
      {toHHMMSS(seconds)}
    </div>
  );
}

export default memo(Timer);
