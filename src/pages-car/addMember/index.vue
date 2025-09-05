<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '成员信息',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<script lang="ts" setup>
// const ShareIcon = 'http://121.89.87.166/static/common/share.png'
import ShareIcon from '@/static/share.png'

// const ScanDescIcon = 'http://121.89.87.166/static/car/scan-desc.png'
import { httpGet, httpPost, httpPut } from '@/utils/http'

const SuccessDefault = 'http://121.89.87.166/static/mine/success-default.png'
const YellowTips = 'http://121.89.87.166/static/mine/yellow-tips.png'

const name = ref('') // 车辆名称
const memberName = ref('') // 姓名
const mobile = ref('') // 手机号
const relationship = ref('') // 关系
const vehicleId = ref('') // 车辆id
const memberId = ref('') // 成员id

const addFlag = ref(true) // 添加成功标志
const showShare = ref(false) // 分享弹窗

// 定义columns的类型
interface Column {
  dictCode: string
  dictName: string
}
const columns = ref<Column[]>([]) // 关系列表
const relationshipName = computed(() => {
  const selected = columns.value.find(item => item.dictCode === relationship.value)
  return selected ? selected.dictName : ''
})

onMounted(() => {
  const instance = getCurrentInstance()?.proxy as { getOpenerEventChannel?: () => UniApp.EventChannel }
  if (instance?.getOpenerEventChannel) {
    const eventChannel = instance.getOpenerEventChannel()
    eventChannel.on('addMember', (info: any) => {
      console.log(info, '接收到的车辆信息:')
      name.value = info.value.vehicleName || ''
      vehicleId.value = info.value.id || ''
    })
    eventChannel.on('editMember', (info: any) => {
      console.log(info, '接收到的成员信息:')
      name.value = info.vehicleName || ''
      vehicleId.value = info.vehicleId || ''
      memberId.value = info.id || ''
      memberName.value = info.memberName || ''
      mobile.value = info.mobile || ''
      relationship.value = info.relationship || ''
    })
  }
  getRelationship()
})

// 分享好友
onShareAppMessage(() => {
  return {
    title: '飞鸽畅行', // 分享标题
    path: `/pages/index/index`, // 分享链接
    imageUrl: ShareIcon, // 分享图片
  }
})

function getRelationship() {
  httpGet('/common/dict/owner_relationship').then((res) => {
    if (res.code === '200') {
      columns.value = res.data as Column[]
    }
    else {
      console.log('获取车辆颜色列表失败:', res)
    }
  })
}

// 提交信息
async function onSubmitClick() {
  if (!memberName.value || !mobile.value || !relationship.value) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none',
    })
  }
  if (memberId.value) {
    // 编辑成员信息
    await updateCarInfo()
  }
  else {
    // 添加成员信息
    await addMemberInfo()
  }
}
// 添加车辆
async function addMemberInfo() {
  const res = await httpPost('/user/mini/vehicle-share/members', {
    vehicleId: vehicleId.value,
    memberId: memberId.value,
    memberName: memberName.value,
    mobile: mobile.value,
    relationship: relationship.value,
  })

  if (res.code === '200') {
    addFlag.value = true
  }
  else {
    uni.showToast({
      title: res.message || '添加失败',
      icon: 'none',
    })
  }
}

// 更新车辆信息
async function updateCarInfo() {
  const res = await httpPut('/user/mini/vehicle-share/members/edit', {
    vehicleId: vehicleId.value,
    memberId: memberId.value,
    memberName: memberName.value,
    mobile: mobile.value,
    relationship: relationship.value,
  })

  if (res.code === '200') {
    uni.showToast({
      title: '更新成功',
      icon: 'success',
      duration: 1000,
    })
    setTimeout(() => {
      onCompleteClick()
    }, 1000)
  }
  else {
    uni.showToast({
      title: res.message || '更新失败',
      icon: 'none',
    })
  }
}

// 完成
function onCompleteClick() {
  uni.$emit('refreshMember', true)
  uni.navigateBack()
}
</script>

<template>
  <view class="bind-car">
    <template v-if="!addFlag">
      <view class="mt-28rpx w-711rpx overflow-hidden rounded-10rpx">
        <view class="mt-8rpx">
          <wd-cell-group border>
            <wd-input v-model="name" custom-style="text-align:left" label-width="15%" type="text" label="车辆名字" placeholder="请输入车辆名称" />
            <wd-input v-model="memberName" custom-style="text-align:right" label-width="30%" type="text" label="姓名" placeholder="请输入姓名" />
            <wd-input v-model="mobile" custom-style="text-align:right" label-width="30%" type="text" label="手机号" placeholder="请输入手机号" />
            <wd-cell value="与车主关系">
              <template #title>
                <view class="text-24rpx">
                  与车主关系
                </view>
              </template>

              <wd-picker v-model="relationship" label-key="dictName" value-key="dictCode" :columns="columns" use-default-slot>
                <view class="flex items-center justify-end">
                  <view v-if="relationship" class="mr-15rpx text-24rpx">
                    {{ relationshipName }}
                  </view>
                  <view v-else class="mr-15rpx text-24rpx color-[#C8C8C8]">
                    请选择
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
    </template>
    <template v-else>
      <image
        class="mt-230rpx h-288rpx w-348rpx"
        :src="SuccessDefault"
        mode="scaleToFill"
      />
      <view class="mt-261rpx flex items-center justify-between">
        <view class="complete-btn" @click="onCompleteClick">
          完成
        </view>
        <view class="relative">
          <view class="absolute right-0 top-[-112rpx] h-92rpx w-260rpx">
            <image
              class="absolute absolute right-0 top-0 h-100% w-100%"
              :src="YellowTips"
              mode="scaleToFill"
            />
            <view class="relative mt-10rpx px-38rpx text-24rpx text-[#6E6E6E]">
              去提醒朋友查收 一下吧！
            </view>
          </view>
          <view class="notice-btn" @click="showShare = true">
            通知成员
          </view>
        </view>
      </view>
    </template>
    <fg-share v-model:show="showShare" />
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
  .complete-btn,
  .notice-btn {
    background-color: #239AF6;
    color: white;
    border-radius: 40rpx;
    // padding: 12rpx 24rpx;
    font-size: 28rpx;
    width: 260rpx;
    height: 80rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .notice-btn  {
    background-color: #2CBD7C;
    margin-left: 70rpx;
  }
  :deep() {
    // .wd-input__inner {
    //   text-align: right;
    // }
    .wd-input__label-inner,.wd-input__inner {
      font-size: 24rpx;
    }
  }
}
</style>
