<script lang="ts" setup>
import type { MemberBenefit } from '@/api/member'
import dayjs from 'dayjs'
import { getMemberBenefits } from '@/api/member'
import { useUserStore } from '@/store'
import { getImageUrl } from '@/utils/image'

defineOptions({
  name: 'SmartService',
})

definePage({
  layout: 'tabbar',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '智能服务',
    backgroundColor: '#6EA6F6',
  },
  type: 'home',
})

const userStore = useUserStore()
const CarIcon = getImageUrl('/network/car.png')
const MemberIcon = getImageUrl('/network/member.png')
const MemberNoIcon = getImageUrl('/network/member-none.png')

const BluetoothLockIcon = getImageUrl('/network/bluetooth-lock.png')
const ArmDisArmIcon = getImageUrl('/network/arm-disarm.png')
const MuteIcon = getImageUrl('/network/mute.png')
const InductionControlIcon = getImageUrl('/network/induction-control.png')
const FindCarIcon = getImageUrl('/network/find-car.png')
const WeatherForecastIcon = getImageUrl('/network/weather-forecast.png')

const benefitList = ref<MemberBenefit[]>([])
const loadingBenefits = ref(false)

const freeList = ref<any[]>([
  {
    icon: BluetoothLockIcon,
    title: '蓝牙开关车',
  },
  {
    icon: ArmDisArmIcon,
    title: '解防/设防',
  },
  {
    icon: MuteIcon,
    title: '一键静音',
  },
  {
    icon: InductionControlIcon,
    title: '感应控车',
  },
  {
    icon: FindCarIcon,
    title: '鸣笛寻车',
  },
  {
    icon: WeatherForecastIcon,
    title: '天气预报',
  },
])

// 有会员：true 未开通：false
const hasMember = ref(false)

// message弹窗
const showMessagePopup = ref(false) // 控制弹窗显示
const messageId = ref<number>(0) // 弹窗ID
const duration = ref(0) // 弹窗持续时间
const title = ref('') // 弹窗标题
const messageContent = ref<string>('') // 弹窗内容
const showCancelBtn = ref(false) // 是否显示取消按钮
const showConfirmBtn = ref(true) // 是否显示确认按钮
const confirmText = ref('确定') // 确认按钮文本
const closeOnClickModal = ref(true) // 是否点击蒙层关闭弹窗

function getBenefitIcon(item: MemberBenefit) {
  return userStore.isMemberVip ? item.activeIcon || CarIcon : item.inactiveIcon || CarIcon
}

async function fetchMemberBenefits() {
  try {
    loadingBenefits.value = true
    const res = await getMemberBenefits({ deviceType: '4G' })
    if (res.code === '200') {
      benefitList.value = (res.data || [])
        .filter(item => item.status !== 'DISABLED')
        .sort((prev, next) => (prev.sortOrder || 0) - (next.sortOrder || 0))
    }
  }
  catch (error) {
    console.error('获取会员权益失败', error)
  }
  finally {
    loadingBenefits.value = false
  }
}

function handleSmartServiceFee() {
  console.log('智能服务费')
  title.value = '智能服务费是什么?'
  messageContent.value = `
  <div style="text-align: left;">
     智能服务费是车端物联网卡的流量费、云数据存储等费用的总称(车端物联网卡和我们手机的sim卡一样，如果要使用移动网络需要支付流量费用)。
    <br> 1、目前小程序控车的很多功能需要依赖车端连网，比如车辆报警、家庭账号等，其他功能详见智能服务栏目一[专享服务]的内容介绍。
    <br> 2、云端数据库会记录车辆骑行数据、电池数据、告警信息等相关数据等，方便骑行轨迹记录&分享、车辆防盗&报警、车辆电池服务管理，以及后续能够更精准地为用户进行售后问题分析、服务体验改善等。(备注:车辆数据为飞鸽畅行用户机密，仅用于为您提供必要的功能/服务，飞鸽畅行会遵循用户隐私协议和相关法律法规等要求
    。
  </div>
  `
  messageId.value = 1
  showMessagePopup.value = true
}
function handleSmartServiceFeeFreePeriod() {
  console.log('智能服务费免费期限')
  title.value = '智能服务费免费期限?'
  messageContent.value = '<div style="text-align: left;">目前飞鸽电动全系车型自激活起，赠送为期一年的车辆智能服务体验，服务到期后需要在APP进行续费。否则将无法继续使用智能服务相关功能。</div>'
  messageId.value = 1
  showMessagePopup.value = true
}
function handleSmartServiceFeeExpired() {
  title.value = '智能服务费过期有什么影响?'
  messageContent.value = '<div style="text-align: left;">智能服务卡影响的只有依赖于网络和云端数据服务的功能。对依赖于车端传感器和车端蓝牙服务功能：蓝牙开关锁、解防/设防、一键静音、感应控车、鸣笛寻车、天气预报等功能，仍能继续使用。</div>'
  messageId.value = 1
  showMessagePopup.value = true
}

function handleCancel() {
  showMessagePopup.value = false
}
function handleConfirm() {
  showMessagePopup.value = false
}
// 开通/续费
function handleSubmit() {
  uni.navigateTo({
    url: '/pages-network/smart-service-open/index',
  })
}
// 导航返回
function handleClickLeft() {
  uni.navigateBack()
}

