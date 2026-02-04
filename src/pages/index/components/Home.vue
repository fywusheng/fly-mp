<script setup lang="ts">
// ✅ 导入蓝牙管理 Composable
import type { BluetoothDeviceInfo } from '@/composables/useBluetooth'
import { useQueue } from 'wot-design-uni'
import { BluetoothStatus, useBluetooth } from '@/composables/useBluetooth'
import { useLocationListener } from '@/composables/useLocationListener'
import { useRidingTracker } from '@/composables/useRidingTracker'
import { useAppStore, useCarStore, useUserStore } from '@/store'
import { debounce, getColorImg, getLocation, initLocationAuth } from '@/utils'
import { getWeatherIcon } from '@/utils/common'
import { httpGet, httpPost } from '@/utils/http'
import { getImageUrl } from '@/utils/image'
import HomeMap from './HomeMap.vue'
import HomeMapNetWork from './HomeMapNetWork.vue'
import WeatherPop from './WeatherPop.vue'

defineOptions({
  name: 'Home',
})
const props = defineProps({
  tabName: {
    type: String,
  },
})
const { closeOutside } = useQueue()

type CommandType
  = | 'lock'
    | 'unlock'
    | 'defense'
    | 'undefense'
    | 'onekeymuteon'
    | 'find'

// ✅ 初始化蓝牙管理
const {
  status: bluetoothStatus,
  vehicleState: bluetoothVehicleState,
  currentSDKType,
  connect: connectBluetooth,
  disconnect: disconnectBluetooth,
  sendUnlockCommand,
  sendLockCommand,
  sendArmCommand,
  sendDisarmCommand,
  sendFindVehicleCommand,
  sendGetVehicleStatusCommand,
  sendGetEcuConfigCommand,
  onStateChange: onBluetoothStateChange,
  offStateChange: offBluetoothStateChange,
} = useBluetooth()

const ArrowIcon = getImageUrl('/home/arrow.png')
const BlueConnect = getImageUrl('/home/blue-connect.png')
const BLueDisconnect = getImageUrl('/home/blue-disconnect.png')
const CloseBtnIcon = getImageUrl('/home/close-bth.png')
const CloseBtnBrayIcon = getImageUrl('/home/close-btn-gray.png')
const CloseBtnRedIcon = getImageUrl('/home/close-btn-red.png')
const DownIcon = getImageUrl('/home/down.png')
const FlyTitleIcon = getImageUrl('/home/fly-title.png')
const FlyTextIcon = getImageUrl('/home/fly-text.png')
const InductionOpenIcon = getImageUrl('/home/induction-open.png')
const InductionIcon = getImageUrl('/home/induction.png')
const LocationIcon = getImageUrl('/home/location.png')
const LockOpenIcon = getImageUrl('/home/lock-open.png')
const LockIcon = getImageUrl('/home/lock.png')
const ReloadIcon = getImageUrl('/home/reload.png')
const SpeakerOpenIcon = getImageUrl('/home/speaker-open.png')
const SpeakerIcon = getImageUrl('/home/speaker.png')
const TopIcon = getImageUrl('/home/top-bg.png')
const WarnNoticeIcon = getImageUrl('/home/warn-icon.png')
const WarningIcon = getImageUrl('/home/warning.png')
const WhistleOpenIcon = getImageUrl('/home/whistle-open.png')
const WhistleIcon = getImageUrl('/home/whistle.png')
const BlueOpen = getImageUrl('/home/blue-open.png')
const BlueClose = getImageUrl('/home/blue-close.png')
const WarnInfo = getImageUrl('/home/warn-info.png')
const Bat0 = getImageUrl('/home/bat-0.png')
const Bat1 = getImageUrl('/home/bat-1.png')
const Bat2 = getImageUrl('/home/bat-2.png')
const Bat3 = getImageUrl('/home/bat-3.png')
const Bat4 = getImageUrl('/home/bat-4.png')
const Bat5 = getImageUrl('/home/bat-5.png')

const pickerClass = ref('transparent-picker')

// 用户信息
const userStore = useUserStore()
// 车辆信息
const carStore = useCarStore()
// app信息 hasNetwork 手机设备是否连接网络
const appStore = useAppStore()

// 获取胶囊位置信息
const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
let getCarInfoTimer = null
const isControling = ref(false) // 是否正在控车
const shouldPoll = ref(true) // 轮询开关

// 初始化骑行追踪
const {
  rideId: currentRideId,
  status: ridingStatus,
  startRiding,
  uploadLocation,
  endRiding,
  switchVehicle, // ✅ 切换车辆时重置骑行状态
  isRiding,
} = useRidingTracker({
  uploadInterval: 5 * 1000, // 5秒上传一次
  enableLog: true,
})

// 初始化位置监听
const {
  isListening,
  startListening,
  stopListening,
  onLocationChange,
  getCurrentLocation,
} = useLocationListener()

// 天气信息
const weatherInfo = ref<{
  wea: string
  tem: number | string
  tem1: number | string
  tem2: number | string
  hours?: Array<{ hours: string, wea: string }>
  simpleWeather?: Array<{ hours: string, wea: string }>
}>({ wea: '', tem: '', tem1: '', tem2: '', simpleWeather: [] })
// 天气弹窗显示
const weatherPopVisible = ref(false)

// 滑动开锁相关
const startX = ref(0)
const sliderX = ref(0)
const maxRight = ref(0)
const sliderStyle = ref({})

// ✅ 蓝牙状态由useBluetooth composable管理（bluetoothStatus）
// 蓝牙功能列表
const list = ref([{
  name: '车辆设防',
  icon: LockIcon,
  activeIcon: LockOpenIcon,
  active: false,
}, {
  name: '一键静音',
  icon: SpeakerIcon,
  activeIcon: SpeakerOpenIcon,
  active: false,
}, {
  name: '感应控车',
  icon: InductionIcon,
  activeIcon: InductionOpenIcon,
  active: false,
}, {
  name: '鸣笛寻车',
  icon: WhistleIcon,
  activeIcon: WhistleOpenIcon,
  active: false,
}])

