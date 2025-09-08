<script setup lang="ts">
import dayjs from 'dayjs'
import { useUserStore } from '@/store'
import { getLocation } from '@/utils'
import { httpDelete, httpGet } from '@/utils/http'

defineOptions({
  name: 'InforBlue',
})
const BgIcon = 'http://121.89.87.166/static/infor/blue-bg.png'
const CarIcon = 'http://121.89.87.166/static/infor/car-icon.png'
const DateIcon = 'http://121.89.87.166/static/infor/date.png'
const LeftArrow = 'http://121.89.87.166/static/infor/left-arrow.png'
const LocationIcon = 'http://121.89.87.166/static/infor/location-icon.png'
const RightArrow = 'http://121.89.87.166/static/infor/right-arrow.png'

// 获取胶囊位置信息
const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
const userStore = useUserStore()
const date = ref<number>(Date.now())
const address = ref<string>('广东省广州市珠海区广东省 广州市珠海区')

const cumulativeStats = ref<any>({
  ageLabel: '我今年0岁',
  companionshipDays: 0,
  totalRidingMinutes: 0,
  totalTrips: 0,
  vehicleImageUrl: '/images/vehicle-default.png',
})

const currentLocation = ref<any>({
  detailedAddress: '',
  latitude: 40.22077,
  locationDescription: '',
  longitude: 116.23128,
})

const dailyStats = ref<any>({
  maxSpeed: 0,
  totalRidingTime: 0,
  tripSegments: 0,
})

const ridingRecords = ref<any[]>([])
const ridingSummary = ref<any>({
  maxSpeed: 0,
  riderName: '',
  ridingTime: 0,
})

watch(date, (newDate) => {
  console.log('Selected date changed to:', newDate)
  getRidingData()
})

onMounted(() => {
  console.log('menuButtonInfo', menuButtonInfo)
  // getCurrentLocation()

  getRidingData()
})
// 获取当前位置
function getCurrentLocation() {
  getLocation().then((res) => {
    // 处理位置信息
    httpGet('/riding/dashboard/current-location').then((locationRes: any) => {
      if (locationRes.code === '200') {
        address.value = locationRes.data.detailedAddress
      }
    }).catch((err) => {
      console.error('获取位置信息失败', err)
    })
  }).catch((err) => {
    console.error('获取位置失败', err)
  })
}
// 获取骑行数据
async function getRidingData() {
  if (!userStore.isLoggedIn) {
    console.warn('用户未登录，无法获取骑行数据')
    return
  }
  uni.showLoading({
    title: '加载中...',
  })
  const res = await httpGet('/riding/dashboard/riding', { date: dayjs(date.value).format('YYYY-MM-DD'), vehicleId: userStore.userInfo?.defaultVehicleId })
  uni.hideLoading()
  if (res.code === '200') {
    cumulativeStats.value = (res.data as any).cumulativeStats
    currentLocation.value = (res.data as any).currentLocation
    dailyStats.value = (res.data as any).dailyStats
    ridingRecords.value = (res.data as any).ridingRecords
    ridingSummary.value = (res.data as any).ridingSummary
    // address.value = currentLocation.value.detailedAddress
  }
  else {
    console.error('获取骑行数据失败', res.message)
  }
}

// 处理日期选择确认
function handleConfirm(selectedDate: any) {
  date.value = selectedDate.value
  // // 这里可以添加处理日期选择后的逻辑
  // console.log('选中的日期:', formatDate(selectedDate.value))
}
function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}
// 获取前一天的时间戳
function getPreviousDayTimestamp(): void {
  date.value = dayjs(date.value).subtract(1, 'day').valueOf()
}
// 获取后一天的时间戳
function getNextDayTimestamp(): void {
  date.value = dayjs(date.value).add(1, 'day').valueOf()
}

