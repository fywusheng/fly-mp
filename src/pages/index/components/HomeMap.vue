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

// 默认位置：天安门
const DEFAULT_LOCATION = {
  latitude: 39.9087,
  longitude: 116.3975,
}

onMounted(() => {
  const instance = getCurrentInstance() // 获取组件实
  mapCtx = uni.createMapContext('homeMap', instance)
  // 初始化后手动触发一次更新
  updateMap(props.ridingTrack)
})

watch(() => props.ridingTrack, (newTrack) => {
  updateMap(newTrack)
}, { immediate: false })

function updateMap(newTrack: Array<{ latitude: number, longitude: number }>) {
  if (!newTrack || newTrack.length === 0) {
    // 默认位置
    location.value = DEFAULT_LOCATION
    markers.value[0] = {
      ...markers.value[0],
      width: 0,
      height: 0,
      latitude: 0,
      longitude: 0,
    }
    moveToLocation(DEFAULT_LOCATION)
    return
  }

  // 取最后一个点作为当前位置
  const lastPoint = newTrack[newTrack.length - 1]
  location.value = lastPoint
  markers.value[0] = {
    ...markers.value[0],
    width: 44,
    height: 44,
    latitude: lastPoint.latitude,
    longitude: lastPoint.longitude,
  }
  moveToLocation(lastPoint)
}

function moveToLocation(target: { latitude: number, longitude: number }) {
  if (mapCtx) {
    setTimeout(() => {
      mapCtx.moveToLocation(target)
    }, 500)
  }
  else {
    console.error('地图上下文未初始化')
  }
}

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
