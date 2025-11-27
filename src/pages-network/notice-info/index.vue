<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '告警详情',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
const info = ref<any>({})
onLoad((e) => {
  info.value = JSON.parse(decodeURIComponent(e.info))
  console.log('info', info)
})
</script>

<template>
  <view class="track-detail">
    <view>{{ info.time }} {{ info.title }}</view>
    <view>{{ info.content }}</view>
  </view>
</template>

<style lang="scss" scoped>
.track-detail {
  width: 100vw;
  min-height: 100vh;
  background-color: #FFFFFF;
  font-size: 24rpx;
  color: #333333;
  padding: 20rpx 60rpx;
  box-sizing: border-box;
  line-height: 50rpx;
}
</style>
