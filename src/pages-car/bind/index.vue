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
import ScanDescIcon from '@/static/car/scan-desc.png'
import ScanIcon from '@/static/car/scan.png'

const code = ref('')
const name = ref('')
const brand = ref('飞鸽')
const color = ref('')
const columns = ref(['选项1', '选项2', '选项3', '选项4', '选项5', '选项6', '选项7']) // 颜色列表

function onScanClick() {
  uni.scanCode({
    onlyFromCamera: true,
    success: (res) => {
      code.value = res.result
      // 根据code获取车辆信息
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

  // 提交绑定信息
  uni.showLoading({
    title: '提交中...',
  })

  // 模拟提交成功
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: '绑定成功',
      icon: 'success',
    })
    // 跳转到菜单页面
    uni.navigateTo({
      url: '/pages-car/menu/index',
    })
  }, 1000)
}

function onGoMenuClick() {
  uni.navigateTo({
    url: '/pages-car/menu/index',
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
      <view class="">
        <wd-cell-group border>
          <wd-input v-model="code" label-width="30%" type="text" label="车辆编码" required placeholder="输入电动车的SN编码" />
        </wd-cell-group>
      </view>
    </view>
    <view class="font-24rpx mt-28rpx" @click="onGoMenuClick">
      <text class="color-[#6E6E6E]">
        没有二维码？
      </text>
      <text class="color-[#239AF6]">
        请点击此处进行按钮绑定
      </text>
    </view>
    <view class="mt-28rpx w-711rpx">
      <view class="mt-8rpx">
        <wd-cell-group border>
          <wd-input v-model="name" label-width="30%" type="text" label="车辆名字" placeholder="请输入车辆名称" />
          <wd-input v-model="brand" label-width="30%" type="text" label="品牌" placeholder="请输入品牌" :disabled="true" />
          <wd-cell value="内容">
            <template #title>
              <view class="text-24rpx">
                颜色
              </view>
            </template>

            <wd-picker v-model="color" :columns="columns" use-default-slot>
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
    .wd-input__label-inner {
      font-size: 24rpx;
    }
  }
}
</style>