// 查看轨迹详情
function goDetail(item): void {
  console.log('Navigating to track detail page')
  uni.navigateTo({
    url: `/pages-car/trackDetail/index?rideId=${item.rideId}`,
    success: (success) => {
      success.eventChannel.emit('rideData', item)
    },
  })
}
// 删除骑行记录
async function deleteRidingRecord(item): Promise<void> {
  const confirm = await uni.showModal({
    title: '删除骑行记录',
    content: '确定要删除该骑行记录吗？此操作不可撤销。',
    confirmText: '删除',
    cancelText: '取消',
    confirmColor: '#EB3D59',
    cancelColor: '#666666',
  })
  if (confirm.confirm) {
    // 用户点击了确认按钮，执行删除操作
    const res = await httpDelete(`/riding/ride/delete/${item.rideId}`)
    if (res.code === '200') {
      uni.showToast({
        title: '删除成功',
        icon: 'success',
        duration: 2000,
      })
      // 删除成功后，刷新骑行数据
      getRidingData()
    }
    else {
      uni.showToast({
        title: res.message || '删除失败',
        icon: 'error',
        duration: 2000,
      })
    }
  }
}
</script>

<template>
  <view class="infor">
    <!-- top背景 -->
    <image
      class="absolute left-0 top-0 h-671rpx w-750rpx"
      :src="BgIcon"
    />
    <!-- 行驶数据 -->
    <view class="relative flex justify-around" :style="{ paddingTop: `${menuButtonInfo?.top + menuButtonInfo.height + 10}px` }">
      <view class="relative h-136rpx w-128rpx flex items-center justify-end">
        <image
          class="h-136rpx w-128rpx"
          :src="CarIcon"
          mode="scaleToFill"
        />
        <view class="car-label">
          {{ cumulativeStats.ageLabel }}
        </view>
      </view>

      <view class="flex flex-col items-center justify-center pt-41rpx">
        <view class="text-24rpx text-[#333333] font-bold">
          累计出行(次)
        </view>
        <view class="text-50rpx text-white font-bold">
          {{ cumulativeStats.totalTrips }}
        </view>
      </view>
      <view class="flex flex-col items-center justify-center pt-41rpx">
        <view class="text-24rpx text-[#333333] font-bold">
          累计骑行(分钟)
        </view>
        <view class="text-50rpx text-white font-bold">
          {{ cumulativeStats.totalRidingMinutes }}
        </view>
      </view>
      <view class="flex flex-col items-center justify-center pt-41rpx">
        <view class="text-24rpx text-[#333333] font-bold">
          陪伴时间(天)
        </view>
        <view class="text-50rpx text-white font-bold">
          {{ cumulativeStats.companionshipDays }}
        </view>
      </view>
    </view>

    <view class="relative mt-57rpx">
      <view class="mb-18rpx flex items-center">
        <image
          class="ml-50rpx h-30rpx w-25rpx"
          :src="LocationIcon"
          mode="scaleToFill"
        />
        <view class="ml-20rpx text-20rpx text-[#666666]">
          {{ currentLocation.detailedAddress }}
        </view>
      </view>
      <!-- 时间选择 -->
      <view class="relative ml-20rpx box-border w-710rpx flex flex-col items-center justify-between rounded-8rpx bg-white py-20rpx">
        <wd-calendar v-model="date" :z-index="100" @confirm="handleConfirm">
          <image
            class="mb-10rpx h-30rpx w-30rpx"
            :src="DateIcon"
            mode="scaleToFill"
          />
        </wd-calendar>

        <view class="flex items-center justify-center">
          <image
            class="h-20rpx w-12rpx"
            :src="LeftArrow"
            mode="scaleToFill"
            @click="getPreviousDayTimestamp"
          />
          <view class="mx-109rpx text-30rpx text-[#333333]">
            {{ formatDate(date) }}
          </view>
          <image
            class="h-20rpx w-12rpx"
            :src="RightArrow"
            mode="scaleToFill"
            @click="getNextDayTimestamp"
          />
        </view>
        <view class="mt-20rpx h-2rpx w-100% bg-[#E6E6E6]" />
        <view class="w-100% flex justify-around">
          <view class="w-235rpx flex flex-col items-center justify-center">
            <view class="mb-12rpx text-48rpx color-[#239AF6]">
              {{ dailyStats.tripSegments }}
            </view>
            <view class="text-18rpx color-[#666666]">
              出行轨迹(段)
            </view>
            <view class="mt-10rpx h-2rpx w-68rpx bg-[#239AF6]" />
          </view>
          <view class="bg-[#E6E6E6]] mt-15rpx h-90rpx w-2rpx" />
          <view class="w-235rpx flex flex-col items-center justify-center">
            <view class="mb-12rpx text-48rpx color-[#2CBC7B]">
              {{ dailyStats.totalRidingTime }}
            </view>
            <view class="text-18rpx color-[#666666]">
              总骑行时间(分钟)
            </view>
            <view class="mt-10rpx h-2rpx w-68rpx bg-[#2CBC7B]" />
          </view>
          <view class="bg-[#E6E6E6]] mt-15rpx h-90rpx w-2rpx" />
          <view class="w-235rpx flex flex-col items-center justify-center">
            <view class="mb-12rpx text-48rpx color-[#DB6477]">
              {{ dailyStats.maxSpeed }}
            </view>
            <view class="text-18rpx color-[#666666]">
              最高时速(km/h)
            </view>
            <view class="mt-10rpx h-2rpx w-68rpx bg-[#DB6477]" />
          </view>
        </view>
      </view>

      <view v-for="item in ridingRecords" :key="item.rideId">
        <wd-swipe-action>
          <view :style="{ background: item.ownerType === 1 ? '#D2DFED' : '#FFFFFF' }" class="ml-20rpx mt-20rpx box-border w-710rpx rounded-8rpx py-30rpx" @click="goDetail(item)">
            <wd-steps :active="3" vertical>
              <wd-step :icon-slot="true">
                <template #icon>
                  <view :style="{ background: item.ownerType === 1 ? '#D2DFED' : '#FFFFFF' }" class="h-22px w-30px flex items-center justify-center">
                    <view class="h-20rpx w-20rpx rounded-10px bg-[#2CBC7B]" />
                  </view>
                </template>
                <template #title>
                  <view class="text-[#666666]">
                    <template v-if="item.startTime">
                      <span>{{ item.start }} </span>
                      <span>(</span>
                      <span class="text-[#239AF6]">{{ item.startTime }}</span>
                      <span>)</span>
                    </template>

                    <text v-else class="text-[#DB6477]">
                      未获取位置信息，请打开手机定位
                    </text>
                  </view>
                </template>
              </wd-step>
              <wd-step icon="clock">
                <template #icon>
                  <view :style="{ background: item.ownerType === 1 ? '#D2DFED' : '#FFFFFF' }" class="h-22px w-30px flex items-center justify-center">
                    <view class="h-20rpx w-20rpx rounded-10px bg-[#DB6477]" />
                  </view>
                </template>
                <template #title>
                  <view class="text-[#333333]">
                    <template v-if="item.endTime">
                      <span>{{ item.end }} </span>
                      <span>(</span>
                      <span class="text-[#239AF6]">{{ item.endTime }}</span>
                      <span>)</span>
                    </template>

                    <text v-else class="text-[#DB6477]">
                      未获取位置信息，请打开手机定位
                    </text>
                  </view>
                </template>
              </wd-step>
            </wd-steps>
            <view class="h-2rpx w-100% bg-[#E6E6E6]" />
            <view class="mt-22rpx flex items-center justify-between px-29rpx text-20rpx color-[#666666]">
              <view>骑行时间：{{ item.ridingTime }}</view>
              <view>最高时速：{{ item.maxSpeed }}km/h</view>
              <view>骑行人：{{ item.rideName }}</view>
            </view>
          </view>
          <template #right>
            <view class="action">
              <view class="button" @click="deleteRidingRecord(item)">
                删除
              </view>
            </view>
          </template>
        </wd-swipe-action>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.infor {
  min-height: calc(100vh - 88rpx);
  background: #F2F4F6;
  position: relative;
  padding-bottom: 88rpx;
  .car-label {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    background: #AD8AA9;
    padding: 0rpx 8rpx;
    height: 36rpx;
    border-radius: 18rpx;
    font-size: 20rpx;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2rpx solid #DA6579;
  }
}
.action {
  height: 100%;
}
.button {
  display: inline-block;
  padding: 0 11px;
  height: 100%;
  color: white;
  background: #EB3D59;
  line-height: 42px;
  width: 200rpx;
  font-size: 30rpx;
  border-radius: 18rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
