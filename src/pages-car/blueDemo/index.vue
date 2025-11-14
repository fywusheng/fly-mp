<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '蓝牙调试',
  },
}
</route>

<script lang="ts" setup>
// import { openAndSearchAndConnect } from '@/utils/EvsBikeSdk'

import hhznBikeSDK from '@/plugin/bleSdk/HHZNBikeSDK/HHZNBikeSDK.v1.0.3.js'

const machineNO = '205091606'
const machineKey = '10 82 8D 54 AA B7 82 85 15 69 5D AE AF F2 D9 C9 9E 30 47 E4 FD 8F AF 25 87 7D 59 21 E9 E6 5B 69 '

function onStateChange(data) {
  const {
    operType, // 指令类型
    message,
    success, // 指令是否成功
    state, // 状态值
  } = data
  console.log('data:', data)
  // 写自己的业务逻辑
  wx.hideLoading()
  wx.showModal({
    title: '监听设备响应数据',
    content: JSON.stringify(data),
    showCancel: false,
  })
}

async function connBle() {
  // if (!this.data.terNo) {
  //   wx.showToast({
  //     title: '请输入设备编号',
  //     icon: 'success',
  //   })
  //   return
  // }
  // if (!this.data.bleSecret) {
  //   wx.showToast({
  //     title: '请输入蓝牙秘钥',
  //     icon: 'success',
  //   })
  //   return
  // }
  wx.showToast({
    title: '蓝牙连接中请稍后...',
    icon: 'loading',
    mask: true,
    duration: 15000,
  })
  await hhznBikeSDK.connect({
    deviceId: machineNO,
    type: 'at', // 设备类型
  })

  // 监听设备响应数据
  hhznBikeSDK.subscribe(onStateChange)
  wx.hideLoading()
  wx.showToast({
    title: '连接成功，秘钥校验中请稍后...',
    icon: 'loading',
    mask: true,
    duration: 15000,
  })
  // 发送密码校验指令
  hhznBikeSDK.bleCommandsApi.sendBindOwnerCommand(machineKey)
}
async function closeBle() {
  try {
    wx.showToast({
      title: '请稍后...',
      icon: 'loading',
      mask: true,
      duration: 15000,
    })
    await hhznBikeSDK.disconnect()
    wx.hideLoading()
    wx.showToast({
      title: '断开成功',
      icon: 'success',
    })
  }
  catch (err) {
    console.log(err)
  }
}
function bleOperator(e) {
  wx.showToast({
    title: '请稍后...',
    icon: 'loading',
    mask: true,
    duration: 10000,
  })
  const type = e.currentTarget.dataset.type
  console.log('type:', type)
  if (type === 'open') {
    hhznBikeSDK.bleCommandsApi.sendPowerOnCommand()
  }
  else if (type === 'close') {
    hhznBikeSDK.bleCommandsApi.sendPowerOffCommand()
  }
  else if (type === 'arm') {
    hhznBikeSDK.bleCommandsApi.sendArmCommand()
  }
  else if (type === 'disarm') {
    hhznBikeSDK.bleCommandsApi.sendDisarmCommand()
  }
  else if (type === 'overspeedAlarmOpen') {
    hhznBikeSDK.bleCommandsApi.sendSetOverspeedAlarmCommand(1)
  }
  else if (type === 'overspeedAlarmClose') {
    hhznBikeSDK.bleCommandsApi.sendSetOverspeedAlarmCommand(2)
  }
  else if (type === 'keylessUnlockExpireOpen') {
    hhznBikeSDK.bleCommandsApi.sendSetKeylessUnlockExpireCommand('251231')
  }
  else if (type === 'keylessUnlockExpireClose') {
    hhznBikeSDK.bleCommandsApi.sendKeylessUnlockCloseCommand()
  }
  else if (type === 'keylessUnlockRange1') {
    hhznBikeSDK.bleCommandsApi.sendKeylessUnlockRangeCommand(1)
  }
  else if (type === 'keylessUnlockRange2') {
    hhznBikeSDK.bleCommandsApi.sendKeylessUnlockRangeCommand(2)
  }
  else if (type === 'keylessUnlockRange2') {
    hhznBikeSDK.bleCommandsApi.sendKeylessUnlockRangeCommand(2)
  }
  else if (type === 'keylessUnlockRange3') {
    hhznBikeSDK.bleCommandsApi.sendKeylessUnlockRangeCommand(3)
  }
  else if (type === 'findVehicle') {
    hhznBikeSDK.bleCommandsApi.sendFindVehicleCommand()
  }
}
function disconnect() {
  hhznBikeSDK.end()
}

// 获取车辆状态
function getCarStatus() {
  wx.showToast({
    title: '请稍后...',
    icon: 'loading',
    mask: true,
    duration: 10000,
  })
  hhznBikeSDK.bleCommandsApi.sendGetVehicleStatusCommand()
}

// 获取ECU状态
function getEcuStatus() {
  wx.showToast({
    title: '请稍后...',
    icon: 'loading',
    mask: true,
    duration: 10000,
  })
  hhznBikeSDK.bleCommandsApi.sendGetEcuConfigCommand()
}
</script>

