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
const ScanDescIcon = 'http://121.89.87.166/static/car/scan-desc.png'
const CarGreenIcon = 'http://121.89.87.166/static/mine/bind-car-green.png'

const code = ref('')
const name = ref('')
const brand = ref('飞鸽')
const color = ref('')
const columns = ref(['选项1', '选项2', '选项3', '选项4', '选项5', '选项6', '选项7']) // 颜色列表

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
</script>

<template>
  <view class="bind-car">
    <image
      class="mt-30rpx h-465rpx w-663rpx"
      :src="CarGreenIcon"
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

            <wd-picker v-model="color" :columns="columns" use-default-slot>
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
