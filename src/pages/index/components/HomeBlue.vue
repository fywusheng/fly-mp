<script setup lang="ts">
import { useUserStore } from '@/store'
import { debounce, getLocation } from '@/utils'
import {
  openAndSearchAndConnect,
} from '@/utils/EvsBikeSdk'
import EVSBikeSDK from '@/utils/EVSBikeSDK.v1.1.0'
import { httpGet, httpPost } from '@/utils/http'
import HomeMap from './HomeMap.vue'

defineOptions({
  name: 'HomeBlue',
})
const ArrowIcon = 'http://121.89.87.166/static/home/arrow.png'
const BlueConnect = 'http://121.89.87.166/static/home/blue-connect.png'
const BLueDisconnect = 'http://121.89.87.166/static/home/blue-disconnect.png'
const CloseBtnIcon = 'http://121.89.87.166/static/home/close-bth.png'
const CloseBtnBrayIcon = 'http://121.89.87.166/static/home/close-btn-gray.png'
const CloseBtnRedIcon = 'http://121.89.87.166/static/home/close-btn-red.png'
const DownIcon = 'http://121.89.87.166/static/home/down.png'
const FlyTitleIcon = 'http://121.89.87.166/static/home/fly-title.png'
const InductionOpenIcon = 'http://121.89.87.166/static/home/induction-open.png'
const InductionIcon = 'http://121.89.87.166/static/home/induction.png'
const LocationIcon = 'http://121.89.87.166/static/home/location.png'
const LockOpenIcon = 'http://121.89.87.166/static/home/lock-open.png'
const LockIcon = 'http://121.89.87.166/static/home/lock.png'
const ReloadIcon = 'http://121.89.87.166/static/home/reload.png'
const SpeakerOpenIcon = 'http://121.89.87.166/static/home/speaker-open.png'
const SpeakerIcon = 'http://121.89.87.166/static/home/speaker.png'
const SunIcon = 'http://121.89.87.166/static/home/sun.png'
const TopIcon = 'http://121.89.87.166/static/home/top-bg.png'
const WarnNoticeIcon = 'http://121.89.87.166/static/home/warn-icon.png'
const WarningIcon = 'http://121.89.87.166/static/home/warning.png'
const WhistleOpenIcon = 'http://121.89.87.166/static/home/whistle-open.png'

const WhistleIcon = 'http://121.89.87.166/static/home/whistle.png'

const userStore = useUserStore()
// 获取胶囊位置信息
const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
const weatherInfo = ref<{
  weather: string
  temperature: number | string
  temperatureDay: number | string
  temperatureNight: number | string
  weaImg: string
}>({ weather: '', temperature: '', temperatureDay: '', temperatureNight: '', weaImg: '' }) // 天气信息
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
const selectCar = ref<number>(4)

// message弹窗
const showMessagePopup = ref(false) // 控制弹窗显示
const messageId = ref<number>(0) // 弹窗ID
const duration = ref(0) // 弹窗持续时间
const showCancelBtn = ref(true) // 是否显示取消按钮
const showConfirmBtn = ref(true) // 是否显示确认按钮
const closeOnClickModal = ref(true) // 是否点击蒙层关闭弹窗

function handleCancel() {
  showMessagePopup.value = false
  console.log('取消操作')
}

function handleConfirm() {
  showMessagePopup.value = false
  console.log('确认操作')
}

// 获取选中车辆名称
const currentCarName = computed(() => {
  const car = carList.value.find(item => item.id === selectCar.value)
  return car ? car.vehicleName : '我的车辆'
})

onMounted(() => {
  // 获取后台定位权限
  // wx.getSetting({
  //   success(res) {
  //     if (!res.authSetting['scope.userLocationBackground']) {
  //       wx.authorize({
  //         scope: 'scope.userLocationBackground',
  //         success() {
  //           // 用户同意授权后台定位
  //           // getLocationAndBlueAuth()

  //           // 开启后台定位
  //           // wx.startLocationUpdateBackground({
  //           //   success: (res) => {
  //           //     console.log('开启后台定位成功', res)
  //           //     // 成功后可开始监听位置变化
  //           //     startListeningLocation()
  //           //   },
  //           //   fail: (err) => {
  //           //     console.error('开启后台定位失败', err)
  //           //     // this.handleLocationError(err)
  //           //   },
  //           // })
  //         },
  //         fail(err) {
  //           console.log(err)
  //           // 用户拒绝授权后台定位
  //           uni.showModal({
  //             title: '提示',
  //             content: '需要获取您的后台定位权限',
  //             showCancel: true,
  //             success: ({ confirm, cancel }) => {
  //               console.log('用户点击了', confirm ? '确认' : '取消')
  //               if (confirm) {
  //                 uni.openSetting(
  //                   {
  //                     success(res) {
  //                       if (res.authSetting['scope.userLocationBackground']) {
  //                         // 用户同意授权后台定位
  //                         console.log('用户同意授权后台定位')
  //                         getLocationAndBlueAuth()
  //                         // 开启后台定位
  //                         wx.startLocationUpdateBackground({
  //                           success: (res) => {
  //                             console.log('开启后台定位成功', res)
  //                             // 成功后可开始监听位置变化
  //                             startListeningLocation()
  //                           },
  //                           fail: (err) => {
  //                             console.error('开启后台定位失败', err)
  //                             // this.handleLocationError(err)
  //                           },
  //                         })
  //                       }
  //                     },
  //                     fail(err) {
  //                       console.log('openSetting fail', err)
  //                     },
  //                   },
  //                 )
  //               }
  //             },
  //           })
  //         },
  //       })
  //     }
  //     else {
  //       // 已经授权，可以获取位置信息
  //       getLocationAndBlueAuth()

  //       // 开启后台定位
  //       wx.startLocationUpdateBackground({
  //         success: (res) => {
  //           console.log('开启后台定位成功', res)
  //           // 成功后可开始监听位置变化
  //           startListeningLocation()
  //         },
  //         fail: (err) => {
  //           console.error('开启后台定位失败', err)
  //           // this.handleLocationError(err)
  //         },
  //       })
  //     }
  //   },
  // })
  // 获取滑块最大宽度
  getMaxSliderWidth()
  // 获取位置信息和蓝牙权限
  getLocationAndBlueAuth()
  // 已经登录
  if (userStore.userInfo.userId) {
    // 获取车辆列表
    getCarList()
  }
})

