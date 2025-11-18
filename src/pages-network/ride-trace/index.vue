<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '骑行轨迹',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
import { httpGet } from '@/utils/http'

const MapArrow = 'http://115.190.57.206/static/network/location.png'
const state = ref('finished') // loading/finished/error
const time = ref<number[]>([]) // 日期

onLoad((e) => {
  // getTrackInfo(e.rideId)
  // const instance = getCurrentInstance()?.proxy as { getOpenerEventChannel?: () => UniApp.EventChannel }
  // if (instance?.getOpenerEventChannel) {
  //   const eventChannel = instance.getOpenerEventChannel()
  //   eventChannel.on('rideData', (info: any) => {
  //     ridingInfo.value = info
  //     getTrackInfo(info.rideId)
  //   })
  // }
  // const instance = getCurrentInstance() // 获取组件实
  // const mapCtx = uni.createMapContext('map', instance)
  // // 缩放视野展示所有点
  // mapCtx.includePoints({
  //   points: polyline.value[0].points,
  //   padding: [20, 20, 360, 20],
  // })
})
onReachBottom(() => {
  console.log('到底部了')
})

// 获取骑行数据
async function getTrackInfo(rideId: string) {
  try {
    const res = await httpGet(`/riding/ride/track/detail/${rideId}`)
    if (res.code === '200') {
      ridingInfo.value = res.data
      console.log('轨迹详情:', res.data)
      const trackPoints = (res.data as any).trackPoints
      setMapData(trackPoints)
    }
    else {
      console.error('获取轨迹信息失败', res.message)
    }
  }
  catch (error) {
    console.error('获取轨迹信息失败', error)
  }
}
// 日期确定事件
function handleConfirm({ value }) {
  console.log(value)
  console.log(time)
}
function goHistoryInfo() {
  uni.navigateTo({
    url: '/pages-network/ride-trace-info/index',
  })
}
</script>

<template>
  <view class="track-detail">
    <view class="card">
      <view class="card-item flex flex-col items-center justify-between" @click="goHistoryInfo">
        <view class="card-item-top box-border h-80rpx w-100% flex items-center justify-between px-29rpx">
          <view class="text-24rpx text-[#333333]">
            2025/09/28  12:01:48-12:07:56
          </view>
          <view class="look-btn">
            查看轨迹
          </view>
        </view>
        <view class="card-item-middle box-border flex flex-col px-29rpx py-40rpx">
          <view class="flex items-center">
            <view class="mr-20rpx h-20rpx w-20rpx rounded-10rpx bg-[#DB6477]" />
            <view>广东省广州市珠海区广东省 广州市珠海区 拷贝 2</view>
          </view>
          <view class="flex items-center">
            <view class="mr-20rpx h-20rpx w-20rpx rounded-10rpx bg-[#2CBC7B]" />
            <view>广东省广州市珠海区广东省 广州市珠海区 拷贝 2</view>
          </view>
        </view>
        <view class="box-border w-100% flex items-center justify-between px-29rpx py-25rpx">
          <view class="flex flex-col items-center justify-center text-24rpx text-[#333333]">
            <view>204</view>
            <view>本次里程</view>
          </view>
          <view class="flex flex-col items-center justify-center text-24rpx text-[#333333]">
            <view>204km/h</view>
            <view>评价速度</view>
          </view>
          <view class="flex flex-col items-center justify-center text-24rpx text-[#333333]">
            <view>00:23:32</view>
            <view>骑行时间</view>
          </view>
          <view class="flex flex-col items-center justify-center text-24rpx text-[#333333]">
            <view>204g</view>
            <view>减少碳排放</view>
          </view>
        </view>
      </view>
    </view>
    <view class="card">
      <view class="card-item flex flex-col items-center justify-between" @click="goHistoryInfo">
        <view class="card-item-top box-border h-80rpx w-100% flex items-center justify-between px-29rpx">
          <view class="text-24rpx text-[#333333]">
            2025/09/28  12:01:48-12:07:56
          </view>
          <view class="look-btn">
            查看轨迹
          </view>
        </view>
        <view class="card-item-middle box-border flex flex-col px-29rpx py-40rpx">
          <view class="flex items-center">
            <view class="mr-20rpx h-20rpx w-20rpx rounded-10rpx bg-[#DB6477]" />
            <view>广东省广州市珠海区广东省 广州市珠海区 拷贝 2</view>
          </view>
          <view class="flex items-center">
            <view class="mr-20rpx h-20rpx w-20rpx rounded-10rpx bg-[#2CBC7B]" />
            <view>广东省广州市珠海区广东省 广州市珠海区 拷贝 2</view>
          </view>
        </view>
        <view class="box-border w-100% flex items-center justify-between px-29rpx py-25rpx">
          <view class="flex flex-col items-center justify-center text-24rpx text-[#333333]">
            <view>204</view>
            <view>本次里程</view>
          </view>
          <view class="flex flex-col items-center justify-center text-24rpx text-[#333333]">
            <view>204km/h</view>
            <view>评价速度</view>
          </view>
          <view class="flex flex-col items-center justify-center text-24rpx text-[#333333]">
            <view>00:23:32</view>
            <view>骑行时间</view>
          </view>
          <view class="flex flex-col items-center justify-center text-24rpx text-[#333333]">
            <view>204g</view>
            <view>减少碳排放</view>
          </view>
        </view>
      </view>
    </view>
    <wd-loadmore custom-class="loadmore" :state="state" />
    <wd-calendar v-model="time" type="daterange" @confirm="handleConfirm">
      <view class="sub-btn">
        <view>2025年4月1日-2025年4月2日</view>
        <view>点击查看更多</view>
      </view>
    </wd-calendar>
  </view>
</template>

<style lang="scss" scoped>
.track-detail {
  width: 100vw;
  min-height: 100vh;
  position: relative;
  background-color: #DDE3EC;
  padding-top: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  .card{
    width: 710rpx;
    background: #FFFFFF;
    border-radius: 20rpx;
    margin-bottom: 20rpx;
    .card-item {
      position: relative;

      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        display: block;
        width: 100%;
        height: 1rpx;
        background-color: #E6E6E6;
      }
      &:last-child{
        &::before  {
          height: 0;
        }
      }
      .card-item-top {
        position: relative;
        &::after{
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          display: block;
          width: 100%;
          height: 1rpx;
          background-color: #E6E6E6;
        }
      }
      .card-item-middle {
        position: relative;
         &::after{
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          display: block;
          width: 100%;
          height: 1rpx;
          background-color: #E6E6E6;
        }
      }
    }
  }
  .sub-btn {
    background-color: #239AF6;
    width: 710rpx;
    height: 80rpx;
    border-radius: 40rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #FFFFFF;
    font-size: 24rpx;
    margin-top: 98rpx;
  }
  .look-btn {
    width: 160rpx;
    height: 50rpx;
    border-radius: 25rpx;
    border: 2rpx solid #2CBC7B;
    color: #2CBC7B;
    display: flex;
    justify-content: center;
    align-items:center;
  }
}
</style>
