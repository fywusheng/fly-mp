<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '车主信息',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
import KeyIcon from '@/static/mine/key.png'
// message弹窗
const showMessagePopup = ref(false) // 控制弹窗显示
const messageId = ref<number>(0) // 弹窗ID
const message = ref<string>('') // 弹窗内容
const duration = ref(0) // 弹窗持续时间
const confirmText = ref<string>('确定') // 确认按钮文本
const showCancelBtn = ref(true) // 是否显示取消按钮
const showConfirmBtn = ref(true) // 是否显示确认按钮
const closeOnClickModal = ref(true) // 是否点击蒙层关闭弹窗
const title = ref('')
const showSlot = ref(false)

function handleCancel() {
  showMessagePopup.value = false
  console.log('取消操作')
}

function handleConfirm() {
  showMessagePopup.value = false
  console.log('确认操作')
}

function onBindClick() {
  showSlot.value = true
  title.value = '按住设备遥控器'
  messageId.value = 1
  duration.value = 0
  showCancelBtn.value = false
  showConfirmBtn.value = true
  closeOnClickModal.value = true
  confirmText.value = '取消'
  message.value = ''
  showMessagePopup.value = true
  // Handle bind click
  // uni.navigateTo({
  //   url: '/pages-car/menu/index',
  // })
}
</script>

<template>
  <view class="bind-car">
    <image
      class="mt-30rpx h-465rpx w-663rpx"
      :src="KeyIcon"
      mode="scaleToFill"
    />

    <view class="font-24rpx mt-28rpx">
      <text class="color-[#6E6E6E]">
        *仅适用以上遥控器样式
      </text>
    </view>
    <view class="mt-30rpx box-border h-380rpx w-710rpx rounded-20rpx bg-white text-[#333333]">
      <view class="px-30rpx py-35rpx text-24rpx">
        绑定步骤
      </view>
      <view class="mb-35rpx h-2rpx w-100% bg-[#E6E6E6]" />
      <view class="flex flex-col pl-133rpx">
        <view class="mb-28rpx flex items-center">
          <view class="mr-65rpx">
            1
          </view>
          <wd-button size="large" @click="onBindClick">
            点击此处开始绑定
          </wd-button>
        </view>
        <view class="mb-28rpx flex items-center">
          <view>2</view>
          <view class="ml-25rpx">
            同时按住遥控器，解防键和设防键
          </view>
        </view>
        <view class="flex items-center">
          <view>3</view>
          <view class="ml-25rpx">
            听见”Bi“声后，等待绑定成功
          </view>
        </view>
      </view>
    </view>
    <!-- 操作提示弹窗 -->
    <fg-message v-model:show="showMessagePopup" :title="title" :duration="duration" :confirm-text="confirmText" :show-cancel-btn="showCancelBtn" :show-confirm-btn="showConfirmBtn" :close-on-click-modal="closeOnClickModal" :message="message" :message-id="messageId" @cancel="handleCancel" @confirm="handleConfirm">
      <view v-if="showSlot" class="text-[#666666] text-28rpx text-center">
        <view class="flex items-center justify-center">
          <image
            class="h-40rpx w-40rpx"
            :src="KeyIcon"
            mode="scaleToFill"
          />
          <view class="mx-25rpx">+</view>
          <image
            class="h-40rpx w-40rpx"
            :src="KeyIcon"
            mode="scaleToFill"
          />
        </view>

        <view class="mt-25rpx">“Bi”提示音后松开等待绑定成功   30秒</view>
      </view>
    </fg-message>
  </view>
</template>

<style lang="scss" scoped>
.bind-car {
  background-color: #DDE3EC;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;

}
</style>
