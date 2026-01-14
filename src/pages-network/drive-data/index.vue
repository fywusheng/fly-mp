<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '行驶数据',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
import { useCarStore } from '@/store/car'
import { httpGet } from '@/utils/http'

const carStore = useCarStore()
const tabs = ['日', '周', '月']
const periodType = ref(0) // 统计周期类型 0-日 1-周 2-月
const chartData = ref()
const opts = ref({
  color: ['#2CBC7B'],
  legend: { show: false },
})
// 我的总里程统计
const cumulativeStats = ref({
  totalTrips: 0,
  totalRidingMinutes: 0,
  companionshipDays: 0,
  totalDistanceKm: 0.0,
  ageLabel: '',
  vehicleImageUrl: '',
  totalCarbonReduction: 0,
})
// 今日骑行统计
const dailyStats = ref({
  tripSegments: 0,
  totalRidingTime: 0,
  maxSpeed: 0.0,
  totalDistanceKm: 0.0,
  carbonReduction: 0,
})

onLoad((e) => {
  // 获取骑行统计
  getTrackInfo()
  // 获取图表数据
  getChartData()
})

// 获取图表数据
async function getChartData() {
  const periodTypes = ['day', 'week', 'month']
  try {
    const res = await httpGet(`/riding/dashboard/mileage-chart`, {
      vehicleId: carStore.carInfo.id,
      periodType: periodTypes[periodType.value],
    }) as any
    if (res.code === '200') {
      console.log('获取图表数据:', res.data)
      chartData.value = res.data
    }
    else {
      console.error('获取图表数据失败', res.message)
    }
  }
  catch (error) {
    console.error('获取图表数据失败', error)
  }
  // 模拟从服务器获取数据时的延时
  // setTimeout(() => {
  //   let res = {
  //     categories: ['2016', '2017', '2018', '2019', '2020', '2021'],
  //     series: [
  //       {
  //         name: '目标值',
  //         data: [35, 36, 31, 33, 13, 34],
  //         itemStyle: {
  //           color: '#333333',
  //         },
  //       },
  //       // {
  //       //   name: '完成量',
  //       //   data: [18, 27, 21, 24, 6, 28],
  //       // },
  //     ],
  //   }
  //   chartData.value = JSON.parse(JSON.stringify(res))
  // }, 500)
}

// 获取骑行统计
async function getTrackInfo() {
  try {
    const res = await httpGet(`/riding/dashboard/riding`, {
      vehicleId: carStore.carInfo.id,
    }) as any
    if (res.code === '200') {
      console.log('轨迹详情:', res.data)
      cumulativeStats.value = res.data.cumulativeStats
      dailyStats.value = res.data.dailyStats
    }
    else {
      console.error('获取轨迹信息失败', res.message)
    }
  }
  catch (error) {
    console.error('获取轨迹信息失败', error)
  }
}
// 切换tab
function changeTab(index: number) {
  periodType.value = index
  // 获取图表数据
  getChartData()
}

// 跳转全部行程
function goAllDrive() {
  uni.navigateTo({
    url: '/pages-network/ride-trace/index',
  })
}
</script>

<template>
  <view class="track-detail">
    <view class="card">
      <view class="card-item p-29rpx">
        <view class="text-24rpx text-[#333333]">
          我的总里程
        </view>
        <view class="mb-48rpx flex items-center justify-between">
          <view calss="text-30rpx font-bold" style="font-family: Microsoft YaHei;">
            {{ cumulativeStats.totalDistanceKm }} KM
          </view>
          <view class="look-btn" @click="goAllDrive">
            全部行程
          </view>
        </view>
        <view class="flex items-center justify-between text-24rpx text-[#333333]">
          <view>
            <view>累计出行</view>
            <view class="flex items-center">
              <view class="text-36rpx font-bold">
                {{ cumulativeStats.totalTrips }}
              </view>
              <view>次</view>
            </view>
          </view>
          <view>
            <view>陪伴时间</view>
            <view class="flex items-center">
              <view class="text-36rpx font-bold">
                {{ cumulativeStats.companionshipDays }}
              </view>
              <view>天</view>
            </view>
          </view>
          <view>
            <view>减少碳排量</view>
            <view class="flex items-center">
              <view class="text-36rpx font-bold">
                {{ cumulativeStats.totalCarbonReduction || 0 }}
              </view>
              <view>g</view>
            </view>
          </view>
        </view>
      </view>
      <view class="card-item p-29rpx">
        <view class="text-24rpx text-[#333333]">
          骑行里程统计
        </view>
        <view class="flex items-center justify-between px-178rpx py-37rpx">
          <view v-for="(tab, index) in tabs" :key="tab" class="normal" :class="index === periodType ? 'active' : ''" @click="changeTab(index)">
            {{ tab }}
          </view>
        </view>
        <view>
          <qiun-data-charts type="column" :chart-data="chartData" :opts="opts" :canvas2d="true" />
        </view>
      </view>
      <view class="card-item p-29rpx">
        <view class="mb-48rpx text-24rpx text-[#333333]">
          今日骑行数据
        </view>

        <view class="flex items-center justify-between text-24rpx text-[#333333]">
          <view>
            <view>骑行里程</view>
            <view class="flex items-center">
              <view class="text-36rpx font-bold">
                {{ dailyStats.totalDistanceKm }}
              </view>
              <view>km</view>
            </view>
          </view>
          <view>
            <view>总耗时</view>
            <view class="flex items-center">
              <view class="text-36rpx font-bold">
                {{ (dailyStats.totalRidingTime / 60).toFixed(2) }}
              </view>
              <view>h</view>
            </view>
          </view>
          <view>
            <view>减少碳排量</view>
            <view class="flex items-center">
              <view class="text-36rpx font-bold">
                {{ dailyStats.carbonReduction || 0 }}
              </view>
              <view>g</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.track-detail {
  width: 100vw;
  height: 100vh;
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
    .normal {
      width: 50rpx;
      height: 50rpx;
      border: 2rpx solid #6E6E6E;
      color: #333333;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 24rpx;
      &.active {
        color: #2CBC7B;
        border: 2rpx solid #2CBC7B;
      }
    }
  }
  .sub-btn {
    background-color: #239AF6;
    width: 710rpx;
    height: 80rpx;
    border-radius: 40rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #FFFFFF;
    font-size: 24rpx;
    margin-top: 98rpx;
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
}
</style>
