import { Media } from './media'
import { Playlist } from './playlistParser/playlistParser';
import { PlaylistMediaDownloadStatus } from './download';

export interface BackgroundGlobals {
  tabMedia(id: number): Media[],
  downloadMedia(media: Media): void,
  downloadPlaylistMediaSegments(playlist: Playlist): AsyncIterableIterator<PlaylistMediaDownloadStatus>,
}