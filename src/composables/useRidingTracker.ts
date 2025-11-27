import { ref } from 'vue'
import { generateUUID } from '@/utils'
import { httpPost } from '@/utils/http'

/**
 * 位置信息接口
 */
export interface LocationInfo {
  latitude: number
  longitude: number
  speed?: number
  accuracy?: number
  altitude?: number
  verticalAccuracy?: number
  horizontalAccuracy?: number
}

/**
 * 骑行追踪状态
 */
export enum RidingTrackStatus {
  IDLE = 'idle', // 空闲状态
  RIDING = 'riding', // 骑行中
  UPLOADING = 'uploading', // 上传
}

/**
 * 骑行追踪配置
 */
export interface RidingTrackerConfig {
  uploadInterval?: number // 上传间隔（毫秒），默认 5000ms
  enableLog?: boolean // 是否启用日志，默认 true
}

/**
 * 骑行追踪 Composable
 */
export function useRidingTracker(config: RidingTrackerConfig = {}) {
  // 默认配置
  const {
    uploadInterval = 5 * 1000, // 5秒
    enableLog = true,
  } = config

  // 当前骑行ID
  const rideId = ref<string | null>(null)

  // 骑行状态
  const status = ref<RidingTrackStatus>(RidingTrackStatus.IDLE)

  // 上次上传时间戳
  let lastUploadTime = 0

  // 是否正在上传中
  let isUploading = false

  /**
   * 日志输出
   */
  function log(message: string, ...args: any[]) {
    if (enableLog) {
      console.log(`[骑行追踪] ${message}`, ...args)
    }
  }

  /**
   * 开始骑行
   * @param vehicleId 车辆ID
   * @param location 起始位置
   */
  async function startRiding(vehicleId: number, location: LocationInfo): Promise<void> {
    try {
      // 1. 生成骑行ID
      rideId.value = generateUUID()

      // 2. 重置状态
      lastUploadTime = 0
      isUploading = false
      status.value = RidingTrackStatus.RIDING

      log('🚴 开始骑行', {
        rideId: rideId.value,
        vehicleId,
        location,
      })

      // 3. 上报起点
      const res = await httpPost('/riding/ride/start', {
        bikeId: vehicleId,
        latitude: location.latitude,
        longitude: location.longitude,
        rideId: rideId.value,
        timestamp: Date.now(),
      })

      if (res.code === '200') {
        log('✅ 骑行开始状态上报成功')
        // 立即设置上传时间，避免开始后立即上传轨迹点
        lastUploadTime = Date.now()
      }
      else {
        log('❌ 骑行开始状态上报失败:', res.message)
        // 上报失败时重置状态
        resetStatus()
        throw new Error(res.message || '上报失败')
      }
    }
    catch (error: any) {
      log('❌ 开始骑行异常:', error)
      resetStatus()
      throw error
    }
  }

  /**
   * 上传位置轨迹点
   * @param location 位置信息
   */
  async function uploadLocation(location: LocationInfo): Promise<void> {
    // 1. 检查是否在骑行中
    if (!rideId.value || status.value === RidingTrackStatus.IDLE) {
      log('⚠️ 未在骑行中，跳过位置上传')
      return Promise.resolve()
    }

    // 2. 检查上传间隔
    const currentTime = Date.now()
    const timeSinceLastUpload = currentTime - lastUploadTime
    const shouldUpload = timeSinceLastUpload >= uploadInterval

    if (!shouldUpload) {
      const remainingTime = Math.ceil((uploadInterval - timeSinceLastUpload) / 1000)
      log(`⏳ 距下次上传还需 ${remainingTime} 秒`)
      return Promise.resolve()
    }

    // 3. 检查是否正在上传中（防止并发）
    if (isUploading) {
      log('⚠️ 正在上传中，跳过本次上传')
      return Promise.resolve()
    }

    try {
      // 4. 标记为上传中
      isUploading = true
      const prevStatus = status.value
      status.value = RidingTrackStatus.UPLOADING

      log('⬆️ 上传位置轨迹点', {
        距上次上传: `${Math.floor(timeSinceLastUpload / 1000)} 秒`,
        location,
      })

      // 5. 上传位置
      const res = await httpPost('/riding/ride/location', {
        accuracy: location.accuracy || 0,
        latitude: location.latitude,
        longitude: location.longitude,
        rideId: rideId.value,
        speed: location.speed || 0,
        timestamp: Date.now(),
      })

      if (res.code === '200') {
        log('✅ 位置上传成功')
        // 更新上次上传时间
        lastUploadTime = currentTime
      }
      else {
        log('❌ 位置上传失败:', res.message)
        throw new Error(res.message || '上传失败')
      }

      // 恢复之前的状态
      status.value = prevStatus
    }
    catch (error: any) {
      log('❌ 位置上传异常:', error)
      status.value = RidingTrackStatus.RIDING
      throw error
    }
    finally {
      // 6. 重置上传状态
      isUploading = false
    }
  }

  /**
   * 结束骑行
   * @param vehicleId 车辆ID
   * @param location 结束位置
   */
  async function endRiding(vehicleId: number, location: LocationInfo): Promise<void> {
    if (!rideId.value) {
      log('⚠️ 骑行ID不存在，无法结束骑行')
      return Promise.resolve()
    }

    try {
      log('🏁 结束骑行', {
        rideId: rideId.value,
        vehicleId,
        location,
      })

      // 上报终点
      const res = await httpPost('/riding/ride/end', {
        bikeId: vehicleId,
        latitude: location.latitude,
        longitude: location.longitude,
        rideId: rideId.value,
        timestamp: Date.now(),
      })

      if (res.code === '200') {
        log('✅ 骑行结束状态上报成功')
      }
      else {
        log('❌ 骑行结束状态上报失败:', res.message)
      }
    }
    catch (error: any) {
      log('❌ 结束骑行异常:', error)
    }
    finally {
      // 无论成功失败，都重置状态
      resetStatus()
    }
  }

  /**
   * 重置状态
   */
  function resetStatus() {
    rideId.value = null
    lastUploadTime = 0
    isUploading = false
    status.value = RidingTrackStatus.IDLE
    log('🔄 状态已重置')
  }

  /**
   * 获取当前骑行ID
   */
  function getRideId() {
    return rideId.value
  }

  /**
   * 获取当前状态
   */
  function getStatus() {
    return status.value
  }

  /**
   * 是否在骑行中
   */
  function isRiding() {
    return status.value === RidingTrackStatus.RIDING || status.value === RidingTrackStatus.UPLOADING
  }

  return {
    // 状态
    rideId,
    status,

    // 方法
    startRiding,
    uploadLocation,
    endRiding,
    resetStatus,
    getRideId,
    getStatus,
    isRiding,
  }
}
