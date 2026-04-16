<script lang="ts" setup>
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

// 筛选
const activeFilter = ref('全部时间')
const filterList = ref(['全部时间', '2026-03', '获取积分', '积分消费'])

// 积分列表数据
const list = ref([
  { desc: '获取积分里程8积分', points: 8, type: 1, time: '2026-03-28 13:00:59', balance: 10000 },
  { desc: '获取积分里程3积分', points: 3, type: 1, time: '2026-03-28 13:00:59', balance: 9992 },
  { desc: '商品兑换消费35积分', points: 35, type: 2, time: '2026-03-28 13:00:59', balance: 9954 },
  { desc: '获取积分里程8积分', points: 8, type: 1, time: '2026-03-28 13:00:59', balance: 9946 },
  { desc: '获取积分里程15积分', points: 15, type: 1, time: '2026-03-28 13:00:59', balance: 9931 },
  { desc: '获取积分里程8积分', points: 8, type: 1, time: '2026-03-28 13:00:59', balance: 9923 },
])

function handleClickLeft() {
  uni.navigateBack()
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
            <view class="text-30rpx text-[#333333]">当前积分</view>
          </view>
          <view class="text-80rpx text-[#52ACF9]">10000</view>
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
                <view
                  v-for="item in filterList"
                  :key="item"
                  class="filter-btn"
                  :class="{ active: activeFilter === item }"
                  @click="activeFilter = item"
                >
                  {{ item }}
                </view>
              </view>
            </view>

            <!-- 积分列表 -->
            <view class="detail-list">
              <view v-for="(item, index) in list" :key="index" class="detail-item">
                <view class="item-top">
                  <text class="item-desc">
                    {{ item.desc }}
                  </text>
                  <text
                    class="item-change"
                    :class="{ plus: item.type === 1, minus: item.type === 2 }"
                  >
                    {{ item.type === 1 ? '+' : '-' }}{{ item.points }}
                  </text>
                </view>
                <view class="item-bottom">
                  <text>{{ item.time }}</text>
                  <text>剩余积分: {{ item.balance }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 加载更多 -->
          <wd-loadmore custom-class="loadmore" state="loading" />
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
    gap: 100rpx;
    font-size: 30rpx;
    font-weight: 400;
    color: #333;
    margin-bottom: 30rpx;
    padding: 0 38rpx;
  }

  .detail-title .coin-icon {
    width: 44rpx;
    height: 44rpx;
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
