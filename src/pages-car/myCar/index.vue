<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '我的车辆',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
import GreenCar from '@/static/mine/car-green.png'
import RedCar from '@/static/mine/car-red.png'
import White from '@/static/mine/car-white.png'
import EditIcon from '@/static/mine/edit.png'

function onEditClick() {
  // Handle edit click
  uni.navigateTo({
    url: '/pages-car/editCar/index',
  })
}
</script>

<template>
  <view class="bind-car">
    <view class="mt-20rpx box-border h-80rpx w-711rpx flex items-center rounded-[10rpx] bg-white pl-29rpx text-24rpx">
      我的车辆
    </view>
    <view class="mt-24rpx w-711rpx text-24rpx text-[#6E6E6E]">
      *分享的车辆无法编辑车辆信息
    </view>
    <view class="mt-53rpx">
      <view class="relative box-border h-260rpx w-711rpx rounded-[10rpx] py-30rpx pl-240rpx">
        <view class="relative z-100 mb-20rpx flex items-center text-24rpx text-[#333333]">
          <view class="w-96rpx">
            我的车辆
          </view>
          <view class="ml-28rpx">
            12312312
          </view>
        </view>
        <view class="relative z-100 mb-20rpx flex items-center text-24rpx text-[#333333]">
          <view class="w-96rpx">
            品牌
          </view>
          <view class="ml-28rpx">
            12312312
          </view>
        </view>
        <view class="relative z-100 mb-20rpx flex items-center text-24rpx text-[#333333]">
          <view class="w-96rpx">
            颜色
          </view>
          <view class="ml-28rpx">
            12312312
          </view>
        </view>
        <view class="relative z-100 flex items-center text-24rpx text-[#333333]">
          <view class="w-96rpx">
            设备编号
          </view>
          <view class="ml-28rpx">
            12312312
          </view>
        </view>
        <image
          class="absolute left-0 top-0 z-10 h-100% w-100%"
          :src="GreenCar"
          mode="scaleToFill"
        />
        <image
          class="absolute right-32rpx top-31rpx z-100 h-50rpx w-51rpx"
          :src="EditIcon"
          mode="scaleToFill"
          @click="onEditClick"
        />
        <view class="line-height-22rrpx absolute bottom-46rpx right-32rpx z-100 text-right text-14rpx text-[#6E6E6E]">
          <view>添加时间</view>
          <view>2022-01-01</view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.bind-car {
  background-color: #DDE3EC;
  height: 100vh;
  display: flex;
  flex-direction: column;
  // justify-content: center;
  align-items: center;
  // padding: 16px;
  // border-radius: 8px;
  :deep() {
    .wd-input__inner {
      text-align: right;
    }
    .wd-input__label-inner {
      font-size: 24rpx;
    }
  }
}
</style>
