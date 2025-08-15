<script setup lang="ts">
import { ref, computed, watch, onMounted, getCurrentInstance } from 'vue'
import CircleIcon from '@/static/car/circle.png'
interface Props {
  modelValue?: number | number[]
  barHeight?: number | string
  unit?: string
  range?: boolean
  customBlock?: boolean
  backgroundColor?: string
  activeColor?: string
  labelColor?: string
  blockColor?: string
  tipColor?: string
  tipBackgroundColor?: string
  tipPosition?: 'top' | 'inner' | 'bottom'
  showLabel?: boolean
  showTip?: boolean
  showSteps?: boolean
  stepDotColor?: string
  stepDotActiveColor?: string
  min?: number
  max?: number
  step?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => 0,
  barHeight: 5,
  unit: '',
  range: false,
  customBlock: false,
  backgroundColor: '#2CBC7B',
  activeColor: '#2CBC7B',
  labelColor: '#999',
  blockColor: '#fff',
  tipColor: '#333',
  tipBackgroundColor: '#fff',
  tipPosition: 'inner',
  showLabel: false,
  showTip: false,
  showSteps: false,
  stepDotColor: '#D3D3D3',
  stepDotActiveColor: '#2CBC7B',
  min: 0,
  max: 100,
  step: 1,
})

const emit = defineEmits<{
  'update:modelValue': [value: number | number[]]
  input: [value: number | number[]]
  change: [value: number | number[]]
  changing: [value: number | number[]]
}>()

const instance = getCurrentInstance()
const bindValue = ref<number | number[]>(0)
const initWidth = ref(0)
const startX = ref(0)
const isDragging = ref(false)
const currentIndex = ref(-1)

// 实时跟踪拖拽位置
const dragPositions = ref<{ left?: number; right?: number }>({})
// 记录拖拽开始时的原始值，用于回退
const originalValues = ref<{ left?: number; right?: number }>({})

// 计算比率
const rate = computed(() => (initWidth.value || 1) / (props.max - props.min))

// 限制值在边界内
const clampValue = (value: number) => {
  return Math.max(props.min, Math.min(props.max, value))
}

// 对齐到步长
const snapToStep = (value: number) => {
  const steps = Math.round((value - props.min) / props.step)
  return props.min + steps * props.step
}

// 检查值是否达到了一个完整的 step
const isValidStep = (oldValue: number, newValue: number) => {
  const oldSteps = Math.round((oldValue - props.min) / props.step)
  const newSteps = Math.round((newValue - props.min) / props.step)
  return oldSteps !== newSteps
}

// 计算步长指示器
const stepDots = computed(() => {
  if (!props.showSteps || !initWidth.value) return []
  
  const dots = []
  const totalSteps = Math.floor((props.max - props.min) / props.step)
  
  for (let i = 0; i <= totalSteps; i++) {
    const stepValue = props.min + i * props.step
    const position = (stepValue - props.min) * rate.value
    
    // 判断当前步长是否为激活状态
    let isActive = false
    if (props.range) {
      const values = bindValue.value as number[]
      let min = values[0]
      let max = values[1]
      
      // 如果正在拖拽，使用实时位置计算
      if (isDragging.value) {
        if (currentIndex.value === 0 && dragPositions.value.left !== undefined) {
          min = props.min + dragPositions.value.left / rate.value
        } else if (currentIndex.value === 1 && dragPositions.value.right !== undefined) {
          max = props.min + dragPositions.value.right / rate.value
        }
      }
      
      isActive = stepValue >= min && stepValue <= max
    } else {
      let value = bindValue.value as number
      
      // 如果正在拖拽，使用实时位置计算
      if (isDragging.value && dragPositions.value.left !== undefined) {
        value = props.min + dragPositions.value.left / rate.value
      }
      
      isActive = stepValue <= value
    }
    
    dots.push({
      value: stepValue,
      position,
      isActive,
    })
  }
  
  return dots
})

// 滑块样式计算
const minBlockStyle = computed(() => {
  if (!props.range) return ''
  const values = bindValue.value as number[]
  let position = 0
  
  if (isDragging.value && currentIndex.value === 0 && dragPositions.value.left !== undefined) {
    position = dragPositions.value.left
  } else if (initWidth.value) {
    position = (values[0] - props.min) * rate.value
  }
  
  return `left: ${position}px;`
})

const maxBlockStyle = computed(() => {
  if (!props.range) return ''
  const values = bindValue.value as number[]
  let position = initWidth.value
  
  if (isDragging.value && currentIndex.value === 1 && dragPositions.value.right !== undefined) {
    position = dragPositions.value.right
  } else if (initWidth.value) {
    position = (values[1] - props.min) * rate.value
  }
  
  return `left: ${position}px;`
})

