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
 * 轨迹点数据接口
 */
export interface RidePoint {
  latitude: number
  longitude: number
  speed?: number
  accuracy?: number
  timestamp: number
}

/**
 * 单次骑行轨迹记录
 */
export interface RideRecord {
  rideId: string
  vehicleId: number
  startTime: number
  endTime: number
  points: RidePoint[]
}

// ✅ 模块级别单例状态（全局唯一，不会因组件重新渲染而重置）
const globalRideId = ref<string | null>(null)
const globalStatus = ref<RidingTrackStatus>(RidingTrackStatus.IDLE)
const globalVehicleId = ref<number | null>(null) // ✅ 当前骑行的车辆ID
let globalLastUploadTime = 0
let globalIsUploading = false
let globalRidePoints: RidePoint[] = [] // ✅ 当前骑行的轨迹点
let globalStartTime = 0 // ✅ 骑行开始时间

/**
 * 骑行追踪 Composable（单例模式）
 */
export function useRidingTracker(config: RidingTrackerConfig = {}) {
  // 默认配置
  const {
    uploadInterval = 5 * 1000, // 5秒
    enableLog = true,
  } = config

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
  // 支持外部传入 rideId；未传入则内部生成
  async function startRiding(vehicleId: number, location: LocationInfo, rideId?: string): Promise<string> {
    try {
      // ✅ 如果已经在骑行中
      if (globalRideId.value && globalStatus.value === RidingTrackStatus.RIDING) {
        // ✅ 检查是否是同一辆车
        if (globalVehicleId.value === vehicleId) {
          log('⚠️ 同一车辆已在骑行中，返回当前 rideId:', globalRideId.value)
          return globalRideId.value
        }
        else {
          // ✅ 不同车辆，先结束当前骑行
          log('⚠️ 检测到车辆切换，先结束当前骑行')
          await endRiding(globalVehicleId.value!, location)
        }
      }

      // 1. 使用外部传入的 rideId 或内部生成
      globalRideId.value = rideId || generateUUID()
      globalVehicleId.value = vehicleId // ✅ 保存当前车辆ID

      // 2. 重置状态
      globalLastUploadTime = 0
      globalIsUploading = false
      globalRidePoints = [] // ✅ 清空轨迹点
      globalStartTime = Date.now() // ✅ 记录开始时间
      globalStatus.value = RidingTrackStatus.RIDING

      log('🚴 开始骑行', {
        rideId: globalRideId.value,
        vehicleId,
        location,
      })

      // 3. 上报起点（使用传入或生成的 rideId）
      const res = await httpPost('/riding/ride/start', {
        bikeId: vehicleId,
        latitude: location.latitude,
        longitude: location.longitude,
        rideId: globalRideId.value,
        timestamp: Date.now(),
      })

      if (res.code === '200') {
        log('✅ 骑行开始状态上报成功，rideId:', globalRideId.value)
        // 立即设置上传时间，避免开始后立即上传轨迹点
        globalLastUploadTime = Date.now()
        // ✅ 添加起点到轨迹数组
        globalRidePoints.push({
          latitude: location.latitude,
          longitude: location.longitude,
          speed: location.speed,
          accuracy: location.accuracy,
          timestamp: globalStartTime,
        })
        return globalRideId.value
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
   * @param vehicleId 可选，用于校验车辆一致性
   */
  async function uploadLocation(location: LocationInfo, vehicleId?: number): Promise<void> {
    // ✅ 使用全局 rideId
    const currentRideId = globalRideId.value

    // 1. 检查是否在骑行中
    if (!currentRideId || globalStatus.value === RidingTrackStatus.IDLE) {
      log('⚠️ 未在骑行中，跳过位置上传')
      return Promise.resolve()
    }

    // ✅ 2. 检查车辆一致性（如果传入了 vehicleId）
    if (vehicleId !== undefined && globalVehicleId.value !== vehicleId) {
      log('⚠️ 车辆ID不匹配，跳过位置上传', {
        当前骑行车辆: globalVehicleId.value,
        上传请求车辆: vehicleId,
      })
      return Promise.resolve()
    }

    // 3. 检查上传间隔
    const currentTime = Date.now()
    const timeSinceLastUpload = currentTime - globalLastUploadTime
    const shouldUpload = timeSinceLastUpload >= uploadInterval

    if (!shouldUpload) {
      const remainingTime = Math.ceil((uploadInterval - timeSinceLastUpload) / 1000)
      log(`⏳ 距下次上传还需 ${remainingTime} 秒`)
      return Promise.resolve()
    }

    // 3. 检查是否正在上传中（防止并发）
    if (globalIsUploading) {
      log('⚠️ 正在上传中，跳过本次上传')
      return Promise.resolve()
    }

    try {
      // 4. 标记为上传中
      globalIsUploading = true
      const prevStatus = globalStatus.value
      globalStatus.value = RidingTrackStatus.UPLOADING

      log('⬆️ 上传位置轨迹点', {
        rideId: currentRideId,
        vehicleId: globalVehicleId.value,
        距上次上传: `${Math.floor(timeSinceLastUpload / 1000)} 秒`,
        location,
      })

      // 5. 上传位置（✅ 使用传入或全局的 rideId）
      const res = await httpPost('/riding/ride/location', {
        accuracy: location.accuracy || 0,
        latitude: location.latitude,
        longitude: location.longitude,
        rideId: currentRideId,
        speed: location.speed || 0,
        timestamp: Date.now(),
      })

      if (res.code === '200') {
        log('✅ 位置上传成功，rideId:', currentRideId)
        // 更新上次上传时间
        globalLastUploadTime = currentTime
        // ✅ 添加轨迹点到数组
        globalRidePoints.push({
          latitude: location.latitude,
          longitude: location.longitude,
          speed: location.speed,
          accuracy: location.accuracy,
          timestamp: currentTime,
        })
      }
      else {
        log('❌ 位置上传失败:', res.message)
        throw new Error(res.message || '上传失败')
      }

      // 恢复之前的状态
      globalStatus.value = prevStatus
    }
    catch (error: any) {
      log('❌ 位置上传异常:', error)
      globalStatus.value = RidingTrackStatus.RIDING
      throw error
    }
    finally {
      // 6. 重置上传状态
      globalIsUploading = false
    }
  }

  /**
   * 结束骑行
   * @param vehicleId 车辆ID
   * @param location 结束位置
   */
  async function endRiding(vehicleId: number, location: LocationInfo): Promise<void> {
    // ✅ 使用全局 rideId
    const currentRideId = globalRideId.value

    if (!currentRideId) {
      log('⚠️ 骑行ID不存在，无法结束骑行')
      return Promise.resolve()
    }

    // ✅ 校验车辆一致性
    if (globalVehicleId.value && globalVehicleId.value !== vehicleId) {
      log('⚠️ 车辆ID不匹配，使用当前骑行的车辆ID', {
        当前骑行车辆: globalVehicleId.value,
        传入车辆: vehicleId,
      })
      vehicleId = globalVehicleId.value
    }

    try {
      log('🏁 结束骑行', {
        rideId: currentRideId,
        vehicleId,
        location,
      })

      // 上报终点（✅ 使用同一个 rideId）
      const res = await httpPost('/riding/ride/end', {
        bikeId: vehicleId,
        latitude: location.latitude,
        longitude: location.longitude,
        rideId: currentRideId,
        timestamp: Date.now(),
      })

      if (res.code === '200') {
        log('✅ 骑行结束状态上报成功，rideId:', currentRideId)
      }
      else {
        log('❌ 骑行结束状态上报失败:', res.message)
      }
    }
    catch (error: any) {
      log('❌ 结束骑行异常:', error)
    }
    finally {
      // ✅ 保存轨迹到Storage
      await saveRidePointsToStorage(currentRideId, vehicleId, location)
      // 无论成功失败，都重置状态
      resetStatus()
    }
  }

  /**
   * 重置状态
   */
  function resetStatus() {
    globalRideId.value = null
    globalVehicleId.value = null // ✅ 重置车辆ID
    globalLastUploadTime = 0
    globalIsUploading = false
    globalRidePoints = [] // ✅ 清空轨迹点
    globalStartTime = 0 // ✅ 重置开始时间
    globalStatus.value = RidingTrackStatus.IDLE
    log('🔄 状态已重置')
  }

  /**
   * ✅ 保存轨迹点到Storage
   */
  async function saveRidePointsToStorage(rideId: string, vehicleId: number, endLocation: LocationInfo): Promise<void> {
    try {
      // 添加终点到轨迹
      const endTime = Date.now()
      const finalPoints = [
        ...globalRidePoints,
        {
          latitude: endLocation.latitude,
          longitude: endLocation.longitude,
          speed: endLocation.speed,
          accuracy: endLocation.accuracy,
          timestamp: endTime,
        },
      ]

      // 构建骑行记录
      const rideRecord: RideRecord = {
        rideId,
        vehicleId,
        startTime: globalStartTime,
        endTime,
        points: finalPoints,
      }

      // 获取已有的轨迹记录
      let existingRecords: RideRecord[] = []
      try {
        const stored = uni.getStorageSync('ridePoints')
        if (stored) {
          existingRecords = JSON.parse(stored)
        }
      }
      catch (e) {
        log('⚠️ 读取已有轨迹记录失败，将创建新的记录')
      }

      // 添加新记录
      existingRecords.push(rideRecord)

      // 保存到Storage
      uni.setStorageSync('ridePoints', JSON.stringify(existingRecords))
      // log(`✅ 轨迹已保存到Storage : ${JSON.stringify(rideRecord)}`)
    }
    catch (error: any) {
      log('❌ 保存轨迹到Storage失败:', error)
    }
  }

  /**
   * ✅ 获取所有已保存的轨迹记录
   */
  function getRidePointsFromStorage(): RideRecord[] {
    try {
      const stored = uni.getStorageSync('ridePoints')
      if (stored) {
        return JSON.parse(stored)
      }
    }
    catch (e) {
      log('⚠️ 读取轨迹记录失败')
    }
    return []
  }

  /**
   * ✅ 清空Storage中的轨迹记录
   */
  function clearRidePointsStorage(): void {
    try {
      uni.removeStorageSync('ridePoints')
      log('✅ 轨迹记录已清空')
    }
    catch (e) {
      log('❌ 清空轨迹记录失败')
    }
  }

  /**
   * ✅ 切换车辆（强制结束当前骑行并重置状态）
   * @param location 当前位置（用于结束骑行上报）
   */
  async function switchVehicle(location?: LocationInfo): Promise<void> {
    log('🔄 切换车辆')

    // 如果正在骑行中，先结束当前骑行
    if (globalRideId.value && globalVehicleId.value && globalStatus.value !== RidingTrackStatus.IDLE) {
      if (location) {
        log('🏁 切换车辆前结束当前骑行')
        await endRiding(globalVehicleId.value, location)
      }
      else {
        log('⚠️ 无位置信息，直接重置状态')
        resetStatus()
      }
    }
    else {
      // 确保状态干净
      resetStatus()
    }
  }

  /**
   * 获取当前骑行ID
   */
  function getRideId() {
    return globalRideId.value
  }

  /**
   * ✅ 获取当前骑行车辆ID
   */
  function getVehicleId() {
    return globalVehicleId.value
  }

  /**
   * 获取当前状态
   */
  function getStatus() {
    return globalStatus.value
  }

  /**
   * 是否在骑行中
   */
  function isRiding() {
    return globalStatus.value === RidingTrackStatus.RIDING || globalStatus.value === RidingTrackStatus.UPLOADING
  }

  return {
    // ✅ 暴露全局状态（只读访问）
    rideId: globalRideId,
    vehicleId: globalVehicleId, // ✅ 新增
    status: globalStatus,

    // 方法
    startRiding,
    uploadLocation,
    endRiding,
    switchVehicle, // ✅ 新增
    resetStatus,
    getRideId,
    getVehicleId, // ✅ 新增
    getStatus,
    isRiding,
    // ✅ 轨迹存储相关
    getRidePointsFromStorage,
    clearRidePointsStorage,
  }
}
