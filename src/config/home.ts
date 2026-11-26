/**
 * 首页专用配置。
 *
 * HERO_IMAGE：首页主视觉的背景插画（二次元素材由作者提供后填写）。
 * 建议放在 `public/images/` 下，值写相对站点根的路径（会自动加 base），例如：
 *   export const HERO_IMAGE = 'images/home-hero.webp';
 * 留空时首页使用 CSS 绘制的几何主视觉（月牙 + 地平线 + 网点），不会出现破图。
 */
export const HERO_IMAGE: string | undefined = undefined;

/** 主视觉上的日文副标题（装饰用，不参与词典） */
export const HERO_JP_LABEL = 'ザ・コモンズ';

/**
 * 首页主视觉的打字机句子（按语言）。
 *
 * - 中文两句由作者提供；繁体为同一文本的繁体写法。
 * - 其他语言暂无对应文案，回退到该语言的 `site.tagline`（不擅自机器翻译）。
 * 新增语言文案时在这里补一个 key 即可，不要写进组件。
 */
export const HERO_LINES: Record<string, string[]> = {
  'zh-CN': [
    '蠢事赢蠢奖，把头伸进马桶测抽水速度赢不了诺贝尔奖，只会把自己闷死在里面收获达尔文奖',
    '万物皆有裂痕，那是光照进来的地方',
  ],
  'zh-TW': [
    '蠢事贏蠢獎，把頭伸進馬桶測抽水速度贏不了諾貝爾獎，只會把自己悶死在里面收穫達爾文獎',
    '萬物皆有裂痕，那是光照進來的地方',
  ],
};
