import React, { memo } from "react";
import { IconButton } from "@material-ui/core";
import AudiotrackRoundedIcon from "@material-ui/icons/AudiotrackRounded";

type Props = {
  cycleAudioTrack: () => void;
  color?: string;
};

function Audio({ cycleAudioTrack, color }: Props) {
  const handleClick = () => cycleAudioTrack();

  return (
    <IconButton aria-label="cycle audio track" onClick={handleClick}>
      <AudiotrackRoundedIcon style={{ color: color ? color : "inherit" }} />
    </IconButton>
  );
}

export default memo(Audio);
