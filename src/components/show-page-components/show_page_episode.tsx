import React from "react";
import { Episode } from "../../utils/interfaces";
import { makeStyles, IconButton } from "@material-ui/core";
import prettyBytes from "pretty-bytes";
import CloudDownloadRoundedIcon from "@material-ui/icons/CloudDownloadRounded";
import PlayCircleFilledRoundedIcon from "@material-ui/icons/PlayCircleFilledRounded";
import { getThumbnail, downloadFile } from "../../utils/api";

type Props = {
  episode: Episode;
  onClick: (
    showTitle: string,
    episodeTitle: string,
    episodeId: string,
    timePos: number,
    fullscreen: boolean,
    episodeSize: number
  ) => void;
  showTitle: string;
  index: number;
};

const useStyles = makeStyles((theme) => ({
  episode: {
    height: 90,
    width: "98%",
    display: "grid",
    gridTemplateColumns: "60px 160px 2fr repeat(3, 1fr)",
    "&:hover": {
      background: theme.palette.action.hover,
      boxShadow: theme.shadows[1],
    },
    borderRadius: 4,
  },
  thumbnail: {
    width: 160,
    height: 90,
    objectFit: "cover",
    borderRadius: 3,
  },
  marginAuto: {
    marginRight: "auto",
  },
  centered: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 10,
  },
  end: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  start: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingLeft: 30,
    paddingRight: 30,
    overflow: "hidden",
  },
}));

export default function ShowPageEpisode({
  episode,
  onClick,
  showTitle,
  index,
}: Props) {
  const classes = useStyles();

  return (
    <div className={classes.episode}>
      <p className={classes.start}>{index}</p>
      <img
        src={getThumbnail(episode.id)}
        alt="thumbnail"
        className={classes.thumbnail}
      />
      <h3 className={classes.start}>{episode.name}</h3>
      <h4 className={classes.centered}>{showTitle}</h4>
      <h5 className={classes.centered}>{prettyBytes(Number(episode.size))}</h5>
      <div className={classes.end}>
        <IconButton
          onClick={() =>
            onClick(showTitle, episode.name, episode.id, 0, false, episode.size)
          }
        >
          <PlayCircleFilledRoundedIcon />
        </IconButton>
        <IconButton
          onClick={() => downloadFile(episode.name, episode.size, episode.id)}
        >
          <CloudDownloadRoundedIcon />
        </IconButton>
      </div>
    </div>
  );
}
