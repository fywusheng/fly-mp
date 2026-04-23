<script lang="ts" setup>
import dayjs from 'dayjs'
import { computed, ref } from 'vue'
import { httpGet } from '@/utils/http'
import { getImageUrl } from '@/utils/image'

defineOptions({
  name: 'PointsDetails',
})

const PointsDetailsBgIcon = getImageUrl('/mine/point-details-bg.png')
const PointsDetailsIcon = getImageUrl('/mine/point-details.png')
const PointsDetailsNowIcon = getImageUrl('/mine/point-now.png')

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '积分明细',
  },
})

// 筛选状态
const activeFilterIndex = ref(0)
const monthValue = ref<number>(new Date().getTime())
const showMonth = computed(() => dayjs(monthValue.value).format('YYYY-MM'))

const currentPoints = ref(0)

// 列表分页状态
const list = ref<any[]>([])
const pageNum = ref(1)
const pageSize = ref(20)
const total = ref(0)
const loadmoreState = ref<'loading' | 'finished' | 'error'>('loading')

interface PointOverview {
  points: number
  userId?: number
  nickname?: string
  avatar?: string
  memberLevel?: string
}

// 获取当前积分
async function fetchOverview() {
  try {
    const res = await httpGet<PointOverview>('/user/mini/points/my')
    if (res.code === '200' && res.data) {
      currentPoints.value = res.data.points || 0
    }
  }
  catch (e) {
    console.error('获取积分概览失败', e)
  }
}

interface PointsLog {
  id: number
  userId: number
  changeType: string
  points: number
  rideKm?: number
  remark: string
  createdAt: string
}

interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
}

// 获取积分明细列表
async function loadData(reset = false) {
  if (reset) {
    pageNum.value = 1
    list.value = []
    loadmoreState.value = 'loading'
  }

  if (loadmoreState.value === 'finished' && !reset)
    return

  try {
    loadmoreState.value = 'loading'
    const query: any = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    }

    if (activeFilterIndex.value === 1) {
      query.date = showMonth.value // 如果后端支持按月筛选
    }
    else if (activeFilterIndex.value === 0) {
      query.date = ''
    }
    else if (activeFilterIndex.value === 2) {
      query.pointsType = 'EARN'
    }
    else if (activeFilterIndex.value === 3) {
      query.changeType = 'CONSUME'
    }

    const res = await httpGet<PageResult<PointsLog>>('/user/mini/points/detail', query)

    if (res.code === '200') {
      const records = res.data?.records || []
      total.value = res.data?.total || 0

      if (reset) {
        list.value = records
      }
      else {
        list.value = [...list.value, ...records]
      }

      if (list.value.length >= total.value || records.length < pageSize.value) {
        loadmoreState.value = 'finished'
      }
      else {
        loadmoreState.value = 'loading'
      }
    }
    else {
      loadmoreState.value = 'error'
    }
  }
  catch (err) {
    console.error(err)
    loadmoreState.value = 'error'
  }
}

onLoad(() => {
  fetchOverview()
  loadData(true)
})

onReachBottom(() => {
  if (loadmoreState.value === 'finished')
    return
  pageNum.value += 1
  loadData()
})

function handleClickLeft() {
  uni.navigateBack()
}

function handleFilterClick(index: number) {
  if (activeFilterIndex.value === index)
    return
  activeFilterIndex.value = index
  loadData(true)
}

function handleConfirm({ value }: { value: number }) {
  monthValue.value = value
  activeFilterIndex.value = 1
  loadData(true)
}
</script>

