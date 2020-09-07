import styled from "styled-components";

type Props = {
  backgroundColor: string;
};

type OverlayProps = {
  type: string;
};

export const Container = styled.div<Props>`
  height: 25px;
  display: flex;
  position: fixed;
  z-index: 8;
  -webkit-app-region: drag;
  width: 100%;
  background-color: transparent;
  &:hover: {
    background-color: ${(props) => props.backgroundColor};
  }
`;

export const Overlay = styled.div<OverlayProps>`
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(
    rgba(0, 0, 0, 0.2),
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 1)
  );
  zindex: 10;
  opacity: 0;
  transition: opacity 600ms ease-in-out;
  :hover {
    opacity: 1;
  }
`;
