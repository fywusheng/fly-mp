<script setup lang="ts">
import dayjs from 'dayjs'
import BgIcon from '@/static/infor/blue-bg.png'
import CarIcon from '@/static/infor/car-icon.png'
import DateIcon from '@/static/infor/date.png'
import LeftArrow from '@/static/infor/left-arrow.png'
import LocationIcon from '@/static/infor/location-icon.png'
import RightArrow from '@/static/infor/right-arrow.png'

defineOptions({
  name: 'InforBlue',
})
// 获取胶囊位置信息
const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
const date = ref<number>(Date.now())

// 处理日期选择确认
function handleConfirm(selectedDate: any) {
  date.value = selectedDate.value
  // // 这里可以添加处理日期选择后的逻辑
  // console.log('选中的日期:', formatDate(selectedDate.value))
}
function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}
// 获取前一天的时间戳
function getPreviousDayTimestamp(): void {
  date.value = dayjs(date.value).subtract(1, 'day').valueOf()
}
// 获取后一天的时间戳
function getNextDayTimestamp(): void {
  date.value = dayjs(date.value).add(1, 'day').valueOf()
}

function goDetail(): void {
  console.log('Navigating to track detail page')
  uni.navigateTo({
    url: '/pages-car/trackDetail/index',
  })
}
</script>

