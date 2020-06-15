import React from "react";
import { ReactMPV } from "mpv.js";
import { remote } from "electron";
import Slider from "@material-ui/core/Slider";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import { default as stringData } from "./completed-series.json";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import IconButton from "@material-ui/core/IconButton";
import Pagination from "@material-ui/lab/Pagination";
import Autocomplete from "@material-ui/lab/Autocomplete";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import TextField from "@material-ui/core/TextField";
import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled";
import { Grow, Tooltip } from "@material-ui/core";
import AudiotrackOutlinedIcon from "@material-ui/icons/AudiotrackOutlined";
import SubtitlesOutlinedIcon from "@material-ui/icons/SubtitlesOutlined";
import FullscreenExitOutlinedIcon from "@material-ui/icons/FullscreenExitOutlined";
import FullscreenOutlinedIcon from "@material-ui/icons/FullscreenOutlined";
import VolumeDown from "@material-ui/icons/VolumeDown";
import VolumeUp from "@material-ui/icons/VolumeUp";
import Grid from "@material-ui/core/Grid";
import PlayArrowOutlinedIcon from "@material-ui/icons/PlayArrowOutlined";
import PauseCircleOutlineOutlinedIcon from "@material-ui/icons/PauseCircleOutlineOutlined";
import Store from "electron-store";

const styles = (theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
  },
  gridList: {
    width: "100%",
    height: 200,
  },
  icon: {
    color: "rgba(255, 255, 255, 0.54)",
  },
  thumbnail: {
    width: 200,
    height: 190,
  },
  tile: {
    width: 200,
    height: 190,
  },
  volumeContainer: {
    width: 200,
    display: "inline-block",
    verticleAlign: "middle",
  },
  unclickable: {
    pointerEvents: "none",
  },
  audio: {
    display: "inline-block",
  },
  sub: {
    display: "inline-block",
  },
  fullscreen: {
    display: "inline-block",
  },
  inline: {
    display: "inline-block",
  },
  slider: {
    width: 150,
    paddingTop: 10,
  },
  controlContainer: {
    width: "100%",
  },
});

const store = new Store();

class Player extends React.Component {
  constructor(props) {
    super(props);
    this.mpv = null;
    this.state = {
      pause: true,
      "time-pos": 0,
      duration: 0,
      fullscreen: false,
      data: {},
      episodes: [],
      selectedEpisode: "",
      loading: false,
      value: null,
      epList: [],
      page: 1,
      checked: true,
      volume_value: 50,
      playingName: "",
      currentEpisode: null,
    };
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleMPVReady = this.handleMPVReady.bind(this);
    this.handlePropertyChange = this.handlePropertyChange.bind(this);
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
    this.togglePause = this.togglePause.bind(this);
    this.handleStop = this.handleStop.bind(this);
    this.handleSeek = this.handleSeek.bind(this);
    this.handleSeekMouseDown = this.handleSeekMouseDown.bind(this);
    this.handleSeekMouseUp = this.handleSeekMouseUp.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.handleEpisodeChange = this.handleEpisodeChange.bind(this);
    this.myRef = React.createRef();
    this.window = remote.getCurrentWindow();
    this.handleSearch = this.handleSearch.bind(this);
    this.handleVolumeChange = this.handleVolumeChange.bind(this);
    this.cycleSub = this.cycleSub.bind(this);
    this.cycleAudio = this.cycleAudio.bind(this);
    this.togglePause = this.togglePause.bind(this);
    this.addToHistory = this.addToHistory.bind(this);
  }
  async componentDidMount() {
    const id = this.props.match.params.id;
    this.setState({ data: stringData[id] });
    let arrLength = stringData[id].episodes.length;
    var tmp = [];
    if (arrLength > 0) {
      for (let i = 0; i < arrLength; i++) {
        const url = stringData[id].episodes[i];
        const res = await fetch("http://127.0.0.1:9001/list/" + url);
        const json = await res.json();
        tmp = tmp.concat(json);
        if (i === arrLength - 1) this.setState({ episodes: tmp });
      }
    }
    this.setState({ epList: this.state.episodes });
  }

  componentWillUnmount() {
    if(!this.state.currentEpisode) return;
    this.addToHistory({
      ...this.state.currentEpisode,
      currentTime: this.state["time-pos"]
    })
  }

  togglePause(e) {
    e.target.blur();
    if (!this.state.duration) return;
    this.setState({ pause: !this.state.pause });
    this.mpv.property("pause", !this.state.pause);
  }

