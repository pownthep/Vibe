import React, { memo } from "react";
import PlayArrowRoundedIcon from "@material-ui/icons/PlayArrowRounded";
import PauseRoundedIcon from "@material-ui/icons/PauseRounded";
import { IconButton } from "@material-ui/core";

type Props = {
  pause: boolean;
  togglePause: () => void;
};

function Play({ pause, togglePause }: Props) {
  const style = {
    fontSize: 300,
  };

  const Button = (pause: boolean) => {
    return pause ? (
      <PlayArrowRoundedIcon style={style} />
    ) : (
      <PauseRoundedIcon style={style} />
    );
  };

  const handleClick = (e: any) => togglePause();

  return (
    <IconButton aria-label="toggle pause" onClick={handleClick}>
      {Button(pause)}
    </IconButton>
  );
}
export default memo(Play);
