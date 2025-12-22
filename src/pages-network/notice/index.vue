<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '告警信息',
    navigationBarBackgroundColor: '#ffffff',
    enablePullDownRefresh: true, // 启用下拉刷新
  },
}
</route>

<script lang="ts" setup>
import { httpGet, httpPost } from '@/utils/http'

const state = ref<'loading' | 'finished' | 'error'>('loading')
const tabWithBadge = ref(0)
const tabsWithBadge = ref([
  {
    title: '全部消息',
    badgeProps: {
      modelValue: 0,
      max: 99,
      right: '-8px',
    },
  },
  {
    title: '消息通知',
    badgeProps: {
      modelValue: 0,
      max: 99,
      right: '-8px',
    },
  },
  {
    title: '车辆告警',
    badgeProps: {
      modelValue: 0,
      max: 99,
      right: '-8px',
    },
  },
])
const pageInfoList = ref<any[]>([])
// 设备编号
let deviceId = ''
// 分页参数
const pageNo = ref(1)
const pageSize = 20
const hasMore = ref(true) // 是否还有更多数据

interface AlarmSummary {
  all: number
  notice: number
  alarm: number
}

onLoad((e) => {
  deviceId = e.deviceId
  getNoticeCount(deviceId)
  getInfoList(deviceId, tabWithBadge.value)
})

// 下拉刷新
onPullDownRefresh(() => {
  refreshList()
})

// 上拉加载更多
onReachBottom(() => {
  loadMore()
})

// 获取告警统计信息
async function getNoticeCount(deviceId: string) {
  try {
    const res = await httpGet(`/device/v2/devices/${deviceId}/alarms/summary`)
    if (res.code === '200') {
      const data = res.data as AlarmSummary
      tabsWithBadge.value[0].badgeProps!.modelValue = data.all
      tabsWithBadge.value[1].badgeProps!.modelValue = data.notice
      tabsWithBadge.value[2].badgeProps!.modelValue = data.alarm
    }
    else {
      console.error('获取告警统计信息失败', res.message)
    }
  }
  catch (error) {
    console.error('获取告警统计信息失败', error)
  }
}

// 获取告警列表
async function getInfoList(deviceId: string, type = 0, isRefresh = false) {
  const types = ['all', 'notice', 'alarm']

  // 如果是刷新，重置分页
  if (isRefresh) {
    pageNo.value = 1
    hasMore.value = true
  }

  // 如果没有更多数据，不再请求
  if (!hasMore.value && !isRefresh) {
    state.value = 'finished'
    return
  }

  state.value = 'loading'

  try {
    const res = await httpGet(`/device/v2/devices/${deviceId}/alarms`, {
      bizType: types[type],
      pageNo: pageNo.value,
      pageSize,
    })

    if (res.code === '200') {
      const items = (res.data as { items?: any[] })?.items || []

      if (isRefresh) {
        // 刷新时替换数据
        pageInfoList.value = items
      }
      else {
        // 加载更多时追加数据
        pageInfoList.value = [...pageInfoList.value, ...items]
      }

      console.log('获取告警列表成功:', items)

      // 判断是否还有更多数据
      if (pageInfoList.value.length === res.data.total) {
        hasMore.value = false
        state.value = 'finished'
      }
      else {
        hasMore.value = true
        state.value = 'loading'
        pageNo.value++
      }

      // 停止下拉刷新动画
      if (isRefresh) {
        uni.stopPullDownRefresh()
      }
    }
    else {
      console.error('获取告警列表失败', res.message)
      state.value = 'error'
      uni.showToast({
        title: res.message || '获取数据失败',
        icon: 'none',
      })
    }
  }
  catch (error) {
    console.error('获取告警列表失败', error)
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
async function refreshList() {
  await getInfoList(deviceId, tabWithBadge.value, true)
  await getNoticeCount(deviceId)
}

// 加载更多
function loadMore() {
  if (state.value === 'finished' || !hasMore.value) {
    return
  }
  getInfoList(deviceId, tabWithBadge.value, false)
}

// 清除未读
async function clearUnread() {
  try {
    const res = await httpPost(`/device/v2/devices/${deviceId}/alarms/clear-unread`)
    if (res.code === '200') {
      console.log('清除未读成功:', res)
      uni.showToast({
        title: '已清除未读',
        icon: 'success',
      })
      // 重新获取统计信息和列表
      await refreshList()
    }
    else {
      console.error('清除未读失败', res.message)
      uni.showToast({
        title: res.message || '清除失败',
        icon: 'none',
      })
    }
  }
  catch (error) {
    console.error('清除未读失败', error)
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none',
    })
  }
}

