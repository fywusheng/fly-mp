import { ref } from 'vue'
import hhznBikeSDK from '@/plugin/bleSdk/HHZNBikeSDK/HHZNBikeSDK.v1.0.3.js'
import { initBLuetoothAuth } from '@/utils'
import { openAndSearchAndConnect } from '@/utils/EvsBikeSdk'
import EVSBikeSDK from '@/utils/EVSBikeSDK.v1.1.1'

/**
 * 蓝牙SDK类型枚举
 */
export enum BluetoothSDKType {
  HUAHUI = 1, // 华慧 (对应 bluetoothDeviceType = 1)
  ECS = 2, // E车星 (对应 bluetoothDeviceType = 2)
}

/**
 * 蓝牙连接状态枚举
 */
export enum BluetoothStatus {
  DISCONNECTED = 0, // 未连接
  CONNECTING = 1, // 连接中
  CONNECTED = 2, // 已连接
}

/**
 * 蓝牙设备信息接口
 */
export interface BluetoothDeviceInfo {
  bluetoothDeviceNo: string | null
  bluetoothDeviceType: number | null
  bluetoothDeviceName: string | null
  bluetoothDeviceKey: string | null
}

/**
 * 车辆状态接口
 */
export interface VehicleState {
  batteryVoltageType: number
  batteryLevel: number
  isStarted: boolean
  isLocked: boolean
  isArmed: boolean
  isMuteArmOn: boolean
  isKeylessOn: boolean
  keylessType: boolean
  keylessRange: boolean
  warnCount: number
}

/**
 * 蓝牙状态变化回调数据
 */
export interface BluetoothStateData {
  operType: string
  message?: string
  success?: boolean
  state?: Partial<VehicleState>
}

/**
 * 蓝牙管理 Composable
 */
