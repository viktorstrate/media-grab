import { WebRequest } from "webextension-polyfill-ts";
import { Playlist, PlaylistMedia } from "./playlistParser/playlistParser";

export enum MediaType {
  M3UPlaylist
}

export interface MediaGroup {
  media: Media[]
}

export interface Media {
  url: URL,
  type: MediaType,
  details?: WebRequest.OnCompletedDetailsType,

  // Avaliable if type is M3UPlaylist
  playlist?: Playlist,
}
