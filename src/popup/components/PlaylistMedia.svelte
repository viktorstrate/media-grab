<script>
  import { parsePlaylist } from "../../background/playlistParser/playlistParser.ts";
  export let playlist;

  const PlaylistMediaType = {
    Playlist: 0,
    SingleMedia: 1,
    MediaSegments: 2
  };

  function mediaTypeToString(type) {
    switch (type) {
      case PlaylistMediaType.Playlist:
        return "Playlist";
      case PlaylistMediaType.SingleMedia:
        return "Single media";
      case PlaylistMediaType.MediaSegments:
        return "Media segments";
    }

    return `Unknown: ${type}`;
  }

  function fetchMedia(media) {
    if (media.mediaType == PlaylistMediaType.Playlist) {
      console.log("Fetching media playlist", media.segments[0].url);

      media.subPlaylist = (async () => {
        const url = media.segments[0].url;
        const res = await fetch(url);
        const playlistData = await res.text();

        console.log("Playlist data", playlistData);

        return parsePlaylist(playlistData, url);
      })();
      playlist = playlist;
    }

    if (media.mediaType == PlaylistMediaType.MediaSegments) {
      console.log("Downloading media segments");

      const downloadSegments = browser.extension.getBackgroundPage().globals
        .downloadPlaylistMediaSegments;
      downloadSegments(playlist);

      browser.runtime.sendMessage({
        type: "downloadPlaylistMediaSegments",
        playlist: JSON.stringify(playlist)
      });
    }
  }
</script>

<style>
  p {
    margin: 0;
  }

  li {
    margin: 8px 0;
  }
</style>

<div class="playlist-item">
  <ul>
    {#each playlist.medias as media, i}
      <li>
        <p>
          {#if media.resolution}Resolution {media.resolution}{/if}
        </p>
        <p>Type: {mediaTypeToString(media.mediaType)}</p>
        {#if media.mediaType == PlaylistMediaType.MediaSegments}
          <p>
            <button
              on:click={() => {
                fetchMedia(media);
              }}>
              Download media
            </button>
          </p>
        {/if}
        <p>
          {#if media.segments.length == 1}
            Segment:
            <small
              on:click={() => {
                fetchMedia(media);
              }}>
              {media.segments[0].url}
            </small>
          {:else}Segments: {media.segments.length}{/if}
        </p>
        <p>
          {#if media.subPlaylist !== undefined}
            {#await media.subPlaylist}
              <p>Downloading sub playlist...</p>
            {:then plist}
              <b>Sub Playlist</b>
              <svelte:self playlist={plist} />
            {:catch err}
              <b>ERROR: {err.message}</b>
            {/await}
          {/if}
        </p>
      </li>
    {/each}
  </ul>
</div>
