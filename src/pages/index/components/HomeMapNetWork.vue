<script lang="ts" setup>
import { getImageUrl } from '@/utils/image'

const props = defineProps<{
  info: { latitude: number, longitude: number, ridingStatus: string }
}>()
const emit = defineEmits<{
  (e: 'mapClick'): void
}>()
const MapWait = getImageUrl('/home/map-wait.png')
const MapArrow = getImageUrl('/home/map-arrow.png')

const ArrowRed = getImageUrl('/network/arrow-red.png')
const ArrowGray = getImageUrl('/network/arrow-gray.png')
const ArrayGreen = getImageUrl('/network/arrow-green.png')

// 缓存地图上下文
let mapCtx: any = null
// 使用ref定义响应式数据
const scale = ref(16)
// 地图中心位置和标记 默认北京天安门坐标
const location = ref({
  latitude: 39.9087,
  longitude: 116.3975,
})
const markers = ref([{
  id: 1,
  latitude: 40.040129,
  longitude: 116.274968,
  width: Number.parseInt((45 / 1.5).toString()),
  height: Number.parseInt((45 / 1.5).toString()),
  iconPath: MapWait,
  anchor: {
    x: 0.5,
    y: 0.5,
  },
}])

// 使用ref定义响应式数据
const polyline = ref([
  {
    points: [],
    color: '#239AF6',
    width: 6,
  },
])

onMounted(() => {
  const instance = getCurrentInstance() // 获取组件实
  mapCtx = uni.createMapContext('networkMap', instance)
})

// 监听info变化，更新地图位置和轨迹
watch(() => props.info, (newInfo) => {
  if (newInfo && newInfo.latitude && newInfo.longitude) {
    location.value.latitude = newInfo.latitude
    location.value.longitude = newInfo.longitude
    // 更新标记位置
    markers.value[0].latitude = newInfo.latitude
    markers.value[0].longitude = newInfo.longitude
    markers.value[0].iconPath = newInfo.ridingStatus === '已泊车' ? ArrowRed : newInfo.ridingStatus === '行驶中' ? ArrayGreen : ArrowGray
    // 更新地图中心位置
    if (mapCtx) {
      mapCtx.moveToLocation()
    }
  }
}, { immediate: true })

function clickMap() {
  emit('mapClick')
}
</script>

<template>
  <view class="mt-17rpx h-240rpx w-660rpx">
    <map
      id="networkMap"
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
