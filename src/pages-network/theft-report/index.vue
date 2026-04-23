<script setup lang="ts">
import dayjs from 'dayjs'
import { httpGet, httpPost } from '@/utils/http'
import { getImageUrl } from '@/utils/image'

definePage({
  layout: 'default',
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '失窃上报',
    backgroundColor: '#ffffff',
  },
})

const DateIcon = getImageUrl('/network/date.png')

// 定义表单数据类型
interface FormData {
  mobile: string
  deviceNo: string
  reporterName: string
  theftTimeStart: string
  theftTimeEnd: string
  theftLocation: string
}

// 表单数据响应式
const formData = reactive<FormData>({
  mobile: '',
  deviceNo: '',
  reporterName: '',
  theftTimeStart: '',
  theftTimeEnd: '',
  theftLocation: '',
})

// 车辆选择器状态
const carPickerShow = ref(false)
const carValue = ref('')
const carPickerValue = ref('')
const carList = ref([])
const carName = ref('')
const theftTime = ref('')

// 日期选择器状态
const calendarShow = ref(false)
const calendarValue = ref(0)

// 初始化
onMounted(() => {
  // formData.theftTime = `${dayjs().format('YYYY-MM-DD HH:mm:ss')} - ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
  getCarList()
})

// 获取车辆列表
async function getCarList() {
  const res = await httpGet('/device/vehicle/user/complete')
  if (res.code === '200') {
    carList.value = (res.data as any).resultList || []
  }
  else {
    console.log(res)
  }
}

// 车辆选择确认
function onCarConfirm({ selectedItems }) {
  carName.value = selectedItems.vehicleName
  formData.deviceNo = selectedItems.deviceNo
  carValue.value = selectedItems.id
  carPickerShow.value = false
}

// 日期选择确认
function onDateConfirm(date) {
  const startDate = new Date(date.value[0])
  const endDate = new Date(date.value[1])
  formData.theftTimeStart = dayjs(startDate).format('YYYY-MM-DD HH:mm:ss')
  formData.theftTimeEnd = dayjs(endDate).format('YYYY-MM-DD HH:mm:ss')
  theftTime.value = `${formData.theftTimeStart} - ${formData.theftTimeEnd}`
  calendarShow.value = false
}

// 表单提交验证
async function submitForm() {
  // 手机号正则验证
  const phoneReg = /^1[3-9]\d{9}$/

  // 必填项验证
  if (!formData.deviceNo) {
    uni.showToast({
      title: '请选择车辆名称',
      icon: 'none',
    })
    return
  }

  if (!formData.reporterName) {
    uni.showToast({
      title: '请输入车主姓名',
      icon: 'none',
    })
    return
  }

  if (!formData.mobile || !phoneReg.test(formData.mobile)) {
    uni.showToast({
      title: '请输入正确的联系电话',
      icon: 'none',
    })
    return
  }

  if (!theftTime.value) {
    uni.showToast({
      title: '请选择失窃时间',
      icon: 'none',
    })
    return
  }

  if (!formData.theftLocation) {
    uni.showToast({
      title: '请输入失窃地点',
      icon: 'none',
    })
  }

  const res = await httpPost('/device/mini/theft/report', formData)
  if (res.code === '200') {
    uni.showToast({
      title: '上报成功',
      icon: 'success',
    })
  }
  else {
    uni.showToast({
      title: res.message,
      icon: 'none',
    })
  }
}
</script>

<template>
  <view class="theft-report">
    <!-- 表单容器 -->
    <div class="form-container">
      <!-- 表单卡片 -->
      <div class="form-card">
        <div class="form-title">
          失窃上报信息登记
        </div>

        <!-- 表单列表 -->
        <div class="form-list">
          <!-- 车辆名称（必填） -->
          <div class="form-item">
            <div class="form-label">
              <span class="required">*</span>车辆名称
            </div>

            <div class="form-input-wrap">
              <wd-picker
                v-model="carPickerValue"
                :columns="carList"
                use-default-slot
                label-key="vehicleName"
                value-key="id"
                class="w-100%"
                @confirm="onCarConfirm"
              >
                <view class="w-495rpx flex items-center justify-items-end">
                  <input
                    v-model="formData.carName"
                    class="form-input"
                    type="text"
                    placeholder="从我的车辆列表中选择"
                    :disabled="true"
                  >
                  <view class="ml-20rpx">
                    <wd-icon name="chevron-right" size="22px" />
                  </view>
                </view>
              </wd-picker>
            </div>
          </div>

          <!-- 设备编号（选填） -->
          <div class="form-item">
            <div class="form-label">
              设备编号
            </div>
            <div class="form-input-wrap">
              <input
                v-model="formData.deviceNo"
                class="form-input"
                type="text"
                placeholder="输入设备编码"
              >
            </div>
          </div>

          <!-- 车主姓名（必填） -->
          <div class="form-item">
            <div class="form-label">
              <span class="required">*</span>车主姓名
            </div>
            <div class="form-input-wrap">
              <input
                v-model="formData.reporterName"
                class="form-input"
                type="text"
                placeholder="请输入姓名"
              >
            </div>
          </div>

          <!-- 联系电话（必填） -->
          <div class="form-item">
            <div class="form-label">
              <span class="required">*</span>联系电话
            </div>
            <div class="form-input-wrap">
              <input
                v-model="formData.mobile"
                class="form-input"
                type="tel"
                placeholder="请输入联系电话"
              >
            </div>
          </div>

          <!-- 失窃时间（必填） -->
          <div class="form-item">
            <div class="form-label">
              <span class="required">*</span>失窃时间
            </div>
            <div class="form-input-wrap">
              <wd-calendar
                v-model="calendarValue"
                type="datetimerange"
                @confirm="onDateConfirm"
              >
                <view class="w-495rpx flex items-center justify-items-end">
                  <input
                    v-model="theftTime"
                    class="form-input"
                    type="text"
                    placeholder="请输入年月日、时间段"
                    :disabled="true"
                  >
                  <image
                    class="ml-10rpx h-28rpx w-30rpx"
                    :src="DateIcon"
                    mode="scaleToFill"
                  />
                </view>
              </wd-calendar>
            </div>
          </div>

          <!-- 失窃地点（必填） -->
          <div class="form-item">
            <div class="form-label">
              <span class="required">*</span>失窃地点
            </div>
            <div class="form-input-wrap">
              <input
                v-model="formData.theftLocation"
                class="form-input"
                type="text"
                placeholder="请输入失窃地点"
              >
              <i class="icon icon-location" />
            </div>
          </div>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="submit-btn-wrap">
        <button class="submit-btn" @click="submitForm">
          点击上报
        </button>
      </div>
    </div>
  </view>
