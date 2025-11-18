<script setup lang="ts">
// E车星蓝牙SDK
// import { openAndSearchAndConnect } from '@/utils/EvsBikeSdk'
// import EVSBikeSDK from '@/utils/EVSBikeSDK.v1.1.1'

// 华慧蓝牙SDK
import hhznBikeSDK from '@/plugin/bleSdk/HHZNBikeSDK/HHZNBikeSDK.v1.0.3.js'
import { useCarStore, useUserStore } from '@/store'
import { debounce, generateUUID, getColorImg, getLocation, initBLuetoothAuth, initLocationAuth } from '@/utils'

import { getWeatherIcon } from '@/utils/common'
import { httpGet, httpPost } from '@/utils/http'
import HomeMap from './HomeMap.vue'
import WeatherPop from './WeatherPop.vue'

defineOptions({
  name: 'Home',
})

const props = defineProps({
  tabName: {
    type: String,
  },
})
// 华慧蓝牙SDK
const EVSBikeSDK = hhznBikeSDK

const ArrowIcon = 'http://115.190.57.206/static/home/arrow.png'
const BlueConnect = 'http://115.190.57.206/static/home/blue-connect.png'
const BLueDisconnect = 'http://115.190.57.206/static/home/blue-disconnect.png'
const CloseBtnIcon = 'http://115.190.57.206/static/home/close-bth.png'
const CloseBtnBrayIcon = 'http://115.190.57.206/static/home/close-btn-gray.png'
const CloseBtnRedIcon = 'http://115.190.57.206/static/home/close-btn-red.png'
const DownIcon = 'http://115.190.57.206/static/home/down.png'
const FlyTitleIcon = 'http://115.190.57.206/static/home/fly-title.png'
const InductionOpenIcon = 'http://115.190.57.206/static/home/induction-open.png'
const InductionIcon = 'http://115.190.57.206/static/home/induction.png'
const LocationIcon = 'http://115.190.57.206/static/home/location.png'
const LockOpenIcon = 'http://115.190.57.206/static/home/lock-open.png'
const LockIcon = 'http://115.190.57.206/static/home/lock.png'
const ReloadIcon = 'http://115.190.57.206/static/home/reload.png'
const SpeakerOpenIcon = 'http://115.190.57.206/static/home/speaker-open.png'
const SpeakerIcon = 'http://115.190.57.206/static/home/speaker.png'
const SunIcon = 'http://115.190.57.206/static/home/sun.png'
const TopIcon = 'http://115.190.57.206/static/home/top-bg.png'
const WarnNoticeIcon = 'http://115.190.57.206/static/home/warn-icon.png'
const WarningIcon = 'http://115.190.57.206/static/home/warning.png'
const WhistleOpenIcon = 'http://115.190.57.206/static/home/whistle-open.png'
const WhistleIcon = 'http://115.190.57.206/static/home/whistle.png'
const MoreBtnIcon = 'http://115.190.57.206/static/home/more-btn.png'

const BlueOpen = 'http://115.190.57.206/static/home/blue-open.png'
const BlueClose = 'http://115.190.57.206/static/home/blue-close.png'
const WarnInfo = 'http://115.190.57.206/static/home/warn-info.png'
const Bat1 = 'http://115.190.57.206/static/home/bat-1.png'
const Bat2 = 'http://115.190.57.206/static/home/bat-2.png'
const Bat3 = 'http://115.190.57.206/static/home/bat-3.png'
const Bat4 = 'http://115.190.57.206/static/home/bat-4.png'
const Bat5 = 'http://115.190.57.206/static/home/bat-5.png'

// 用户信息
const userStore = useUserStore()
const carStore = useCarStore()
// 获取胶囊位置信息
const menuButtonInfo = uni.getMenuButtonBoundingClientRect()

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
const isUnlocked = ref(false) // 是否解锁成功

