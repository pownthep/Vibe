import React, { memo } from "react";
import { IconButton } from "@material-ui/core";
import ClosedCaptionRoundedIcon from "@material-ui/icons/ClosedCaptionRounded";

type Props = {
  cycleSubtitleTrack: () => void;
  color?: string;
};

function Subtitle({ cycleSubtitleTrack, color }: Props) {
  const handleClick = () => cycleSubtitleTrack();

  return (
    <IconButton aria-label="cycle subtitle track" onClick={handleClick}>
      <ClosedCaptionRoundedIcon style={{ color: color ? color : "inherit" }} />
    </IconButton>
  );
}

export default memo(Subtitle);
