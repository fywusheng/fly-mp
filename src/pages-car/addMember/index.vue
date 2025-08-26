<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '成员信息',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
import ScanDescIcon from '@/static/car/scan-desc.png'
import SuccessDefault from '@/static/mine/success-default.png'
import YellowTips from '@/static/mine/yellow-tips.png'

const code = ref('')
const name = ref('')
const brand = ref('')
const color = ref('')
const phone = ref('')
const columns = ref(['朋友', '夫妻', '父母', '子女', '情侣', '亲戚']) // 关系列表
const addFlag = ref(false)
const showShare = ref(false)

function onSubmitClick() {
  // showShare.value = true
  // return
  addFlag.value = true
  if (!code.value || !name.value || !phone.value) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none',
    })
    return
  }

  // 提交绑定信息
  uni.showLoading({
    title: '提交中...',
  })

  // 模拟提交成功
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: '绑定成功',
      icon: 'success',
    })
    // 跳转到菜单页面
    uni.navigateTo({
      url: '/pages-car/menu/index',
    })
  }, 1000)
}

function onCompleteClick() {
  uni.navigateBack()
}
function onNoticeClick() {
  // uni.navigateBack()
  uni.showToast({
    title: '通知成员',
    icon: 'none',
  })
}

function onMessageClick() {
  uni.showToast({
    title: '短信通知',
    icon: 'none',
  })
}

// 处理页面加载参数
onLoad((option: Record<string, string>) => {
  // 初始化标签栏
  if (option.info && option.info !== 'null') {
    const info = JSON.parse(option.info)
    name.value = info.name || ''
    brand.value = info.brand || '飞鸽'
    color.value = info.color || ''
  }
  console.log(option, 'open:')
})

// 分享好友
onShareAppMessage(() => {
  return {
    title: '成员信息',
    path: `/pages-car/addMember/index?info=${JSON.stringify({
      name: name.value,
      brand: brand.value,
      color: color.value,
      phone: phone.value,
    })}`,
    imageUrl: ScanDescIcon,
  }
})
</script>

<template>
  <view class="bind-car">
    <template v-if="!addFlag">
      <view class="mt-28rpx w-711rpx overflow-hidden rounded-10rpx">
        <view class="mt-8rpx">
          <wd-cell-group border>
            <wd-input v-model="name" custom-style="text-align:left" label-width="15%" type="text" label="车辆名字" placeholder="请输入车辆名称" />
            <wd-input v-model="brand" custom-style="text-align:right" label-width="30%" type="text" label="姓名" placeholder="请输入姓名" />
            <wd-input v-model="phone" custom-style="text-align:right" label-width="30%" type="text" label="手机号" placeholder="请输入手机号" />
            <wd-cell value="与车主关系">
              <template #title>
                <view class="text-24rpx">
                  与车主关系
                </view>
              </template>

              <wd-picker v-model="color" :columns="columns" use-default-slot>
                <view class="flex items-center justify-end">
                  <view v-if="color" class="mr-15rpx text-24rpx">
                    {{ color }}
                  </view>
                  <view v-else class="mr-15rpx text-24rpx color-[#C8C8C8]">
                    请选择
                  </view>
                  <wd-icon name="arrow-down" size="20px" color="#6E6E6E" />
                </view>
              </wd-picker>
            </wd-cell>
          </wd-cell-group>
        </view>
      </view>
      <view class="mt-62rpx h-80rpx w-710rpx flex items-center justify-center rounded-[40rpx] bg-[#239AF6] color-white" @click="onSubmitClick">
        提 交
      </view>
    </template>
    <template v-else>
      <image
        class="mt-230rpx h-288rpx w-348rpx"
        :src="SuccessDefault"
        mode="scaleToFill"
      />
      <view class="mt-261rpx flex items-center justify-between">
        <view class="complete-btn" @click="onCompleteClick">
          完成
        </view>
        <view class="relative">
          <view class="absolute right-0 top-[-112rpx] h-92rpx w-260rpx">
            <image
              class="absolute absolute right-0 top-0 h-100% w-100%"
              :src="YellowTips"
              mode="scaleToFill"
            />
            <view class="relative mt-10rpx px-38rpx text-24rpx text-[#6E6E6E]">
              去提醒朋友查收 一下吧！
            </view>
          </view>
          <view class="notice-btn" @click="onNoticeClick">
            通知成员
          </view>
        </view>
      </view>
    </template>
    <fg-share v-model:show="showShare" @message="onMessageClick" />
  </view>
</template>

<style lang="scss" scoped>
.bind-car {
  background-color: #DDE3EC;
  height: 100vh;
  display: flex;
  flex-direction: column;
  // justify-content: center;
  align-items: center;
  // padding: 16px;
  // border-radius: 8px;
  .complete-btn,
  .notice-btn {
    background-color: #239AF6;
    color: white;
    border-radius: 40rpx;
    // padding: 12rpx 24rpx;
    font-size: 28rpx;
    width: 260rpx;
    height: 80rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .notice-btn  {
    background-color: #2CBD7C;
    margin-left: 70rpx;
  }
  :deep() {
    // .wd-input__inner {
    //   text-align: right;
    // }
    .wd-input__label-inner,.wd-input__inner {
      font-size: 24rpx;
    }
  }
}
</style>
