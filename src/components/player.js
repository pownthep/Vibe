import React from "react";
import { ReactMPV } from "mpv.js";
import path from "path";
import {remote} from "electron";

export default class Player extends React.Component {
  constructor(props) {
    super(props);
    this.mpv = null;
    this.state = { pause: true, "time-pos": 0, duration: 0, fullscreen: false };
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
  }
  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown, false);
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
    this.mpv.command("loadfile", "http://localhost:9001/1GP2k0_DxSPeNY-4A0VFTmuvi9_ErXuwP");
  }
  handlePropertyChange(name, value) {
    if (name === "time-pos" && this.seeking) {
      return;
    } else if (name === "eof-reached" && value) {
      this.mpv.property("time-pos", 0);
    } else {
      this.setState({ [name]: value });
    }
  }
  toggleFullscreen() {
    if (this.state.fullscreen) {
      document.webkitExitFullscreen();
    } else {
      this.mpv.fullscreen();
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
  handleSeek(e) {
    e.target.blur();
    const timePos = +e.target.value;
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
  render() {
    return (
      <div className="container">
        <ReactMPV
          className="player"
          onReady={this.handleMPVReady}
          onPropertyChange={this.handlePropertyChange}
          onMouseDown={this.togglePause}
        />
        <div className="controls">
          <button className="control" onClick={this.togglePause}>
            {this.state.pause ? "▶" : "❚❚"}
          </button>
          <button className="control" onClick={this.handleStop}>
            ■
          </button>
          <input
            className="seek"
            type="range"
            min={0}
            step={0.1}
            max={this.state.duration}
            value={this.state["time-pos"]}
            onChange={this.handleSeek}
            onMouseDown={this.handleSeekMouseDown}
            onMouseUp={this.handleSeekMouseUp}
          />
          <button className="control" onClick={this.handleLoad}>
            ⏏
          </button>
        </div>
      </div>
    );
  }
}
