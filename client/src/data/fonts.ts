/**
 * 可选字体:全部取自本机已安装的系统字体,不下载任何 webfont。
 * 没装 HarmonyOS Sans 的机器会自动回落到 SYSTEM_STACK,界面不受影响。
 */

/** 系统字体兜底栈 */
export const SYSTEM_STACK =
  "system-ui, -apple-system, 'Segoe UI Variable Text', 'Segoe UI', 'PingFang SC', " +
  "'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', sans-serif"

export interface FontOption {
  key: string
  label: string
  /** 字体族名;不同平台/安装包的叫法可能不一致,按优先级排 */
  families?: string[]
}

export const FONT_OPTIONS: FontOption[] = [
  {
    key: 'system',
    label: '系统默认'
  },
  {
    key: 'harmony',
    label: '鸿蒙黑体',
    families: ['HarmonyOS Sans SC', 'HarmonyOS Sans']
  },
  {
    // 雅黑是 Windows 自带的,不必安装;UI 版字面更清晰,优先用它
    key: 'yahei',
    label: '微软雅黑',
    families: ['Microsoft YaHei UI', 'Microsoft YaHei']
  }
]

export function findFont(key: string): FontOption {
  return FONT_OPTIONS.find((f) => f.key === key) ?? FONT_OPTIONS[0]
}

/** 指定字体排在系统栈前面,未安装时逐级回落 */
export function stackOf(opt: FontOption): string {
  if (!opt.families?.length) return SYSTEM_STACK
  return `${opt.families.map((n) => `'${n}'`).join(', ')}, ${SYSTEM_STACK}`
}
