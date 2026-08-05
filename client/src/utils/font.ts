/** 中英混排的探测串:纯拉丁字符探不出中文字体的差异 */
const PROBE_TEXT = '永和九年岁在癸丑 Agy 123'

/** 拿三种通用字体做基线,目标字体只要和其中之一宽度不同就说明它真的被用上了 */
const GENERIC = ['monospace', 'serif', 'sans-serif']

/**
 * 判断本机是否装了某款字体。
 *
 * 不能用 document.fonts.check():Chrome 对未声明 @font-face 的族名一律返回 true,
 * 它判断的是"字体有没有加载完",不是"这个族名解析得到吗"。这里用经典的 canvas
 * 测宽法 —— 先用通用字体量一次,再用 "目标字体, 通用字体" 量一次,宽度变了说明
 * 目标字体生效了,没变说明直接回落到了通用字体。
 */
export function isFontAvailable(family: string): boolean {
  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) return true // 拿不到 canvas 就不做判断,避免误报"未安装"

  return GENERIC.some((generic) => {
    ctx.font = `16px ${generic}`
    const baseline = ctx.measureText(PROBE_TEXT).width
    ctx.font = `16px "${family}", ${generic}`
    return Math.abs(ctx.measureText(PROBE_TEXT).width - baseline) > 0.5
  })
}
