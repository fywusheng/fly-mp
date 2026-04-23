<script lang="ts" setup>
import { ref } from 'vue'
import { httpGet, httpPost } from '@/utils/http'
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

const currentMessages = ref<any[]>([])
const pageNum = ref(1)
const pageSize = ref(20)
const total = ref(0)
const loadmoreState = ref<'loading' | 'finished' | 'error'>('loading') // loading, finished, error

async function loadData(reset = false) {
  if (reset) {
    pageNum.value = 1
    currentMessages.value = []
    loadmoreState.value = 'loading'
  }

  if (loadmoreState.value === 'finished' && !reset)
    return

  try {
    loadmoreState.value = 'loading'
    const res = await httpGet('/user/mini/message/list', {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    })

    if (res.code === '200') {
      const records = res.data?.records || []
      total.value = res.data?.total || 0

      if (reset) {
        currentMessages.value = records
      }
      else {
        currentMessages.value = [...currentMessages.value, ...records]
      }

      if (currentMessages.value.length >= total.value || records.length < pageSize.value) {
        loadmoreState.value = 'finished'
      }
      else {
        loadmoreState.value = 'loading'
      }
    }
    else {
      loadmoreState.value = 'error'
    }
  }
  catch (err) {
    console.error(err)
    loadmoreState.value = 'error'
  }
}

onLoad(() => {
  loadData(true)
})

onReachBottom(() => {
  if (loadmoreState.value === 'finished')
    return
  pageNum.value += 1
  loadData()
})

// 点击消息
async function onMessageClick(message: any) {
  if (message.readStatus === 0) {
    try {
      const res = await httpPost(`/user/mini/message/read/${message.id}`)
      if (res.code === '200' || res.data === true) {
        message.readStatus = 1
      }
    }
    catch (e) {
      console.error('标记已读失败', e)
    }
  }

  uni.navigateTo({
    url: `/pages-mine/message/index?message=${encodeURIComponent(JSON.stringify(message))}`,
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
            <view v-if="message.readStatus === 0" class="unread-badge" />
          </view>
          <view class="message-content">
            <view class="message-header">
              <text class="message-title">
                {{ message.title }}
              </text>
              <text class="message-time">
                {{ message.createTime }}
              </text>
            </view>
            <text class="message-desc">
              {{ message.content }}
            </text>
          </view>
        </view>
      </view>
      <!-- 加载更多 -->
      <wd-loadmore custom-class="loadmore" :state="loadmoreState" @reload="loadData" />
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