onHide(() => {
  // 清理工作
  EVSBikeSDK.unsubscribe(onStateChange)
  console.log('组件卸载')
})

// 监听位置变化
function startListeningLocation() {
  wx.onLocationChange((location) => {
    console.log('位置发生变化', location)
    // 处理位置信息，例如上传到服务器
    processNewLocation(location)
  })
}

// 处理新的位置信息
// let lastUploadTime = Date.now() // 上次上传时间
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

  // 示例：每5分钟上传一次位置信息
  // const currentTime = Date.now()
  // const lastUploadTime = lastUploadTime || 0

  // if (currentTime - lastUploadTime > 5 * 60 * 1000) {
  //   // uploadLocationToServer(location)
  //   lastUploadTime = currentTime
  // }
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
function getLocationAndBlueAuth() {
  uni.getSetting({
    success(res) {
      console.log('蓝牙权限', res)
      // 检测地理位置权限
      if (!res.authSetting['scope.userLocation']) {
        uni.showModal({
          title: '请求权限',
          content: '需要获取您的地理位置',
          success(res) {
            if (res.confirm) {
              uni.openSetting({
                success(res) {
                  console.log('openSetting success', res.authSetting)
                  if (res.authSetting['scope.userLocation']) {
                    // 用户同意授权地理位置
                    console.log('用户同意授权地理位置')
                    getLocationAndWeather()
                  }
                },
              })
            }
          },
        })
      }
      else {
        // 已经授权，可以获取位置信息
        getLocationAndWeather()
      }
      // 检测蓝牙权限
      if (!res.authSetting['scope.bluetooth']) {
        uni.showModal({
          title: '请求权限',
          content: '需要打开您的蓝牙权限',
          success(res) {
            if (res.confirm) {
              uni.openSetting({
                success(res) {
                  console.log('openSetting success', res.authSetting)
                  if (res.authSetting['scope.bluetooth']) {
                    // 用户同意授权蓝牙
                    console.log('用户同意授权蓝牙')
                    // connectBle()
                  }
                },
              })
            }
          },
        })
      }
      // else {
      //   // 已经授权，可以打开蓝牙
      //   console.log('已经授权，可以打开蓝牙')
      //   // connectBle()
      // }
    },
  })
}

// 蓝牙状态切换
function toggleBluetooth() {
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
  EVSBikeSDK.bleCommandsApi.sendGetVehicleStatusCommand()
}

// 获取位置信息和天气
function getLocationAndWeather() {
  getLocation().then((res) => {
    // 根据当前位置获取天气信息
    const { latitude, longitude } = res
    httpGet(`/device/weather/location?latitude=${latitude}&longitude=${longitude}`).then((weatherRes) => {
      weatherInfo.value = weatherRes.data as any
    }).catch((err) => {
      console.error('获取天气信息失败:', err)
    })
  }).catch((err) => {
    console.error('获取位置失败:', err)
  })
}

// 获取车辆列表
function getCarList() {
  httpGet('/device/vehicle/user/complete').then((res) => {
    carList.value = (res.data as any).resultList
  }).catch((err) => {
    console.error('获取车辆列表失败:', err)
    uni.showToast({
      title: '获取车辆列表失败',
      icon: 'none',
    })
  })
}

