import React from "react";
import { ReactMPV } from "mpv.js";
import Slider from "@material-ui/core/Slider";
import { withRouter, RouteComponentProps } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import { Tooltip } from "@material-ui/core";
import AudiotrackOutlinedIcon from "@material-ui/icons/AudiotrackOutlined";
import SubtitlesOutlinedIcon from "@material-ui/icons/SubtitlesOutlined";
import FullscreenExitOutlinedIcon from "@material-ui/icons/FullscreenExitOutlined";
import FullscreenOutlinedIcon from "@material-ui/icons/FullscreenOutlined";
import VolumeDown from "@material-ui/icons/VolumeDown";
import Grid from "@material-ui/core/Grid";
import PlayArrowOutlinedIcon from "@material-ui/icons/PlayArrowOutlined";
import PauseCircleOutlineOutlinedIcon from "@material-ui/icons/PauseCircleOutlineOutlined";
import FavoriteIcon from "@material-ui/icons/Favorite";
import nprogress from "nprogress";
import "nprogress/nprogress.css";
import { VideoSeekSlider } from "./seekbar";
import {
  closeFullscreen,
  openFullscreen,
  getShow,
  getPath,
  preview,
  downloadFile,
  handleError,
  toHHMMSS,
  getLink,
  getURL,
  stream,
} from "../utils/utils";
import { Show, Episode, HistoryItem, Favourites } from "../utils/interfaces";
import EpisodeList from "./episodelist";

type PlayerParams = {
  id: string;
  epId?: string;
};

type Props = RouteComponentProps<PlayerParams>;

type State = {
  pause: boolean;
  "time-pos": number;
  duration: number;
  fullscreen: boolean;
  data: Show;
  episodes: Array<Episode>;
  volume_value: number;
  currentEpisode: HistoryItem;
  favourited: boolean;
};

class Player extends React.PureComponent<Props, State> {
  mpv: any;
  playerContainerEl: React.RefObject<HTMLDivElement>;
  window: any;
  bannerRef: React.RefObject<unknown>;
  _isMounted: boolean;
  seeking: boolean;
  constructor(props: Props) {
    super(props);
    this.mpv = null;
    this.state = {
      pause: true,
      "time-pos": 0,
      duration: 10000,
      fullscreen: false,
      data: null!,
      episodes: [],
      volume_value: 50,
      currentEpisode: null!,
      favourited: true,
    };
    this.playerContainerEl = React.createRef();
    this.window = window.electron ? window.remote.getCurrentWindow() : window;
    this.bannerRef = React.createRef();
    this._isMounted = true;
    this.seeking = false;
  }

  addToDownload = async (id: string) => {
    nprogress.start();
    await downloadFile(id).catch((e) => {
      handleError(e);
    });
    nprogress.done();
  };

