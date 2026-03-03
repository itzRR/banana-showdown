// ============================================================
//  prefetch.js — Background prefetch for character videos
//
//  Call prefetchCharacterVideos() right after the first user
//  gesture (click-to-start) so videos load while the user
//  fills in the login/register form. By the time they reach
//  the character select page the browser cache already has
//  (at least part of) each video, so hover playback is instant
//  even on slow connections.
// ============================================================

const CHARACTER_VIDEOS = [
  '/characters/rehan.mp4',
  '/characters/thiwanka.mp4',
  '/characters/dhammika.mp4',
  '/characters/sithum.mp4',
  '/characters/supun.mp4',
  '/characters/oshan.mp4',
  '/characters/dinuka.mp4',
  '/characters/thimira.mp4',
  '/characters/frank.mp4',
  '/characters/oshadi.mp4',
  '/characters/bathiya.mp4',
  '/characters/madara.mp4',
  '/characters/avishka.mp4',
  '/characters/thejan.mp4',
  '/characters/Reeha.mp4',
  '/characters/sandunika.mp4',
  '/characters/nethmi.mp4',
  '/characters/Pasan.mp4',
  '/characters/Abdur.mp4',
];

let prefetchDone = false;

/**
 * Inject <link rel="prefetch" as="video"> tags for every character
 * video. Browsers download these at the lowest priority in the
 * background — they won't compete with the login UI or music.
 *
 * Safe to call multiple times; only runs once per session.
 */
export function prefetchCharacterVideos() {
  if (prefetchDone) return;
  prefetchDone = true;

  // Prefetch character videos
  CHARACTER_VIDEOS.forEach(src => {
    if (document.head.querySelector(`link[href="${src}"]`)) return;
    const link = document.createElement('link');
    link.rel  = 'prefetch';
    link.as   = 'video';
    link.href = src;
    document.head.appendChild(link);
  });

  // Prefetch fight.mp3 so it plays instantly on Battle confirm
  const fightLink = document.createElement('link');
  fightLink.rel  = 'prefetch';
  fightLink.as   = 'audio';
  fightLink.href = '/music/fight.mp3';
  document.head.appendChild(fightLink);
}
