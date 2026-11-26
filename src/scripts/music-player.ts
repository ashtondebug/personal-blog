/**
 * 本地音乐播放器（单页播放）。
 *
 * 约束（见 docs/product/feature-specifications.md §8 与 Phase 7 报告）：
 * - 不自动播放：必须由用户点击触发。
 * - 不跨页面续播：多页静态站切换页面会重建 <audio>；跨页续播需要客户端路由（TD-29）。
 * - 记住上次曲目（localStorage: blog:track），但不自动播放。
 */

interface Track {
  title: string;
  artist?: string;
  src: string;
}

const STORAGE_KEY = 'blog:track';

const root = document.querySelector<HTMLElement>('[data-music]');
if (root) {
  const audio = root.querySelector<HTMLAudioElement>('[data-music-audio]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-music-toggle]');
  const icon = root.querySelector<HTMLElement>('[data-music-icon]');
  const title = root.querySelector<HTMLElement>('[data-music-title]');
  const time = root.querySelector<HTMLElement>('[data-music-time]');
  const range = root.querySelector<HTMLInputElement>('[data-music-range]');
  const tracks: Track[] = JSON.parse(root.dataset.tracks ?? '[]');

  let index = 0;

  try {
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    if (Number.isInteger(saved) && saved >= 0 && saved < tracks.length) index = saved;
  } catch {
    /* 忽略存储错误 */
  }

  const format = (seconds: number): string => {
    if (!Number.isFinite(seconds)) return '0:00';
    const total = Math.max(0, Math.floor(seconds));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  };

  const render = (): void => {
    const track = tracks[index];
    if (!track) return;
    if (title) title.textContent = track.artist ? `${track.artist} — ${track.title}` : track.title;
    if (audio) audio.src = track.src;
    try {
      localStorage.setItem(STORAGE_KEY, String(index));
    } catch {
      /* 忽略 */
    }
  };

  const setIcon = (playing: boolean): void => {
    if (!audio || !toggle) return;
    const label = playing
      ? (toggle.dataset.labelPause ?? 'Pause')
      : (toggle.dataset.labelPlay ?? 'Play');
    toggle.setAttribute('aria-label', label);
    if (icon) icon.textContent = playing ? '⏸' : '▶';
  };

  const play = async (): Promise<void> => {
    if (!audio) return;
    try {
      await audio.play();
      setIcon(true);
    } catch {
      setIcon(false);
    }
  };

  const pause = (): void => {
    audio?.pause();
    setIcon(false);
  };

  const step = (delta: number): void => {
    if (tracks.length === 0) return;
    index = (index + delta + tracks.length) % tracks.length;
    const wasPlaying = audio ? !audio.paused : false;
    render();
    if (wasPlaying) void play();
  };

  toggle?.addEventListener('click', () => {
    if (!audio) return;
    if (audio.paused) void play();
    else pause();
  });

  root.querySelector<HTMLElement>('[data-music-prev]')?.addEventListener('click', () => step(-1));
  root.querySelector<HTMLElement>('[data-music-next]')?.addEventListener('click', () => step(1));

  audio?.addEventListener('timeupdate', () => {
    if (!audio) return;
    if (time) time.textContent = format(audio.currentTime);
    if (range && audio.duration > 0) {
      range.value = String(Math.round((audio.currentTime / audio.duration) * 1000));
    }
  });

  audio?.addEventListener('ended', () => step(1));
  audio?.addEventListener('play', () => setIcon(true));
  audio?.addEventListener('pause', () => setIcon(false));

  range?.addEventListener('input', () => {
    if (!audio || audio.duration <= 0) return;
    audio.currentTime = (Number(range.value) / 1000) * audio.duration;
  });

  render();
  setIcon(false);
}
