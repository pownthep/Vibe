import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton, Tooltip } from "@material-ui/core";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import PauseRoundedIcon from "@material-ui/icons/PauseRounded";
import Box from "@material-ui/core/Box";
import LinearProgress from "@material-ui/core/LinearProgress";
import PlayArrowRoundedIcon from "@material-ui/icons/PlayArrowRounded";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";
import {
  openFolder,
  DL_FOLDER_PATH,
  DL_API,
  openPath,
  getImg,
  fmtName,
} from "../utils/utils";

import { useSetRecoilState } from "recoil";
import { navState } from "../App";

const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
    height: "calc(100vh - 160px)",
    overflow: "auto",
    position: "relative",
  },
}));

export default function Download() {
  const classes = useStyles();
  const [progress, setProgress] = React.useState({});

  const setNavState = useSetRecoilState(navState);

  React.useEffect(() => {
    setNavState("Downloads");
    let eventSource = new EventSource(DL_API);
    eventSource.onmessage = (e) => {
      let json = JSON.parse(e.data);
      setProgress(json);
    };
    return () => {
      eventSource.close();
    };
  }, [setNavState]);

  const handleFolderButtonClick = () => {
    openFolder(DL_FOLDER_PATH);
  };

  if (window.electron) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          paddingTop: "13px",
          overflow: "auto",
        }}
      >
        <IconButton
          edge="end"
          aria-label="pause button"
          onClick={handleFolderButtonClick}
        >
          <Tooltip title="Open folder">
            <FolderOpenIcon />
          </Tooltip>
        </IconButton>
        <List className={classes.root}>
          <Divider />
          {Object.entries(progress)
            .reverse()
            .map(([key, value]: any) => (
              <div key={value.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <img
                      src={getImg(key)}
                      alt="thumbnail"
                      width="48"
                      height="27"
                    />
                  </ListItemAvatar>
                  <ListItemText primary={(value.name)} />
                  {(value.progress / Number(value.size)) * 100 !== 100 ? (
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="pause button">
                        <Tooltip title="Pause download">
                          <PauseRoundedIcon />
                        </Tooltip>
                      </IconButton>
                    </ListItemSecondaryAction>
                  ) : (
                    <Tooltip title="Play download">
                      <IconButton
                        edge="end"
                        aria-label="play button"
                        onClick={() => {
                          openPath(`${DL_FOLDER_PATH}/${value.name}`);
                        }}
                      >
                        <PlayArrowRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItem>
                {(value.progress / Number(value.size)) * 100 === 100 ? (
                  <></>
                ) : (
                  <div className={classes.root}>
                    <LinearProgressWithLabel
                      value={(value.progress / Number(value.size)) * 100}
                    />
                  </div>
                )}
                <Divider />
              </div>
            ))}
        </List>
      </div>
    );
  } else {
    return (
      <h1 style={{ textAlign: "center", marginTop: 100 }}>
        Only available on Desktop App
      </h1>
    );
  }
}

function LinearProgressWithLabel(props: any) {
  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}
