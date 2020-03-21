import { browser } from 'webextension-polyfill-ts'
import { Media, MediaType, mediaToType } from "./Media"
import { parsePlaylist, PlaylistSegment, Playlist } from "./playlistParser/playlistParser"

export async function downloadMedia(media: Media) {
  switch(mediaToType(media)) {
    case MediaType.M3UPlaylist:
      await downloadPlaylist(media)
      break
    default:
      console.log("Download for media type not implemented")
  }
}
async function downloadPlaylist(media: Media) {
  console.log("Download playlist")
  const url = media.url.href

  const response = await fetch(url)

  if (!response.ok) {
    console.log('Response error', response)
    return
  }

  const playlistData = await response.text()

  console.log('Playlist data', playlistData)
  const playlist = parsePlaylist(playlistData, new URL(url))

  console.log('Playlist', playlist)

  if (playlist.header.playlistType == "VOD") {
    await downloadPlaylistMediaSegments(playlist)
    return
  }

  console.log('Did not know how to download playlist', playlist)
}

async function downloadPlaylistMediaSegments(playlist: Playlist) {
  const chunks = []
  let count = 0

  const firstMedia = playlist.medias[0]

  for await (const chunk of downloadPlaylistItems(firstMedia.segments)) {
    count++
    console.log(`Downloaded chunk ${count} of ${firstMedia.segments.length}`)
    chunks.push(chunk)
  }

  console.log('Download complete', chunks)
  const combined = new Blob(chunks)

  const mediaUrl = window.URL.createObjectURL(combined)
  await browser.downloads.download({
    url: mediaUrl,
    filename: "media.m4v"
  })
}

async function* downloadPlaylistItems(items: PlaylistSegment[]): AsyncIterableIterator<Blob> {
  for (const item of items) {
    const res = await fetch(item.url.href)

    if (!res.ok) {
      console.log("Response error", res)
      return
    }

    yield await res.blob()
  }
}