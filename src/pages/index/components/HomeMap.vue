<script lang="ts" setup>
import MapArrow from '@/static/home/map-arrow.png'
// 使用ref定义响应式数据
const scale = ref(16.5)
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
  // iconPath: MapArrow ,
  iconPath: 'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/car.png',
  anchor: {
    x: 0.5,
    y: 0.5,
  },
}])

// 使用ref定义响应式数据
const polyline = ref([
  {
    points: [{ latitude: 40.040129, longitude: 116.274968 }, { latitude: 40.038974, longitude: 116.275214 }, { latitude: 40.038974, longitude: 116.275214 }, { latitude: 40.038565000000006, longitude: 116.272683 }, { latitude: 40.03848200000001, longitude: 116.27209500000001 }, { latitude: 40.03836100000001, longitude: 116.27074 }, { latitude: 40.03832700000001, longitude: 116.270515 }, { latitude: 40.03807400000001, longitude: 116.268038 }, { latitude: 40.03801400000001, longitude: 116.26763600000001 }, { latitude: 40.03801400000001, longitude: 116.26763600000001 }, { latitude: 40.03790800000001, longitude: 116.267508 }, { latitude: 40.03450300000001, longitude: 116.270961 }, { latitude: 40.03419900000001, longitude: 116.271221 }, { latitude: 40.03396500000001, longitude: 116.271401 }, { latitude: 40.03245000000001, longitude: 116.272472 }],
    color: '#239AF6',
    width: 6,
  },
])

onMounted(() => {
  const instance = getCurrentInstance() // 获取组件实
  const mapCtx = uni.createMapContext('map', instance)
  // 缩放视野展示所有点
  mapCtx.includePoints({
    points: polyline.value[0].points,
    padding: [10, 10, 10, 10],
  })
  mapCtx.moveAlong({
    markerId: 1,
    path: polyline.value[0].points,
    duration: 10000,
    autoRotate: true,

    success: (res) => {
      console.log(res)
    },
  })
})
</script>

<template>
  <view class="mt-17rpx h-140rpx w-660rpx">
    <map
      id="map"
      class="map"
      :latitude="location.latitude"
      :longitude="location.longitude"
      :markers="markers"
      :polyline="polyline"
      :scale="scale"
    />
  </view>
</template>

<style lang="scss" scoped>
.map {
  width: 100%;
  height: 100%;
}
</style>
