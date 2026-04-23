<script setup lang="ts">
import { useUserStore } from '@/store'
import { httpGet } from '@/utils/http'
import { getImageUrl } from '@/utils/image'
import HomeAdBanner from '../com-components/HomeAdBanner.vue'

defineOptions({
  name: 'MineBlue',
})

const props = defineProps({
  tabName: {
    type: String,
  },
})

const userStore = useUserStore()

const AvatarIcon = getImageUrl('/mine/avatar.png')
const BindIcon = getImageUrl('/mine/bind.png')
const BlueAvatarIcon = getImageUrl('/mine/blue-avatar.png')
const CarSettingIcon = getImageUrl('/mine/car-setting.png')
const TipsIcon = getImageUrl('/mine/tips-icon.png')
const CustomerServiceIcon = getImageUrl('/mine/customer-service.png')
const FamilyIcon = getImageUrl('/mine/family.png')
const MyCarIcon = getImageUrl('/mine/my-car.png')
const RightIcon = getImageUrl('/mine/right.png')
const SettingIcon = getImageUrl('/mine/setting.png')
const ShareIcon = getImageUrl('/mine/share.png')
const TopBgIcon = getImageUrl('/mine/top-bg.png')
const UserManualIcon = getImageUrl('/mine/user-manual.png')
const PointIcon = getImageUrl('/mine/point-icon.png')
const RectIcon = getImageUrl('/mine/rect-icon.png')
const StarIcon = getImageUrl('/mine/star-icon.png')
const OpenIcon = getImageUrl('/mine/open-icon.png')
const adList = ref([])
const unreadMessageCount = ref(0)
const notice = ref<{ title: string, content: string }>({ title: '', content: '' })

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

watch(() => props.tabName, (newVal) => {
  if (newVal === 'mine' && userStore.isLoggedIn) {
    getAdList()
    getUnreadMessageCount()
    getNoticeText()
  }
})

// 获取公告
async function getNoticeText() {
  try {
    const res = await httpGet<{ records: Array<{ title: string, content: string }> }>(`/user/mini/message/list`, {
      pageNum: 1,
      pageSize: 1,
    })
    if (res.code === '200') {
      notice.value = res.data.records[0]
    }
  }
  catch (err) {
    console.error('获取公告失败:', err)
  }
}

// 获取广告列表
async function getAdList() {
  try {
    const res = await httpGet(`/common/advertisement/list`, {
      adPosition: 'MINE',
    })
    if (res.code === '200') {
      adList.value = res.data as any[]
    }
  }
  catch (err) {
    console.error('获取广告列表失败:', err)
  }
}

// 获取未读消息数量
async function getUnreadMessageCount() {
  try {
    const res = await httpGet<{ unreadCount: number }>(`/user/mini/message/unread-count`)
    if (res.code === '200') {
      unreadMessageCount.value = res.data.unreadCount || 0
    }
  }
  catch (err) {
    console.error('获取未读消息数量失败:', err)
  }
}

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
      // uni.navigateTo({
      //   url: '/pages-car/blueDemo/index',
      // })
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

function goMessage() {
  uni.navigateTo({
    url: `/pages-mine/message/index?message=${encodeURIComponent(JSON.stringify(notice.value))}`,
  })
}

function goSettings() {
  uni.navigateTo({
    url: '/pages-mine/settings/index',
  })
}

function goMessageCenter() {
  uni.navigateTo({
    url: '/pages-mine/message-center/index',
  })
}

function goPointsDetails() {
  uni.navigateTo({
    url: '/pages-mine/points-details/index',
  })
}

function goVip() {
  uni.navigateTo({
    url: '/pages-network/smart-service/index',
  })
}
</script>