<template>
  <view class="point-details">
    <wd-navbar
      title="积分明细"
      left-arrow
      :safe-area-inset-top="true"
      fixed
      custom-style="background-color: transparent !important;"
      @click-left="handleClickLeft"
    />
    <!-- 背景图 -->
    <image class="absolute left-0 top-0 w-100%" :src="PointsDetailsBgIcon" mode="widthFix" />
    <!-- 当前积分  -->
    <view class="relative z-10">
      <view>
        <view class="box-border h-460rpx pl-55rpx pt-225rpx">
          <view class="flex items-center">
            <image
              class="mr-11rpx h-44rpx w-44rpx"
              :src="PointsDetailsNowIcon"
              mode="scaleToFill"
            />
            <view class="text-30rpx text-[#333333]">
              当前积分
            </view>
          </view>
          <view class="text-80rpx text-[#52ACF9]">
            {{ currentPoints }}
          </view>
        </view>
        <!-- 积分明细 -->
        <view>
          <!-- 积分明细卡片 -->
          <view class="detail-card">
            <view class="detail-title">
              <image class="coin-icon" :src="PointsDetailsIcon" mode="scaleToFill" />
              <text>积分明细</text>
            </view>

            <!-- 筛选栏 -->
            <view class="filter-bar-box">
              <view class="filter-bar">
                <view v-for="(item, index) in ['全部时间', '月份', '获取积分', '积分消费']" :key="index">
                  <view
                    v-if="index !== 1"
                    class="filter-btn"
                    :class="{ active: activeFilterIndex === index }"
                    @click="handleFilterClick(index)"
                  >
                    {{ item }}
                  </view>
                  <wd-calendar v-else v-model="monthValue" type="month" label="日期选择" @confirm="handleConfirm">
                    <view
                      class="filter-btn"
                      :class="{ active: activeFilterIndex === index }"
                    >
                      {{ showMonth }}
                    </view>
                  </wd-calendar>
                </view>
              </view>
            </view>

            <!-- 积分列表 -->
            <view class="detail-list">
              <view v-for="(item, index) in list" :key="index" class="detail-item">
                <view class="item-top">
                  <text class="item-desc">
                    {{ item.remark }}
                  </text>
                  <text
                    class="item-change"
                    :class="{ plus: item.points > 0, minus: item.points <= 0 }"
                  >
                    {{ item.points > 0 ? '+' : '' }}{{ item.points }}
                  </text>
                </view>
                <view class="item-bottom">
                  <text>{{ item.createdAt }}</text>
                </view>
              </view>
            </view>
            <!-- 加载更多 -->
            <wd-loadmore v-if="list.length > 0" custom-class="loadmore" :state="loadmoreState" @reload="loadData" />
            <!-- 空白 -->
            <view v-else class="h-600rpx w-100% bg-white">
              <wd-status-tip image="https://wot-ui.cn/assets/search.png" tip="当前搜索无结果" />
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.point-details {
  height: 100vh;
  background: #f1f1f1;
  position: relative;

  .detail-card {
    background: #fff;
    border-radius: 20rpx;
    margin: 0 20rpx 20rpx;
    padding: 25rpx 0;
    position: relative;
    z-index: 1;
  }

  .detail-title {
    display: flex;
    align-items: center;
    font-size: 30rpx;
    font-weight: 400;
    color: #333;
    margin-bottom: 30rpx;
    padding: 0 38rpx;
  }

  .detail-title .coin-icon {
    width: 44rpx;
    height: 44rpx;
    margin-right: 11rpx;
  }

  .filter-bar-box {
    width: 711rpx;
    overflow: hidden;
  }

  .filter-bar {
    display: flex;
    gap: 20rpx;
    margin-bottom: 30rpx;
    flex-wrap: nowrap;
    padding: 0 38rpx;
    overflow-x: auto;
    flex-shrink: 1;
    white-space: nowrap;
  }

  .filter-btn {
   padding: 4rpx 8rpx;
   border: 2rpx #e3e3e3 solid;
   background: #ffffff;
   color: #6E6E6E;
   font-weight: 500;
   border-radius: 12rpx;
  }

  .filter-btn.active {
    border-color: #40a9ff;
    background: #e6f7ff;
    color: #40a9ff;
    font-weight: 500;
  }

  .detail-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    padding: 30rpx 42rpx;
    border-bottom: 2rpx solid #f0f0f0;
    &:first-child {
      border-top: 2rpx solid #f0f0f0;
    }
  }

  .detail-item:last-child {
    border-bottom: 0 !important;
    padding-bottom: 0;
  }

  .item-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .item-desc {
    font-size: 24rpx;
    font-weight: 400;
    color: #333;
  }

  .item-change {
    font-size: 36rpx;
    font-weight: 500;
  }

  .item-change.plus {
    color: #df0615;
  }

  .item-change.minus {
    color: #6e6e6e;
  }

  .item-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 22rpx;
    color: #6e6e6e;
  }
}
:deep() {
  .wd-navbar.is-border::after {
    height: 0;
  }
}
</style>
