<script setup lang="ts">
import { useUserStore } from '@/store'

defineOptions({
  name: 'MineBlue',
})

const userStore = useUserStore()

const AvatarIcon = 'http://121.89.87.166/static/mine/avatar.png'
const BindIcon = 'http://121.89.87.166/static/mine/bind.png'
const BlueAvatarIcon = 'http://121.89.87.166/static/mine/blue-avatar.png'
const CarSettingIcon = 'http://121.89.87.166/static/mine/car-setting.png'
const CustomerServiceIcon = 'http://121.89.87.166/static/mine/customer-service.png'
// import FamilyIcon from 'http://121.89.87.166/static/mine/family.png'
const MyCarIcon = 'http://121.89.87.166/static/mine/my-car.png'
const RightIcon = 'http://121.89.87.166/static/mine/right.png'
const SettingIcon = 'http://121.89.87.166/static/mine/setting.png'
const ShareIcon = 'http://121.89.87.166/static/mine/share.png'
const TopBgIcon = 'http://121.89.87.166/static/mine/top-bg.png'
const UserManualIcon = 'http://121.89.87.166/static/mine/user-manual.png'

// 功能列表
const list = ref([
  {
    name: '我的车辆',
    icon: MyCarIcon,
  },
  {
    name: '分享与解绑',
    icon: ShareIcon,
  },
  {
    name: '绑定设备',
    icon: BindIcon,
  },
  {
    name: '车辆设置',
    icon: CarSettingIcon,
  },
  {
    name: '使用手册',
    icon: UserManualIcon,
  },

])

function handleListItemClick(item) {
  if (!userStore.userInfo.token) {
    uni.navigateTo({
      url: '/pages/login/login',
    })
    return
  }
  switch (item.name) {
    case '我的车辆':
      uni.navigateTo({
        url: '/pages-car/myCar/index',
      })
      break
    case '分享与解绑':
      uni.navigateTo({
        url: '/pages-car/shareCar/index',
      })
      break
    case '绑定设备':
      uni.navigateTo({
        url: '/pages-car/bind/index',
      })
      break
    case '车辆设置':
      uni.navigateTo({
        url: '/pages-car/settings/index',
      })
      break
    case '使用手册':
      uni.navigateTo({
        url: '/pages-car/userManual/index',
      })
      break
  }
}

function goSettings() {
  uni.navigateTo({
    url: '/pages/settings/index',
  })
}
</script>

<template>
  <view class="mine">
    <!-- 设置图标 -->
    <wd-navbar custom-class="navbar" safe-area-inset-top fixed custom-style="background-color: transparent !important;">
      <template #left>
        <image
          class="h-40rpx w-40rpx"
          :src="SettingIcon"
          mode="scaleToFill"
          @click="goSettings"
        />
      </template>
    </wd-navbar>
    <!-- 头像和用户名 -->
    <image
      class="w-750rpx"
      :src="TopBgIcon"
      mode="widthFix"
    />
    <view class="absolute left-0 top-210rpx w-100% flex flex-col items-center justify-center">
      <image
        class="mb-18rpx h-173rpx w-173rpx"
        :src="BlueAvatarIcon"
        mode="scaleToFill"
      />
      <view class="whitespace-nowrap text-center text-36rpx text-white">
        {{ userStore.userInfo && userStore.userInfo.nickname ? userStore.userInfo.nickname : '--' }}
      </view>
    </view>
    <!-- 功能列表 -->
    <view class="relative mt-[-45rpx] px-20rpx">
      <view
        v-for="item in list"
        :key="item.name"
        class="mb-20rpx flex items-center justify-between rounded-8rpx bg-white px-40rpx py-45rpx"
        @click="handleListItemClick(item)"
      >
        <view class="flex items-center">
          <image
            class="mr-27rpx h-44rpx w-44rpx"
            :src="item.icon"
            mode="scaleToFill"
          />
          <view class="text-30rpx">
            {{ item.name }}
          </view>
        </view>
        <image
          class="h-17rpx w-14rpx"
          :src="RightIcon"
          mode="scaleToFill"
        />
      </view>
      <button
        class="custom-btn mb-20rpx flex items-center justify-between rounded-8rpx bg-white px-40rpx py-45rpx"
        open-type="contact"
        bindcontact="handleContact"
      >
        <view class="flex items-center">
          <image
            class="mr-27rpx h-44rpx w-44rpx"
            :src="CustomerServiceIcon"
            mode="scaleToFill"
          />
          <text class="text-30rpx text-[#333] line-height-1rpx">
            联系客服
          </text>
        </view>
        <image
          class="h-17rpx w-14rpx"
          :src="RightIcon"
          mode="scaleToFill"
        />
      </button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.mine {
  height: calc(100vh - 88rpx);
  background: #E4EBF2;
  position: relative;
  .custom-btn {
    border: none;
     &:active {
      background-color: #fff;
      color: #333;
    }
  }
}
</style>
