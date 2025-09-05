/**
 * 防抖函数
 * @param fn 需要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => void>(fn: T, delay = 300): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (...args: Parameters<T>) {
    if (timer)
      clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param fn 需要节流的函数
 * @param delay 间隔时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => void>(fn: T, delay = 300): (...args: Parameters<T>) => void {
  let last = 0
  return function (...args: Parameters<T>) {
    const now = Date.now()
    if (now - last > delay) {
      last = now
      fn(...args)
    }
  }
}

/**
 * 获取车辆颜色对应的图片
 * @param colorCode 车辆颜色代码
 * @param type 车辆类型
 * @returns 车辆颜色对应的图片URL
 *
 */
export function getColorImg(colorCode: string, type = 'carList'): string {
  let colorImgMap: { [key: string]: string } = {}
  // 车辆颜色对应的图片
  if (type === 'bindCar') {
    colorImgMap = {
      // 星黛蓝
      STAR_BLUE: 'http://121.89.87.166/static/color/E75-blue.png',
      // 漫步白
      WALK_WHITE: 'http://121.89.87.166/static/color/E75-white.png',
      // 青竹绿
      BAMBOO_GREEN: 'http://121.89.87.166/static/color/E75-green.png',
      // 樱花粉
      CHERRY_PINK: 'http://121.89.87.166/static/color/E75-pink.png',
    }
  }
  else if (type === 'carList') {
    colorImgMap = {
      // 星黛蓝
      STAR_BLUE: 'http://121.89.87.166/static/color/E75-blue-card.png',
      // 漫步白
      WALK_WHITE: 'http://121.89.87.166/static/color/E75-white-card.png',
      // 青竹绿
      BAMBOO_GREEN: 'http://121.89.87.166/static/color/E75-green-card.png',
      // 樱花粉
      CHERRY_PINK: 'http://121.89.87.166/static/color/E75-pink-card.png',
    }
  }

  return colorImgMap[colorCode] || ''
}

/**
 * 生成标准UUID格式（v4）
 * @returns UUID字符串
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
