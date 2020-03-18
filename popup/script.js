const qs = document.querySelector.bind(document)
const qsa = document.querySelectorAll.bind(document)

console.log('Popup script background', browser.extension.getBackgroundPage())
console.log('Popup window', window)

browser.tabs.query({active: true, currentWindow: true})
    .then(tabs => {
      const activeTab = tabs[0].id

      const media = browser.extension.getBackgroundPage().tabMedia(activeTab)
      console.log('Media', media)

      if (!media) return

      const mediaList = qs("#media-list")

      mediaList.innerHTML = ""

      media.forEach(m => {
        const mediaElm = document.createElement("p")
        mediaElm.innerText = m.url

        mediaElm.onclick = () => {
          browser.extension.getBackgroundPage().downloadMedia(m)
        }

        mediaList.appendChild(mediaElm)
      })

    })

