import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import ClearAllIcon from "@material-ui/icons/ClearAll";
import Tooltip from "@material-ui/core/Tooltip";
import { Link } from "react-router-dom";
import Grow from "@material-ui/core/Grow";
import Loader from "./loader";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import LinearProgress from "@material-ui/core/LinearProgress";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "80vh",
    //backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: "inline",
  },
  thumbnailCtn: {
    marginRight: 5,
    position: "relative",
    width: "100%",
    height: "inherit",
    padding: 5,
  },
  thumbnail: {
    marginRight: 5,
    width: "100%",
    height: "inherit",
  },
  playBtn: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: " translate(-50%, -50%)",
  },
  listItemContainer: {
    height: 162,
    display: "grid",
    gridTemplateColumns: "300px auto",
  },
  historyInfo: {
    width: "100%",
    height: 162,
    paddingLeft: 10,
    paddingTop: 5,
  },
  bgIcon: {
    fontSize: "4rem",
  },
}));

export default function History() {
  const store = new window.store();
  const classes = useStyles();
  const [state, setState] = useState({
    history: [],
    loading: true,
  });
  const [checked] = useState(true);
  const clearHistory = (e) => {
    if (state.history) {
      store.set("history", {});
      setState({
        history: store.get("history")
          ? Object.values(store.get("history")).sort((a, b) =>
              a.currentTime < b.currentTime ? 1 : -1
            )
          : [],
        loading: false,
      });
    }
  };

  useEffect(() => {
    setState({
      history: store.get("history")
        ? Object.values(store.get("history")).sort((a, b) =>
            a.currentTime < b.currentTime ? 1 : -1
          )
        : [],
      loading: false,
    });
  }, []);

  const Row = ({ index, style }) => {
    var rowItem = state.history[index];
    return (
      <div style={style}>
        {rowItem ? (
          <Grow in={checked} timeout={600} key={"listitem-" + rowItem.id}>
            <div className={classes.listItemContainer}>
              <div className={classes.thumbnailCtn}>
                <img
                  alt={rowItem.title}
                  className={classes.thumbnail}
                  src={`http://localhost:9001/img/?url=https://lh3.googleusercontent.com/u/0/d/${rowItem.id}`}
                  style={{ borderRadius: "5px" }}
                />
                <div className={classes.playBtn}>
                  <Tooltip title="Continue watching" placement="right-start">
                    <Link to={`/watch/${rowItem.index}/${rowItem.id}`}>
                      <IconButton edge="end" aria-label="comments">
                        <PlayCircleOutlineIcon
                          classes={{ root: classes.bgIcon }}
                        />
                      </IconButton>
                    </Link>
                  </Tooltip>
                </div>
                <LinearProgress
                  variant="determinate"
                  value={
                    rowItem.duration
                      ? (rowItem.timePos / rowItem.duration) * 100
                      : 0
                  }
                />
              </div>
              <div className={classes.historyInfo}>
                <h2 style={{ margin: 0 }}>
                  {rowItem.title +
                    " - " +
                    ` Episode: ${fmtName(rowItem.ep)} - ${toHHMMSS(
                      rowItem.timePos
                    )}`}
                </h2>
                {toDate(rowItem.currentTime)}
              </div>
            </div>
          </Grow>
        ) : (
          <></>
        )}
      </div>
    );
  };

  return (
    <>
      {state.loading ? <Loader /> : <></>}
      <h1>History</h1>
      <Tooltip title="Clear history" placement="right-start">
        <IconButton
          edge="end"
          aria-label="clear history"
          onClick={clearHistory}
        >
          <ClearAllIcon />
        </IconButton>
      </Tooltip>
      {state.history ? (
        <div className={classes.root}>
          <AutoSizer>
            {({ height, width }) => {
              return (
                <List
                  className="List"
                  height={height}
                  itemCount={state.history.length}
                  itemSize={190}
                  width={width}
                >
                  {Row}
                </List>
              );
            }}
          </AutoSizer>
        </div>
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

function fmtName(s) {
  return s
    .replace(/\[(.+?)\]/g, "")
    .replace(/\((.+?)\)/g, "")
    .replace("Copy of ", "")
    .replace(" - ", " ")
    .replace(".mkv", "")
    .trim();
}
