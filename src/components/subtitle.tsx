import React, { memo } from "react";
import { IconButton } from "@material-ui/core";
import ClosedCaptionRoundedIcon from "@material-ui/icons/ClosedCaptionRounded";
import { controlBtnColor } from "../utils/utils";

type Props = {
  cycleSubtitleTrack: () => void;
};

function Subtitle({ cycleSubtitleTrack }: Props) {
  const handleClick = (e: any) => cycleSubtitleTrack();

  return (
    <IconButton aria-label="cycle subtitle track" onClick={handleClick}>
      <ClosedCaptionRoundedIcon style={controlBtnColor}/>
    </IconButton>
  );
}

export default memo(Subtitle);