// 车辆状态
const carState = ref({
  status: 0, // 4g设备状态：0-离线，1-在线
  hasBeidou: 0, // 0-没有卫星/北斗 1-有卫星/北斗
  batteryVoltageType: 48, // 电池电压类型（48/60/72）
  batteryLevel: 0, // 电池电量百分比 (0–100)
  isStarted: false, // 车辆是否已启动。`true`：已启动  - `false`：未启动
  isLocked: true, // 车辆是否处于锁车状态。  - `true`：已锁车  - `false`：未锁车
  isArmed: false, // 车辆是否已设防（防盗报警激活）。  - `true`：已设防  - `false`：未设防
  isMuteArmOn: false, // 车辆是否已开启静音设防。  - `true`：已开启  - `false`：未开启
  isKeylessOn: false, // 感应启动功能是否开启。  - `true`：开启  - `false`：关闭
  keylessType: false, // 感应启动类型。  - `1`：感应启动  - `2`：震动启动  - `3`：一键启动
  keylessRange: false, // 感应启动距离。 - `1`：一档，信号强度最高 - `2`：二档，信号强度中等  - `3`：表示三档，信号强度最低。
  warnCount: 0, // 告警数量
})
// 更新车辆状态
const updateCarStatusDebounced = debounce(updateCarStatus, 500)

// 弹出框相关
const carList = ref([])
const selectCarId = ref<number>() // 选中车辆ID
const carPickerRef = ref() // ✅ 车辆选择器引用

// message弹窗
const showMessagePopup = ref(false) // 控制弹窗显示
const messageId = ref<number>(0) // 弹窗ID
const duration = ref(0) // 弹窗持续时间
const showCancelBtn = ref(true) // 是否显示取消按钮
const showConfirmBtn = ref(true) // 是否显示确认按钮
const closeOnClickModal = ref(true) // 是否点击蒙层关闭弹窗

const batteryVoltageType = ref(48) // 电池类型
const batterTab = ref([48, 60, 72]) // 电池类型tab
const showBatPopup = ref(false) // 电池弹窗显示

// 获取选中车辆名称
const currentCarName = computed(() => {
  const car = carList.value.find(item => item.id === selectCarId.value)
  return car ? car.vehicleName : '我的车辆'
})
const colorCode = computed(() => {
  const car = carList.value.find(item => item.id === selectCarId.value)
  return car ? car.colorCode : ''
})

// 骑行info
const currentRidingInfo = ref<any>({
  address: '',
  ridingName: '',
  ridingStatus: '',
  ridingTrack: [],
})
// 定义地图位置信息
const mapLocation = ref({
  latitude: 0,
  longitude: 0,
})

// ============= 统一的初始化和清理函数 =============

/**
 * 初始化首页资源
 */
function initHomePage() {
  // 如果已登录，获取车辆列表
  if (userStore.isLoggedIn) {
    // 获取位置和蓝牙权限
    getLocationAndBlueAuth()
    getCarList()
  }
}

/**
 * 清理首页资源
 */
function cleanupHomePage() {
  console.log('🧹 清理首页资源')

  // E车星断开蓝牙连接
  if (carStore.hasBluetooth && carStore.carInfo.bluetoothVendor === 'ECS') {
    disconnect()
  }

  // ✅ 清除定时器
  if (getCarInfoTimer) {
    clearTimeout(getCarInfoTimer)
    getCarInfoTimer = null
  }
}

// ============= 优化后的 watch 监听 =============

/**
 * 监听解锁状态 - 控制骑行轨迹上报（仅蓝牙设备）
 */
watch(() => carState.value.isLocked, async (newVal, oldVal) => {
  console.log('🔓 锁车状态变化:', oldVal, '->', newVal)

  // ✅ 只有蓝牙设备才需要上报骑行轨迹（4G设备通过网络获取位置）
  if (carStore.network) {
    return
  }

  try {
    // 获取当前位置
    const location = await getCurrentLocation()

    if (!newVal) {
      // 开始骑行（未锁车状态）
      console.log('🚴 蓝牙设备开始骑行，开启位置监听')
      await startRiding(selectCarId.value, location)

      // 开启位置监听
      await startListening()

      // ✅ 注册位置变化回调，自动上传轨迹点
      onLocationChange((location) => {
        if (isRiding()) {
          uploadLocation(location).catch((err) => {
            console.error('❌ 位置上传失败:', err)
          })
        }
      })
    }
    else {
      // 结束骑行
      console.log('🏁 蓝牙设备结束骑行，停止位置监听')
      await endRiding(selectCarId.value, location)

      // 停止位置监听（会自动清理所有回调）
      stopListening()
    }
  }
  catch (error: any) {
    console.error('❌ 操作失败:', error)
    uni.showToast({
      title: '上报数据失败',
      icon: 'error',
    })
  }
})

/**
 * 统一监听 tab 和登录状态
 * 优化：合并了两个重复的 watch，避免重复执行
 */
watch(() => props.tabName, (newTabName) => {
  // console.log('📊 状态变化:', {
  //   tab: `${oldTabName} -> ${newTabName}`,
  //   login: `${oldIsLoggedIn} -> ${isLoggedIn}`,
  // })

  if (newTabName === 'home') {
    // 切换到首页，初始化资源
    console.log('✅ 切换到首页')
    // 登录后获取车辆列表
    if (userStore.isLoggedIn) {
      getLocationAndBlueAuth()
      getCarList()
    }
  }
  else {
    // 离开首页，清理资源
    console.log('⬅️ 离开首页')
    cleanupHomePage()
  }
}, {
  immediate: false, // 不立即执行，onShow 已处理初始化
  deep: false, // 不需要深度监听，提升性能
})

// 监听网络状态变化
watch(() => appStore.hasNetwork, (hasNetwork) => {
  console.log('📶 网络状态变化:', hasNetwork)
  if (!hasNetwork) {
    // 关闭轮询开关
    shouldPoll.value = false
    // 无网络时清除定时器
    if (getCarInfoTimer) {
      clearTimeout(getCarInfoTimer)
      getCarInfoTimer = null
    }
    // 如果蓝牙已连接时，查询车辆状态
    if (carStore.hasBluetooth && bluetoothStatus.value === BluetoothStatus.CONNECTED) {
      sendGetVehicleStatusCommand()
    }
  }
  else {
    // 恢复网络时，仅在首页且4G设备时开启轮询
    shouldPoll.value = true
    if (props.tabName === 'home' && carStore.network && !getCarInfoTimer) {
      getCarInfo()
    }
  }
}, { deep: false })

onMounted(() => {
  // 获取滑块最大宽度
  getMaxSliderWidth()
})

// 异步处理用户同意隐私协议
function handlePrivacyConfirm() {
  return new Promise((resolve, reject) => {
    wx.requirePrivacyAuthorize({
      success: () => {
        resolve(true)
      },
      fail: (error) => {
        reject(error)
      },
    })
  })
}
onShow(async () => {
  await handlePrivacyConfirm()
  if (props.tabName === 'home') {
    initHomePage()
  }
})

onHide(() => {
  // console.log('👋 页面隐藏')
  cleanupHomePage()
})