<template>
  <view class="infor">
    <!-- top背景 -->
    <image
      class="absolute left-0 top-0 h-671rpx w-750rpx"
      :src="BgIcon"
    />
    <!-- 行驶数据 -->
    <view class="relative flex justify-around" :style="{ paddingTop: `${menuButtonInfo?.top + menuButtonInfo.height + 10}px` }">
      <view class="relative h-136rpx w-128rpx flex items-center justify-end">
        <image
          class="h-136rpx w-128rpx"
          :src="CarIcon"
          mode="scaleToFill"
        />
        <view class="car-label">
          我今年15岁了
        </view>
      </view>
      <!-- <image
        class="h-136rpx w-128rpx"
        :src="CarIcon"
        mode="scaleToFill"
      /> -->

      <view class="flex flex-col items-center justify-center pt-41rpx">
        <view class="text-24rpx text-[#333333] font-bold">
          累计出行(次)
        </view>
        <view class="text-50rpx text-white font-bold">
          44
        </view>
      </view>
      <view class="flex flex-col items-center justify-center pt-41rpx">
        <view class="text-24rpx text-[#333333] font-bold">
          累计骑行(分钟)
        </view>
        <view class="text-50rpx text-white font-bold">
          44
        </view>
      </view>
      <view class="flex flex-col items-center justify-center pt-41rpx">
        <view class="text-24rpx text-[#333333] font-bold">
          陪伴时间(天)
        </view>
        <view class="text-50rpx text-white font-bold">
          44
        </view>
      </view>
    </view>

    <view class="relative mt-57rpx">
      <view class="mb-18rpx flex items-center">
        <image
          class="ml-50rpx h-30rpx w-25rpx"
          :src="LocationIcon"
          mode="scaleToFill"
        />
        <view class="ml-20rpx text-20rpx text-[#666666]">
          广东省广州市珠海区广东省 广州市珠海区
        </view>
      </view>
      <!-- 时间选择 -->
      <view class="relative ml-20rpx box-border w-710rpx flex flex-col items-center justify-between rounded-8rpx bg-white py-20rpx">
        <wd-calendar v-model="date" :z-index="100" @confirm="handleConfirm">
          <image
            class="mb-10rpx h-30rpx w-30rpx"
            :src="DateIcon"
            mode="scaleToFill"
          />
        </wd-calendar>

        <view class="flex items-center justify-center">
          <image
            class="h-20rpx w-12rpx"
            :src="LeftArrow"
            mode="scaleToFill"
            @click="getPreviousDayTimestamp"
          />
          <view class="mx-109rpx text-30rpx text-[#333333]">
            {{ formatDate(date) }}
          </view>
          <image
            class="h-20rpx w-12rpx"
            :src="RightArrow"
            mode="scaleToFill"
            @click="getNextDayTimestamp"
          />
        </view>
        <view class="mt-20rpx h-2rpx w-100% bg-[#E6E6E6]" />
        <view class="w-100% flex justify-around">
          <view class="w-235rpx flex flex-col items-center justify-center">
            <view class="mb-12rpx text-48rpx color-[#239AF6]">
              3
            </view>
            <view class="text-18rpx color-[#666666]">
              出行轨迹(段)
            </view>
            <view class="mt-10rpx h-2rpx w-68rpx bg-[#239AF6]" />
          </view>
          <view class="bg-[#E6E6E6]] mt-15rpx h-90rpx w-2rpx" />
          <view class="w-235rpx flex flex-col items-center justify-center">
            <view class="mb-12rpx text-48rpx color-[#2CBC7B]">
              3
            </view>
            <view class="text-18rpx color-[#666666]">
              总骑行时间(分钟)
            </view>
            <view class="mt-10rpx h-2rpx w-68rpx bg-[#2CBC7B]" />
          </view>
          <view class="bg-[#E6E6E6]] mt-15rpx h-90rpx w-2rpx" />
          <view class="w-235rpx flex flex-col items-center justify-center">
            <view class="mb-12rpx text-48rpx color-[#DB6477]">
              3
            </view>
            <view class="text-18rpx color-[#666666]">
              最高时速(km/h)
            </view>
            <view class="mt-10rpx h-2rpx w-68rpx bg-[#DB6477]" />
          </view>
        </view>
      </view>

      <view @click="goDetail">
        <wd-swipe-action>
          <view class="ml-20rpx mt-20rpx box-border w-710rpx rounded-8rpx bg-white py-30rpx" @click="goDetail">
            <wd-steps :active="3" vertical>
              <wd-step :icon-slot="true">
                <template #icon>
                  <view class="h-22px w-30px flex items-center justify-center">
                    <view class="h-20rpx w-20rpx rounded-10px bg-[#2CBC7B]" />
                  </view>
                </template>
                <template #title>
                  <view class="text-[#666666]">
                    <span v-if="true">广东省广州市珠海区广东省 广州市珠海区 </span>
                    <span>(</span>
                    <span class="text-[#239AF6]">7:08</span>
                    <span>)</span>
                    <text v-if="false" class="text-[#DB6477]">
                      未获取位置信息，请打开手机定位
                    </text>
                  </view>
                </template>
              </wd-step>
              <wd-step icon="clock">
                <template #icon>
                  <view class="h-22px w-30px flex items-center justify-center">
                    <view class="h-20rpx w-20rpx rounded-10px bg-[#DB6477]" />
                  </view>
                </template>
                <template #title>
                  <view class="text-[#333333]">
                    <span v-if="true">广东省广州市珠海区广东省 广州市珠海区 </span>
                    <span>(</span>
                    <span class="text-[#239AF6]">7:08</span>
                    <span>)</span>
                    <text v-if="false" class="text-[#DB6477]">
                      未获取位置信息，请打开手机定位
                    </text>
                  </view>
                </template>
              </wd-step>
            </wd-steps>
            <view class="h-2rpx w-100% bg-[#E6E6E6]" />
            <view class="mt-22rpx flex items-center justify-between px-29rpx text-20rpx color-[#666666]">
              <view>骑行时间：34分钟</view>
              <view>最高时速：34分钟</view>
              <view>骑行人：34分钟</view>
            </view>
          </view>
          <template #right>
            <view class="action">
              <view class="button" @click="handleAction('操作3')">
                删除
              </view>
            </view>
          </template>
        </wd-swipe-action>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.infor {
  height: calc(100vh - 88rpx);
  background: #F2F4F6;
  position: relative;
  // display: flex;
  // flex-direction: column;
  // align-items: center;
  .car-label {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    background: #AD8AA9;
    padding: 0rpx 8rpx;
    height: 36rpx;
    border-radius: 18rpx;
    font-size: 20rpx;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2rpx solid #DA6579;
  }
}
.action {
  height: 100%;
}
.button {
  display: inline-block;
  padding: 0 11px;
  height: 100%;
  color: white;
  background: #EB3D59;
  line-height: 42px;
  width: 200rpx;
  font-size: 30rpx;
  border-radius: 18rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
