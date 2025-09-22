<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '使用手册',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
const QuestionBind = 'http://115.190.57.206/static/mine/question-bind.png'
const QuestionDesk = 'http://115.190.57.206/static/mine/question-desk.png'
const QuestionOver = 'http://115.190.57.206/static/mine/question-over.png'
const QuestionStart = 'http://115.190.57.206/static/mine/question-start.png'
const QuestionUse = 'http://115.190.57.206/static/mine/question-use.png'
const Question = 'http://115.190.57.206/static/mine/question.png'

function goPage(url: string) {
  uni.navigateTo({
    url,
  })
}
</script>

<template>
  <view class="page-content">
    <view class="flex justify-evenly">
      <view class="flex flex-col items-center" @click="goPage('/pages-car/userBind/index')">
        <image
          class="mb-10rpx h-300rpx w-300rpx"
          :src="QuestionBind"
          mode="scaleToFill"
        />
        <view class="text-btn">
          绑定和解绑
        </view>
      </view>
      <view class="flex flex-col items-center" @click="goPage('/pages-car/userShare/index')">
        <image
          class="mb-10rpx h-300rpx w-300rpx"
          :src="QuestionUse"
          mode="scaleToFill"
        />
        <view class="text-btn">
          使用和分享
        </view>
      </view>
    </view>
    <view class="mt-50rpx flex justify-evenly" @click="goPage('/pages-car/userStart/index')">
      <view class="flex flex-col items-center">
        <image
          class="mb-10rpx h-300rpx w-300rpx"
          :src="QuestionStart"
          mode="scaleToFill"
        />
        <view class="text-btn">
          感应启动
        </view>
      </view>
      <view class="flex flex-col items-center" @click="goPage('/pages-car/userOverSpeed/index')">
        <image
          class="mb-10rpx h-300rpx w-300rpx"
          :src="QuestionOver"
          mode="scaleToFill"
        />
        <view class="text-btn">
          超速报警
        </view>
      </view>
    </view>
    <view class="mt-50rpx flex justify-evenly" @click="goPage('/pages-car/userDesk/index')">
      <view class="flex flex-col items-center">
        <image
          class="mb-10rpx h-300rpx w-300rpx"
          :src="QuestionDesk"
          mode="scaleToFill"
        />
        <view class="text-btn">
          小程序放到手机桌面
        </view>
      </view>
      <view class="flex flex-col items-center" @click="goPage('/pages-car/userUse/index')">
        <image
          class="mb-10rpx h-300rpx w-300rpx"
          :src="Question"
          mode="scaleToFill"
        />
        <view class="text-btn">
          使用问题
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page-content {
  min-height: 100vh;
  background: #ffffff;
  padding-top: 50rpx;
  box-sizing: border-box;

}
</style>
