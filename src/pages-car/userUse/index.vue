<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '飞鸽电动车',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
import { getImageUrl } from '@/utils/image'

const UserBind = getImageUrl('/mine/user-bind.png')
const UserUnbind = getImageUrl('/mine/user-unbind.png')

const tabs = ref(['绑定', '解绑'])
const tab = ref('绑定')
</script>

<template>
  <view class="page-content">
    <view class="text-center text-40rpx">
      蓝牙无法连接
    </view>
    <view class="mb-60rpx px-30rpx">
      <view class="title">
        情况1
      </view>
      <view class="my-29rpx text-24rpx">
        手机蓝牙已打开，小程序连接蓝牙时，仍提示请打开蓝牙或 点击连接蓝牙，蓝牙图标秒黑。
      </view>
      <view class="">
        <view class="triangle ml-40rpx" />
        <view class="bg-[#ABE5CB] px-40rpx py-30rpx">
          <view class="mb-10rpx font-bold">
            原因：没有打开微信调用蓝牙的权限
          </view>
          <view class="mb-10rpx">
            解决：苹果手机:手机设置→搜索“微信”→打开 蓝牙权限
          </view>
          <view>安卓手机：手机设置→应用设置→搜索“</view>
        </view>
      </view>
    </view>
    <view class="mb-60rpx px-30rpx">
      <view class="title">
        情况2
      </view>
      <view class="my-29rpx text-24rpx">
        点蓝牙图标连接。一直连接中
      </view>
      <view class="">
        <view class="triangle ml-40rpx" />
        <view class="bg-[#ABE5CB] px-40rpx py-30rpx">
          <view class="mb-10rpx font-bold">
            原因1：绑定不正确
          </view>
          <view class="mb-35rpx">
            解决：需要扫描吊牌背面的设备二维码绑定,不能是任意的编码。
          </view>
          <view class="mb-10rpx font-bold">
            原因2：蓝牙信号问题
          </view>
          <view class="mb-35rpx">
            解决：打开手机设置，关闭蓝牙后打开蓝牙点小程序右上角3点重新进入小程序连接蓝牙
          </view>
          <view class="mb-10rpx font-bold">
            原因3：蓝牙被占用
          </view>
          <view class="mb-35rpx">
            解决：蓝牙同时只能连接1台手机，可以检查现场是否有其他分享的用户手机占用蓝牙。
          </view>
          <view class="mb-10rpx font-bold">
            原因4：直接从手机蓝牙连接并配对，配对流程错误。
          </view>
          <view class="mb-0rpx">
            解决：先取消手机蓝牙EV开头的配对，再到小程序连接蓝牙，再弹出配对后点确认。
          </view>
        </view>
      </view>
    </view>
    <view class="mb-60rpx px-30rpx">
      <view class="title">
        情况3
      </view>
      <view class="my-29rpx text-24rpx">
        绑定多台车，新绑定的无法连接
      </view>
      <view class="">
        <view class="triangle ml-40rpx" />
        <view class="bg-[#ABE5CB] px-40rpx py-30rpx">
          <view class="mb-10rpx font-bold">
            原因：没有切换到对应的车辆
          </view>
          <view class="mb-10rpx">
            解决：点击首页页面左上角→车辆名称→切换到新绑定的 车辆。
          </view>
        </view>
      </view>
    </view>
    <view class="mb-60rpx px-30rpx">
      <view class="title">
        情况4
      </view>
      <view class="my-29rpx text-24rpx">
        分享的用户无法使用
      </view>
      <view class="">
        <view class="triangle ml-40rpx" />
        <view class="bg-[#ABE5CB] px-40rpx py-30rpx">
          <view class="mb-10rpx font-bold">
            原因：设备未激活
          </view>
          <view class="mb-10rpx">
            解决：车主绑定车辆后，需要连接上蓝牙正常操作，以激活设备，然后分享给其他用户。
          </view>
        </view>
      </view>
    </view>
    <view class="px-30rpx">
      <view class="title">
        情况5
      </view>
      <view class="my-29rpx text-24rpx">
        新安装无定位或定位不准
      </view>
      <view class="">
        <view class="triangle ml-40rpx" />
        <view class="bg-[#ABE5CB] px-40rpx py-30rpx">
          <view class="mb-10rpx font-bold">
            原因：新设备激活中
          </view>
          <view class="mb-10rpx">
            解决：需要在空旷的地方3-5分钟，获取实时定位。
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page-content {
  min-height: 100vh;
  background: #ffffff;
  padding-top: 66rpx;
  padding-bottom: 160rpx;
  box-sizing: border-box;

  .title {
    width: 100rpx;
    height: 50rpx;
    font-weight: 400;
    font-size: 24rpx;
    color: #FFFFFF;
    line-height: 30rpx;
    background: #2CBD7C;
    border-radius: 20rpx 20rpx 0px 20rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    &::after {
      content: '';
      position: absolute;
      left: 30rpx;
      bottom: 0rpx;
      width: 658rpx;
      height: 1rpx;
      background: #2CBD7C;
      border-radius: 2rpx;
    }
  }
  .triangle {
    width: 0;
    height: 0;
    border-left: 15rpx solid transparent;  /* 左侧边框透明 */
    border-right: 15rpx solid transparent; /* 右侧边框透明 */
    border-bottom: 30rpx solid #ABE5CB;  /* 下边框显示颜色 */
  }

  :deep() {
    .custom-tabs {
      .wd-tabs__line {
        background: #EB3C59;
      }
      .wd-tabs__nav-item-text {
        font-size: 35rpx;
      }
    }
  }
}
</style>
