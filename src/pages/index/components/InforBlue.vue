<script setup lang="ts">
import dayjs from 'dayjs'
import { useCarStore, useUserStore } from '@/store'
import { getColorImg, getLocation } from '@/utils'
import { httpDelete, httpGet, httpPost } from '@/utils/http'
import { getImageUrl } from '@/utils/image'

defineOptions({
  name: 'InforBlue',
})
const props = defineProps({
  tabName: {
    type: String,
  },
})
const BgIcon = getImageUrl('/infor/blue-bg.png')
const CarIcon = getImageUrl('/infor/car-icon.png')
const DateIcon = getImageUrl('/infor/date.png')
const LeftArrow = getImageUrl('/infor/left-arrow.png')
const LocationIcon = getImageUrl('/infor/location-icon.png')
const RightArrow = getImageUrl('/infor/right-arrow.png')

const DataAive = getImageUrl('/infor/ble-data-active.png')
const DataUnAive = getImageUrl('/infor/ble-data.png')
const DataNone = getImageUrl('/infor/4g-data-none.png')
const Effect = getImageUrl('/infor/effect.png')
const Gift = getImageUrl('/infor/gift.png')

// 获取胶囊位置信息
const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
const userStore = useUserStore()
const carStore = useCarStore()
const date = ref<number>(Date.now())
// 近30天范围（含今天）：最早为29天前0点，最晚为今天23:59:59
const minDate = ref<number>(dayjs().subtract(29, 'day').startOf('day').valueOf())
const maxDate = ref<number>(dayjs().endOf('day').valueOf())
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
// 骑行记录
const page = ref<number>(1)
const size = ref<number>(20)
const hasMore = ref<boolean>(true)
const ridingRecords = ref<any[]>([])
const isLoadingMore = ref<boolean>(false)
const loadMoreState = ref<'loading' | 'finished' | 'error'>('loading')

const ridingSummary = ref<any>({
  maxSpeed: 0,
  riderName: '',
  ridingTime: 0,
})
const colorCode = ref<string>(uni.getStorageSync('selectColorCode') || '') // 车辆颜色

// message弹窗
const showMessagePopup = ref(false) // 控制弹窗显示
const messageId = ref<number>(0) // 弹窗ID
const message = ref<string>('<view >删除该成员后，</view> <view >他将不能使用此设备。</view>') // 弹窗内容
const duration = ref(0) // 弹窗持续时间
const confirmText = ref<string>('确定') // 确认按钮文本
const showCancelBtn = ref(true) // 是否显示取消按钮
const showConfirmBtn = ref(true) // 是否显示确认按钮
const closeOnClickModal = ref(true) // 是否点击蒙层关闭弹窗

const hasPending = ref(false) // 是否有待领取体验卡
const activeCard = ref({
  activatedAt: '', // 激活时间
  cardName: '', // 卡名称
  cardType: '', // 卡类型 DATA, FEATURE 等等
  claimedAt: '', // 领取时间
  effective: false, // 是否当前生效（已激活且未过期）
  effectiveTime: '', // 生效时间
  expireAt: '', // 过期时间
  expireDate: '', // 过期日期
  status: '', // 卡状态 PENDING / ACTIVE / EXPIRED
})

watch(() => props.tabName, (newVal) => {
  if (newVal === 'inforBlue' && userStore.isLoggedIn) {
    getAuth()
  }
})

// 上拉加载更多
onReachBottom(() => {
  loadMoreRidingRecords()
})