  async componentDidMount() {
    try {
      // Get show data
      const showId = this.props.match.params.id;
      const filtered = await getShow(showId);

      // Check favorite
      const favouritesString = localStorage.getItem("favourites");
      let localFavourites: { [index: string]: boolean } = {};
      if (favouritesString) localFavourites = JSON.parse(favouritesString);
      const favourited = localFavourites[showId] ? true : false;

      if (this._isMounted) {
        this.setState({
          data: filtered,
          episodes: [...filtered.episodes],
          favourited: favourited,
        });
      }

      // Setting current episode
      if (this.props.match.params.epId && this._isMounted) {
        const epId = this.props.match.params.epId;
        const historyString = localStorage.getItem(`history`);
        if (historyString) {
          const episode = JSON.parse(historyString)[epId];
          this.handleEpisodeChange(episode.id, episode.ep, episode.timePos);
        }
      }
    } catch (error) {
      handleError(error);
    }
    nprogress.done();
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

  togglePause = (e: any) => {
    e.target.blur();
    if (!this.state.duration) return;
    this.setState({ pause: !this.state.pause });
    this.mpv.property("pause", !this.state.pause);
  };

  handleMPVReady = (mpv: any) => {
    this.mpv = mpv;
    const observe = mpv.observe.bind(mpv);
    ["pause", "time-pos", "duration", "eof-reached"].forEach(observe);
    this.mpv.property("hwdec", "auto");
    this.mpv.command("set", "ao-volume", this.state.volume_value);
  };
  handlePropertyChange = (name: string, value: any) => {
    switch (name) {
      case "time-pos":
        if (!this.seeking) this.setState({ "time-pos": value });
        break;
      case "pause":
        this.setState({ pause: value });
        break;
      case "duration":
        this.setState({
          currentEpisode: {
            ...this.state.currentEpisode,
            duration: value,
          },
          duration: value,
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
        nprogress.done();
        break;
      default:
        break;
    }
  };

  toggleFullscreen = () => {
    const node = this.playerContainerEl.current;
    if (!node) return;
    if (this.state.fullscreen) {
      node.className = "player";
      closeFullscreen();
    } else {
      node.className = "webfullscreen";
      openFullscreen();
    }
    this.setState({ fullscreen: !this.state.fullscreen });
  };

  handleSeek = (newValue: number) => {
    if (!this.state.currentEpisode) return;
    const timePos = newValue;
    this.setState({ "time-pos": timePos });
    this.mpv.property("time-pos", timePos);
  };

  handleEpisodeChange = (id: string, name: string, timePos: number = 0) => {
    nprogress.start();
    if (window.electron) {
      const filePath = getPath(id);
      window.access(filePath, (err: any) => {
        if (err) {
          this.mpv.command("loadfile", getURL(id));
        } else {
          this.mpv.command("loadfile", filePath);
        }
      });
    } else document.querySelector("video")?.addEventListener("durationchange", () => nprogress.done());
    const newEpisode: HistoryItem = {
      id: id,
      ep: name,
      title: this.state.data.name,
      index: this.props.match.params.id,
      timePos: timePos,
      currentTime: new Date().getTime(),
      duration: -1,
    };

    if (!this.state.currentEpisode)
      this.setState({ currentEpisode: newEpisode });
    else {
      const previousEpisode = {
        ...this.state.currentEpisode,
        timePos: this.state["time-pos"],
      };
      this.addToHistory(previousEpisode);
      this.setState({ currentEpisode: newEpisode });
    }
  };

  handleSearch = (e: any) => {
    this.setState({
      episodes: [
        ...this.state.data.episodes.filter((i) =>
          i.name.toLowerCase().includes(e.currentTarget.value.toLowerCase())
        ),
      ],
    });
  };

  handleVolumeChange = (e: any, nv: any) => {
    this.setState({ volume_value: nv });
    this.mpv.command("set", "ao-volume", nv);
  };

  cycleSub = (e: any) => {
    e.target.blur();
    if (!this.state.duration) return;
    this.mpv.command("keypress", "j");
  };

  cycleAudio = (e: any) => {
    e.target.blur();
    if (!this.state.duration) return;
    this.mpv.command("keypress", "#");
  };

  addToHistory = (episode: HistoryItem) => {
    let localHistory: History = {} as History;
    const historyString = localStorage.getItem("history");
    if (historyString) localHistory = JSON.parse(historyString);
    localStorage.setItem(
      `history`,
      JSON.stringify({
        ...localHistory,
        [episode.id]: episode,
      })
    );
  };

  addToFavourites = () => {
    const favouritesString = localStorage.getItem("favourites");
    let localFavourites: Favourites = {} as Favourites;
    if (favouritesString) localFavourites = JSON.parse(favouritesString);
    localStorage.setItem(
      `favourites`,
      JSON.stringify({
        ...localFavourites,
        [this.state.data.id]: true,
      })
    );
    this.setState({ favourited: true });
  };

  videoStyle = { width: "100%", height: "inherit", margin: 0, padding: 0 };
  containerStyle = {
    width: "100%",
    height: "calc(100vh - 65px)",
    maxHeight: "calc(100vh - 65px)",
    marginTop: "65px",
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: "70% 30%",
  };

  render() {
    return (
      <>
        {this.state.data && (
          <div style={this.containerStyle}>
            <div ref={this.playerContainerEl} className="player">
              {!window.electron ? (
                <video
                  style={this.videoStyle}
                  controls
                  src={
                    this.state.currentEpisode &&
                    stream(this.state.currentEpisode.id)
                  }
                  autoPlay
                ></video>
              ) : (
                <div className="mpv-player">
                  <img
                    src={getLink(this.state.data.banner)}
                    alt={"banner"}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "inherit",
                      display: this.state.currentEpisode ? "none" : "block",
                      objectFit: "fill",
                    }}
                  />
                  <ReactMPV
                    onReady={this.handleMPVReady}
                    onPropertyChange={this.handlePropertyChange}
                    onMouseDown={this.togglePause}
                  />
                  <div className="controls">
                    <div
                      style={{
                        margin: "0 auto",
                        fontWeight: "bold",
                        position: "absolute",
                        fontSize: 25,
                        top: 0,
                        width: "100%",
                        textAlign: "center",
                        paddingLeft: 5,
                        paddingRight: 5,
                        background: "rgba(0,0,0,0.7)",
                      }}
                    >
                      {this.state.currentEpisode &&
                        this.state.currentEpisode.ep}
                    </div>
                    <div className="controls-bot-container">
                      <div className="controls-bot">
                        <div style={{ paddingLeft: 5, paddingRight: 5 }}>
                          <VideoSeekSlider
                            max={this.state.duration}
                            currentTime={this.state["time-pos"]}
                            progress={this.state["time-pos"] + 300}
                            onChange={this.handleSeek}
                            offset={0}
                            secondsPrefix="00:00:"
                            minutesPrefix="00:"
                            thumbnailURL={
                              this.state.currentEpisode &&
                              preview(this.state.currentEpisode.id)
                            }
                          />
                        </div>
                        <div>
                          <Grid
                            container
                            direction="row"
                            justify="center"
                            alignItems="center"
                          >
                            <div>
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
                            <div style={{ margin: "0 auto", fontWeight: "bold" }}>
                              <p>
                                {toHHMMSS(this.state["time-pos"])} /{" "}
                                {toHHMMSS(this.state.duration)}
                              </p>
                            </div>
                            <div>
                              <Tooltip title="Add to favourites">
                                <span>
                                  <IconButton
                                    aria-label="Add to favourites"
                                    disabled={this.state.favourited}
                                    onClick={this.addToFavourites}
                                  >
                                    <FavoriteIcon />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </div>
                            <div>
                              <Tooltip title="Cycle audio track">
                                <IconButton
                                  aria-label="cycle audio track"
                                  onClick={this.cycleAudio}
                                >
                                  <AudiotrackOutlinedIcon />
                                </IconButton>
                              </Tooltip>
                            </div>
                            <div>
                              <Tooltip title="Cycle subtitle track">
                                <IconButton
                                  aria-label="cycle subtitle track"
                                  onClick={this.cycleSub}
                                >
                                  <SubtitlesOutlinedIcon />
                                </IconButton>
                              </Tooltip>
                            </div>
                            <div>
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
            <div
              style={{
                height: "100vh",
                overflow: "hidden",
                position: "fixed",
                top: 0,
                right: 0,
                width: "30vw",
                zIndex: 10000000,
                borderLeft: "1px solid #212121",
                backgroundColor: "#424242",
              }}
            >
              <input
                style={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  width: "100%",
                  height: "65px",
                  backgroundColor: "black",
                  border: "none",
                  paddingLeft: "20px",
                  color: "white",
                  borderBottom: "1px solid #212121",
                }}
                placeholder="Find episode"
                onChange={this.handleSearch}
              />
              <EpisodeList
                list={this.state.episodes}
                setId={this.handleEpisodeChange}
                name={this.state.data.name}
                handleDownload={this.addToDownload}
              />
            </div>
          </div>
        )}
      </>
    );
  }
}

export default withRouter(Player);
