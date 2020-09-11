export interface DriveInfo {
  name: string;
  size: string;
  id: string;
  mimeType: string;
  hasThumbnail: boolean;
  ownedByMe: boolean;
  thumbnailLink: string;
  iconLink: string;
}

export interface Episode {
  name: string;
  id: string;
  size: number;
}

export interface Show {
  id: number;
  name: string;
  banner: string;
  rating: number;
  desc: string;
  trailer: string;
  keywords: string;
  poster: string;
  episodes: Array<Episode>;
  imdb: string;
  type: string;
}

export interface Quota {
  user: {
    picture: {
      url: string;
    };
  };
  limit: number;
  usage: number;
  usageInDrive: number;
  usageInDriveTrash: number;
}

export interface DriveState {
  data: Array<DriveInfo>;
  info: Quota | null;
  loading: boolean;
}

export interface HistoryItem {
  id: string;
  ep: string;
  title: string;
  index: number;
  timePos: number;
  currentTime: number;
  duration: number | null;
}

export interface APIError {
  error: string;
}

export interface History {
  [index: string]: HistoryItem;
}

export interface Favourites {
  [index: string]: boolean;
}

export interface NavRoute {
  path: string;
  exact: boolean;
  component: () => JSX.Element;
  label: String;
  icon: any;
}

export interface IMDBSearchResponse {
  img: string;
  link: string;
  title: string;
}

export interface AuthenticateAPiResponse {
  authenticated: boolean;
  url?: string;
}
