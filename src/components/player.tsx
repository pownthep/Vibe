import React from "react";
import { ReactMPV } from "mpv.js";
import { withRouter, RouteComponentProps } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import nprogress from "nprogress";
import "nprogress/nprogress.css";
import { VideoSeekSlider } from "./seekbar";
import {
  closeFullscreen,
  openFullscreen,
  getShow,
  preview,
  downloadFile,
  handleError,
  getURL,
  getLink,
} from "../utils/utils";
import { Show, Episode, HistoryItem, Favourites } from "../utils/interfaces";
import EpisodeList from "./episodelist";
import VolumeCtrl from "./volume_ctrl";
import Timer from "./timer";
import Duration from "./duration";
import Play from "./play";
import Audio from "./audio";
import Subtitle from "./subtitle";
import Fullscreen from "./fullscreen";
import FavouriteBtn from "./favourite_btn";
import { Divider, Typography } from "@material-ui/core";
import IdleTimer from "react-idle-timer";
import nProgress from "nprogress";
import SearchBar from "./search_bar";

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
  imdb: any;
  active: boolean;
  enteredPlayer: boolean;
};

class Player extends React.PureComponent<Props, State> {
  mpv: any;
  playerContainerEl: React.RefObject<HTMLDivElement>;
  window: any;
  bannerRef: React.RefObject<unknown>;
  _isMounted: boolean;
  seeking: boolean;
  idleTimer: any;
  constructor(props: Props) {
    super(props);
    this.mpv = null;
    this.idleTimer = null;
    this.state = {
      pause: true,
      "time-pos": 0,
      duration: 100,
      fullscreen: false,
      data: null!,
      episodes: [],
      volume_value: 50,
      currentEpisode: null!,
      favourited: true,
      imdb: null,
      active: true,
      enteredPlayer: false,
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
    } catch (error) {
      handleError(error);
    }
    if (this.state.data.imdb) {
      const res = await fetch(
        `http://localhost:8080/imdb?url=${this.state.data.imdb}`
      );
      const data = await res.json();
      this.setState({ imdb: data });
    }
    nprogress.done();
  }

  componentWillUnmount() {
    nProgress.configure({ parent: "body" });
    this._isMounted = false;
    nprogress.done();
    if (!this.state.currentEpisode) return;
    this.addToHistory({
      ...this.state.currentEpisode,
      timePos: this.state["time-pos"],
      currentTime: new Date().getTime(),
    });
  }

  togglePause = () => {
    if (!this.mpv) return;
    this.setState({ pause: !this.state.pause });
    this.mpv.property("pause", !this.state.pause);
  };

  handleMPVReady = (mpv: any) => {
    this.mpv = mpv;
    const observe = mpv.observe.bind(mpv);
    ["pause", "time-pos", "duration", "eof-reached"].forEach(observe);
    this.mpv.property("hwdec", "auto");
    this.mpv.command("set", "ao-volume", this.state.volume_value);
    if (this.props.match.params.epId && this._isMounted) {
      const epId = this.props.match.params.epId;
      const historyString = localStorage.getItem(`history`);
      if (historyString) {
        const episode = JSON.parse(historyString)[epId];
        this.handleEpisodeChange(episode.id, episode.ep, episode.timePos);
      }
    }
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
    if (!this.mpv) return;
    if (!this.state.currentEpisode) return;
    const timePos = newValue;
    this.setState({ "time-pos": timePos });
    this.mpv.property("time-pos", timePos);
  };

