<script setup lang="ts">
import BgIcon from '@/static/infor/bg.png'
import DataIcon from '@/static/infor/data.png'
import HistoryIcon from '@/static/infor/history.png'
import RightIcon from '@/static/infor/right.png'
import RoundMileageIcon from '@/static/infor/round-mileage.png'
import RoundTimeIcon from '@/static/infor/round-time.png'
import TraceIcon from '@/static/infor/track.png'

defineOptions({
  name: 'InforBlue',
})
</script>

<template>
  <view class="infor">
    <!-- top背景 -->
    <image
      class="absolute left-0 top-0 h-671rpx w-750rpx"
      :src="BgIcon"
    />
    <!-- 骑行时间&&骑行里程 -->
    <view class="relative flex justify-between px-20rpx pt-671rpx">
      <view class="relative box-border h-160rpx w-345rpx rounded-8rpx bg-white px-30rpx py-49rpx">
        <view class="mb-20rpx text-20rpx text-[#888888]">
          今日骑行时间
        </view>
        <view class="text-26rpx text-[#333333] font-bold">
          00:00:00
        </view>
        <image
          class="absolute bottom-16rpx right-12rpx h-14rpx w-14rpx"
          :src="RoundTimeIcon"
        />
      </view>
      <view class="relative box-border h-160rpx w-345rpx rounded-8rpx bg-white px-30rpx py-49rpx">
        <view class="mb-20rpx text-20rpx text-[#888888]">
          今日骑行里程
        </view>
        <view class="mb-20rpx text-26rpx text-[#333333] font-bold">
          0.00 KM
        </view>
        <image
          class="absolute bottom-16rpx right-12rpx h-14rpx w-14rpx"
          :src="RoundMileageIcon"
        />
      </view>
    </view>
    <!-- bottom -->
    <view class="ml-20rpx mt-20rpx box-border h-160rpx w-710rpx flex items-center justify-between rounded-8rpx bg-white pl-20rpx pr-40rpx">
      <view class="flex items-center">
        <image
          class="h-80rpx w-80rpx"
          :src="TraceIcon"
          mode="scaleToFill"
        />
        <view class="ml-60rpx">
          <view class="mb-9rpx text-30rpx font-bold">
            骑行轨迹
          </view>
          <view class="text-20rpx text-[#6E6E6E]">
            一路美景 缤纷旅程
          </view>
        </view>
      </view>
      <image
        class="h-17rpx w-14rpx"
        :src="RightIcon"
        mode="scaleToFill"
      />
    </view>
    <view class="ml-20rpx mt-20rpx box-border h-160rpx w-710rpx flex items-center justify-between rounded-8rpx bg-white pl-20rpx pr-40rpx">
      <view class="flex items-center">
        <image
          class="h-80rpx w-80rpx"
          :src="HistoryIcon"
          mode="scaleToFill"
        />
        <view class="ml-60rpx">
          <view class="mb-9rpx text-30rpx font-bold">
            历史停留
          </view>
          <view class="text-20rpx text-[#6E6E6E]">
            查看驻足历史
          </view>
        </view>
      </view>
      <image
        class="h-17rpx w-14rpx"
        :src="RightIcon"
        mode="scaleToFill"
      />
    </view>
    <view class="ml-20rpx mt-20rpx box-border h-160rpx w-710rpx flex items-center justify-between rounded-8rpx bg-white pl-20rpx pr-40rpx">
      <view class="flex items-center">
        <image
          class="h-80rpx w-80rpx"
          :src="DataIcon"
          mode="scaleToFill"
        />
        <view class="ml-60rpx">
          <view class="mb-9rpx text-30rpx font-bold">
            行驶数据
          </view>
          <view class="text-20rpx text-[#6E6E6E]">
            您的骑行数据
          </view>
        </view>
      </view>
      <image
        class="h-17rpx w-14rpx"
        :src="RightIcon"
        mode="scaleToFill"
      />
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
}
</style>
