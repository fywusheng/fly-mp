<script lang="ts" setup>
import { getImageUrl } from '@/utils/image'

const props = defineProps<{
  ridingTrack: Array<{ latitude: number, longitude: number }>
  status: string
  location: { latitude: number, longitude: number }
  isUnactivated?: boolean // 是否未开通状态
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

const showMap = ref(false)

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
    iconPath: props.status === '已泊车' ? ArrowRed : props.status === '行驶中' ? ArrayGreen : ArrowGray,
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
      // mapCtx.moveToLocation(target)
      showMap.value = true
    }, 300)
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
  <view class="relative mt-17rpx h-240rpx w-660rpx">
    <!-- 地图 -->
    <map
      v-if="showMap"
      id="homeMap"
      class="map"
      :latitude="location.latitude"
      :longitude="location.longitude"
      :markers="markers"
      :scale="scale"
      @tap="clickMap"
    />

    <!-- 未开通蒙层 -->
    <view v-if="isUnactivated" class="unactivated-overlay" @tap="clickMap">
      <view class="unactivated-content">
        <text class="unactivated-text">
          未开通
        </text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.map {
  width: 100%;
  height: 100%;
}

.unactivated-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  z-index: 10;
}

.unactivated-content {
  padding: 20rpx 40rpx;
  border-radius: 8rpx;
}

.unactivated-text {
  font-size: 34rpx;
  font-weight: bold;
  color: #666666;
  white-space: nowrap;
}
</style>