// 蓝牙状态 0:未连接 1:连接中 2:已连接
const status = ref(0)
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
  isStarted: false, // 车辆是否已启动。`true`：已启动  - `false`：未启动
  isLocked: true, // 车辆是否处于锁车状态。  - `true`：已锁车  - `false`：未锁车
  isArmed: false, // 车辆是否已设防（防盗报警激活）。  - `true`：已设防  - `false`：未设防
  isMuteArmOn: false, // 车辆是否已开启静音设防。  - `true`：已开启  - `false`：未开启
  isKeylessOn: false, // 感应启动功能是否开启。  - `true`：开启  - `false`：关闭
  keylessType: false, // 感应启动类型。  - `1`：感应启动  - `2`：震动启动  - `3`：一键启动
  keylessRange: false, // 感应启动距离。 - `1`：一档，信号强度最高 - `2`：二档，信号强度中等  - `3`：表示三档，信号强度最低。
})
// 更新车辆状态
const updateCarStatusDebounced = debounce(updateCarStatus, 500)

// 弹出框相关
const carList = ref([])
const selectCar = ref<number>() // 选中车辆ID

// message弹窗
const showMessagePopup = ref(false) // 控制弹窗显示
const messageId = ref<number>(0) // 弹窗ID
const duration = ref(0) // 弹窗持续时间
const showCancelBtn = ref(true) // 是否显示取消按钮
const showConfirmBtn = ref(true) // 是否显示确认按钮
const closeOnClickModal = ref(true) // 是否点击蒙层关闭弹窗

const showBatPopup = ref(false) // 电池弹窗显示
// 获取选中车辆名称
const currentCarName = computed(() => {
  const car = carList.value.find(item => item.id === selectCar.value)
  return car ? car.vehicleName : '我的车辆'
})
const colorCode = computed(() => {
  const car = carList.value.find(item => item.id === selectCar.value)
  return car ? car.colorCode : ''
})
// 当前骑行ID,用于标识一次完整的骑行过程，上传骑行数据
let rideId = null
// 上次上传时间
let lastUploadTime = 0
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

// 监听解锁状态上报骑行轨迹
watch(isUnlocked, (newVal) => {
  console.log('当前解锁状态:', newVal)
  getLocation().then((res) => {
    console.log('当前位置:', res)
    if (newVal) {
      // 开始状态上报
      uploadRideStartToServer(res)
      // 上报骑行轨迹
      reportRidingTrack()
    }
    else {
      // 结束状态上报
      uploadRideEndToServer(res)
      // 停止定位
      stopLocationTracking()
    }
  }).catch((err) => {
    console.error('获取位置失败:', err)
  })
})

// 监听多个数据：tabName 和 用户登录状态
watch([() => props.tabName, () => userStore.isLoggedIn], ([newTabName, isLoggedIn], [oldTabName, oldIsLoggedIn]) => {
  if (newTabName === 'home' && isLoggedIn) {
    // 获取车辆列表
    getCarList()
  }
}, {
  immediate: true, // 立即执行一次
  deep: true, // 深度监听
})
watch(() => props.tabName, (newVal) => {
  if (newVal === 'home') {
    // 获取位置和蓝牙权限
    getLocationAndBlueAuth()
  }
}, { deep: true })

onMounted(() => {
  // 获取滑块最大宽度
  getMaxSliderWidth()
  // 获取位置和蓝牙权限
  // getLocationAndBlueAuth()
})

onUnmounted(() => {
  // 清理工作
  disconnect()
  console.log('组件卸载onUnmounted')
})

onShow(() => {
  console.log('组件显示onShow')
  if (props.tabName === 'home') {
    // 获取位置和蓝牙权限
    getLocationAndBlueAuth()
    if (userStore.isLoggedIn) {
      // 获取车辆列表
      getCarList()
    }
  }
})

onHide(() => {
  // 清理工作
  disconnect()
  console.log('onHide() {}')
})

function handleCancel() {
  showMessagePopup.value = false
  console.log('取消操作')
}

function handleConfirm() {
  showMessagePopup.value = false
  console.log('确认操作')
}

// 骑行开始状态上报
async function uploadRideStartToServer(location) {
  // 生成骑行ID
  rideId = generateUUID()
  const res = await httpPost('/riding/ride/start', {
    bikeId: selectCar.value,
    latitude: location.latitude,
    longitude: location.longitude,
    rideId,
    timestamp: Date.now(),
  })
  if (res.code === '200') {
    console.log('上传骑行开始状态成功', res)
  }
  else {
    console.error('上传骑行开始状态失败', res)
  }
}
// 骑行中上传位置到服务器
async function uploadLocationToServer(location) {
  const res = await httpPost('/riding/ride/location', {
    accuracy: location.accuracy,
    latitude: location.latitude,
    longitude: location.longitude,
    rideId,
    speed: location.speed,
    timestamp: Date.now(),
  })
  if (res.code === '200') {
    console.log('上传骑行中状态成功', res)
  }
  else {
    console.error('上传骑行中状态失败', res)
  }
}