function handleCancel() {
  showMessagePopup.value = false
}

function handleConfirm() {
  showMessagePopup.value = false
}

function handleShowBatPopup() {
  batteryVoltageType.value = carState.value.batteryVoltageType || 48 // 默认48V
  showBatPopup.value = true
}

// 设置电压类型
async function handleBatConfirm() {
  const deviceNo = carList.value.find(item => item.id === selectCarId.value)?.deviceNo
  try {
    const res = await httpPost(`/device/vehicle/update`, {
      id: selectCarId.value,
      deviceNo,
      batteryVoltageType: batteryVoltageType.value,
    })
    if (res.code === '200') {
      uni.showToast({
        title: '设置成功',
        icon: 'success',
        duration: 2000,
      })
      showBatPopup.value = false
    }
  }
  catch (err) {
    console.error('设置电池电压类型失败:', err)
    uni.showToast({
      title: '设置失败，请重试',
      icon: 'error',
      duration: 2000,
    })
  }

  console.log('确认操作，选择电池类型:', batteryVoltageType.value)
}

// 获取滑块最大宽度
function getMaxSliderWidth() {
  uni.createSelectorQuery()
    .in(getCurrentInstance().proxy)
    .select('.slider')
    .boundingClientRect((res: UniApp.NodeInfo) => {
      maxRight.value = res.width - 70 // 70为滑块的宽度
    })
    .exec()
}

// ✅ 设置滑块位置（根据锁定状态同步滑块位置）
function syncSliderPosition() {
  const targetX = !carState.value.isLocked ? maxRight.value : 0
  sliderX.value = targetX
  sliderStyle.value = `transform: translateX(${targetX}px); transition: all 0.5s ease`
}

// 获取位置和蓝牙权限
async function getLocationAndBlueAuth() {
  try {
    const hasAuth = await initLocationAuth()
    // console.log('开启后台定位权限成功', loc)
    // 获取位置和天气
    hasAuth && getLocationAndWeather()
  }
  catch (err) {
    console.error('开启后台定位权限失败', err)
  }
}

// 蓝牙状态切换
function toggleBluetooth() {
  if (!userStore.isLoggedIn) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
      mask: true,
    })
    return
  }
  // 蓝牙状态 0:未连接 1:连接中 2:已连接

  if (bluetoothStatus.value === BluetoothStatus.DISCONNECTED) {
    connectBle()
  }
  else {
    disconnect()
  }
}

// 蓝牙功能列表操作
function onItemClick(item) {
  if (!carStore.network) {
    if (bluetoothStatus.value === BluetoothStatus.DISCONNECTED || bluetoothStatus.value === BluetoothStatus.CONNECTING) {
      uni.showToast({
        title: '请先连接蓝牙',
        icon: 'none',
        mask: true,
      })
      return
    }
  }

  const selectCarInfo = carList.value.find(item => item.id === selectCarId.value)

  switch (item.name) {
    case '车辆设防':
      uni.showModal({
        title: '操作提示',
        content: item.active ? '确定要解防车辆吗？' : '确定要设防车辆吗？',
        success(res) {
          if (res.confirm) {
            // ✅ 使用统一控车方法
            controlVehicle(item.active ? 'undefense' : 'defense')
          }
        },
      })
      break
    case '一键静音':
      if (carState.value.isLocked) {
        // ✅ 使用统一控车方法 onekeymuteon  一键静音  onekeymuteoff 解除一键静音
        controlVehicle('onekeymuteon')
      }
      else {
        uni.showToast({
          title: '车辆已开启',
          icon: 'none',
        })
      }
      break
    case '感应控车':
      if (carStore.carInfo.deviceType === 3) {
        if (bluetoothStatus.value !== BluetoothStatus.CONNECTED) {
          uni.showToast({
            title: '请先连接蓝牙',
            icon: 'none',
            mask: true,
          })
          return
        }
      }

      uni.navigateTo({
        url: `/pages-car/interaction/index?info=${encodeURIComponent(JSON.stringify(selectCarInfo))}`,
      })
      break
    case '鸣笛寻车':
      if (carState.value.isLocked) {
        uni.vibrateLong()
        // ✅ 使用统一控车方法
        controlVehicle('find')
      }
      else {
        uni.showToast({
          title: '车辆已开启',
          icon: 'none',
        })
      }
      break
  }
}

// ✅ 统一控车方法：优先4G，回退蓝牙
async function controlVehicle(commandType: CommandType) {
  const hasNetwork = appStore.hasNetwork
  const is4GDevice = carStore.network
  const deviceType = carStore.carInfo.deviceType
  const isOnline = carState.value.status === 1 // 设备在线

  const onlyBlueCommands = getOnlyBlueCommands(deviceType, isOnline)

  const canUse4G = hasNetwork && is4GDevice && !onlyBlueCommands.includes(commandType)

  if (canUse4G) {
    await controlBike(commandType)
    return
  }

  await controlByBluetooth(commandType)
}

function getOnlyBlueCommands(
  deviceType: number,
  isOnline: boolean,
): CommandType[] {
  // E车星蓝牙 + 华慧4G等组合设备
  if ([3, 7].includes(deviceType)) {
    return isOnline
      ? ['defense', 'undefense', 'onekeymuteon', 'find']
      : ['lock', 'unlock', 'defense', 'undefense', 'onekeymuteon', 'find']
  }

  // 一体机
  if ([5, 6].includes(deviceType)) {
    return isOnline ? [] : ['lock', 'unlock', 'defense', 'undefense', 'onekeymuteon', 'find']
  }

  return []
}

// 蓝牙控车
async function controlByBluetooth(commandType: CommandType) {
  if (bluetoothStatus.value !== BluetoothStatus.CONNECTED) {
    uni.showToast({
      title: '请先连接蓝牙',
      icon: 'none',
      mask: true,
    })

    if (commandType === 'lock' || commandType === 'unlock') {
      syncSliderPosition()
    }
    return
  }

  const commandMap: Record<CommandType, () => void> = {
    unlock: sendUnlockCommand,
    lock: sendLockCommand,
    defense: sendArmCommand,
    undefense: sendDisarmCommand,
    onekeymuteon: sendArmCommand,
    find: sendFindVehicleCommand,
  }

  commandMap[commandType]?.()
}

