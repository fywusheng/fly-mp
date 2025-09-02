<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '编辑车辆',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
import { getColorImg } from '@/utils'
import { httpGet, httpPost } from '@/utils/http'

const CarGreenIcon = 'http://121.89.87.166/static/mine/bind-car-green.png'

const name = ref('')
const brand = ref('飞鸽')
const colorCode = ref('')
let carInfo = {}// 车辆信息

// 定义columns的类型
interface Column {
  dictCode: string
  dictName: string
}
const columns = ref<Column[]>([]) // 颜色列表

const color = computed(() => {
  const found = columns.value.find(item => item.dictCode === colorCode.value)
  return found ? found.dictName : ''
})

onMounted(() => {
  // 获取车辆颜色
  getCarColor()
  // 获取车辆信息
  const instance = getCurrentInstance()?.proxy as { getOpenerEventChannel?: () => UniApp.EventChannel }
  if (instance?.getOpenerEventChannel) {
    const eventChannel = instance.getOpenerEventChannel()
    eventChannel.on('editCar', (info: any) => {
      console.log('接收到的车辆信息:', info)
      carInfo = info
      name.value = info.vehicleName || ''
      brand.value = info.brand || '飞鸽'
      colorCode.value = info.colorCode || ''
    })
  }
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
  colorCode.value = selectedItems.dictCode
}

async function onSubmitClick() {
  if (!name.value || !colorCode.value) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none',
    })
    return
  }

  // 更新车辆信息
  const res = await httpPost('/device/vehicle/update', {
    ...carInfo,
    vehicleName: name.value,
    brand: brand.value,
    colorCode: colorCode.value,
  })

  if (res.code === '200') {
    uni.showToast({
      title: '更新成功',
      icon: 'success',
      duration: 1000,
    })
    // 返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  }
  else {
    uni.showToast({
      title: '更新失败',
      icon: 'none',
    })
  }
}
</script>

<template>
  <view class="bind-car">
    <image
      class="mt-30rpx h-465rpx w-663rpx"
      :src="getColorImg(colorCode, 'bindCar')"
      mode="scaleToFill"
    />

    <view class="runded-[10rpx] mt-20rpx w-711rpx overflow-hidden">
      <view>
        <wd-cell-group border title="车辆信息">
          <wd-input v-model="name" label-width="30%" type="text" label="车辆名字" placeholder="请输入车辆名称" />
          <wd-input v-model="brand" label-width="30%" type="text" label="品牌" placeholder="请输入品牌" :disabled="true" />
          <wd-cell value="内容">
            <template #title>
              <view class="text-24rpx">
                颜色
              </view>
            </template>

            <wd-picker v-model="colorCode" :columns="columns" use-default-slot value-key="dictCode" label-key="dictName" @confirm="onConfirm">
              <view class="flex items-center justify-end">
                <view v-if="color" class="mr-15rpx text-24rpx">
                  {{ color }}
                </view>
                <view v-else class="mr-15rpx text-24rpx color-[#C8C8C8]">
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
  :deep() {
    .wd-input__inner {
      text-align: right;
    }
    .wd-input__label-inner,.wd-input__inner {
      font-size: 24rpx;
    }
  }
}
</style>
