<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '车辆设置',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
const AutoSheFang = 'http://121.89.87.166/static/mine/auto-shefang.png'
const AutoXihuo = 'http://121.89.87.166/static/mine/auto-xihuo.png'
const MuteShefang = 'http://121.89.87.166/static/mine/mute-shefang.png'
const OverSpeed = 'http://121.89.87.166/static/mine/over-speed.png'
const RemoteControl = 'http://121.89.87.166/static/mine/remote-control.png'

const columns = ref(['选项1', '选项2', '选项3', '选项4', '选项5', '选项6', '选项7'])
const value = ref('选项1')
const checked1 = ref<boolean>(true)
const checked2 = ref<boolean>(true)
const checked3 = ref<boolean>(true)
const checked4 = ref<boolean>(true)
// message弹窗
const showMessagePopup = ref(false) // 控制弹窗显示
const messageId = ref<number>(0) // 弹窗ID
const message = ref<string>('<view >删除该成员后，</view> <view >他将不能使用此设备。</view>') // 弹窗内容
const duration = ref(0) // 弹窗持续时间
const confirmText = ref<string>('确定') // 确认按钮文本
const showCancelBtn = ref(true) // 是否显示取消按钮
const showConfirmBtn = ref(true) // 是否显示确认按钮
const closeOnClickModal = ref(true) // 是否点击蒙层关闭弹窗

function handleCancel() {
  showMessagePopup.value = false
  console.log('取消操作')
}

function handleConfirm() {
  showMessagePopup.value = false
  console.log('确认操作')
}
function handleOnConfirm({ value }) {
  value.value = value
}

function beforeChange({ value, resolve }) {
  console.log('切换前的值:', value)
  setTimeout(() => {
    resolve(true)
    messageId.value = 1
    duration.value = 1000
    showCancelBtn.value = false
    showConfirmBtn.value = false
    closeOnClickModal.value = true
    // confirmText.value = '立即删除'
    message.value = '自动锁车成功!'
    showMessagePopup.value = true
  }, 1000)
}
</script>

<template>
  <view class="bind-car">
    <wd-picker v-model="value" :columns="columns" :z-index="110" use-default-slot @confirm="handleOnConfirm">
      <view class="mt-20rpx box-border h-80rpx w-711rpx flex items-center justify-between rounded-[10rpx] bg-white px-29rpx text-24rpx">
        <view>123456SFEER</view>
        <wd-icon name="arrow-right" size="18px" />
      </view>
    </wd-picker>

    <view class="mt-53rpx rounded-[10rpx] bg-white text-24rpx">
      <view class="flex items-center justify-between px-30rpx py-10rpx">
        <view class="flex items-center justify-center">
          <image
            class="mr-20rpx h-26rpx w-26rpx"
            :src="MuteShefang"
            mode="scaleToFill"
          />
          <view>静音设防</view>
        </view>
        <wd-switch v-model="checked1" active-color="#2CBD7C" :before-change="beforeChange" />
      </view>
      <view class="h-2rpx w-100% bg-[#E6E6E6]" />
      <view class="relative box-border w-711rpx px-30rpx py-30rpx">
        功能开启后，车辆设防状态下，无喇叭报警提示音
      </view>
    </view>
    <view class="mt-53rpx rounded-[10rpx] bg-white text-24rpx">
      <view class="flex items-center justify-between px-30rpx py-10rpx">
        <view class="flex items-center justify-center">
          <image
            class="mr-20rpx h-26rpx w-26rpx"
            :src="AutoXihuo"
            mode="scaleToFill"
          />
          <view>自动熄火</view>
        </view>
        <wd-switch v-model="checked2" active-color="#2CBD7C" :before-change="beforeChange" />
      </view>
      <view class="h-2rpx w-100% bg-[#E6E6E6]" />
      <view class="relative box-border w-711rpx px-30rpx py-30rpx">
        功能开启后，车辆忘记熄火，车辆在5分钟后自动熄火
      </view>
    </view>
    <view class="mt-53rpx rounded-[10rpx] bg-white text-24rpx">
      <view class="flex items-center justify-between px-30rpx py-10rpx">
        <view class="flex items-center justify-center">
          <image
            class="mr-20rpx h-26rpx w-26rpx"
            :src="AutoSheFang"
            mode="scaleToFill"
          />
          <view>自动设防</view>
        </view>
        <wd-switch v-model="checked3" active-color="#2CBD7C" :before-change="beforeChange" />
      </view>
      <view class="h-2rpx w-100% bg-[#E6E6E6]" />
      <view class="relative box-border w-711rpx px-30rpx py-30rpx">
        功能开启后，车辆熄火后5秒未启动，将自动进入设防状态
      </view>
    </view>
    <view class="mt-53rpx rounded-[10rpx] bg-white text-24rpx">
      <view class="flex items-center justify-between px-30rpx py-10rpx">
        <view class="flex items-center justify-center">
          <image
            class="mr-20rpx h-26rpx w-26rpx"
            :src="OverSpeed"
            mode="scaleToFill"
          />
          <view>超速报警提示音</view>
        </view>
        <wd-switch v-model="checked4" active-color="#2CBD7C" :before-change="beforeChange" />
      </view>
      <view class="h-2rpx w-100% bg-[#E6E6E6]" />
      <view class="relative box-border w-711rpx px-30rpx py-30rpx">
        功能关闭后，车辆行驶速度超过15km/h不会有提示音
      </view>
    </view>

    <view class="mt-53rpx rounded-[10rpx] bg-white text-24rpx">
      <view class="flex items-center justify-between px-30rpx py-10rpx">
        <view class="flex items-center justify-center">
          <image
            class="mr-20rpx h-26rpx w-26rpx"
            :src="RemoteControl"
            mode="scaleToFill"
          />
          <view>复制遥控器</view>
        </view>
        <wd-button size="medium">
          复 制
        </wd-button>
      </view>
      <view class="h-2rpx w-100% bg-[#E6E6E6]" />
      <view class="relative box-border w-711rpx px-30rpx py-30rpx">
        收到系统提示音后，按需要复制遥控器的解锁键，仅支持 频率为433的遥控设备
      </view>
    </view>

    <!-- 操作提示弹窗 -->
    <fg-message v-model:show="showMessagePopup" :duration="duration" :confirm-text="confirmText" :show-cancel-btn="showCancelBtn" :show-confirm-btn="showConfirmBtn" :close-on-click-modal="closeOnClickModal" :message="message" :message-id="messageId" @cancel="handleCancel" @confirm="handleConfirm" />
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
  .unbind-btn {
    width: 160rpx;
    height: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 25rpx;
    color:#6E6E6E;
    background-color: #DEDEDE;
    border: 1rpx solid #C8C8C8;
  }
  .del-btn {
    width: 160rpx;
    height: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 25rpx;
    color:#FFFFFF;
    background-color: #E9A2AD;
    border: 1rpx solid #DB6477;
  }
  .submit-btn {
    width: 710rpx;
    height: 80rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #239AF6;
    color: #FFFFFF;
    border-radius: 40rpx;
    margin-top: 102rpx;
  }
  :deep() {
    .wd-input__inner {
      text-align: right;
    }
    .wd-input__label-inner {
      font-size: 24rpx;
    }
  }
}
</style>
