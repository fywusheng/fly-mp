<template>
  <view class="slider-demo">
    <view class="demo-section">
      <text class="section-title">基础滑块 - 带步长指示器</text>
      <kw-slider
        v-model="value1"
        :min="0"
        :max="100"
        :step="10"
        :show-steps="true"
        :show-tip="true"
        unit="分"
        active-color="#07c160"
        step-dot-color="#e0e0e0"
        step-dot-active-color="#07c160"
      />
      <text class="value-text">当前值: {{ value1 }}</text>
    </view>

    <view class="demo-section">
      <text class="section-title">区间滑块 - 带步长指示器</text>
      <kw-slider
        v-model="value2"
        :min="0"
        :max="50"
        :step="5"
        :range="true"
        :show-steps="true"
        :show-tip="true"
        unit="km"
        active-color="#ff6b6b"
        step-dot-color="#f0f0f0"
        step-dot-active-color="#ff6b6b"
      />
      <text class="value-text">当前区间: {{ value2[0] }} - {{ value2[1] }}</text>
    </view>

    <view class="demo-section">
      <text class="section-title">细步长滑块</text>
      <kw-slider
        v-model="value3"
        :min="0"
        :max="10"
        :step="0.5"
        :show-steps="true"
        :show-tip="true"
        :show-label="true"
        unit="°C"
        active-color="#4285f4"
        step-dot-color="#d3d3d3"
        step-dot-active-color="#4285f4"
      />
      <text class="value-text">温度: {{ value3 }}°C</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 单个值
const value1 = ref(30)

// 区间值
const value2 = ref([10, 35])

// 细步长值
const value3 = ref(5)
</script>

<style lang="scss" scoped>
.slider-demo {
  padding: 40rpx;
}

.demo-section {
  margin-bottom: 80rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  color: #333;
}

.value-text {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-top: 20rpx;
}
</style>
