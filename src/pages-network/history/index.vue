<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '历史停留',
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
    url: '/pages-network/history-info/index',
  })
}
</script>

<template>
  <view class="track-detail">
    <view class="card">
      <view class="card-item box-border h-80rpx flex items-center justify-between px-29rpx" @click="goHistoryInfo">
        <view class="flex items-center">
          <image
            class="mr-29rpx h-30rpx w-25rpx"
            :src="MapArrow"
            mode="scaleToFill"
          />
          <view>重庆市渝北区金开大道西段106号两江......</view>
        </view>
        <view>
          <wd-icon name="arrow-right" size="20px" color="#C8C8C8" />
        </view>
      </view>
      <view class="card-item box-border h-80rpx flex items-center justify-between px-29rpx" @click="goHistoryInfo">
        <view class="flex items-center">
          <image
            class="mr-29rpx h-30rpx w-25rpx"
            :src="MapArrow"
            mode="scaleToFill"
          />
          <view>重庆市渝北区金开大道西段106号两江......</view>
        </view>
        <view>
          <wd-icon name="arrow-right" size="20px" color="#C8C8C8" />
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
  height: 100vh;
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
}
</style>
