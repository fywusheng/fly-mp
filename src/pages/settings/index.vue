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
import { useCarStore, useUserStore } from '@/store'

const token = ref('')

const userStore = useUserStore()
const carStore = useCarStore()

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
    carStore.resetCarInfo()
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
// token登录
function loginToken() {
  // 设置token
  uni.setStorageSync('token', token.value)
  // 获取用户信息
  userStore.getUserInfo().then(() => {
    uni.showToast({
      title: '登录成功',
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
      <view class="my-30rpx">
        <wd-input v-model="token" placeholder="请输入内容" />
      </view>

      <wd-button block size="large" @click="loginToken">
        token登录
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
