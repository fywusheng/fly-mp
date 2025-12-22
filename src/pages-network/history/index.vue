<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '历史停留',
    navigationBarBackgroundColor: '#ffffff',
    enablePullDownRefresh: true, // 启用下拉刷新
  },
}
</route>

<script lang="ts" setup>
import { useCarStore } from '@/store/car'
import { httpGet } from '@/utils/http'

const MapArrow = 'http://115.190.57.206/static/network/location.png'

const state = ref<'loading' | 'finished' | 'error'>('loading')
const time = ref<number>(Date.now()) // 单选日期（时间戳）
const hasMore = ref(true) // 是否还有更多数据
const carStore = useCarStore()
const page = ref(1) // 当前页码
const size = 20
const startDate = ref('')
const endDate = ref('')
// 仅允许最近3天（含今天）
const ONE_DAY = 24 * 60 * 60 * 1000
const maxDate = ref<number>(Date.now())
const minDate = ref<number>(Date.now() - 2 * ONE_DAY)
const stayingInfo = ref<any[]>([]) // 历史停留列表信息

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

// 获取历史停留数据
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
    const res = await httpGet(`/riding/ride/parking/history`, params) as any

    if (res.code === '200') {
      const data = res.data as { records?: any[], total?: number, current?: number, pages?: number }
      const records = data.records || []

      if (isRefresh) {
        // 刷新时替换数据
        stayingInfo.value = records
      }
      else {
        // 加载更多时追加数据
        stayingInfo.value = [...stayingInfo.value, ...records]
      }

      // 判断是否还有更多数据
      if (stayingInfo.value.length === data.total) {
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
      console.error('获取历史停留数据失败', res.message)
      state.value = 'error'
      uni.showToast({
        title: res.message || '获取数据失败',
        icon: 'none',
      })
    }
  }
  catch (error) {
    console.error('获取历史停留数据失败', error)
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

function timeFormat(timestamp: number) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 格式化日期显示（YYYY年MM月DD日）
function formatDate(dateStr: string) {
  if (!dateStr)
    return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}年${month}月${day}日`
}

// 日期确定事件
function handleConfirm({ value }) {
  // 单选日期：起止同一天
  const ts = Array.isArray(value) ? value[0] : value
  startDate.value = timeFormat(ts)
  endDate.value = timeFormat(ts)
  // 切换日期时重置列表
  stayingInfo.value = []
  page.value = 1
  hasMore.value = true
  getTrackInfo(true)
}

function goHistoryInfo(item: any) {
  uni.navigateTo({
    url: `/pages-network/history-info/index?rideId=${item.parkingId}`,
  })
}
</script>

<template>
  <view class="track-detail">
    <!-- 列表内容 -->
    <view v-if="stayingInfo.length > 0" class="list-container">
      <view class="card">
        <view
          v-for="(item, index) in stayingInfo"
          :key="item.id || index"
          class="card-item box-border h-80rpx flex items-center justify-between px-29rpx"
          @click="goHistoryInfo(item)"
        >
          <view class="flex items-center">
            <image
              class="mr-29rpx h-30rpx w-25rpx"
              :src="MapArrow"
              mode="scaleToFill"
            />
            <view class="address-text">
              {{ item.address || '地址信息未知' }}
            </view>
          </view>
          <view>
            <wd-icon name="arrow-right" size="20px" color="#C8C8C8" />
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

  .list-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

 .empty-state {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items:center;
    background: #FFFFFF;
  }

  .card{
    width: 710rpx;
    background: #FFFFFF;
    border-radius: 20rpx;

    .address-text {
      max-width: 500rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

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
    margin-top: 98rpx;
  }
}
</style>
