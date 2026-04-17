<script lang="ts" setup>
import { getImageUrl } from '@/utils/image'

definePage({
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '车辆信息',
    navigationBarBackgroundColor: '#ffffff',
  },
})

const ScanDescIcon = getImageUrl('/car/vin-code-icon.png')
const ScanIcon = getImageUrl('/car/scan.png')

const vinCode = ref('')
const productCode = ref('')
const carNumber = ref('')

const name = ref('')
const brand = ref('')
const colorCode = ref('')
const code = ref('')

onLoad((options) => {
  const info = JSON.parse(decodeURIComponent(options.info))
  name.value = info.name
  brand.value = info.brand
  colorCode.value = info.colorCode
  code.value = info.code
})

function onScanClick() {
  uni.scanCode({
    success: (res) => {
      // 扫描产品合格证上的二维码，解析字符串，如：http://117.133.57.142:8081/biz/ev/EvBicycleCertView.aspx?vinCode=250022602050109
      // 截取vinCode，填入车架号字段。如果用户解绑，重新进行设备绑定时，车架号信息从后台获取，在前端显示。
      // 车架号：必填项
      // 产品电子合格证：显示扫码解析的字符床，即电子合格证下载路径
      // 车牌号：非必填
      const url = res.result
      vinCode.value = getVinCode(url)
      productCode.value = url
    },
    fail: (err) => {
      console.log(err)
      uni.showToast({
        title: '扫码失败，请重试',
        icon: 'none',
      })
    },
  })
}

function getVinCode(url: string) {
  const regex = /vinCode=([A-Za-z0-9]+)/
  const match = url.match(regex)
  return match ? match[1] : ''
}

function onSubmitClick() {
  if (!vinCode.value) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none',
    })
    return
  }

  // 进行页面跳转传递数据
  uni.navigateTo({
    url: `/pages-car/addMaster/index`,
    success: (res) => {
      // 通过eventChannel向被打开页面传送数据
      res.eventChannel.emit('formData', {
        name: name.value,
        brand: brand.value,
        colorCode: colorCode.value,
        code: code.value,
        vinCode: vinCode.value,
        productCode: productCode.value,
        carNumber: carNumber.value,
      })
    },

  })
}
</script>

<template>
  <view class="bind-car">
    <image
      class="mt-30rpx h-465rpx w-663rpx"
      :src="ScanDescIcon"
      mode="scaleToFill"
    />
    <view class="mt-62rpx h-80rpx w-400rpx flex items-center justify-center rounded-[40rpx] bg-[#239AF6] color-white" @click="onScanClick">
      <image
        class="mr-30rpx h-40rpx w-40rpx"
        :src="ScanIcon"
        mode="scaleToFill"
      />
      <text>扫一扫</text>
    </view>

    <view class="mt-60rpx w-711rpx">
      <view class="mt-8rpx overflow-hidden rounded-10rpx">
        <wd-cell-group border>
          <wd-input v-model="vinCode" required label-width="30%" type="text" label="车架号" placeholder="输入电动车产品合格证上的整车编码 " />
          <wd-input v-model="productCode" label-width="30%" type="text" label="产品电子合格证" placeholder="" :readonly="true" />
          <wd-input v-model="carNumber" label-width="30%" type="text" label="车牌号" placeholder="" :readonly="true" />
        </wd-cell-group>
      </view>
    </view>

    <view class="mt-62rpx h-80rpx w-710rpx flex items-center justify-center rounded-[40rpx] bg-[#239AF6] color-white" @click="onSubmitClick">
      下一步
    </view>
  </view>
</template>

<style lang="scss" scoped>
.bind-car {
  background-color: #DDE3EC;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  // justify-content: center;
  align-items: center;
  // padding: 16px;
  // border-radius: 8px;
  :deep() {
    .wd-input__inner {
      text-align: right;
    }
    .wd-input__label-inner {
      font-size: 24rpx;
      color: #333333;
    }
    .wd-input__inner {
      font-size: 24rpx;
    }
  }
}
</style>
