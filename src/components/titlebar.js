import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import {
  Container,
  Text,
  Controls,
  ButtonMacMaximize,
  ButtonMacClose,
  ButtonMacMinimize,
  ButtonWindows,
  CloseButtonWindows,
} from "../utils/styles";

const KEY_ALT = 18;

const currentWindow = window.remote.getCurrentWindow();

class Titlebar extends PureComponent {
  state = {
    keyAltDown: false,
    isMaximized: currentWindow.isMaximized(),
  };

  isWindows = window.clientInformation.platform === "Win32";

  componentDidMount() {
    if (!this.isWindows) {
      document.body.addEventListener("keydown", this.handleKeyDown);
      document.body.addEventListener("keyup", this.handleKeyUp);
    }
  }

  componentWillUnmount() {
    if (!this.isWindows) {
      document.body.removeEventListener("keydown", this.handleKeyDown);
      document.body.removeEventListener("keyup", this.handleKeyUp);
    }
  }

  handleClose = () => {
    currentWindow.close();
  };

  handleKeyDown = (e) => {
    if (e.keyCode === KEY_ALT) {
      this.setState({
        keyAltDown: true,
      });
    }
  };

  handleKeyUp = (e) => {
    if (e.keyCode === KEY_ALT) {
      this.setState({
        keyAltDown: false,
      });
    }
  };

  handleMinimize = () => {
    currentWindow.minimize();
  };

  handleMaximize = () => {
    if (this.isWindows) {
      if (currentWindow.isMaximizable()) {
        if (currentWindow.isMaximized()) {
          currentWindow.unmaximize();

          this.setState({
            isMaximized: false,
          });
        } else {
          currentWindow.maximize();

          this.setState({
            isMaximized: true,
          });
        }
      }
    } else {
      const { keyAltDown } = this.state;

      if (keyAltDown) {
        if (currentWindow.isMaximizable()) {
          if (currentWindow.isMaximized()) {
            currentWindow.unmaximize();
          } else {
            currentWindow.maximize();
          }
        }
      } else {
        currentWindow.setFullScreen(!currentWindow.isFullScreen());
      }
    }
  };

  renderMac() {
    const { keyAltDown } = this.state;

    return (
      <Controls key="title-controls">
        <ButtonMacClose tabIndex="-1" onClick={this.handleClose}>
          <svg x="0px" y="0px" viewBox="0 0 6.4 6.4">
            <polygon
              fill="#4d0000"
              points="6.4,0.8 5.6,0 3.2,2.4 0.8,0 0,0.8 2.4,3.2 0,5.6 0.8,6.4 3.2,4 5.6,6.4 6.4,5.6 4,3.2"
            ></polygon>
          </svg>
        </ButtonMacClose>
        <ButtonMacMinimize tabIndex="-1" onClick={this.handleMinimize}>
          <svg x="0px" y="0px" viewBox="0 0 8 1.1">
            <rect fill="#995700" width="8" height="1.1"></rect>
          </svg>
        </ButtonMacMinimize>
        <ButtonMacMaximize
          showMaximize={keyAltDown}
          tabIndex="-1"
          onClick={this.handleMaximize}
        >
          <svg className="fullscreen-svg" x="0px" y="0px" viewBox="0 0 6 5.9">
            <path
              fill="#006400"
              d="M5.4,0h-4L6,4.5V0.6C5.7,0.6,5.3,0.3,5.4,0z"
            ></path>
            <path
              fill="#006400"
              d="M0.6,5.9h4L0,1.4l0,3.9C0.3,5.3,0.6,5.6,0.6,5.9z"
            ></path>
          </svg>
          <svg className="maximize-svg" x="0px" y="0px" viewBox="0 0 7.9 7.9">
            <polygon
              fill="#006400"
              points="7.9,4.5 7.9,3.4 4.5,3.4 4.5,0 3.4,0 3.4,3.4 0,3.4 0,4.5 3.4,4.5 3.4,7.9 4.5,7.9 4.5,4.5"
            ></polygon>
          </svg>
        </ButtonMacMaximize>
      </Controls>
    );
  }

  renderWindows() {
    const { isMaximized } = this.state;

    return (
      <Controls key="title-controls">
        <ButtonWindows
          aria-label="minimize"
          tabIndex="-1"
          onClick={this.handleMinimize}
        >
          <svg version="1.1" aria-hidden="true" width="10" height="10">
            <path d="M 0,5 10,5 10,6 0,6 Z" />
          </svg>
        </ButtonWindows>

        <ButtonWindows
          aria-label="maximize"
          tabIndex="-1"
          onClick={this.handleMaximize}
        >
          {isMaximized ? (
            <svg version="1.1" aria-hidden="true" width="10" height="10">
              <path d="m 2,1e-5 0,2 -2,0 0,8 8,0 0,-2 2,0 0,-8 z m 1,1 6,0 0,6 -1,0 0,-5 -5,0 z m -2,2 6,0 0,6 -6,0 z" />
            </svg>
          ) : (
            <svg version="1.1" aria-hidden="true" width="10" height="10">
              <path d="M 0,0 0,10 10,10 10,0 Z M 1,1 9,1 9,9 1,9 Z" />
            </svg>
          )}
        </ButtonWindows>
        <CloseButtonWindows
          aria-label="close"
          tabIndex="-1"
          onClick={this.handleClose}
        >
          <svg aria-hidden="true" version="1.1" width="10" height="10">
            <path d="M 0,0 0,0.7 4.3,5 0,9.3 0,10 0.7,10 5,5.7 9.3,10 10,10 10,9.3 5.7,5 10,0.7 10,0 9.3,0 5,4.3 0.7,0 Z" />
          </svg>
        </CloseButtonWindows>
      </Controls>
    );
  }

  render() {
    const { backgroundColor, title } = this.props;
    const elements = [];

    if (this.isWindows) {
      elements.push(
        <Text key="title-text" isWin={this.isWindows}>
          {title}
        </Text>
      );
      elements.push(this.renderWindows());
    } else {
      elements.push(this.renderMac());
      elements.push(
        <Text key="title-text" isWin={this.isWindows}>
          {title}
        </Text>
      );
    }

    return (
      <Container isWin={this.isWindows} backgroundColor={this.state.color}>
        {elements}
      </Container>
    );
  }
}

Titlebar.defaultProps = {
  title: null,
  backgroundColor: "#000000",
};

Titlebar.propTypes = {
  title: PropTypes.string,
  backgroundColor: PropTypes.string,
};

export default Titlebar;
