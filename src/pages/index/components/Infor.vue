<script setup lang="ts">
import { useCarStore } from '@/store'
import { httpGet } from '@/utils/http'

defineOptions({
  name: 'Infor',
})
const props = defineProps({
  tabName: {
    type: String,
  },
})

const BgIcon = 'http://115.190.57.206/static/infor/bg.png'
const DataIcon = 'http://115.190.57.206/static/infor/data.png'
const HistoryIcon = 'http://115.190.57.206/static/infor/history.png'
const RightIcon = 'http://115.190.57.206/static/infor/right.png'
const RoundMileageIcon = 'http://115.190.57.206/static/infor/round-mileage.png'
const RoundTimeIcon = 'http://115.190.57.206/static/infor/round-time.png'
const TraceIcon = 'http://115.190.57.206/static/infor/track.png'
const carStore = useCarStore()
const dailyStats = ref<any>({
  totalRidingTime: '00:00:00',
  totalDistanceKm: '0.00',
})

watch(() => props.tabName, (newVal) => {
  if (newVal === 'infor') {
    getRidingInfo(carStore.carInfo.id)
  }
})

// 获取骑行天
async function getRidingInfo(vehicleId) {
  const res = await httpGet(`/riding/dashboard/riding`, {
    vehicleId,
  }) as any
  if (res.code === '200') {
    console.log('获取骑行数据成功:', res.data.dailyStats)
    res.data.dailyStats.totalRidingTime = formatMinutesToTime(res.data.dailyStats.totalRidingTime)
    dailyStats.value = res.data.dailyStats
  }
  else {
    console.error('获取骑行天数失败', res.message)
  }
}

// 分钟转换成00:00:00格式
function formatMinutesToTime(minutes) {
  const hrs = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  const secs = Math.floor((minutes * 60) % 60)

  const formattedHrs = String(hrs).padStart(2, '0')
  const formattedMins = String(mins).padStart(2, '0')
  const formattedSecs = String(secs).padStart(2, '0')

  return `${formattedHrs}:${formattedMins}:${formattedSecs}`
}

function goHistory() {
  uni.navigateTo({
    url: '/pages-network/history/index',
  })
}
// 去轨迹
function goTrace() {
  uni.navigateTo({
    url: '/pages-network/ride-trace/index',
  })
}

function goDrive() {
  uni.navigateTo({
    url: '/pages-network/drive-data/index',
  })
}
</script>

<template>
  <view class="infor">
    <!-- top背景 -->
    <image
      class="absolute left-0 top-0 h-671rpx w-750rpx"
      :src="BgIcon"
    />
    <!-- 骑行时间&&骑行里程 -->
    <view class="relative flex justify-between px-20rpx pt-671rpx">
      <view class="relative box-border h-160rpx w-345rpx rounded-8rpx bg-white px-30rpx py-49rpx">
        <view class="mb-20rpx text-20rpx text-[#888888]">
          今日骑行时间
        </view>
        <view class="text-26rpx text-[#333333] font-bold">
          {{ dailyStats.totalRidingTime || '00:00:00' }}
        </view>
        <image
          class="absolute bottom-16rpx right-12rpx h-14rpx w-14rpx"
          :src="RoundTimeIcon"
        />
      </view>
      <view class="relative box-border h-160rpx w-345rpx rounded-8rpx bg-white px-30rpx py-49rpx">
        <view class="mb-20rpx text-20rpx text-[#888888]">
          今日骑行里程
        </view>
        <view class="mb-20rpx text-26rpx text-[#333333] font-bold">
          {{ dailyStats.totalDistanceKm || '0.00' }} KM
        </view>
        <image
          class="absolute bottom-16rpx right-12rpx h-14rpx w-14rpx"
          :src="RoundMileageIcon"
        />
      </view>
    </view>
    <!-- bottom -->
    <view class="ml-20rpx mt-20rpx box-border h-160rpx w-710rpx flex items-center justify-between rounded-8rpx bg-white pl-20rpx pr-40rpx" @click="goTrace">
      <view class="flex items-center">
        <image
          class="h-80rpx w-80rpx"
          :src="TraceIcon"
          mode="scaleToFill"
        />
        <view class="ml-60rpx">
          <view class="mb-9rpx text-30rpx font-bold">
            骑行轨迹
          </view>
          <view class="text-20rpx text-[#6E6E6E]">
            一路美景 缤纷旅程
          </view>
        </view>
      </view>
      <image
        class="h-17rpx w-14rpx"
        :src="RightIcon"
        mode="scaleToFill"
      />
    </view>
    <view class="ml-20rpx mt-20rpx box-border h-160rpx w-710rpx flex items-center justify-between rounded-8rpx bg-white pl-20rpx pr-40rpx" @click="goHistory">
      <view class="flex items-center">
        <image
          class="h-80rpx w-80rpx"
          :src="HistoryIcon"
          mode="scaleToFill"
        />
        <view class="ml-60rpx">
          <view class="mb-9rpx text-30rpx font-bold">
            历史停留
          </view>
          <view class="text-20rpx text-[#6E6E6E]">
            查看驻足历史
          </view>
        </view>
      </view>
      <image
        class="h-17rpx w-14rpx"
        :src="RightIcon"
        mode="scaleToFill"
      />
    </view>
    <view class="ml-20rpx mt-20rpx box-border h-160rpx w-710rpx flex items-center justify-between rounded-8rpx bg-white pl-20rpx pr-40rpx" @click="goDrive">
      <view class="flex items-center">
        <image
          class="h-80rpx w-80rpx"
          :src="DataIcon"
          mode="scaleToFill"
        />
        <view class="ml-60rpx">
          <view class="mb-9rpx text-30rpx font-bold">
            行驶数据
          </view>
          <view class="text-20rpx text-[#6E6E6E]">
            您的骑行数据
          </view>
        </view>
      </view>
      <image
        class="h-17rpx w-14rpx"
        :src="RightIcon"
        mode="scaleToFill"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.infor {
  height: calc(100vh - 88rpx);
  background: #F2F4F6;
  position: relative;
  // display: flex;
  // flex-direction: column;
  // align-items: center;
}
</style>
