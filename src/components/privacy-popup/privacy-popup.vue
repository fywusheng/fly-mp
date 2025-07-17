<script setup lang="ts">
import { onMounted, ref } from 'vue'

const privacyContractName = ref('')
const showPrivacy = ref(false)

// 初始化隐私弹窗数据
onMounted(() => {
  setTimeout(() => {
    showPrivacy.value = getApp().globalData.showPrivacy
    privacyContractName.value = getApp().globalData.privacyContractName
  }, 500)
})

// 同意隐私协议
function handleAgreePrivacyAuthorization() {
  wx.requirePrivacyAuthorize({
    success: () => {
      showPrivacy.value = false
      getApp().globalData.showPrivacy = false
    },
  })
}

// 拒绝隐私协议
function exitMiniProgram() {
  // uni.showModal({
  //   content: '如果拒绝,我们将无法获取您的信息, 包括手机号、位置信息、相册等该小程序十分重要的功能,您确定要拒绝吗?',
  //   success: (res: any) => {
  //     if (res.confirm) {
  //       showPrivacy.value = false
  //       uni.exitMiniProgram({
  //         success: () => {
  //           console.log('退出小程序成功')
  //         },
  //       })
  //     }
  //   },
  // })
}

// 跳转协议页面
function openPrivacyContract() {
  wx.openPrivacyContract({
    fail: () => {
      uni.showToast({
        title: '网络错误',
        icon: 'error',
      })
    },
  })
}
</script>

<template>
  <view v-if="showPrivacy" class="privacy">
    <view class="content">
      <view class="title">
        用户隐私保护提示
      </view>
      <view class="des">
        感谢您使用【飞鸽畅行】，在使用前请您仔细阅读
        <text class="link" @click="openPrivacyContract">
          {{ privacyContractName }}
        </text>当点击同意并继续时，即表示您已理解并同意改条款内容;如您不同意，将无法继续使用小程序相关功能。
      </view>
      <view class="btns">
        <button class="item reject" @click="exitMiniProgram">
          拒绝
        </button>
        <button
          id="agree-btn"
          class="item agree"
          open-type="agreePrivacyAuthorization"
          @agreeprivacyauthorization="handleAgreePrivacyAuthorization"
        >
          同意并继续
        </button>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.privacy {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999999;
  display: flex;
  align-items: center;
  justify-content: center;
  .content {
    width: 85vw;
    padding: 50rpx;
    box-sizing: border-box;
    background: #fff;
    border-radius: 16rpx;
    .title {
      text-align: center;
      color: #333;
      font-weight: bold;
      font-size: 34rpx;
    }
    .des {
      font-size: 26rpx;
      color: #666;
      margin-top: 40rpx;
      text-align: justify;
      line-height: 1.6;
      .link {
        color: #07c160;
        text-decoration: underline;
      }
    }
    .btns {
      margin-top: 60rpx;
      display: flex;
      justify-content: space-between;
      .item {
        justify-content: space-between;
        width: 244rpx;
        height: 80rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 16rpx;
        box-sizing: border-box;
        border: none;
      }
      .reject {
        background: #f4f4f5;
        color: #909399;
      }
      .agree {
        background: #07c160;
        color: #fff;
      }
    }
  }
}
</style>
