import { browser } from "webextension-polyfill-ts"
import { BackgroundGlobals } from "../background/BackgroundGlobals"
import { Media } from "../background/media"

const bgGlobals = (browser.extension.getBackgroundPage() as any).globals as BackgroundGlobals

export async function fetchMedia(): Promise<Media[]> {

  const activeTab = parseInt(new URLSearchParams(window.location.search).get('tab'))

  let media = bgGlobals.tabMedia(activeTab)

  if (media === undefined || media === null) {
    media = []
  }

  return media
}
