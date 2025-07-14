<script setup lang="ts">
import { color } from 'echarts'
import ArrowIcon from '@/static/home/arrow.png'
import BatteryIcon from '@/static/home/battery.png'
import BlueConnect from '@/static/home/blue-connect.png'
import BLueDisconnect from '@/static/home/blue-disconnect.png'
import CloseBtnIcon from '@/static/home/close-bth.png'
import CloseBtnBrayIcon from '@/static/home/close-btn-gray.png'
import DownIcon from '@/static/home/down.png'
import FlyTitleIcon from '@/static/home/fly-title.png'
import LocationIcon from '@/static/home/location.png'
import ReloadIcon from '@/static/home/reload.png'
import TopIcon from '@/static/home/top-bg.png'
import WarnNoticeIcon from '@/static/home/warn-icon.png'
import WarningIcon from '@/static/home/warning.png'

defineOptions({
  name: 'Home',
})
// 获取胶囊位置信息
const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
const startX = ref(0)
const sliderX = ref(0)
const maxRight = ref(0)
const sliderStyle = ref({})
const isUnlocked = ref(false) // 是否解锁成功

onMounted(() => {
  uni.createSelectorQuery().in(getCurrentInstance().proxy).select('.slider').boundingClientRect((res) => {
    console.log('slider-bg boundingClientRect:', res)
    maxRight.value = res.width - 70 // 50为滑块的宽度
  }).exec()
})

function onTouchStart(event) {
  startX.value = event.touches[0].pageX - sliderX.value
}
function onTouchMove(event) {
  let moveX = event.touches[0].pageX - startX.value
  if (moveX < 0)
    moveX = 0
  if (moveX > maxRight.value)
    moveX = maxRight.value
  sliderX.value = moveX
  console.log('sliderX:', sliderX.value)
  sliderStyle.value = `transform: translateX(${sliderX.value}px)`
}

function onTouchEnd(event) {
  if (sliderX.value === maxRight.value) {
    isUnlocked.value = true // 解锁
    // 解锁成功
    uni.showToast({
      title: '开启成功',
      icon: 'success',
    })
  }
  else {
    // 解锁失败
    uni.showToast({
      title: '开启失败',
      icon: 'none',
    })
    isUnlocked.value = false // 解锁
    sliderX.value = 0
    sliderStyle.value = ''
  }
}
</script>

<template>
  <!-- <view class="Home" :style="{marginTop: `${safeAreaInsets?.top}px` }"> -->
  <view class="Home">
    <view class="top-card">
      <image
        class="top-bg"
        :src="TopIcon"
        mode="scaleToFill"
      />
      <!-- top -->
      <view class="top-cont" :style="{ paddingTop: `${menuButtonInfo?.top + menuButtonInfo.height}px` }">
        <view class="car pl-29rpx">
          <span class="text-30rpx font-bold">我的车辆</span>
          <image
            class="ml-16rpx h-15rpx w-30rpx"
            :src="DownIcon"
            mode="aspectFit"
          />
        </view>
        <view class="mb-37rpx mt-53rpx flex items-center justify-center">
          <image
            class="h-133rpx w-517rpx"
            :src="FlyTitleIcon"
            mode="scaleToFill"
          />
        </view>
        <view class="pl-60rpx">
          <image
            class="h-60rpx w-40rpx"
            :src="BlueConnect"
            mode="scaleToFill"
          />
          <span class="ml-20rpx text-24rpx">未连接</span>
        </view>
        <view class="mt-60rpx pl-60rpx">
          <image
            class="h-60rpx w-40rpx"
            :src="BatteryIcon"
            mode="scaleToFill"
          />
          <span class="ml-20rpx text-24rpx"><span class="font-bold">100</span>%</span>
        </view>
        <view class="relative mt-60rpx w-52rpx pl-60rpx">
          <image
            class="h-60rpx w-52rpx"
            :src="WarningIcon"
            mode="scaleToFill"
          />
          <span class="count">2</span>
        </view>
      </view>

      <view class="relative z-10 mb-19rpx ml-20rpx mt-[-75rpx] box-border w-710rpx rounded-[10rpx] bg-white px-80rpx py-33rpx">
        <view
          class="slider relative z-11 h-136rpx w-550rpx rounded-[136rpx]"
          :style="{ background: isUnlocked ? '#2CBC7B' : '#E6E6E6' }"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <image
            class="slider-bg absolute left-0 top-0 h-136rpx w-136rpx"
            :style="sliderStyle"
            :src="isUnlocked ? CloseBtnIcon : CloseBtnBrayIcon"
            mode="scaleToFill"
            @touchmove="onTouchMove"
          />
          <image
            v-if="isUnlocked"
            class="absolute left-73rpx top-36rpx h-64rpx w-101rpx"
            :style="{ transform: isUnlocked ? 'rotate(0deg)' : 'rotate(180deg)' }"
            :src="ArrowIcon"
            mode="scaleToFill"
          />
          <image
            v-else
            class="absolute left-216rpx top-36rpx h-64rpx w-101rpx"
            :style="{ transform: isUnlocked ? 'rotate(0deg)' : 'rotate(180deg)' }"
            :src="ArrowIcon"
            mode="scaleToFill"
          />
          <view
            class="absolute top-52rpx text-31rpx"
            :style="{ left: isUnlocked ? '213rpx' : '353rpx', color: isUnlocked ? '#ffffff' : '' }"
          >
            {{ isUnlocked ? '滑动锁车' : '滑动开启' }}
          </view>
        </view>
      </view>
      <!-- bottom -->
      <view class="flex items-center justify-between px-20rpx">
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
</template>

<style lang="scss" scoped>
.Home {
  height: 100vh;
  background: #E4EBF2;
  .top-card {
    width: 100%;
    height: 980rpx;
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
</style>
