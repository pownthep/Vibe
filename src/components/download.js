import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton, Tooltip } from "@material-ui/core";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import PauseCircleFilledIcon from "@material-ui/icons/PauseCircleFilled";
import Box from "@material-ui/core/Box";
import LinearProgress from "@material-ui/core/LinearProgress";
import PropTypes from "prop-types";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import Loader from "./loader";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";
const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxHeight: "85vh",
    //backgroundColor: theme.palette.background.paper,
    overflow: "auto",
    position: "relative",
  },
  inline: {
    display: "inline",
  },
  thumbnail: {
    borderRadius: 5,
    margin: 5,
  },
}));

function LinearProgressWithLabel(props) {
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

LinearProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
};

export default function Download() {
  const classes = useStyles();
  const [progress, setProgress] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!window.remote) {
      setLoading(false);
      return;
    }
    let eventSource = new EventSource(window.API + "downloading");
    eventSource.onmessage = (e) => {
      let json = JSON.parse(e.data);
      setLoading(false);
      setProgress(json);
    };
    return () => {
      eventSource.close();
    };
  }, []);
  if (window.remote) {
    return (
      <div style={{ marginTop: 55 }}>
        {loading ? <Loader /> : <></>}
        <IconButton
          edge="end"
          aria-label="pause button"
          onClick={(e) => {
            window.shell.openPath(window.directory + "/server/downloaded/");
          }}
        >
          <Tooltip title="Open folder">
            <FolderOpenIcon />
          </Tooltip>
        </IconButton>
        <List className={classes.root}>
          {Object.entries(progress)
            .reverse()
            .map(([key, value]) => (
              <div key={value.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar
                      src={`${window.API}img/?url=https://lh3.googleusercontent.com/u/0/d/${key}=w200-h190-p-k-nu-iv1`}
                      alt="thumbnail"
                    />
                  </ListItemAvatar>
                  <ListItemText primary={fmtName(value.name)} />
                  {(value.progress / Number(value.size)) * 100 !== 100 ? (
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="pause button">
                        <Tooltip title="Pause download">
                          <PauseCircleFilledIcon />
                        </Tooltip>
                      </IconButton>
                    </ListItemSecondaryAction>
                  ) : (
                    <Tooltip title="Play download">
                      <IconButton
                        edge="end"
                        aria-label="play button"
                        onClick={(e) => {
                          window.shell.openPath(
                            window.directory +
                              "/server/downloaded/" +
                              value.name
                          );
                        }}
                      >
                        <PlayCircleOutlineIcon />
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
      <h1 style={{textAlign: 'center', marginTop: 100}}>Only available on Desktop App</h1>
    )
  }
}

function fmtName(s) {
  return s
    .replace(/\[(.+?)\]/g, "")
    .replace(/\((.+?)\)/g, "")
    .replace("Copy of ", "")
    .replace("-", " ")
    .replace(".mkv", "")
    .trim();
}
