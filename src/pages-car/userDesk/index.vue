<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '飞鸽电动车',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
import { getImageUrl } from '@/utils/image'

const UserDesk = getImageUrl('/mine/user-desk.png')
// import UserUse from getImageUrl('/mine/user-use.png')
</script>

<template>
  <view class="page-content">
    <!-- <view class="text-center text-40rpx">
      感应启动设置
    </view> -->
    <image
      :src="UserDesk"
      mode="widthFix"
    />
  </view>
</template>

<style lang="scss" scoped>
.page-content {
  min-height: 100vh;
  background: #ffffff;
  // padding-top: 66rpx;
  box-sizing: border-box;
  :deep() {
    .custom-tabs {
      .wd-tabs__line {
        background: #EB3C59;
      }
      .wd-tabs__nav-item-text {
        font-size: 35rpx;
      }
    }
  }
}
</style>
