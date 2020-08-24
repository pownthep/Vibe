import styled from 'styled-components';

export const Container = styled.div`
  height: 55px;
  display: flex;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", Arial, sans-serif;
  background-color: ${props => props.backgroundColor};
  color: #FFF;
  -webkit-app-region: drag;
  flex-direction: row;
  position: fixed;
  box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
  z-index:5;
`;

export const Text = styled.div`
  display: flex;
  padding: 0 10px;
  justify-content: ${props => props.isWin ? 'flex-start' : 'center'};
  align-content: center;
  align-items: center;
  flex-grow: 1;
  text-align: center;
  font-family: 'Helvetica Neue', Helvetica;
  font-size: 12px;
  line-height: 22px;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -webkit-app-region: drag;
  user-select: none;
`;

export const Controls = styled.div`
  flex-grow: 0;
  flex-shrink: 0;
  margin-left: auto;
  height: 100%;
`;

const ButtonMac = styled.button`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin: 0px 4px;
  line-height: 0;
  padding: 0px;
  -webkit-app-region: no-drag;
  display: inline-block;
  position: relative;
  overflow: hidden;
  border: none;
  box-shadow: none;
`;

export const ButtonMacMaximize = styled(ButtonMac)`
  border: 1px solid #12ac28;
  background-color: #28c940;
  & svg.fullscreen-svg {
    width: 6px;
    height: 6px;
    position: absolute;
    top: 1px;
    left: 1px;
    opacity: 0;
  }
  & svg.maximize-svg {
    width: 6px;
    height: 6px;
    position: absolute;
    top: 1px;
    left: 1px;
    opacity: 0;
    display: none;
  }
  &:hover {
    svg.fullscreen-svg {
      opacity: ${props => props.showMaximize ? '0' : '1'};
      display: ${props => props.showMaximize ? 'none' : 'block'};
    }
    svg.maximize-svg {
      opacity: ${props => props.showMaximize ? '1' : '0'};
      display: ${props => props.showMaximize ? 'block' : 'none'};
    }
  }
  &:active {
    border-color: #128622;
    background-color: #1f9a31;
  }
`;

export const ButtonMacClose = styled(ButtonMac)`
  border: 1px solid #e2463f;
  background-color: #ff5f57;
  margin-left: 10px;
  & svg {
    width: 4px;
    height: 4px;
    position: absolute;
    top: 2px;
    left: 2px;
    opacity: 0;
  }
  &:hover {
    svg {
      opacity: 1;
    }
  }
  &:active {
    border-color: #ad3934;
    background-color: #bf4943;
  }
`;

export const ButtonMacMinimize = styled(ButtonMac)`
  border: 1px solid #e1a116;
  background-color: #ffbd2e;
  & svg {
    width: 6px;
    height: 6px;
    position: absolute;
    top: 1px;
    left: 1px;
    opacity: 0;
  }
  &:hover {
    svg {
      opacity: 1;
    }
  }
  &:active {
    border-color: #ad7d15;
    background-color: #bf9123;
  }
`;

export const ButtonWindows = styled.button`
  -webkit-app-region: no-drag;
  display: inline-block;
  position: relative;
  width: 45px;
  height: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
  border: none;
  box-shadow: none;
  border-radius: 0;
  color: #FFF;
  background-color: transparent;
  transition: background-color 0.25s ease;
  opacity: 1.0;
  & svg {
    fill: currentColor;
  }
  &:focus {
    outline: none;
  }
  &:hover {
    background-color: rgba(255,255,255,0.3);
    opacity: 1;
  }
  &:hover:active {
    background-color: rgba(255,255,255,0.2);
    transition: none;
    opacity: 1;
  }
`;

export const CloseButtonWindows = styled(ButtonWindows)`
  &:hover {
    color: #fff;
    background-color: #e81123;
    opacity: 1;
  }
  &:hover:active {
    color: #fff;
    background-color: #bf0f1d;
    transition: none;
    opacity: 1;
  }
`;