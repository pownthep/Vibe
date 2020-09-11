import React from "react";
import styled from "styled-components";

type Props = {
  backgroundColor: string;
};

export default function Titlebar({ backgroundColor }: Props) {
  const Container = styled.div<Props>`
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
  return <Container backgroundColor={backgroundColor}></Container>;
}
