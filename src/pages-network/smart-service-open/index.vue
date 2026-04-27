<script lang="ts" setup>
import type { MemberPackage } from '@/api/member'
import dayjs from 'dayjs'
import { createMemberPurchase, getMemberOrderStatus, getMemberPackages } from '@/api/member'
import { useUserStore } from '@/store'
import { getImageUrl } from '@/utils/image'
import { pollPaymentStatus, requestWechatPayment } from '@/utils/payment'

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
const WeixinPayIcon = getImageUrl('/network/weixin-pay.png')
const MemberIcon = getImageUrl('/network/member.png')
const MemberNoIcon = getImageUrl('/network/member-none.png')

// 当前选中的套餐
const selectedPlanId = ref<number>()

// 套餐列表
const plans = ref<MemberPackage[]>([])
const loadingPackages = ref(false)
const paying = ref(false)

const selectedPlan = computed(() => plans.value.find(plan => plan.id === selectedPlanId.value))

function formatPrice(price?: number | string) {
  if (price === undefined || price === null || price === '') {
    return '--'
  }

  const value = Number(price)
  if (Number.isNaN(value)) {
    return String(price)
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

function getPlanDesc(plan: MemberPackage) {
  return plan.description || `${plan.durationDays}天有效期`
}

function getPlanDeviceType(plan: MemberPackage) {
  return plan.applicableUser === 'BLUETOOTH' ? '蓝牙设备' : '4G设备'
}

async function fetchMemberPackages() {
  try {
    loadingPackages.value = true
    const res = await getMemberPackages({ deviceType: '4G' })
    if (res.code === '200') {
      const enabledPackages = (res.data || [])
        .filter(plan => plan.status !== 'DISABLED')
        .sort((prev, next) => (prev.sortOrder || 0) - (next.sortOrder || 0))

      plans.value = enabledPackages
      selectedPlanId.value = enabledPackages[0]?.id
    }
  }
  catch (error) {
    console.error('获取服务卡套餐失败', error)
  }
  finally {
    loadingPackages.value = false
  }
}

function handleSelectPlan(planId: number) {
  selectedPlanId.value = planId
}

// 开通/续费
async function handleSubmit() {
  if (paying.value) {
    return
  }

  const plan = selectedPlan.value
  if (!plan) {
    uni.showToast({
      title: '请选择服务卡套餐',
      icon: 'none',
    })
    return
  }

  try {
    paying.value = true
    uni.showLoading({
      title: '正在下单',
      mask: true,
    })

    const vehicleId = userStore.userInfo.defaultVehicleId || undefined
    const purchaseRes = await createMemberPurchase({
      packageId: plan.id,
      ...(vehicleId ? { vehicleId } : {}),
    })

    if (purchaseRes.code !== '200' || !purchaseRes.data) {
      throw new Error(purchaseRes.message || '创建支付订单失败')
    }

    uni.hideLoading()
    await requestWechatPayment(purchaseRes.data)

    uni.showLoading({
      title: '确认支付结果',
      mask: true,
    })

    await pollPaymentStatus(
      () => getMemberOrderStatus(purchaseRes.data.orderNo),
      { interval: 2000, maxTimes: 15 },
    )

    await userStore.getUserInfo()
    uni.showToast({
      title: '支付成功',
      icon: 'success',
    })
  }
  catch (error: any) {
    console.error('服务卡支付失败', error)
    const message = error?.errMsg || error?.message || ''
    if (message.includes('cancel')) {
      uni.showToast({
        title: '已取消支付',
        icon: 'none',
      })
    }
    else if (message === 'PAYMENT_STATUS_TIMEOUT') {
      uni.showToast({
        title: '支付结果确认中，请稍后查看',
        icon: 'none',
      })
    }
    else if (message === 'CLOSED') {
      uni.showToast({
        title: '订单已关闭',
        icon: 'none',
      })
    }
    else {
      uni.showToast({
        title: message || '支付失败，请稍后重试',
        icon: 'none',
      })
    }
  }
  finally {
    uni.hideLoading()
    paying.value = false
  }
}
// 导航返回
function handleClickLeft() {
  uni.navigateBack()
}

onLoad(() => {
  fetchMemberPackages()
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
            <!-- 未开通 -->
          </view>
          <view v-if="userStore.isMemberVip" class="expired-label">
            距离服务到期还有{{ dayjs(userStore.userInfo.serviceExpireTime).diff(dayjs(), 'day') }}天
          </view>
        </view>
      </view>
      <!-- 智能服务 -->
      <view class="w-710rpx px-20rpx">
        <fg-card title="选择服务卡套餐">
          <!-- 套餐列表 -->
          <view class="network plans">
            <view v-if="loadingPackages" class="empty-plan">
              套餐加载中...
            </view>
            <view v-else-if="!plans.length" class="empty-plan">
              暂无可购买套餐
            </view>
            <view
              v-for="plan in plans"
              :key="plan.id"
              class="plan-item"
              :class="{ active: selectedPlanId === plan.id }"
              @click="handleSelectPlan(plan.id)"
            >
              <!-- 推荐标签 -->
              <view v-if="plan.recommended" class="recommend-badge">
                推荐
              </view>
              <!-- 卡名称 -->
              <view class="plan-title">
                {{ plan.name }}
              </view>
              <!-- <view class="plan-desc">
                {{ getPlanDesc(plan) }}
              </view> -->
              <!-- 当前价格 -->
              <view class="price-row">
                <text class="currency">
                  ¥
                </text>
                <text class="amount">
                  {{ formatPrice(plan.discountPrice) }}
                </text>
              </view>
              <!-- 原价 -->
              <view class="original-price">
                ¥{{ formatPrice(plan.originalPrice) }}
              </view>
              <!-- 设备类型 -->
              <view class="discount-tag">
                {{ getPlanDeviceType(plan) }}
              </view>
            </view>
          </view>
          <view class="mb-63rpx text-30rpx text-[#333333]">
            选择支付方式
          </view>
          <view class="align-center mb-64rpx flex justify-between">
            <view class="align-center flex">
              <image
                class="h-37rpx w-40rpx"
                :src="WeixinPayIcon"
                mode="scaleToFill"
              />
              <view class="ml-25rpx text-30rpx text-[#333333]">
                微信支付
              </view>
            </view>
            <wd-icon name="check-circle-filled" size="22px" color="#52ACF9" />
          </view>
          <view class="line" />
          <view class="mb-30rpx text-30rpx text-[#333333]">
            续费规则
          </view>
          <view class="text-24rpx text-[#666666]">
            <view class="mb-10rpx line-height-30rpx">
              1.智能服务过期后，将停止提供智能服务功能。
            </view>
            <view class="mb-10rpx line-height-30rpx">
              2.智能服务过期时间较长后，将无法在小程序内续费。需联系售后客服更换4G云盒，可能会产生额外费用。
            </view>
            <view class="mb-10rpx line-height-30rpx">
              3.续费成功后，将自动给车辆延期，不支持转让、服务中止及退款。
            </view>
          </view>
        </fg-card>
      </view>

      <!-- 按钮 -->
      <view class="submit-btn" @click="handleSubmit">
        ￥{{ formatPrice(selectedPlan?.discountPrice) }} {{ paying ? '支付中...' : '立即支付' }}
      </view>
      <!--  -->
    </view>
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
    .plans {
      display: flex;
      overflow-x: auto;
      gap: 16rpx;
      margin-bottom: 60rpx;
      &.network {
        .plan-item {
          &.active {
            border-color: #FCAB2A;
            background: RGBA(252, 171, 42, .1);
          }
          .recommend-badge {
            background-color: #FCAB2A;
          }
          .discount-tag {
            background-color: #FEECCE;
            color: #FCAB2A;
          }
        }
      }
    }
    .plan-item {
      flex-shrink: 0;
      position: relative;
      border: 2rpx solid #E6E6E6;
      border-radius: 30rpx;
      padding: 20rpx 16rpx 16rpx;
      background-color: #fff;
      transition: all 0.2s;
      width: 180rpx;
      height: 230rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      overflow: hidden;

      &.active {
        border-color: #52ACF9;
        background: RGBA(82, 172, 249, .1);
      }

      .recommend-badge {
        position: absolute;
        top: 0;
        left: 0;
        width: 80rpx;
        height: 40rpx;
        background: #409eff;
        color: #fff;
        font-size: 22rpx;
        text-align: center;
        line-height: 40rpx;
        border-bottom-right-radius: 30rpx;
      }

      .plan-title {
        font-size: 30rpx;
        // font-weight: bold;
        color: #333;
        margin-bottom: 6rpx;
      }

      .plan-desc {
        height: 28rpx;
        margin-bottom: 4rpx;
        font-size: 20rpx;
        line-height: 28rpx;
        color: #6E6E6E;
      }

      .price-row {
        display: flex;
        align-items: baseline;
        margin-bottom: 4rpx;
        color: #333333;
        font-weight: bold;
        font-size: 44rpx;
      }

      .original-price {
        font-size: 32rpx;
        color: #999;
        text-decoration: line-through;
        margin-bottom: 10rpx;
      }

      .discount-tag {
        width: 120rpx;
        height: 30rpx;
        background: #CEE8FE;
        border-radius: 15rpx;
        font-weight: 400;
        font-size: 18rpx;
        color: #52ACF9;
        line-height: 40rpx;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .selected-icon {
        position: absolute;
        top: 12rpx;
        right: 12rpx;
        width: 32rpx;
        height: 32rpx;
        background-color: #239AF6;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    .empty-plan {
      width: 100%;
      height: 230rpx;
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
  .line {
    width: 708rpx;
    height: 2rpx;
    background-color: #E6E6E6;
    margin-bottom: 50rpx;
    margin-left: -17px;
  }

}
:deep() {
  .wd-navbar.is-border::after {
    height: 0;
  }
}
</style>
