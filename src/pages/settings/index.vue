<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '设置',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
import { useUserStore } from '@/store'

const userStore = useUserStore()

// 退出登录
function loginOut() {
  userStore.logout().then((res) => {
    if (res.code !== '200') {
      uni.showToast({
        title: res.message || '退出登录失败',
        icon: 'none',
      })
      return
    }
    uni.showToast({
      title: '退出登录成功',
      icon: 'success',
      duration: 1000,
    })
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/index/index',
      })
    }, 1000)
  })
}
</script>

<template>
  <view class="settings">
    <view class="mt-20rpx overflow-hidden rounded-10px">
      <wd-cell title="版本信息" value="V1.08" />
    </view>
    <view class="mt-100rpx">
      <wd-button block size="large" @click="loginOut">
        退出登录
      </wd-button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
//
.settings {
  padding: 20rpx;
  background-color: #DDE3EC;
  min-height: 100vh;
}
</style>
