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
import { getColorImg } from '@/utils'
import { httpGet } from '@/utils/http'

const GreenCar = 'http://115.190.57.206/static/mine/car-green.png'
const RedCar = 'http://115.190.57.206/static/mine/car-red.png'
const White = 'http://115.190.57.206/static/mine/car-white.png'
const EditIcon = 'http://115.190.57.206/static/mine/edit.png'
const carList = ref([]) // 车辆列表

onShow(() => {
  getCarList()
})

// 获取车辆列表
function getCarList() {
  httpGet('/device/vehicle/user/complete').then((res) => {
    carList.value = (res.data as any).resultList || []
  }).catch((err) => {
    console.error('获取车辆列表失败:', err)
    uni.showToast({
      title: '获取车辆列表失败',
      icon: 'none',
    })
  })
}

// 编辑车辆
function onEditClick(item) {
  uni.navigateTo({
    url: '/pages-car/editCar/index',
    success: (res) => {
      res.eventChannel.emit('editCar', item)
    },
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
      <view v-for="item in carList" :key="item.id" class="relative mb-20rpx box-border h-260rpx w-711rpx rounded-[10rpx] py-30rpx pl-240rpx">
        <view class="relative z-100 mb-20rpx flex items-center text-24rpx text-[#333333]">
          <view class="w-96rpx">
            我的车辆
          </view>
          <view class="ml-28rpx">
            {{ item.vehicleName }}
          </view>
        </view>
        <view class="relative z-100 mb-20rpx flex items-center text-24rpx text-[#333333]">
          <view class="w-96rpx">
            品牌
          </view>
          <view class="ml-28rpx">
            {{ item.brand }}
          </view>
        </view>
        <view class="relative z-100 mb-20rpx flex items-center text-24rpx text-[#333333]">
          <view class="w-96rpx">
            颜色
          </view>
          <view class="ml-28rpx">
            {{ item.color }}
          </view>
        </view>
        <view class="relative z-100 flex items-center text-24rpx text-[#333333]">
          <view class="w-96rpx">
            设备编号
          </view>
          <view class="ml-28rpx">
            {{ item.deviceNo }}
          </view>
        </view>
        <image
          class="absolute left-0 top-0 z-10 h-100% w-100%"
          :src="getColorImg(item.colorCode, 'carList')"
          mode="scaleToFill"
        />
        <!-- ownerType  1 车主 2成员 -->
        <image
          v-if="item.ownerType === 1"
          class="absolute right-32rpx top-31rpx z-100 h-50rpx w-51rpx"
          :src="EditIcon"
          mode="scaleToFill"
          @click="onEditClick(item)"
        />
        <view class="line-height-22rrpx absolute bottom-46rpx right-32rpx z-100 text-right text-14rpx text-[#6E6E6E]">
          <view>添加时间</view>
          <view>{{ item.createTimeStr }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.bind-car {
  background-color: #DDE3EC;
  min-height: 100vh;
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