// 连接蓝牙
async function connectBle() {
  try {
    status.value = 1

    // 统一入口：传name或deviceId
    const device = await openAndSearchAndConnect({
      name: 'EV10C-154928',
    }) as { deviceId: string }
    const res = await EVSBikeSDK.connect({
      deviceId: device.deviceId,
      type: 'at', // 设备类型
    })
    console.log(res)

    status.value = 2

    EVSBikeSDK.subscribe(onStateChange)
    // 发送密码验证指令
    EVSBikeSDK.bleCommandsApi.sendBindOwnerCommand('4F7A126E')
  }
  catch (err) {
    console.log(err)
    status.value = 0
    wx.showToast({
      title: '请开启蓝牙',
      icon: 'error',
      duration: 600,
    })
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
      setTimeout(() => {
        EVSBikeSDK.bleCommandsApi.sendGetEcuConfigCommand()
      }, 500)
      break
    // 获取车辆状态
    case 'GET_CAR_STATUS':
      // isUnlocked.value = state.isLocked // 车辆锁定状态
      // setSliderStatus(state.isLocked)
      // list.value[0].active = state.isArmed // 车辆设防
      // list.value[1].active = state.isArmed // 一键静音
      break
      // 取设备设置参数，感应启动相关
    case 'GET_ECU_STATUS':
      // 设备状态变化: {"state": {"keylessRange": 2, "isKeylessOn": true}, "operType": "GET_ECU_STATUS", "success": true, "message": "获取车辆设置参数成功"}
      // list.value[2].active = state.isKeylessOn // 感应控车
      // 感应启动距离。 - `1`：一档，信号强度最高 - `2`：二档，信号强度中等  - `3`：表示三档，信号强度最低。
      // state.keylessRange
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

function disconnect() {
  EVSBikeSDK.disconnect()
    .then((res) => {
      console.log(res)
      status.value = 0
      wx.showToast({
        title: '断开连接成功',
      })
      EVSBikeSDK.unsubscribe(onStateChange)
    })
    .catch((err) => {
      console.log(err)
    })
}

function handleConfirmCar({ value }) {
  console.log('选中车辆:', value)
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
function onTouchEnd(event) {
  const success = () => {
    // 发送解锁、开锁指令
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
</script>

<template>
  <view class="Home">
    <view class="top-card">
      <image
        class="top-bg z-0"
        :src="TopIcon"
        mode="scaleToFill"
      />

      <!-- 我的车辆&蓝牙状态 -->
      <wd-picker v-model="selectCar" :z-index="100" label-key="vehicleName" value-key="id" :columns="carList" use-default-slot @confirm="handleConfirmCar">
        <view class="car relative z-1 h-90rpx flex items-center justify-between px-29rpx" :style="{ paddingTop: `${menuButtonInfo?.top + menuButtonInfo.height + 15}px` }">
          <view>
            <span class="text-30rpx font-bold">{{ currentCarName }}</span>
            <image
              class="ml-16rpx h-15rpx w-30rpx"
              :src="DownIcon"
              mode="aspectFit"
            />
          </view>

          <view v-if="weatherInfo && weatherInfo.temperature" class="flex items-center justify-center color-[#333333]">
            <image
              class="h-40rpx w-34rpx"
              :src="SunIcon"
              mode="aspectFit"
            />
            <view class="slide-text flex items-center justify-center">
              <view class="ml-16rpx text-48rpx">
                {{ weatherInfo.temperature }}°
              </view>
              <view class="ml-12rpx text-20rpx">
                <view>{{ weatherInfo.weather }}</view>
                <view>
                  {{ weatherInfo.temperatureDay }}°/{{ weatherInfo.temperatureNight }}°
                </view>
              </view>
            </view>
          </view>
        </view>
      </wd-picker>
      <view class="top-cont">
        <view class="mb-37rpx mt-53rpx flex items-center justify-center">
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
      <view class="flex items-center justify-between px-20rpx">
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
            <view>行驶中</view>
          </view>
          <view class="mt-20rpx flex items-center justify-between color-[#666666]">
            <view class="text-20rpx">
              广东省广州市珠海区广东省 广州市珠海区
            </view>
            <view class="text-16rpx">
              骑行人：张三
            </view>
          </view>
          <HomeMap />
        </view>
      </view>
    </view>
  </view>
  <!-- 车辆选择 -->
  <!-- <wd-popup v-model="show" :z-index="100" position="bottom" custom-style="border-radius:32rpx;" :close-on-click-modal="false">
    <view class="flex justify-between px-30rpx py-40rpx text-40rpx">
      <view class="color-[#999999]" @click="show = false">
        取消
      </view>
      <view class="color-[#2CBD7C]" @click="onConfirm">
        确认
      </view>
    </view>
    <wd-picker-view v-model="selectCarValue" label-key="vehicleName" value-key="id" :columns="carList" @change="onChange" />
  </wd-popup> -->
  <!-- 操作提示弹窗 -->
  <fg-message v-model:show="showMessagePopup" :duration="duration" :show-cancel-btn="showCancelBtn" :show-confirm-btn="showConfirmBtn" :close-on-click-modal="closeOnClickModal" :message-id="messageId" @cancel="handleCancel" @confirm="handleConfirm" />
</template>

<style lang="scss" scoped>
.Home {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #E4EBF2;
  .top-card {
    width: 100%;
    // height: 980rpx;
    height: 880rpx;
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
      height: 580rpx;
      box-sizing: border-box;
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
