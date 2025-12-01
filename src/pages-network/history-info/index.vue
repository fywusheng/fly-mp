<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '查看历史停留',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
import { httpGet } from '@/utils/http'

const MapArrow = 'http://115.190.57.206/static/network/location-red.png'

interface ParkingDetailDTO {
  parkingId: string
  vehicleId: string
  latitude: number
  longitude: number
  address: string
  startTime: string
  endTime: string
  duration: number
}

// 地图点和线
const scale = ref(16)
const location = ref({
  latitude: 40.0370140,
  longitude: 116.271214,
})
const markers = ref([
  {
    id: 2,
    latitude: 40.03245000000001,
    longitude: 116.272472,
    width: 120 / 3,
    height: 196 / 3,
    iconPath: MapArrow,
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
  // const instance = getCurrentInstance()?.proxy as { getOpenerEventChannel?: () => UniApp.EventChannel }
  // if (instance?.getOpenerEventChannel) {
  //   const eventChannel = instance.getOpenerEventChannel()
  //   eventChannel.on('rideData', (info: any) => {
  //     ridingInfo.value = info
  //     getTrackInfo(info.rideId)
  //   })
  // }
})

// 获取停留数据
async function getTrackInfo(rideId: string) {
  try {
    const res = await httpGet(`/riding/ride/parking/${rideId}`)
    if (res.code === '200') {
      ridingInfo.value = res.data as ParkingDetailDTO
      console.log('停留详情:', res.data)
      setMapData(ridingInfo.value)
    }
    else {
      console.error('获取停留信息失败', res.message)
    }
  }
  catch (error) {
    console.error('获取停留信息失败', error)
  }
}

function setMapData(trackPoints: ParkingDetailDTO) {
  // 处理成功的轨迹数据
  polyline.value[0].points = []
  markers.value[0] = {
    ...markers.value[0],
    latitude: trackPoints.latitude,
    longitude: trackPoints.longitude,
  }
  // 取第一个点作为当前位置
  location.value = {
    latitude: trackPoints.latitude,
    longitude: trackPoints.longitude,
  }
  const instance = getCurrentInstance() // 获取组件实
  const mapCtx = uni.createMapContext('map', instance)

  // 移动到中心点
  mapCtx.moveToLocation({
    latitude: trackPoints.latitude,
    longitude: trackPoints.longitude,
  })
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
    <view class="absolute bottom-120rpx left-0 z-100">
      <view class="ml-20rpx mt-20rpx box-border w-710rpx rounded-8rpx bg-[#ffffff] px-42rpx py-30rpx">
        <view class="flex items-center text-24rpx text-[#333333]">
          <view class="mr-60rpx">
            {{ ridingInfo.startTime }} - {{ ridingInfo.endTime ? ridingInfo.endTime.split(' ')[1] : '--:--:--' }}
          </view>
        </view>
        <view class="my-31rpx text-30rpx text-[#040404]">
          {{ ridingInfo.address || '未知地址' }}
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
}
</style>
