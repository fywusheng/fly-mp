<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '感应控车',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
import PointIcon from '@/static/car/point.png'

const isInductionCar = ref(true) // 感应控车
const isInductionOpenCar = ref(true) // 感应开锁
const isInductionCloseCar = ref(true) // 感应锁车
const distance = ref(1) // 感应距离
const sliderRangeValue2 = ref([50, 150]) // 滑块范围值

function onSubmitClick() {
  uni.openAppAuthorizeSetting({
    success(res) {
      console.log(res)
    },
    fail(err) {
      console.error(err)
    },
  })
  // uni.navigateBack()
  // wx.openAppAuthorizeSetting({
  // success (res) {
  //   console.log(res)
  // }
// })
}
</script>

<template>
  <view class="bind-car">
    <view class="mt-30rpx w-711rpx overflow-hidden rounded-[10rpx]">
      <view class="mt-8rpx">
        <wd-cell-group border>
          <wd-cell title="感应控车">
            <wd-switch v-model="isInductionCar" active-color="#2CBC7B" inactive-color="#E9E9EB" />
          </wd-cell>
          <wd-cell title="感应开锁">
            <wd-switch v-model="isInductionOpenCar" active-color="#2CBC7B" inactive-color="#E9E9EB" />
          </wd-cell>
          <wd-cell title="感应锁车">
            <wd-switch v-model="isInductionCloseCar" active-color="#2CBC7B" inactive-color="#E9E9EB" />
          </wd-cell>
        </wd-cell-group>
      </view>
    </view>

    <view class="mt-28rpx w-711rpx overflow-hidden rounded-[10rpx]">
      <view class="mt-8rpx">
        <wd-cell-group title="感应距离" border>
          <view class="flex items-center justify-between px-30rpx">
            <text>近</text>
            <view class="w-516rpx">
              <fg-slider
                v-model="distance"
                bar-height="6"
                :range="false"
                :min="1"
                :step="1"
                :max="3"
                custom-block
                :show-steps="true"
              >
                <template #block>
                  <image
                    class="h-38rpx w-38rpx"
                    :src="PointIcon"
                    mode="scaleToFill"
                  />
                </template>
              </fg-slider>
            </view>

            <text>远</text>
          </view>
        </wd-cell-group>
      </view>
    </view>

    <view class="mt-28rpx w-711rpx overflow-hidden rounded-[10rpx]">
      <view class="mt-8rpx">
        <wd-cell-group title="说明" border>
          <div class="px-31rpx py-41rpx text-24rpx color-[#6E6E6E]">
            感应控车开启后可实现手机靠近车辆，即可解锁同时启动 车辆。远离车辆自动断电并设防。
          </div>
        </wd-cell-group>
      </view>
    </view>

    <view class="mt-28rpx w-711rpx overflow-hidden rounded-[10rpx]">
      <view class="mt-8rpx">
        <wd-cell-group title="注意" border>
          <div class="px-31rpx py-41rpx text-24rpx color-[#6E6E6E]">
            <view>受不同手机蓝牙信号强弱及周围环境干扰，可能会偶发断 电或启动延时等情况。</view>
            <view class="color-[#DF0615]">
              *如出现断电或启动延时，拿出手机或连上蓝牙即可恢复
            </view>
          </div>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 143rpx;
  :deep() {
    .wd-cell-group__left {
      font-family: Microsoft YaHei;
      font-weight: 400;
      font-size: 30rpx;
      color: #333333;
    }
    .wd-cell__title {
      font-family: Microsoft YaHei;
      font-weight: 400;
      font-size: 30rpx;
      color: #333333;
    }
  }

}
</style>

<style lang="scss">
.slider-block {
		position: relative;
		height: 30rpx;
		width: 50rpx;
		background-color: #fff;
		border-radius: 5rpx;

		&::after,
		&::before {
			position: absolute;
			height: 10px;
			width: 3px;
			content: '';
			border-radius: 2rpx;
			display: block;
			background-color: #666;
			top: 50%;
			transform: translateY(-50%);
			left: 9px;
			box-shadow: 0px 0px 1px 1px #ccc;
		}

		&::after {
			right: 9px;
			left: unset;
		}
	}
</style>
