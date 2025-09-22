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
import { useUserStore } from '@/store'

defineOptions({
  name: 'Login',
})
const userStore = useUserStore()
const loading = ref(false)
const CursorIcon = 'http://115.190.57.206/static/login/cursor.png'
const LogoIcon = 'http://115.190.57.206/static/login/logo.png'
const ParticleIcon = 'http://115.190.57.206/static/login/particle.png'

async function onGetPhoneNumber(e: any) {
  // 处理获取到的手机号

  loading.value = true
  if (e.errMsg === 'getPhoneNumber:ok') {
    // 登录
    const res = await userStore.wxLogin({ phoneCode: e.code })
    if (res.code === '200') {
      // 登录成功
      uni.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 500,
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 500)
    }
    else {
      // 登录失败
      uni.showToast({
        title: res.message || '登录失败',
        duration: 2000,
      })
    }
  }
  else {
    // 用户拒绝授权
    console.log('用户拒绝授权')
  }
  loading.value = false
}

function onCancel() {
  uni.navigateBack()
}
</script>

<template>
  <view class="login">
    <image
      class="mt-375rpx w-384rpx"
      :src="LogoIcon"
      mode="widthFix"
    />
    <view class="mb-24rpx mt-131rpx text-28rpx text-white">
      请登录后使用
    </view>
    <wd-button :loading="loading" open-type="getPhoneNumber" custom-class="custom-btn" size="large" @getphonenumber="onGetPhoneNumber">
      立即登录
    </wd-button>
    <view class="mt-24rpx text-28rpx text-white" @click="onCancel">
      取消
    </view>
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
      font-size: 48rpx;
    }
  }
}
</style>
