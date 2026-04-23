<script setup lang="ts">
interface AdItem {
  imageUrl: string
  linkUrl: string
}

const props = withDefaults(defineProps<{
  list: AdItem[]
  // 布局模式：horizontal 横向滚动 | vertical 垂直排列
  layout?: 'horizontal' | 'vertical'
  // 列数（仅在 vertical 模式下生效）
  columns?: number
  // 广告项宽度（如 345rpx 或 100%）
  itemWidth?: string
  // 广告项高度（如 180rpx 或 230rpx）
  itemHeight?: string
}>(), {
  layout: 'horizontal',
  columns: 1,
  itemWidth: '260rpx',
  itemHeight: '180rpx',
})

const layout = computed(() => props.layout)
const columns = computed(() => props.columns)
const itemStyle = computed(() => ({
  width: props.itemWidth,
  height: props.itemHeight,
}))

function onAdClick(item: AdItem) {
  if (!item.linkUrl)
    return

  // 判断是否为 https 链接
  const isHttpsUrl = /^https?:\/\//.test(item.linkUrl)

  if (isHttpsUrl) {
    // 跳转到 webview 页面
    uni.navigateTo({
      url: `/pages/webview/index?url=${encodeURIComponent(item.linkUrl)}`,
    })
  }
  else {
    // 普通小程序页面跳转
    uni.navigateTo({
      url: item.linkUrl,
      fail: () => {
        uni.switchTab({
          url: item.linkUrl,
          fail: () => {
            uni.showToast({
              title: '跳转失败',
              icon: 'none',
            })
          },
        })
      },
    })
  }
}
</script>

<template>
  <view :class="layout === 'vertical' ? 'ad-banner-vertical' : 'ad-banner'">
    <view
      v-for="(item, index) in list"
      :key="index"
      :class="layout === 'vertical' ? 'ad-item-vertical' : 'ad-item'"
      :style="itemStyle"
      @click="onAdClick(item)"
    >
      <image
        class="ad-image"
        :src="item.imageUrl"
        mode="aspectFill"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.ad-banner {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  gap: 20rpx;
  padding: 0 20rpx;
  margin-top: 20rpx;

  /* 隐藏滚动条 */
  &::-webkit-scrollbar {
    display: none;
  }
}

.ad-banner-vertical {
  display: grid;
  justify-content: center;
  gap: 20rpx;
  // padding: 0 20rpx;
  margin-top: 20rpx;
  // grid-template-columns: repeat(v-bind(columns), 1fr);
}

.ad-item {
  flex-shrink: 0;
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #f5f5f5;

  &:active {
    opacity: 0.9;
    transform: scale(0.98);
    transition: all 0.1s ease;
  }
}

.ad-item-vertical {
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #f5f5f5;

  &:active {
    opacity: 0.9;
    transform: scale(0.98);
    transition: all 0.1s ease;
  }
}

.ad-image {
  width: 100%;
  height: 100%;
}
</style>
