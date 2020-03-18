import { browser, WebRequest } from "webextension-polyfill-ts"
import { Media } from './Media'
import { BackgroundGlobals } from './BackgroundGlobals'

const tabMediaData = new Map<number, Media[]>();

let backgroundGlobals: BackgroundGlobals = {
  tabMedia,
  downloadMedia
};

(window as any).globals = backgroundGlobals

function tabMedia(id: number): Media[] {
  return tabMediaData.get(id)
}

function downloadMedia(media: Media) {
  console.log('Downloading media', media.url)
}

async function responseCallback (details: WebRequest.OnBeforeRequestDetailsType) {
  console.log('Media Grab: response', details)

  const playlistData = await fetch(details.url).then(res => res.text())
  const files = playlistData.split('\n').filter(x => !x.startsWith('#'))

  const tabs = await browser.tabs.query({active: true, currentWindow: true})
  const activeTab = tabs[0].id

  let tabMedia: Media[] = []
  if (tabMediaData.has(activeTab)) {
    tabMedia = tabMediaData.get(activeTab)
  }

  // const baseUrl = details.url.substring(0, details.url.lastIndexOf('/') + 1)
  tabMedia.push({
    url: details.url,
    timestamp: new Date(),
    playlist: files
  })

  tabMediaData.set(activeTab, tabMedia)

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

browser.browserAction.onClicked.addListener(function() {
  console.log('Popup clicked')
})

console.log('Media Grab: Loaded')
