<script lang="ts" setup>
withDefaults(
  defineProps<{
    title?: string
    padding?: string
    borderRadius?: string
    backgroundColor?: string
  }>(),
  {
    title: '',
    padding: '30rpx',
    borderRadius: '20rpx',
    backgroundColor: '#ffffff',
  },
)
</script>

<template>
  <view class="fg-card" :style="{ borderRadius, backgroundColor }">
    <!-- 标题区 -->
    <view v-if="title" class="fg-card__header">
      <view class="fg-card__title">
        {{ title }}
      </view>
    </view>
    <!-- 内容插槽区 -->
    <view class="fg-card__body" :style="{ padding }">
      <slot />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.fg-card {
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;

  &__header {
    padding:  30rpx ;
    position: relative;
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2rpx;
      background-color: #E6E6E6;
    }
  }

  &__title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333333;
  }

  &__body {
    box-sizing: border-box;
  }
}
</style>
