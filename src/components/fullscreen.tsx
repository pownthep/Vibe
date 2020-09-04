import React, { memo } from "react";
import { IconButton } from "@material-ui/core";
import AspectRatioRoundedIcon from "@material-ui/icons/AspectRatioRounded";
import FullscreenExitRoundedIcon from "@material-ui/icons/FullscreenExitRounded";

type Props = {
  fullscreen: boolean;
  toggleFullscreen: () => void;
};

function Fullscreen({ fullscreen, toggleFullscreen }: Props) {
  const handleClick = (e: any) => toggleFullscreen();

  const Button = (fullscreen: boolean) => {
    return fullscreen ? (
      <FullscreenExitRoundedIcon />
    ) : (
      <AspectRatioRoundedIcon />
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