const blockStyle = computed(() => {
  if (props.range) return ''
  const value = bindValue.value as number
  let position = initWidth.value
  
  if (isDragging.value && dragPositions.value.left !== undefined) {
    position = dragPositions.value.left
  } else if (initWidth.value) {
    position = (value - props.min) * rate.value
  }
  
  return `left: ${position}px;`
})

const bgBarStyle = computed(() => `height: ${props.barHeight}rpx;`)

const progressBarStyle = computed(() => {
  if (props.range) {
    const values = bindValue.value as number[]
    let min = values[0]
    let max = values[1]
    
    // 如果正在拖拽，使用实时位置计算
    if (isDragging.value) {
      if (currentIndex.value === 0 && dragPositions.value.left !== undefined) {
        min = props.min + dragPositions.value.left / rate.value
      } else if (currentIndex.value === 1 && dragPositions.value.right !== undefined) {
        max = props.min + dragPositions.value.right / rate.value
      }
    }
    
    return initWidth.value
      ? `left: ${(min - props.min) * rate.value}px; width: ${(max - min) * rate.value}px;`
      : 'left: 0; width: 100%;'
  } else {
    const value = bindValue.value as number
    let currentValue = value
    
    if (isDragging.value && dragPositions.value.left !== undefined) {
      currentValue = props.min + dragPositions.value.left / rate.value
    }
    
    return initWidth.value
      ? `left: 0px; width: ${(currentValue - props.min) * rate.value}px;`
      : 'left: 0; width: 100%;'
  }
})

const tipStyle = computed(() => {
  let position = 'top: 50%;'
  switch (props.tipPosition) {
    case 'top':
      position = 'top: -44rpx;'
      break
    case 'bottom':
      position = 'bottom: -44rpx;'
      break
  }
  const transform = props.tipPosition === 'inner' ? 'transform: translateY(-50%) translateX(-50%);' : ''
  return `${position} ${transform}`
})

const kwSliderStyle = computed(() => {
  const padding = props.tipPosition === 'inner' ? '' : `padding-${props.tipPosition}: 40rpx;`
  return [
    padding,
    `--kw-slider-tip-arrow-top-show: ${props.tipPosition === 'bottom' ? 'block' : 'none'};`,
    `--kw-slider-tip-arrow-bottom-show: ${props.tipPosition === 'top' ? 'block' : 'none'};`,
    `--kw-slider-bar-height: ${props.barHeight}rpx;`,
    `--kw-slider-label-color: ${props.labelColor};`,
    `--kw-slider-block-color: ${props.blockColor};`,
    `--kw-slider-tip-background-color: ${props.tipPosition === 'inner' ? 'transparent' : props.tipBackgroundColor};`,
    `--kw-slider-tip-color: ${props.tipColor};`,
    `--kw-slider-bar-background-color: ${props.backgroundColor};`,
    `--kw-slider-bar-active-color: ${props.activeColor};`,
    `--kw-slider-step-dot-color: ${props.stepDotColor};`,
    `--kw-slider-step-dot-active-color: ${props.stepDotActiveColor};`,
    `--kw-slider-transition: ${isDragging.value ? 'none' : 'left 0.2s ease-out, width 0.2s ease-out'};`,
  ].join('')
})

// 获取初始宽度
const getInitWidth = () => {
  uni.createSelectorQuery()
    .in(instance)
    .select('.kw-slider-bar')
    .fields({ size: true }, (data) => {
      if (data && !Array.isArray(data) && data.width) {
        initWidth.value = data.width
      } else {
        // 如果获取失败，延迟重试
        setTimeout(() => {
          getInitWidth()
        }, 100)
      }
    })
    .exec()
}

// 初始化值
const getInitValue = (newVal: number | number[]) => {
  if (Array.isArray(newVal)) {
    bindValue.value = [...newVal]
  } else {
    bindValue.value = newVal
  }
}

// 更新值
const updateValue = () => {
  emit('update:modelValue', bindValue.value)
  emit('input', bindValue.value)
  emit('change', bindValue.value)
}

// 触摸开始
const onBlockTouchStart = (e: TouchEvent) => {
  if (!initWidth.value) {
    getInitWidth()
    return
  }
  
  const touch = e.changedTouches[0]
  const target = e.currentTarget as HTMLElement
  const index = parseInt(target.dataset.index || '0')
  
  startX.value = touch.clientX
  currentIndex.value = index
  isDragging.value = true
  
  // 记录原始值，用于不满足step时的回退
  if (props.range) {
    const values = bindValue.value as number[]
    originalValues.value = {
      left: values[0],
      right: values[1],
    }
    dragPositions.value = {
      left: (values[0] - props.min) * rate.value,
      right: (values[1] - props.min) * rate.value,
    }
  } else {
    const value = bindValue.value as number
    originalValues.value = {
      left: value,
    }
    dragPositions.value = {
      left: (value - props.min) * rate.value,
    }
  }
}

