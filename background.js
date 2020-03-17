function responseCallback (details) {
  console.log('Media Grab: response', details)

  browser.tabs.query({active: true, currentWindow: true})
    .then(tabs => {
      const activeTab = tabs[0]

      browser.browserAction.setBadgeText(
        {
          text: "1",
          tabId: activeTab.id
        }
      )
    })

  let filter = browser.webRequest.filterResponseData(details.requestId);
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


  }

}

const requestFilter = {
  urls: ["*://*/*.m3u8"],
  // types: ["media"]
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
