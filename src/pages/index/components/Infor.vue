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
const DeviceIcon = 'http://115.190.57.206/static/infor/4g-device.png'
const DataAive = 'http://115.190.57.206/static/infor/4g-data-active.png'
const DataUnAive = 'http://115.190.57.206/static/infor/4g-data.png'
const DataNone = 'http://115.190.57.206/static/infor/4g-data-none.png'
const Effect = 'http://115.190.57.206/static/infor/effect.png'
const carStore = useCarStore()
const dailyStats = ref<any>({
  totalRidingTime: '00:00:00',
  totalDistanceKm: '0.00',
})

// message弹窗
const showMessagePopup = ref(false) // 控制弹窗显示
const messageId = ref<number>(0) // 弹窗ID
const message = ref<string>('<view >删除该成员后，</view> <view >他将不能使用此设备。</view>') // 弹窗内容
const duration = ref(0) // 弹窗持续时间
const confirmText = ref<string>('确定') // 确认按钮文本
const showCancelBtn = ref(true) // 是否显示取消按钮
const showConfirmBtn = ref(true) // 是否显示确认按钮
const closeOnClickModal = ref(true) // 是否点击蒙层关闭弹窗

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

// 领取数据服务体验卡
function getCard() {
  messageId.value = 1
  message.value = '您有一张数据服务体验卡待领取'
  showMessagePopup.value = true
}
function handleConfirm() {
  if(messageId.value === 1){
    console.log('领取数据服务体验卡')
  }
}
function handleCancel() {
  showMessagePopup.value = false
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
    <!-- 骑行卡 -->
    <view class="ml-20rpx mt-20rpx box-border w-710rpx rounded-8rpx bg-white px-20rpx pb-9rpx pt-19rpx">
      <view class="mb-11rpx text-30rpx text-[#333333] font-bold">
        车主服务
      </view>
      <view class="w-100% flex items-center justify-between">
        <image
          class="h-180rpx w-325rpx"
          :src="DeviceIcon"
          mode="scaleToFill"
        />
        <view class="relative h-180rpx w-325rpx">
          <image
            class="absolute left-0 top-0 h-100% w-100%"
            :src="DataAive"
            mode="scaleToFill"
          />
           <!-- <image
            class="absolute left-0 top-0 h-100% w-100%"
            :src="DataUnAive"
            mode="scaleToFill"
          /> -->

          <view class="relative z-10 box-border h-100% w-100% px-21rpx pt-29rpx">
            <view class="unclaimed" @click="getCard">
              去领取
            </view>
            <!-- 生效中 -->
            <!-- <image
                class="effect"
                :src="Effect"
                mode="scaleToFill"
            /> -->
            <view class="text-24rpx text-[#ffffff]">
              数据服务体验卡
            </view>
            <view class="mb-10rpx mt-6rpx h-4rpx w-60rpx bg-[#ffffff]" />
            <view class="mb-9rpx text-18rpx text-[#275C4E]">
              可查询骑行轨迹/停车位置/行驶数据 全国可用
            </view>
            <view class="h-24rpx w-180rpx flex items-center justify-center rounded-20rpx bg-[#2CBC7B] text-14rpx text-[#ffffff]">
              有效期至2026-03-31
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
    <fg-message v-model:show="showMessagePopup" :duration="duration" :confirm-text="confirmText" :show-cancel-btn="showCancelBtn" :show-confirm-btn="showConfirmBtn" :close-on-click-modal="closeOnClickModal" :message="message" :message-id="messageId" @cancel="handleCancel" @confirm="handleConfirm" />
  </view>
</template>

<style lang="scss" scoped>
.infor {
  background: #F2F4F6;
  position: relative;
  padding-bottom: 28rpx;
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
  
}
</style>
