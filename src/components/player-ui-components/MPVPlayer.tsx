import React from "react";
import { ReactMPV } from "mpv.js";
import Grid from "@material-ui/core/Grid";
import "nprogress/nprogress.css";
import { VideoSeekSlider } from "./seekbar";
import {
  closeFullscreen,
  openFullscreen,
  getPreviewURL,
} from "../../utils/utils";
import VolumeCtrl from "./volume_ctrl";
import Timer from "./timer";
import Duration from "./duration";
import Play from "./play";
import Audio from "./audio";
import Subtitle from "./subtitle";
import Fullscreen from "./fullscreen";
import IdleTimer from "react-idle-timer";
import { stream } from "../../utils/api";

type Props = {
  showTitle: string;
  episodeTitle: string;
  episodeId: string;
  fullscreen: boolean;
  timePos: number;
  episodeSize: number;
};

type State = {
  pause: boolean;
  "time-pos": number;
  duration: number;
  fullscreen: boolean;
  volume_value: number;
  active: boolean;
};

class Player extends React.Component<Props, State> {
  mpv: any;
  playerContainerEl: React.RefObject<HTMLDivElement>;
  window: any;
  _isMounted: boolean;
  idleTimer: any;
  constructor(props: Props) {
    super(props);
    this.mpv = null;
    this.idleTimer = null;
    this.state = {
      pause: true,
      "time-pos": this.props.timePos,
      duration: 100,
      fullscreen: this.props.fullscreen,
      volume_value: 20,
      active: true,
    };
    this.playerContainerEl = React.createRef();
    this.window = window.electron ? window.remote.getCurrentWindow() : window;
    this._isMounted = true;
  }

  async componentDidMount() {}

  componentWillUnmount() {
    this._isMounted = false;
  }

  shouldComponentUpdate(nextProps: Props) {
    if (this.props.episodeId !== nextProps.episodeId) {
      this.mpv.command(
        "loadfile",
        stream(nextProps.episodeId, nextProps.episodeSize)
      );
    }
    return true;
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
    if (this.props.episodeId.length > 0)
      this.handleEpisodeChange(
        this.props.episodeId,
        this.props.episodeTitle,
        this.state["time-pos"],
        this.props.episodeSize
      );
  };

  handlePropertyChange = (name: string, value: any) => {
    switch (name) {
      case "time-pos":
        this.setState({ "time-pos": value });
        break;
      case "pause":
        this.setState({ pause: value });
        break;
      case "duration":
        this.setState({
          duration: value,
        });
        if (this.props.timePos) {
          this.setState({ "time-pos": this.props.timePos });
          this.mpv.property("time-pos", this.props.timePos);
          this.setState({ pause: false });
          this.mpv.property("pause", false);
        } else {
          this.setState({ pause: false });
          this.mpv.property("pause", false);
        }
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

  toggleThreatreMode = () => {
    const node = this.playerContainerEl.current;
    if (!node) return;
    if (this.state.fullscreen) {
      node.className = "player";
    } else {
      node.className = "webfullscreen";
    }
  };

  handleSeek = (newValue: number) => {
    if (!this.mpv) return;
    const timePos = newValue;
    this.setState({ "time-pos": timePos });
    this.mpv.property("time-pos", timePos);
  };

  handleEpisodeChange = (
    id: string,
    name: string,
    timePos: number = 0,
    size: number
  ) => {
    if (!this.mpv) return;
    this.mpv.command("loadfile", stream(id, size));
    this.mpv.property("time-pos", timePos);
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

  handleOnAction = () => {};

  handleOnActive = () => {
    this.setState({ active: true });
  };

  handleOnIdle = () => {
    this.setState({ active: false });
  };

  MPVPlayer = () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "160px auto",
        width: "100%",
        height: 90,
      }}
    >
      {this.state.fullscreen && (
        <IdleTimer
          ref={(ref) => {
            this.idleTimer = ref;
          }}
          timeout={1500}
          onActive={this.handleOnActive}
          onIdle={this.handleOnIdle}
          debounce={1000}
        />
      )}
      <div
        ref={this.playerContainerEl}
        className="player"
        style={{ cursor: this.state.active ? "default" : "none" }}
      >
        <div className="mpv-player">
          <ReactMPV
            onReady={this.handleMPVReady}
            onPropertyChange={this.handlePropertyChange}
            onMouseDown={this.togglePause}
          />
          {this.state.fullscreen && (
            <div
              className="controls"
              style={{
                opacity: this.state.active || this.state.pause ? 1 : 0,
              }}
            >
              <div className="absolute-center">
                <Play
                  pause={this.state.pause}
                  togglePause={this.togglePause}
                  size={100}
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
                        color="white"
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
                        <Timer seconds={this.state["time-pos"]} color="white" />
                        <div style={{ width: "85%", margin: "0 auto" }}>
                          <VideoSeekSlider
                            max={this.state.duration}
                            currentTime={this.state["time-pos"]}
                            progress={this.state["time-pos"] + 300}
                            onChange={this.handleSeek}
                            offset={0}
                            secondsPrefix="00:00:"
                            minutesPrefix="00:"
                            thumbnailURL={getPreviewURL(this.props.episodeId)}
                          />
                        </div>
                        <Duration seconds={this.state.duration} color="white" />
                      </div>
                      <Audio
                        cycleAudioTrack={this.cycleAudioTrack}
                        color="white"
                      />
                      <Subtitle
                        cycleSubtitleTrack={this.cycleSubtitleTrack}
                        color="white"
                      />
                      <Fullscreen
                        fullscreen={this.state.fullscreen}
                        toggleFullscreen={this.toggleFullscreen}
                        color="white"
                      />
                    </Grid>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {!this.state.fullscreen && (
        <div
          style={{
            width: "100%",
            height: 90,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Play pause={this.state.pause} togglePause={this.togglePause} />
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
            <div
              style={{ width: "85%", margin: "0 auto", textAlign: "center" }}
            >
              <p style={{ margin: 0 }}>{this.props.episodeTitle}</p>
              <VideoSeekSlider
                max={this.state.duration}
                currentTime={this.state["time-pos"]}
                progress={this.state["time-pos"] + 300}
                onChange={this.handleSeek}
                offset={0}
                secondsPrefix="00:00:"
                minutesPrefix="00:"
                thumbnailURL={getPreviewURL(this.props.episodeId)}
              />
              <p style={{ margin: 0 }}>{this.props.showTitle}</p>
            </div>
            <Duration seconds={this.state.duration} />
          </div>
          <Audio cycleAudioTrack={this.cycleAudioTrack} />
          <Subtitle cycleSubtitleTrack={this.cycleSubtitleTrack} />
          <Fullscreen
            fullscreen={this.state.fullscreen}
            toggleFullscreen={this.toggleFullscreen}
          />
        </div>
      )}
    </div>
  );

  render() {
    return this.MPVPlayer();
  }
}

export default Player;
