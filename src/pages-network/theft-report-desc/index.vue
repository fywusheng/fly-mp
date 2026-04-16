<script setup lang="ts">
definePage({
  layout: 'default',
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '失窃上报',
    backgroundColor: '#ffffff',
  },
})

// 失窃流程数据
const processList = ref([
  {
    text: '发现车辆失窃，立即联系警方报案，并保留《受案回执》；',
  },
  {
    text: '在“飞鸽畅行”小程序内点击“失窃上报”，选择“车辆失窃”；',
  },
  {
    text: '从车辆列表中选择需要上报失窃的车辆，选择失窃时间和地点，若失窃时车内有电池，需要勾选失窃电池一同上报；',
  },
  {
    text: '输入车主姓名、联系电话和邮箱；',
    tip: '提示:请务必提供真实有效的车主信息，这些信息必须与警方收录的信息一致，将作为飞鸽畅行与您取得联系并依法向警方提供必要信息以协助找回失窃财产的重要依据。',
  },
  {
    text: '提交上报信息，失窃上报完成，车辆进入失窃追踪状态；',
    tip: '提示:请务必提供真实有效的车主信息，这些信息必须与警方收录的信息一致，将作为飞鸽畅行与您取得联系并依法向警方提供必要信息以协助找回失窃财产的重要依据。',
  },
  {
    text: '系统持续追踪失窃车辆动态，一旦获取到车辆定位，将立即联系通知车主；',
  },
  {
    text: '车主联系警方协助，通过定位找到失窃车辆并追回。',
  },
])

// 车辆失窃按钮点击事件
function handleTheftReport() {
  uni.navigateTo({ url: '/pages-network/theft-report/index' })
}
</script>

<template>
  <view class="page-container">
    <!-- 主内容区域 -->
    <view class="content" scroll-y>
      <!-- 失窃须知卡片 -->
      <view class="card">
        <view class="notice-title">
          失窃须知
        </view>
        <view class="notice-content">
          <wd-icon name="info-circle-filled" size="18px" color="#239AF6" />
          <text class="ml-6rpx">
            失窃上报仅代表飞鸽畅行了解您的相关财产不幸被窃，我们将为您提供力所能及的帮助以协助找回。
          </text>
          <text class="highlight">
            失窃上报不能代替报案，请您尽快前往附近派出所报案并保留受案回执，以免贻误案情。
          </text>
        </view>
      </view>

      <!-- 失窃流程卡片 -->
      <view class="card">
        <view class="process-title">
          车辆失窃上报流程
        </view>
        <view class="process-list">
          <view v-for="(item, index) in processList" :key="index" class="process-item">
            <!-- 流程数字圆点 -->
            <view class="process-dot">
              {{ index + 1 }}
            </view>
            <!-- 流程内容 -->
            <view class="process-content">
              <view class="process-text">
                {{ item.text }}
              </view>
              <!-- 流程提示（有则显示） -->
              <view v-if="item.tip" class="process-tip">
                {{ item.tip }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="btn-wrap">
      <button class="primary-btn" @click="handleTheftReport">
        车辆失窃
      </button>
    </view>
  </view>
</template>

<style scoped lang="scss">
// 全局样式重置（UniApp已内置基础重置，补充自定义）
.page-container {
  min-height: 100vh;
  background-color: #DDE3EC;
  font-size: 28rpx;
  color: #333;
}

// 顶部导航
.header {
  height: 88rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 1rpx solid #eee;

  .header-back {
    position: absolute;
    left: 30rpx;
    width: 40rpx;
    height: 40rpx;
  }

  .header-title {
    font-size: 36rpx;
    font-weight: 500;
  }
}

// 滚动内容区
.content {
  padding: 30rpx;
}

// 通用卡片
.card {
  background-color: #fff;
  border-radius: 8rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

// 失窃须知
.notice-title {
  font-size: 32rpx;
  font-weight: 500;
  margin-bottom: 20rpx;
}

.notice-content {
  line-height: 1.6;
  text-align: justify;

  .highlight {
    color: #239AF6;
  }
}

// 失窃流程
.process-title {
  font-size: 32rpx;
  font-weight: 500;
  margin-bottom: 30rpx;
}

.process-list {
  position: relative;
  padding-left: 60rpx;

  // 流程竖线
  &::before {
    content: '';
    position: absolute;
    left: 19rpx;
    top: 20rpx;
    bottom: 20rpx;
    width: 2rpx;
    background-color: #ccc;
  }
}

.process-item {
  position: relative;
  margin-bottom: 40rpx;
  display: flex;
  align-items: flex-start;

  &:last-child {
    margin-bottom: 0;
  }

  // 数字圆点
  .process-dot {
    position: absolute;
    left: -60rpx;
    top: 0;
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background-color: #fff;
    border: 1rpx solid #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    color: #666;
    z-index: 1;
  }

  .process-content {
    line-height: 1.6;

    .process-text {
      font-size: 28rpx;
    }

    .process-tip {
      font-size: 24rpx;
      color: #999;
      margin-top: 10rpx;
      padding-left: 4rpx;
    }
  }
}

// 最后一项：用伪元素遮住下方线条
.process-item:last-child .process-dot::after {
  content: "";
    position: absolute;
    left: 17rpx;
    top: 43rpx;
    width: 10rpx;
    height: 40rpx;
    background: #ffffff;
    z-index: 2;
}

// 底部按钮
.btn-wrap {
  padding: 0 30rpx;
  padding-bottom: 100rpx;

  .primary-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background-color: #239AF6;
    color: #fff;
    border: none;
    border-radius: 8rpx;
    font-size: 32rpx;
    padding: 0;
    margin: 0;

    &::after {
      border: none; // 清除UniApp默认按钮边框
    }

    &:active {
      background-color: #0066cc;
    }
  }
}
</style>
