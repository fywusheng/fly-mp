<script setup lang="ts">
import { useCarStore } from '@/store'
import { httpGet, httpPost } from '@/utils/http'
import { getImageUrl } from '@/utils/image'
import HomeAdBanner from '../com-components/HomeAdBanner.vue'

defineOptions({
  name: 'Infor',
})
const props = defineProps({
  tabName: {
    type: String,
  },
})

interface IPermission {
  isOwner: boolean
  isMember: boolean
  memberId: number
  permissionLevel: number
  canViewLocation: number
  canViewRideTrack: number
  canViewHistoryStay: number
  canViewDriveData: number
}

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
const SmartServiceIcon = getImageUrl('/infor/smartServices.png')
const NearbyStoreIcon = getImageUrl('/infor/nearbyStores.png')
const TheftReportIcon = getImageUrl('/infor/theftReport.png')
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

const permissions = ref<IPermission>({
  isOwner: false, // 是否车主
  isMember: false, // 是否成员
  memberId: 0,
  permissionLevel: 0,
  canViewLocation: 0, // 是否可查看车辆位置
  canViewRideTrack: 0, // 是否可查看骑行记录
  canViewHistoryStay: 0, // 是否可查看历史停留
  canViewDriveData: 0, // 是否可查看行驶数据
})

// 车主服务
const onwerServices = ref<any[]>([
  {
    name: '智能服务',
    icon: SmartServiceIcon,
  },
  {
    name: '附近门店',
    icon: NearbyStoreIcon,
  },
  {
    name: '失窃上报',
    icon: TheftReportIcon,
  },
])

const adList = ref<any[]>([])

watch(() => props.tabName, (newVal) => {
  if (newVal === 'infor') {
    getRidingInfo(carStore.carInfo.id)
    getAuth()
    getAdList()
    getPermission()
  }
})

// 获取用户查看权限
async function getPermission() {
  const vehicleId = carStore.carInfo.id

  const res = await httpGet<IPermission> (`/user/mini/vehicle-share/members/permission/${vehicleId}`)
  if (res.code === '200') {
    permissions.value = res.data
  }
}

async function getAdList() {
  try {
    const res = await httpGet(`/common/advertisement/list`, {
      adPosition: 'DATA',
    })
    if (res.code === '200') {
      adList.value = res.data as any[]
    }
  }
  catch (err) {
    console.error('获取广告列表失败', err)
  }
}

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

// 去历史停留
function goHistory() {
  if (!checkhasPending('canViewHistoryStay')) {
    return
  }
  uni.navigateTo({
    url: '/pages-network/history/index',
  })
}
// 去轨迹
function goTrace() {
  if (!checkhasPending('canViewRideTrack')) {
    return
  }
  uni.navigateTo({
    url: '/pages-network/ride-trace/index',
  })
}
// 去行驶数据
function goDrive() {
  if (!checkhasPending('canViewDriveData')) {
    return
  }
  uni.navigateTo({
    url: '/pages-network/drive-data/index',
  })
}

function checkhasPending(permission: 'canViewLocation' | 'canViewRideTrack' | 'canViewHistoryStay' | 'canViewDriveData') {
  // 车主的话需要会员
  if (permissions.value.isOwner) {
    if (!permissions.value.isMember) {
      messageId.value = 3
      showCancelBtn.value = true
      message.value = '开通会员可查看'
      showMessagePopup.value = true
      return false
    }
  }
  else {
    // 成员的话校验对应权限
    if (!permissions.value[permission]) {
      messageId.value = 3
      showCancelBtn.value = true
      message.value = '开通会员可查看'
      showMessagePopup.value = true
      return false
    }
  }

  return true
}

// 提示弹窗确认
function handleConfirm() {
  if (messageId.value === 3) {
    uni.navigateTo({
      url: '/pages-network/smart-service/index',
    })
  }
  showMessagePopup.value = false
}

function handleCancel() {
  showMessagePopup.value = false
}

// 车主服务
function goService(name: string) {
  if (name === '智能服务') {
    uni.navigateTo({
      url: '/pages-network/smart-service/index',
    })
  }
  else if (name === '附近门店') {
    uni.navigateTo({
      url: '/pages-network/nearby-stores/index',
    })
  }
  else if (name === '失窃上报') {
    uni.navigateTo({
      url: '/pages-network/theft-report-desc/index',
    })
  }
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

    <!-- 车主服务 -->
    <view class="ml-20rpx mt-20rpx box-border w-710rpx rounded-8rpx bg-white px-20rpx pb-9rpx pt-19rpx">
      <view class="mb-11rpx text-30rpx text-[#333333] font-bold">
        车主服务
      </view>
      <view class="mb-30rpx mt-20rpx w-100% flex items-center justify-between">
        <image
          v-for="item in onwerServices" :key="item.name"
          class="h-184rpx w-200rpx"
          :src="item.icon"
          mode="scaleToFill"
          @click="goService(item.name)"
        />
      </view>
    </view>

    <!-- 广告位 -->
    <HomeAdBanner
      layout="vertical"
      item-width="345rpx"
      item-height="190rpx"
      :columns="2"
      :list="adList"
    />

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