  handleEpisodeChange = (id: string, name: string, timePos: number = 0) => {
    nProgress.configure({ parent: "#player" });
    if (!this.mpv) return;
    console.log("Changing episode");
    nprogress.start();

    this.mpv.command("loadfile", getURL(id));
    console.log("loading url");
    this.setState({ "time-pos": timePos });
    this.mpv.property("time-pos", timePos);
    // window.access(filePath, (err: any) => {
    //   if (err) {
    //   } else {
    //     this.mpv.command("loadfile", filePath);
    //     console.log("loading file");
    //   }
    // });

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

  handleVolumeChange = (nv: number) => {
    if (!this.mpv) return;
    this.setState({ volume_value: nv });
    this.mpv.command("set", "ao-volume", nv);
  };

  cycleSubtitleTrack = () => {
    if (!this.mpv) return;
    this.mpv.command("keypress", "j");
  };

  cycleAudioTrack = () => {
    if (!this.mpv) return;
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

  filterEpisodes = (e: any) => {
    const text = e.target.value;
    if (text === null || text.length === 0) {
      this.setState({
        episodes: this.state.data.episodes,
      });
      return;
    }
    const filteredList = this.state.data.episodes.filter((e) =>
      e.name.toLocaleLowerCase().includes(text.toLocaleLowerCase())
    );
    this.setState({
      episodes: filteredList,
    });
  };

  handleOnAction = (event: any) => {
    console.log("user did something", event);
  };

  handleOnActive = () => {
    this.setState({ active: true });
  };

  handleOnIdle = () => {
    this.setState({ active: false });
  };

  videoStyle = { width: "100%", height: "inherit", margin: 0, padding: 0 };

  onEnterPlayer = () => {
    this.setState({
      enteredPlayer: true,
    });
  };

  onLeavePlayer = () => {
    this.setState({
      enteredPlayer: false,
    });
  };

  render() {
    return (
      <>
        {this.state.data && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60% 40%",
              paddingTop: 20,
              overflow: "auto",
              height: "100vh",
            }}
          >
            <IdleTimer
              ref={(ref) => {
                this.idleTimer = ref;
              }}
              timeout={1500}
              onActive={this.handleOnActive}
              onIdle={this.handleOnIdle}
              debounce={1000}
            />
            <div>
              <div
                ref={this.playerContainerEl}
                className="player"
                style={{ cursor: this.state.active ? "default" : "none" }}
                onMouseLeave={this.onLeavePlayer}
                onMouseEnter={this.onEnterPlayer}
                id="player"
              >
                <div className="mpv-player">
                  <ReactMPV
                    onReady={this.handleMPVReady}
                    onPropertyChange={this.handlePropertyChange}
                    onMouseDown={this.togglePause}
                  />
                  <div
                    className="controls"
                    style={{
                      opacity:
                        (this.state.enteredPlayer && this.state.active) ||
                        this.state.pause
                          ? 1
                          : 0,
                    }}
                  >
                    <div className="absolute-center">
                      <Play
                        pause={this.state.pause}
                        togglePause={this.togglePause}
                      />
                    </div>

                    <div className="controls-bot-container">
                      <div className="controls-bot">
                        <div>
                          <Grid
                            container
                            direction="row"
                            justify="center"
                            alignItems="center"
                          >
                            <VolumeCtrl
                              value={this.state.volume_value}
                              setVolume={this.handleVolumeChange}
                            />

                            <div
                              style={{
                                margin: "0 auto",
                                fontWeight: "bold",
                                width: "70%",
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <Timer seconds={this.state["time-pos"]} />
                              <div style={{ width: "85%", margin: "0 auto" }}>
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
                              <Duration seconds={this.state.duration} />
                            </div>

                            <Audio cycleAudioTrack={this.cycleAudioTrack} />

                            <Subtitle
                              cycleSubtitleTrack={this.cycleSubtitleTrack}
                            />

                            <Fullscreen
                              fullscreen={this.state.fullscreen}
                              toggleFullscreen={this.toggleFullscreen}
                            />
                          </Grid>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {this.state.currentEpisode && (
                <div style={{ textAlign: "end", margin: 5 }}>
                  <Typography variant="h6" gutterBottom>
                    {this.state.currentEpisode.ep}
                  </Typography>
                  <Divider />
                </div>
              )}
              <div className="details">
                <div className="info">
                  <img
                    src={getLink(this.state.data.poster)}
                    alt="banner"
                    className="info-poster"
                  />
                  <div className="imdb-info">
                    <h1 className="show-title">
                      {this.state.data.name}{" "}
                      <FavouriteBtn
                        favourited={this.state.favourited}
                        addToFavourites={this.addToFavourites}
                      />
                    </h1>
                    <p>
                      <span role="img" aria-label="stars">
                        ⭐
                        {this.state.imdb
                          ? this.state.imdb.rating
                          : this.state.data.rating}{" "}
                      </span>
                    </p>
                    <p>
                      {this.state.imdb &&
                        this.state.imdb.genre.map((i: string) => `${i} | `)}
                    </p>
                    <p className="show-desc">
                      {this.state.imdb
                        ? this.state.imdb.desc[0]
                        : this.state.data.desc}
                    </p>
                    <p>
                      {this.state.imdb
                        ? this.state.imdb.desc
                            .slice(1, 10)
                            .filter((i: string) => !i.includes("See full"))
                            .map((i: string) => i + "\n")
                        : this.state.data.keywords}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="episode-list">
              <div
                style={{
                  height: 55,
                  width: "100%",
                }}
              >
                <SearchBar onChangeHandler={this.filterEpisodes} />
              </div>
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
