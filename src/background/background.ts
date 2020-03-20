import { browser, WebRequest } from "webextension-polyfill-ts"
import { BackgroundGlobals } from './BackgroundGlobals'
import { Media } from "./Media";
import { downloadMedia } from './download'

const tabMediaData = new Map<number, Media[]>();

let backgroundGlobals: BackgroundGlobals = {
  tabMedia,
  downloadMedia
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

  tabMedia.push({
    details
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
