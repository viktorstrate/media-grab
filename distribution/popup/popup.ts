import {Media} from '../media'
import { browser } from "webextension-polyfill-ts"

const qs = document.querySelector.bind(document)
const qsa = document.querySelectorAll.bind(document)

const bgpage = browser.extension.getBackgroundPage()
const bgFuncs = {
  tabMedia: (bgpage as any).tabMedia as (tab: number) => Media[],
  downloadMedia: (bgpage as any).downloadMedia
}

console.log('Popup script background', browser.extension.getBackgroundPage())
console.log('Popup window', window)

browser.tabs.query({active: true, currentWindow: true})
    .then(tabs => {
      const activeTab = tabs[0].id

      const media = bgFuncs.tabMedia(activeTab)
      console.log('Media', media)

      if (!media) return

      const mediaList = qs("#media-list")

      mediaList.innerHTML = ""

      media.forEach(m => {
        const mediaElm = document.createElement("p")
        mediaElm.innerText = m.url

        mediaElm.onclick = () => {
          bgFuncs.downloadMedia(m)
        }

        mediaList.appendChild(mediaElm)
      })

    })

