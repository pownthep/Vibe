import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { navState } from "../App";
import Container from "../components/common-components/container";

export default function Upload() {
  const setNavState = useSetRecoilState(navState);

  useEffect(() => {
    setNavState("Upload");

    return () => {};
  }, [setNavState]);

  return <Container></Container>;
}
