import { pages, subPackages } from '@/pages.json'
import { isMpWeixin } from './platform'

export function getLastPage() {
  // getCurrentPages() 至少有1个元素，所以不再额外判断
  // const lastPage = getCurrentPages().at(-1)
  // 上面那个在低版本安卓中打包会报错，所以改用下面这个【虽然我加了 src/interceptions/prototype.ts，但依然报错】
  const pages = getCurrentPages()
  return pages[pages.length - 1]
}

/**
 * 获取当前页面路由的 path 路径和 redirectPath 路径
 * path 如 '/pages/login/index'
 * redirectPath 如 '/pages/demo/base/route-interceptor'
 */
export function currRoute() {
  const lastPage = getLastPage()
  const currRoute = (lastPage as any).$page
  // console.log('lastPage.$page:', currRoute)
  // console.log('lastPage.$page.fullpath:', currRoute.fullPath)
  // console.log('lastPage.$page.options:', currRoute.options)
  // console.log('lastPage.options:', (lastPage as any).options)
  // 经过多端测试，只有 fullPath 靠谱，其他都不靠谱
  const { fullPath } = currRoute as { fullPath: string }
  // console.log(fullPath)
  // eg: /pages/login/index?redirect=%2Fpages%2Fdemo%2Fbase%2Froute-interceptor (小程序)
  // eg: /pages/login/index?redirect=%2Fpages%2Froute-interceptor%2Findex%3Fname%3Dfeige%26age%3D30(h5)
  return getUrlObj(fullPath)
}

function ensureDecodeURIComponent(url: string) {
  if (url.startsWith('%')) {
    return ensureDecodeURIComponent(decodeURIComponent(url))
  }
  return url
}
/**
 * 解析 url 得到 path 和 query
 * 比如输入url: /pages/login/index?redirect=%2Fpages%2Fdemo%2Fbase%2Froute-interceptor
 * 输出: {path: /pages/login/index, query: {redirect: /pages/demo/base/route-interceptor}}
 */
export function getUrlObj(url: string) {
  const [path, queryStr] = url.split('?')
  // console.log(path, queryStr)

  if (!queryStr) {
    return {
      path,
      query: {},
    }
  }
  const query: Record<string, string> = {}
  queryStr.split('&').forEach((item) => {
    const [key, value] = item.split('=')
    // console.log(key, value)
    query[key] = ensureDecodeURIComponent(value) // 这里需要统一 decodeURIComponent 一下，可以兼容h5和微信y
  })
  return { path, query }
}
/**
 * 得到所有的需要登录的 pages，包括主包和分包的
 * 这里设计得通用一点，可以传递 key 作为判断依据，默认是 needLogin, 与 route-block 配对使用
 * 如果没有传 key，则表示所有的 pages，如果传递了 key, 则表示通过 key 过滤
 */
export function getAllPages(key = 'needLogin') {
  // 这里处理主包
  const mainPages = pages
    .filter(page => !key || page[key])
    .map(page => ({
      ...page,
      path: `/${page.path}`,
    }))

  // 这里处理分包
  const subPages: any[] = []
  subPackages.forEach((subPageObj) => {
    // console.log(subPageObj)
    const { root } = subPageObj

    subPageObj.pages
      .filter(page => !key || page[key])
      .forEach((page: { path: string } & Record<string, any>) => {
        subPages.push({
          ...page,
          path: `/${root}/${page.path}`,
        })
      })
  })
  const result = [...mainPages, ...subPages]
  // console.log(`getAllPages by ${key} result: `, result)
  return result
}

/**
 * 得到所有的需要登录的 pages，包括主包和分包的
 * 只得到 path 数组
 */
export const getNeedLoginPages = (): string[] => getAllPages('needLogin').map(page => page.path)

/**
 * 得到所有的需要登录的 pages，包括主包和分包的
 * 只得到 path 数组
 */
export const needLoginPages: string[] = getAllPages('needLogin').map(page => page.path)

/**
 * 根据微信小程序当前环境，判断应该获取的 baseUrl
 */
export function getEnvBaseUrl() {
  // 请求基准地址
  let baseUrl = import.meta.env.VITE_SERVER_BASEURL

  // 微信小程序端环境区分
  if (isMpWeixin) {
    const {
      miniProgram: { envVersion },
    } = uni.getAccountInfoSync()

    switch (envVersion) {
      case 'develop':
        baseUrl = import.meta.env.VITE_SERVER_BASEURL__WEIXIN_DEVELOP || baseUrl
        break
      case 'trial':
        baseUrl = import.meta.env.VITE_SERVER_BASEURL__WEIXIN_TRIAL || baseUrl
        break
      case 'release':
        baseUrl = import.meta.env.VITE_SERVER_BASEURL__WEIXIN_RELEASE || baseUrl
        break
    }
  }

  return baseUrl
}

