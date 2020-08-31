import React, { useEffect, useState, useRef } from "react";
import { getShow, getURL, getLink, toHHMMSS, preview, stream } from "../utils/utils";
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

export default function FlashPlayer(props) {
  const [state, setState] = useState({
    data: null,
    favourited: false,
    loadingData: false,
    duration: 3600,
    "time-pos": 0,
    pause: true,
    volume_value: 50,
    fullscreen: false,
  });
  const [id, setId] = useState(null);
  const [list, setList] = useState([]);
  const [_isMounted, setMounted] = useState(true);
  const [audioTrack, setAudioTrack] = useState(0);
  const [textTrack, setTextTrack] = useState(0);
  const [audioLabel, setAudioLabel] = useState("");
  const [textLabel, setTextLabel] = useState("");
  const classes = useStyles();
  const videoEl = useRef(null);
  const containerEl = useRef(null);
  const [progress, setProgress] = useState(0);
  const paramId = props.match.params.id;
  const epId = props.match.params.epId;

  useEffect(() => {
    nprogress.start();
    if (_isMounted) {
      const favourites = localStorage.getItem(`favourites`)
        ? JSON.parse(localStorage.getItem(`favourites`))
        : {};
      getShow(paramId).then((show) => {
        setState((prev) => ({
          ...prev,
          data: show,
          favourited: favourites[paramId] ? true : false,
        }));
        setList(show.episodes);
        if (epId) {
          //handleEpisodeChange(episode.id, episode.ep, episode.timePos);
        }
      });
      nprogress.done();
    }
    return () => {
      setMounted(false);
    };
  }, [_isMounted, paramId, epId]);

  const filter = (e) => {
    setList([
      ...state.data.episodes.filter((i) =>
        i.name.toLowerCase().includes(e.currentTarget.value.toLowerCase())
      ),
    ]);
  };

  const handleSeek = (newValue) => {
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
  const handleVolumeChange = (e, nv) => {
    videoEl.current.volume = nv / 100.0;
    setState((prev) => ({ ...prev, volume_value: nv }));
  };
  const addToFavourites = () => {
    const favourites = localStorage.getItem("favourites")
      ? JSON.parse(localStorage.getItem("favourites"))
      : {};
    localStorage.setItem(
      `favourites`,
      JSON.stringify({
        ...favourites,
        [state.data.id]: true,
      })
    );
    setState((prev) => ({ ...prev, favourited: true }));
  };
  const cycleAudio = () => {
    if (videoEl.current.audioTracks.length < 2) return;
    videoEl.current.pause();
    let newTrack =
      audioTrack + 1 < videoEl.current.audioTracks.length ? audioTrack + 1 : 0;
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
  };
  const cycleSub = () => {
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
  };
  const toggleFullscreen = () => {
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
    var range = 0;
    var bf = videoEl.current.buffered;
    var length = bf.length;
    if (length) {
        while (!(bf.start(range) <= time && time <= bf.end(range))) {
            range += 1;
        }
        setProgress(bf.end(range));
    }
    setState((prev) => ({ ...prev, "time-pos": time }));
  };

  var elem = document.documentElement;

  /* View in fullscreen */
  function openFullscreen() {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE/Edge */
      elem.msRequestFullscreen();
    }
  }

  /* Close fullscreen */
  function closeFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      /* Firefox */
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      /* IE/Edge */
      document.msExitFullscreen();
    }
  }

  const onProgress = (e) => {
    
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
                // className="banner"
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
                onProgress={onProgress}
              />
              <div className="loader" hidden={!state.loadingData}>
                <CircularProgress />
              </div>
              <div className="controls">
                <div className="controls-bot-container">
                  <div className="controls-bot">
                    <div style={{ paddingLeft: 60, paddingRight: 60 }}>
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
                        <div style={{ margin: "0 auto", fontWeight: "bold" }}>
                          {state.currentEpisode && state.currentEpisode.ep}
                        </div>
                        <div className={classes.inline}>
                          <Tooltip title="Add to favourites">
                            <IconButton
                              aria-label="Add to favourites"
                              disabled={state.favourited}
                              onClick={addToFavourites}
                            >
                              <FavoriteIcon />
                            </IconButton>
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
            {/* <Divider /> */}
            <EpisodeList list={list} setId={setId} name={state.data.name} />
          </div>
        </div>
      )}
    </div>
  );
}
