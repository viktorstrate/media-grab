console.log('Popup script background', browser.extension.getBackgroundPage())
console.log('Popup window', window)

browser.tabs.query({active: true, currentWindow: true})
    .then(tabs => {
      const activeTab = tabs[0].id

      const media = browser.extension.getBackgroundPage().tabMedia(activeTab)
      console.log('Media', media)

    })

