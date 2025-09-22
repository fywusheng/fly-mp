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
import { useUserStore } from '@/store/user'
// const AutoSheFang = 'http://115.190.57.206/static/mine/auto-shefang.png'
// const AutoXihuo = 'http://115.190.57.206/static/mine/auto-xihuo.png'
// const MuteShefang = 'http://115.190.57.206/static/mine/mute-shefang.png'
import { openAndSearchAndConnect } from '@/utils/EvsBikeSdk'
import EVSBikeSDK from '@/utils/EVSBikeSDK.v1.1.1'
import { httpGet, httpPost } from '@/utils/http'

const OverSpeed = 'http://115.190.57.206/static/mine/over-speed.png'
const RemoteControl = 'http://115.190.57.206/static/mine/remote-control.png'

const carList = ref([]) // 车辆列表
const selectCarId = ref('') // 选中的车辆
const deviceNo = computed(() => {
  const selectedCar = carList.value.find(car => car.id === selectCarId.value)
  return selectedCar ? selectedCar.deviceNo : ''
})

const setId = ref('') // 设置车辆id

// 超速报警开启标志
const overSpeed = ref<boolean>(false)
// 蓝牙状态 0:未连接 1:连接中 2:已连接
const status = ref(0)
// 车辆状态
const carState = ref({
  isOverspeedOn: false, // 超速报警功能是否开启。  - `true`：超速  - `false`：未超速
  // isStarted: false, // 车辆是否已启动。`true`：已启动  - `false`：未启动
  // isLocked: true, // 车辆是否处于锁车状态。  - `true`：已锁车  - `false`：未锁车
  // isArmed: false, // 车辆是否已设防（防盗报警激活）。  - `true`：已设防  - `false`：未设防
  // isMuteArmOn: false, // 车辆是否已开启静音设防。  - `true`：已开启  - `false`：未开启
  // isKeylessOn: false, // 感应启动功能是否开启。  - `true`：开启  - `false`：关闭
  // keylessType: 1, // 感应启动类型。  - `1`：感应启动  - `2`：震动启动  - `3`：一键启动
  // keylessRange: 1, // 感应启动距离。 - `1`：一档，信号强度最高 - `2`：二档，信号强度中等  - `3`：表示三档，信号强度最低。
})

// message弹窗
const showMessagePopup = ref(false) // 控制弹窗显示
const messageId = ref<number>(0) // 弹窗ID
const message = ref<string>('<view >删除该成员后，</view> <view >他将不能使用此设备。</view>') // 弹窗内容
const duration = ref(0) // 弹窗持续时间
const confirmText = ref<string>('确定') // 确认按钮文本
const showCancelBtn = ref(true) // 是否显示取消按钮
const showConfirmBtn = ref(true) // 是否显示确认按钮
const closeOnClickModal = ref(true) // 是否点击蒙层关闭弹窗
const userStore = useUserStore()

onLoad(() => {
  // connectBle()
  getCarList()
})

onHide(() => {
  EVSBikeSDK.unsubscribe(onStateChange)
})
onUnload(() => {
  EVSBikeSDK.unsubscribe(onStateChange)
})

watchEffect(async () => {
  if (selectCarId.value) {
    const selectCar = carList.value.find(car => car.id === selectCarId.value)
    // 获取车辆设置
    await getCarSetings(selectCar.deviceNo)
    // 连接蓝牙
    await connectBle()
  }
})

// 连接蓝牙
async function connectBle() {
  try {
    status.value = 1
    // 统一入口：传name或deviceId
    const device = await openAndSearchAndConnect({
      name: 'EV10C-15B6C6',
    }) as { deviceId: string }
    const res = await EVSBikeSDK.connect({
      deviceId: device.deviceId,
      type: 'at', // 设备类型
    })
    console.log('连接成功', res)
    status.value = 2
    EVSBikeSDK.subscribe(onStateChange)
    // 发送指令
    EVSBikeSDK.bleCommandsApi.sendBindOwnerCommand('166A5F83')
  }
  catch (err) {
    console.log(err)
    status.value = 0
    wx.showToast({
      title: err.message || '连接失败',
      icon: 'none',
      duration: 500,
    })
  }
}

// 蓝牙状态变化事件
function onStateChange(data) {
  console.log('设备状态变化:', data)
  const {
    operType,
    message,
    success,
    state,
  } = data
  switch (operType) {
    // 绑定用户
    case 'BIND_USER':
      // 查询车辆状态和取设备设置参数，感应启动相关
      EVSBikeSDK.bleCommandsApi.sendGetVehicleStatusCommand()
      // EVSBikeSDK.bleCommandsApi.sendGetEcuConfigCommand()
      break
      // 复制遥控器
    case 'LEARN_REMOTE':
      if (success) {
        // 复制遥控器成功
        messageId.value = 2
        duration.value = 1000
        showCancelBtn.value = false
        showConfirmBtn.value = false
        closeOnClickModal.value = true
        // confirmText.value = '立即删除'
        message.value = `复制成功!`
        showMessagePopup.value = true
      }
      else {
        // 复制遥控器失败
        uni.showToast({
          title: message || '复制失败',
          icon: 'none',
          duration: 2000,
        })
      }
      break
    default:

      break
  }

  if (!state)
    return

  carState.value = {
    ...carState.value,
    ...state,
  }

  overSpeed.value = carState.value.isOverspeedOn

  updateCarSettings()
}

