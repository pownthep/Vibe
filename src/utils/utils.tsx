import React from "react";

export const fmtName = (s: String): string => {
  return s
    .replace(/\[(.+?)\]/g, "")
    .replace(/\((.+?)\)/g, "")
    .replace("Copy of ", "")
    .replace("-", " ")
    .replace(".mkv", "")
    .trim();
};

export const openFolder = (path: String): void => {
  window.openPath(path);
};

export const openPath = (path: String): void => {
  window.openPath(path);
};

export const toHHMMSS = (s: number): string => {
  var date = new Date(0);
  date.setSeconds(s);
  return date.toISOString().substr(11, 8).replace("00:", "");
};

export const getPreviewURL = (id: String): string => {
  return `https://pownthep-storage.b-cdn.net/previews/${id}.png`;
};

export const getPath = (id: String): string => {
  return `${window.directory}/server/downloaded/${id}.mp4`;
};

/* View in fullscreen */
export const openFullscreen = (): void => {
  var elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  }
};

/* Close fullscreen */
export const closeFullscreen = (): void => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  }
};

export const toDate = (s: number): string => {
  var t = new Date(s);
  return t.toLocaleString();
};

export const handleError = (error: any) => {
  console.error(error);
};

export const renderJSON = (json: any) => {
  return <pre>{JSON.stringify(json, null, 2)}</pre>;
};

export const vh = (v: number) => {
  var h = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0
  );
  return (v * h) / 100;
};
