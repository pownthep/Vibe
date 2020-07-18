import React from "react";
import { ReactMPV } from "mpv.js";
import Slider from "@material-ui/core/Slider";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
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
import { Grow, Tooltip, Fade } from "@material-ui/core";
import AudiotrackOutlinedIcon from "@material-ui/icons/AudiotrackOutlined";
import SubtitlesOutlinedIcon from "@material-ui/icons/SubtitlesOutlined";
import FullscreenExitOutlinedIcon from "@material-ui/icons/FullscreenExitOutlined";
import FullscreenOutlinedIcon from "@material-ui/icons/FullscreenOutlined";
import VolumeDown from "@material-ui/icons/VolumeDown";
import VolumeUp from "@material-ui/icons/VolumeUp";
import Grid from "@material-ui/core/Grid";
import PlayArrowOutlinedIcon from "@material-ui/icons/PlayArrowOutlined";
import PauseCircleOutlineOutlinedIcon from "@material-ui/icons/PauseCircleOutlineOutlined";
import AuthenticationDialog from "./dialog";
import AuthenticateUser from "../utils/utils";
import stringHash from "string-hash";
import ColorThief from "colorthief";
import ListboxComponent from "./listbox";
import GetAppIcon from "@material-ui/icons/GetApp";
import FavoriteIcon from "@material-ui/icons/Favorite";
import Fab from "@material-ui/core/Fab";
import Snackbar from "@material-ui/core/Snackbar";
import CloseIcon from "@material-ui/icons/Close";
import nprogress from "nprogress";
import "nprogress/nprogress.css";

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
  listTile: {
    borderRadius: 5,
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
    paddingTop: 5,
  },
  controlContainer: {
    width: "100%",
  },
  progress: {
    width: "100%",
  },
  playBtn: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  actionIcons: {
    padding: "5px",
  },
  player: {
    borderRadius: "5px",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
});

const store = window.store ? new window.store({ watch: true }) : false;
const colorThief = new ColorThief();

