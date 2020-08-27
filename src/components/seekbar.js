import React from "react";

export class VideoSeekSlider extends React.Component {
  state = {
    ready: false,
    trackWidth: 0,
    seekHoverPosition: 0,
  };

  static defaultProps = {
    max: 100,
    currentTime: 0,
    progress: 0,
    hideHoverTime: false,
    offset: 0,
    secondsPrefix: "",
    minutesPrefix: "",
    thumbnailURL: null,
  };

  seeking;
  mobileSeeking;
  track;
  hoverTime;

  componentDidMount() {
    this.setTrackWidthState();
    window.addEventListener("resize", this.setTrackWidthState);
    window.addEventListener("mousemove", this.handleSeeking);
    window.addEventListener("mouseup", this.mouseSeekingHandler);
    window.addEventListener("touchmove", this.handleTouchSeeking);
    window.addEventListener("touchend", this.mobileTouchSeekingHandler);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.setTrackWidthState);
    window.removeEventListener("mousemove", this.handleSeeking);
    window.removeEventListener("mouseup", this.mouseSeekingHandler);
    window.removeEventListener("touchmove", this.handleTouchSeeking);
    window.removeEventListener("touchend", this.mobileTouchSeekingHandler);
  }

  handleTouchSeeking = (event) => {
    let pageX = 0;

    for (let i = 0; i < event.changedTouches.length; i++) {
      pageX = event.changedTouches[i].pageX;
    }

    pageX = pageX < 0 ? 0 : pageX;

    if (this.mobileSeeking) {
      this.changeCurrentTimePosition(pageX);
    }
  };

  handleSeeking = (event) => {
    if (this.seeking) {
      this.changeCurrentTimePosition(event.pageX);
    }
  };

  changeCurrentTimePosition(pageX) {
    let position = pageX - this.track.getBoundingClientRect().left;

    position = position < 0 ? 0 : position;
    position =
      position > this.state.trackWidth ? this.state.trackWidth : position;

    this.setState({
      seekHoverPosition: position,
    });

    let percent = (position * 100) / this.state.trackWidth;
    let time = +(percent * (this.props.max / 100)).toFixed(0);

    this.props.onChange(time, time + this.props.offset);
  }

  setTrackWidthState = () => {
    if (this.track) {
      this.setState({
        trackWidth: this.track.offsetWidth,
      });
    }
  };

  handleTrackHover = (clear, e) => {
    let position = e.pageX - this.track.getBoundingClientRect().left;

    if (clear) {
      position = 0;
    }

    this.setState({
      seekHoverPosition: position,
    });
  };

  getPositionStyle(time) {
    let position = (time * 100) / this.props.max;

    return {
      transform: `scaleX(${position / 100})`,
    };
  }

  getThumbHandlerPosition() {
    let position =
      this.state.trackWidth / (this.props.max / this.props.currentTime);

    return {
      transform: `translateX(${position}px)`,
    };
  }

  getSeekHoverPosition() {
    let position = (this.state.seekHoverPosition * 100) / this.state.trackWidth;

    return {
      transform: `scaleX(${position / 100})`,
    };
  }

  getHoverTimePosition() {
    let position = 0;

    if (this.hoverTime) {
      position = this.state.seekHoverPosition - this.hoverTime.offsetWidth / 2;

      if (this.props.limitTimeTooltipBySides) {
        if (position < 0) {
          position = 0;
        } else if (
          position + this.hoverTime.offsetWidth >
          this.state.trackWidth
        ) {
          position = this.state.trackWidth - this.hoverTime.offsetWidth;
        }
      }
    }

    return {
      transform: `translateX(${position}px)`,
    };
  }

  secondsToTime(seconds) {
    seconds = Math.round(seconds + this.props.offset);

    let hours = Math.floor(seconds / 3600);
    let divirsForMinutes = seconds % 3600;
    let minutes = Math.floor(divirsForMinutes / 60);
    let sec = Math.ceil(divirsForMinutes % 60);

    return {
      hh: hours.toString(),
      mm: minutes < 10 ? "0" + minutes : minutes.toString(),
      ss: sec < 10 ? "0" + sec : sec.toString(),
    };
  }

  getHoverTime() {
    let percent = (this.state.seekHoverPosition * 100) / this.state.trackWidth;
    let time = Math.floor(+(percent * (this.props.max / 100)));
    let times = this.secondsToTime(time);

    if (this.props.max + this.props.offset < 60) {
      return this.props.secondsPrefix + times.ss;
    } else if (this.props.max + this.props.offset < 3600) {
      return this.props.minutesPrefix + times.mm + ":" + times.ss;
    } else {
      return times.hh + ":" + times.mm + ":" + times.ss;
    }
  }

  mouseSeekingHandler = (event) => {
    this.setSeeking(false, event);
  };

  setSeeking = (state, event) => {
    event.preventDefault();

    this.handleSeeking(event);
    this.seeking = state;

    this.setState({
      seekHoverPosition: !state ? 0 : this.state.seekHoverPosition,
    });
  };

  mobileTouchSeekingHandler = () => {
    this.setMobileSeeking(false);
  };

  setMobileSeeking = (state) => {
    this.mobileSeeking = state;

    this.setState({
      seekHoverPosition: !state ? 0 : this.state.seekHoverPosition,
    });
  };

  isThumbActive() {
    return this.state.seekHoverPosition > 0 || this.seeking;
  }

  drawHoverTime() {
    let percent = (this.state.seekHoverPosition * 120) / this.state.trackWidth;
    let y = percent ? Math.floor(percent / 10) : 0;
    let x = percent ? Math.floor(percent % 10) : 0;

    if (!this.props.hideHoverTime) {
      return (
        <div
          className={this.isThumbActive() ? "hover-time active" : "hover-time"}
          style={this.getHoverTimePosition()}
          ref={(ref) => (this.hoverTime = ref)}
        >
          {this.props.thumbnailURL ? (
            <div
              className="cropped"
              style={{
                position: "absolute",
                width: 160,
                height: 90,
                top: -100,
                right: -45,
                overflow: "hidden",
                borderRadius: 4,
                border: "2px solid white"
              }}
            >
              <img
                style={{
                  marginTop: -90 * y,
                  marginBottom: 0,
                  marginLeft: -160 * x,
                  marginRight: 0,
                }}
                src={this.props.thumbnailURL}
                alt="preview"
              />
            </div>
          ) : null}

          {this.getHoverTime()}
        </div>
      );
    }
  }

  render() {
    return (
      <div className="ui-video-seek-slider">
        <div
          className={this.isThumbActive() ? "track active" : "track"}
          ref={(ref) => (this.track = ref)}
          onMouseMove={(e) => this.handleTrackHover(false, e)}
          onMouseLeave={(e) => this.handleTrackHover(true, e)}
          onMouseDown={(e) => this.setSeeking(true, e)}
          onTouchStart={() => this.setMobileSeeking(true)}
        >
          <div className="main">
            <div
              className="buffered"
              style={this.getPositionStyle(this.props.progress)}
            />

            <div className="seek-hover" style={this.getSeekHoverPosition()} />

            <div
              className="connect"
              style={this.getPositionStyle(this.props.currentTime)}
            />
          </div>
        </div>
        {this.drawHoverTime()}
        <div
          className={this.isThumbActive() ? "thumb active" : "thumb"}
          style={this.getThumbHandlerPosition()}
        >
          <div className="handler" />
        </div>
      </div>
    );
  }
}