export function useBluetooth() {
  // 蓝牙连接状态
  const status = ref<BluetoothStatus>(BluetoothStatus.DISCONNECTED)

  // 当前使用的SDK类型
  const currentSDKType = ref<BluetoothSDKType | null>(null)

  // 当前使用的SDK实例
  let currentSDK: any = null

  // 车辆状态
  const vehicleState = ref<VehicleState>({
    batteryVoltageType: 48,
    batteryLevel: 0,
    isStarted: false,
    isLocked: true,
    isArmed: false,
    isMuteArmOn: false,
    isKeylessOn: false,
    keylessType: false,
    keylessRange: false,
    warnCount: 0,
  })

  // 状态变化回调列表
  const stateChangeCallbacks: Array<(data: BluetoothStateData) => void> = []

  /**
   * 根据设备类型获取对应的SDK实例
   */
  function getSDKInstance(sdkType: BluetoothSDKType): any {
    switch (sdkType) {
      case BluetoothSDKType.ECS:
        console.log('📦 使用 E车星 蓝牙 SDK')
        return EVSBikeSDK

      case BluetoothSDKType.HUAHUI:
        console.log('📦 使用 华慧智能 蓝牙 SDK')
        return hhznBikeSDK

      default:
        console.warn(`⚠️ 未知的 SDK 类型: ${sdkType}，使用默认 E车星 SDK`)
        return EVSBikeSDK
    }
  }

  /**
   * 蓝牙状态变化处理函数
   */
  function handleStateChange(data: BluetoothStateData) {
    if (data.state) {
      vehicleState.value = {
        ...vehicleState.value,
        ...data.state,
      }
    }

    // 触发所有回调
    stateChangeCallbacks.forEach(callback => callback(data))
  }

  /**
   * 连接蓝牙设备
   */
  async function connect(deviceInfo: BluetoothDeviceInfo): Promise<void> {
    try {
      // 检查设备信息
      if (!deviceInfo.bluetoothDeviceType) {
        throw new Error('缺少蓝牙设备类型信息')
      }

      if (!deviceInfo.bluetoothDeviceName && !deviceInfo.bluetoothDeviceNo) {
        throw new Error('缺少蓝牙设备名称或设备号')
      }

      // 检查蓝牙权限
      const hasAuth = await initBLuetoothAuth()
      if (!hasAuth) {
        throw new Error('请开启蓝牙权限')
      }

      status.value = BluetoothStatus.CONNECTING
      currentSDKType.value = deviceInfo.bluetoothDeviceType

      console.log('🔵 开始连接蓝牙设备:', {
        type: deviceInfo.bluetoothDeviceType === BluetoothSDKType.ECS ? 'E车星' : '华慧',
        name: deviceInfo.bluetoothDeviceName,
        deviceNo: deviceInfo.bluetoothDeviceNo,
      })

      // 获取对应的SDK实例
      currentSDK = getSDKInstance(deviceInfo.bluetoothDeviceType)

      // 根据SDK类型选择连接方式
      let device: { deviceId: string }

      if (deviceInfo.bluetoothDeviceType === BluetoothSDKType.ECS) {
        // E车星SDK：搜索并连接
        device = await openAndSearchAndConnect({
          name: deviceInfo.bluetoothDeviceName || deviceInfo.bluetoothDeviceNo,
        }) as { deviceId: string }
        console.log('🔍 E车星设备 ID:', device.deviceId)
      }
      else {
        // 华慧SDK：直接使用设备号
        device = {
          deviceId: deviceInfo.bluetoothDeviceNo || deviceInfo.bluetoothDeviceName || '',
        }
        console.log('🔍 华慧设备 ID:', device.deviceId)
      }

      // 连接设备
      await currentSDK.connect({
        deviceId: device.deviceId,
        type: 'at',
      })

      status.value = BluetoothStatus.CONNECTED
      console.log('✅ 蓝牙连接成功')

      // 订阅状态变化
      currentSDK.subscribe(handleStateChange)

      // 发送密码验证指令
      const password = deviceInfo.bluetoothDeviceKey || ''
      currentSDK.bleCommandsApi.sendBindOwnerCommand(password)
      console.log('🔐 发送密码验证指令')

      // 监听蓝牙连接状态变化
      wx.onBLEConnectionStateChange((res) => {
        console.log(`📱 蓝牙连接状态变化: ${res.deviceId}, connected: ${res.connected}`)

        if (!res.connected) {
          status.value = BluetoothStatus.DISCONNECTED
          console.warn('⚠️ 蓝牙连接已断开')
          currentSDK?.unsubscribe(handleStateChange)
        }
      })

      return Promise.resolve()
    }
    catch (error: any) {
      status.value = BluetoothStatus.DISCONNECTED
      currentSDKType.value = null
      console.error('❌ 蓝牙连接失败:', error)
      throw new Error(error.errMsg || error.message || '连接蓝牙失败')
    }
  }

  /**
   * 断开蓝牙连接
   */
  async function disconnect(): Promise<void> {
    try {
      if (!currentSDK) {
        console.warn('⚠️ 没有活动的蓝牙连接')
        return Promise.resolve()
      }

      console.log('🔌 断开蓝牙连接')
      await currentSDK.disconnect()

      status.value = BluetoothStatus.DISCONNECTED
      currentSDKType.value = null
      currentSDK.unsubscribe(handleStateChange)

      console.log('✅ 蓝牙已断开')
      return Promise.resolve()
    }
    catch (error) {
      console.error('❌ 断开蓝牙失败:', error)
      throw error
    }
  }

  /**
   * 发送开锁指令
   */
  function sendUnlockCommand() {
    if (!currentSDK) {
      console.error('❌ SDK 未初始化')
      return
    }
    console.log('🔓 发送开锁指令')
    currentSDK.bleCommandsApi.sendPowerOnCommand()
  }

  /**
   * 发送锁车指令
   */
  function sendLockCommand() {
    if (!currentSDK) {
      console.error('❌ SDK 未初始化')
      return
    }
    console.log('🔒 发送锁车指令')

    // 不同SDK的锁车指令不同
    if (currentSDKType.value === BluetoothSDKType.ECS) {
      currentSDK.bleCommandsApi.sendDisarmCommand()
    }
    else {
      currentSDK.bleCommandsApi.sendPowerOffCommand()
    }
  }

  /**
   * 发送设防指令
   */
  function sendArmCommand() {
    if (!currentSDK) {
      console.error('❌ SDK 未初始化')
      return
    }
    console.log('🛡️ 发送设防指令')
    currentSDK.bleCommandsApi.sendArmCommand()
  }

  /**
   * 发送解防指令
   */
  function sendDisarmCommand() {
    if (!currentSDK) {
      console.error('❌ SDK 未初始化')
      return
    }
    console.log('🔓 发送解防指令')
    currentSDK.bleCommandsApi.sendDisarmCommand()
  }

  /**
   * 发送寻车指令
   */
  function sendFindVehicleCommand() {
    if (!currentSDK) {
      console.error('❌ SDK 未初始化')
      return
    }
    console.log('🔔 发送寻车指令')
    uni.vibrateLong()
    currentSDK.bleCommandsApi.sendFindVehicleCommand()
  }

  /**
   * 发送获取车辆状态指令
   */
  function sendGetVehicleStatusCommand() {
    if (!currentSDK) {
      console.error('❌ SDK 未初始化')
      return
    }
    console.log('📊 发送获取车辆状态指令')
    currentSDK.bleCommandsApi.sendGetVehicleStatusCommand()
  }

  /**
   * 发送获取ECU配置指令
   */
  function sendGetEcuConfigCommand() {
    if (!currentSDK) {
      console.error('❌ SDK 未初始化')
      return
    }
    console.log('⚙️ 发送获取ECU配置指令')
    currentSDK.bleCommandsApi.sendGetEcuConfigCommand()
  }

  /**
   * 注册状态变化回调
   */
  function onStateChange(callback: (data: BluetoothStateData) => void) {
    stateChangeCallbacks.push(callback)
  }

  /**
   * 移除状态变化回调
   */
  function offStateChange(callback: (data: BluetoothStateData) => void) {
    const index = stateChangeCallbacks.indexOf(callback)
    if (index > -1) {
      stateChangeCallbacks.splice(index, 1)
    }
  }

  /**
   * 发送设置超速报警命令
   */
  function sendSetOverspeedAlarmCommand(value: number) {
    const sdk = getSDKInstance(currentSDKType.value)
    if (sdk?.bleCommandsApi?.sendSetOverspeedAlarmCommand) {
      sdk.bleCommandsApi.sendSetOverspeedAlarmCommand(value)
    }
  }

  /**
   * 发送学习遥控器命令
   */
  function sendLearnRemoteControlCommand() {
    const sdk = getSDKInstance(currentSDKType.value)
    if (sdk?.bleCommandsApi?.sendLearnRemoteControlCommand) {
      sdk.bleCommandsApi.sendLearnRemoteControlCommand()
    }
  }

  /**
   * 发送设置感应启动过期时间命令
   */
  function sendSetKeylessUnlockExpireCommand(expireDate: string) {
    const sdk = getSDKInstance(currentSDKType.value)
    if (sdk?.bleCommandsApi?.sendSetKeylessUnlockExpireCommand) {
      sdk.bleCommandsApi.sendSetKeylessUnlockExpireCommand(expireDate)
    }
  }

  /**
   * 发送关闭感应启动命令
   */
  function sendKeylessUnlockCloseCommand() {
    const sdk = getSDKInstance(currentSDKType.value)
    if (sdk?.bleCommandsApi?.sendKeylessUnlockCloseCommand) {
      sdk.bleCommandsApi.sendKeylessUnlockCloseCommand()
    }
  }

  /**
   * 发送设置感应启动距离命令
   */
  function sendSetKeylessUnlockRangeCommand(range: number) {
    const sdk = getSDKInstance(currentSDKType.value)
    if (sdk?.bleCommandsApi?.sendSetKeylessUnlockRangeCommand) {
      sdk.bleCommandsApi.sendSetKeylessUnlockRangeCommand(range)
    }
  }

  /**
   * 发送感应启动距离命令
   */
  function sendKeylessUnlockRangeCommand(distance: number) {
    const sdk = getSDKInstance(currentSDKType.value)
    if (sdk?.bleCommandsApi?.sendKeylessUnlockRangeCommand) {
      sdk.bleCommandsApi.sendKeylessUnlockRangeCommand(distance)
    }
  }

  return {
    // 状态
    status,
    vehicleState,
    currentSDKType,

    // 连接管理
    connect,
    disconnect,

    // 命令发送
    sendUnlockCommand,
    sendLockCommand,
    sendArmCommand,
    sendDisarmCommand,
    sendFindVehicleCommand,
    sendGetVehicleStatusCommand,
    sendGetEcuConfigCommand,
    sendSetOverspeedAlarmCommand,
    sendLearnRemoteControlCommand,
    sendSetKeylessUnlockExpireCommand,
    sendKeylessUnlockCloseCommand,
    sendSetKeylessUnlockRangeCommand,
    sendKeylessUnlockRangeCommand,

    // 回调管理
    onStateChange,
    offStateChange,
  }
}