// 4g控车指令
function controlBike(commandType: string) {
  // ✅ 清除旧定时器
  if (getCarInfoTimer) {
    clearTimeout(getCarInfoTimer)
    getCarInfoTimer = null
  }
  // 发送控车指令
  isControling.value = true
  const nameMap = {
    lock: '锁车',
    unlock: '解锁',
    defense: '设防',
    undefense: '解防',
    find: '寻车',
    onekeymuteon: '一键静音',
    onekeymuteoff: '解除一键静音',
  }

  uni.showLoading({
    title: `车辆${nameMap[commandType]}中`,
    mask: true,
  })

  if (['lock', 'unlock'].includes(commandType)) {
    // 先更新状态
    carState.value.isLocked = commandType === 'lock'
    syncSliderPosition()
  }
  if (['defense', 'undefense'].includes(commandType)) {
    const isDefend = commandType === 'defense'
    list.value[0].active = isDefend
    carState.value.isArmed = isDefend
  }

  // 一键静音等同于设防
  if (commandType === 'onekeymuteon') {
    commandType = 'defense'
  }

  const networkDeviceNo = carList.value.find(item => item.id === selectCarId.value)?.networkDeviceNo
  return new Promise((resolve, reject) => {
    httpPost(`/device/v2/devices/${networkDeviceNo}/commands`, { commandType }).then((res) => {
      uni.hideLoading()
      isControling.value = false
      resolve(res)
      // 重新获取车辆状态
      getCarInfo()

      const result = res as any
      const data = res.data as any || {}

      // 处理无北斗设备上报轨迹信息
      if (result.code === '200' && carStore.carInfo.hasBeidou === 0) {
        console.log('🚴‍♂️ 4G无北斗设备，处理上报轨迹')
        uploadRideLocation(commandType === 'unlock', data.rideId).catch((err) => {
          console.error('上传位置失败:', err)
        })
      }
      // 异常处理
      if (result.code !== '200') {
        uni.showToast({
          title: result.message || '操作失败',
          icon: 'error',
          duration: 1000,
        })
      }
    }).catch((err) => {
      uni.hideLoading()
      reject(err)
      isControling.value = false
      // 重新获取车辆状态
      getCarInfo()
    })
  })
}

// 4g设备+无北斗定位，上报轨迹
async function uploadRideLocation(unlock: boolean, rideId: string) {
  try {
    // 获取当前位置
    const location = await getCurrentLocation()

    if (unlock) {
      // 开始骑行（未锁车状态）
      console.log('开始骑行，开启位置监听')
      await startRiding(selectCarId.value, location, rideId)

      // 开启位置监听
      await startListening()

      // ✅ 注册位置变化回调，自动上传轨迹点
      onLocationChange((location) => {
        if (isRiding()) {
          uploadLocation(location).catch((err) => {
            console.error('❌ 位置上传失败:', err)
          })
        }
      })
    }
    else {
      // 结束骑行
      console.log('结束骑行，停止位置监听')
      await endRiding(selectCarId.value, location)

      // 停止位置监听（会自动清理所有回调）
      stopListening()
    }
  }
  catch (error: any) {
    console.error('❌ 操作失败:', error)
    uni.showToast({
      title: '上报数据失败',
      icon: 'error',
    })
  }
}

// 刷新
function reloadLocation() {
  getCurrentRidingInfo()
}

// 获取当前骑行信息
async function getCurrentRidingInfo(vehicleId = selectCarId.value) {
  if (!vehicleId)
    return
  uni.showLoading({
    title: '加载中...',
    mask: true,
  })
  const deviceNo = carList.value.find(item => item.id === vehicleId)?.deviceNo
  // 4g设备的话获取当前车辆位置信息
  if (carStore.network) {
    const res = await httpGet(`/device/v2/devices/${deviceNo}/location/basic`)
    uni.hideLoading()
    currentRidingInfo.value = (res.data as any)
  }
  else {
    const res = await httpGet(`/riding/ride/homepage/vehicle/${vehicleId}`)
    uni.hideLoading()
    currentRidingInfo.value = (res.data as any)
  }
}

// 获取位置信息和天气
function getLocationAndWeather() {
  getLocation().then((res: UniApp.GetLocationSuccess) => {
    // 根据当前位置获取天气信息
    const { latitude, longitude } = res
    mapLocation.value = { latitude, longitude }
    httpGet(`/device/weather/tianqi`, { lat: latitude, lng: longitude }).then((weatherRes) => {
      (weatherRes.data as any).simpleWeather = (weatherRes.data as any).hours.slice(0, 3)
      weatherInfo.value = weatherRes.data as any
    }).catch((err) => {
      console.error('获取天气信息失败:', err)
    })
  }).catch((err) => {
    console.error('获取位置失败:', err)
  })
}

// 获取车辆列表
async function getCarList() {
  const res = await httpGet('/device/vehicle/user/complete')
  carList.value = (res.data as any).resultList
  // console.log('获取车辆列表成功:', res.data.resultList)
  // 没有车辆，提示去绑定
  if (carList.value.length === 0) {
    uni.showModal({
      title: '提示',
      content: '您还没有绑定车辆，是否前往绑定？',
      showCancel: true,
      success: ({ confirm, cancel }) => {
        console.log('用户点击了', confirm ? '确认' : '取消')
        if (confirm) {
          uni.navigateTo({
            url: '/pages-car/bind/index',
          })
        }
      },
    })
  }
  else {
    // 有车辆，默认选中车辆
    setDefaultVehicleId(carList.value)
    // 获取当前骑行信息
    getCurrentRidingInfo()
    // ✅ 4G设备开始轮询车辆状态（首次调用，内部会通过 setTimeout 继续轮询）
    if (carStore.network) {
      getCarInfo()
    }
    // 自动连接蓝牙
    connectBle()
  }
}
// 默认选中车辆
function setDefaultVehicleId(carsList: any[]) {
  // 1. 参数校验
  if (!carsList || carsList.length === 0) {
    console.warn('车辆列表为空，无法设置默认车辆')
    return
  }

  // 2. 判断是否已有默认车辆ID
  const defaultVehicleId = userStore.userInfo.defaultVehicleId

  if (!defaultVehicleId) {
    // 2.1 未设置默认车辆，选中第一辆
    selectCarId.value = carsList[0].id
    carStore.setCarInfo(carsList[0])
  }
  else {
    // 2.2 已设置默认车辆，检查是否在列表中
    const findCar = carsList.find(item => item.id === defaultVehicleId)

    if (findCar) {
      selectCarId.value = findCar.id
      carStore.setCarInfo(findCar)
    }
    else {
      // 默认车辆不在列表中（可能已删除），选择第一辆
      selectCarId.value = carsList[0].id
      carStore.setCarInfo(carsList[0])
    }
  }

  // 3. 存储选中车辆颜色
  uni.setStorageSync('selectColorCode', colorCode.value)
}

