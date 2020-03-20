import { Media, MediaType, mediaToType } from "./Media"
import { parsePlaylist } from "./playlistParser"

export async function downloadMedia(media: Media) {
  switch(mediaToType(media)) {
    case MediaType.Playlist:
      await downloadPlaylist(media)
      break
    default:
      console.log("Download for media type not implemented")
  }
}

async function downloadPlaylist(media: Media) {
  console.log("Download playlist")
  const url = media.details.url

  const playlistData = await fetch(url).then(res => res.text())

  console.log('Playlist data', playlistData)
  const playlist = parsePlaylist(playlistData, new URL(url))

  const mediaParts = playlistData.trim()
    .split('\n')
    .map(url => url.trim())
    .filter(x => !x.startsWith('#'))

  console.log('Found files', mediaParts)

}