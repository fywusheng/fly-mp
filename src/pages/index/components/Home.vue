<script setup lang="ts">
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
const list = ref([{
  name: '一键静音',
  icon: 'https://img12.360buyimg.com/babel/jfs/t20270715/38278/23/22574/7960/6694edb4F07db03e3/d663cd498321eadc.png',
}, {
  name: '车辆解防',
  icon: 'https://img12.360buyimg.com/babel/jfs/t20270715/38278/23/22574/7960/6694edb4F07db03e3/d663cd498321eadc.png',
}, {
  name: '电子围栏',
  icon: 'https://img12.360buyimg.com/babel/jfs/t20270715/38278/23/22574/7960/6694edb4F07db03e3/d663cd498321eadc.png',
}, {
  name: '感应启动',
  icon: 'https://img12.360buyimg.com/babel/jfs/t20270715/38278/23/22574/7960/6694edb4F07db03e3/d663cd498321eadc.png',
}])

onMounted(() => {
  uni.createSelectorQuery()
    .in(getCurrentInstance().proxy)
    .select('.slider')
    .boundingClientRect((res: UniApp.NodeInfo) => {
      maxRight.value = res.width - 70 // 70为滑块的宽度
    })
    .exec()
})

function onTouchStart(event) {
  startX.value = event.touches[0].pageX - sliderX.value
}
function onTouchMove(event) {
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
          class="slider relative z-11 mb-63rpx h-136rpx w-550rpx rounded-[136rpx]"
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
        <fg-scroll-x
          track-width="164rpx"
          track-height="10rpx"
          track-color="#EEEEEE"
          bar-color="#10AE66"
          bar-width="86rpx"
          :indicator="list.length > 4"
        >
          <view class="grid">
            <view v-for="item in list" :key="item.name" class="item">
              <image mode="widthFix" class="item-img" :src="item.icon" />
              <text class="item-text">
                {{ item.name }}
              </text>
            </view>
          </view>
        </fg-scroll-x>
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
.grid {
  display: flex;
  flex-wrap: nowrap;
  position: relative;
  overflow: visible;
  flex-direction: row;
  padding-bottom: 39rpx;
}
.item {
  width: 104rpx;
  height: 120rpx;
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
    width: 72rpx;
  }
  &-text {
    // padding: 5rpx;
    font-size: 26rpx;
    white-space: nowrap;
  }
}
</style>