// 骑行结束状态上报
async function uploadRideEndToServer(location) {
  const res = await httpPost('/riding/ride/end', {
    bikeId: selectCar.value,
    latitude: location.latitude,
    longitude: location.longitude,
    rideId,
    timestamp: Date.now(),
  })
  // 重置骑行ID
  rideId = null
  if (res.code === '200') {
    console.log('上传骑行结束状态成功', res)
  }
  else {
    console.error('上传骑行结束状态失败', res)
  }
}

// 上报骑行轨迹
async function reportRidingTrack() {
  try {
    const res = await initLocationAuth()
    console.log('开启后台定位权限成功', res)
    // 成功后可开始监听位置变化
    // 开启后台定位
    wx.startLocationUpdateBackground({
      success: (res) => {
        console.log('开启后台定位成功', res)
        // 成功后可开始监听位置变化
        startListeningLocation()
      },
      fail: (err) => {
        console.error('开启后台定位失败', err)
        // this.handleLocationError(err)
      },
    })
  }
  catch (err) {
    console.error('开启后台定位失败', err)
  }
}

// 监听位置变化
function startListeningLocation() {
  wx.onLocationChange((location) => {
    console.log('位置发生变化', location)
    // 处理位置信息，例如上传到服务器
    processNewLocation(location)
  })
}

// 处理新的位置信息

function processNewLocation(location) {
  // 获取位置详细信息
  const {
    latitude, // 纬度
    longitude, // 经度
    speed, // 速度，单位 m/s
    accuracy, // 定位精度
    altitude, // 高度，单位 m
    verticalAccuracy, // 垂直精度(iOS)
    horizontalAccuracy, // 水平精度
  } = location

  // 示例：每5秒上传一次位置信息
  const currentTime = Date.now()
  lastUploadTime = lastUploadTime || 0

  if (currentTime - lastUploadTime > 5 * 1000) {
    uploadLocationToServer(location)
    console.log('上传位置信息到服务器', location)
    lastUploadTime = currentTime
  }
  console.log('处理新的位置信息', location, carState.value)
}

// 停止定位
function stopLocationTracking() {
  wx.stopLocationUpdate({
    success: (res) => {
      console.log('停止定位成功', res)
    },
    fail: (err) => {
      console.error('停止定位失败', err)
    },
  })

  // 取消位置监听
  wx.offLocationChange()
}
// 获取滑块最大宽度
function getMaxSliderWidth() {
  uni.createSelectorQuery()
    .in(getCurrentInstance().proxy)
    .select('.slider')
    .boundingClientRect((res: UniApp.NodeInfo) => {
      maxRight.value = res.width - 70 // 70为滑块的宽度
      // console.log('滑块最大右侧位置:', maxRight.value)
      // setSliderStatus(true)
    })
    .exec()
}
// 设置滑块状态
function setSliderStatus(open) {
  // 设置车辆锁定状态
  if (open) {
    sliderX.value = maxRight.value
    sliderStyle.value = `transform: translateX(${maxRight.value}px); transition: all 0.5s ease`
  }
  else {
    sliderX.value = 0
    sliderStyle.value = `transform: translateX(0); transition: all 0.5s ease`
  }
}

