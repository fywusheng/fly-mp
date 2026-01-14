<script setup lang="ts">
import { useCarStore } from '@/store'
import { httpGet, httpPost } from '@/utils/http'
import { getImageUrl } from '@/utils/image'

defineOptions({
  name: 'Infor',
})
const props = defineProps({
  tabName: {
    type: String,
  },
})

const BgIcon = getImageUrl('/infor/bg.png')
const DataIcon = getImageUrl('/infor/data.png')
const HistoryIcon = getImageUrl('/infor/history.png')
const RightIcon = getImageUrl('/infor/right.png')
const RoundMileageIcon = getImageUrl('/infor/round-mileage.png')
const RoundTimeIcon = getImageUrl('/infor/round-time.png')
const TraceIcon = getImageUrl('/infor/track.png')
const DeviceIcon = getImageUrl('/infor/4g-device.png')
const DataAive = getImageUrl('/infor/4g-data-active.png')
const DataUnAive = getImageUrl('/infor/4g-data.png')
const DataNone = getImageUrl('/infor/4g-data-none.png')
const Gift = getImageUrl('/infor/gift.png')
const Effect = getImageUrl('/infor/effect.png')
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
  if (newVal === 'infor') {
    getRidingInfo(carStore.carInfo.id)
    getAuth()
  }
})

async function getAuth() {
  const vehicleId = carStore.carInfo.id
  const res = await httpGet(`/user/card/vehicles/${vehicleId}/cards/check`) as any
  if (res.code === '200') {
    hasPending.value = res.data.hasPending
    activeCard.value = res.data.activeCard || null
    // hasPending.value = false // 测试代码，始终显示待领取
    // activeCard.value.effective = false // 测试代码，始终显示未生效
  }
}
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
  if (!checkhasPending()) {
    return
  }
  uni.navigateTo({
    url: '/pages-network/history/index',
  })
}
// 去轨迹
function goTrace() {
  if (!checkhasPending()) {
    return
  }
  uni.navigateTo({
    url: '/pages-network/ride-trace/index',
  })
}

function goDrive() {
  if (!checkhasPending()) {
    return
  }
  uni.navigateTo({
    url: '/pages-network/drive-data/index',
  })
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
function handleConfirm() {
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
            :src="getBg()"
            mode="scaleToFill"
          />

          <view class="relative z-10 box-border h-100% w-100% px-21rpx pt-29rpx">
            <!-- 待领取 | 已失效 -->
            <view v-if="hasPending || !activeCard.effective" class="unclaimed" @click="getCard">
              {{ hasPending ? '待领取' : '去购买' }}
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
            <view class="mb-10rpx mt-6rpx h-4rpx w-60rpx bg-[#ffffff]" />
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
