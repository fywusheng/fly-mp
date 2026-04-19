<script setup lang="ts">
import { useCarStore } from '@/store'
import { httpGet } from '@/utils/http'
import { getImageUrl } from '@/utils/image'
import HomeAdBanner from '../com-components/HomeAdBanner.vue'

defineOptions({
  name: 'Find',
})

const props = defineProps({
  tabName: {
    type: String,
  },
})

// const BgIcon = getImageUrl('/find/bg.png')
const BgIcon = getImageUrl('/find/bg-v3.png')
const DescIcon = getImageUrl('/find/desc.png')
const FlyLogoIcon = getImageUrl('/find/fly-logo.png')
const FlyIcon = getImageUrl('/find/fly.png')
// const HelloTextIcon = getImageUrl('/find/helloText.png')
const HelloTextIcon = getImageUrl('/find/text-v3.png')
const LineIcon = getImageUrl('/find/line.png')

// 获取胶囊位置信息
const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
const navHeight = ref(0)
navHeight.value = menuButtonInfo?.top + menuButtonInfo.height

const carStore = useCarStore()
const days = ref(1)

watch(() => props.tabName, (newVal) => {
  if (newVal === 'find') {
    // 获取骑行天数
    getDayOffset(carStore.carInfo.deviceNo)
  }
})

// 获取骑行天数
async function getDayOffset(deviceId) {
  const res = await httpGet(`/device/v2/devices/${deviceId}/status`)
  if (res.code === '200') {
    days.value = (res.data as any).companionshipDays || 0
  }
  else {
    console.error('获取骑行天数失败', res.message)
  }
}
</script>

<template>
  <view class="find">
    <image
      class="h-1083rpx w-750rpx"
      :src="BgIcon"
    />

    <image
      class="absolute left-260rpx top-300rpx h-121rpx w-217rpx"
      :src="HelloTextIcon"
      mode="scaleToFill"
    />

    <view class="absolute left-0rpx top-389rpx w-100% flex items-center justify-center text-[#2E6BC6]">
      <view class="relative">
        <span class="text-200rpx">{{ days }}</span>
        <span class="text-40rpx">天</span>
        <image
          class="absolute bottom-72rpx left-[-86rpx] w-56rpx"
          :src="LineIcon"
          mode="widthFix"
        />
        <image
          class="absolute right-[-66rpx] top-72rpx w-56rpx"
          :src="LineIcon"
          mode="widthFix"
        />
      </view>
    </view>

    <!-- 广告位 -->
    <HomeAdBanner
      layout="vertical"
      item-width="690rpx"
      item-height="230rpx"
      :columns="1"
      :list="[
        { imageUrl: 'https://static.feigeinfo.com/static/home/top-bg.png', link: 'https://www.baidu.com' },
        { imageUrl: 'https://static.feigeinfo.com/static/home/top-bg.png', link: 'https://www.baidu.com' },
        { imageUrl: 'https://static.feigeinfo.com/static/home/top-bg.png', link: 'https://www.baidu.com' },
      ]"
    />
  </view>
</template>

<style lang="scss" scoped>
.find {
  box-sizing: border-box;
  background: #E4EBF2;
  position: relative;
  padding-bottom: 20rpx;
}
</style>
