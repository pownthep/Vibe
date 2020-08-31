import React from "react";
import { ReactMPV } from "mpv.js";
import Slider from "@material-ui/core/Slider";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import IconButton from "@material-ui/core/IconButton";
import Autocomplete from "@material-ui/lab/Autocomplete";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import TextField from "@material-ui/core/TextField";
import { Grow, Tooltip, Fade } from "@material-ui/core";
import AudiotrackOutlinedIcon from "@material-ui/icons/AudiotrackOutlined";
import SubtitlesOutlinedIcon from "@material-ui/icons/SubtitlesOutlined";
import FullscreenExitOutlinedIcon from "@material-ui/icons/FullscreenExitOutlined";
import FullscreenOutlinedIcon from "@material-ui/icons/FullscreenOutlined";
import VolumeDown from "@material-ui/icons/VolumeDown";
import Grid from "@material-ui/core/Grid";
import PlayArrowOutlinedIcon from "@material-ui/icons/PlayArrowOutlined";
import PauseCircleOutlineOutlinedIcon from "@material-ui/icons/PauseCircleOutlineOutlined";
import AuthenticationDialog from "./dialog";
import { authenticate } from "../utils/utils";
import ListboxComponent from "./listbox";
import FavoriteIcon from "@material-ui/icons/Favorite";
import Snackbar from "@material-ui/core/Snackbar";
import CloseIcon from "@material-ui/icons/Close";
import nprogress from "nprogress";
import "nprogress/nprogress.css";
import { VideoSeekSlider } from "./seekbar";
import GetAppRoundedIcon from "@material-ui/icons/GetAppRounded";
import clsx from "clsx";
import Drawer from "@material-ui/core/Drawer";
import ViewListIcon from "@material-ui/icons/ViewList";

