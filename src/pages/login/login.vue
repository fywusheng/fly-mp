<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '登录',
  },
}
</route>

<script lang="ts" setup>
import CursorIcon from '@/static/login/cursor.png'
import LogoIcon from '@/static/login/logo.png'
import ParticleIcon from '@/static/login/particle.png'

defineOptions({
  name: 'Login',
})
const loading = ref(false)

function onGetPhoneNumber(e: any) {
  loading.value = true
  if (e.detail.errMsg === 'getPhoneNumber:ok') {
    // 处理获取到的手机号
    console.log('手机号:', e.detail)
  }
  else {
    // 用户拒绝授权
    console.error('用户拒绝授权')
  }
  loading.value = false
}
</script>

<template>
  <view class="login">
    <image
      class="mt-375rpx w-384rpx"
      :src="LogoIcon"
      mode="widthFix"
    />
    <view class="mb-24rpx mt-131rpx text-24rpx text-white">
      请登录后使用
    </view>
    <wd-button :loading="loading" open-type="getPhoneNumber" custom-class="custom-btn" size="large" @getphonenumber="onGetPhoneNumber">
      登 录
    </wd-button>
    <image
      class="absolute bottom-37rpx right-0 w-750rpx"
      :src="ParticleIcon"
      mode="widthFix"
    />
    <image
      class="absolute bottom-665rpx right-21rpx w-87rpx"
      :src="CursorIcon"
      mode="widthFix"
    />
    <image
      class="absolute bottom-541rpx left-274rpx w-153rpx"
      :src="CursorIcon"
      mode="widthFix"
    />
    <image
      class="absolute bottom-195rpx left-106rpx w-250rpx"
      :src="CursorIcon"
      mode="widthFix"
    />
  </view>
</template>

<style lang="scss" scoped>
.login {
  position: relative;
  width: 750rpx;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(0deg, #6EA9FF 0%, #2755F7 100%);
  :deep() {
    .custom-btn {
      width: 620rpx;
      height: 100rpx;
      background: rgba(75,127,251,0.8);
      border-radius: 50rpx;
      border: 2rpx solid #FFFFFF;
    }
  }
}
</style>
