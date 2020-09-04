import styled from "styled-components";

type Props = {
  backgroundColor: string;
};

type OverlayProps = {
  type: string;
};

export const Container = styled.div<Props>`
  height: 65px;
  display: flex;
  position: fixed;
  z-index: 5;
`;

export const Overlay = styled.div<OverlayProps>`
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0), rgba(0,0,0,1));
  zIndex: 10;
  opacity: 0;
  transition: opacity 600ms ease-in-out;
  :hover {
    opacity: 1
  }
`;