</template>

<style lang="scss" scoped>
.theft-report {
  height: 100vh;
  background: #DDE3EC;
}
/* 顶部导航栏 */
.header {
  height: 44px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 1px solid #eee;
}

/* 表单容器 */
.form-container {
  padding: 10px 15px;
  overflow-y: auto;
  height: calc(100vh - 44px);
}

/* 表单卡片 */
.form-card {
  background-color: #fff;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 100rpx;
  position: relative;
}

/* 表单标题 - 调整横线到左右边界 */
.form-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
  padding-bottom: 10px; /* 标题和横线的间距 */
  position: relative; /* 让伪元素基于标题定位 */
}

/* 标题下方横线（伪元素实现，贴左右边界） */
.form-title::after {
  content: "";
  position: absolute;
  left: -15px; /* 向左抵消卡片padding-left */
  right: -15px; /* 向右抵消卡片padding-right */
  bottom: 0;
  height: 1px;
  background-color: #f0f0f0;
  transform: scaleY(0.5); /* 和表单项横线粗细一致 */
  z-index: 1;
}

/* 表单列表 */
.form-list {
  position: relative;
  margin-top: 15px; /* 标题横线和表单项的间距 */
}

/* 表单项 */
.form-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  position: relative;
}

/* 核心：表单项横线左右贴卡片边界 */
.form-item::after {
  content: "";
  position: absolute;
  left: -15px; /* 向左抵消卡片padding-left */
  right: -15px; /* 向右抵消卡片padding-right */
  bottom: 0;
  height: 1px;
  background-color: #f0f0f0;
  transform: scaleY(0.5); /* 线条更细，贴近原生效果 */
  z-index: 1;
}

/* 最后一个表单项移除分隔线 */
.form-item:last-child::after {
  display: none;
}

/* 表单标签 */
.form-label {
  width: 90px;
  font-size: 24rpx;
  color: #333;
  padding-left: 0px;
}

.form-label .required {
  color: #f00;
  margin-right: 2px;
}

/* 输入框容器 */
.form-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 5px;
}

/* 输入框样式 */
.form-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #666;
  text-align: right;
  padding: 5px 0;
  background: transparent;
}

.form-input::placeholder {
  color: #E6E6E6;
}

/* 提交按钮 */
.submit-btn {
  display: block;
  width: 100%;
  height: 44px;
  line-height: 44px;
  background-color: #0088ff;
  color: #fff;
  border: none;
  border-radius: 22px; /* 大圆角 */
  font-size: 16px;
  cursor: pointer;
  text-align: center;
}

.submit-btn:active {
  background-color: #0066cc;
}

/* 模拟弹窗样式（选择车辆/时间用） */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: #fff;
  width: 80%;
  border-radius: 8px;
  padding: 20px;
}

.modal-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
  text-align: center;
}

.modal-list {
  list-style: none;
}

.modal-item {
  padding: 12px 0;
  border-bottom: 2rpx solid #E6E6E6;
  text-align: center;
  cursor: pointer;
}

.modal-item:last-child {
  border-bottom: none;
}

.modal-item:active {
  background-color: #f5f5f5;
}

.modal-btns {
  display: flex;
  margin-top: 20px;
}

.modal-btn {
  flex: 1;
  height: 36px;
  line-height: 36px;
  text-align: center;
  border: 2rpx solid #E6E6E6;
  border-radius: 4px;
  margin: 0 5px;
}

.modal-btn.confirm {
  background-color: #0088ff;
  color: #fff;
  border-color: #0088ff;
}
</style>
