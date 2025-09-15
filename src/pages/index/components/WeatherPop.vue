<script lang="ts" setup>
import { ref, watch } from 'vue'
import { getPopWeatherIcon, getWeatherIcon } from '@/utils/common'

// 定义 props
const props = defineProps<{
  modelValue: boolean
  weatherInfo: {
    wea: string
    tem: number | string
    tem1: number | string
    tem2: number | string
    hours?: Array<{ hours: string, wea: string }>
    simpleWeather?: Array<{ hours: string, wea: string }>
  }
}>()

// 定义 emit
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const TopIcon = 'http://121.89.87.166/static/home/top-bg.png'
const SunIcon = 'http://121.89.87.166/static/home/sun.png'

// 内部状态，与父组件的 v-model 同步
const show = ref(props.modelValue)

// 监听 props 变化，同步内部状态
watch(() => props.modelValue, (newVal) => {
  show.value = newVal
})

// 监听内部状态变化，同步到父组件
watch(show, (newVal) => {
  if (newVal !== props.modelValue) {
    emit('update:modelValue', newVal)
  }
})

function handleClose() {
  show.value = false
}
</script>

<template>
  <wd-popup v-model="show" :z-index="1000" position="bottom" closable custom-style="border-radius:32rpx;" @close="handleClose">
    <view class="box-border h-700rpx w-100% px-32rpx py-50rpx" :style="`background: url(${getPopWeatherIcon(weatherInfo.wea)}) no-repeat center; background-size: 100% 100%;`">
      <view class="mb-95rpx flex items-center color-[#333333]">
        <image
          class="h-90rpx w-94rpx"
          :src="getWeatherIcon(weatherInfo.wea)"
          mode="aspectFit"
        />
        <view class="flex items-center justify-center">
          <view class="ml-16rpx text-100rpx">
            {{ weatherInfo.tem }}°
          </view>
          <view class="ml-12rpx text-42rpx">
            <view>{{ weatherInfo.wea }}</view>
            <view>
              {{ weatherInfo.tem1 }}°/{{ weatherInfo.tem2 }}°
            </view>
          </view>
        </view>
      </view>

      <scroll-view scroll-x :show-scrollbar="false" enhanced class="h-350rpx flex items-center justify-between overflow-x-auto">
        <view class="flex items-center justify-between">
          <view v-for="item in weatherInfo.hours" :key="item.hours" class="mr-40rpx flex flex-col flex-nowrap items-center justify-center text-25rpx">
            <view>{{ item.hours }}</view>
            <image
              class="my-62rpx h-40rpx w-40rpx"
              :src="getWeatherIcon(item.wea)"
              mode="scaleToFill"
            />
            <view>{{ item.wea }}</view>
          </view>
        </view>
      </scroll-view>
    </view>
  </wd-popup>
</template>

<style lang="scss" scoped>
//
</style>
