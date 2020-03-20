export interface PlaylistItem {
  length: number,
  url: URL
}

export interface PlaylistTag {
  key: string,
  value: string
}

export interface Playlist {
  headerTags: PlaylistTag[]
  items: PlaylistItem[]
}

interface PlaylistReader {
  input: string
}

export function parsePlaylist(input: string, url: URL): Playlist {

  input = input.trim()

  const START_TAG = "#EXTM3U"

  if (!input.startsWith(START_TAG)) {
    console.log('Media Grab: Cannot parse invalid playlist')
    return null
  }

  input = input.substring(START_TAG.length).trim()

  const reader: PlaylistReader = {
    input: input
  }

  let result: Playlist = {
    headerTags: [],
    items: []
  }

  let lastTag = readTag(reader)
  while (lastTag != null) {
    result.headerTags.push(lastTag)
    lastTag = readTag(reader)
  }

  const baseUrl = url
  baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/') + 1)

  let lastItem = readItem(reader, baseUrl)
  while (lastItem != null) {
    result.items.push(lastItem)
    lastItem = readItem(reader, baseUrl)
  }

  console.log("Parsed playlist", result)

  return result
}

function readTag(reader: PlaylistReader): PlaylistTag {
  const PREFIX = "#EXT-X-"

  if (!reader.input.startsWith(PREFIX)) {
    return null
  }

  let line = reader.input.split("\n")[0]
  reader.input = reader.input.substring(reader.input.indexOf("\n")).trim()

  line = line.substring(PREFIX.length)
  const [key, value] = line.split(":")

  const tag: PlaylistTag = {
    key, value
  }

  return tag
}

function readItem(reader: PlaylistReader, baseUrl: URL): PlaylistItem {
  const PREFIX = "#EXTINF:"

  if (!reader.input.startsWith(PREFIX)) {
    const line = reader.input.split("\n")[0]
    console.log('Parser error, invalid line:', line)
    reader.input = reader.input.substring(line.length).trim()
    return null
  }

  let lines = reader.input.split("\n")

  const length = parseFloat(lines[0].match(/#EXTINF:([\d\.]+).*/)[1])
  const urlString = lines[1]

  let url: URL
  if (urlString.startsWith("http")) {
    url = new URL(urlString)
  } else {
    url = baseUrl
    url.pathname = url.pathname + "/" + urlString
  }

  reader.input = reader.input.substring(lines[0].length + lines[1].length + 2)

  return {
    length, url
  }
}
