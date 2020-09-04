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
  getPath,
  preview,
  downloadFile,
  handleError,
  getURL,
  stream,
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
import { Divider, Button } from "@material-ui/core";
import { Overlay } from "../utils/styles";
import SearchRoundedIcon from "@material-ui/icons/SearchRounded";
import Draggable from "react-draggable";

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
      duration: 100,
      fullscreen: false,
      data: null!,
      episodes: [],
      volume_value: 50,
      currentEpisode: null!,
      favourited: true,
      imdb: null,
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
        `http://localhost/imdb?url=${this.state.data.imdb}`
      );
      const data = await res.json();
      this.setState({ imdb: data });
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

  togglePause = () => {
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
    if (!this.state.currentEpisode) return;
    const timePos = newValue;
    this.setState({ "time-pos": timePos });
    this.mpv.property("time-pos", timePos);
  };

  handleEpisodeChange = (id: string, name: string, timePos: number = 0) => {
    console.log("Changing episode");
    nprogress.start();

    if (window.electron) {
      const filePath = getPath(id);
      window.access(filePath, (err: any) => {
        if (err) {
          this.mpv.command("loadfile", getURL(id));
        } else {
          this.mpv.command("loadfile", filePath);
        }
        this.setState({ "time-pos": timePos });
        this.mpv.property("time-pos", timePos);
      });
    }

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
    this.setState({ volume_value: nv });
    this.mpv.command("set", "ao-volume", nv);
  };

  cycleSubtitleTrack = () => {
    this.mpv.command("keypress", "j");
  };

  cycleAudioTrack = () => {
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

  videoStyle = { width: "100%", height: "inherit", margin: 0, padding: 0 };

  render() {
    return (
      <>
        {this.state.data && (
          <div
            style={{
              width: "100%",
              position: "absolute",
              height: "100vh",
              overflow: "hidden",
              backgroundColor: "rgba(0, 0, 0, 0.514)",
            }}
          >
            {this.state.data.trailer ? (
              <iframe
                src={`https://www.youtube.com/embed/${this.state.data.trailer}?
                    version=3&controls=0&start=0&autoplay=1&loop=1&rel=0&showinfo=0&playlist=${this.state.data.trailer}`}
                frameBorder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; loop"
                className="banner"
              ></iframe>
            ) : (
              <img
                src={this.state.data.banner}
                className="banner-img"
                onError={(e: any) => (e.target.style.display = "none")}
              />
            )}
            <div className="overlay"></div>
            <div className="details">
              <div className="info">
                <img
                  src={getLink(this.state.data.poster)}
                  alt="banner"
                  className="info-poster"
                />
                <div className="imdb-info">
                  <div>
                    <h1 className="show-title">{this.state.data.name}</h1>
                    <p>
                      ⭐{" "}
                      {this.state.imdb
                        ? this.state.imdb.rating
                        : this.state.data.rating}{" "}
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
                    <Button variant="contained">Play</Button>
                    <FavouriteBtn
                      favourited={this.state.favourited}
                      addToFavourites={this.addToFavourites}
                    />
                  </div>
                </div>
              </div>
              <div className="search-container-left">
                <SearchRoundedIcon />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Find episode"
                  onChange={this.filterEpisodes}
                />{" "}
              </div>
              <div className="episode-list">
                <EpisodeList
                  list={this.state.episodes}
                  setId={this.handleEpisodeChange}
                  name={this.state.data.name}
                  handleDownload={this.addToDownload}
                />
              </div>
            </div>
            <div
              ref={this.playerContainerEl}
              className="player"
              style={{
                opacity: this.state.currentEpisode ? 1 : 0,
              }}
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
                    display: this.state.currentEpisode ? "block" : "none",
                  }}
                >
                  {this.state.fullscreen && (
                    <div className="absolute-center">
                      <Play
                        pause={this.state.pause}
                        togglePause={this.togglePause}
                      />
                    </div>
                  )}
                  <div className="controls-bot-container">
                    <div className="controls-bot">
                      <div>
                        <Grid
                          container
                          direction="row"
                          justify="center"
                          alignItems="center"
                        >
                          {this.state.fullscreen && (
                            <VolumeCtrl
                              value={this.state.volume_value}
                              setVolume={this.handleVolumeChange}
                            />
                          )}
                          {this.state.fullscreen && (
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
                          )}
                          {this.state.fullscreen && (
                            <Audio cycleAudioTrack={this.cycleAudioTrack} />
                          )}
                          {this.state.fullscreen && (
                            <Subtitle
                              cycleSubtitleTrack={this.cycleSubtitleTrack}
                            />
                          )}
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
          </div>
        )}
      </>
    );
  }
}

export default withRouter(Player);
