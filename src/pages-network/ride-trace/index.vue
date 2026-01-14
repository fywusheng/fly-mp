<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '骑行轨迹',
    navigationBarBackgroundColor: '#ffffff',
    enablePullDownRefresh: true, // 启用下拉刷新
  },
}
</route>

<script lang="ts" setup>
import { useCarStore } from '@/store/car'
import { httpGet } from '@/utils/http'

const state = ref<'loading' | 'finished' | 'error'>('loading')
const hasMore = ref(true) // 是否还有更多数据
const time = ref<number>(Date.now()) // 单选日期（时间戳）
const carStore = useCarStore()
const page = ref(1) // 当前页码
const size = 20
const startDate = ref('')
const endDate = ref('')
// 仅允许最近30天（含今天）
const ONE_DAY = 24 * 60 * 60 * 1000
const maxDate = ref<number>(Date.now())
const minDate = ref<number>(Date.now() - 29 * ONE_DAY)
const ridingInfo = ref<any[]>([]) // 骑行列表信息

onLoad((e) => {
  // 默认当天
  startDate.value = timeFormat(new Date().getTime())
  endDate.value = timeFormat(new Date().getTime())
  time.value = Date.now()
  getTrackInfo()
})

// 下拉刷新
onPullDownRefresh(() => {
  refreshList()
})

// 上拉加载更多
onReachBottom(() => {
  loadMore()
})

// 获取骑行数据
async function getTrackInfo(isRefresh = false) {
  // 如果是刷新，重置分页
  if (isRefresh) {
    page.value = 1
    hasMore.value = true
  }

  // 如果没有更多数据且不是刷新，直接返回
  if (!hasMore.value && !isRefresh) {
    state.value = 'finished'
    return
  }

  state.value = 'loading'

  try {
    const params = {
      vehicleId: carStore.carInfo.id,
      page: page.value,
      size,
      startDate: startDate.value,
      endDate: endDate.value,
    }
    console.log('请求参数:', params)
    const res = await httpGet(`/riding/ride/history`, params)

    if (res.code === '200') {
      const data = res.data as { records?: any[], total?: number, current?: number, pages?: number }
      const records = data.records || []

      if (isRefresh) {
        // 刷新时替换数据
        ridingInfo.value = records
      }
      else {
        // 加载更多时追加数据
        ridingInfo.value = [...ridingInfo.value, ...records]
      }

      console.log(`获取骑行数据成功: 第 ${page.value} 页，本页 ${records.length} 条`)

      // 判断是否还有更多数据
      if (ridingInfo.value.length === data.total) {
        hasMore.value = false
        state.value = 'finished'
      }
      else {
        hasMore.value = true
        state.value = 'loading'
      }

      // 只有在有更多数据时才增加页码
      if (hasMore.value && records.length > 0) {
        page.value++
      }

      // 停止下拉刷新动画
      if (isRefresh) {
        uni.stopPullDownRefresh()
      }
    }
    else {
      console.error('获取轨迹信息失败', res.message)
      state.value = 'error'
      uni.showToast({
        title: res.message || '获取数据失败',
        icon: 'none',
      })
    }
  }
  catch (error) {
    console.error('获取轨迹信息失败', error)
    state.value = 'error'
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none',
    })

    // 停止下拉刷新动画
    if (isRefresh) {
      uni.stopPullDownRefresh()
    }
  }
}
// 刷新列表
function refreshList() {
  getTrackInfo(true)
}

// 加载更多
function loadMore() {
  if (state.value === 'finished' || !hasMore.value) {
    return
  }
  getTrackInfo(false)
}

// 日期确定事件
function handleConfirm({ value }) {
  // 单选日期：起止同一天
  const ts = Array.isArray(value) ? value[0] : value
  startDate.value = timeFormat(ts)
  endDate.value = timeFormat(ts)
  // 切换日期时重置列表
  ridingInfo.value = []
  page.value = 1
  hasMore.value = true
  getTrackInfo(true)
}

function goHistoryInfo(item: any) {
  if (!item || !item.rideId) {
    uni.showToast({
      title: '缺少骑行记录ID',
      icon: 'none',
    })
    return
  }
  uni.navigateTo({
    url: `/pages-network/ride-trace-info/index?rideId=${item.rideId}`,
  })
}

