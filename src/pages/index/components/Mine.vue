<script setup lang="ts">
defineOptions({
  name: 'Mine',
})
const AvatarIcon = 'http://115.190.57.206/static/mine/avatar.png'
const BindIcon = 'http://115.190.57.206/static/mine/bind.png'
const CarSettingIcon = 'http://115.190.57.206/static/mine/car-setting.png'
const CustomerServiceIcon = 'http://115.190.57.206/static/mine/customer-service.png'
const FamilyIcon = 'http://115.190.57.206/static/mine/family.png'
const MyCarIcon = 'http://115.190.57.206/static/mine/my-car.png'
const RightIcon = 'http://115.190.57.206/static/mine/right.png'
const SettingIcon = 'http://115.190.57.206/static/mine/setting.png'
const TopBgIcon = 'http://115.190.57.206/static/mine/top-bg.png'
const UserManualIcon = 'http://115.190.57.206/static/mine/user-manual.png'

// 功能列表
const list = ref([
  {
    name: '我的车辆',
    icon: MyCarIcon,
  },
  {
    name: '家庭成员',
    icon: FamilyIcon,
  },
  {
    name: '绑定设备',
    icon: BindIcon,
  },
  {
    name: '使用手册',
    icon: UserManualIcon,
  },
  {
    name: '车辆设置',
    icon: CarSettingIcon,
  },
])

function handleListItemClick(item) {
  uni.showToast({
    title: `点击了 ${item.name}`,
    icon: 'none',
  })
}

function handleContact(e) {
  console.log('用户点击了联系按钮', e.detail)
  uni.showToast({
    title: '感谢您的联系！',
    icon: 'none',
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
        />
      </template>
    </wd-navbar>
    <!-- 头像和用户名 -->
    <image
      class="w-750rpx"
      :src="TopBgIcon"
      mode="widthFix"
    />
    <view class="absolute left-288rpx top-210rpx">
      <image
        class="mb-18rpx h-173rpx w-173rpx"
        :src="AvatarIcon"
        mode="scaleToFill"
      />
      <view class="w-173rpx text-center text-36rpx text-white">
        用户名
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
