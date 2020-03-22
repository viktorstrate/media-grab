<script>
  import Media from "./Media.svelte";
  import { fetchMedia } from "../fetchMedia";

  let mediaPromise = fetchMedia();
</script>

<div id="app">
  <h2>Media Grab</h2>
  {#await mediaPromise}
    <p>Loading...</p>
  {:then medias}
    {#each medias as media, i}
      Item {i}
      <Media {media} />
    {/each}
  {:catch error}
    <p>Error: {error.message}</p>
  {/await}
</div>