async function getAuth() {
  const vehicleId = carStore.carInfo.id
  const res = await httpGet(`/user/card/vehicles/${vehicleId}/cards/check`) as any
  if (res.code === '200') {
    activeCard.value = res.data.activeCard || null
    hasPending.value = res.data.hasPending
    // activeCard.value = null
    // hasPending.value = true

    if (!hasPending.value && activeCard.value && activeCard.value.effective) {
      getRidingData()
    }
    else {
      // 清空数据
      cumulativeStats.value = {
        ageLabel: '我今年0岁',
        companionshipDays: 0,
        totalRidingMinutes: 0,
        totalTrips: 0,
        vehicleImageUrl: '/images/vehicle-default.png',
      }
      currentLocation.value = {
        detailedAddress: '',
        latitude: 40.22077,
        locationDescription: '',
        longitude: 116.23128,
      }
      dailyStats.value = {
        maxSpeed: 0,
        totalRidingTime: 0,
        tripSegments: 0,
      }
      ridingSummary.value = {
        maxSpeed: 0,
        riderName: '',
        ridingTime: 0,
      }
      ridingRecords.value = []
    }
  }
}

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
async function getRidingData(isLoadMore = false) {
  if (!userStore.isLoggedIn) {
    console.warn('用户未登录，无法获取骑行数据')
    return
  }

  // 防止重复加载
  if (isLoadMore && isLoadingMore.value) {
    return
  }

  // 如果是加载更多且没有更多数据，直接返回
  if (isLoadMore && !hasMore.value) {
    loadMoreState.value = 'finished'
    return
  }

  if (isLoadMore) {
    isLoadingMore.value = true
    loadMoreState.value = 'loading'
  }
  else {
    // 重置时显示加载提示
    uni.showLoading({
      title: '加载中...',
    })
    // 重置分页
    page.value = 1
    hasMore.value = true
    ridingRecords.value = []
  }

  try {
    const res = await httpGet('/riding/dashboard/riding', {
      page: page.value,
      size: size.value,
      date: dayjs(date.value).format('YYYY-MM-DD'),
      vehicleId: userStore.userInfo?.defaultVehicleId,
    })

    if (!isLoadMore) {
      uni.hideLoading()
    }

    if (res.code === '200') {
      console.log('获取骑行数据成功', res.data)

      if (!isLoadMore) {
        // 首次加载，更新所有数据
        cumulativeStats.value = (res.data as any).cumulativeStats
        currentLocation.value = (res.data as any).currentLocation
        dailyStats.value = (res.data as any).dailyStats
        ridingSummary.value = (res.data as any).ridingSummary
      }

      // 骑行记录列表
      const newRecords = (res.data as any).ridingRecords || []

      if (isLoadMore) {
        // 加载更多：追加数据
        ridingRecords.value = [...ridingRecords.value, ...newRecords]
      }
      else {
        // 首次加载：替换数据
        ridingRecords.value = newRecords
      }
      console.log('ridingRecords', ridingRecords.value)

      // 判断是否还有更多数据
      if (ridingRecords.value.length === (res.data as any).ridingRecordsTotal) {
        hasMore.value = false
        loadMoreState.value = 'finished'
      }
      else {
        hasMore.value = true
        page.value++ // 页码+1，为下次加载做准备
        loadMoreState.value = 'loading'
      }

      console.log(`第${page.value - 1}页加载成功，本页${newRecords.length}条，共${ridingRecords.value.length}条`)
    }
    else {
      console.error('获取骑行数据失败', res.message)
      loadMoreState.value = 'error'
      if (!isLoadMore) {
        uni.showToast({
          title: res.message || '获取数据失败',
          icon: 'none',
        })
      }
    }
  }
  catch (error) {
    console.error('获取骑行数据异常', error)
    loadMoreState.value = 'error'
    if (!isLoadMore) {
      uni.hideLoading()
      uni.showToast({
        title: '网络错误，请重试',
        icon: 'none',
      })
    }
  }
  finally {
    if (isLoadMore) {
      isLoadingMore.value = false
    }
  }
}

