<script lang="ts">
// @ts-nocheck
import type { ComponentInternalInstance } from 'vue'

/**
 * 获取节点信息
 * @param selector 选择器字符串
 * @param context ComponentInternalInstance 对象
 * @param node 是否获取node
 * @returns 包含节点信息的 Promise 对象
 */
function getRect(selector: string, context: ComponentInternalInstance | ComponentPublicInstance, node: boolean = false) {
  // 之前是个对象，现在改成实例，防止旧版会报错
  if (context == null) {
    return Promise.reject(new Error('context is null'))
  }
  // #ifdef MP || VUE2
  if ((context as any).proxy)
    context = (context as any).proxy
  // #endif
  return new Promise<UniNamespace.NodeInfo>((resolve, reject) => {
    // #ifndef APP-NVUE
    const dom = uni.createSelectorQuery().in(context).select(selector)
    const result = (rect: UniNamespace.NodeInfo) => {
      if (rect) {
        resolve(rect)
      }
      else {
        reject(new Error('no rect'))
      }
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
    const refs = (context as any).$refs
    if (/#|\./.test(selector) && refs) {
      selector = selector.replace(/#|\./, '')
      if (refs[selector]) {
        selector = refs[selector]
        if (Array.isArray(selector)) {
          selector = selector[0]
        }
      }
    }

    dom.getComponentRect(selector, (res) => {
      if (res.size) {
        resolve(res.size)
      }
      else {
        reject(new Error('no rect'))
      }
    })
    // #endif
  })
};

export default defineComponent({
  name: 'LScrollX',
  props: {
    trackWidth: {
      type: String,
      default: null,
    },
    trackHeight: {
      type: String,
      default: null,
    },
    trackColor: {
      type: String,
      default: null,
    },
    barColor: {
      type: String,
      default: null,
    },
    barWidth: {
      type: String,
      default: null,
    },
    indicator: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const instance = getCurrentInstance().proxy!
    const trackStyle = computed(() => {
      const style: Record<string, any> = {}
      if (props.trackColor != null) {
        style.background = props.trackColor!
      }
      if (props.trackHeight != null) {
        style.height = props.trackHeight!
      }
      if (props.trackWidth != null) {
        style.width = props.trackWidth!
      }
      return style
    })

    const x = ref(0)
    const barStyle = computed(() => {
      const style: Record<string, any> = {}
      if (props.barColor != null) {
        style.background = props.barColor!
      }
      if (props.barWidth != null) {
        style.width = props.barWidth!
      }
      style.transform = `translateX(${x.value}px)`
      return style
    })

    const scroll = (e: any) => {
      Promise.all([
        getRect('.l-scroll-x__view', instance),
        getRect('.l-scroll-x__track', instance),
        getRect('.l-scroll-x__bar', instance),
      ]).then(([scroll, track, bar]) => {
        x.value = e.detail.scrollLeft / (e.detail.scrollWidth - scroll.width) * (track.width - bar.width)
      })
    }

    return {
      trackStyle,
      barStyle,
      scroll,
    }
  },
})
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
    <view v-if="indicator" ref="trackRef" class="l-scroll-x__track" :style="[trackStyle]">
      <view ref="barRef" class="l-scroll-x__bar" :style="[barStyle]" />
    </view>
  </view>
</template>

<style lang="scss">
  $prefix: l !default;
  $pre: '--';
  $scrollx: #{$prefix}-scroll-x;
  $scrollx-track-width: 24px;
  $scrollx-track-height: 4px;
  $scrollx-track-color:rgba(0,0,0,.06);
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
