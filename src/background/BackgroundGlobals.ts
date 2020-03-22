import { Media } from './media'
import { Playlist } from './playlistParser/playlistParser';

export interface BackgroundGlobals {
  tabMedia(id: number): Media[],
  downloadMedia(media: Media): void,
  downloadPlaylistMediaSegments(playlist: Playlist): Promise<void>,
}