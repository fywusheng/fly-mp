<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '轨迹详情',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
import MapArrow from 'http://121.89.87.166/static/home/map-arrow.png'
import { httpGet } from '@/utils/http'

const EndPointIcon = 'http://121.89.87.166/static/common/end-point.png'
const StartPointIcon = 'http://121.89.87.166/static/common/start-point.png'

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
const mapImage = ref('')

onLoad((e) => {
  const instance = getCurrentInstance()?.proxy as { getOpenerEventChannel?: () => UniApp.EventChannel }
  if (instance?.getOpenerEventChannel) {
    const eventChannel = instance.getOpenerEventChannel()
    eventChannel.on('rideData', (info: any) => {
      ridingInfo.value = info
      getTrackInfo(info.rideId)
    })
  }
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
    const res = await httpGet(`/riding/ride/track/detail/${rideId}`)
    if (res.code === '200') {
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
  if (trackPoints.length === 0)
    return

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
</script>

<template>
  <view class="track-detail">
    <image
      v-if="false"
      class="absolute left-0 top-0 z-0 h-100% w-100%"
      :src="mapImage"
      mode="scaleToFill"
    />
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
      <view class="ml-20rpx mt-20rpx box-border w-710rpx rounded-8rpx bg-[#ffffff] py-30rpx">
        <wd-steps :active="3" vertical>
          <wd-step :icon-slot="true">
            <template #icon>
              <view class="h-22px w-30px flex items-center justify-center">
                <view class="h-20rpx w-20rpx rounded-10px bg-[#2CBC7B]" />
              </view>
            </template>
            <template #title>
              <view class="text-[#666666]">
                <template v-if="ridingInfo.startTime">
                  <span>{{ ridingInfo.start }} </span>
                  <span>(</span>
                  <span class="text-[#239AF6]">{{ ridingInfo.startTime }}</span>
                  <span>)</span>
                </template>

                <text v-else class="text-[#DB6477]">
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
                <template v-if="ridingInfo.endTime">
                  <span>{{ ridingInfo.end }} </span>
                  <span>(</span>
                  <span class="text-[#239AF6]">{{ ridingInfo.endTime }}</span>
                  <span>)</span>
                </template>

                <text v-else class="text-[#DB6477]">
                  未获取位置信息，请打开手机定位
                </text>
              </view>
            </template>
          </wd-step>
        </wd-steps>
        <view class="h-2rpx w-100% bg-[#E6E6E6]" />
        <view class="w-100% flex justify-around">
          <view class="w-235rpx flex flex-col items-center justify-center">
            <view class="mb-12rpx text-48rpx color-[#2CBC7B]">
              {{ ridingInfo.ridingTime }}
            </view>
            <view class="text-18rpx color-[#666666]">
              骑行时间(分钟)
            </view>
            <view class="mt-10rpx h-2rpx w-68rpx bg-[#2CBC7B]" />
          </view>
          <view class="bg-[#E6E6E6]] mt-15rpx h-90rpx w-2rpx" />
          <view class="w-235rpx flex flex-col items-center justify-center">
            <view class="mb-12rpx text-48rpx color-[#DB6477]">
              {{ ridingInfo.maxSpeed }}
            </view>
            <view class="text-18rpx color-[#666666]">
              最高时速(km/h)
            </view>
            <view class="mt-10rpx h-2rpx w-68rpx bg-[#DB6477]" />
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
}
</style>
