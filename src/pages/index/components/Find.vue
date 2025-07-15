<script setup lang="ts">
import BgIcon from '@/static/find/bg.png'
import DescIcon from '@/static/find/desc.png'
import FlyLogoIcon from '@/static/find/fly-logo.png'
import FlyIcon from '@/static/find/fly.png'
import HelloTextIcon from '@/static/find/helloText.png'
import LineIcon from '@/static/find/line.png'

defineOptions({
  name: 'Find',
})
// 获取胶囊位置信息
const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
const navHeight = ref(0)
navHeight.value = menuButtonInfo?.top + menuButtonInfo.height
</script>

<template>
  <div class="find">
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
      <span class="text-180rpx">123</span>
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
  </div>
</template>

<style lang="scss" scoped>
.find {
  box-sizing: border-box;
  background: #E4EBF2;
  position: relative;
}
</style>
