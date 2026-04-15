<route lang="json5" type="home">
  {
    layout: 'tabbar',
    style: {
      navigationStyle: 'custom',
      navigationBarTitleText: '智能服务',
      "backgroundColor": "#6EA6F6",
    },
  }
</route>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { getImageUrl } from '@/utils/image'

defineOptions({
  name: 'SmartService',
})
const userStore = useUserStore()
const CarIcon = getImageUrl('/network/car.png')
const WeixinPayIcon = getImageUrl('/network/weixin-pay.png')
const MemberIcon = getImageUrl('/network/member.png')
const MemberNoIcon = getImageUrl('/network/member-none.png')

// 有会员：true 未开通：false
const hasMember = ref(false)

// 当前选中的套餐
const selectedPlan = ref('year')

// 套餐列表
const plans = ref([
  {
    id: 'year',
    title: '2年卡',
    desc: '365天有效期',
    price: '299',
    originalPrice: '399',
    discount: '7.5折',
    recommend: true,
  },
  {
    id: 'years',
    title: '2年卡',
    desc: '365天有效期',
    price: '299',
    originalPrice: '399',
    discount: '7.5折',
    recommend: false,
  },
  {
    id: 'half',
    title: '半年套餐',
    desc: '180天有效期',
    price: '199',
    originalPrice: '239',
    discount: '8.3折',
    recommend: false,
  },
  {
    id: 'month',
    title: '月度套餐',
    desc: '30天有效期',
    price: '39',
    originalPrice: '49',
    discount: '8折',
    recommend: false,
  },
])

function handleSelectPlan(planId: string) {
  selectedPlan.value = planId
}

// 开通/续费
function handleSubmit() {
  if (hasMember.value) {
    uni.navigateTo({
      url: '/pages-network/smart-service/renew',
    })
  }
  else {
    uni.navigateTo({
      url: '/pages-network/smart-service/open',
    })
  }
}
// 导航返回
function handleClickLeft() {
  uni.navigateBack()
}
</script>

<template>
  <view class="smart-service">
    <wd-navbar title="智能服务" placeholder left-arrow :safe-area-inset-top="true" fixed @click-left="handleClickLeft" custom-style="background-color: transparent !important;" />
    <view class="bg" />
    <view class="content">
      <!-- 会员状态 -->
      <view class="relative h-260rpx w-600rpx flex">
        <image
          class="absolute left-0 top-0 h-full w-full"
          :src="MemberIcon"
          mode="scaleToFill"
        />
        <image
          class="relative z-10 ml-30rpx mt-91rpx h-110rpx w-110rpx"
          :src="CarIcon"
          mode="scaleToFill"
        />
        <view class="relative z-10 ml-20rpx mt-113rpx">
          <view class="mb-16rpx text-30rpx text-[#333333] font-bold">
            小飞侠呦~
          </view>
          <view class="mb-10rpx text-22rpx text-[#666666]">
            服务有效期2026.5.31
            <!-- 未开通 -->
          </view>
          <view class="expired-label">
            距离服务到期还有20天
          </view>
        </view>
      </view>
      <!-- 智能服务 -->
      <view class="w-710rpx px-20rpx">
        <fg-card title="选择服务卡套餐">
          <!-- 套餐列表 -->
          <view class="plans network">
            <view
              v-for="plan in plans"
              :key="plan.id"
              class="plan-item"
              :class="{ active: selectedPlan === plan.id }"
              @click="handleSelectPlan(plan.id)"
            >
              <!-- 推荐标签 -->
              <view v-if="plan.recommend" class="recommend-badge">推荐</view>
              <!-- 卡名称 -->
              <view class="plan-title">{{ plan.title }}</view>
              <!-- 当前价格 -->
              <view class="price-row">
                <text class="currency">¥</text>
                <text class="amount">{{ plan.price }}</text>
              </view>
              <!-- 原价 -->
              <view class="original-price">¥{{ plan.originalPrice }}</view>
              <!-- 设备类型 -->
              <view class="discount-tag">蓝牙设备</view>
             
            </view>
          </view>
          <view class="text-30rpx text-[#333333] mb-63rpx">选择支付方式</view>
          <view class="mb-64rpx flex align-center justify-between">
            <view class="flex align-center">
              <image
              class="h-37rpx w-40rpx"
                :src="WeixinPayIcon"
                mode="scaleToFill"
              />
              <view class="text-30rpx text-[#333333] ml-25rpx">微信支付</view>
            </view>
            <wd-icon name="check-circle-filled" size="22px" color="#52ACF9" ></wd-icon>
          </view>
          <view class="line"></view>
          <view class="text-30rpx text-[#333333] mb-30rpx">续费规则</view>
          <view class="text-24rpx text-[#666666]">
            <view class="mb-10rpx line-height-30rpx" >1.智能服务过期后，将停止提供智能服务功能。</view>
            <view class="mb-10rpx line-height-30rpx" >2.智能服务过期时间较长后，将无法在小程序内续费。需联系售后客服更换4G云盒，可能会产生额外费用。</view>
            <view class="mb-10rpx line-height-30rpx" >3.续费成功后，将自动给车辆延期，不支持转让、服务中止及退款。</view>
          </view>
          
        </fg-card>
      </view>
     
      <!-- 按钮 -->
      <view class="submit-btn" @click="handleSubmit">
        ￥{{ plans.find(p => p.id === selectedPlan)?.price || '24.11' }} 立即支付
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
