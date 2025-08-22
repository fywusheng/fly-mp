<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '分享与解绑',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
import GreenCar from '@/static/mine/car-green.png'
import RedCar from '@/static/mine/car-red.png'
import White from '@/static/mine/car-white.png'
import EditIcon from '@/static/mine/edit.png'
import rightIcon from '@/static/mine/right.png'

const columns = ref(['选项1', '选项2', '选项3', '选项4', '选项5', '选项6', '选项7'])
const value = ref('选项1')

// message弹窗
const showMessagePopup = ref(true) // 控制弹窗显示
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

// 车主信息编辑
function onEditClick() {
  // Handle edit click
  uni.navigateTo({
    url: '/pages-car/editCar/index',
  })
}

function onMemberEditClick(info) {
  // Handle member edit click
  uni.navigateTo({
    url: `/pages-car/addMember/index?info=${JSON.stringify(info)}`,
  })
}

function onUnbindClick() {
  // Handle delete click
  messageId.value = 1
  duration.value = 0
  showCancelBtn.value = false
  showConfirmBtn.value = true
  closeOnClickModal.value = true
  confirmText.value = '确定'
  message.value = '解绑前需要删除所有成员'
  showMessagePopup.value = true
}

function onDelClick() {
  // Handle delete click
  messageId.value = 1
  duration.value = 0
  showCancelBtn.value = true
  showConfirmBtn.value = true
  closeOnClickModal.value = true
  confirmText.value = '立即删除'
  message.value = '<div style="color: red;">该成员正在骑行中</div> <div >删除该成员后，他将不能使用此设备。</div>'
  // message.value = '<div >删除该成员后，</div> <div >他将不能使用此设备。</div>'
  showMessagePopup.value = true
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

    <!-- 车主信息 -->
    <view class="mt-53rpx rounded-[10rpx] bg-white">
      <view class="flex items-center justify-between px-30rpx py-10rpx">
        <view class="h-60rpx w-60rpx flex items-center justify-center rounded-30rpx bg-[#DB6477] text-24rpx text-white">
          车主
        </view>
        <view class="unbind-btn" @click="onUnbindClick">
          解绑
        </view>
      </view>
      <view class="relative box-border h-260rpx w-711rpx py-30rpx pl-240rpx">
        <view class="relative z-100 mb-20rpx flex items-center text-24rpx text-[#333333]">
          <view class="w-96rpx">
            我的车辆
          </view>
          <view class="ml-28rpx">
            12312312
          </view>
        </view>
        <view class="relative z-100 mb-20rpx flex items-center text-24rpx text-[#333333]">
          <view class="w-96rpx">
            品牌
          </view>
          <view class="ml-28rpx">
            12312312
          </view>
        </view>
        <view class="relative z-100 mb-20rpx flex items-center text-24rpx text-[#333333]">
          <view class="w-96rpx">
            颜色
          </view>
          <view class="ml-28rpx">
            12312312
          </view>
        </view>
        <view class="relative z-100 flex items-center text-24rpx text-[#333333]">
          <view class="w-96rpx">
            设备编号
          </view>
          <view class="ml-28rpx">
            12312312
          </view>
        </view>
        <image
          class="absolute left-0 top-0 z-10 h-100% w-100%"
          :src="GreenCar"
          mode="scaleToFill"
        />
        <image
          class="absolute right-32rpx top-31rpx z-100 h-50rpx w-51rpx"
          :src="EditIcon"
          mode="scaleToFill"
          @click="onEditClick"
        />
        <view class="line-height-22rrpx absolute bottom-46rpx right-32rpx z-100 text-right text-18rpx text-[#6E6E6E]">
          <view>添加时间</view>
          <view>2022-01-01</view>
        </view>
      </view>
    </view>

    <!-- 成员信息 -->
    <view class="mt-53rpx rounded-[10rpx] bg-white">
      <view class="flex items-center justify-between px-30rpx py-10rpx">
        <view class="h-60rpx w-60rpx flex items-center justify-center rounded-30rpx bg-[#F7B154] text-24rpx text-white">
          成员
        </view>
        <view class="del-btn" @click="onDelClick">
          删除
        </view>
      </view>
      <view class="relative box-border w-711rpx px-30rpx py-30rpx">
        <view class="relative z-100 mb-20rpx flex items-center text-24rpx text-[#333333]">
          <view class="w-96rpx">
            姓名
          </view>
          <view class="ml-28rpx">
            12312312
          </view>
        </view>
        <view class="relative z-100 mb-20rpx flex items-center text-24rpx text-[#333333]">
          <view class="w-96rpx">
            电话
          </view>
          <view class="ml-28rpx">
            12312312
          </view>
        </view>
        <view class="flex items-center justify-between text-18rpx text-[#6E6E6E]">
          <view>骑行次数：55次</view>
          <view>添加时间：2025-03-03</view>
        </view>
        <view class="absolute left-0 top-0 h-2rpx w-100% bg-[#E6E6E6]" />
        <image
          class="absolute right-32rpx top-31rpx z-100 h-50rpx w-51rpx"
          :src="EditIcon"
          mode="scaleToFill"
          @click="onMemberEditClick({ name: '123123' })"
        />
      </view>
    </view>

    <!-- 操作提示弹窗 -->
    <fg-message v-model:show="showMessagePopup" :duration="duration" :confirm-text="confirmText" :show-cancel-btn="showCancelBtn" :show-confirm-btn="showConfirmBtn" :close-on-click-modal="closeOnClickModal" :message="message" :message-id="messageId" @cancel="handleCancel" @confirm="handleConfirm" />

    <view class="mt-30rpx w-711rpx text-24rpx text-[#6E6E6E]">
      *添加成员后，被分享人登录”飞鸽电动车”微信小程序，即可使用分享的车辆；
    </view>
    <view class="mt-34rpx w-711rpx text-24rpx text-[#6E6E6E]">
      *车主解绑前需要删除所有成员。
    </view>
    <view class="submit-btn" @click="onMemberEditClick(null)">
      添加成员（2/5）
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