/**
 * 根据微信小程序当前环境，判断应该获取的 UPLOAD_BASEURL
 */
export function getEnvBaseUploadUrl() {
  // 请求基准地址
  let baseUploadUrl = import.meta.env.VITE_UPLOAD_BASEURL

  // 微信小程序端环境区分
  if (isMpWeixin) {
    const {
      miniProgram: { envVersion },
    } = uni.getAccountInfoSync()

    switch (envVersion) {
      case 'develop':
        baseUploadUrl = import.meta.env.VITE_UPLOAD_BASEURL__WEIXIN_DEVELOP || baseUploadUrl
        break
      case 'trial':
        baseUploadUrl = import.meta.env.VITE_UPLOAD_BASEURL__WEIXIN_TRIAL || baseUploadUrl
        break
      case 'release':
        baseUploadUrl = import.meta.env.VITE_UPLOAD_BASEURL__WEIXIN_RELEASE || baseUploadUrl
        break
    }
  }

  return baseUploadUrl
}

/**
 * 获取当前位置
 * @returns {Promise<uni.GetLocationSuccessRes>} 当前位置
 */
export function getLocation() {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: 'wgs84',
      success: (res) => {
        resolve(res)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

/**
 * 获取位置权限
 * @returns {Promise<void>}
 */
export function initLocationAuth() {
  return new Promise((resolve, reject) => {
    uni.getSetting({
      success(res) {
        // 检测地理位置权限
        if (!res.authSetting['scope.userLocationBackground']) {
          uni.showModal({
            title: '请求权限',
            content: '需要获取您的后台定位权限,如已授权请点击取消',
            success(res) {
              if (res.confirm) {
                uni.openSetting({
                  success(res) {
                    if (res.authSetting['scope.userLocationBackground']) {
                      // 用户同意授权地理位置
                      resolve(true)
                    }
                    else {
                      reject(new Error('用户拒绝授权地理位置'))
                    }
                  },
                })
              }
              else if (res.cancel) {
                reject(new Error('用户拒绝授权地理位置'))
              }
            },
            fail(err) {
              reject(err)
            },
          })
        }
        else {
          // 已经授权
          resolve(true)
        }
      },
    })
  })
}
/**
 * 判断是否获取蓝牙权限
 * @returns {Promise<void>} 获取蓝牙权限
 */
export async function initBLuetoothAuth() {
  const hasNetwork = await getNetworkType()
  return new Promise((resolve, reject) => {
    if (hasNetwork !== 'none' && hasNetwork !== 'offline') {
      uni.getSetting({
        success(res) {
          // 检测蓝牙权限
          if (!res.authSetting['scope.bluetooth']) {
            wx.authorize({
              scope: 'scope.bluetooth',
              success() {
                resolve(true)
              },
              fail(err) {
                console.log('authorize fail:', err)
                uni.showModal({
                  title: '请求权限',
                  content: '已拒绝使用蓝牙功能，是否允许启用？',
                  success(res) {
                  // if (res.confirm) {
                    uni.openSetting({
                      success(res) {
                        if (res.authSetting['scope.bluetooth']) {
                        // 用户同意授权蓝牙
                          resolve(true)
                        }
                        else {
                          reject(new Error('用户拒绝授权蓝牙'))
                        }
                      },
                    })
                  // }
                  // else if (res.cancel) {
                  //   reject(new Error('用户拒绝授权蓝牙'))
                  // }
                  },
                  fail(err) {
                    reject(err)
                  },
                })
              },
            })
          }
          else {
            resolve(true)
          }
        },
        fail(err) {
          console.log('getSetting fail:', err)
          reject(err)
        },
      })
    }
    else {
      // 尝试打开蓝牙模块
      uni.openBluetoothAdapter({
        success() {
          resolve(true)
        },
        fail(err) {
          console.log('openBluetoothAdapter fail:', err)

          // 常见错误码处理
          if (err.errCode === 10001) {
          // 10001 = 系统蓝牙未开启
            uni.showModal({
              title: '蓝牙未开启',
              content: '请打开手机系统蓝牙后再试',
              showCancel: false,
              success() {
                reject(new Error('系统蓝牙未开启'))
              },
            })
          }
          else {
            uni.showModal({
              title: '蓝牙不可用',
              content: '当前设备蓝牙不可用，请检查后重试。',
              showCancel: false,
            })
            reject(err)
          }
        },
      })
    }
  })
}

function getNetworkType() {
  return new Promise<string>((resolve, reject) => {
    uni.getNetworkType({
      success: (res) => {
        resolve(res.networkType)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

// 导出防抖和节流函数
export { debounce, generateUUID, getColorImg, throttle } from './common'
