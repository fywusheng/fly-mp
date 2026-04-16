<script lang="ts" setup>
import { getImageUrl } from '@/utils/image'

defineOptions({
  name: 'MessageCenter',
})

const TipBlueIcon = getImageUrl('/mine/tip-blue.png')

definePage({
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '消息中心',
    backgroundColor: '#F5F5F5',
  },
})

// 消息数据（写死）
const currentMessages = [
  {
    id: 1,
    title: '系统升级通知',
    content: '尊敬的用户，系统将于今晚22:00进行升级维护，预计持续2小时，届时部分功能将暂时无法使用，感谢您的理解与支持。',
    time: '2024-01-15 10:30',
    isRead: false,
  },
  {
    id: 2,
    title: '账号安全提醒',
    content: '您的账号在新设备上登录，如非本人操作，请及时修改密码。',
    time: '2024-01-14 15:20',
    isRead: true,
  },
  {
    id: 3,
    title: '隐私政策更新',
    content: '我们更新了隐私政策，请阅读并确认您的偏好设置。',
    time: '2024-01-13 09:00',
    isRead: true,
  },
]

// 点击消息
function onMessageClick(message) {
  uni.navigateTo({
    url: `/pages-mine/message/index?message=${JSON.stringify(message)}`,
  })
}
</script>

<template>
  <view class="message-center">
    <!-- 消息列表 -->
    <view v-if="currentMessages.length > 0" scroll-y class="message-list">
      <view class="message-items">
        <view
          v-for="message in currentMessages"
          :key="message.id"
          class="message-item"
          @click="onMessageClick(message)"
        >
          <view class="message-icon">
            <image
              class="h-80rpx w-80rpx"
              :src="TipBlueIcon"
              mode="scaleToFill"
            />
            <!-- 未读红点 -->
            <view v-if="!message.isRead" class="unread-badge" />
          </view>
          <view class="message-content">
            <view class="message-header">
              <text class="message-title">
                {{ message.title }}
              </text>
              <text class="message-time">
                {{ message.time }}
              </text>
            </view>
            <text class="message-desc">
              {{ message.content }}
            </text>
          </view>
        </view>
      </view>
      <!-- 加载更多 -->
      <wd-loadmore custom-class="loadmore" state="loading" />
    </view>

    <!-- 空白 -->
    <view v-else class="h-vh w-100% bg-white">
      <wd-status-tip image="https://wot-ui.cn/assets/search.png" tip="当前搜索无结果" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.message-center {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #F5F5F5;

}

.message-list {
  flex: 1;
  padding: 20rpx;
}

.message-items {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.message-item {
  display: flex;
  padding: 40rpx 20rpx;
  background: #ffffff;
  border-radius: 16rpx;
}

.message-icon {
  position: relative;
  flex-shrink: 0;
  width: 80rpx;
  height: 80rpx;
  margin-right: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;

  .unread-badge {
    position: absolute;
    top: -4rpx;
    right: -4rpx;
    width: 20rpx;
    height: 20rpx;
    background: #FA2C19;
    border-radius: 50%;
    border: 2rpx solid #fff;
  }
}

.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.message-title {
  font-size: 30rpx;
  font-weight: 400;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-time {
  flex-shrink: 0;
  font-size: 18rpx;
  color: #C8C8C8;
  margin-left: 16rpx;
}

.message-desc {
  display:  block;
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  width: 448rpx;
  -webkit-box-orient: vertical;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;

  .empty-icon {
    width: 240rpx;
    height: 240rpx;
  }

  .empty-text {
    margin-top: 30rpx;
    font-size: 28rpx;
    color: #999;
  }
}
</style>
