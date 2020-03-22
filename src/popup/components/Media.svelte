<script>
  import PlaylistMedia from "./PlaylistMedia.svelte";
  export let media;

  const MEDIA_TYPE_PLAYLIST = 0;
</script>

<div class="media-item">
  Media Item
  {#if media.type == MEDIA_TYPE_PLAYLIST}
    <PlaylistMedia playlist={media.playlist} />
  {/if}
</div>
