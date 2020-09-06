import React, { memo } from "react";
import VolumeDownRoundedIcon from "@material-ui/icons/VolumeDownRounded";
import VolumeOffRoundedIcon from "@material-ui/icons/VolumeOffRounded";
import VolumeUpRoundedIcon from "@material-ui/icons/VolumeUpRounded";
import { IconButton, Slider } from "@material-ui/core";
import { controlBtnColor } from "../utils/utils";

type Props = {
  value: number;
  setVolume: (value: number) => void;
};

function VolumeCtrl({ value, setVolume }: Props) {
  const toggleMute = (e: any) => {
    if (value > 0) setVolume(0);
    else setVolume(50);
  };

  const handleSlider = (e: any, value: any) => {
    setVolume(value);
  };

  const button = (value: number) => {
    if (value === 0) return <VolumeOffRoundedIcon style={controlBtnColor} />;
    else if (value > 0 && value < 75)
      return <VolumeDownRoundedIcon style={controlBtnColor} />;
    else return <VolumeUpRoundedIcon style={controlBtnColor} />;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        width: 130,
      }}
    >
      <IconButton aria-label="toggle mute" onClick={toggleMute}>
        {button(value)}
      </IconButton>
      <Slider
        value={value}
        onChange={handleSlider}
        aria-labelledby="discrete-slider-custom"
        step={1}
      />
    </div>
  );
}

export default memo(VolumeCtrl);
