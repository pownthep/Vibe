import React, { memo } from "react";
import { IconButton } from "@material-ui/core";
import AspectRatioRoundedIcon from "@material-ui/icons/AspectRatioRounded";
import FullscreenExitRoundedIcon from "@material-ui/icons/FullscreenExitRounded";

type Props = {
  fullscreen: boolean;
  toggleFullscreen: () => void;
  color?: string;
};

function Fullscreen({ fullscreen, toggleFullscreen, color }: Props) {
  const handleClick = () => toggleFullscreen();

  const style = { color: color ? color : "inherit" };

  const Button = (fullscreen: boolean) => {
    return fullscreen ? (
      <FullscreenExitRoundedIcon style={style} />
    ) : (
      <AspectRatioRoundedIcon style={style} />
    );
  };

  return (
    <div>
      <IconButton aria-label="toggle fullscreen mode" onClick={handleClick}>
        {Button(fullscreen)}
      </IconButton>
    </div>
  );
}

export default memo(Fullscreen);