// 触摸移动
const onBlockTouchMove = (e: TouchEvent) => {
  if (!isDragging.value || !initWidth.value) return
  
  const touch = e.changedTouches[0]
  const deltaX = touch.clientX - startX.value
  
  if (props.range) {
    const values = bindValue.value as number[]
    
    if (currentIndex.value === 0) {
      // 左滑块
      let newPosition = (originalValues.value.left! - props.min) * rate.value + deltaX
      newPosition = Math.max(0, Math.min(newPosition, initWidth.value))
      
      // 确保不超过右滑块
      const rightPosition = (values[1] - props.min) * rate.value
      newPosition = Math.min(newPosition, rightPosition)
      
      dragPositions.value.left = newPosition
      
      // 只在拖拽过程中更新视觉位置，不改变实际值
    } else {
      // 右滑块
      let newPosition = (originalValues.value.right! - props.min) * rate.value + deltaX
      newPosition = Math.max(0, Math.min(newPosition, initWidth.value))
      
      // 确保不低于左滑块
      const leftPosition = (values[0] - props.min) * rate.value
      newPosition = Math.max(newPosition, leftPosition)
      
      dragPositions.value.right = newPosition
    }
  } else {
    // 单个滑块
    let newPosition = (originalValues.value.left! - props.min) * rate.value + deltaX
    newPosition = Math.max(0, Math.min(newPosition, initWidth.value))
    
    dragPositions.value.left = newPosition
  }
}

// 触摸结束
const onBlockTouchEnd = () => {
  if (!isDragging.value) return
  
  if (props.range) {
    const values = bindValue.value as number[]
    let newValues = [...values]
    let hasChanged = false
    
    if (currentIndex.value === 0 && dragPositions.value.left !== undefined) {
      // 左滑块
      const newValue = clampValue(snapToStep(props.min + dragPositions.value.left / rate.value))
      
      // 检查是否达到了完整的step
      if (isValidStep(originalValues.value.left!, newValue) && newValue <= values[1]) {
        newValues[0] = newValue
        hasChanged = true
      } else {
        // 回到原始位置
        newValues[0] = originalValues.value.left!
      }
    } else if (currentIndex.value === 1 && dragPositions.value.right !== undefined) {
      // 右滑块
      const newValue = clampValue(snapToStep(props.min + dragPositions.value.right / rate.value))
      
      // 检查是否达到了完整的step
      if (isValidStep(originalValues.value.right!, newValue) && newValue >= values[0]) {
        newValues[1] = newValue
        hasChanged = true
      } else {
        // 回到原始位置
        newValues[1] = originalValues.value.right!
      }
    }
    
    if (hasChanged) {
      bindValue.value = newValues
      updateValue()
    }
  } else {
    if (dragPositions.value.left !== undefined) {
      const newValue = clampValue(snapToStep(props.min + dragPositions.value.left / rate.value))
      
      // 检查是否达到了完整的step
      if (isValidStep(originalValues.value.left!, newValue)) {
        bindValue.value = newValue
        updateValue()
      }
      // 如果没有达到完整step，保持原值不变
    }
  }
  
  isDragging.value = false
  currentIndex.value = -1
  dragPositions.value = {}
  originalValues.value = {}
}

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== undefined) {
      getInitValue(newVal)
    }
  },
  { deep: true, immediate: true }
)

onMounted(() => {
  // 延迟获取宽度，确保DOM已渲染
  setTimeout(() => {
    getInitWidth()
  }, 100)
})
</script>