// 获取位置和蓝牙权限
async function getLocationAndBlueAuth() {
  try {
    const loc = await initLocationAuth()
    console.log('开启后台定位权限成功', loc)
    // 获取位置和天气
    getLocationAndWeather()
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
  if (status.value === 0) {
    connectBle()
  }
  else {
    disconnect()
  }
}

// 蓝牙功能列表操作
function onItemClick(item) {
  console.log('点击了:', item)
  if (status.value === 0 || status.value === 1) {
    uni.showToast({
      title: '请先连接蓝牙',
      icon: 'none',
      mask: true,
    })
    return
  }
  switch (item.name) {
    case '车辆设防':
      uni.showModal({
        title: '操作提示',
        content: item.active ? '确定要解防车辆吗？' : '确定要设防车辆吗？',
        success(res) {
          if (res.confirm) {
            // 设防/解防指令
            item.active ? EVSBikeSDK.bleCommandsApi.sendDisarmCommand() : EVSBikeSDK.bleCommandsApi.sendArmCommand()
          }
        },
      })
      break
    case '一键静音':
      if (carState.value.isLocked) {
        // 解防指令
        EVSBikeSDK.bleCommandsApi.sendDisarmCommand()
      }
      else {
        uni.showToast({
          title: '车辆已开启',
          icon: 'none',
        })
      }
      break
    case '感应控车':
      uni.navigateTo({
        url: '/pages-car/interaction/index',
      })
      break
    case '鸣笛寻车':
      if (carState.value.isLocked) {
        uni.vibrateLong()
        EVSBikeSDK.bleCommandsApi.sendFindVehicleCommand()
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

// 刷新
function reloadLocation() {
  getCurrentRidingInfo()
}

// 获取当前骑行信息
async function getCurrentRidingInfo(vehicleId = selectCar.value) {
  if (!vehicleId)
    return
  uni.showLoading({
    title: '加载中...',
    mask: true,
  })
  const res = await httpGet(`/riding/ride/homepage/vehicle/${vehicleId}`)
  uni.hideLoading()
  currentRidingInfo.value = (res.data as any)
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
      console.log('获取天气信息成功:', weatherRes.data)
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
    getCurrentRidingInfo()
    // 自动连接蓝牙
    connectBle()
  }
}
// 默认选中车辆
function setDefaultVehicleId(carsList) {
  if (!userStore.userInfo.defaultVehicleId) {
    // 未设置默认车辆，选中第一辆
    if (carsList.length > 0) {
      selectCar.value = carsList[0].id
      // 更新用户信息,设置默认车辆id
      const params = {
        ...userStore.userInfo,
        defaultVehicleId: carsList[0].id,
      }
      delete params.token

      userStore.updateInfo(params)
    }
    return
  }
  if (carsList.length > 0) {
    const findCar = carsList.find(item => item.id === userStore.userInfo.defaultVehicleId)
    if (findCar) {
      selectCar.value = findCar.id
    }
    else {
      selectCar.value = carsList[0].id
    }
  }

  // 存储选中车辆颜色
  uni.setStorageSync('selectColorCode', colorCode.value)
}

// 连接蓝牙
async function connectBle() {
  try {
    const blueAuth = await initBLuetoothAuth()
    if (!blueAuth) {
      uni.showToast({
        title: '请开启蓝牙权限',
        icon: 'none',
        mask: true,
      })
      return
    }
    status.value = 1

    // 统一入口：传name或deviceId
    // E车星SDK连接方式
    // const device = await openAndSearchAndConnect({
    //   name: 'EV10C-15B6C6',
    // }) as { deviceId: string }
    // const res = await EVSBikeSDK.connect({
    //   deviceId: device.deviceId,
    //   type: 'at', // 设备类型
    // })

    // 华慧蓝牙SDK连接方式
    await EVSBikeSDK.connect({
      deviceId: '205091606',
      type: 'at', // 设备类型
    })
    // console.log(res)

    status.value = 2

    EVSBikeSDK.subscribe(onStateChange)
    // E车星SDK发送密码验证指令
    // EVSBikeSDK.bleCommandsApi.sendBindOwnerCommand('166A5F83')

    // 华慧SDK发送密码验证指令
    EVSBikeSDK.bleCommandsApi.sendBindOwnerCommand('10 82 8D 54 AA B7 82 85 15 69 5D AE AF F2 D9 C9 9E 30 47 E4 FD 8F AF 25 87 7D 59 21 E9 E6 5B 69 ')

    // 监听蓝牙状态
    wx.onBLEConnectionStateChange((res) => {
      // 该方法回调中可以用于处理连接意外断开等异常情况
      console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
      if (!res.connected) {
        status.value = 0
        if (props.tabName === 'home') {
          uni.showToast({
            title: '蓝牙连接已断开',
            icon: 'error',
            duration: 600,
          })
        }
        EVSBikeSDK.unsubscribe(onStateChange)
      }
    })
  }
  catch (err) {
    console.log(err)
    status.value = 0
    // wx.showToast({
    //   title: err.errMsg || '连接蓝牙失败',
    //   icon: 'error',
    //   duration: 600,
    // })
  }
}

function onStateChange(data) {
  console.log('设备状态变化:', data)
  const {
    operType,
    message,
    success,
    state,
  } = data
  switch (operType) {
    // 绑定用户
    case 'BIND_USER':
      // 查询车辆状态和取设备设置参数，感应启动相关
      EVSBikeSDK.bleCommandsApi.sendGetVehicleStatusCommand()
      // setTimeout(() => {
      //   EVSBikeSDK.bleCommandsApi.sendGetEcuConfigCommand()
      // }, 100)
      break
    // 获取车辆状态成功后发送获取ECU
    case 'GET_CAR_STATUS':
      EVSBikeSDK.bleCommandsApi.sendGetEcuConfigCommand()
      break
    default:
      break
  }

  if (!state)
    return

  carState.value = {
    ...carState.value,
    ...state,
  }
  // 防抖
  updateCarStatusDebounced()
}

function updateCarStatus() {
  list.value = list.value.map((item) => {
    if (item.name === '车辆设防')
      item.active = carState.value.isArmed
    // if (item.name === '一键静音')
    //   item.active = carState.value.isMuteArmOn
    if (item.name === '感应控车')
      item.active = carState.value.isKeylessOn
    return item
  })

  isUnlocked.value = !carState.value.isLocked
  setSliderStatus(isUnlocked.value)
}
// 断开蓝牙
function disconnect() {
  EVSBikeSDK.disconnect()
    .then((res) => {
      console.log('断开蓝牙', res)
      status.value = 0
      EVSBikeSDK.unsubscribe(onStateChange)
    })
    .catch((err) => {
      console.log(err)
    })
}
// 切换车辆
async function handleConfirmCar({ value, selectedItems }) {
  console.log('选中车辆:', value, selectedItems)
  const params = {
    ...userStore.userInfo,
    defaultVehicleId: value,
  }
  delete params.token

  // 更新用户信息,设置车辆id
  userStore.updateInfo(params)

  // 存储选中车辆颜色
  uni.setStorageSync('selectColorCode', colorCode.value)
}

function onTouchStart(event) {
  startX.value = event.touches[0].pageX - sliderX.value
}
function onTouchMove(event) {
  if (status.value !== 2) {
    uni.showToast({
      title: '请先连接蓝牙',
      icon: 'success',
      mask: true,
    })
    return false
  }
  let moveX = event.touches[0].pageX - startX.value
  moveX = Math.max(0, Math.min(moveX, maxRight.value))
  sliderX.value = moveX
  sliderStyle.value = `transform: translateX(${moveX}px)`
}
// 开锁、关锁
function onTouchEnd(event) {
  const success = () => {
    // isUnlocked.value = !isUnlocked.value
    // E车星蓝牙SDK发送开关车指令
    // carState.value.isLocked ? EVSBikeSDK.bleCommandsApi.sendPowerOnCommand() : EVSBikeSDK.bleCommandsApi.sendDisarmCommand()
    // 华慧蓝牙SDK发送开关车指令
    carState.value.isLocked ? EVSBikeSDK.bleCommandsApi.sendPowerOnCommand() : EVSBikeSDK.bleCommandsApi.sendPowerOffCommand()
  }
  const fail = () => {
    // 回弹到对应位置
    sliderX.value = isUnlocked.value ? maxRight.value : 0
    sliderStyle.value = isUnlocked.value
      ? `transform: translateX(${maxRight.value}px); transition: all 0.5s ease`
      : `transform: translateX(0px); transition: all 0.5s ease `
  }

  if (!isUnlocked.value && sliderX.value === maxRight.value) {
    // isUnlocked.value = true
    // 操作成功
    success()
  }
  else if (isUnlocked.value && sliderX.value === 0) {
    // isUnlocked.value = false
    // 操作成功
    success()
  }
  else {
    fail()
  }
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
  if (!selectCar.value) {
    uni.showToast({
      title: '请先选择车辆',
      icon: 'none',
      mask: true,
    })
    return
  }
  uni.navigateTo({
    url: `/pages-car/trackDetail/index?rideId=${currentRidingInfo.value.rideId}`,
  })
}
// 显示天气详情
function showWeatherDetail() {
  weatherPopVisible.value = true
}
</script>

<template>
  <view class="Home">
    <view class="top-card">
      <image
        class="top-bg z-0"
        :src="colorCode ? getColorImg(colorCode, 'home') : TopIcon"
        mode="scaleToFill"
      />

      <!-- 我的车辆&蓝牙状态 -->
      <wd-picker v-if="userStore.isLoggedIn" v-model="selectCar" :z-index="100" label-key="vehicleName" value-key="id" :columns="carList" :disabled="!carList.length" use-default-slot @confirm="handleConfirmCar">
        <view class="car relative z-3 h-90rpx flex items-center justify-between px-29rpx" :style="{ paddingTop: `${menuButtonInfo?.top + menuButtonInfo.height + 0}px` }">
          <view>
            <span class="text-30rpx font-bold">{{ currentCarName }}</span>
            <image
              class="ml-16rpx h-15rpx w-30rpx"
              :src="DownIcon"
              mode="aspectFit"
            />
          </view>

          <template v-if="weatherInfo && weatherInfo.wea">
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
            <view class="absolute bottom-[-65rpx] right-28rpx h-80rpx w-230rpx flex items-center justify-evenly rounded-[10rpx] bg-[#5DACF8]">
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
            <image
              class="absolute bottom-[-95rpx] right-38rpx z-10 h-24rpx w-40rpx"
              :src="MoreBtnIcon"
              mode="scaleToFill"
              @click.stop="showWeatherDetail"
            />
          </template>
        </view>
      </wd-picker>
      <template v-else>
        <view class="car relative z-3 h-90rpx flex items-center justify-between px-29rpx" :style="{ paddingTop: `${menuButtonInfo?.top + menuButtonInfo.height + 15}px` }">
          <view @click="goLogin ">
            登录
          </view>
          <template v-if="weatherInfo && weatherInfo.wea">
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
            <view class="absolute bottom-[-65rpx] right-28rpx h-80rpx w-230rpx flex items-center justify-evenly rounded-[10rpx] bg-[#5DACF8]">
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
            <image
              class="absolute bottom-[-95rpx] right-38rpx z-10 h-24rpx w-40rpx"
              :src="MoreBtnIcon"
              mode="scaleToFill"
              @click.stop="showWeatherDetail"
            />
          </template>
        </view>
      </template>
      <view class="top-cont">
        <template v-if="carStore.network">
          <view class="flex items-center justify-between px-114rpx pt-40rpx">
            <image
              class="h-80rpx w-80rpx"
              :src="status === 0 ? BlueClose : BlueOpen"
              mode="scaleToFill"
            />
            <image
              class="h-80rpx w-80rpx"
              :src="Bat5"
              mode="scaleToFill"
              @click="showBatPopup = true"
            />
            <view class="relative h-80rpx w-80rpx">
              <view class="notice-count absolute right-0 top-0">
                2
              </view>
              <image
                class="h-80rpx w-80rpx"
                :src="WarnInfo"
                mode="scaleToFill"
              />
            </view>
          </view>
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
              :class="{ 'animate-opacity': status === 1 }"
              :src="status === 0 ? BLueDisconnect : BlueConnect"
              mode="scaleToFill"
            />
            <span class="ml-20rpx text-24rpx">{{ status === 2 ? '已连接' : status === 1 ? '蓝牙连接中' : '未连接' }}</span>
          </view>
        </template>
      </view>

      <!-- 蓝牙功能相关 -->
      <view class="relative z-10 mb-19rpx ml-20rpx mt-[-75rpx] box-border w-710rpx rounded-[10rpx] bg-white px-80rpx py-33rpx">
        <view
          class="slider relative z-11 mb-40rpx h-136rpx w-550rpx rounded-[136rpx]"
          :style="{ background: status === 0 || status === 1 ? '#E6E6E6' : isUnlocked ? '#2CBC7B' : '#DB6477' }"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <image
            class="slider-bg absolute left-0 top-0 z-12 h-136rpx w-136rpx"
            :style="sliderStyle"
            :src="status === 0 || status === 1 ? CloseBtnBrayIcon : isUnlocked ? CloseBtnIcon : CloseBtnRedIcon"
            mode="scaleToFill"
          />
          <image
            class="absolute top-36rpx h-64rpx w-101rpx"
            :style="{ transform: isUnlocked ? 'rotate(0deg)' : 'rotate(180deg)', left: isUnlocked ? '73rpx' : '216rpx' }"
            :src="ArrowIcon"
            mode="scaleToFill"
          />
          <view
            class="absolute top-52rpx text-31rpx"
            :style="{ left: isUnlocked ? '213rpx' : '353rpx', color: status === 0 || status === 1 ? '#333333' : isUnlocked ? '#ffffff' : '#ffffff' }"
          >
            {{ isUnlocked ? '滑动锁车' : '滑动开锁' }}
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
              <image mode="scaleToFill" class="item-img" :style="{ opacity: status === 2 ? '1' : '0.3' }" :src="item.active ? item.activeIcon : item.icon" />
              <text class="item-text">
                {{ item.name }}
              </text>
            </view>
          </view>
        </fg-scroll-x>
      </view>
      <!-- 车辆位置 -->
      <view v-if="!carStore.network" class="flex items-center justify-between px-20rpx">
        <view class="relative box-border w-710rpx rounded-[10rpx] bg-white px-25rpx py-23rpx">
          <view class="flex items-center justify-between">
            <view class="flex items-center">
              <view class="whitespace-nowrap text-30rpx">
                车辆位置
              </view>
              <image class="ml-30rpx h-22rpx w-22rpx" :src="ReloadIcon" mode="scaleToFill" />
              <view class="ml-24rpx whitespace-nowrap text-28rpx color-[#666666]" @click="reloadLocation">
                刷新
              </view>
            </view>
            <view>{{ currentRidingInfo.ridingStatus }}</view>
          </view>
          <view class="mt-20rpx flex items-center justify-between color-[#666666]">
            <view class="text-20rpx">
              {{ currentRidingInfo.address }}
            </view>
            <view class="text-16rpx">
              骑行人：{{ currentRidingInfo.ridingName }}
            </view>
          </view>
          <!-- 轨迹地图 -->
          <view>
            <HomeMap :location="mapLocation" :riding-track="currentRidingInfo.ridingTrack" @map-click="goDetail" />
          </view>
        </view>
      </view>
      <!-- bottom -->
      <view v-else class="flex items-center justify-between px-20rpx">
        <view class="relative box-border h-166rpx w-340rpx rounded-[10rpx] bg-white px-25rpx py-23rpx">
          <view class="flex items-center">
            <view class="whitespace-nowrap text-30rpx">
              车辆位置
            </view>
            <image class="ml-72rpx h-22rpx w-22rpx" :src="ReloadIcon" mode="scaleToFill" />
            <view class="ml-24rpx whitespace-nowrap text-28rpx">
              刷新
            </view>
          </view>
          <view class="mt-24rpx w-258rpx text-23rpx">
            广东省广州市珠海区广东省 广州市珠海区
          </view>
          <image class="absolute bottom-12rpx right-14rpx h-48rpx w-52rpx" :src="LocationIcon" mode="scaleToFill" />
        </view>

        <view class="relative box-border h-166rpx w-340rpx rounded-[10rpx] bg-white px-25rpx py-23rpx">
          <view class="flex items-center justify-between">
            <view class="whitespace-nowrap text-30rpx">
              警告信息
            </view>
            <view class="notice-count">
              2
            </view>
          </view>
          <view class="mt-24rpx w-258rpx text-23rpx text-gray-500">
            及时掌握车辆动态
          </view>
          <image class="absolute bottom-12rpx right-14rpx h-55rpx w-55rpx" :src="WarnNoticeIcon" mode="scaleToFill" />
        </view>
      </view>
    </view>
  </view>

  <!-- 天气弹窗 -->
  <weather-pop v-model="weatherPopVisible" :weather-info="weatherInfo" />
  <!-- 电池电压弹窗 -->
  <fg-message v-model:show="showBatPopup" :duration="duration" :show-cancel-btn="true" :show-confirm-btn="true" :close-on-click-modal="closeOnClickModal" @cancel="showBatPopup = false" @confirm="handleConfirm">
    <view class="w-500rpx">
      <view class="bat flex items-center justify-between">
        <view class="bat-item">
          48V
        </view>
        <view class="bat-item">
          60V
        </view>
        <view class="bat-item active">
          72V
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
</template>

<style lang="scss" scoped>
.Home {
  height: 100vh;
  padding-bottom: 100rpx;
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
    background-color: #FFAB4E;
    color: #ffffff;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
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
.custom-txt {
  color: black;
  width: 400rpx;
  height: 400rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40rpx;
  border-radius: 32rpx;
}
</style>
