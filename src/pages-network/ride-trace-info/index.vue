<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '查看轨迹',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
import { httpGet } from '@/utils/http'

const EndPointIcon = 'http://115.190.57.206/static/common/end-point.png'
const StartPointIcon = 'http://115.190.57.206/static/common/start-point.png'

// 使用ref定义响应式数据
const scale = ref(18)
const location = ref({
  latitude: 40.0370140,
  longitude: 116.271214,
})
const markers = ref([
  {
    id: 1,
    latitude: 40.040129,
    longitude: 116.274968,
    width: 30,
    height: 45,
    iconPath: StartPointIcon,
    anchor: {
      x: 0.5,
      y: 0.5,
    },
  },
  {
    id: 2,
    latitude: 40.03245000000001,
    longitude: 116.272472,
    width: 30,
    height: 45,
    iconPath: EndPointIcon,
    anchor: {
      x: 0.5,
      y: 0.5,
    },
  },
])
const polyline = ref([
  {
    points: [{ latitude: 40.040129, longitude: 116.274968 }, { latitude: 40.038974, longitude: 116.275214 }, { latitude: 40.038974, longitude: 116.275214 }, { latitude: 40.038565000000006, longitude: 116.272683 }, { latitude: 40.03848200000001, longitude: 116.27209500000001 }, { latitude: 40.03836100000001, longitude: 116.27074 }, { latitude: 40.03832700000001, longitude: 116.270515 }, { latitude: 40.03807400000001, longitude: 116.268038 }, { latitude: 40.03801400000001, longitude: 116.26763600000001 }, { latitude: 40.03801400000001, longitude: 116.26763600000001 }, { latitude: 40.03790800000001, longitude: 116.267508 }, { latitude: 40.03450300000001, longitude: 116.270961 }, { latitude: 40.03419900000001, longitude: 116.271221 }, { latitude: 40.03396500000001, longitude: 116.271401 }, { latitude: 40.03245000000001, longitude: 116.272472 }],
    color: '#239AF6',
    width: 6,
  },
])

// 骑行信息
const ridingInfo = ref<any>({})

onLoad((e) => {
  getTrackInfo(e.rideId)
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

function setMapData(trackPoints: Array<{ latitude: number, longitude: number }>) {
  if (trackPoints.length === 0) {
    polyline.value[0].points = []
    markers.value[0] = {
      ...markers.value[0],
      width: 0,
      height: 0,
    }
    markers.value[1] = {
      ...markers.value[1],
      width: 0,
      height: 0,
    }
    return
  }

  const startPoint = trackPoints[trackPoints.length - 1]
  const endPoint = trackPoints[0]
  // 处理成功的轨迹数据
  polyline.value[0].points = trackPoints
  markers.value[0] = {
    ...markers.value[0],
    latitude: startPoint.latitude,
    longitude: startPoint.longitude,
  }
  markers.value[1] = {
    ...markers.value[1],
    latitude: endPoint.latitude,
    longitude: endPoint.longitude,
  }
  // 取第一个点作为当前位置
  location.value = {
    latitude: startPoint.latitude,
    longitude: startPoint.longitude,
  }
  const instance = getCurrentInstance() // 获取组件实
  const mapCtx = uni.createMapContext('map', instance)
  // 缩放视野展示所有点
  mapCtx.includePoints({
    points: polyline.value[0].points,
    padding: [20, 20, 360, 20],
  })
}
// 格式化骑行时长（毫秒转 HH:mm:ss）
function formatDuration(milliseconds: number) {
  if (!milliseconds)
    return '00:00:00'
  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
</script>

<template>
  <view class="track-detail">
    <map
      id="map"
      class="map"
      :latitude="location.latitude"
      :longitude="location.longitude"
      :markers="markers"
      :polyline="polyline"
      :scale="scale"
    />
    <view class="absolute bottom-120rpx left-0 z-100 w-100% flex items-center justify-center">
      <view class="card">
        <view class="card-item flex flex-col items-center justify-between">
          <view class="card-item-top box-border h-80rpx w-100% flex items-center justify-between px-29rpx">
            <view class="text-24rpx text-[#333333]">
              {{ ridingInfo.rideDate }}  {{ ridingInfo.startTime }}-{{ ridingInfo.endTime }}
            </view>
          </view>
          <view class="card-item-middle box-border flex flex-col px-29rpx py-40rpx">
            <view class="flex items-center">
              <view class="mr-20rpx h-20rpx w-20rpx rounded-10rpx bg-[#DB6477]" />
              <view>{{ ridingInfo.startLocation }}</view>
            </view>
            <view class="flex items-center">
              <view class="mr-20rpx h-20rpx w-20rpx rounded-10rpx bg-[#2CBC7B]" />
              <view>{{ ridingInfo.endLocation }}</view>
            </view>
          </view>
          <view class="box-border w-100% flex items-center justify-between px-29rpx py-25rpx">
            <view class="flex flex-col items-center justify-center text-24rpx text-[#333333]">
              <view>{{ ridingInfo.distanceKm }}m</view>
              <view>本次里程</view>
            </view>
            <view class="flex flex-col items-center justify-center text-24rpx text-[#333333]">
              <view>{{ ridingInfo.avgSpeed }}km/h</view>
              <view>平均速度</view>
            </view>
            <view class="flex flex-col items-center justify-center text-24rpx text-[#333333]">
              <view>{{ formatDuration(ridingInfo.ridingTimeMinutes || 0) }}</view>
              <view>骑行时间</view>
            </view>
            <view class="flex flex-col items-center justify-center text-24rpx text-[#333333]">
              <view>{{ ridingInfo.carbonReduction }}g</view>
              <view>减少碳排放</view>
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
  .map {
    width: 100%;
    height: 100%;
  }
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
        width: 100%;
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
}
</style>
