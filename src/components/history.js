import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import ClearAllIcon from "@material-ui/icons/ClearAll";
import Tooltip from "@material-ui/core/Tooltip";
import { Link } from "react-router-dom";
import Grow from "@material-ui/core/Grow";
import Loader from "./loader";
const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxHeight: "75vh",
    backgroundColor: theme.palette.background.paper,
    overflow: "auto",
    position: "relative",
  },
  inline: {
    display: "inline",
  },
}));

export default function History() {
  const store = new window.store({ watch: true });
  const classes = useStyles();
  const [state, setState] = useState({
    history: {},
    loading: true,
  });
  const [checked] = useState(true);

  const clearHistory = (e) => {
    if (state.history) {
      store.delete("history", {});
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setState({ history: store.get("history"), loading: false });
    }, 500);
  }, []);

  return (
    <>
      {state.loading ? <Loader /> : <></>}
      <h1>History</h1>
      <Tooltip title="Clear history">
        <IconButton
          edge="end"
          aria-label="clear history"
          onClick={clearHistory}
        >
          <ClearAllIcon />
        </IconButton>
      </Tooltip>
      {state.history ? (
        <List className={classes.root} subheader={<li />}>
          {Object.values(state.history)
            .sort((a, b) => (a.currentTime < b.currentTime ? 1 : -1))
            .map((section, index) => (
              <Grow
                in={checked}
                timeout={300 + index * 50}
                key={"listitem-" + section.id + index}
              >
                <div>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar
                        alt={section.title}
                        src={
                          store
                            ? `http://localhost:9001/img/?url=https://lh3.googleusercontent.com/u/0/d/${section.id}=w200-h190-p-k-nu-iv1`
                            : `https://lh3.googleusercontent.com/u/0/d/${section.id}=w200-h190-p-k-nu-iv1`
                        }
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        section.title + " - " + toDate(section.currentTime)
                      }
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            className={classes.inline}
                            color="textPrimary"
                          ></Typography>
                          {` Episode: ${section.ep} - ${toHHMMSS(
                            section.timePos
                          )}`}
                        </React.Fragment>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Link to={`/watch/${section.index}/${section.id}`}>
                        <IconButton edge="end" aria-label="comments">
                          <Tooltip title="Continue watching">
                            <PlayArrowIcon />
                          </Tooltip>
                        </IconButton>
                      </Link>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index === Object.values(state.history).length - 1 ? (
                    <></>
                  ) : (
                    <Divider variant="inset" component="li" />
                  )}
                </div>
              </Grow>
            ))}
        </List>
      ) : (
        <></>
      )}
    </>
  );
}

function toHHMMSS(s) {
  var date = new Date(0);
  date.setSeconds(parseInt(s)); // specify value for SECONDS here
  return date.toISOString().substr(11, 8);
}

function toDate(s) {
  var t = new Date(s);
  return t.toLocaleString();
}