<template>
  <view class="mine">
    <!-- 用户信息 -->
    <view class="relative h-508rpx w-750rpx">
      <!-- 背景 -->
      <image
        class="absolute left-0 top-0 h-100% w-100%"
        :src="TopBgIcon"
        mode="scaleToFill"
      />
      <view class="absolute left-0 top-210rpx w-100% flex flex-col items-center justify-center">
        <view class="relative w-100% flex items-center justify-end pr-100rpx">
          <image
            class="mr-60rpx h-40rpx w-40rpx"
            :src="SettingIcon"
            mode="scaleToFill"
            @click="goSettings"
          />
          <wd-badge :model-value="unreadMessageCount">
            <image
              class="h-40rpx w-40rpx"
              :src="TipsIcon"
              mode="scaleToFill"
              @click="goMessageCenter"
            />
          </wd-badge>
        </view>
        <view class="w-100% flex">
          <image
            class="mb-18rpx ml-60rpx h-173rpx w-173rpx"
            :src="BlueAvatarIcon"
            mode="scaleToFill"
          />
          <view class="ml-22rpx text-white">
            <view class="whitespace-nowrap pt-16rpx text-36rpx">
              {{ userStore.userInfo && userStore.userInfo.nickname ? userStore.userInfo.nickname : '--' }}
            </view>
            <view class="mt-19rpx text-30rpx">
              {{ userStore.isMemberVip ? 'VIP会员' : '普通会员' }}
            </view>

            <view class="point-label ml-[-20rpx] mt-39rpx flex items-center text-24rpx" @click="goPointsDetails">
              <image
                class="mr-10rpx h-44rpx w-44rpx"
                :src="PointIcon"
                mode="scaleToFill"
              />
              <view>
                <text>里程积分</text>
                <text class="text-[#FDEBC9]">
                  {{ userStore.userInfo.points }}
                </text>
              </view>
              <wd-icon class="mr-10rpx" name="arrow-right" size="18px" />
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 消息提示 -->
    <view v-if="notice.content" class="notice-container mx-20rpx mx-20rpx mt-20rpx rounded-8rpx" @click="goMessage">
      <wd-notice-bar :text="notice.content" prefix="warn-bold">
        <template #suffix>
          <wd-icon name="arrow-right" size="22px" color="#333333" />
        </template>
      </wd-notice-bar>
    </view>

    <!-- 会员开通提示 -->
    <view v-if="!userStore.isMemberVip" class="relative mx-20rpx mt-20rpx h-120rpx w-710rpx flex items-center justify-between rounded-8rpx" @click="goVip">
      <image
        class="absolute left-0 top-0 h-100% w-100%"
        :src="RectIcon"
        mode="scaleToFill"
      />
      <view class="relative z-10 flex items-center justify-center">
        <image
          class="ml-29rpx h-49rpx w-52rpx"
          :src="StarIcon"
          mode="scaleToFill"
        />
        <view class="ml-20rpx flex flex-col">
          <view class="mb-8rpx text-30rpx text-[#FCAB2A]">
            智能服务
          </view>
          <view class="text-24rpx text-[#333333]">
            开通VIP会员卡，低至
            <text class="text-[#FCAB2A]">
              20元/年
            </text>
          </view>
        </view>
      </view>
      <image
        class="relative z-10 mr-29rpx h-50rpx w-161rpx"
        :src="OpenIcon"
        mode="scaleToFill"
      />
    </view>

    <!-- 功能列表 -->
    <view class="relative mt-20rpx px-20rpx">
      <view
        v-for="item in list"
        :key="item.name"
        class="mb-20rpx flex items-center justify-between rounded-20rpx bg-white px-40rpx py-45rpx"
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
          class="h-30rpx w-18rpx"
          :src="RightIcon"
          mode="scaleToFill"
        />
      </view>
      <button
        class="custom-btn mb-20rpx flex items-center justify-between rounded-8rpx bg-white px-40rpx py-45rpx"
        open-type="contact"
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

    <!-- 广告位 -->
    <HomeAdBanner
      item-width="260rpx"
      item-height="180rpx"
      :list="adList"
    />
  </view>
</template>

<style lang="scss" scoped>
.mine {
  padding-bottom: 20rpx;
  background: #E4EBF2;
  position: relative;
  .custom-btn {
    border: none;
     &:active {
      background-color: #fff;
      color: #333;
    }
  }
  .point-label {
    height: 60rpx;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background: #50A4FB;
    border-radius: 30rpx;
    padding: 0 10rpx;
  }
  .notice-container {
    :deep(.wd-notice-bar.is-warning) {
      background: #fff;
    }
  }
}
</style>

<style>
.notice-container .wd-notice-bar.is-warning {
  background: #fff !important;
  border-radius: 8rpx !important;
  padding: 0 20rpx !important;
}
</style>
