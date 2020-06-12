import React from "react";
import { ReactMPV } from "mpv.js";
import { remote } from "electron";
import Slider from "@material-ui/core/Slider";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

const styles = (theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
});

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
    this.handleLoad = this.handleLoad.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.handleEpisodeChange = this.handleEpisodeChange.bind(this);
    this.myRef = React.createRef();
    this.banner = React.createRef();
    this.window = remote.getCurrentWindow();
  }
  async componentDidMount() {
    const id = this.props.match.params.id;
    const res = await fetch("http://localhost:9001/data/" + id);
    const json = await res.json();
    this.setState({ data: json });
    this.setState({ episodes: this.state.data.episodes });
    document.addEventListener("keydown", this.handleKeyDown, false);
    const node = this.banner.current;
    node.style.backgroundImage = `url('${this.state.data.banner}')`;
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown, false);
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
  togglePause(e) {
    e.target.blur();
    if (!this.state.duration) return;
    this.mpv.property("pause", !this.state.pause);
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
    console.log(timePos);
    this.setState({ "time-pos": timePos });
    this.mpv.property("time-pos", timePos);
  }
  handleSeekMouseUp() {
    this.seeking = false;
  }
  async handleLoad(e) {
    e.target.blur();
    const items = await remote.dialog.showOpenDialog({
      filters: [
        { name: "Videos", extensions: ["mkv", "webm", "mp4", "mov", "avi"] },
        { name: "All files", extensions: ["*"] },
      ],
    });
    if (items) {
      this.mpv.command("loadfile", items.filePaths[0]);
    }
  }

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
    this.setState({ selectedEpisode: e.target.value });
    this.mpv.command("loadfile", "http://localhost:9001/" + e.target.value);
    this.setState({ loading: true });
  }

  render() {
    const { classes } = this.props;
    return (
      <>
        <h1>{this.state.data.name}</h1>
        <div className="container">
          <img ref={this.banner} className="banner" />
          <div ref={this.myRef} className="player">
            <ReactMPV
              onReady={this.handleMPVReady}
              onPropertyChange={this.handlePropertyChange}
              onMouseDown={this.togglePause}
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
              {this.toHHMMSS(this.state["time-pos"])} /{" "}
              {this.toHHMMSS(this.state.duration)}
            </div>
          </div>
        </div>
        <div className={classes.root}>
          <FormControl className={classes.formControl}>
            <InputLabel id="demo-simple-select-label">1080p</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={this.state.selectedEpisode}
              onChange={this.handleEpisodeChange}
            >
              {this.state.episodes.map((ep, index) => (
                <MenuItem key={ep.id} value={ep.id}>
                  Episode {ep.num}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
