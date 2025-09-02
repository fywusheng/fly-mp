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
import {
  openAndSearchAndConnect,
} from '@/utils/EvsBikeSdk'
import EVSBikeSDK from '@/utils/EVSBikeSDK.v1.1.0'

const PointIcon = 'http://121.89.87.166/static/car/point.png'
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
  keylessRange: 1, // 感应启动距离。 - `1`：一档，信号强度最高 - `2`：二档，信号强度中等  - `3`：表示三档，信号强度最低。
})

onLoad(() => {
  connectBle()
})

onHide(() => {
  EVSBikeSDK.unsubscribe(onStateChange)
})
onUnload(() => {
  EVSBikeSDK.unsubscribe(onStateChange)
})

// 连接蓝牙
async function connectBle() {
  try {
    // 统一入口：传name或deviceId
    const device = await openAndSearchAndConnect({
      name: 'EV10C-154928',
    }) as { deviceId: string }
    const res = await EVSBikeSDK.connect({
      deviceId: device.deviceId,
      type: 'at', // 设备类型
    })
    console.log('连接成功', res)
    EVSBikeSDK.subscribe(onStateChange)
    // 发送指令
    EVSBikeSDK.bleCommandsApi.sendBindOwnerCommand('4F7A126E')
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
  // 更新数据
  isInductionCar.value = carState.value.isKeylessOn
  distance.value = carState.value.keylessRange || 1
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay = 500) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (...args: Parameters<T>) {
    if (timer)
      clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

function onSubmitClick() {
  // 开启/关闭感应功能
  isInductionCar.value ? EVSBikeSDK.bleCommandsApi.sendSetKeylessUnlockExpireCommand('251224') : EVSBikeSDK.bleCommandsApi.sendKeylessUnlockCloseCommand()
  // // 设置感应距离
  EVSBikeSDK.bleCommandsApi.sendKeylessUnlockRangCommand(distance.value)

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
</script>

<template>
  <view class="bind-car">
    <view class="mt-30rpx w-711rpx">
      <view class="mt-8rpx overflow-hidden rounded-[10rpx]">
        <wd-cell-group border>
          <wd-cell title="感应控车">
            <wd-switch v-model="isInductionCar" active-color="#2CBC7B" inactive-color="#E9E9EB" />
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

    <view class="mt-62rpx h-80rpx w-710rpx flex items-center justify-center rounded-[40rpx] bg-[#239AF6] color-white" @click="onSubmitClick">
      提 交
    </view>
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
