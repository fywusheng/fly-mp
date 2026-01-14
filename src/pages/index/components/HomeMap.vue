<script lang="ts" setup>
import { getImageUrl } from '@/utils/image'

const props = defineProps<{
  ridingTrack: Array<{ latitude: number, longitude: number }>
  location: { latitude: number, longitude: number }
}>()
const emit = defineEmits<{
  (e: 'mapClick'): void
}>()

const MapWait = getImageUrl('/home/map-wait.png')
const MapArrow = getImageUrl('/home/map-arrow.png')

// 缓存地图上下文
let mapCtx: any = null
// 使用ref定义响应式数据
const scale = ref(17)
const location = ref({
  latitude: 39.9087,
  longitude: 116.3975,
})
const markers = ref([{
  id: 1,
  latitude: 40.040129,
  longitude: 116.274968,
  width: 44,
  height: 44,
  iconPath: MapArrow,
  anchor: {
    x: 0.5,
    y: 0.5,
  },
}])

// 使用ref定义响应式数据
const polyline = ref([
  {
    points: [
      // { latitude: 40.040129, longitude: 116.274968 },
      // { latitude: 40.038974, longitude: 116.275214 },
      // { latitude: 40.038974, longitude: 116.275214 },
      // { latitude: 40.038565000000006, longitude: 116.272683 },
      // { latitude: 40.03848200000001, longitude: 116.27209500000001 },
      // { latitude: 40.03836100000001, longitude: 116.27074 },
      // { latitude: 40.03832700000001, longitude: 116.270515 },
      // { latitude: 40.03807400000001, longitude: 116.268038 },
      // { latitude: 40.03801400000001, longitude: 116.26763600000001 },
      // { latitude: 40.03801400000001, longitude: 116.26763600000001 },
      // { latitude: 40.03790800000001, longitude: 116.267508 },
      // { latitude: 40.03450300000001, longitude: 116.270961 },
      // { latitude: 40.03419900000001, longitude: 116.271221 },
      // { latitude: 40.03396500000001, longitude: 116.271401 },
      // { latitude: 40.03245000000001, longitude: 116.272472 },
    ],
    color: '#239AF6',
    width: 6,
  },
])

onMounted(() => {
  const instance = getCurrentInstance() // 获取组件实
  mapCtx = uni.createMapContext('homeMap', instance)
})

watch(() => props.ridingTrack, (newTrack) => {
  // 不要骑行轨迹
  polyline.value[0].points = []

  if (newTrack && newTrack.length > 0) {
    const reversedTrack = [...newTrack].reverse()
    // 取第一个点作为当前位置
    const lastPoint = reversedTrack[0]
    location.value = lastPoint
    markers.value[0] = {
      ...markers.value[0],
      latitude: lastPoint.latitude,
      longitude: lastPoint.longitude,
    }
    setTimeout(() => {
      mapCtx.moveToLocation(lastPoint)
    }, 1000)
  }
  else {
    // 默认位置：天安门
    const defaultLocation = {
      latitude: 39.9087,
      longitude: 116.3975,
    }
    location.value = defaultLocation
    markers.value[0] = {
      ...markers.value[0],
      latitude: defaultLocation.latitude,
      longitude: defaultLocation.longitude,
    }
    setTimeout(() => {
      mapCtx.moveToLocation(location.value)
    }, 1000)
  }
}, { immediate: true })

function clickMap() {
  emit('mapClick')
}
</script>

<template>
  <view class="mt-17rpx h-240rpx w-660rpx">
    <map
      id="homeMap"
      class="map"
      :latitude="location.latitude"
      :longitude="location.longitude"
      :markers="markers"
      :polyline="polyline"
      :scale="scale"
      @tap="clickMap"
    />
  </view>
</template>

<style lang="scss" scoped>
.map {
  width: 100%;
  height: 100%;
}
</style>