function timeFormat(timestamp: number) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 格式化骑行时长（秒转 HH:mm:ss）
function formatDuration(seconds: number) {
  if (!seconds)
    return '00:00:00'

  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}
</script>

<template>
  <view class="track-detail">
    <!-- 列表内容 -->
    <view v-if="ridingInfo.length > 0" class="list-container">
      <view v-for="(item, index) in ridingInfo" :key="item.rideId || index" class="card">
        <view class="card-item flex flex-col items-center justify-between" @click="goHistoryInfo(item)">
          <view class="card-item-top box-border h-80rpx w-100% flex items-center justify-between px-29rpx">
            <view class="text-24rpx text-[#333333]">
              {{ item.startTime }}-{{ item.endTime ? item.endTime.split(' ')[1] : '' }}
            </view>
            <view class="look-btn">
              查看轨迹
            </view>
          </view>
          <!-- <view class="card-item-middle box-border flex flex-col px-29rpx py-40rpx">
            <view class="flex items-center">
              <view class="mr-20rpx h-20rpx w-20rpx rounded-10rpx bg-[#DB6477]" />
              <view>{{ item.startAddress || '--' }}</view>
            </view>
            <view class="flex items-center">
              <view class="mr-20rpx h-20rpx w-20rpx rounded-10rpx bg-[#2CBC7B]" />
              <view>{{ item.endAddress || '--' }}</view>
            </view>
          </view> -->
          <view class="box-border w-100% flex items-center justify-between px-29rpx py-25rpx">
            <view class="flex flex-col items-center justify-center text-24rpx text-[#333333]">
              <view>{{ ((item.distance || 0) * 1000).toFixed(0) }}m</view>
              <view>本次里程</view>
            </view>
            <view class="flex flex-col items-center justify-center text-24rpx text-[#333333]">
              <view>{{ (item.avgSpeed || 0).toFixed(1) }}km/h</view>
              <view>平均速度</view>
            </view>
            <view class="flex flex-col items-center justify-center text-24rpx text-[#333333]">
              <view>{{ formatDuration(item.durationSeconds || 0) }} </view>
              <view>骑行时间</view>
            </view>
            <view class="flex flex-col items-center justify-center text-24rpx text-[#333333]">
              <view>{{ (item.carbonReduction || 0).toFixed(0) }}g</view>
              <view>减少碳排放</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多状态 -->
      <wd-loadmore custom-class="loadmore" :state="state" />
    </view>

    <!-- 空状态 -->
    <view v-else-if="state !== 'loading'" class="empty-state">
      <wd-status-tip image="search" tip="当前搜索无结果" />
    </view>

    <!-- 日期选择器（单选，限制最近3天） -->
    <wd-calendar
      v-model="time"
      type="date"
      :min-date="minDate"
      :max-date="maxDate"
      @confirm="handleConfirm"
    >
      <view class="sub-btn">
        <view>{{ startDate }}</view>
        <!-- <view>点击查看更多</view> -->
      </view>
    </wd-calendar>
  </view>
</template>

<style lang="scss" scoped>
.track-detail {
  width: 100vw;
  min-height: 100vh;
  position: relative;
  background-color: #DDE3EC;
  padding-top: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  .card{
    width: 710rpx;
    background: #FFFFFF;
    border-radius: 20rpx;
    margin-bottom: 20rpx;
    .card-item {
      position: relative;

      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        display: block;
        width: 100%;
        height: 1rpx;
        background-color: #E6E6E6;
      }
      &:last-child{
        &::before  {
          height: 0;
        }
      }
      .card-item-top {
        position: relative;
        &::after{
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          display: block;
          width: 100%;
          height: 1rpx;
          background-color: #E6E6E6;
        }
      }
      .card-item-middle {
        position: relative;
        width: 100%;
         &::after{
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          display: block;
          width: 100%;
          height: 1rpx;
          background-color: #E6E6E6;
        }
      }
    }
  }
  .sub-btn {
    position: fixed;
    bottom: 40rpx;
    left: 20rpx;
    background-color: #239AF6;
    width: 710rpx;
    height: 80rpx;
    border-radius: 40rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #FFFFFF;
    font-size: 30rpx;
    // margin-top: 98rpx;
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
  .empty-state {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items:center;
    background: #FFFFFF;
  }
}
</style>
