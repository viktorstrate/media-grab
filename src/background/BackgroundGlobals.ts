import { Media } from './media'

export interface BackgroundGlobals {
  tabMedia(id: number): Media[],
  downloadMedia(media: Media): void
}