// 获取车辆状态信息
function getCarInfo() {
  const networkDeviceNo = carList.value.find(item => item.id === selectCarId.value)?.networkDeviceNo
  httpGet(`/device/v2/devices/${networkDeviceNo}/status`)
    .then((res) => {
      // console.log('获取车辆状态信息成功:', res.data)
      if (isControling.value) {
        // 控车中不更新状态
        return
      }

      // 更新车辆状态信息
      const data = res.data as any

      // 设备不在线不更新状态
      if (data.status === null || data.status === 0) {
        console.log('4g设备离线状态，不更新车辆状态')
        // return
      }
      else {
        // E车星蓝牙+华慧4G，isKeylessOn 不需要 isArmed 不需要
        if (carStore.carInfo.deviceType === 3) {
          delete data.isKeylessOn
          delete data.isArmed
        }

        carState.value = {
          ...carState.value,
          ...data,
        }

        // 更新车辆状态
        updateCarStatusDebounced()
      }

      // ✅ 使用 setTimeout 实现轮询（1.5秒后继续查询），并加固条件判断
      if (shouldPoll.value && appStore.hasNetwork && props.tabName === 'home' && carStore.network) {
        if (getCarInfoTimer) {
          clearTimeout(getCarInfoTimer)
          getCarInfoTimer = null
        }
        getCarInfoTimer = setTimeout(() => {
          getCarInfo()
        }, 1500) as unknown as number
      }
    })
    .catch((err) => {
      console.error('获取车辆状态信息失败:', err)

      // ✅ 失败也仅在允许轮询且有网时继续
      if (shouldPoll.value && appStore.hasNetwork && props.tabName === 'home' && carStore.network) {
        if (getCarInfoTimer) {
          clearTimeout(getCarInfoTimer)
          getCarInfoTimer = null
        }
        getCarInfoTimer = setTimeout(() => {
          getCarInfo()
        }, 1500) as unknown as number
      }
    })
}

// ✅ 连接蓝牙
async function connectBle() {
  try {
    const selectedCarInfo = carList.value.find(item => item.id === selectCarId.value)
    if (!selectedCarInfo) {
      uni.showToast({
        title: '请先选择车辆',
        icon: 'none',
        mask: true,
      })
      throw new Error('请先选择车辆')
    }

    // 构建蓝牙设备信息
    const deviceInfo: BluetoothDeviceInfo = {
      bluetoothDeviceNo: selectedCarInfo.bluetoothDeviceNo || '',
      bluetoothVendor: selectedCarInfo.bluetoothVendor,
      // bluetoothDeviceName: selectedCarInfo.id === 126372 ? 'EV10C-152DB0' : selectedCarInfo.bluetoothDeviceName || '',
      // bluetoothDeviceKey: selectedCarInfo.id === 126372 ? 'C9AC662B' : selectedCarInfo.bluetoothDeviceKey || '',
      bluetoothDeviceName: selectedCarInfo.bluetoothDeviceName || '',
      bluetoothDeviceKey: selectedCarInfo.bluetoothDeviceKey || '',
    }

    console.log('🔵 开始连接蓝牙，设备信息:', {
      蓝牙类型: deviceInfo.bluetoothVendor,
      蓝牙名称: deviceInfo.bluetoothDeviceName,
      蓝牙设备号: deviceInfo.bluetoothDeviceNo,
    })

    // 使用composable连接蓝牙
    await connectBluetooth(deviceInfo)

    // 监听蓝牙状态变化
    onBluetoothStateChange(handleBluetoothStateChange)

    // 监听蓝牙连接状态变化
    wx.onBLEConnectionStateChange((res) => {
      console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
      if (!res.connected) {
        // 断开连接时移除监听
        offBluetoothStateChange()
      }
    })
  }
  catch (err: any) {
    console.log('❌ 连接蓝牙失败:', err)
    // 断开连接时移除监听
    offBluetoothStateChange()
    // ✅ 重新抛出错误，让上层处理
    throw err
  }
}

// ✅ 处理蓝牙状态变化
function handleBluetoothStateChange(data: any) {
  console.log('设备状态变化:', data)
  const { state, operType } = data

  switch (operType) {
    case 'BIND_USER':
      console.log('✅ 用户绑定成功，查询车辆状态')
      sendGetVehicleStatusCommand()
      break
    case 'GET_CAR_STATUS':
      console.log('✅ 获取车辆状态成功，获取 ECU 配置')
      sendGetEcuConfigCommand()
      break
    default:
      break
  }

  if (state) {
    // E车星蓝牙处理锁状态
    if (carStore.carInfo.bluetoothVendor === 'ECS') {
      if (Object.prototype.hasOwnProperty.call(state, 'isStarted')) {
        state.isLocked = !state.isStarted
      }
    }

    // 合并状态更新
    carState.value = {
      ...carState.value,
      ...state,
    }
    // 防抖
    updateCarStatusDebounced()
  }
}

function updateCarStatus() {
  list.value = list.value.map((item) => {
    if (item.name === '车辆设防')
      item.active = carState.value.isArmed
    if (item.name === '感应控车')
      item.active = carState.value.isKeylessOn
    return item
  })

  // 同步滑块位置到对应状态
  syncSliderPosition()
}
// ✅ 断开蓝牙
async function disconnect() {
  try {
    await disconnectBluetooth()
    offBluetoothStateChange()
    console.log('断开蓝牙成功')
  }
  catch (err) {
    console.log('断开蓝牙失败:', err)
  }
}

// ✅ 显示车辆选择器
function showCarPicker() {
  if (!carList.value.length) {
    uni.showToast({
      title: '暂无车辆',
      icon: 'none',
    })
    return
  }
  pickerClass.value = ''
  carPickerRef.value?.open()
}

