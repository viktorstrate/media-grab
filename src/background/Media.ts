import { WebRequest } from "webextension-polyfill-ts";
import { Playlist } from "./playlistParser/playlistParser";

export enum MediaType {
  M3UPlaylist
}

export interface MediaGroup {
  media: Media[]
}

export interface Media {
  url: URL,
  details?: WebRequest.OnCompletedDetailsType,
  playlist?: Playlist
}

export function mediaToType(media: Media): MediaType {
  return MediaType.M3UPlaylist
}
