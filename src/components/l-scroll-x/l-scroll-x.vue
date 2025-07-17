<script setup lang="ts">
import { computed, getCurrentInstance, ref } from 'vue'

defineOptions({
  name: 'LScrollX',
})

const props = withDefaults(defineProps<ScrollXProps>(), {
  trackWidth: null,
  trackHeight: null,
  trackColor: null,
  barColor: null,
  barWidth: null,
  indicator: true,
})

// 定义组件 Props
interface ScrollXProps {
  trackWidth?: string | null
  trackHeight?: string | null
  trackColor?: string | null
  barColor?: string | null
  barWidth?: string | null
  indicator?: boolean
}

/**
 * 获取节点信息
 * @param selector 选择器字符串
 * @param context 组件实例对象
 * @param node 是否获取node
 * @returns 包含节点信息的 Promise 对象
 */
function getRect(selector: string, context: any, node = false): Promise<UniNamespace.NodeInfo> {
  if (!context) {
    return Promise.reject(new Error('context is null'))
  }

  // 兼容处理不同平台的上下文
  if (context.proxy) {
    context = context.proxy
  }

  return new Promise<UniNamespace.NodeInfo>((resolve, reject) => {
    // #ifndef APP-NVUE
    const dom = uni.createSelectorQuery().in(context).select(selector)
    const result = (rect: UniNamespace.NodeInfo) => {
      rect ? resolve(rect) : reject(new Error('no rect'))
    }

    if (!node) {
      dom.boundingClientRect(result).exec()
    }
    else {
      dom.fields({
        node: true,
        size: true,
        rect: true,
      }, result).exec()
    }
    // #endif

    // #ifdef APP-NVUE
    const refs = context.$refs
    if (/#|\./.test(selector) && refs) {
      selector = selector.replace(/#|\./, '')
      if (refs[selector]) {
        selector = refs[selector]
        if (Array.isArray(selector)) {
          selector = selector[0]
        }
      }
    }

    // 使用NVUE专用API
    uni.requireNativePlugin('dom').getComponentRect(selector, (res: any) => {
      res.size ? resolve(res.size) : reject(new Error('no rect'))
    })
    // #endif
  })
}

// 组件内部状态
const instance = getCurrentInstance()?.proxy
const x = ref(0)
const showIndicator = ref(props.indicator)

// 计算滚动条轨道样式
const trackStyle = computed(() => ({
  ...(props.trackColor && { background: props.trackColor }),
  ...(props.trackHeight && { height: props.trackHeight }),
  ...(props.trackWidth && { width: props.trackWidth }),
}))

// 计算滚动条样式
const barStyle = computed(() => ({
  ...(props.barColor && { background: props.barColor }),
  ...(props.barWidth && { width: props.barWidth }),
  transform: `translateX(${x.value}px)`,
}))

// 处理滚动事件
function scroll(e: any) {
  if (!instance)
    return

  Promise.all([
    getRect('.l-scroll-x__view', instance),
    getRect('.l-scroll-x__track', instance),
    getRect('.l-scroll-x__bar', instance),
  ]).then(([scroll, track, bar]) => {
    // 计算可滚动区域
    const scrollable = e.detail.scrollWidth - scroll.width

    // 根据可滚动内容和轨道宽度计算滑块位置
    if (scrollable > 0) {
      x.value = e.detail.scrollLeft / scrollable * (track.width - bar.width)
      // 自动隐藏/显示指示器
      showIndicator.value = scrollable > 0
    }
    else {
      x.value = 0
      showIndicator.value = false
    }
  }).catch((err) => {
    console.error('滚动条计算错误:', err)
  })
}
</script>

<template>
  <view ref="scrollxRef" class="l-scroll-x">
    <scroll-view
      ref="scrollRef"
      class="l-scroll-x__view"
      direction="horizontal"
      enable-flex
      :show-scrollbar="false"
      :scroll-with-animation="true"
      :scroll-x="true"
      @scroll="scroll"
    >
      <slot />
    </scroll-view>
    <view v-if="showIndicator" ref="trackRef" class="l-scroll-x__track" :style="trackStyle">
      <view ref="barRef" class="l-scroll-x__bar" :style="barStyle" />
    </view>
  </view>
</template>

<style lang="scss">
  $prefix: l !default;
  $scrollx: #{$prefix}-scroll-x;
  $scrollx-track-width: 24px;
  $scrollx-track-height: 4px;
  $scrollx-track-color: rgba(0, 0, 0, 0.06);
  $scrollx-bar-color: #fa2c19;
  $scrollx-bar-width: 12px;

.#{$scrollx} {
  // #ifndef APP-IOS || APP-ANDROID || APP-HARMONY
  display: flex;
  flex-direction: column;
  transition: height 50ms linear;
  ::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
    color: transparent;
  }
  // #endif
  &__view {
    flex-direction: row;
  white-space: nowrap;
  }
  &__track {
    position: relative;
    // margin-top: 10px;
    height: $scrollx-track-height;
    width: $scrollx-track-width;
    background-color: $scrollx-track-color;
    border-radius: 99px;
    align-self: center;
  }
  &__bar {
    position: absolute;
    height: 100%;
    width: $scrollx-bar-width;
    background-color: $scrollx-bar-color;
    border-radius: 99px;
  }
}
</style>
