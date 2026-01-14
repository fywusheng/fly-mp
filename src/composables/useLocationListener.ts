import type { LocationInfo } from './useRidingTracker'
import { onUnmounted, ref } from 'vue'
import { getLocation, initLocationAuth } from '@/utils'

/**
 * 位置监听 Composable
 */
export function useLocationListener() {
  // 是否正在监听
  const isListening = ref(false)

  // 位置变化回调列表
  const locationChangeCallbacks: Array<(location: LocationInfo) => void> = []

  /**
   * 开始监听位置变化
   */
  async function startListening(): Promise<void> {
    try {
      // 1. 请求后台定位权限
      const hasAuth = await initLocationAuth()
      if (!hasAuth) {
        throw new Error('未授权后台定位权限')
      }

      console.log('✅ 后台定位权限已授权')

      // 2. 开启后台定位
      await new Promise<void>((resolve, reject) => {
        wx.startLocationUpdateBackground({
          type: 'gcj02',
          success: () => {
            console.log('✅ 后台定位已开启')
            resolve()
          },
          fail: (err) => {
            console.error('❌ 开启后台定位失败:', err)
            reject(err)
          },
        })
      })

      // 3. 监听位置变化
      wx.onLocationChange((location) => {
        console.log('📍 位置变化:', location)

        // 触发所有回调
        locationChangeCallbacks.forEach((callback) => {
          callback(location as LocationInfo)
        })
      })

      isListening.value = true
      console.log('✅ 位置监听已开启')
    }
    catch (error) {
      console.error('❌ 开启位置监听失败:', error)
      throw error
    }
  }

  /**
   * 停止监听位置变化
   */
  function stopListening(): void {
    console.log('🛑 停止位置监听')

    // 1. 停止后台定位
    wx.stopLocationUpdate({
      success: () => {
        console.log('✅ 后台定位已停止')
      },
      fail: (err) => {
        console.error('❌ 停止后台定位失败:', err)
      },
    })

    // 2. 取消位置监听
    wx.offLocationChange()

    // 3. ✅ 清空所有回调
    locationChangeCallbacks.length = 0

    isListening.value = false
    console.log('✅ 位置监听已停止，回调已清空')
  }

  /**
   * 注册位置变化回调
   */
  function onLocationChange(callback: (location: LocationInfo) => void) {
    locationChangeCallbacks.push(callback)
    console.log('✅ 位置变化回调已注册，当前回调数:', locationChangeCallbacks.length)
  }

  /**
   * 移除位置变化回调
   */
  function offLocationChange(callback: (location: LocationInfo) => void) {
    const index = locationChangeCallbacks.indexOf(callback)
    if (index > -1) {
      locationChangeCallbacks.splice(index, 1)
      console.log('✅ 位置变化回调已移除，剩余回调数:', locationChangeCallbacks.length)
    }
  }

  /**
   * 获取当前位置（一次性）
   */
  async function getCurrentLocation(): Promise<LocationInfo> {
    try {
      const location = await getLocation()
      return location as LocationInfo
    }
    catch (error) {
      console.error('❌ 获取当前位置失败:', error)
      throw error
    }
  }

  // ✅ 组件卸载时自动清理
  onUnmounted(() => {
    if (isListening.value) {
      console.log('🧹 组件卸载，自动停止位置监听')
      stopListening()
    }
  })

  return {
    // 状态
    isListening,

    // 方法
    startListening,
    stopListening,
    onLocationChange,
    offLocationChange,
    getCurrentLocation,
  }
}
