const PLAYLIST_REGEX = /^https:\/\/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)(\?.*)?$/;

export function parseSpotifyPlaylistId(url: string): string | null {
  const trimmed = url.trim();
  const match = PLAYLIST_REGEX.exec(trimmed);
  return match?.[1] ?? null;
}

export function isValidSpotifyPlaylistUrl(url: string): boolean {
  return parseSpotifyPlaylistId(url) !== null;
}

export function toSpotifyEmbedUrl(url: string): string | null {
  const playlistId = parseSpotifyPlaylistId(url);
  if (!playlistId) {
    return null;
  }

  return `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`;
}
