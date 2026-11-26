/**
 * 本地音乐播放器的曲目表。
 *
 * 音乐文件暂未提供（作者将在开发完成后补充）。补充步骤：
 * 1. 把音频放到 `public/music/`（体积预算见 docs/integrations/media-storage.md）；
 * 2. 在下方数组中登记曲目；
 * 3. 重新构建 —— 曲目为空时播放器不会渲染任何 UI。
 *
 * 播放器不自动播放（浏览器策略 + 可用性），也不跨页面续播：
 * 本站在 GitHub Pages 上是多页应用，跨页续播需要客户端路由（见 TD-29）。
 */
export interface Track {
  title: string;
  artist?: string;
  /** 相对站点根的路径，例如 'music/track-01.mp3'（会经 base 前缀解析） */
  src: string;
}

export const TRACKS: Track[] = [];

export const MUSIC_ENABLED = TRACKS.length > 0;