<template>
  <view class="test-tool">
    <view class="test-tool-header">
      <!-- <cover-image src="../../assets/imgs/ble.png" style="width:40%;flex:2;margin-top: 30rpx;" /> -->
      <text style="flex:1;font-size: 60rpx;color: #fff;margin-top: 30rpx;margin-bottom: 30rpx;">
        蓝牙测试工具
      </text>
    </view>
    <view class="test-tool-body">
      <view class="input" style="margin-top:40rpx">
        <label>设备编号：</label>
        <input style="border: 1rpx solid #ccc;width:65%" name="plateCode" maxlength="32" placeholder="请输入设备编号" model:value="{{terNo}}">
      </view>
      <view class="input">
        <label>蓝牙秘钥：</label>
        <input style="border: 1rpx solid #ccc;width:65%" name="bleSecret" placeholder="请输入蓝牙秘钥" model:value="{{bleSecret}}">
      </view>
      <view class="test-tool-button-group">
        <view class="test-tool-button" @click="connBle">
          <view style="flex: 75%;font-size: 40rpx;">
            连接蓝牙
          </view>
        </view>
        <view class="test-tool-button" style="margin-left: 30rpx;" @click="closeBle">
          <view style="flex: 75%;font-size: 40rpx;">
            断开蓝牙
          </view>
        </view>
      </view>
      <view class="test-tool-button-group">
        <view class="test-tool-button" @click="getCarStatus">
          <view style="flex: 75%;font-size: 40rpx;">
            获取车辆状态
          </view>
        </view>
        <view class="test-tool-button" style="margin-left: 30rpx;" @click="getEcuStatus">
          <view style="flex: 75%;font-size: 40rpx;">
            获取ECU无线状态
          </view>
        </view>
      </view>
      <view class="test-tool-button-group">
        <view class="test-tool-button" data-type="open" @click="bleOperator">
          <view style="flex: 75%;font-size: 40rpx;">
            开锁
          </view>
        </view>
        <view class="test-tool-button" style="margin-left: 30rpx;" data-type="close" @click="bleOperator">
          <view style="flex: 75%;font-size: 40rpx;">
            关锁
          </view>
        </view>
      </view>
      <view class="test-tool-button-group">
        <view class="test-tool-button" data-type="arm" @click="bleOperator">
          <view style="flex: 75%;font-size: 40rpx;">
            设防
          </view>
        </view>
        <view class="test-tool-button" style="margin-left: 30rpx;" data-type="disarm" @click="bleOperator">
          <view style="flex: 75%;font-size: 40rpx;">
            撤防
          </view>
        </view>
      </view>
      <view class="test-tool-button-group">
        <view class="test-tool-button" data-type="overspeedAlarmOpen" @click="bleOperator">
          <view style="flex: 75%;font-size: 40rpx;">
            超速报警开启
          </view>
        </view>
        <view class="test-tool-button" style="margin-left: 30rpx;" data-type="overspeedAlarmClose" @click="bleOperator">
          <view style="flex: 75%;font-size: 40rpx;">
            超速报警关闭
          </view>
        </view>
      </view>
      <view class="test-tool-button-group">
        <view class="test-tool-button" data-type="keylessUnlockExpireOpen" @click="bleOperator">
          <view style="flex: 75%;font-size: 40rpx;">
            开启感应
          </view>
        </view>
        <view class="test-tool-button" style="margin-left: 30rpx;" data-type="keylessUnlockExpireClose" @click="bleOperator">
          <view style="flex: 75%;font-size: 40rpx;">
            关闭感应
          </view>
        </view>
      </view>
      <view class="test-tool-button-group">
        <view class="test-tool-button" data-type="keylessUnlockRange1" @click="bleOperator">
          <view style="flex: 75%;font-size: 40rpx;">
            无感解锁距离1
          </view>
        </view>
        <view class="test-tool-button" style="margin-left: 30rpx;" data-type="keylessUnlockRange2" @click="bleOperator">
          <view style="flex: 75%;font-size: 40rpx;">
            无感解锁距离2
          </view>
        </view>
      </view>
      <view class="test-tool-button-group">
        <view class="test-tool-button" data-type="keylessUnlockRange3" @click="bleOperator">
          <view style="flex: 75%;font-size: 40rpx;">
            无感解锁距离3
          </view>
        </view>
      </view>
      <view class="test-tool-button-group">
        <view class="test-tool-button" style="max-width: 48%;" data-type="findVehicle" @click="bleOperator">
          <view style="flex: 75%;font-size: 40rpx;">
            寻车
          </view>
        </view>
      </view>
      <view class="test-tool-version">
        <view>天津华慧智能科技有限公司</view>
        <view>v1.0.0</view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.btn {
  border-radius: 200rpx;
}

.input {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 100rpx;
  background: #fff;
  width: 90%;
  padding-left: 40rpx;
}

/* pages/test/test.wxss */
.test-tool {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.test-tool-header {
  display: flex;
  flex-direction: column;
  flex: 3;
  width: 100%;
  height: 100%;
  background-color: #00b26a;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.test-tool-body {
  display: flex;
  flex-direction: column;
  flex: 6;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 100%;
  height: 100%;
}

.test-tool-version {
  position: absolute;
  bottom: 30rpx;
  flex: 1;
  font-size: 40rpx;
  color: #00b26a;
}
.test-tool-button-group {
  width: 90%;
  display: flex;
  /* flex-direction: column; */
}

.test-tool-button {
  /* width: 50%; */
  flex: 1;
  height: 60rpx;
  margin-top: 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 20rpx;
  flex-shrink: 0;
  background-color: #00b26a;
  color: #fff;
  display: flex;
  flex-direction: row;
}
</style>
