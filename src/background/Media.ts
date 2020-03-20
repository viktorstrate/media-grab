import { WebRequest } from "webextension-polyfill-ts";

export enum MediaType {
  Playlist
}

export interface Media {
  details: WebRequest.OnCompletedDetailsType
}

export function mediaToType(media: Media): MediaType {
  return MediaType.Playlist
}
