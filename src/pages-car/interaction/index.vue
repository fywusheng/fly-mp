<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '感应控车',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
// E车星蓝牙SDK
// import { openAndSearchAndConnect } from '@/utils/EvsBikeSdk'
// import EVSBikeSDK from '@/utils/EVSBikeSDK.v1.1.1'

// 华慧蓝牙SDK
import hhznBikeSDK from '@/plugin/bleSdk/HHZNBikeSDK/HHZNBikeSDK.v1.0.3.js'

import { useCarStore } from '@/store'
import { debounce } from '@/utils'
import { httpGet, httpPost } from '@/utils/http'

// 华慧蓝牙SDK
const EVSBikeSDK = hhznBikeSDK
const carStore = useCarStore()

const PointIcon = 'http://115.190.57.206/static/car/point.png'
const isInductionCar = ref(true) // 感应控车
const distance = ref(1)
const updateCarStatusDebounced = debounce(updateCarStatus, 500) // 更新车辆状态
// 车辆状态
const carState = ref({
  isStarted: false, // 车辆是否已启动。`true`：已启动  - `false`：未启动
  isLocked: true, // 车辆是否处于锁车状态。  - `true`：已锁车  - `false`：未锁车
  isArmed: false, // 车辆是否已设防（防盗报警激活）。  - `true`：已设防  - `false`：未设防
  isMuteArmOn: false, // 车辆是否已开启静音设防。  - `true`：已开启  - `false`：未开启
  isKeylessOn: false, // 感应启动功能是否开启。  - `true`：开启  - `false`：关闭
  keylessType: 1, // 感应启动类型。  - `1`：感应启动  - `2`：震动启动  - `3`：一键启动
  keylessRange: 2, // 感应启动距离。 - `1`：一档，信号强度最高 - `2`：二档，信号强度中等  - `3`：表示三档，信号强度最低。
})
// 车辆信息
let carInfo = {} as any

onLoad((e) => {
  carInfo = JSON.parse(decodeURIComponent(e.info))
  console.log('解析后的车辆信息', carInfo)
  if (carStore.network) {
    // 4G车辆状态获取
    getCarInfo(carInfo.deviceNo)
  }
  connectBle()
})

onHide(() => {
  EVSBikeSDK.unsubscribe(onStateChange)
})
onUnload(() => {
  EVSBikeSDK.unsubscribe(onStateChange)
})

// 获取车辆状态信息
function getCarInfo(deviceNo?: string) {
  httpGet(`/device/v2/devices/${deviceNo}/status`).then((res) => {
    console.log('获取车辆状态信息成功:', res)
    carState.value = {
      ...carState.value,
      ...res.data as any,
    }
    // 更新车辆状态
    updateCarStatus()
  }).catch((err) => {
    console.error('获取车辆状态信息失败:', err)
  })
}
// 4g控车指令
function controlBike(commandType: string) {
  uni.showLoading({
    title: '指令发送中...',
    mask: true,
  })
  const deviceNo = carInfo.deviceNo
  return new Promise((resolve, reject) => {
    httpPost(`/device/v2/devices/${deviceNo}/commands`, { commandType }).then((res) => {
      uni.hideLoading()

      resolve(res)
    }).catch((err) => {
      uni.hideLoading()
      reject(err)
    })
  })
}

