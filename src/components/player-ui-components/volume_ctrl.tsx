import React, { memo } from "react";
import VolumeDownRoundedIcon from "@material-ui/icons/VolumeDownRounded";
import VolumeOffRoundedIcon from "@material-ui/icons/VolumeOffRounded";
import VolumeUpRoundedIcon from "@material-ui/icons/VolumeUpRounded";
import { IconButton, makeStyles, Slider } from "@material-ui/core";

type Props = {
  value: number;
  setVolume: (value: number) => void;
  color?: string;
};

const useStyles = makeStyles((theme) => ({
  slider: {
    color: theme.palette.type === "light" ? "inherit" : "white",
  },
}));

function VolumeCtrl({ value, setVolume, color }: Props) {
  const classes = useStyles();

  const toggleMute = (e: any) => {
    if (value > 0) setVolume(0);
    else setVolume(50);
  };

  const handleSlider = (e: any, value: any) => {
    setVolume(value);
  };

  const style = {
    color: color ? color : "inherit",
  };

  const button = (value: number) => {
    if (value === 0) return <VolumeOffRoundedIcon style={style} />;
    else if (value > 0 && value < 75)
      return <VolumeDownRoundedIcon style={style} />;
    else return <VolumeUpRoundedIcon style={style} />;
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
        classes={{ root: classes.slider }}
      />
    </div>
  );
}

export default memo(VolumeCtrl);
