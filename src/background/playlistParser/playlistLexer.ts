export interface PlaylistTagRaw {
  key: string,
  value: string
}

export interface PlaylistMediaRaw {
  url: URL,
  duration?: number,
  title?: string
}

export interface PlaylistToken {
  name: string,
  values: PlaylistTagRaw[],
  media?: PlaylistMediaRaw
}

export function playlistStringToTokens(playlistString: string, baseUrl: URL): PlaylistToken[] {
  const tokens: PlaylistToken[] = []

  const lines = playlistString
    .split("\n")
    .filter(line => line.trim().length > 0)
    .map(line => line.trim())

  if (stripLine(lines) != "#EXTM3U") {
    throw new Error("Not a valid M3U playlist, file must start with #EXTM3U")
  }

  while (lines.length > 0) {
    tokens.push(readToken(lines, baseUrl))
  }

  console.log('Playlist tokens', tokens)

  return tokens
}

function stripLine(lines: string[]): string {
  return lines.shift()
}

function readToken(lines: string[], baseUrl: URL) {
  const line = lines[0]

  if (line.startsWith("#EXT-X-")) {
    return readExtXToken(lines, baseUrl)
  }

  if (line.startsWith("#EXTINF")) {
    return readExtInfToken(lines, baseUrl)
  }

  console.log(`Could not interpret line: ${stripLine(lines)}`)
}

function readExtXToken(lines: string[], baseUrl: URL): PlaylistToken {

  const [_, name, valuesString] = stripLine(lines).match(/#EXT-X-([A-Z\-]+)(?::(.*))?/)

  let values: PlaylistTagRaw[] = []
  if (valuesString) {
    values = valuesString
      .trim()
      .split(",")
      .map(x => {
        const [key, value] = x.split("=")
        return {
          key, value
        } as PlaylistTagRaw
      })
  }

  const token: PlaylistToken = {
    name,
    values
  }

  if (name == "STREAM-INF") {
    const url = readURL(lines, baseUrl)
    token.media = {
      url
    }
  }

  return token
}

function readURL(lines: string[], baseUrl: URL): URL {
  let url: URL
  const urlString = stripLine(lines)

  if (urlString.startsWith("http")) {
    url = new URL(urlString)
  } else {
    url = new URL(baseUrl.href)
    url.pathname = url.pathname + urlString
  }

  return url
}

function readExtInfToken(lines: string[], baseUrl: URL): PlaylistToken {

  const [_, duration, title] = stripLine(lines).match(/#EXTINF:([\d]+(?:\.[\d]+)?),(.*)/)
  const url = readURL(lines, baseUrl)

  const token: PlaylistToken = {
    name: "EXTINF",
    values: [],
    media: {
      url,
      duration: parseFloat(duration),
      title
    }
  }

  return token
}