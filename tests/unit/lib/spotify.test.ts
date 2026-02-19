import { describe, expect, it } from "vitest";
import {
  isValidSpotifyPlaylistUrl,
  parseSpotifyPlaylistId,
  toSpotifyEmbedUrl
} from "@/lib/spotify";

describe("spotify helpers", () => {
  it("extracts playlist ID from a valid URL", () => {
    expect(parseSpotifyPlaylistId("https://open.spotify.com/playlist/37i9dQZF1DX4JAvHpjipBk")).toBe(
      "37i9dQZF1DX4JAvHpjipBk"
    );
  });

  it("returns null for invalid URLs", () => {
    expect(parseSpotifyPlaylistId("https://spotify.com/playlist/123")).toBeNull();
    expect(parseSpotifyPlaylistId("not-a-url")).toBeNull();
  });

  it("validates playlist URLs", () => {
    expect(isValidSpotifyPlaylistUrl("https://open.spotify.com/playlist/37i9dQZF1DX4JAvHpjipBk")).toBe(true);
    expect(isValidSpotifyPlaylistUrl("https://open.spotify.com/track/37i9dQZF1DX4JAvHpjipBk")).toBe(false);
  });

  it("maps playlist URL to embed URL", () => {
    expect(toSpotifyEmbedUrl("https://open.spotify.com/playlist/37i9dQZF1DX4JAvHpjipBk")).toBe(
      "https://open.spotify.com/embed/playlist/37i9dQZF1DX4JAvHpjipBk?utm_source=generator"
    );
    expect(toSpotifyEmbedUrl("bad-url")).toBeNull();
  });
});
