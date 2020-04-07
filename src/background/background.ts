import { browser, WebRequest, Runtime } from "webextension-polyfill-ts"
import { BackgroundGlobals } from './BackgroundGlobals'
import { Media, MediaType } from "./Media";
import { downloadMedia, downloadPlaylistMediaSegments } from './download'
import { parsePlaylist, PlaylistMediaType, Playlist } from "./playlistParser/playlistParser";

const tabMediaData = new Map<number, Media[]>();

let backgroundGlobals: BackgroundGlobals = {
  tabMedia,
  downloadMedia,
  downloadPlaylistMediaSegments
};

(window as any).globals = backgroundGlobals

function tabMedia(id: number): Media[] {
  return tabMediaData.get(id)
}

async function responseCallback (details: WebRequest.OnCompletedDetailsType) {

  // Most likely a background fetch
  if (details.tabId == -1) {
    console.log('Media Grab: ignoring request')
    return
  }

  console.log('Media Grab: response', details)

  const tabs = await browser.tabs.query({active: true, currentWindow: true})
  const activeTab = tabs[0].id

  let tabMedia: Media[] = []
  if (tabMediaData.has(activeTab)) {
    tabMedia = tabMediaData.get(activeTab)
  }

  if (tabMedia.filter(m => m.details.url == details.url).length > 0) {
    console.log('Media Grab: found duplicate')
    return
  }

  const playlistData = await fetch(details.url)
    .then(res => res.text())

  const playlist = parsePlaylist(playlistData, new URL(details.url))

  if (playlist.medias.length == 0) {
    console.log('Could not find media in playlist')
    return
  }

  tabMedia.push({
    type: MediaType.M3UPlaylist,
    url: new URL(details.url),
    details,
    playlist,
  })

  tabMediaData.set(activeTab, tabMedia)

  console.log('Tab media', tabMedia)

  browser.browserAction.setBadgeText(
    {
      text: "" + tabMedia.length,
      tabId: activeTab
    }
  )

}

const requestFilter = {
  urls: ["*://*/*.m3u8", "*://*/*.m3u"],
}

browser.webRequest.onCompleted.addListener(
  details => {
    responseCallback(details)
  },
  requestFilter,
  []
)

browser.browserAction.onClicked.addListener(async function() {
  console.log('Popup clicked')

  const tabs = await browser.tabs.query({active: true, currentWindow: true})
  const activeTab = tabs[0].id

  const popupUrl = browser.extension.getURL("popup/popup.html") + "?tab=" + activeTab

  browser.windows.create({
    url: popupUrl,
    type: "popup",
    width: 640,
    height: 480
  })
})

console.log('Media Grab: Loaded')