// 切换车辆
async function handleConfirmCar({ value, selectedItem }) {
  console.log('🚗 ========== 开始切换车辆 ==========')
  // 设置选中车辆
  selectCarId.value = value
  // 存储选中车辆颜色
  uni.setStorageSync('selectColorCode', colorCode.value)
  // 设置车辆信息
  carStore.setCarInfo(selectedItem)

  // ✅ 清除旧定时器
  if (getCarInfoTimer) {
    clearTimeout(getCarInfoTimer)
    getCarInfoTimer = null
  }

  // 重置车辆状态
  carState.value.isLocked = true
  carState.value.isArmed = false
  carState.value.isKeylessOn = false
  carState.value.batteryLevel = 0
  carState.value.warnCount = 0
  updateCarStatus()

  // ✅ 切换车辆前，先结束当前骑行（如果有）
  try {
    const location = await getCurrentLocation()
    await switchVehicle(location)
  }
  catch (err) {
    console.error('切换车辆时重置骑行状态失败:', err)
  }

  // 没有网络不更新用户信息
  if (appStore.hasNetwork) {
    const params = {
      ...userStore.userInfo,
      defaultVehicleId: value,
    }
    delete params.token

    // 更新用户信息,设置车辆id
    userStore.updateInfo(params)
    console.log('更新用户车辆信息成功')

    // ✅ 4G设备重新开始轮询车辆状态
    if (carStore.network) {
      getCarInfo()
    }
    // 获取当前骑行信息
    getCurrentRidingInfo()
  }

  // ✅ 等待蓝牙完全断开
  try {
    await disconnect()
    console.log('✅ 蓝牙已完全断开')
  }
  catch (err) {
    console.error('⚠️ 蓝牙断开失败:', err)
  }

  // ✅ 延长等待时间，确保蓝牙完全断开并重置
  console.log('⏳ 等待 1 秒，确保蓝牙完全重置...')
  await new Promise(resolve => setTimeout(resolve, 1000))
  // 重新连接蓝牙
  connectBle()
}

function onTouchStart(event) {
  startX.value = event.touches[0].pageX - sliderX.value
}
function onTouchMove(event) {
  // if (bluetoothStatus.value !== BluetoothStatus.CONNECTED && !carStore.network) {
  //   uni.showToast({
  //     title: '请先连接蓝牙',
  //     icon: 'success',
  //     mask: true,
  //   })
  //   return false
  // }
  let moveX = event.touches[0].pageX - startX.value
  moveX = Math.max(0, Math.min(moveX, maxRight.value))
  sliderX.value = moveX
  sliderStyle.value = `transform: translateX(${moveX}px)`
}
// 开锁、关锁
function onTouchEnd(event) {
  const success = () => {
    // ✅ 使用统一控车方法
    controlVehicle(carState.value.isLocked ? 'unlock' : 'lock')
  }
  const fail = () => {
    // 回弹到对应位置
    const isUnlocked = !carState.value.isLocked
    sliderX.value = isUnlocked ? maxRight.value : 0
    sliderStyle.value = isUnlocked
      ? `transform: translateX(${maxRight.value}px); transition: all 0.5s ease`
      : `transform: translateX(0px); transition: all 0.5s ease `
  }

  if (carState.value.isLocked && sliderX.value === maxRight.value) {
    // 解锁操作
    success()
  }
  else if (!carState.value.isLocked && sliderX.value === 0) {
    // 锁车操作
    success()
  }
  else {
    fail()
  }
}

function goLocationDetail() {
  if (!userStore.isLoggedIn) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
      mask: true,
    })
    return
  }
  uni.navigateTo({
    url: `/pages-network/localtion/index?rideId=${currentRidingInfo.value.rideId}`,
  })
}

function goLogin() {
  uni.navigateTo({
    url: '/pages/login/login',
  })
}
function goDetail() {
  if (!userStore.isLoggedIn) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
      mask: true,
    })
    return
  }
  if (!selectCarId.value) {
    uni.showToast({
      title: '请先选择车辆',
      icon: 'none',
      mask: true,
    })
    return
  }
  uni.navigateTo({
    url: `/pages-car/location/index?rideId=${currentRidingInfo.value.rideId}`,
  })
}

function goNotice() {
  if (!userStore.isLoggedIn) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
      mask: true,
    })
    return
  }
  if (carState.value.warnCount === 0) {
    return
  }
  uni.navigateTo({
    url: `/pages-network/notice/index?deviceId=${carStore.carInfo.deviceNo}`,
  })
}
// 显示天气详情
function showWeatherDetail() {
  weatherPopVisible.value = true
}

function getSliderBgStyle() {
  if (carStore.network) {
    return { background: !carState.value.isLocked ? '#2CBC7B' : '#DB6477' }
  }
  else {
    if ((bluetoothStatus.value === BluetoothStatus.DISCONNECTED || bluetoothStatus.value === BluetoothStatus.CONNECTING)) {
      return { background: '#E6E6E6' }
    }
    else {
      return { background: !carState.value.isLocked ? '#2CBC7B' : '#DB6477' }
    }
  }
}

function getLockIcon() {
  if (carStore.network) {
    return !carState.value.isLocked ? CloseBtnIcon : CloseBtnRedIcon
  }
  else {
    if ((bluetoothStatus.value === BluetoothStatus.DISCONNECTED || bluetoothStatus.value === BluetoothStatus.CONNECTING)) {
      return CloseBtnBrayIcon
    }
    else {
      return !carState.value.isLocked ? CloseBtnIcon : CloseBtnRedIcon
    }
  }
}

function getSliderColorStyle() {
  if (carStore.network) {
    return '#ffffff'
  }
  else {
    if ((bluetoothStatus.value === BluetoothStatus.DISCONNECTED || bluetoothStatus.value === BluetoothStatus.CONNECTING)) {
      return '#333333'
    }
    else {
      return '#ffffff'
    }
  }
}
function getBatteryIcon() {
  if (!userStore.isLoggedIn) {
    return Bat0
  }
  let level = Number(carState.value.batteryLevel)
  // 异常值处理与边界规整
  if (!Number.isFinite(level))
    level = 0
  level = Math.max(0, Math.min(100, Math.round(level)))

  // 阈值映射：0、1-19、20-39、40-59、60-79、80-100
  if (level === 0)
    return Bat0
  if (level <= 19)
    return Bat1
  if (level <= 39)
    return Bat2
  if (level <= 59)
    return Bat3
  if (level <= 79)
    return Bat4
  return Bat5
}

function toggleLock() {
  carState.value.isLocked = !carState.value.isLocked
  syncSliderPosition()
}
</script>

