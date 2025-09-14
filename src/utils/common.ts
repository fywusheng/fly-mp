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
  else if (type === 'home') {
    colorImgMap = {
      // 星黛蓝
      STAR_BLUE: 'http://121.89.87.166/static/color/E75-blue-home.png',
      // 漫步白
      WALK_WHITE: 'http://121.89.87.166/static/color/E75-white-home.png',
      // 青竹绿
      BAMBOO_GREEN: 'http://121.89.87.166/static/color/E75-green-home.png',
      // 樱花粉
      CHERRY_PINK: 'http://121.89.87.166/static/color/E75-pink-home.png',
    }
  }
  else if (type === 'avatar') {
    colorImgMap = {
      // 星黛蓝
      STAR_BLUE: 'http://121.89.87.166/static/color/E75-blue-avatar.png',
      // 漫步白
      WALK_WHITE: 'http://121.89.87.166/static/color/E75-white-avatar.png',
      // 青竹绿
      BAMBOO_GREEN: 'http://121.89.87.166/static/color/E75-green-avatar.png',
      // 樱花粉
      CHERRY_PINK: 'http://121.89.87.166/static/color/E75-pink-avatar.png',
    }
  }

  return colorImgMap[colorCode] || ''
}

/**
 *
 * @param weather 天气状况
 * @returns
 */
export function getWeatherIcon(weather: string): string {
  const weatherIconMap: { [key: string]: string } = {
    晴: 'http://121.89.87.166/static/weather/sun.png',
    雨: 'http://121.89.87.166/static/weather/rain.png',
    大雨: 'http://121.89.87.166/static/weather/rain.png',
    小雨: 'http://121.89.87.166/static/weather/rain.png',
    雪: 'http://121.89.87.166/static/weather/snow.png',
    云: 'http://121.89.87.166/static/weather/cloudy.png',
    多云: 'http://121.89.87.166/static/weather/cloudy.png',
  }
  return weatherIconMap[weather] || 'http://121.89.87.166/static/weather/sun.png'
}

/**
 *
 * @param weather 天气状况
 * @returns
 */
export function getPopWeatherIcon(weather: string): string {
  const weatherIconMap: { [key: string]: string } = {
    晴: 'http://121.89.87.166/static/weather/sun-bg.png',
    雨: 'http://121.89.87.166/static/weather/rain-bg.png',
    大雨: 'http://121.89.87.166/static/weather/rain-bg.png',
    小雨: 'http://121.89.87.166/static/weather/rain-bg.png',
    雪: 'http://121.89.87.166/static/weather/snow-bg.png',
    云: 'http://121.89.87.166/static/weather/cloudy-bg.png',
    多云: 'http://121.89.87.166/static/weather/cloudy-bg.png',
  }
  return weatherIconMap[weather] || ''
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
