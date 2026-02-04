<script setup lang="ts">
import { useCarStore } from '@/store'
import { httpGet } from '@/utils/http'
import { getImageUrl } from '@/utils/image'

defineOptions({
  name: 'Find',
})

const props = defineProps({
  tabName: {
    type: String,
  },
})

const BgIcon = getImageUrl('/find/bg.png')
const DescIcon = getImageUrl('/find/desc.png')
const FlyLogoIcon = getImageUrl('/find/fly-logo.png')
const FlyIcon = getImageUrl('/find/fly.png')
const HelloTextIcon = getImageUrl('/find/helloText.png')
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
      class="h-1522rpx w-750rpx"
      :src="BgIcon"
    />
    <view class="absolute left-28rpx top-0rpx" :style="{ paddingTop: `${navHeight}px` }">
      <image
        class="h-31rpx w-240rpx"
        :src="FlyLogoIcon"
        mode="scaleToFill"
      />
      <image
        class="ml-51rpx h-95rpx w-56rpx"
        :src="FlyIcon"
        mode="scaleToFill"
      />
    </view>
    <image
      class="absolute left-275rpx top-360rpx h-343rpx w-206rpx"
      :src="HelloTextIcon"
      mode="scaleToFill"
    />
    <image
      class="absolute left-212rpx top-745rpx w-323rpx"
      :src="DescIcon"
      mode="widthFix"
    />
    <view class="absolute left-212rpx top-789rpx text-[#2E6BC6]">
      <span class="text-180rpx">{{ days }}</span>
      <span class="text-40rpx">天</span>
      <image
        class="absolute bottom-26rpx left-[-105rpx] w-91rpx"
        :src="LineIcon"
        mode="widthFix"
      />
      <image
        class="absolute right-[-62rpx] top-26rpx w-91rpx"
        :src="LineIcon"
        mode="widthFix"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.find {
  box-sizing: border-box;
  background: #E4EBF2;
  position: relative;
}
</style>
