<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '行驶数据',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
import { httpGet } from '@/utils/http'

const MapArrow = 'http://115.190.57.206/static/network/location.png'
const state = ref('finished') // loading/finished/error
const time = ref<number[]>([]) // 日期

const chartData = ref()
const opts = ref({
  color: ['#2CBC7B'],
  legend: { show: false },
})

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

onReady(() => {
  getServerData()
})

function getServerData() {
  // 模拟从服务器获取数据时的延时
  setTimeout(() => {
    let res = {
      categories: ['2016', '2017', '2018', '2019', '2020', '2021'],
      series: [
        {
          name: '目标值',
          data: [35, 36, 31, 33, 13, 34],
          itemStyle: {
            color: '#333333',
          },
        },
        // {
        //   name: '完成量',
        //   data: [18, 27, 21, 24, 6, 28],
        // },
      ],
    }
    chartData.value = JSON.parse(JSON.stringify(res))
  }, 500)
}
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
function goAllDrive() {
  uni.navigateTo({
    url: '/pages-network/ride-trace/index',
  })
}
</script>

<template>
  <view class="track-detail">
    <view class="card">
      <view class="card-item p-29rpx">
        <view class="text-24rpx text-[#333333]">
          我的总里程
        </view>
        <view class="mb-48rpx flex items-center justify-between">
          <view calss="text-30rpx font-bold" style="font-family: Microsoft YaHei;">
            0.00 KM
          </view>
          <view class="look-btn" @click="goAllDrive">
            全部行程
          </view>
        </view>
        <view class="flex items-center justify-between text-24rpx text-[#333333]">
          <view>
            <view>累计出行</view>
            <view class="flex items-center">
              <view class="text-36rpx font-bold">
                0
              </view>
              <view>次</view>
            </view>
          </view>
          <view>
            <view>陪伴时间</view>
            <view class="flex items-center">
              <view class="text-36rpx font-bold">
                0
              </view>
              <view>天</view>
            </view>
          </view>
          <view>
            <view>减少碳排量</view>
            <view class="flex items-center">
              <view class="text-36rpx font-bold">
                0
              </view>
              <view>g</view>
            </view>
          </view>
        </view>
      </view>
      <view class="card-item p-29rpx">
        <view class="text-24rpx text-[#333333]">
          骑行里程统计
        </view>
        <view class="flex items-center justify-between px-178rpx py-37rpx">
          <view class="normal">
            日
          </view>
          <view class="normal active">
            周
          </view>
          <view class="normal">
            月
          </view>
        </view>
        <view>
          <qiun-data-charts type="column" :chart-data="chartData" :opts="opts" :canvas2d="true" />
        </view>
      </view>
      <view class="card-item p-29rpx">
        <view class="mb-48rpx text-24rpx text-[#333333]">
          今日骑行数据
        </view>

        <view class="flex items-center justify-between text-24rpx text-[#333333]">
          <view>
            <view>骑行里程</view>
            <view class="flex items-center">
              <view class="text-36rpx font-bold">
                0
              </view>
              <view>km</view>
            </view>
          </view>
          <view>
            <view>总耗时</view>
            <view class="flex items-center">
              <view class="text-36rpx font-bold">
                0
              </view>
              <view>h</view>
            </view>
          </view>
          <view>
            <view>减少碳排量</view>
            <view class="flex items-center">
              <view class="text-36rpx font-bold">
                0
              </view>
              <view>g</view>
            </view>
          </view>
        </view>
      </view>
    </view>
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
    .normal {
      width: 50rpx;
      height: 50rpx;
      border: 1rpx solid #6E6E6E;
      color: #333333;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 24rpx;
      &.active {
        color: #2CBC7B;
        border: 1rpx solid #2CBC7B;
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