// 切换标签
function handleChange({ index }: { index: number }) {
  console.log('handleChange', index)
  tabWithBadge.value = index
  // 切换标签时重置列表
  pageInfoList.value = []
  pageNo.value = 1
  hasMore.value = true
  getInfoList(deviceId, index, true)
}

// 去详情
async function goInfo(item: any) {
  // 如果已经是已读，直接跳转
  if (item.readStatus !== 0) {
    uni.navigateTo({
      url: `/pages-network/notice-info/index?info=${encodeURIComponent(JSON.stringify(item))}`,
    })
    return false
  }
  // 该信息设置为已读
  try {
    const res = await httpPost(`/device/v2/devices/${deviceId}/alarms/${item.id}/unread`)
    if (res.code === '200') {
      // 重新获取统计信息和列表
      await refreshList()
      uni.navigateTo({
        url: `/pages-network/notice-info/index?info=${encodeURIComponent(JSON.stringify(item))}`,
      })
    }
  }
  catch (error) {
    console.log(error)
  }
}
</script>

<template>
  <view class="track-detail">
    <wd-tabs v-model="tabWithBadge" custom-class="notice-tabs" @change="handleChange">
      <wd-tab
        v-for="(item, index) in tabsWithBadge"
        :key="index"
        :title="`${item.title}`"
        :badge-props="item.badgeProps"
      />
    </wd-tabs>

    <!-- 列表内容 -->
    <view v-if="pageInfoList.length > 0" class="list-container">
      <view v-for="(item, index) in pageInfoList" :key="index" class="card mt-20rpx">
        <view class="card-item box-border h-80rpx flex items-center justify-between px-29rpx" @click="goInfo(item)">
          <view class="flex items-center">
            <view>{{ item.time }}  {{ item.title }}</view>
          </view>
          <view v-if="item.readStatus === 0" class="tips" />
        </view>
        <view class="card-item box-border h-80rpx flex items-center justify-between px-29rpx" @click="goInfo(item)">
          <view class="flex items-center">
            <view>{{ item.content }}</view>
          </view>
          <view>
            <wd-icon name="arrow-right" size="20px" color="#333333" />
          </view>
        </view>
      </view>

      <!-- 加载更多状态 -->
      <wd-loadmore custom-class="loadmore" :state="state" />
    </view>

    <!-- 空状态 -->
    <view v-else-if="state !== 'loading'" class="empty-state">
      <text>暂无告警信息</text>
    </view>

    <!-- 清除未读按钮 -->
    <view class="sub-btn" @click="clearUnread">
      <wd-icon name="clear" size="22px" />
      <view>清除未读</view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.track-detail {
  width: 100vw;
  min-height: 100vh;
  position: relative;
  background-color: #DDE3EC;
  padding-top: 20rpx;
  padding-bottom: 180rpx; // 增加底部间距，避免被按钮遮挡
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
    padding: 200rpx 0;
    text-align: center;
    color: #999;
    font-size: 28rpx;
  }

  .card {
    width: 710rpx;
    background: #FFFFFF;
    border-radius: 20rpx;

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
      &:last-child {
        &::before {
          height: 0;
        }
      }
      .tips {
        width: 40rpx;
        height: 40rpx;
        border-radius: 50%;
        background-color:  #fa4350;
      }
    }
  }

  .sub-btn {
    background-color: #239AF6;
    width: 240rpx;
    height: 80rpx;
    border-radius: 40rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #FFFFFF;
    font-size: 24rpx;
    margin-top: 28rpx;
    position: fixed;
    bottom: 80rpx;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
  }

  .loadmore {
    margin-top: 20rpx;
    margin-bottom: 20rpx;
  }

  :deep() {
    .wd-tabs.notice-tabs {
      background: #DDE3EC !important;
      .wd-tabs__nav {
        background: #DDE3EC !important;
      }
      // .wd-badge__content {
      //   background-color: #FCAB2A;
      //   border:none;
      //   width: 40rpx;
      //   height: 40rpx;
      //   border-radius: 50%;
      //   padding: 0;
      //   display: flex;
      //   justify-content: center;
      //   align-items: center;
      // }
    }
  }
}
</style>