const styles = () => ({
  root: {
    width: "inherit",
    position: "absolute",
    top: "65px",
  },
  unclickable: {
    pointerEvents: "none",
  },
  inline: {
    display: "inline-block",
  },
  slider: {
    width: 150,
    paddingTop: 0,
  },
  controlContainer: {
    width: "100%",
  },
  progress: {
    width: "100%",
  },
  list: {
    width: "40vw",
  },
  drawerPaper: {
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  drawer: {
    WebkitAppRegion: "no-drag",
  },
});

const itemCount = 6;

class Player extends React.PureComponent {
  constructor(props) {
    super(props);
    this.mpv = null;
    this.state = {
      pause: true,
      "time-pos": 0,
      duration: 10000,
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
      loadingData: true,
      thumbnailURL: null,
      embed: null,
      previewId: null,
      right: false,
    };
    this.myRef = React.createRef();
    this.window = window.desktop ? window.remote.getCurrentWindow() : window;
    this.bannerRef = React.createRef();
    this._isMounted = false;
  }

  toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    this.setState({ ...this.state, [anchor]: open });
  };

  addToDownload = async (id, name) => {
    const res = await fetch(
      `${window.API}add_to_download_queue?id=${id}&episodeName=${name}&serieName=${this.state.data.name}`
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
  };

  list = (anchor) => {
    const { classes } = this.props;
    return (
      <div
        className={clsx(classes.list, {
          [classes.fullList]: anchor === "top" || anchor === "bottom",
        })}
        role="presentation"
        // onClick={this.toggleDrawer(anchor, false)}
        // onKeyDown={this.toggleDrawer(anchor, false)}
      >
        <Autocomplete
          id="highlights-demo"
          style={{
            width: "100%",
            paddingLeft: 20,
            paddingRight: 20,
            WebkitAppRegion: "no-drag",
          }}
          disableListWrap
          ListboxComponent={ListboxComponent}
          value={this.state.value}
          onChange={this.handleSearch}
          options={this.state.data.episodes.map((e, i) => ({
            index: i,
            ...e,
          }))}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search"
              margin="normal"
              color="primary"
              variant="filled"
              size="small"
            />
          )}
          renderOption={(option, { inputValue }) => {
            const matches = match(option.name, inputValue);
            const parts = parse(option.name, matches);

            return (
              <div
                style={{
                  backgroundImage: `url(${
                    window.API
                      ? `${window.API}img/?url=https://lh3.googleusercontent.com/u/0/d/${option.id}`
                      : `https://lh3.googleusercontent.com/u/0/d/${option.id}`
                  })`,
                  backgroundSize: "cover",
                  width: "100%",
                  height: 150,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    backgroundColor: "rgba(0,0,0,0.3)",
                    padding: 10,
                  }}
                >
                  {parts.map((part, index) => (
                    <span
                      key={index}
                      style={{
                        fontWeight: "bold",
                        color: part.highlight ? "#11cb5f" : "inherit",
                        textDecoration: part.highlight ? "underline" : "none",
                      }}
                    >
                      {part.text}
                    </span>
                  ))}
                </div>
              </div>
            );
          }}
        />
        {this.state.episodes.map((tile, index) => (
          <Grow
            in={this.state.checked}
            timeout={300 + index * 50}
            key={tile.id}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "168px auto",
                height: 94,
                margin: 20,
              }}
            >
              <div
                style={{
                  backgroundImage: `url(${
                    window.API
                      ? `${window.API}img/?url=https://lh3.googleusercontent.com/u/0/d/${tile.id}`
                      : `https://lh3.googleusercontent.com/u/0/d/${tile.id}`
                  })`,
                  backgroundSize: "cover",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  this.handleEpisodeChange(tile.id, tile.name);
                  this.setState({
                    previewId: tile.preview,
                  });
                }}
              ></div>
              <div
                style={{ paddingLeft: 10, paddingTop: 5, position: "relative" }}
              >
                <p style={{ margin: 0, fontSize: 16, fontWeight: "bold" }}>
                  {tile.name}
                </p>
                <p style={{ marginBottom: 0, fontSize: 12 }}>
                  {this.state.data.name}
                </p>
                <div style={{ position: "absolute", right: 0, bottom: 0 }}>
                  <IconButton
                    className={classes.icon}
                    aria-label="more"
                    aria-controls="long-menu"
                    aria-haspopup="true"
                    onClick={(e) => {
                      if (window.remote) this.addToDownload(tile.id, tile.name);
                      else
                        window.open(
                          `https://drive.google.com/u/0/uc?export=download&confirm=At1O&id=${tile.id}`,
                          "_blank"
                        );
                    }}
                    classes={{
                      root: classes.actionIcons,
                    }}
                  >
                    <GetAppRoundedIcon />
                  </IconButton>
                </div>
              </div>
            </div>
          </Grow>
        ))}
      </div>
    );
  };

  handleMenu = (e) => {
    this.setState({ anchorEl: e.currentTarget });
  };

  async componentDidMount() {
    // Setup
    this._isMounted = true;
    const user = window.desktop ? await authenticate() : false;
    const id = this.props.match.params.id;

    const res = await fetch(
      "https://vibe-three.vercel.app/data/shows/" + id + ".json"
    );

    // const res = await fetch("http://localhost:3000/data/shows/" + id + ".json");

    const data = await res.json();
    const filtered = {
      ...data,
      episodes: data.episodes.filter((i) => i.size > 0),
    };
    console.log(filtered);

    // Set state if the component is mounted
    const favourites = localStorage.getItem(`favourites`)
      ? JSON.parse(localStorage.getItem(`favourites`))
      : {};
    if (this._isMounted) {
      this.setState({
        data: filtered,
        auth: user,
        episodes: [...filtered.episodes.slice(0, itemCount)],
        showProgress: false,
        favourited: favourites[id] ? true : false,
        loadingData: false,
      });
      nprogress.done();
    }

    // Setting current episode
    if (this.props.match.params.epId && this._isMounted) {
      const epId = this.props.match.params.epId;
      const episode = JSON.parse(localStorage.getItem(`history`))[epId];
      this.handleEpisodeChange(episode.id, episode.ep, episode.timePos);
    }

    if (!window.remote) {
      this.setState({ embed: this.state.episodes[0].id });
    }
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

  async componentWillMount() {
    nprogress.start();
  }

  togglePause = (e) => {
    e.target.blur();
    if (!this.state.duration) return;
    this.setState({ pause: !this.state.pause });
    this.mpv.property("pause", !this.state.pause);
  };

  handleKeyDown = (e) => {
    e.preventDefault();
    if (e.key === "f" || (e.key === "Escape" && this.state.fullscreen)) {
      this.toggleFullscreen();
    } else if (this.state.duration) {
      this.mpv.keypress(e);
    }
  };
  handleMPVReady = (mpv) => {
    this.mpv = mpv;
    const observe = mpv.observe.bind(mpv);
    ["pause", "time-pos", "duration", "eof-reached"].forEach(observe);
    this.mpv.property("hwdec", "auto");
    this.mpv.command("set", "ao-volume", this.state.volume_value);
  };
  handlePropertyChange = (name, value) => {
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
  };
  toggleFullscreen = () => {
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
  };
  handleStop = (e) => {
    e.target.blur();
    this.mpv.property("pause", true);
    this.mpv.command("stop");
    this.setState({ "time-pos": 0, duration: 0 });
  };
  handleSeekMouseDown = () => {
    this.seeking = true;
  };
  handleSeek = (newValue) => {
    if (!this.state.currentEpisode) return;
    const timePos = +newValue;
    this.setState({ "time-pos": timePos });
    this.mpv.property("time-pos", timePos);
  };
  handleSeekMouseUp = () => {
    this.seeking = false;
  };

  toHHMMSS = (s) => {
    var date = new Date(0);
    date.setSeconds(s);
    return date.toISOString().substr(11, 8);
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  handlePlay = (e) => {
    var id = e.currentTarget.id;
    this.mpv.command("loadfile", window.API + id);
  };

  handleEpisodeChange = async (id, name, timePos = 0) => {
    if (!window.remote) {
      this.setState({
        embed: id,
      });
      return;
    }
    const user = await authenticate();
    if (!user.authenticated) {
      this.setState({ auth: user });
      return;
    }
    var filePath = window.directory + "/server/downloaded/" + `${id}`;
    window.access(filePath, (err) => {
      const url =
        // "https://www.googleapis.com/drive/v3/files/" +
        // id +
        // "?alt=media&key=AIzaSyAv1WgLGclLIlhKvzIiIVOiqZqDA0EM9TI";
        `http://localhost/stream?id=${id}&episodeName=${name}&serieName=${this.state.data.name}`;
      if (err) {
        this.mpv.command("loadfile", url);
        this.setState({ thumbnailURL: url });
      } else {
        this.mpv.command("loadfile", filePath);
        this.setState({ thumbnailURL: url });
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
  };

  handleSearch = (e, nv) => {
    if (nv) {
      this.setState({
        episodes: [
          ...this.state.data.episodes.slice(nv.index, nv.index + itemCount),
        ],
      });
      this.setState({ value: nv });
    } else {
      console.log(nv);
      this.setState({
        episodes: [...this.state.data.episodes.slice(0, itemCount)],
      });
      this.setState({ value: nv });
    }
  };

  handleVolumeChange = (e, nv) => {
    this.setState({ volume_value: nv });
    this.mpv.command("set", "ao-volume", nv);
  };

  cycleSub = (e) => {
    e.target.blur();
    if (!this.state.duration) return;
    this.mpv.command("keypress", "j");
  };

  cycleAudio = (e) => {
    e.target.blur();
    if (!this.state.duration) return;
    this.mpv.command("keypress", "#");
  };

  addToHistory = (episode) => {
    const history = localStorage.getItem("history")
      ? JSON.parse(localStorage.getItem("history"))
      : {};
    localStorage.setItem(
      `history`,
      JSON.stringify({
        ...history,
        [episode.id]: episode,
      })
    );
  };

  valueLabelFormat = (value) => {
    return this.toHHMMSS(value);
  };

  handlesSnackClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    this.setState({ snackOpen: false });
  };

  addToFavourites = (e) => {
    const favourites = localStorage.getItem("favourites")
      ? JSON.parse(localStorage.getItem("favourites"))
      : {};
    localStorage.setItem(
      `favourites`,
      JSON.stringify({
        ...favourites,
        [this.state.data.id]: true,
      })
    );
    this.setState({ favourited: true });
  };

  changePage = (e, nv) => {
    var end = itemCount * nv;
    var start = end - itemCount;
    this.setState({ page: nv });
    this.setState({
      episodes: this.state.data.episodes.slice(start, end),
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <>
        {this.state.loadingData ? (
          <></>
        ) : (
          <div>
            <Fade in={this.state.checked} timeout={600}>
              <div
                className="overlay"
                style={{
                  background: `linear-gradient(to bottom, rgba(0,0,0,0), black)`,
                }}
              ></div>
            </Fade>
            <div className="container">
              <div ref={this.myRef} className="player">
                {!window.remote ? (
                  <video
                    style={{
                      width: "100%",
                      height: "inherit",
                      margin: 0,
                      padding: 0,
                    }}
                    controls
                    src={`https://www.googleapis.com/drive/v3/files/${this.state.embed}?alt=media&key=AIzaSyAv1WgLGclLIlhKvzIiIVOiqZqDA0EM9TI`}
                  ></video>
                ) : (
                  <div className="mpv-player">
                    <img
                      src={
                        window.API
                          ? window.API + "img/?url=" + this.state.data.banner
                          : this.state.data.banner
                      }
                      alt={"banner"}
                      style={{
                        width: "100%",
                        height: "inherit",
                        objectFit: "cover",
                        position: "absolute",
                        display: this.state.currentEpisode ? "none" : "block",
                      }}
                    />
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
                      <div className="controls-bot-container">
                        <div className="controls-bot">
                          <div style={{ paddingLeft: 60, paddingRight: 60 }}>
                            <VideoSeekSlider
                              max={this.state.duration}
                              currentTime={this.state["time-pos"]}
                              progress={this.state["time-pos"] + 300}
                              onChange={this.handleSeek}
                              offset={0}
                              secondsPrefix="00:00:"
                              minutesPrefix="00:"
                              thumbnailURL={
                                this.state.currentEpisode
                                  ? "https://pownthep-storage.b-cdn.net/previews/" +
                                    this.state.currentEpisode.id +
                                    ".png"
                                  : null
                              }
                            />
                          </div>
                          <div className={classes.controlContainer}>
                            <Grid
                              container
                              direction="row"
                              justify="center"
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
                              <VolumeDown />
                              <div className="volume-slider">
                                <Slider
                                  value={this.state.volume_value}
                                  onChange={this.handleVolumeChange}
                                  aria-labelledby="discrete-slider-custom"
                                  step={1}
                                />
                              </div>
                              <div className="video-time">
                                <p>
                                  {this.toHHMMSS(this.state["time-pos"])} /{" "}
                                  {this.toHHMMSS(this.state.duration)}
                                </p>
                              </div>
                              <div
                                style={{ margin: "0 auto", fontWeight: "bold" }}
                              >
                                {this.state.currentEpisode &&
                                  this.state.currentEpisode.ep}
                              </div>
                              <div className={classes.inline}>
                                <Tooltip title="View episodes">
                                  <IconButton
                                    aria-label="View episodes"
                                    onClick={this.toggleDrawer("right", true)}
                                  >
                                    <ViewListIcon />
                                  </IconButton>
                                </Tooltip>
                              </div>
                              <div className={classes.inline}>
                                <Tooltip title="Add to favourites">
                                  <IconButton
                                    aria-label="Add to favourites"
                                    disabled={this.state.favourited}
                                    onClick={this.addToFavourites}
                                  >
                                    <FavoriteIcon />
                                  </IconButton>
                                </Tooltip>
                              </div>
                              <div className={classes.inline}>
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
                                <Tooltip title="Cycle subtitle track">
                                  <IconButton
                                    aria-label="cycle subtitle track"
                                    onClick={this.cycleSub}
                                  >
                                    <SubtitlesOutlinedIcon />
                                  </IconButton>
                                </Tooltip>
                              </div>
                              <div className={classes.inline}>
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
                      </div>
                    </div>
                  </div>
                )}
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
            <div>
              {["right"].map((anchor) => (
                <React.Fragment key={anchor}>
                  <Drawer
                    anchor={anchor}
                    open={this.state[anchor]}
                    onClose={this.toggleDrawer(anchor, false)}
                    classes={{
                      root: classes.drawer,
                      paper: classes.drawerPaper,
                    }}
                  >
                    {this.list(anchor)}
                  </Drawer>
                </React.Fragment>
              ))}
            </div>
          </div>
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
