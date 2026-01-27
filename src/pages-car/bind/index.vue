<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '绑定设备',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
import { getColorImg } from '@/utils'
import { httpGet } from '@/utils/http'
import { getImageUrl } from '@/utils/image'

const ScanDescIcon = getImageUrl('/car/scan-desc.png')
const ScanIcon = getImageUrl('/car/scan.png')

const code = ref('')
const name = ref('')
const brand = ref('飞鸽')
const color = ref('')
const colorCode = ref('')

// 定义columns的类型
interface Column {
  dictCode: string
  dictName: string
}
const columns = ref<Column[]>([]) // 颜色列表

onLoad(() => {
  getCarColor()
})

function getCarColor() {
  httpGet('/common/dict/vehicle_color').then((res) => {
    if (res.code === '200') {
      columns.value = res.data as Column[]
    }
    else {
      console.log('获取车辆颜色列表失败:', res)
    }
  })
}

function onConfirm({ value, selectedItems }) {
  console.log('选中的车辆颜色:', value, selectedItems)
  color.value = selectedItems.dictName
  colorCode.value = selectedItems.dictCode
}

function onScanClick() {
  uni.scanCode({
    success: (res) => {
      // 设备编号+&+蓝牙名称+&+出厂日期
      // 1905070061BA&EV12C-1961BA&250919001
      // 扫描内容你只要读取第一段字符串、显示第一段字符串、保存第一段字符串
      const content = res.result
      if (content.includes('&')) {
        code.value = content.split('&')[0]
        name.value = content.split('&')[1]
      }
      else {
        code.value = content
      }
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

function onSubmitClick() {
  if (!code.value || !name.value || !color.value) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none',
    })
    return
  }

  // 进行页面跳转传递数据
  uni.navigateTo({
    url: `/pages-car/addMaster/index?info= ${encodeURIComponent(
      JSON.stringify({
        name: name.value,
        brand: brand.value,
        colorCode: colorCode.value,
        code: code.value,
      }),
    )}`,
    success: (res) => {
      // 通过eventChannel向被打开页面传送数据
      res.eventChannel.emit('formData', { name: name.value, brand: brand.value, colorCode: colorCode.value, code: code.value })
    },

  })
}

function onGoMenuClick() {
  uni.navigateTo({
    url: '/pages-car/keyBind/index',
  })
}
</script>

<template>
  <view class="bind-car">
    <image
      class="mt-30rpx h-465rpx w-663rpx"
      :src="colorCode ? getColorImg(colorCode, 'bindCar') : ScanDescIcon"
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
      <view class="overflow-hidden rounded-10rpx">
        <wd-cell-group border>
          <wd-input v-model="code" label-width="30%" type="text" label="车辆编码" required placeholder="输入电动车的SN编码" />
        </wd-cell-group>
      </view>
    </view>
    <!-- <view class="font-24rpx mt-28rpx" @click="onGoMenuClick">
      <text class="color-[#6E6E6E]">
        没有二维码？
      </text>
      <text class="color-[#239AF6]">
        请点击此处进行按钮绑定
      </text>
    </view> -->
    <view class="mt-28rpx w-711rpx">
      <view class="mt-8rpx overflow-hidden rounded-10rpx">
        <wd-cell-group border>
          <wd-input v-model="name" label-width="30%" type="text" label="车辆名字" placeholder="请输入车辆名称" />
          <wd-input v-model="brand" label-width="30%" type="text" label="品牌" placeholder="请输入品牌" :readonly="true" />
          <wd-cell value="内容">
            <template #title>
              <view class="text-24rpx">
                颜色
              </view>
            </template>

            <wd-picker v-model="color" :columns="columns" value-key="dictCode" label-key="dictName" use-default-slot @confirm="onConfirm">
              <view class="flex items-center justify-end">
                <view v-if="color" class="mr-15rpx text-24rpx">
                  {{ color }}
                </view>
                <view v-else class="mr-15rpx color-[#C8C8C8]">
                  请选择颜色
                </view>
                <wd-icon name="arrow-down" size="20px" color="#6E6E6E" />
              </view>
            </wd-picker>
          </wd-cell>
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
