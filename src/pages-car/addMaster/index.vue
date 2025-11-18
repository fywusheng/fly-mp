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

const code = ref('')
const name = ref('')
const brand = ref('')
const colorCode = ref('')
const phone = ref('')
const validCode = ref('')

const userStore = useUserStore()

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
        url: '/pages/index/index',
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
</script>

<template>
  <view class="bind-car">
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