<template>
  <view class="Home">
    <!-- 我的车辆 -->
    <wd-navbar custom-class="navbar" safe-area-inset-top fixed custom-style="background-color: transparent !important;">
      <template #left>
        <view>
          <!-- ✅ 点击触发车辆选择器 -->
          <!-- <view v-if="userStore.isLoggedIn" @click="showCarPicker">
            <span class="text-30rpx font-bold">{{ currentCarName }}</span>
            <image
              class="ml-16rpx h-15rpx w-30rpx"
              :src="DownIcon"
              mode="aspectFit"
            />
          </view> -->
          <view v-if="userStore.isLoggedIn" @click="closeOutside">
            <wd-drop-menu custom-class="fg-drop-menu">
              <wd-drop-menu-item
                v-if="selectCarId"
                v-model="selectCarId"
                label-key="vehicleName"
                value-key="id"
                :options="carList"
                @change="handleConfirmCar"
              />
            </wd-drop-menu>
          </view>
          <view v-else @click="goLogin ">
            登录
          </view>
        </view>
      </template>
    </wd-navbar>
    <view class="top-card">
      <image
        class="top-bg z-0"
        :src="colorCode ? getColorImg(colorCode, 'home') : TopIcon"
        mode="scaleToFill"
      />

      <!-- 我的车辆&蓝牙状态 -->
      <view class="car relative z-3 h-90rpx flex items-center justify-between px-29rpx" :style="{ paddingTop: `${menuButtonInfo?.top + menuButtonInfo.height + 0}px` }">
        <!-- ✅ 点击触发车辆选择器 -->
        <!-- <view v-if="userStore.isLoggedIn" @click="showCarPicker">
          <span class="text-30rpx font-bold">{{ currentCarName }}</span>
          <image
            class="ml-16rpx h-15rpx w-30rpx"
            :src="DownIcon"
            mode="aspectFit"
          />
        </view>
        <view v-else @click="goLogin ">
          登录
        </view> -->
        <template v-if="weatherInfo && weatherInfo.wea">
          <!-- 占位 -->
          <view />
          <view class="flex items-center justify-center color-[#333333]">
            <image
              class="h-40rpx w-34rpx"
              :src="getWeatherIcon(weatherInfo.wea)"
              mode="aspectFit"
            />
            <view class="slide-text flex items-center justify-center">
              <view class="ml-16rpx text-48rpx">
                {{ weatherInfo.tem }}°
              </view>
              <view class="ml-12rpx text-20rpx">
                <view>{{ weatherInfo.wea }}</view>
                <view>
                  {{ weatherInfo.tem1 }}°/{{ weatherInfo.tem2 }}°
                </view>
              </view>
            </view>
          </view>
          <!-- 更多天气 -->
          <view class="absolute bottom-[-65rpx] right-28rpx h-80rpx w-230rpx flex items-center justify-evenly rounded-[10rpx] bg-[#5DACF8]" @click.stop="showWeatherDetail">
            <view v-for="item in weatherInfo.simpleWeather" :key="item.hours" class="flex flex-col items-center justify-center text-16rpx">
              <view>{{ item.hours }}</view>
              <image
                class="my-6rpx h-20rpx w-20rpx"
                :src="getWeatherIcon(item.wea)"
                mode="scaleToFill"
              />
              <view>{{ item.wea }}</view>
            </view>
          </view>
        </template>
      </view>
      <!-- 蓝牙连接&电池电量&告警信息 -->
      <view class="top-cont">
        <template v-if="carStore.network">
          <view class="flex items-center justify-between px-114rpx pt-40rpx">
            <view class="flex flex-col items-center justify-center">
              <image
                class="h-80rpx w-80rpx"
                :class="{ 'animate-opacity': bluetoothStatus === BluetoothStatus.CONNECTING }"
                :src="bluetoothStatus === BluetoothStatus.DISCONNECTED ? BlueClose : BlueOpen"
                mode="scaleToFill"
                @click="toggleBluetooth"
              />
              <view class="mt-20rpx text-24rpx text-[#333333]">
                {{ bluetoothStatus === BluetoothStatus.CONNECTED ? '蓝牙已连接' : bluetoothStatus === BluetoothStatus.CONNECTING ? '蓝牙连接中' : '蓝牙未连接' }}
              </view>
            </view>
            <view class="flex flex-col items-center justify-center">
              <image
                class="h-80rpx w-80rpx"
                :src="getBatteryIcon()"
                mode="scaleToFill"
                @click="handleShowBatPopup"
              />
              <view class="mt-20rpx text-24rpx text-[#333333]">
                电池电量
              </view>
            </view>
            <view class="flex flex-col items-center justify-center">
              <view class="relative h-80rpx w-80rpx" @click="goNotice">
                <template v-if="carState.warnCount > 0">
                  <view v-if="carState.warnCount > 9" class="notice-count more absolute right-0 top-0">
                    {{ carState.warnCount > 99 ? '99+' : carState.warnCount }}
                  </view>
                  <view v-else class="notice-count absolute right-0 top-0">
                    {{ carState.warnCount }}
                  </view>
                </template>

                <image
                  class="h-80rpx w-80rpx"
                  :src="WarnInfo"
                  mode="scaleToFill"
                />
              </view>
              <view class="mt-20rpx text-24rpx text-[#333333]">
                告警信息
              </view>
            </view>
          </view>
          <image
            class="absolute bottom-100rpx right-33rpx h-52rpx w-183rpx"
            :src="FlyTextIcon"
            mode="scaleToFill"
          />
        </template>
        <template v-else>
          <view class="mb-37rpx flex items-center justify-center">
            <image
              class="h-133rpx w-517rpx"
              :src="FlyTitleIcon"
              mode="scaleToFill"
            />
          </view>
          <view class="pl-60rpx" @click="toggleBluetooth">
            <image
              class="h-60rpx w-40rpx"
              :class="{ 'animate-opacity': bluetoothStatus === BluetoothStatus.CONNECTING }"
              :src="bluetoothStatus === BluetoothStatus.DISCONNECTED ? BLueDisconnect : BlueConnect"
              mode="scaleToFill"
            />
            <span class="ml-20rpx text-24rpx">{{ bluetoothStatus === BluetoothStatus.CONNECTED ? '蓝牙已连接' : bluetoothStatus === BluetoothStatus.CONNECTING ? '蓝牙连接中' : '蓝牙未连接' }}</span>
          </view>
        </template>
      </view>

      <!-- 蓝牙功能相关 -->
      <view class="relative z-10 mb-19rpx ml-20rpx mt-[-75rpx] box-border w-710rpx rounded-[10rpx] bg-white px-80rpx py-33rpx">
        <view
          class="slider relative z-11 mb-40rpx h-136rpx w-550rpx rounded-[136rpx]"
          :style="getSliderBgStyle()"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <image
            class="slider-bg absolute left-0 top-0 z-12 h-136rpx w-136rpx"
            :style="sliderStyle"
            :src="getLockIcon()"
            mode="scaleToFill"
          />
          <image
            class="absolute top-36rpx h-64rpx w-101rpx"
            :style="{ transform: !carState.isLocked ? 'rotate(0deg)' : 'rotate(180deg)', left: !carState.isLocked ? '73rpx' : '216rpx' }"
            :src="ArrowIcon"
            mode="scaleToFill"
          />
          <view
            class="absolute top-52rpx text-31rpx"
            :style="{ left: !carState.isLocked ? '213rpx' : '353rpx', color: getSliderColorStyle() }"
          >
            {{ !carState.isLocked ? '滑动锁车' : '滑动开锁' }}
          </view>
        </view>
        <fg-scroll-x
          track-width="164rpx"
          track-height="10rpx"
          track-color="#EEEEEE"
          bar-color="#10AE66"
          bar-width="86rpx"
          :indicator="list.length > 4"
        >
          <view class="grid">
            <view v-for="item in list" :key="item.name" class="item" @click="onItemClick(item)">
              <image mode="scaleToFill" class="item-img" :style="{ opacity: carStore.network ? '1' : bluetoothStatus === BluetoothStatus.CONNECTED ? '1' : '0.3' }" :src="item.active ? item.activeIcon : item.icon" />

              <text v-if="item.name === '车辆设防'" class="item-text">
                {{ item.active ? '已设防' : '已解防' }}
              </text>
              <text v-else class="item-text">
                {{ item.name }}
              </text>
            </view>
          </view>
        </fg-scroll-x>
      </view>
      <!-- <wd-button
        class="absolute bottom-[-30rpx] left-50% z-10 w-620rpx -translate-x-50%"
        type="primary"
        size="large"
        @click="toggleLock"
      >
        切换锁状态
      </wd-button> -->
      <!-- 车辆位置 -->
      <view class="flex items-center justify-between px-20rpx">
        <view class="relative box-border w-710rpx rounded-[10rpx] bg-white px-25rpx py-23rpx">
          <view class="flex items-center justify-between">
            <view class="w-100% flex items-center justify-between">
              <view class="whitespace-nowrap text-30rpx">
                车辆位置
              </view>
              <view v-if="userStore.isLoggedIn" class="text-28rpx">
                {{ currentRidingInfo.rideId ? currentRidingInfo.ridingStatus : '未使用' }}
              </view>
              <view class="flex items-center">
                <image class="ml-30rpx h-22rpx w-22rpx" :src="ReloadIcon" mode="scaleToFill" />
                <view class="ml-24rpx whitespace-nowrap text-28rpx color-[#666666]" @click="reloadLocation">
                  刷新
                </view>
              </view>
            </view>
          </view>

          <!-- 轨迹地图 -->
          <view>
            <HomeMapNetWork v-if="carStore.network" :info="currentRidingInfo" @map-click="goLocationDetail" />
            <HomeMap v-else :location="mapLocation" :riding-track="currentRidingInfo.ridingTrack" @map-click="goDetail" />
          </view>
        </view>
      </view>
    </view>
  </view>

  <!-- 天气弹窗 -->
  <weather-pop v-model="weatherPopVisible" :weather-info="weatherInfo" />
  <!-- 电池电压弹窗 -->
  <fg-message v-model:show="showBatPopup" :duration="duration" :show-cancel-btn="true" :show-confirm-btn="true" :close-on-click-modal="closeOnClickModal" @cancel="showBatPopup = false" @confirm="handleBatConfirm">
    <view class="w-500rpx">
      <view class="bat flex items-center justify-between">
        <view v-for="tab in batterTab" :key="tab" class="bat-item" :class="batteryVoltageType === tab ? 'active' : ''" @click="batteryVoltageType = tab">
          {{ tab }}V
        </view>
      </view>
      <view class="mt-44rpx text-20rpx text-[#666666]">
        电池电量是根据智能中控采集的电压系统通过电池
        放电曲线进行换算而得。受不同温度环境、不同电
        池充放电曲线影响，准确性仅供参考。
      </view>
    </view>
  </fg-message>

  <!-- 操作提示弹窗 -->
  <fg-message v-model:show="showMessagePopup" :duration="duration" :show-cancel-btn="showCancelBtn" :show-confirm-btn="showConfirmBtn" :close-on-click-modal="closeOnClickModal" :message-id="messageId" @cancel="handleCancel" @confirm="handleConfirm" />

  <!-- ✅ 车辆选择器（移到外层，避免层级问题） -->
  <!-- <view>
    <wd-picker
      ref="carPickerRef"
      v-model="selectCarId"
      :close-on-click-modal="false"
      :z-index="999999"
      label-key="vehicleName"
      value-key="id"
      :columns="carList"
      :custom-class="pickerClass"
      @confirm="handleConfirmCar"
      @cancel="pickerClass = 'transparent-picker'"
    />
  </view> -->