class Player extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.mpv = null;
    this.state = {
      pause: true,
      "time-pos": 0,
      duration: 0,
      fullscreen: false,
      data: { episodes: [] },
      episodes: [],
      loading: false,
      value: null,
      page: 1,
      checked: true,
      volume_value: 50,
      currentEpisode: null,
      auth: null,
      progress: 0,
      showProgress: true,
      palette1: "0, 0, 0, 0",
      palette2: "0, 0, 0, 0",
      anchorEl: null,
      favourited: true,
      snackOpen: false,
      snackMessage: "Test message",
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
    this.window = window.remote ? window.remote.getCurrentWindow() : false;
    this.handleSearch = this.handleSearch.bind(this);
    this.handleVolumeChange = this.handleVolumeChange.bind(this);
    this.cycleSub = this.cycleSub.bind(this);
    this.cycleAudio = this.cycleAudio.bind(this);
    this.togglePause = this.togglePause.bind(this);
    this.addToHistory = this.addToHistory.bind(this);
    this.valueLabelFormat = this.valueLabelFormat.bind(this);
    this.bannerRef = React.createRef();
    this.handleMenu = this.handleMenu.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.addToDownload = this.addToDownload.bind(this);
    this.handlesSnackClose = this.handlesSnackClose.bind(this);
  }

  async addToDownload(id, name) {
    const res = await fetch(
      `http://localhost:9001/add_to_download_queue?id=${id}&episodeName=${name}&serieName=${this.state.data.name}`
    );
    const data = await res.json();
    if (data.error) {
      this.setState({
        snackOpen: true,
        snackMessage: "Sorry, there was an error",
      });
    } else if (data.downloaded)
      this.setState({
        snackOpen: true,
        snackMessage: "You've already downloaded this",
      });
    else this.setState({ snackOpen: true, snackMessage: "Added to download" });
  }

  handleMenu(e) {
    this.setState({ anchorEl: e.currentTarget });
  }

  async componentDidMount() {
    // Setup
    this._isMounted = true;
    const id = this.props.match.params.id;
    const user = await AuthenticateUser();

    // Set state if the component is mounted
    if (this._isMounted) {
      this.setState({
        data: window.data[id],
        auth: user,
        episodes: window.data[id].episodes.slice(0, 5),
        showProgress: false,
        favourited: store.get(`favourites.${id}`),
      });
      nprogress.done();
    }
    // Setting current episode
    if (this.props.match.params.epId && this._isMounted) {
      const epId = this.props.match.params.epId;
      const episode = store.get(`history.${epId}`);
      this.handleEpisodeChange(episode.id, episode.ep, episode.timePos);
    }
    console.log(window.data[id].episodes);
  }

  componentWillUnmount() {
    this._isMounted = false;
    nprogress.done();
    if (!this.state.currentEpisode) return;
    this.addToHistory({
      ...this.state.currentEpisode,
      timePos: this.state["time-pos"],
      currentTime: new Date().getTime(),
    });
  }

  componentWillMount() {
    nprogress.start();
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
      if (name === "duration") {
        this.setState({ loading: false });
        this.setState({
          currentEpisode: {
            ...this.state.currentEpisode,
            duration: value,
          },
        });
        if (this.state.currentEpisode.timePos > 0) {
          this.setState({ "time-pos": this.state.currentEpisode.timePos });
          this.mpv.property("time-pos", this.state.currentEpisode.timePos);

          this.setState({ pause: false });
          this.mpv.property("pause", false);
        } else {
          this.setState({ pause: false });
          this.mpv.property("pause", false);
        }
      }
      this.setState({ [name]: value });
    }
  }
  toggleFullscreen() {
    if (!this.window) return;
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
    this.setState({ "time-pos": timePos });
    this.mpv.property("time-pos", timePos);
  }
  handleSeekMouseUp() {
    this.seeking = false;
  }

  toHHMMSS(s) {
    var date = new Date(0);
    date.setSeconds(s);
    return date.toISOString().substr(11, 8);
  }

  handleClose() {
    this.setState({ anchorEl: null });
  }

  handlePlay(e) {
    var id = e.currentTarget.id;
    this.mpv.command("loadfile", "http://localhost:9001/" + id);
  }

  async handleEpisodeChange(id, name, timePos = 0) {
    const user = await AuthenticateUser();
    if (!user.authenticated) {
      this.setState({ auth: user });
      return;
    }
    var filePath =
      window.directory +
      "/server/downloaded/" +
      `[${id}]-${this.state.data.name}-${(name)}`;
    window.access(filePath, (err) => {
      if (err) {
        console.log(err);
        this.mpv.command(
          "loadfile",
          `http://localhost:9001/stream?id=${id}&episodeName=${(
            name
          )}&serieName=${this.state.data.name}`
        );
      } else {
        this.mpv.command("loadfile", filePath);
      }
    });
    this.setState({
      loading: true,
    });
    let episode = {
      id: id,
      ep: name,
      title: this.state.data.name,
      index: this.props.match.params.id,
      timePos: timePos,
      currentTime: new Date().getTime(),
    };

    if (!this.state.currentEpisode) this.setState({ currentEpisode: episode });
    else {
      let prev = {
        ...this.state.currentEpisode,
        timePos: this.state["time-pos"],
      };
      this.addToHistory(prev);
      this.setState({ currentEpisode: episode });
    }
    this.setState({ anchorEl: null });
  }

  handleSearch(e, nv) {
    if (nv) {
      this.setState({ epList: [this.state.episodes[nv.index]] });
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
      store.set("history", { [episode.id]: episode });
      return;
    }
    store.set(`history.${episode.id}`, episode);
  }

  valueLabelFormat(value) {
    return this.toHHMMSS(value);
  }

  handlesSnackClose(event, reason) {
    if (reason === "clickaway") {
      return;
    }
    this.setState({ snackOpen: false });
  }

  render() {
    const { classes } = this.props;
    return (
      <>
        <div className="title-container">
          <h1 className="anime-title">{this.state.data.name}</h1>
          <h2 className="anime-episode">
            {this.state.currentEpisode
              ? (this.state.currentEpisode.ep)
              : ""}
          </h2>
        </div>
        <Fade in={this.state.checked} timeout={600}>
          <div
            className="overlay"
            style={{
              background: `linear-gradient(to top, rgba(${this.state.palette1}),rgba(${this.state.palette2}))`,
            }}
          ></div>
        </Fade>
        <div className="container">
          <Fade in={this.state.checked} timeout={600}>
            <img
              crossOrigin={"anonymous"}
              ref={this.bannerRef}
              src={
                window.directory +
                "/server/img/" +
                stringHash(window.data[this.props.match.params.id].banner)
              }
              onError={(e) =>
                (e.target.src =
                  "http://localhost:9001/img/?url=" +
                  window.data[this.props.match.params.id].banner)
              }
              alt={this.state.data.title + "-banner"}
              className="banner"
              onLoad={(e) => {
                let img = e.currentTarget;
                let color = colorThief.getColor(img);
                this.setState({
                  palette1: `${color[0]},${color[1]},${color[2]},0`,
                  palette2: `${color[0]},${color[1]},${color[2]},1`,
                });
              }}
            />
          </Fade>
          <div ref={this.myRef} className="player">
            <Grow in={this.state.checked} timeout={1500}>
              <ReactMPV
                onReady={this.handleMPVReady}
                onPropertyChange={this.handlePropertyChange}
                onMouseDown={this.togglePause}
                className={classes.unclickable}
                style={{ opacity: this.state.currentEpisode ? 1 : 0 }}
              />
            </Grow>
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
                ValueLabelComponent={ValueLabelComponent}
              />

              <div className={classes.controlContainer}>
                <Grid
                  container
                  direction="row"
                  justify="space-evenly"
                  alignItems="center"
                >
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
                  <div className={classes.inline}>
                    <p className="video-time">
                      {this.toHHMMSS(this.state["time-pos"])} /{" "}
                      {this.toHHMMSS(this.state.duration)}
                    </p>
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
                </Grid>
              </div>
            </div>

            <div className={classes.root}>
              <Autocomplete
                id="highlights-demo"
                style={{ width: "100%" }}
                size="small"
                disableListWrap
                ListboxComponent={ListboxComponent}
                value={this.state.value}
                onChange={this.handleSearch}
                options={this.state.data.episodes.map((e, i) => ({
                  index: i,
                  name: e.name,
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
                {this.state.episodes.map((tile, index) => (
                  <Grow
                    in={this.state.checked}
                    timeout={300 + index * 50}
                    key={tile.id}
                  >
                    <GridListTile classes={{ tile: classes.listTile }}>
                      <img
                        src={`http://localhost:9001/img/?url=https://lh3.googleusercontent.com/u/0/d/${tile.id}`}
                        alt={tile.name}
                        style={{ maxHeight: 190 }}
                        onError={(e) =>
                          (e.target.src =
                            "https://drive-thirdparty.googleusercontent.com/128/type/video/x-matroska")
                        }
                      />
                      <GridListTileBar
                        title={this.state.data.name}
                        subtitle={<span>{tile.name}</span>}
                        actionIcon={
                          <>
                            <IconButton
                              aria-label={`Play ${tile.name}`}
                              className={classes.icon}
                              onClick={(e) =>
                                this.handleEpisodeChange(tile.id, tile.name)
                              }
                              classes={{
                                root: classes.actionIcons,
                              }}
                            >
                              <PlayCircleFilledIcon />
                            </IconButton>
                            <IconButton
                              aria-label={`Play ${tile.name}`}
                              className={classes.icon}
                              onClick={(e) =>
                                this.addToDownload(tile.id, tile.name)
                              }
                              classes={{
                                root: classes.actionIcons,
                              }}
                            >
                              <GetAppIcon />
                            </IconButton>
                          </>
                        }
                      />
                    </GridListTile>
                  </Grow>
                ))}
              </GridList>
              <div
                style={{
                  position: "fixed",
                  bottom: 10,
                  right: 10,
                }}
              >
                <Fab
                  aria-label="like"
                  disabled={this.state.favourited}
                  color="secondary"
                  onClick={() => {
                    store.set(`favourites.${this.state.data.id}`, true);
                    this.setState({ favourited: true });
                  }}
                >
                  <FavoriteIcon />
                </Fab>
              </div>
              <Pagination
                count={Math.ceil(this.state.data.episodes.length / 5)}
                page={this.state.page}
                onChange={(e, nv) => {
                  var end = 5 * nv;
                  var start = end - 5;
                  this.setState({ page: nv });
                  this.setState({
                    episodes: this.state.data.episodes.slice(start, end),
                  });
                }}
              />
            </div>
          </div>
        </div>
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          open={this.state.snackOpen}
          autoHideDuration={6000}
          onClose={this.handlesSnackClose}
          message={this.state.snackMessage}
          action={
            <React.Fragment>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={this.handlesSnackClose}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
        {this.state.auth ? (
          <AuthenticationDialog
            open={!this.state.auth.authenticated}
            url={this.state.auth.url}
          />
        ) : (
          <></>
        )}
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

function ValueLabelComponent(props) {
  const { children, open, value } = props;
  var date = new Date(0);
  date.setSeconds(value); // specify value for SECONDS here
  return (
    <Tooltip
      open={open}
      enterTouchDelay={0}
      placement="top"
      title={date.toISOString().substr(11, 8)}
    >
      {children}
    </Tooltip>
  );
}