  handleKeyDown(e) {
    e.preventDefault();
    if (e.key === "f" || (e.key === "Escape" && this.state.fullscreen)) {
      this.toggleFullscreen();
    } else if (this.state.duration) {
      this.mpv.keypress(e);
    }
  }
  handleMPVReady(mpv) {
    this.mpv = mpv;
    const observe = mpv.observe.bind(mpv);
    ["pause", "time-pos", "duration", "eof-reached"].forEach(observe);
    this.mpv.property("hwdec", "auto");
    this.mpv.command("set", "ao-volume", this.state.volume_value);
  }
  handlePropertyChange(name, value) {
    if (name === "time-pos" && this.seeking) {
      return;
    } else if (name === "eof-reached" && value) {
      this.mpv.property("time-pos", 0);
    } else {
      if (name === "duration") this.setState({ loading: false });
      this.setState({ [name]: value });
    }
  }
  toggleFullscreen() {
    const node = this.myRef.current;
    if (this.state.fullscreen) {
      node.className = "player";
      this.window.setFullScreen(false);
    } else {
      node.className = "webfullscreen";
      this.window.setFullScreen(true);
    }
    this.setState({ fullscreen: !this.state.fullscreen });
  }
  handleStop(e) {
    e.target.blur();
    this.mpv.property("pause", true);
    this.mpv.command("stop");
    this.setState({ "time-pos": 0, duration: 0 });
  }
  handleSeekMouseDown() {
    this.seeking = true;
  }
  handleSeek(e, newValue) {
    e.target.blur();
    const timePos = +newValue;
    // console.log(timePos);
    this.setState({ "time-pos": timePos });
    this.mpv.property("time-pos", timePos);
  }
  handleSeekMouseUp() {
    this.seeking = false;
  }
  // async handleLoad(e) {
  //   e.target.blur();
  //   const items = await remote.dialog.showOpenDialog({
  //     filters: [
  //       { name: "Videos", extensions: ["mkv", "webm", "mp4", "mov", "avi"] },
  //       { name: "All files", extensions: ["*"] },
  //     ],
  //   });
  //   if (items) {
  //     this.mpv.command("loadfile", items.filePaths[0]);
  //   }
  // }

  toHHMMSS(s) {
    var date = new Date(0);
    date.setSeconds(s); // specify value for SECONDS here
    return date.toISOString().substr(11, 8);
  }

  handlePlay(e) {
    var id = e.currentTarget.id;
    this.mpv.command("loadfile", "http://localhost:9001/" + id);
  }

  handleEpisodeChange(e) {
    this.mpv.command("loadfile", "http://localhost:9001/" + e.currentTarget.id);
    this.setState({
      loading: true,
      selectedEpisode: e.currentTarget.id,
      playingName: e.currentTarget.name,
    });
    let episode = {
      id: e.currentTarget.id,
      ep: e.currentTarget.name,
      title: this.state.data.name,
      index: this.props.match.params.id,
      currentTime: "",
    };

    if (!this.state.currentEpisode) this.setState({ currentEpisode: episode });
    else {
      let prev = {
        ...this.state.currentEpisode,
        currentTime: this.state["time-pos"],
      };
      this.addToHistory(prev);
      this.setState({ currentEpisode: episode });
    }
    
  }

  handleSearch(e, nv) {
    console.log(nv);
    if (nv) {
      this.setState({ epList: [this.state.episodes[nv.index]] }, function () {
        console.log(this.state.epList);
      });
      this.setState({ value: nv });
    } else {
      this.setState({ epList: this.state.episodes });
      this.setState({ value: nv });
    }
  }

  handleVolumeChange(e, nv) {
    this.setState({ volume_value: nv });
    this.mpv.command("set", "ao-volume", nv);
  }

  cycleSub(e) {
    e.target.blur();
    if (!this.state.duration) return;
    this.mpv.command("keypress", "j");
  }

  cycleAudio(e) {
    e.target.blur();
    if (!this.state.duration) return;
    this.mpv.command("keypress", "#");
  }

  addToHistory(episode) {
    if (!store.get("history") || store.get("history").length === 0) {
      store.set("history", [episode]);
      return;
    }
    let history = store.get("history");
    let newHistory = [...history, episode];
    store.set("history", newHistory);
  }

