import {Media} from '../background/Media'
import { browser } from "webextension-polyfill-ts"
import { BackgroundGlobals } from '../background/BackgroundGlobals'

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
        mediaElm.innerText = m.details.url

        mediaElm.onclick = () => {
          bgGlobals.downloadMedia(m)
        }

        mediaList.appendChild(mediaElm)
      })

    })

