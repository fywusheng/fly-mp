<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '车辆位置',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
import { httpGet } from '@/utils/http'
import { getImageUrl } from '@/utils/image'

const ReloadIcon = getImageUrl('/home/reload.png')

// const EndPointIcon = getImageUrl('/common/end-point.png')
// 不同状态车辆图标
const ArrowRed = getImageUrl('/network/arrow-red.png')
const ArrowGray = getImageUrl('/network/arrow-gray.png')
const ArrayGreen = getImageUrl('/network/arrow-green.png')
// const StartPointIcon = getImageUrl('/common/start-point.png')

// 使用ref定义响应式数据
const scale = ref(18)
const location = ref({
  latitude: 39.9087,
  longitude: 116.3975,
})
// 地图点
const markers = ref([
  {
    id: 2,
    latitude: 40.03245000000001,
    longitude: 116.272472,
    width: 45,
    height: 45,
    iconPath: ArrowRed,
    anchor: {
      x: 0.5,
      y: 0.5,
    },
  },
])
// 骑行轨迹
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
  // const instance = getCurrentInstance() // 获取组件实
  // const mapCtx = uni.createMapContext('map', instance)
  // // 缩放视野展示所有点
  // mapCtx.includePoints({
  //   points: polyline.value[0].points,
  //   padding: [20, 20, 360, 20],
  // })
})

// onMounted(() => {
// const instance = getCurrentInstance() // 获取组件实
// const mapCtx = uni.createMapContext('map', instance)
// // 缩放视野展示所有点
// mapCtx.includePoints({
//   points: polyline.value[0].points,
//   padding: [20, 20, 360, 20],
// })
// })
// 获取骑行数据
async function getTrackInfo(rideId: string) {
  try {
    uni.showLoading({
      title: '加载中...',
      mask: true,
    })
    const res = await httpGet(`/device/v2/rides/${rideId}/track`)
    uni.hideLoading()
    if (res.code === '200') {
      ridingInfo.value = res.data
      console.log('轨迹详情:', res.data)
      const trackPoints = (res.data as any).trackPoints
      setMapData(trackPoints, ridingInfo.value.ridingStatus)
    }
    else {
      console.error('获取轨迹信息失败', res.message)
    }
  }
  catch (error) {
    console.error('获取轨迹信息失败', error)
    uni.hideLoading()
  }
}

function setMapData(trackPoints: Array<{ latitude: number, longitude: number }>, ridingStatus: string) {
  if (trackPoints.length === 0)
    return
  // if (ridingStatus !== '行驶中') {
  const endPoint = trackPoints[0]
  markers.value[0] = {
    ...markers.value[0],
    iconPath: ridingStatus === '已泊车' ? ArrowRed : ridingStatus === '行驶中' ? ArrayGreen : ArrowGray,
    latitude: endPoint.latitude,
    longitude: endPoint.longitude,
  }
  // 清空轨迹
  polyline.value[0].points = []
  // 取第一个点作为当前位置
  location.value = {
    latitude: endPoint.latitude,
    longitude: endPoint.longitude,
  }
  const instance = getCurrentInstance() // 获取组件实
  const mapCtx = uni.createMapContext('map', instance)
  // 移动到中心点
  mapCtx.moveToLocation({
    latitude: endPoint.latitude,
    longitude: endPoint.longitude,
  })
  // }
  // else {
  // // 有轨迹
  // const startPoint = trackPoints[trackPoints.length - 1]
  // const endPoint = trackPoints[0]
  // // 处理成功的轨迹数据
  // polyline.value[0].points = trackPoints
  // // 设置终点标记
  // markers.value[0] = {
  //   ...markers.value[0],
  //   iconPath: ArrayGreen,
  //   latitude: endPoint.latitude,
  //   longitude: endPoint.longitude,
  // }
  // // 取第一个点作为当前位置
  // location.value = {
  //   latitude: startPoint.latitude,
  //   longitude: startPoint.longitude,
  // }
  // const instance = getCurrentInstance() // 获取组件实
  // const mapCtx = uni.createMapContext('map', instance)
  // // 缩放视野展示所有点
  // mapCtx.includePoints({
  //   points: polyline.value[0].points,
  //   padding: [20, 20, 360, 20],
  // })
  // }
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
    <!-- <view class="absolute bottom-120rpx left-0 z-100">
      <view class="ml-20rpx mt-20rpx box-border w-710rpx rounded-8rpx bg-[#ffffff] px-42rpx py-30rpx">
        <view class="flex items-center text-25rpx text-[#666666]">
          <view class="mr-60rpx">
            当前位置
          </view>
          <image
            class="mr-24rpx h-22rpx w-22rpx"
            :src="ReloadIcon"
            mode="scaleToFill"
            @click="getTrackInfo(ridingInfo.rideId)"
          />
          <view @click="getTrackInfo(ridingInfo.rideId)">
            刷新
          </view>
        </view>
        <view class="my-31rpx text-30rpx text-[#040404]">
          {{ ridingInfo.endLocation }}
        </view>
        <view class="mb-20rpx h-2rpx w-100% bg-[#E6E6E6]" />
        <view class="w-100% flex justify-between text-30rpx text-[#040404]">
          <view>
            {{ ridingInfo.ridingStatus }}
          </view>
          <view class="color-[#666666]">
            上次骑行人：{{ ridingInfo.ridingName }}
          </view>
        </view>
      </view>
    </view> -->
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