  render() {
    const { classes } = this.props;
    return (
      <>
        <div className="title-container">
          <h1 className="anime-title">{this.state.data.name}</h1>
        </div>
        <div className="container">
          <img
            src={"http://localhost:9001/img/?url=" + this.state.data.banner}
            className="banner"
            alt={this.state.data.title + "banner"}
          />
          <div ref={this.myRef} className="player">
            <ReactMPV
              onReady={this.handleMPVReady}
              onPropertyChange={this.handlePropertyChange}
              onMouseDown={this.togglePause}
              className={classes.unclickable}
            />
            <div className="loader" hidden={!this.state.loading}>
              <CircularIndeterminate />
            </div>
            <div className="controls">
              <Slider
                min={0}
                step={0.1}
                max={this.state.duration}
                value={this.state["time-pos"]}
                onChange={this.handleSeek}
                aria-labelledby="continuous-slider"
                onMouseDown={this.handleSeekMouseDown}
                onMouseUp={this.handleSeekMouseUp}
              />

              <div className={classes.controlContainer}>
                <Grid
                  container
                  direction="row"
                  justify="space-evenly"
                  alignItems="center"
                >
                  <div className={classes.inline}>
                    <p className="video-time">{this.state.playingName}</p>
                  </div>
                  <div className={classes.slider}>
                    <Grid container spacing={2}>
                      <Grid item>
                        <VolumeDown />
                      </Grid>
                      <Grid item xs>
                        <Slider
                          value={this.state.volume_value}
                          onChange={this.handleVolumeChange}
                          aria-labelledby="discrete-slider-custom"
                          step={10}
                        />
                      </Grid>
                      <Grid item>
                        <VolumeUp />
                      </Grid>
                    </Grid>
                  </div>
                  <div className={classes.audio}>
                    <Tooltip title="Cycle audio track">
                      <IconButton
                        aria-label="cycle audio track"
                        onClick={this.cycleAudio}
                      >
                        <AudiotrackOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                  <div className={classes.inline}>
                    <Tooltip title="Toggle play/pause">
                      <IconButton
                        aria-label="toggle play and pause"
                        onClick={this.togglePause}
                        size="medium"
                      >
                        {this.state.pause ? (
                          <PlayArrowOutlinedIcon fontSize="inherit" />
                        ) : (
                          <PauseCircleOutlineOutlinedIcon fontSize="inherit" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </div>
                  <div className={classes.sub}>
                    <Tooltip title="Cycle subtitle track">
                      <IconButton
                        aria-label="cycle subtitle track"
                        onClick={this.cycleSub}
                      >
                        <SubtitlesOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                  <div className={classes.fullscreen}>
                    <Tooltip title="Toggle fullscreen">
                      <IconButton
                        aria-label="cycle subtitle track"
                        onClick={this.toggleFullscreen}
                      >
                        {this.state.fullscreen ? (
                          <FullscreenExitOutlinedIcon />
                        ) : (
                          <FullscreenOutlinedIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  </div>
                  <div className={classes.inline}>
                    <p className="video-time">
                      {this.toHHMMSS(this.state["time-pos"])} /{" "}
                      {this.toHHMMSS(this.state.duration)}
                    </p>
                  </div>
                </Grid>
              </div>
            </div>

            <div className={classes.root}>
              <Autocomplete
                id="highlights-demo"
                style={{ width: "100%" }}
                size="small"
                value={this.state.value}
                onChange={this.handleSearch}
                options={this.state.episodes.map((e, i) => ({
                  index: i,
                  name: e.name.replace("Copy of ", ""),
                }))}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search"
                    margin="normal"
                    color="primary"
                    size="small"
                  />
                )}
                renderOption={(option, { inputValue }) => {
                  const matches = match(option.name, inputValue);
                  const parts = parse(option.name, matches);

                  return (
                    <div>
                      {parts.map((part, index) => (
                        <span
                          key={index}
                          style={{
                            fontWeight: part.highlight ? 700 : 400,
                            color: part.highlight ? "#f50057" : "inherit",
                          }}
                        >
                          {part.text}
                        </span>
                      ))}
                    </div>
                  );
                }}
              />
              <GridList cellHeight={190} className={classes.gridList} cols={5}>
                {this.state.epList.slice(0, 5).map((tile, index) => (
                  <Grow
                    in={this.state.checked}
                    timeout={300 + index * 50}
                    key={tile.id}
                  >
                    <GridListTile>
                      <img
                        src={`http://localhost:9001/img/?url=https://lh3.googleusercontent.com/u/0/d/${tile.id}=w200-h190-p-k-nu-iv1`}
                        alt={tile.name}
                        onError={(e) =>
                          (e.target.src =
                            "https://drive-thirdparty.googleusercontent.com/128/type/video/x-matroska")
                        }
                      />
                      <GridListTileBar
                        title={this.state.data.name}
                        subtitle={
                          <span>
                            {tile.name
                              .replace(`${this.state.data.name}`, "")
                              .replace(/\[(.+?)\]/g, "")
                              .replace(/\((.+?)\)/g, "")
                              .replace("Copy of ", "")
                              .replace(" - ", " ")
                              .replace(".mkv", "")
                              .trim()}
                          </span>
                        }
                        actionIcon={
                          <IconButton
                            aria-label={`Play ${tile.name}`}
                            className={classes.icon}
                            id={tile.id}
                            name={tile.name
                              .replace(`${this.state.data.name}`, "")
                              .replace(/\[(.+?)\]/g, "")
                              .replace(/\((.+?)\)/g, "")
                              .replace("Copy of ", "")
                              .replace(" - ", " ")
                              .replace(".mkv", "")
                              .trim()}
                            onClick={this.handleEpisodeChange}
                          >
                            <PlayCircleFilledIcon />
                          </IconButton>
                        }
                      />
                    </GridListTile>
                  </Grow>
                ))}
              </GridList>
              <Pagination
                count={Math.ceil(this.state.episodes.length / 5)}
                page={this.state.page}
                onChange={(e, nv) => {
                  var end = 5 * nv;
                  var start = end - 5;
                  this.setState({ page: nv });
                  this.setState({
                    epList: this.state.episodes.slice(start, end),
                  });
                }}
              />
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default withRouter(withStyles(styles)(Player));

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    "& > * + *": {
      marginLeft: theme.spacing(2),
    },
  },
}));

function CircularIndeterminate() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CircularProgress />
    </div>
  );
}
