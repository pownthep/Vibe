import React from "react";
import { Paper, makeStyles } from "@material-ui/core";
import Player from "./MPVPlayer";
import { atom, useRecoilValue } from "recoil";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "fixed",
    bottom: "11px",
    left: "180px",
    height: "90px",
    width: "calc(100vw - 190px)",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    overflow: "hidden",
    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
    zIndex: 1201,
    borderRadius: 8,
  },
  player: {
    height: 90,
    width: 160,
  },
}));

export type PlayerState = {
  showTitle: string;
  episodeTitle: string;
  fullscreen: boolean;
  episodeId: string;
  timePos: number;
  episodeSize: number;
};

export const playerState = atom({
  key: "playerState",
  default: {
    showTitle: "",
    episodeTitle: "",
    fullscreen: false,
    episodeId: "",
    timePos: 0,
    episodeSize: 0,
  },
});

export default function PlayerBar() {
  const state = useRecoilValue<PlayerState | null>(playerState);
  const classes = useStyles();

  return (
    <div>
      {state && (
        <Paper className={classes.root} elevation={0}>
          <Player
            showTitle={state.showTitle}
            episodeTitle={state.episodeTitle}
            fullscreen={state.fullscreen}
            episodeId={state.episodeId}
            timePos={state.timePos}
            episodeSize={state.episodeSize}
          />
        </Paper>
      )}
    </div>
  );
}
