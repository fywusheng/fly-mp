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
import { httpGet } from '@/utils/http'
import { getImageUrl } from '@/utils/image'

const MapArrow = getImageUrl('/home/map-arrow.png')
const EndPointIcon = getImageUrl('/common/end-point.png')
const StartPointIcon = getImageUrl('/common/start-point.png')

// 使用ref定义响应式数据
const scale = ref(18)
const location = ref({
  latitude: 39.9087,
  longitude: 116.3975,
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
    points: [],
    color: '#239AF6',
    width: 6,
  },
])
const showMap = ref(false)
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
      polyline.value[0].points = []
      console.error('获取轨迹信息失败', res.message)
    }
  }
  catch (error) {
    console.error('获取轨迹信息失败', error)
  }
}

function setMapData(trackPoints: Array<{ latitude: number, longitude: number }>) {
  if (trackPoints.length === 0){
    showMap.value = true
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
  showMap.value = true
  setTimeout(() => {
    const instance = getCurrentInstance() // 获取组件实
    const mapCtx = uni.createMapContext('detailMap', instance)
    // 缩放视野展示所有点
    mapCtx.includePoints({
      points: polyline.value[0].points,
      padding: [20, 20, 360, 20],
    })
  }, 500)
 
}
</script>

<template>
  <view class="track-detail">
    <map
      v-if="showMap"
      id="detailMap"
      class="map"
      :latitude="location.latitude"
      :longitude="location.longitude"
      :markers="markers"
      :polyline="polyline"
      :scale="scale"
    />
    <!-- <view class="absolute bottom-120rpx left-0 z-100">
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
                  <span>{{ ridingInfo.startLocation }} </span>
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
                  <span>{{ ridingInfo.endLocation }} </span>
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
              {{ ridingInfo.ridingTimeMinutes }}
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
