
const tabMediaData = new Map()

function tabMedia(id) {
  return tabMediaData.get(id)
}

async function readMediaPlaylist(requestId) {
  let filter = browser.webRequest.filterResponseData(requestId);
  const dataBuffers = []
  let totalSize = 0

  filter.onstart = event => {
    console.log("started");
  }

  filter.ondata = event => {
    filter.write(event.data);
    dataBuffers.push(event.data)
    totalSize += event.data.byteLength
  }

  filter.onstop = event => {
    console.log("finished");
    filter.disconnect();
    console.log(dataBuffers)

    console.log('Total Size', totalSize)

    const finalBuffer = new Uint8Array(totalSize)

    let offset = 0

    for (const buf of dataBuffers) {
      finalBuffer.set(new Int8Array(buf), offset)
      offset += buf.byteLength
    }

    console.log(finalBuffer)
    const data = new TextDecoder("utf-8").decode(finalBuffer).trim()

    const files = data.split('\n').filter(x => !x.startsWith('#'))

    console.log('Files', files)
    return files
  }
}

function downloadMedia(media) {
  console.log('Downloading media', media.url)
}

async function responseCallback (details) {
  console.log('Media Grab: response', details)

  const files = await readMediaPlaylist(details.requestId)

  const tabs = await browser.tabs.query({active: true, currentWindow: true})
  const activeTab = tabs[0].id

  let tabMedia = []
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

browser.webRequest.onBeforeRequest.addListener(
  responseCallback,
  requestFilter,
  ["blocking"]
)

browser.browserAction.onClicked.addListener(function() {
  console.log('Popup clicked')
})

console.log('Media Grab: Loaded')
