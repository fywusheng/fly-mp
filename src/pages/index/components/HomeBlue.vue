<script setup lang="ts">
import { useUserStore } from '@/store'
import { getLocation } from '@/utils'
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

// 弹出框相关
const show = ref(false)
const carList = ref([{ value: 13, label: '车辆1' }, { value: 14, label: '车辆2' }])
const selectCarValue = ref<number>(14)
const selectCar = ref<number>(0)

function onChange({ picker, value, index }) {
  console.log('当前选中项:', value, '下标:', index, selectCar.value)
}
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

// 蓝牙功能相关
const status = ref(0) // 蓝牙状态 0:未连接 1:连接中 2:已连接
const name = ref('EV12C-1911BA')
const state = ref({
  isStarted: false, // 启动
  isLocked: true, // 锁车
  isArmed: false, // 设防
})
const list = ref([{
  name: '车辆解防',
  icon: LockIcon,
  activeIcon: LockOpenIcon,
  active: true,
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

onMounted(() => {
  // 获取位置信息和蓝牙权限
  getLocationAndBlueAuth()
  // 已经登录
  if (userStore.userInfo.userId) {
    // 获取车辆列表
    getCarList(userStore.userInfo.userId)
  }

  // connectBle()

  uni.createSelectorQuery()
    .in(getCurrentInstance().proxy)
    .select('.slider')
    .boundingClientRect((res: UniApp.NodeInfo) => {
      maxRight.value = res.width - 70 // 70为滑块的宽度
    })
    .exec()
})

// 获取位置和蓝牙权限
function getLocationAndBlueAuth() {
  uni.getSetting({
    success(res) {
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
      else {
        // 已经授权，可以打开蓝牙
        console.log('已经授权，可以打开蓝牙')
        // connectBle()
      }
    },
  })
}

// 蓝牙状态切换
function toggleBluetooth() {
  console.log('当前蓝牙状态:', status.value)
  if (status.value === 0) {
    status.value = 2 // 连接中
    return
  }
  if (status.value === 2) {
    status.value = 0 // 断开连接
  }
}

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
  item.active = !item.active
  switch (item.name) {
    case '车辆解防':
      // onTapFortify()
      uni.showToast({
        title: item.active ? '已解防 ' : '已设防',
        icon: 'none',
      })
      break
    case '一键静音':
      // onTapMute()
      uni.showToast({
        title: item.active ? '已开启静音' : ' 已取消静音',
        icon: 'none',
      })
      break
    case '感应控车':
      // onTapInduction()
      uni.navigateTo({
        url: '/pages-car/interaction/index',
      })
      break
    case '鸣笛寻车':
      // onTapFindCar()
      uni.showToast({
        title: item.active ? '已开启鸣笛寻车 ' : '已关闭鸣笛寻车',
        icon: 'none',
      })
      break
  }
}

// 获取位置信息和天气
function getLocationAndWeather() {
  getLocation().then((res) => {
    // 根据当前位置获取天气信息
    const { latitude, longitude } = res
    httpGet(`/weather/location?latitude=${latitude}&longitude=${longitude}`).then((weatherRes) => {
      weatherInfo.value = weatherRes.data as any
    }).catch((err) => {
      console.error('获取天气信息失败:', err)
    })
  }).catch((err) => {
    console.error('获取位置失败:', err)
  })
}

// 获取车辆列表
function getCarList(userId) {
  httpPost('/user/mini/user/vehicles', { userId }).then((res) => {
    carList.value = res.data as any
  }).catch((err) => {
    console.error('获取车辆列表失败:', err)
  })
}

// 连接蓝牙
async function connectBle() {
  try {
    uni.showLoading({
      mask: true,
    })
    // 统一入口：传name或deviceId
    const device = await openAndSearchAndConnect({
      name: name.value,
    })
    const res = await EVSBikeSDK.connect(device.deviceId)
    console.log(res)
    wx.showToast({
      title: '连接成功',
      icon: 'success',
    })
    // this.setData({
    //   status: 1,
    // })
    EVSBikeSDK.subscribe(onStateChange)
    // 发送指令
    EVSBikeSDK.bleCommandsApi.sendBindOwnerCommand('7248303F')
  }
  catch (err) {
    console.log(err)
    wx.showToast({
      title: err.message || '连接失败',
      icon: 'none',
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
    case 'BIND_USER':
      EVSBikeSDK.bleCommandsApi.sendGetVehicleStatusCommand()
      break
    case 'GET_CAR_STATUS':
      break
    default:
      break
  }
  if (!state)
    return
  this.setData({
    state: {
      ...this.data.state,
      ...state,
    },
  })
}
function disconnect() {
  EVSBikeSDK.disconnect()
    .then((res) => {
      console.log(res)
      this.setData({
        status: 0,
      })
      wx.showToast({
        title: '断开连接成功',
      })
      EVSBikeSDK.unsubscribe(this.onStateChange)
    })
    .catch((err) => {
      console.log(err)
    })
}
//
function onTapLock() {
  let {
    isStarted,
  } = this.data.state
  isStarted ? EVSBikeSDK.bleCommandsApi.sendPowerOffCommand() : EVSBikeSDK.bleCommandsApi.sendPowerOnCommand()
}
function onTapFortify() {
  let {
    isArmed,
  } = this.data.state
  isArmed ? EVSBikeSDK.bleCommandsApi.sendDisarmCommand() : EVSBikeSDK.bleCommandsApi.sendArmCommand()
}
function onTapFindCar() {
  EVSBikeSDK.bleCommandsApi.sendFindVehicleCommand()
}

function onConfirm() {
  show.value = false
  selectCar.value = selectCarValue.value
  console.log('选中车辆selectCarValue:', selectCarValue.value)
  console.log('选中车辆 selectCar:', selectCar.value)
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
    uni.showToast({
      title: '操作成功',
      icon: 'success',
    })
  }
  const fail = () => {
    uni.showToast({
      title: '操作失败',
      icon: 'none',
    })
    // 回弹到对应位置
    sliderX.value = isUnlocked.value ? maxRight.value : 0
    sliderStyle.value = isUnlocked.value
      ? `transform: translateX(${maxRight.value}px)`
      : `transform: translateX(0px)`
  }

  if (!isUnlocked.value && sliderX.value === maxRight.value) {
    isUnlocked.value = true
    success()
  }
  else if (isUnlocked.value && sliderX.value === 0) {
    isUnlocked.value = false
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
        class="top-bg"
        :src="TopIcon"
        mode="scaleToFill"
      />
      <!-- 我的车辆&蓝牙状态 -->
      <view class="top-cont" :style="{ paddingTop: `${menuButtonInfo?.top + menuButtonInfo.height + 15}px` }">
        <view class="car flex items-center pl-29rpx" @click="show = true">
          <span class="text-30rpx font-bold">我的车辆</span>
          <image
            class="ml-16rpx h-15rpx w-30rpx"
            :src="DownIcon"
            mode="aspectFit"
          />
          <view v-if="weatherInfo && weatherInfo.temperature" class="ml-295rpx flex items-center justify-center color-[#333333]">
            <image
              class="h-40rpx w-34rpx"
              :src="weatherInfo.weaImg"
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
            :src="status === 2 ? BlueConnect : BLueDisconnect"
            mode="scaleToFill"
          />
          <span class="ml-20rpx text-24rpx">{{ status === 2 ? '已连接' : status === 1 ? '连接中' : '未连接' }}</span>
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
            @touchmove="onTouchMove"
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
              <view class="ml-24rpx whitespace-nowrap text-28rpx color-[#666666]">
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
  <wd-popup v-model="show" :z-index="100" position="bottom" custom-style="border-radius:32rpx;" :close-on-click-modal="false">
    <view class="flex justify-between px-30rpx py-40rpx text-40rpx">
      <view class="color-[#999999]" @click="show = false">
        取消
      </view>
      <view class="color-[#2CBD7C]" @click="onConfirm">
        确认
      </view>
    </view>
    <wd-picker-view v-model="selectCarValue" :columns="carList" @change="onChange" />
  </wd-popup>
  <!-- 操作提示弹窗 -->
  <fg-message v-model:show="showMessagePopup" :duration="duration" :show-cancel-btn="showCancelBtn" :show-confirm-btn="showConfirmBtn" :close-on-click-modal="closeOnClickModal" :message-id="messageId" @cancel="handleCancel" @confirm="handleConfirm" />
</template>

<style lang="scss" scoped>
.Home {
  height: 100vh;
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
      height: 100%;
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
