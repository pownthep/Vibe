import React from "react";
import { ReactMPV } from "mpv.js";
import { remote } from "electron";
import Slider from "@material-ui/core/Slider";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
// import InputLabel from "@material-ui/core/InputLabel";
// import MenuItem from "@material-ui/core/MenuItem";
// import FormControl from "@material-ui/core/FormControl";
// import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import { default as stringData } from "./completed-series.json";
// import Container from "@material-ui/core/Container";
// import MaterialTable from "material-table";
import Grid from "@material-ui/core/Grid";
import EpisodeCard from "./episode";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import ListSubheader from "@material-ui/core/ListSubheader";
import IconButton from "@material-ui/core/IconButton";
import InfoIcon from "@material-ui/icons/Info";
import Pagination from "@material-ui/lab/Pagination";
import Autocomplete from "@material-ui/lab/Autocomplete";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import TextField from "@material-ui/core/TextField";
import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled";
import { Grow } from "@material-ui/core";

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
    height: "auto",
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
      value: null,
      epList: [],
      page: 1,
      checked: true,
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
    this.window = remote.getCurrentWindow();
    this.handleSearch = this.handleSearch.bind(this);
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
    //document.addEventListener("keydown", this.handleKeyDown, false);
  }

  componentWillUnmount() {
    //document.removeEventListener("keydown", this.handleKeyDown, false);
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
    console.log(e.currentTarget.id);
    this.setState({ selectedEpisode: e.currentTarget.id });
    this.mpv.command("loadfile", "http://localhost:9001/" + e.currentTarget.id);
    this.setState({ loading: true });
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

  render() {
    const { classes } = this.props;
    return (
      <>
        <div className="title-container">
          <h1 className="anime-title">{this.state.data.name}</h1>
        </div>
        <div className="container">
          <img
            src={this.state.data.banner}
            className="banner"
            alt={this.state.data.title + "banner"}
          />
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
              <GridList cellHeight={190} className={classes.gridList} cols={4}>
                {this.state.epList.slice(0, 8).map((tile, index) => (
                  <Grow
                    in={this.state.checked}
                    timeout={300 + index * 50}
                    key={tile.id}
                  >
                    <GridListTile>
                      <img
                        src={`https://lh3.googleusercontent.com/u/0/d/${tile.id}=w200-h190-p-k-nu-iv1`}
                        alt={tile.name}
                        onError={e => (e.target.src = "https://drive-thirdparty.googleusercontent.com/128/type/video/x-matroska")}
                      />
                      <GridListTileBar
                        title={this.state.data.name}
                        subtitle={
                          <span>
                            Episode: {index + 1 + 8 * (this.state.page - 1)}
                          </span>
                        }
                        actionIcon={
                          <IconButton
                            aria-label={`Play ${tile.name}`}
                            className={classes.icon}
                            id={tile.id}
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
                count={Math.ceil(this.state.episodes.length / 8)}
                page={this.state.page}
                onChange={(e, nv) => {
                  var end = 8 * nv;
                  var start = end - 8;
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
