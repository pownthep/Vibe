import React, { memo } from "react";
import { IconButton } from "@material-ui/core";
import AudiotrackRoundedIcon from "@material-ui/icons/AudiotrackRounded";
import { controlBtnColor } from "../utils/utils";

type Props = {
  cycleAudioTrack: () => void;
};

function Audio({ cycleAudioTrack }: Props) {
  const handleClick = (e: any) => cycleAudioTrack();

  return (
    <IconButton aria-label="cycle audio track" onClick={handleClick}>
      <AudiotrackRoundedIcon style={controlBtnColor}/>
    </IconButton>
  );
}

export default memo(Audio);