</template>

<style lang="scss" scoped>
.Home {
  height: 100vh;
  padding-bottom: 40rpx;
  width: 100vw;
  overflow: hidden;
  background: #E4EBF2;
  .top-card {
    width: 100%;
    // height: 980rpx;
    height: 1000rpx;
    position: relative;
    .top-bg {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
    }
    .top-cont {
      position: relative;
      z-index: 2;
      width: 100%;
      height: 760rpx;
      box-sizing: border-box;
      padding-top: 100rpx;
      .count {
        position: absolute;
        top: -10rpx;
        right: -22rpx;
        width: 40rpx;
        height: 40rpx;
        background-color: #FFAB4E;
        color: #ffffff;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
  .notice-count {
    width: 40rpx;
    height: 40rpx;
    background-color: #fa4350;
    color: #ffffff;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    &.more {
      right: -25rpx;
      display: inline-block;
      box-sizing: content-box;
      height: var(--wot-badge-height, 16px);
      line-height: var(--wot-badge-height, 16px);
      padding: var(--wot-badge-padding, 0 5px);
      background-color: var(--wot-badge-bg, var(--wot-color-danger, #fa4350));
      border-radius: calc(var(--wot-badge-height, 16px) / 2 + 2px);
      color: var(--wot-badge-color, #fff);
      font-size: var(--wot-badge-fs, 12px);
      text-align: center;
      white-space: nowrap;
      border: var(--wot-badge-border, 2px solid var(--wot-badge-color, #fff));
      font-weight: 500;
    }
  }

}
.grid {
  display: flex;
  flex-wrap: nowrap;
  position: relative;
  overflow: visible;
  flex-direction: row;
  // padding-bottom: 39rpx;
}
.item {
  width: 104rpx;
  height: 125rpx;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  margin-right: 49rpx;
  &:last-child {
    margin-right: 0;
  }
  &-img {
    width: 86rpx;
    height: 86rpx;
  }
  &-text {
    // padding: 5rpx;
    font-size: 26rpx;
    white-space: nowrap;
  }
}
.slider-bg {
  // transition: all 0.5s ease;
}
.bat {
  .bat-item {
    border: 1rpx solid #333333;
    width: 80rpx;
    height: 80rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 28rpx;
    border-radius: 40rpx;
    &.active {
       border: 4rpx solid #2CBD7C;
       color: #2CBD7C;
    }
  }
}
</style>

<style>
.transparent-picker {
  opacity: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
}
</style>
