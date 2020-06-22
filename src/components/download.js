import React from "react";
import stringData from "./completed-series.json";
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
import RefreshIcon from "@material-ui/icons/Refresh";
import Box from "@material-ui/core/Box";
import LinearProgress from "@material-ui/core/LinearProgress";
import PropTypes from "prop-types";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: "inline",
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
  const store = new window.store();
  const downloads = store.get("downloads");
  const classes = useStyles();
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let eventSource = new EventSource("http://localhost:9001/downloading");
    eventSource.onmessage = (e) => {
      setProgress(Number(e.data))
    };
    // const timer = setInterval(() => {
    //   setProgress((prevProgress) =>
    //     prevProgress >= 100 ? 0 : prevProgress + 1
    //   );
    // }, 800);
    // return () => {
    //   clearInterval(timer);
    // };
    return () => {
      eventSource.close();
    }
  }, []);
  return (
    <>
      <h1>Download</h1>
      <List className={classes.root}>
        <ListItem alignItems="flex-start">
          <ListItemAvatar>
            <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
          </ListItemAvatar>
          <ListItemText
            primary="Oui Oui"
            secondary={
              <React.Fragment>
                <Typography
                  component="span"
                  variant="body2"
                  className={classes.inline}
                  color="textPrimary"
                >
                  Sandra Adams
                </Typography>
                {" — Do you have Paris recommendations? Have you ever…"}
              </React.Fragment>
            }
          />
          <ListItemSecondaryAction>
            <IconButton edge="end" aria-label="pause button">
              <Tooltip title="Pause download">
                <PauseCircleFilledIcon />
              </Tooltip>
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
        <div className={classes.root}>
          <LinearProgressWithLabel value={progress} />
        </div>
      </List>
      {/* {Object.entries(downloads).map(([key, value]) => (
        <div key={stringData[key].name}>
          <h2>{stringData[key].name}</h2>
          {Object.entries(value).map(([key,value]) => (
              <div key={key}>
                  <img width="100" height="60" src={`http://localhost:9001/img/?url=https://lh3.googleusercontent.com/u/0/d/${value.id}=w200-h190-p-k-nu-iv1`} alt=""/>
                  <p>{value.name}</p>
              </div>
          ))}
        </div>
      ))} */}
    </>
  );
}
