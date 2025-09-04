<script lang="ts" setup>
//
const props = defineProps({
  show: {
    type: Boolean,
    default: true,
  },
})
const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'message'): void
}>()

const sharePop = ref(false)
const WeiXin = 'http://121.89.87.166/static/common/weixin.png'

watch(() => props.show, (newVal) => {
  sharePop.value = newVal
}, { immediate: true })

function handleClose() {
  emit('update:show', false)
}
function handleMessageClick() {
  emit('message')
}
</script>

<template>
  <wd-popup v-model="sharePop" :z-index="1000" :close-on-click-modal="true" position="bottom" @close="handleClose">
    <view class="share-pop pt-32rpx">
      <view class="title text-36rpx">
        分享到
      </view>
      <view class="list flex text-36rpx">
        <button class="item flex flex-col items-center justify-center" open-type="share">
          <image
            :src="WeiXin"
            mode="scaleToFill"
          />
          <text>微信好友</text>
        </button>
        <!-- <button class="item flex flex-col items-center justify-center" @click="handleMessageClick">
          <image
            src="https://ggllstatic.hpgjzlinfo.com/static/common/icon-message.png"
            mode="scaleToFill"
          />
          <text>短信</text>
        </button> -->
        <!-- #ifdef MP-ALIPAY -->
        <button class="item flex flex-col items-center justify-center" open-type="share">
          <image
            src="https://ggllstatic.hpgjzlinfo.com/static/common/icon-qq.png"
            mode="scaleToFill"
          />
          <text>QQ好友</text>
        </button>
        <button class="item flex flex-col items-center justify-center" open-type="share">
          <image
            src="https://ggllstatic.hpgjzlinfo.com/static/common/icon-alipay.png"
            mode="scaleToFill"
          />
          <text>支付宝好友</text>
        </button>
        <!-- #endif -->
        <!-- <button class="item flex flex-col items-center justify-center" @click="handleCopyClick">
          <image
            src="https://ggllstatic.hpgjzlinfo.com/static/common/icon-link.png"
            mode="scaleToFill"
          />
          <text>复制链接</text>
        </button> -->
      </view>
      <view class="btn">
        <view
          class="cancle flex flex-col items-center justify-center bg-white text-44rpx"
          @click="handleClose"
        >
          取消
        </view>
      </view>
    </view>
  </wd-popup>
</template>

<style lang="scss" scoped>
 .share-pop {
    background-color: #f2f2f2;
    border-radius: 16px 16px 0px 0px;
    color: #333333;
    .title {
      text-align: center;
      line-height: 50rpx;
    }
    .list {
      justify-content: center;
      align-items: center;
      padding: 24rpx 74rpx;
      flex-wrap: wrap;
      .item {
        height: 192rpx;
        flex-shrink: 0;
        width: 33.3%;
        background: none;
        image {
          flex-shrink: 0;
          width: 134rpx;
          height: 134rpx;
          margin-bottom: 8rpx;
        }
        text {
          line-height: 50rpx;
        }
      }
    }
    .btn {
      padding: 24rpx 74rpx;
      box-sizing: border-box;
      .cancle {
        height: 108rpx;
        border-radius: 54rpx;
        color: #666;
        font-weight: 500;
      }
    }
  }
</style>
