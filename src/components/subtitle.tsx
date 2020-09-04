import React, { memo } from "react";
import { IconButton } from "@material-ui/core";
import ClosedCaptionRoundedIcon from "@material-ui/icons/ClosedCaptionRounded";

type Props = {
  cycleSubtitleTrack: () => void;
};

function Subtitle({ cycleSubtitleTrack }: Props) {
  const handleClick = (e: any) => cycleSubtitleTrack();

  return (
    <IconButton aria-label="cycle subtitle track" onClick={handleClick}>
      <ClosedCaptionRoundedIcon />
    </IconButton>
  );
}

export default memo(Subtitle);
