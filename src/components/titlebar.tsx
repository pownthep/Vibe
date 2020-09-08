import React from "react";
import { Container } from "../utils/styles";

type Props = {
  backgroundColor: string;
};

export default function Titlebar({ backgroundColor }: Props) {
  return <Container backgroundColor={backgroundColor}></Container>;
}
