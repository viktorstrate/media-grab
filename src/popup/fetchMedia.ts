import { browser } from "webextension-polyfill-ts"
import { BackgroundGlobals } from "../background/BackgroundGlobals"
import { Media } from "../background/media"

const bgGlobals = (browser.extension.getBackgroundPage() as any).globals as BackgroundGlobals

export async function fetchMedia(): Promise<Media[]> {
  const tabs = await browser.tabs.query({active: true, currentWindow: true})
  const activeTab = tabs[0]

  let media = bgGlobals.tabMedia(activeTab.id)

  if (media === undefined || media === null) {
    media = []
  }

  return media
}
