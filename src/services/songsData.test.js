import { describe, it, expect } from 'vitest';
import { songsData, getSongLinks } from './songsData';

describe('songsData.js Unit Tests', () => {
  it('should contain songs for all five primary emotions', () => {
    expect(songsData.anxious).toBeDefined();
    expect(songsData.stressed).toBeDefined();
    expect(songsData.sad).toBeDefined();
    expect(songsData.exhausted).toBeDefined();
    expect(songsData.calm).toBeDefined();
  });

  it('should have Bollywood and English languages specified', () => {
    const allSongs = [
      ...songsData.anxious,
      ...songsData.stressed,
      ...songsData.sad,
      ...songsData.exhausted,
      ...songsData.calm
    ];

    allSongs.forEach(song => {
      expect(song.title).toBeDefined();
      expect(song.artist).toBeDefined();
      expect(['Bollywood', 'English']).toContain(song.language);
      expect(song.whyItHelps).toBeDefined();
    });
  });

  it('should generate correct URL links using getSongLinks', () => {
    const testSong = {
      title: "Kun Faya Kun",
      youtubeQuery: "Kun Faya Kun Rockstar",
      spotifyQuery: "Kun Faya Kun A.R. Rahman"
    };

    const links = getSongLinks(testSong);
    expect(links.youtube).toContain('https://www.youtube.com/results?search_query=');
    expect(links.youtube).toContain('Kun%20Faya%20Kun%20Rockstar');
    
    expect(links.spotify).toContain('https://open.spotify.com/search/');
    expect(links.spotify).toContain('Kun%20Faya%20Kun%20A.R.%20Rahman');
  });
});
