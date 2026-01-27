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
import { getImageUrl } from '@/utils/image'

const EndPointIcon = getImageUrl('/common/end-point.png')
const StartPointIcon = getImageUrl('/common/start-point.png')

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
    points: [],
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
  // debugger
  // trackPoints = [{ latitude: 40.05697536892361, longitude: 116.38366997612847, speed: -1, accuracy: 35.97819372792883, timestamp: 1767760355880 }, { latitude: 40.05702202690972, longitude: 116.38338297526042, speed: 0, accuracy: 29.253983172617463, timestamp: 1767760361204 }, { latitude: 40.057032335069444, longitude: 116.38348605685763, speed: 1.002493143081665, accuracy: 13.822842828365104, timestamp: 1767760366238 }, { latitude: 40.05699490017361, longitude: 116.38358208550348, speed: 1.4382207393645874, accuracy: 4.748572499404545, timestamp: 1767760372087 }, { latitude: 40.05691541883681, longitude: 116.38361409505208, speed: 0.9562866687774548, accuracy: 8.144428695666184, timestamp: 1767760378086 }, { latitude: 40.05680067274306, longitude: 116.38366482204862, speed: 1.3204933404922201, accuracy: 14.245954590575515, timestamp: 1767760384083 }, { latitude: 40.05677083333333, longitude: 116.38373345269098, speed: 1.3814973831176434, accuracy: 14.245954590575545, timestamp: 1767760389098 }, { latitude: 40.056797417534725, longitude: 116.38384033203126, speed: 1.4233189604101166, accuracy: 14.245954533167872, timestamp: 1767760395097 }, { latitude: 40.05682318793403, longitude: 116.38394232855903, speed: 1.6240945501004327, accuracy: 14.245954518935346, timestamp: 1767760401100 }, { latitude: 40.05684651692708, longitude: 116.38404649522569, speed: 1.6749094301496825, accuracy: 14.245954479634086, timestamp: 1767760407098 }, { latitude: 40.056843804253475, longitude: 116.3841517469618, speed: 1.6420470373394265, accuracy: 14.245954516262046, timestamp: 1767760413096 }, { latitude: 40.056835394965276, longitude: 116.38423828125, speed: 1.6627754683517917, accuracy: 14.245954552076928, timestamp: 1767760418103 }, { latitude: 40.056827256944445, longitude: 116.38433973524306, speed: 1.631426574383126, accuracy: 14.245954448415413, timestamp: 1767760424100 }, { latitude: 40.05682996961806, longitude: 116.38443901909723, speed: 1.6240707571396262, accuracy: 14.245954459861903, timestamp: 1767760430094 }, { latitude: 40.056834581163194, longitude: 116.38452392578125, speed: 1.6448830646006454, accuracy: 14.245954546947225, timestamp: 1767760435096 }, { latitude: 40.056844075520836, longitude: 116.38462646484375, speed: 1.6524166769529218, accuracy: 14.245954461487251, timestamp: 1767760441097 }, { latitude: 40.056864691840275, longitude: 116.38472222222222, speed: 1.6117800964672857, accuracy: 14.245954444988051, timestamp: 1767760447095 }, { latitude: 40.056873101128474, longitude: 116.3848046875, speed: 1.5954784829149053, accuracy: 14.245954478811445, timestamp: 1767760452098 }, { latitude: 40.056910264756944, longitude: 116.38488444010417, speed: 1.589737471676275, accuracy: 14.245954449417749, timestamp: 1767760458094 }, { latitude: 40.05694091796875, longitude: 116.38495144314236, speed: 1.5986828476480799, accuracy: 14.245954333899064, timestamp: 1767760463098 }, { latitude: 40.05701334635417, longitude: 116.38497477213542, speed: 1.5758609490223794, accuracy: 14.245954449879939, timestamp: 1767760469095 }, { latitude: 40.05706651475695, longitude: 116.38495822482639, speed: 1.525147315456742, accuracy: 14.245954480411873, timestamp: 1767760474097 }, { latitude: 40.057117784288195, longitude: 116.38494222005208, speed: 1.5056055719276764, accuracy: 14.245954568044974, timestamp: 1767760479098 }, { latitude: 40.05715955946181, longitude: 116.38493842230903, speed: 0.918896851798413, accuracy: 14.24595450405371, timestamp: 1767760484098 }, { latitude: 40.057210557725696, longitude: 116.38492730034723, speed: 1.0139327872904345, accuracy: 14.245954526352099, timestamp: 1767760490095 }, { latitude: 40.057231987847224, longitude: 116.38492458767361, speed: 0.35714006850674607, accuracy: 14.245954576809254, timestamp: 1767760495098 }, { latitude: 40.057217068142364, longitude: 116.38493299696181, speed: 0.04079431351800186, accuracy: 14.245954588313998, timestamp: 1767760500101 }, { latitude: 40.05721408420139, longitude: 116.38493679470486, speed: 0, accuracy: 14.24595459057527, timestamp: 1767760504028 }]
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
// 格式化骑行时长（分钟转 HH:mm:ss）
function formatDuration(minutes: number) {
  if (!minutes || minutes <= 0)
    return '00:00:00'
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  const secs = Math.floor((minutes * 60) % 60)
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
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
          <!-- <view class="card-item-middle box-border flex flex-col px-29rpx py-40rpx">
            <view class="flex items-center">
              <view class="mr-20rpx h-20rpx w-20rpx rounded-10rpx bg-[#DB6477]" />
              <view>{{ ridingInfo.startLocation }}</view>
            </view>
            <view class="flex items-center">
              <view class="mr-20rpx h-20rpx w-20rpx rounded-10rpx bg-[#2CBC7B]" />
              <view>{{ ridingInfo.endLocation }}</view>
            </view>
          </view> -->
          <view class="box-border w-100% flex items-center justify-between px-29rpx py-25rpx">
            <view class="flex flex-col items-center justify-center text-24rpx text-[#333333]">
              <view>{{ ridingInfo.distanceKm }}km</view>
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