// 连接蓝牙
async function connectBle() {
  try {
    // 统一入口：传name或deviceId
    // const device = await openAndSearchAndConnect({
    //   name: 'EV10C-15B6C6',
    // }) as { deviceId: string }
    // const res = await EVSBikeSDK.connect({
    //   deviceId: device.deviceId,
    //   type: 'at', // 设备类型
    // })
    // 华慧蓝牙SDK连接方式
    const res = await EVSBikeSDK.connect({
      deviceId: '205091606',
      type: 'at', // 设备类型
    })
    console.log('连接成功', res)
    EVSBikeSDK.subscribe(onStateChange)
    // E车星SDK发送密码验证指令
    // EVSBikeSDK.bleCommandsApi.sendBindOwnerCommand('166A5F83')

    // 华慧SDK发送密码验证指令
    EVSBikeSDK.bleCommandsApi.sendBindOwnerCommand('10 82 8D 54 AA B7 82 85 15 69 5D AE AF F2 D9 C9 9E 30 47 E4 FD 8F AF 25 87 7D 59 21 E9 E6 5B 69 ')
  }
  catch (err) {
    console.log(err)
    wx.showToast({
      title: err.message || '连接失败',
      icon: 'none',
      duration: 500,
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
      EVSBikeSDK.bleCommandsApi.sendGetEcuConfigCommand()
      break
    case 'SET_KEYLESS_EXPIRE': // at设备设置感应启动时间后查询一下时间是否过期
      EVSBikeSDK.bleCommandsApi.sendGetEcuConfigCommand()
      break
    case 'SET_KEYLESS_RANGE':
      if (success) {
        EVSBikeSDK.bleCommandsApi.sendGetEcuConfigCommand()
      }
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
// 更新数据
function updateCarStatus() {
  isInductionCar.value = carState.value.isKeylessOn
  distance.value = carState.value.keylessRange || 1
}
// 设置感应控车状态改变
function setKeyless(e: any) {
  if (carStore.network) {
    controlBike(e.value ? 'keylessOn' : 'keylessOff').then((res) => {
      if (res.code !== '200') {
        uni.showModal({
          title: '设置失败',
          content: res.message || '请稍后重试',
          showCancel: false,
        })
        nextTick(() => {
          isInductionCar.value = !e.value
        })
      }
    })
  }
  else {
    // 开启/关闭感应功能
    e ? EVSBikeSDK.bleCommandsApi.sendSetKeylessUnlockExpireCommand('991231') : EVSBikeSDK.bleCommandsApi.sendKeylessUnlockCloseCommand()
  }
}

// 设置感应控车距离改变
function setKeylessRange(range: number) {
  let commandType = ''
  switch (range) {
    case 1:
      commandType = 'keylesslevel1'
      break
    case 2:
      commandType = 'keylesslevel2'
      break
    case 3:
      commandType = 'keylesslevel3'
      break
    default:
      commandType = 'keylesslevel1'
      break
  }
  if (carStore.network) {
    controlBike(commandType).then((res) => {
      if (res.code !== '200') {
        uni.showModal({
          title: '设置失败',
          content: res.message || '请稍后重试',
          showCancel: false,
        })
        nextTick(() => {
          isInductionCar.value = !e.value
        })
      }
    })
  }
  else {
    console.log('感应控车距离改变:', range)
    EVSBikeSDK.bleCommandsApi.sendSetKeylessUnlockRangeCommand(range)
  }
}

// 提交设置
function onSubmitClick() {
  if (carStore.network) {
    controlBike('commandType').then((res) => {
      if (res.code !== '200') {
        uni.navigateBack()
      }
    })
  }
  else {
    // 蓝牙车辆设置

    setTimeout(() => {
    // 设置感应距离
      EVSBikeSDK.bleCommandsApi.sendKeylessUnlockRangeCommand(distance.value)
    }, 500)

    uni.showToast({
      title: '设置成功',
      icon: 'success',
      duration: 1000,
    })

    setTimeout(() => {
    // 返回首页
      uni.navigateBack()
    }, 1000)
  }
}
</script>

<template>
  <view class="bind-car">
    <view class="mt-30rpx w-711rpx">
      <view class="mt-8rpx overflow-hidden rounded-[10rpx]">
        <wd-cell-group border>
          <wd-cell title="感应控车">
            <wd-switch v-model="isInductionCar" active-color="#2CBC7B" inactive-color="#E9E9EB" @change="setKeyless" />
          </wd-cell>
        </wd-cell-group>
      </view>
    </view>

    <view class="mt-28rpx w-711rpx">
      <view class="mt-8rpx overflow-hidden rounded-[10rpx]">
        <wd-cell-group title="感应距离" border>
          <view class="flex items-center justify-between px-30rpx">
            <text>近</text>
            <view class="w-516rpx">
              <fg-slider
                v-model="distance"
                bar-height="6"
                :range="false"
                :min="1"
                :step="1"
                :max="3"
                custom-block
                :show-steps="true"
                @change="setKeylessRange"
              >
                <template #block>
                  <image
                    class="h-38rpx w-38rpx"
                    :src="PointIcon"
                    mode="scaleToFill"
                  />
                </template>
              </fg-slider>
            </view>

            <text>远</text>
          </view>
        </wd-cell-group>
      </view>
    </view>

    <view class="mt-28rpx w-711rpx">
      <view class="mt-8rpx overflow-hidden rounded-[10rpx]">
        <wd-cell-group title="说明" border>
          <div class="px-31rpx py-41rpx text-24rpx color-[#6E6E6E]">
            感应控车开启后可实现手机靠近车辆，即可解锁同时启动 车辆。远离车辆自动断电并设防。
          </div>
        </wd-cell-group>
      </view>
    </view>

    <view class="mt-28rpx w-711rpx">
      <view class="mt-8rpx overflow-hidden rounded-[10rpx]">
        <wd-cell-group title="注意" border>
          <div class="px-31rpx py-41rpx text-24rpx color-[#6E6E6E]">
            <view>受不同手机蓝牙信号强弱及周围环境干扰，可能会偶发断 电或启动延时等情况。</view>
            <view class="color-[#DF0615]">
              *如出现断电或启动延时，拿出手机或连上蓝牙即可恢复
            </view>
          </div>
        </wd-cell-group>
      </view>
    </view>

    <!-- <view class="mt-62rpx h-80rpx w-710rpx flex items-center justify-center rounded-[40rpx] bg-[#239AF6] color-white" @click="onSubmitClick">
      提 交
    </view> -->
  </view>
</template>

<style lang="scss" scoped>
.bind-car {
  background-color: #DDE3EC;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  :deep() {
    .wd-cell-group__left {
      font-family: Microsoft YaHei;
      font-weight: 400;
      font-size: 30rpx;
      color: #333333;
    }
    .wd-cell__title {
      font-family: Microsoft YaHei;
      font-weight: 400;
      font-size: 30rpx;
      color: #333333;
    }
  }

}
</style>
