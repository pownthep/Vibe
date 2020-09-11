import React from "react";
import { Paper, makeStyles } from "@material-ui/core";
import Player from "./MPVPlayer";
import { atom, useRecoilValue } from "recoil";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "fixed",
    bottom: "20px",
    left: "205px",
    height: "90px",
    width: "calc(100vw - 240px)",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    overflow: "hidden",
    background: theme.palette.background.default,
    zIndex: 1201,
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
  default: null,
});

export default function PlayerBar() {
  const state = useRecoilValue<PlayerState | null>(playerState);
  const classes = useStyles();

  return (
    <div>
      {state && (
        <Paper className={classes.root} elevation={3}>
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
