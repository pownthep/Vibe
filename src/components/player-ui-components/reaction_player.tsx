import React from "react";
import { Rnd } from "react-rnd";
import Play from "./play";
import { Grid } from "@material-ui/core";
import VolumeCtrl from "./volume_ctrl";
import ReactPlayer from "react-player";
import Timer from "./timer";
import { VideoSeekSlider } from "./seekbar";
import Duration from "./duration";
import Fullscreen from "./fullscreen";
import { closeFullscreen, openFullscreen } from "../../utils/utils";
import IdleTimer from "react-idle-timer";

const style = {
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "black",
  zIndex: 10,
  boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
  overflow: "hidden",
} as const;

type playerState = {
  pause: boolean;
  "time-pos": number;
  duration: number;
  fullscreen: boolean;
  volume_value: number;
  active: boolean;
  vid1Ready: boolean;
  vid2Ready: boolean;
  buffering1: boolean;
  buffering2: boolean;
};

export default class ReactionPlayer extends React.Component {
  idleTimer: any;
  vid1: any;
  vid2: any;
  offset = 0;
  params: any;

  state = {
    pause: true,
    "time-pos": 0,
    duration: 100,
    fullscreen: false,
    volume_value: 20,
    active: true,
    vid1Ready: false,
    vid2Ready: false,
    progress: 0,
    buffering1: false,
    buffering2: false,
  };

  async componentDidMount() {
    this.params = this.getParams(window.location.href);
    if (this.params.offset) this.offset = this.params.offset;
    console.log(this.params);
  }

  handleOnIdle = (event: any) => {
    this.setState({ active: false });
  };

  handleOnActive = (event: any) => {
    this.setState({ active: true });
  };

  handleOnAction = (e: any) => {};

  getParams = (url: string) => {
    var params: any = {};
    var parser = document.createElement("a");
    parser.href = url;
    var query = parser.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      params[pair[0]] = decodeURIComponent(pair[1]);
    }
    return params;
  };

  togglePause = () => {
    if (
      this.state.vid1Ready &&
      this.state.vid2Ready &&
      !this.state.buffering1 &&
      !this.state.buffering2
    )
      this.setState({ pause: !this.state.pause });
  };
  handleVolumeChange = (nv: number) => {
    this.setState({ volume_value: nv });
  };

  toggleFullscreen = () => {
    if (this.state.fullscreen) closeFullscreen();
    else openFullscreen();
    this.setState({ fullscreen: !this.state.fullscreen });
  };

  handleSeek = (seconds: number) => {
    this.vid1.seekTo(seconds);
    if (seconds - this.offset > 0) this.vid2.seekTo(seconds - this.offset);
    this.setState({ "time-pos": seconds });
  };

  render() {
    return (
      <div className="reaction-player-container">
        <IdleTimer
          ref={(ref) => {
            this.idleTimer = ref;
          }}
          timeout={1500}
          onActive={this.handleOnActive}
          onIdle={this.handleOnIdle}
          debounce={1000}
        />
        <Rnd
          style={style}
          lockAspectRatio={16 / 9}
          default={{
            x: 10,
            y: 10,
            width: "240px",
            height: "135px",
          }}
        >
          <ReactPlayer
            ref={(ref) => {
              this.vid2 = ref;
            }}
            url={
              // "https://drive.google.com/uc?export=download&id=" +
              // this.getParams(window.location.href).vid2
              "http://pownthep.3bbddns.com:36370/test.webm"
            }
            controls={false}
            playing={!this.state.pause}
            onReady={() => {
              this.setState({ vid2Ready: true });
            }}
            height="100%"
            width="100%"
            volume={this.state.volume_value / 100}
            config={{
              youtube: {
                playerVars: { rel: 0, showInfo: 0, preload: true },
              },
            }}
            style={{
              pointerEvents: "none",
              position: "absolute",
              top: 0,
              zIndex: 2,
            }}
            onBuffer={() => {
              console.log("vid2 is buffering");
              this.setState({ buffering2: true });
            }}
            onBufferEnd={() => {
              console.log("vid2 finished buffering");
              this.setState({ buffering2: false });
            }}
          />
        </Rnd>
        <ReactPlayer
          ref={(ref) => {
            this.vid1 = ref;
          }}
          url={
            "https://www.youtube.com/watch?v=wJOHLUbtAw0"
            //+ this.getParams(window.location.href).vid1
          }
          config={{
            youtube: {
              playerVars: { rel: 0, showInfo: 0, preload: true },
            },
          }}
          controls={false}
          playing={!this.state.pause}
          width="100%"
          height="100%"
          volume={this.state.volume_value / 100}
          onReady={() => {
            this.setState({ vid1Ready: true });
          }}
          onDuration={(d) => {
            this.setState({ duration: d });
          }}
          onProgress={(p) => {
            this.setState({
              "time-pos": p.playedSeconds,
              progress: p.loadedSeconds,
            });
          }}
          style={{
            pointerEvents: "none",
            position: "absolute",
            top: 0,
            zIndex: 2,
            opacity: this.state.pause && this.state["time-pos"] === 0 ? 0 : 1,
            transform: this.state.pause ? "scale(1.5)" : "scale(1.0)",
          }}
          onBuffer={() => {
            console.log("vid1 is buffering");
            this.setState({ buffering1: true });
          }}
          onBufferEnd={() => {
            console.log("vid1 finished buffering");
            this.setState({ buffering1: false });
          }}
        />
        <img
          src={`https://img.youtube.com/vi/${
            this.getParams(window.location.href).vid1
          }/maxresdefault.jpg`}
          alt="thumbnail"
          style={{
            position: "absolute",
            top: 0,
            zIndex: 2,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: this.state.pause && this.state["time-pos"] === 0 ? 1 : 0,
          }}
        />
        <div
          style={{
            cursor: this.state.active ? "default" : "none",
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: "inherit",
            zIndex: 4,
            background: "linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1.0))",
            opacity: this.state.active || this.state.pause ? 1 : 0,
            transition: "all 300ms ease-in-out",
          }}
        >
          <div className="absolute-center">
            <Play
              pause={this.state.pause}
              togglePause={this.togglePause}
              size={100}
            />
          </div>
          <div
            style={{
              width: "inherit",
              height: 50,
              position: "absolute",
              bottom: 10,
            }}
          >
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
                      progress={this.state.progress}
                      onChange={this.handleSeek}
                      offset={0}
                      secondsPrefix="00:00:"
                      minutesPrefix="00:"
                    />
                  </div>
                  <Duration seconds={this.state.duration} color="white" />
                </div>
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
    );
  }
}