// 处理日期选择确认
function handleConfirm(selectedDate: any) {
  date.value = selectedDate.value
  if (!checkhasPending()) {
    return
  }
  getRidingData()
}
function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}
// 获取前一天的时间戳
function getPreviousDayTimestamp(): void {
  const prev = dayjs(date.value).subtract(1, 'day').valueOf()
  if (prev < minDate.value) {
    uni.showToast({ title: '仅可选择近30天内日期', icon: 'none' })
    return
  }
  date.value = prev

  if (!checkhasPending()) {
    return
  }
  getRidingData()
}
// 获取后一天的时间戳
function getNextDayTimestamp(): void {
  const next = dayjs(date.value).add(1, 'day').valueOf()
  if (next > maxDate.value) {
    uni.showToast({ title: '不能选择未来日期', icon: 'none' })
    return
  }
  date.value = next

  if (!checkhasPending()) {
    return
  }
  getRidingData()
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

function checkhasPending() {
  if (hasPending.value) {
    messageId.value = 1
    showCancelBtn.value = true
    message.value = '您有一张数据服务体验卡待领取'
    showMessagePopup.value = true
    return false
  }
  else {
    if (!activeCard.value.effective) {
      messageId.value = 2
      showCancelBtn.value = false
      message.value = '购买VIP服务卡，享受更多畅行体验'
      showMessagePopup.value = true
      return false
    }
  }

  return true
}

// 领取数据服务体验卡
function getCard() {
  // 体验卡待领取
  if (hasPending.value) {
    messageId.value = 1
    showCancelBtn.value = true
    message.value = '您有一张数据服务体验卡待领取'
    showMessagePopup.value = true
  }
  else {
    // 体验卡已失效，去购买
    if (!activeCard.value.effective) {
      messageId.value = 2
      showCancelBtn.value = false
      message.value = '购买VIP服务卡，享受更多畅行体验'
      showMessagePopup.value = true
    }
  }
}
function handlePopConfirm() {
  if (messageId.value === 1) {
    console.log('领取数据服务体验卡')
    getTrialCard()
  }
  else if (messageId.value === 2) {
    console.log('去购买数据服务体验卡')
    showMessagePopup.value = false
  }
}
// 领取数据服务体验卡
async function getTrialCard() {
  const vehicleId = carStore.carInfo.id
  const res = await httpPost(`/user/card/vehicles/${vehicleId}/cards/claim`) as any
  if (res.code === '200') {
    getAuth()
    uni.showToast({
      title: '领取成功',
      icon: 'success',
    })
  }
  else {
    console.error('领取数据服务体验卡失败', res.message)
    uni.showToast({
      title: res.message || '领取失败',
      icon: 'none',
    })
  }
  showMessagePopup.value = false
}
function handleCancel() {
  showMessagePopup.value = false
}
function getBg() {
  if (hasPending.value) {
    return DataAive
  }
  if (!hasPending.value && !activeCard.value.effective) {
    return DataUnAive
  }
  return DataAive
}
function getCardTitle() {
  if (hasPending.value) {
    return '数据服务体验卡'
  }
  if (!hasPending.value && !activeCard.value.effective) {
    return '无有效数据卡'
  }

  return activeCard.value.effective ? '数据服务体验卡' : '体验卡已失效'
}

// 加载更多
function loadMoreRidingRecords() {
  if (isLoadingMore.value || !hasMore.value) {
    return
  }
  getRidingData(true)
}
</script>

<template>
  <view class="infor">
    <!-- top背景 -->
    <image
      class="absolute left-0 top-0 h-671rpx w-750rpx"
      :src=" BgIcon"
    />
    <!-- 行驶数据 -->
    <view class="relative flex justify-around" :style="{ paddingTop: `${menuButtonInfo?.top + menuButtonInfo.height + 10}px` }">
      <view class="relative h-136rpx w-128rpx flex items-center justify-end">
        <view v-if="colorCode" class="circle-ring">
          <image
            class="h-83rpx w-83rpx"
            :src="getColorImg(colorCode, 'avatar') "
            mode="scaleToFill"
          />
        </view>

        <image
          v-else
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
        <wd-calendar v-model="date" :z-index="100" :min-date="minDate" :max-date="maxDate" @confirm="handleConfirm">
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

      <!-- 骑行记录列表 -->
      <view v-for="item in ridingRecords" :key="item.rideId">
        <wd-swipe-action>
          <view :style="{ background: item.ownerType === 1 ? '#FFFFFF' : '#D2DFED' }" class="ml-20rpx mt-20rpx box-border w-710rpx rounded-8rpx py-30rpx" @click="goDetail(item)">
            <!-- <wd-steps :active="3" vertical>
              <wd-step :icon-slot="true">
                <template #icon>
                  <view :style="{ background: item.ownerType === 1 ? '#FFFFFF' : '#D2DFED' }" class="h-22px w-30px flex items-center justify-center">
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
                  <view :style="{ background: item.ownerType === 1 ? '#FFFFFF' : '#D2DFED' }" class="h-22px w-30px flex items-center justify-center">
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
            </wd-steps> -->
            <view class="flex items-center justify-between px-29rpx">
              <view class="text-24rpx text-[#333333]">
                {{ item.startTime }}-{{ item.endTime ? item.endTime.split(' ')[1] : '' }}
              </view>
              <view class="look-btn">
                查看轨迹
              </view>
            </view>
            <view class="my-20rpx h-2rpx w-100% bg-[#E6E6E6]" />
            <view class="mt-0rpx flex items-center justify-between px-29rpx text-20rpx color-[#666666]">
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

      <!-- 空状态 -->
      <view v-if="ridingRecords.length === 0 && loadMoreState !== 'loading'" class="empty-container">
        <view class="text-center text-24rpx text-[#999999]">
          暂无骑行记录
        </view>
      </view>
    </view>

    <!-- 骑行卡 -->
    <view class="fixed bottom-160rpx left-0 ml-20rpx mt-20rpx box-border w-710rpx rounded-8rpx bg-white px-20rpx pb-9rpx pt-19rpx">
      <view class="mb-11rpx text-30rpx text-[#333333] font-bold">
        车主服务
      </view>
      <view class="w-100% flex items-center justify-between">
        <view class="relative h-180rpx w-669rpx">
          <image
            class="absolute left-0 top-0 h-100% w-100%"
            :src="getBg()"
            mode="scaleToFill"
          />
          <image
            class="absolute bottom-6rpx right-28rpx h-72rpx w-209rpx"
            :src="Gift"
            mode="scaleToFill"
          />

          <view class="relative z-10 box-border h-100% w-100% px-21rpx pt-29rpx">
            <!-- 待领取 | 已失效 -->
            <view v-if="hasPending || !activeCard.effective" class="unclaimed" @click="getCard">
              {{ hasPending ? '去领取' : '去购买' }}
            </view>
            <!-- 生效中 -->
            <image
              v-if="activeCard && activeCard.effective"
              class="effect"
              :src="Effect"
              mode="scaleToFill"
            />
            <view class="text-24rpx text-[#ffffff]">
              {{ getCardTitle() }}
            </view>
            <view class="mb-20rpx mt-10rpx h-4rpx w-60rpx bg-[#ffffff]" />
            <view class="mb-9rpx text-18rpx text-[#275C4E]">
              可查询骑行轨迹/停车位置/行驶数据 全国可用
            </view>
            <view v-if=" activeCard && activeCard.effective" class="h-24rpx w-180rpx flex items-center justify-center rounded-20rpx bg-[#2CBC7B] text-14rpx text-[#ffffff]">
              有效期至{{ activeCard.expireDate || '' }}
            </view>
            <!-- <view class="w-100% flex justify-center items-center">
              <image
                class="w-99rpx h-99rpx"
                :src="DataNone"
                mode="scaleToFill"
              />
            </view> -->
          </view>
        </view>
      </view>
    </view>

    <!-- 操作提示弹窗 -->
    <fg-message v-model:show="showMessagePopup" :duration="duration" :confirm-text="confirmText" :show-cancel-btn="showCancelBtn" :show-confirm-btn="showConfirmBtn" :close-on-click-modal="closeOnClickModal" :message="message" :message-id="messageId" @cancel="handleCancel" @confirm="handlePopConfirm" />
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
.circle-ring {
  width: 128rpx; /* 设置环的宽度 */
  height: 128rpx; /* 设置环的高度 */
  border-radius: 50%; /* 使元素成为圆形 */
  border: 5rpx solid #ffffff; /* 设置边框宽度和颜色 */
  position: relative; /* 相对定位，便于后续调整 */
  display: flex;
  justify-content: center;
  align-items: center;
}
 .unclaimed {
    position: absolute;
    right: 20rpx;
    top: 8rpx;
    font-size: 20rpx;
    width: 92rpx;
    height: 34rpx;
    border-radius: 17rpx;
    background: #2CBC7B;
    color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .effect {
     position: absolute;
    right: 20rpx;
    top: 8rpx;
    width: 77rpx;
    height: 34rpx;
  }

.loadmore-container {
  width: 100%;
  padding: 20rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.look-btn {
    width: 160rpx;
    height: 50rpx;
    border-radius: 25rpx;
    border: 2rpx solid #2CBC7B;
    color: #2CBC7B;
    display: flex;
    justify-content: center;
    align-items:center;
  }

.empty-container {
  width: 100%;
  padding: 80rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
