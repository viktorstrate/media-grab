import { PlaylistTagRaw, playlistStringToTokens, PlaylistToken } from './playlistLexer'

export interface PlaylistHeader {
  rawTags: PlaylistToken[],
  independentSegments?: boolean,
  playlistType?: string,
}

export interface PlaylistSegment {
  url: URL,
  duration?: number
}

export enum PlaylistMediaType {
  PLAYLIST, SINGLE_MEDIA, MEDIA_SEGMENTS
}

export interface PlaylistMedia {
  rawTags: PlaylistToken[],
  segments: PlaylistSegment[]
  mediaType: PlaylistMediaType
  resolution?: string,
  frameRate?: number,
}

export interface Playlist {
  header: PlaylistHeader
  medias: PlaylistMedia[]
}

export function parsePlaylist(input: string, url: URL): Playlist {

  const baseUrl = url

  if (baseUrl.pathname.endsWith("/")) {
    baseUrl.pathname = baseUrl.pathname.substring(0, baseUrl.pathname.length-1)
  }
  baseUrl.pathname = baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/') + 1)

  const tokens = playlistStringToTokens(input, baseUrl)

  const result: Playlist = {
    header: {
      rawTags: []
    },
    medias: []
  }

  const mediaTokens: PlaylistToken[] = []

  for (const token of tokens) {
    if (token.media) {
      mediaTokens.push(token)
    } else {
      result.header.rawTags.push(token)

      switch (token.name) {
        case "INDEPENDENT-SEGMENTS":
          result.header.independentSegments = true
          break;
        case "PLAYLIST-TYPE":
          result.header.playlistType = token.values[0].key
      }

    }
  }

  let masterPlaylist = !mediaTokens[0].media.url.pathname.endsWith(".ts")

  if (masterPlaylist) {
    for (const mediaToken of mediaTokens) {

      const resolution = mediaToken.values.find(x => x.key == "RESOLUTION").value
      const frameRate = parseFloat(mediaToken.values.find(x => x.key = "FRAME-RATE").value)

      let mediaType = PlaylistMediaType.SINGLE_MEDIA

      if (mediaToken.media.url.pathname.endsWith(".m3u8")) {
        mediaType = PlaylistMediaType.PLAYLIST
      }

      const media: PlaylistMedia = {
        rawTags: [mediaToken],
        segments: [{
          url: mediaToken.media.url,
          duration: mediaToken.media.duration
        }],
        mediaType,
        resolution,
        frameRate
      }

      result.medias.push(media)
    }
  } else {
    let media: PlaylistMedia = {
      rawTags: [],
      segments: [],
      mediaType: PlaylistMediaType.MEDIA_SEGMENTS
    }

    for (const segment of mediaTokens) {
      media.segments.push({
        url: segment.media.url,
        duration: segment.media.duration
      })

      media.rawTags.push(segment)
    }

    result.medias.push(media)
  }

  return result
}
