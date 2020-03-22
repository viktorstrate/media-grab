import {Media, MediaType} from '../background/Media'
import { browser } from "webextension-polyfill-ts"
import { BackgroundGlobals } from '../background/BackgroundGlobals'
import { PlaylistMediaType, parsePlaylist } from '../background/playlistParser/playlistParser'

const qs = document.querySelector.bind(document)
const qsa = document.querySelectorAll.bind(document)

const bgGlobals = (browser.extension.getBackgroundPage() as any).globals as BackgroundGlobals

console.log('Popup script background', browser.extension.getBackgroundPage())
console.log('Popup window', window)

browser.tabs.query({active: true, currentWindow: true})
    .then(tabs => {
      const activeTab = tabs[0].id

      const media = bgGlobals.tabMedia(activeTab)
      console.log('Media', media)

      if (!media) return

      const mediaList = qs("#media-list")

      mediaList.innerHTML = ""

      media.forEach(m => {
        const mediaElm = document.createElement("p")
        mediaElm.innerText = m.url.href

        mediaElm.onclick = async () => {

          if (m.type == MediaType.M3UPlaylist) {
            if (m.playlistMedia.mediaType == PlaylistMediaType.PLAYLIST) {
              console.log('Downloading playlist')

              const request = await fetch(m.url.href)
              if (!request.ok) {
                console.log('Request failed', request)
                return
              }

              const playlistData = await request.text()
              const playlist = parsePlaylist(playlistData, m.url)

              if (playlist.medias[0].mediaType != PlaylistMediaType.MEDIA_SEGMENTS) {
                console.log('Did not find media segments inside playlist, this is not implemented yet', playlist)
                return
              }

              console.log('Downloading media segments inside playlist')

              await bgGlobals.downloadPlaylistMediaSegments(playlist)

            } else {
              bgGlobals.downloadMedia(m)
            }

          }
        }

        mediaList.appendChild(mediaElm)
      })

    })

