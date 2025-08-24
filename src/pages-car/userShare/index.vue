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
import UserShare from '@/static/mine/user-share.png'
import UserUse from '@/static/mine/user-use.png'

const tabs = ref(['分享', '使用'])
const tab = ref('分享')
</script>

<template>
  <view class="page-content">
    <view class="text-center text-40rpx">
      分享和使用
    </view>
    <wd-tabs v-model="tab" custom-class="custom-tabs" color="#EB3C59">
      <block v-for="item in tabs" :key="item">
        <wd-tab :title="`${item}`" :name="item">
          <!-- <view class="content">
            内容{{ item }}
          </view> -->
          <image
            :src="item === '分享' ? UserShare : UserUse"
            mode="widthFix"
          />
        </wd-tab>
      </block>
    </wd-tabs>
  </view>
</template>

<style lang="scss" scoped>
.page-content {
  min-height: 100vh;
  background: #ffffff;
  padding-top: 66rpx;
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