// 获取车辆设置,没有则初始化设置
async function getCarSetings(deviceNo: string) {
  try {
    const res = await httpGet(`/device/vehicle/settings/get/${deviceNo}`)
    if (res.code === '200' && res.data) {
      overSpeed.value = (res.data as any).overspeedAlarm === 1
      setId.value = (res.data as any).id
      carState.value = {
        ...carState.value,
        isOverspeedOn: overSpeed.value,
      }
    }
    else {
      // 初始化车辆设置
      httpPost(`/device/vehicle/settings/create`, {
        deviceNo,
        overspeedAlarm: 0, // 超速报警开启标志 0 关闭 1 开启
      })
    }
  }
  catch (error) {
    console.error('获取车辆设置失败:', error)
  }
}

// 更新车辆设置
async function updateCarSettings() {
  const res = await httpPost(`/device/vehicle/settings/update`, {
    id: setId.value, // 车辆设置id
    deviceNo: selectCarId.value,
    overspeedAlarm: overSpeed.value ? 1 : 0,
  })
  if (res.code === '200') {
    console.log('更新车辆设置成功')
  }
  else {
    console.error('更新车辆设置失败:', res)
  }
}

// 获取车辆列表
function getCarList() {
  httpGet('/device/vehicle/user/complete').then((res) => {
    carList.value = (res.data as any).resultList
    setDefaultVehicleId(carList.value)
  }).catch((err) => {
    console.error('获取车辆列表失败:', err)
    uni.showToast({
      title: '获取车辆列表失败',
      icon: 'none',
    })
  })
}

// 默认选中车辆
function setDefaultVehicleId(carsList) {
  if (!userStore.userInfo.defaultVehicleId) {
    // 未设置默认车辆，选中第一辆
    if (carsList.length > 0) {
      selectCarId.value = carsList[0].id
    }
    return
  }
  if (carsList.length > 0) {
    const findCar = carsList.find(item => item.id === userStore.userInfo.defaultVehicleId)
    if (findCar) {
      selectCarId.value = findCar.id
    }
    else {
      selectCarId.value = carsList[0].id
    }
  }
}

function handleCancel() {
  showMessagePopup.value = false
  console.log('取消操作')
}

function handleConfirm() {
  showMessagePopup.value = false
  console.log('确认操作')
}
function handleOnConfirm({ value }) {
  // value.value = value
}

// 自动熄火
function beforeChange({ value, resolve }) {
  if (status.value !== 2) {
    uni.showToast({
      title: '请先连接蓝牙',
      icon: 'none',
      duration: 1000,
    })
    return
  }
  console.log('要改变的值:', value)
  EVSBikeSDK.bleCommandsApi.sendSetOverspeedAlarmCommand(value ? 1 : 2)
  setTimeout(() => {
    resolve(true)
    messageId.value = 1
    duration.value = 1000
    showCancelBtn.value = false
    showConfirmBtn.value = false
    closeOnClickModal.value = true
    // confirmText.value = '立即删除'
    message.value = `超速报警提示音已${value ? '开启' : '关闭'}!`
    showMessagePopup.value = true
  }, 500)
}

// 复制遥控器
function copyKeys() {
  if (status.value !== 2) {
    uni.showToast({
      title: '请先连接蓝牙',
      icon: 'none',
      duration: 1000,
    })
    return
  }
  EVSBikeSDK.bleCommandsApi.sendLearnRemoteControlCommand()
}
</script>

<template>
  <view class="bind-car">
    <wd-picker v-model="selectCarId" :columns="carList" label-key="vehicleName" value-key="id" :z-index="110" use-default-slot @confirm="handleOnConfirm">
      <view class="mt-20rpx box-border h-80rpx w-711rpx flex items-center justify-between rounded-[10rpx] bg-white px-29rpx text-24rpx">
        <view>{{ deviceNo }}</view>
        <wd-icon name="arrow-right" size="18px" />
      </view>
    </wd-picker>

    <!-- <view class="mt-53rpx rounded-[10rpx] bg-white text-24rpx">
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
    </view> -->
    <!-- <view class="mt-53rpx rounded-[10rpx] bg-white text-24rpx">
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
    </view> -->
    <!-- <view class="mt-53rpx rounded-[10rpx] bg-white text-24rpx">
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
    </view> -->
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
        <wd-switch v-model="overSpeed" :active-value="true" :inactive-value="false" active-color="#2CBD7C" :before-change="beforeChange" />
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
        <wd-button size="medium" @click="copyKeys">
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
  align-items: center;
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
