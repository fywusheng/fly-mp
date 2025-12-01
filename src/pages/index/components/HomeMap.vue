<script lang="ts" setup>
const props = defineProps<{
  ridingTrack: Array<{ latitude: number, longitude: number }>
  location: { latitude: number, longitude: number }
}>()
const emit = defineEmits<{
  (e: 'mapClick'): void
}>()
const MapWait = 'http://115.190.57.206/static/home/map-wait.png'
const MapArrow = 'http://115.190.57.206/static/home/map-arrow.png'

// 缓存地图上下文
let mapCtx: any = null
// 使用ref定义响应式数据
const scale = ref(17)
const location = ref({
  latitude: 40.0370140,
  longitude: 116.271214,
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
      { latitude: 40.040129, longitude: 116.274968 },
      { latitude: 40.038974, longitude: 116.275214 },
      { latitude: 40.038974, longitude: 116.275214 },
      { latitude: 40.038565000000006, longitude: 116.272683 },
      { latitude: 40.03848200000001, longitude: 116.27209500000001 },
      { latitude: 40.03836100000001, longitude: 116.27074 },
      { latitude: 40.03832700000001, longitude: 116.270515 },
      { latitude: 40.03807400000001, longitude: 116.268038 },
      { latitude: 40.03801400000001, longitude: 116.26763600000001 },
      { latitude: 40.03801400000001, longitude: 116.26763600000001 },
      { latitude: 40.03790800000001, longitude: 116.267508 },
      { latitude: 40.03450300000001, longitude: 116.270961 },
      { latitude: 40.03419900000001, longitude: 116.271221 },
      { latitude: 40.03396500000001, longitude: 116.271401 },
      { latitude: 40.03245000000001, longitude: 116.272472 },
    ],
    color: '#239AF6',
    width: 6,
  },
])

onMounted(() => {
  const instance = getCurrentInstance() // 获取组件实
  mapCtx = uni.createMapContext('map', instance)
})

watch(() => props.ridingTrack, (newTrack) => {
  if (newTrack && newTrack.length > 0) {
    const reversedTrack = [...newTrack].reverse()
    polyline.value[0].points = reversedTrack
    // 取第一个点作为当前位置
    const lastPoint = reversedTrack[0]
    location.value = {
      latitude: lastPoint.latitude,
      longitude: lastPoint.longitude,
    }
    markers.value[0] = {
      ...markers.value[0],
      latitude: lastPoint.latitude,
      longitude: lastPoint.longitude,
    }
    // 更新地图视野
    mapCtx.includePoints({
      points: reversedTrack,
      padding: [10, 25, 10, 25],
    })
    mapCtx.moveAlong({
      markerId: 1,
      path: reversedTrack,
      duration: 100,
      autoRotate: true,
      success: (res) => {
        console.log('moveAlong success:', res)
      },
      fail: (err) => {
        console.error('moveAlong failed:', err)
      },
    })
  }
  else {
    // 初始化地图位置为用户当前位置
    location.value = props.location
    markers.value[0] = {
      ...markers.value[0],
      latitude: props.location.latitude,
      longitude: props.location.longitude,
    }
    setTimeout(() => {
      mapCtx.moveToLocation()
    }, 1000)
  }
}, { immediate: true })

function clickMap() {
  console.log('点击了地图')
  // 可以在这里触发父组件的方法或事件
  emit('mapClick')
}
</script>

<template>
  <view class="mt-17rpx h-240rpx w-660rpx">
    <map
      id="map"
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