onLoad(() => {
  fetchMemberBenefits()
})
</script>

<template>
  <view class="smart-service">
    <wd-navbar title="智能服务" :safe-area-inset-top="true" left-arrow placeholder fixed custom-style="background-color: transparent !important;" @click-left="handleClickLeft" />
    <view class="bg" />
    <view class="content">
      <!-- 会员状态 -->
      <view class="relative h-260rpx w-600rpx flex">
        <image
          class="absolute left-0 top-0 h-full w-full"
          :src="userStore.isMemberVip ? MemberIcon : MemberNoIcon"
          mode="scaleToFill"
        />
        <image
          class="relative z-10 ml-30rpx mt-91rpx h-110rpx w-110rpx"
          :src="CarIcon"
          mode="scaleToFill"
        />
        <view class="relative z-10 ml-20rpx mt-113rpx">
          <view class="mb-16rpx text-30rpx text-[#333333] font-bold">
            {{ userStore.userInfo.nickname }}
          </view>
          <view class="mb-10rpx text-22rpx text-[#666666]">
            {{ userStore.isMemberVip ? `服务有效期${userStore.userInfo.serviceExpireTime}` : '未开通' }}
          </view>
          <view v-if="userStore.isMemberVip" class="expired-label">
            距离服务到期还有{{ dayjs(userStore.userInfo.serviceExpireTime).diff(dayjs(), 'day') }}天
          </view>
        </view>
      </view>
      <!-- 智能服务 -->
      <view class="w-710rpx px-20rpx">
        <fg-card title="智能服务">
          <view>
            <view v-if="loadingBenefits" class="benefit-empty">
              服务加载中...
            </view>
            <view v-else-if="!benefitList.length" class="benefit-empty">
              暂无智能服务
            </view>
            <view v-for="item in benefitList" :key="item.id" class="mb-60rpx flex">
              <image
                class="mr-20rpx h-44rpx w-44rpx"
                :src="getBenefitIcon(item)"
                mode="scaleToFill"
              />
              <view class="text-24rpx">
                <view class="mb-9rpx text-[#333333]">
                  {{ item.displayName || item.benefitName }}
                </view>
                <view class="text-[#6E6E6E]">
                  {{ item.description }}
                </view>
              </view>
            </view>
          </view>
        </fg-card>
      </view>
      <!-- 免费服务 -->
      <view class="mt-20rpx w-710rpx px-20rpx">
        <fg-card title="免费服务">
          <view class="grid-container">
            <view v-for="item in freeList" :key="item.title" class="flex flex-col items-center justify-center">
              <image
                class="h-90rpx w-90rpx"
                :src="item.icon"
                mode="scaleToFill"
              />
              <view>{{ item.title }}</view>
            </view>
          </view>
        </fg-card>
      </view>
      <!-- 智能服务费相关问题 -->
      <view
        class="w-710rpx"
      >
        <view class="mt-20rpx overflow-hidden rounded-[10px]">
          <wd-cell title="智能服务费是什么?" is-link @click="handleSmartServiceFee" />
        </view>

        <view class="mt-20rpx overflow-hidden rounded-[10px]">
          <wd-cell title="智能服务费免费期限?" is-link @click="handleSmartServiceFeeFreePeriod" />
        </view>

        <view class="mt-20rpx overflow-hidden rounded-[10px]">
          <wd-cell title="智能服务费过期有什么影响?" is-link @click="handleSmartServiceFeeExpired" />
        </view>
      </view>
      <!-- 按钮 -->
      <view class="submit-btn" @click="handleSubmit">
        {{ hasMember ? '续 费' : '开 通' }}
      </view>
      <!--  -->
    </view>
    <!-- 操作提示弹窗 -->
    <fg-message v-model:show="showMessagePopup" width="80%" :title="title" :message="messageContent" :duration="duration" :show-cancel-btn="showCancelBtn" :show-confirm-btn="showConfirmBtn" :close-on-click-modal="closeOnClickModal" :message-id="messageId" :confirm-text="confirmText" @cancel="handleCancel" @confirm="handleConfirm" />
  </view>
</template>

<style lang="scss" scoped>
.smart-service {
  position: relative;
  width: 750rpx;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #DDE3EC;
  .bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 750rpx;
    height: 698rpx;
    background: linear-gradient(0deg, #DDE3EC 0%, #F1FAFD 36%, #CFEDFA 100%);
  }
  .content {
    position: relative;
    padding-top: 16rpx;
    width: 100vw;
    border-radius: 20rpx;
    margin: 0 auto;
    z-index: 10;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .expired-label {
      height: 30rpx;
      border-radius: 8rpx;
      background: #ffffff;
      color: #DF0615;
      font-size: 18rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0 10rpx;
    }
    .grid-container {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20rpx;
    }
    .benefit-empty {
      height: 120rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999999;
      font-size: 26rpx;
    }
    .submit-btn {
      width: 710rpx;
      height: 80rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #239AF6;
      color: #FFFFFF;
      border-radius: 40rpx;
      margin-top: 61rpx;
      margin-bottom: 100rpx;
    }
  }

}
:deep() {
  .wd-navbar.is-border::after {
    height: 0;
  }
}
</style>
