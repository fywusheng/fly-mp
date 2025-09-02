<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '车主信息',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { httpPost } from '@/utils/http'

const ScanDescIcon = 'http://121.89.87.166/static/car/scan-desc.png'
const SuccessDefault = 'http://121.89.87.166/static/mine/success-default.png'
const YellowTips = 'http://121.89.87.166/static/mine/yellow-tips.png'

const code = ref('')
const name = ref('')
const brand = ref('')
const colorCode = ref('')
const phone = ref('')
const addFlag = ref(false)
const showShare = ref(false)
const validCode = ref('')

const userStore = useUserStore()

// 发送短信
async function sendSmsClick() {
  if (!phone.value) {
    uni.showToast({
      title: '请填写手机号',
      icon: 'none',
    })
    return
  }
  if (phone.value.length !== 11) {
    uni.showToast({
      title: '请填写手机号',
      icon: 'none',
    })
    return
  }
  // 发送短信
  const res = await httpPost('/common/sms/aliyun/send', {
    phoneNumber: phone.value,
    codeType: 1,
  })
  if (res.code === '200') {
    uni.showToast({
      title: '短信发送成功',
      icon: 'success',
      duration: 1000,
    })
  }
  else {
    uni.showToast({
      title: res.message || '短信发送失败',
      icon: 'none',
      duration: 2000,
    })
  }
}

// 绑定车辆
async function onSubmitClick() {
  // showShare.value = true

  const res = await httpPost('/device/vehicle/bind', {
    deviceNo: code.value, // 车辆编码
    vehicleName: name.value, // 车辆名称
    brand: brand.value, // 品牌
    // model: 'EV10C', // 车型，暂无
    colorCode: colorCode.value, // 颜色
    // vehicleCode: '', // 暂无
    // ownerName: '张三',
    ownerPhone: phone.value, // 车主手机号
    userId: userStore.userInfo.userId, // 用户id
    code: validCode.value, // 验证码
  })
  if (res.code === '200') {
    // addFlag.value = true
    uni.showToast({
      title: '绑定成功',
      icon: 'success',
    })
    setTimeout(() => {
      // 跳转到菜单页面
      uni.reLaunch({
        url: '/pages/index/index?name=HomeBlue',
      })
    }, 1000)
  }
  else {
    uni.showToast({
      title: res.message || '绑定失败',
      icon: 'none',
    })
  }
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
// onLoad((option: Record<string, string>) => {
//   // 初始化标签栏
//   if (option.info && option.info !== 'null') {
//     const info = JSON.parse(decodeURIComponent(option.info))
//     code.value = info.code || ''
//     name.value = info.name || ''
//     brand.value = info.brand || ''
//     colorCode.value = info.colorCode || ''
//   }
// })

onMounted(() => {
  const instance = getCurrentInstance()?.proxy as { getOpenerEventChannel?: () => UniApp.EventChannel }
  if (instance?.getOpenerEventChannel) {
    const eventChannel = instance.getOpenerEventChannel()
    eventChannel.on('formData', (info: any) => {
      code.value = info.code || ''
      name.value = info.name || ''
      brand.value = info.brand || ''
      colorCode.value = info.colorCode || ''
    })
  }
})

// 分享好友
onShareAppMessage(() => {
  return {
    title: '成员信息',
    path: `/pages-car/addMember/index?info=${JSON.stringify({
      name: name.value,
      brand: brand.value,
      // color: color.value,
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
            <wd-input v-model="phone" custom-style="text-align:right" label-width="30%" type="text" label="手机号" placeholder="请输入手机号" />
            <wd-input v-model="validCode" custom-style="text-align:right" label-width="30%" type="text" label="验证码" placeholder="请输入验证码">
              <!-- suffix - 发送验证码 -->
              <template #suffix>
                <view class="flex items-center justify-center pl-10rpx">
                  <wd-button size="small" type="primary" @click="sendSmsClick">
                    发送验证码
                  </wd-button>
                </view>
              </template>
            </wd-input>
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
