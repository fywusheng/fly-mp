<script lang="ts" setup>
const props = defineProps({
  title: {
    type: String,
    default: '操作提示',
  },
  message: {
    type: String,
    default: '',
  },
  messageId: {
    type: [String, Number],
    default: '',
  },
  show: {
    type: Boolean,
    default: false,
  },
  duration: {
    type: Number,
    default: 2000,
  },
  showCancelBtn: {
    type: Boolean,
    default: false,
  },
  showConfirmBtn: {
    type: Boolean,
    default: false,
  },
  closeOnClickModal: {
    type: Boolean,
    default: false,
  },
  confirmText: {
    type: String,
    default: '确定',
  },
})

const emit = defineEmits(['update:show', 'cancel', 'confirm'])

const showPop = ref(props.show)
const closeOnClickPop = ref(props.closeOnClickModal)
let timer: ReturnType<typeof setTimeout> | null = null

function closePop() {
  showPop.value = false
  emit('update:show', false)
  clearTimer()
}

function handleClose() {
  emit('cancel')
}
function handleConfirm() {
  emit('confirm')
}
function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}
watch(() => props.show, (newVal) => {
  showPop.value = newVal
  clearTimer()
  if (newVal && props.duration > 0) {
    timer = setTimeout(() => {
      closePop()
    }, props.duration)
  }
}, { immediate: true })

watch(showPop, (val) => {
  if (!val && props.show) {
    emit('update:show', false)
    clearTimer()
  }
})
watch(() => props.closeOnClickModal, (val) => {
  closeOnClickPop.value = val
}, { immediate: true })
</script>

<template>
  <wd-popup v-model="showPop" :z-index="1000" :close-on-click-modal="closeOnClickPop" custom-style="border-radius:32rpx;" @close="handleClose">
    <view class="flex flex-col items-center justify-center px-49rpx pb-70rpx pt-50rpx">
      <view class="mb-60rpx text-36rpx color-[#333333]">
        {{ title }}
      </view>
      <!-- <rich-text :nodes="message" /> -->
      <view class="text-center text-28rpx color-[#666666]" v-html="message" />
      <slot />
    </view>
    <view v-if="showCancelBtn || showConfirmBtn" class="btn-cont">
      <view v-if="showCancelBtn" class="cancel-btn" @click="handleClose">
        取消
      </view>
      <view v-if="showConfirmBtn" class="confirm-btn" @click="handleConfirm">
        {{ confirmText }}
      </view>
    </view>
  </wd-popup>
</template>

<style lang="scss">
.btn-cont{
  border-top: 1rpx solid #666666;
  display: flex;
  align-items: center;
  justify-content: center;

  .cancel-btn {
    color: #666666;
    border-right: 1rpx solid #666666;
    height: 80rpx;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .confirm-btn {
    color: #D70413;
    height: 80rpx;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