<template>
  <view
    class="kw-slider"
    :style="kwSliderStyle"
    @touchmove.prevent.stop
  >
    <view v-if="showLabel" class="kw-slider-label">
      {{ min }}{{ unit }}
    </view>
    
    <view class="kw-slider-bar" :style="bgBarStyle">
      <view class="kai-slider-bar-progress" :style="progressBarStyle" />
      
      <!-- 步长指示器 -->
      <template v-if="showSteps">
        <view
          v-for="dot in stepDots"
          :key="dot.value"
          class="kw-slider-step-dot"
          :class="{ 'active': dot.isActive }"
          :style="`left: ${dot.position}px;`"
        >
        <image
        class="w-26rpx h-26rpx"
          :src="CircleIcon"
          mode="scaleToFill"
        />
      </view>
      </template>
      
      <template v-if="range">
        <view
          class="kw-slider-block"
          :class="{ 'block-box': !customBlock }"
          :style="minBlockStyle"
          data-index="0"
          @touchstart="onBlockTouchStart"
          @touchmove.prevent.stop="onBlockTouchMove"
          @touchend="onBlockTouchEnd"
        >
          <view v-if="showTip" :style="tipStyle" class="kw-slider-tips">
            {{ (bindValue as number[])[0] }}{{ unit }}
          </view>
          <slot name="minBlock" />
        </view>
        
        <view
          class="kw-slider-block"
          :class="{ 'block-box': !customBlock }"
          :style="maxBlockStyle"
          data-index="1"
          @touchstart="onBlockTouchStart"
          @touchmove.prevent.stop="onBlockTouchMove"
          @touchend="onBlockTouchEnd"
        >
          <view v-if="showTip" :style="tipStyle" class="kw-slider-tips">
            {{ (bindValue as number[])[1] }}{{ unit }}
          </view>
          <slot name="maxBlock" />
        </view>
      </template>
      
      <template v-else>
        <view
          class="kw-slider-block"
          :class="{ 'block-box': !customBlock }"
          :style="blockStyle"
          data-index="0"
          @touchstart="onBlockTouchStart"
          @touchmove.prevent.stop="onBlockTouchMove"
          @touchend="onBlockTouchEnd"
        >
          <view v-if="showTip" :style="tipStyle" class="kw-slider-tips">
            {{ bindValue }}{{ unit }}
          </view>
          <slot name="block" />
        </view>
      </template>
    </view>
    
    <view v-if="showLabel" class="kw-slider-label">
      {{ max }}{{ unit }}
    </view>
  </view>
</template>

<style lang="scss" scoped>
$kw-slider-height: 80rpx !default;
$kw-slider-bar-height: var(--kw-slider-bar-height, 4rpx) !default;
$kw-color-dark-grey: var(--kw-slider-bar-background-color, #D3D3D3) !default;
$kw-color-active: var(--kw-slider-bar-active-color, #3141ff) !default;
$kw-slider-tip-background-color: var(--kw-slider-tip-background-color, #fff) !default;
$kw-slider-tip-color: var(--kw-slider-tip-color, #333) !default;
$kw-slider-block-color: var(--kw-slider-block-color, #fff) !default;
$kw-label-color: var(--kw-slider-label-color, #999) !default;
$kw-slider-transition: var(--kw-slider-transition, left 0.2s ease-out, width 0.2s ease-out) !default;

.kw-slider {
  width: 100%;
  height: $kw-slider-height;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.kw-slider-bar {
  width: 100%;
  height: $kw-slider-bar-height;
  position: relative;
  margin: 0 30rpx;
  background-color: $kw-color-dark-grey;
  // min-height: 20rpx; /* 确保有足够的高度 */
}

.kai-slider-bar-progress {
  position: absolute;
  height: 100%;
  background-color: $kw-color-active;
  transition: $kw-slider-transition;
}

.kw-slider-step-dot {
  position: absolute;
  top: 50%;
  transform: translateY(-50%) translateX(-50%);
  // width: 12rpx;
  // height: 12rpx;
  // border-radius: 50%;
  // border: 2rpx solid #ffffff;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  // box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.2);
  
  &.active {
    transform: translateY(-50%) translateX(-50%) scale(1.3);
    border-width: 3rpx;
  }
}

.kw-slider-label {
  text-align: center;
  color: $kw-label-color;
  font-size: 24rpx;
}

.kw-slider-block {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%) translateX(-50%);
  transition: $kw-slider-transition;
  z-index: 3;

  &.block-box {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background-color: $kw-slider-block-color;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  }

  .kw-slider-tips {
    position: absolute;
    background-color: $kw-slider-tip-background-color;
    color: $kw-slider-tip-color;
    padding: 8rpx 12rpx;
    left: 50%;
    transform: translateX(-50%);
    font-size: 22rpx;
    line-height: 1;
    border-radius: 10rpx;
    white-space: nowrap;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

    &::before {
      content: '';
      position: absolute;
      width: 0;
      height: 0;
      top: -4px;
      display: var(--kw-slider-tip-arrow-top-show, none);
      border-bottom: 5px solid $kw-slider-tip-background-color;
      border-top: 0;
      border-right: 6px solid transparent;
      border-left: 6px solid transparent;
      left: 50%;
      transform: translateX(-50%);
    }

    &::after {
      content: '';
      position: absolute;
      width: 0;
      height: 0;
      bottom: -4px;
      display: var(--kw-slider-tip-arrow-bottom-show, none);
      border-top: 5px solid $kw-slider-tip-background-color;
      border-bottom: 0;
      border-right: 6px solid transparent;
      border-left: 6px solid transparent;
      left: 50%;
      transform: translateX(-50%);
    }
  }
}
</style>
