import React, { useEffect, useState, useRef } from "react";
import {
  getShow,
  getLink,
  toHHMMSS,
  preview,
  stream,
  closeFullscreen,
  openFullscreen,
  handleError,
} from "../utils/utils";
import nprogress from "nprogress";
import "nprogress/nprogress.css";
import IconButton from "@material-ui/core/IconButton";
import Slider from "@material-ui/core/Slider";
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
import { VideoSeekSlider } from "./seekbar";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import EpisodeList from "./episodelist";
import { Show, Episode } from "../utils/interfaces";

const useStyles = makeStyles(() => ({
  root: {
    width: "inherit",
    position: "absolute",
    top: "65px",
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
  sidebar: {
    backgroundColor: "#424242",
  },
}));

type FlashPlayerProps = {
  match: {
    params: {
      id: string;
      epId: string;
    };
  };
};

type FlashPlayerState = {
  data: Show;
  favourited: boolean;
  loadingData: boolean;
  duration: number;
  "time-pos": number;
  pause: boolean;
  volume_value: number;
  fullscreen: boolean;
};

function FlashPlayer(props: FlashPlayerProps) {
  const [state, setState] = useState({
    data: null!,
    favourited: false,
    loadingData: false,
    duration: 3600,
    "time-pos": 0,
    pause: true,
    volume_value: 50,
    fullscreen: false,
  } as FlashPlayerState);
  const [id, setId] = useState("");
  const [list, setList] = useState([] as Array<Episode>);
  const [_isMounted, setMounted] = useState(true);
  const [audioTrack, setAudioTrack] = useState(0);
  const [textTrack, setTextTrack] = useState(0);
  const [audioLabel, setAudioLabel] = useState("");
  const [textLabel, setTextLabel] = useState("");
  const classes = useStyles();
  const videoEl = useRef<HTMLVideoElement>(null!);
  const containerEl = useRef<HTMLDivElement>(null!);
  const [progress] = useState(0);
  const paramId = props.match.params.id;
  const epId = props.match.params.epId;

  useEffect(() => {
    nprogress.start();
    if (_isMounted) {
      const favouritesString = localStorage.getItem("favourites");
      let localFavourites: { [index: string]: boolean } = {};
      if (favouritesString) localFavourites = JSON.parse(favouritesString);
      const favourited = localFavourites[paramId] ? true : false;
      getShow(paramId).then((show) => {
        setState((prev) => ({
          ...prev,
          data: show,
          favourited: favourited,
        }));
        setList(show.episodes);
        if (epId) {
        }
      });
      nprogress.done();
    }
    return () => {
      setMounted(false);
    };
  }, [_isMounted, paramId, epId]);

  const filter = (e: any): void => {
    setList([
      ...state.data.episodes.filter((i) =>
        i.name.toLowerCase().includes(e.currentTarget.value.toLowerCase())
      ),
    ]);
  };

  const handleSeek = (newValue: number): void => {
    if (!videoEl) return;
    const timePos = +newValue;
    setState((prev) => ({ ...prev, "time-pos": timePos }));
    videoEl.current.currentTime = timePos;
  };
  const togglePause = () => {
    if (!videoEl) return;
    if (state.pause) videoEl.current.play();
    else videoEl.current.pause();
    setState((prev) => ({ ...prev, pause: !prev.pause }));
  };
  const handleVolumeChange = (event: any, value: any) => {
    if (!videoEl) return;
    videoEl.current.volume = value / 100.0;
    setState((prev) => ({ ...prev, volume_value: value }));
  };
  const addToFavourites = () => {
    const favouritesString = localStorage.getItem("favourites");
    let localFavourites: { [index: string]: boolean } = {};
    if (favouritesString) localFavourites = JSON.parse(favouritesString);
    localStorage.setItem(
      `favourites`,
      JSON.stringify({
        ...localFavourites,
        [state.data.id]: true,
      })
    );
    setState((prev) => ({ ...prev, favourited: true }));
  };
  const cycleAudio = () => {
    if (!videoEl) return;
    try {
      if (videoEl.current.audioTracks.length < 2) return;
      videoEl.current.pause();
      let newTrack =
        audioTrack + 1 < videoEl.current.audioTracks.length
          ? audioTrack + 1
          : 0;
      videoEl.current.audioTracks[audioTrack].enabled = false;
      videoEl.current.audioTracks[newTrack].enabled = true;
      setAudioLabel(
        (
          newTrack +
          ":" +
          videoEl.current.audioTracks[newTrack].language
        ).toUpperCase()
      );
      setAudioTrack(newTrack);
      videoEl.current.play();
    } catch (error) {
      handleError(error);
    }
  };
  const cycleSub = () => {
    if (!videoEl) return;
    try {
      if (videoEl.current.textTracks.length < 2) return;
      videoEl.current.pause();
      let newTrack =
        textTrack + 1 < videoEl.current.textTracks.length ? textTrack + 1 : 0;
      videoEl.current.textTracks[textTrack].mode = "disabled";
      videoEl.current.textTracks[newTrack].mode = "showing";
      setTextLabel(
        (
          newTrack +
          ":" +
          videoEl.current.textTracks[newTrack].language
        ).toUpperCase()
      );
      setTextTrack(newTrack);
      videoEl.current.play();
    } catch (error) {
      handleError(error);
    }
  };
  const toggleFullscreen = () => {
    if (!containerEl) return;
    if (state.fullscreen) {
      closeFullscreen();
      containerEl.current.className = "player";
    } else {
      openFullscreen();
      containerEl.current.className = "webfullscreen";
    }
    setState((prev) => ({ ...prev, fullscreen: !state.fullscreen }));
  };
  const updateSeekBar = () => {
    var time = videoEl.current.currentTime;
    // try {
    //   var range = 0;
    //   var bf = videoEl.current.buffered;
    //   var length = bf.length;
    //   if (length) {
    //     while (!(bf.start(range) <= time && time <= bf.end(range))) {
    //       range += 1;
    //     }
    //     setProgress(bf.end(range));
    //   }
    // } catch (error) {

    // }
    setState((prev) => ({ ...prev, "time-pos": time }));
  };

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 65px)",
        maxHeight: "calc(100vh - 65px)",
        marginTop: "65px",
        overflow: "hidden",
      }}
    >
      {state.data && (
        <div
          style={{
            height: "inherit",
            display: "grid",
            gridTemplateColumns: "70% 30%",
          }}
        >
          <div className="player" ref={containerEl}>
            <div className="mpv-player">
              <img
                src={getLink(state.data.banner)}
                alt={"banner"}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "inherit",
                  display: id ? "none" : "block",
                  objectFit: "fill",
                }}
              />
              <video
                autoPlay
                ref={videoEl}
                style={{
                  width: "100%",
                  height: "inherit",
                  backgroundColor: "rgb(0,0,0,0.0)",
                }}
                src={id && stream(id)}
                onPlay={() => setState((prev) => ({ ...prev, pause: false }))}
                onPause={() => setState((prev) => ({ ...prev, pause: true }))}
                onDurationChange={() => {
                  setState((prev) => ({
                    ...prev,
                    duration: videoEl.current.duration,
                  }));
                  nprogress.done();
                }}
                onTimeUpdate={updateSeekBar}
                onSeeking={() => nprogress.start()}
                onSeeked={() => nprogress.done()}
                onError={(e) => {handleError(e); nprogress.done()}}
              />
              <div className="loader" hidden={!state.loadingData}>
                <CircularProgress />
              </div>
              <div className="controls">
                <div className="controls-bot-container">
                  <div className="controls-bot">
                    <div style={{ paddingLeft: 5, paddingRight: 5 }}>
                      <VideoSeekSlider
                        max={state.duration}
                        currentTime={state["time-pos"]}
                        progress={progress}
                        onChange={handleSeek}
                        offset={0}
                        secondsPrefix="00:00:"
                        minutesPrefix="00:"
                        thumbnailURL={preview(id)}
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
                              onClick={togglePause}
                              size="medium"
                            >
                              {state.pause ? (
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
                            min={0}
                            max={100}
                            value={state.volume_value}
                            onChange={handleVolumeChange}
                            aria-labelledby="discrete-slider-custom"
                            step={1}
                          />
                        </div>
                        <div className="video-time">
                          <p>
                            {toHHMMSS(state["time-pos"])} /{" "}
                            {toHHMMSS(state.duration)}
                          </p>
                        </div>
                        <div className={classes.inline}>
                          <Tooltip title="Add to favourites">
                            <span>
                              <IconButton
                                aria-label="Add to favourites"
                                disabled={state.favourited}
                                onClick={addToFavourites}
                              >
                                <FavoriteIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </div>
                        <div className={classes.inline}>
                          <Tooltip title="Cycle audio track">
                            <IconButton
                              aria-label="cycle audio track"
                              onClick={cycleAudio}
                            >
                              <AudiotrackOutlinedIcon />
                            </IconButton>
                          </Tooltip>
                        </div>
                        {audioLabel}
                        <div className={classes.inline}>
                          <Tooltip title="Cycle subtitle track">
                            <IconButton
                              aria-label="cycle subtitle track"
                              onClick={cycleSub}
                            >
                              <SubtitlesOutlinedIcon />
                            </IconButton>
                          </Tooltip>
                        </div>
                        {textLabel}
                        <div className={classes.inline}>
                          <Tooltip title="Toggle fullscreen">
                            <IconButton
                              aria-label="cycle subtitle track"
                              onClick={toggleFullscreen}
                            >
                              {state.fullscreen ? (
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
          </div>
          <div
            className={classes.sidebar}
            style={{
              height: "100vh",
              overflow: "hidden",
              position: "fixed",
              top: 0,
              right: 0,
              width: "30vw",
              zIndex: 10000000,
              borderLeft: "1px solid #212121",
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
              onChange={filter}
            />
            <EpisodeList list={list} setId={setId} name={state.data.name} />
          </div>
        </div>
      )}
    </div>
  );
}

export default FlashPlayer;
