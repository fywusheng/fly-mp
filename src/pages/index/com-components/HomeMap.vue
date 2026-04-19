<script lang="ts" setup>
import { useUserStore } from '@/store/user'
import { getImageUrl } from '@/utils/image'

const props = defineProps<{
  network: boolean // 是否是4g设备
  info: any // 位置信息
  isUnactivated?: boolean // 是否未开通状态
}>()

const emit = defineEmits<{
  (e: 'mapClick', data: { latitude: number, longitude: number, status: string }): void
}>()

const userStore = useUserStore()

const ArrowRed = getImageUrl('/network/arrow-red.png')
const ArrowGray = getImageUrl('/network/arrow-gray.png')
const ArrayGreen = getImageUrl('/network/arrow-green.png')
const status = ref<string>()

// 缓存地图上下文
let mapCtx: any = null
// 使用ref定义响应式数据
const scale = ref(16)
const location = ref({
  latitude: 39.9087,
  longitude: 116.3975,
})
const markers = ref([])
// const markers = ref([{
//   id: 1,
//   latitude: 39.9087,
//   longitude: 116.3975,
//   width: 44,
//   height: 44,
//   iconPath: ArrowGray,
//   anchor: {
//     x: 0.5,
//     y: 0.5,
//   },
// }])

// 默认位置：天安门
const DEFAULT_LOCATION = {
  latitude: 39.9087,
  longitude: 116.3975,
}

const showMap = ref(false)

onMounted(() => {
  const instance = getCurrentInstance()
  mapCtx = uni.createMapContext('homeMap', instance)
  updateMap()
})

const hasLocation = computed(() => {
  if (props.network) {
    return !!props.info.latitude && !!props.info.longitude
  }
  else {
    return !!props.info.ridingTrack && props.info.ridingTrack.length > 0
  }
})

watch(() => [props.network, props.info], () => {
  updateMap()
}, { deep: true })

function updateMap() {
  if (!userStore.isLoggedIn || !hasLocation.value) {
    location.value = DEFAULT_LOCATION
    markers.value = []
    setTimeout(() => {
      showMap.value = true
    }, 300)
    return false
  }

  let targetLocation = DEFAULT_LOCATION
  let ridingStatus = ''

  if (props.network) {
    targetLocation = {
      latitude: props.info.latitude || DEFAULT_LOCATION.latitude,
      longitude: props.info.longitude || DEFAULT_LOCATION.longitude,
    }
    ridingStatus = props.info.ridingStatus
  }
  else {
    // 蓝牙设备数据结构
    const track = props.info.ridingTrack || []
    if (track.length > 0) {
      targetLocation = track[track.length - 1]
    }
    else {
      targetLocation = {
        latitude: DEFAULT_LOCATION.latitude,
        longitude: DEFAULT_LOCATION.longitude,
      }
    }
    ridingStatus = props.info.ridingStatus
  }

  status.value = ridingStatus
  location.value = targetLocation
  markers.value[0] = {
    id: 1,
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    iconPath: ridingStatus === '已泊车' ? ArrowRed : ridingStatus === '行驶中' ? ArrayGreen : ArrowGray,
    width: 44,
    height: 44,
    latitude: targetLocation.latitude,
    longitude: targetLocation.longitude,
  }

  if (targetLocation.latitude !== DEFAULT_LOCATION.latitude) {
    setTimeout(() => {
      showMap.value = true
    }, 300)
  }
  else {
    showMap.value = true
  }
}

function clickMap() {
  emit('mapClick', { latitude: location.value.latitude, longitude: location.value.longitude, status: status.value })
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
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  z-index: 10;
}

.unactivated-content {
  color: #333333;
  padding: 20rpx 40rpx;
  border-radius: 8rpx;
}

.unactivated-text {
  font-size: 40rpx;
  color: #333333;
  font-weight: bold;
  white-space: nowrap;
}
</style>
