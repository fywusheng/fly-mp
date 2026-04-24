<script setup lang="ts">
import { getLocation } from '@/utils'
import { httpGet } from '@/utils/http'
import { getImageUrl } from '@/utils/image'

definePage({
  layout: 'tabbar',
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '附近门店',
    backgroundColor: '#ffffff',
  },
  type: 'home',
})

interface LocationInfo {
  provinceCode: string
  provinceName: string
  cityCode: string
  cityName: string
}

const NearbyArrowIcon = getImageUrl('/network/nearby-arrow.png')
const NearbyLocationBlankIcon = getImageUrl('/network/nearby-location-blank.png')
const NearbyLocationIcon = getImageUrl('/network/nearby-lotion.png')
const NearbyTitleIcon = getImageUrl('/network/nearby-title.png')
const PhoneIcon = getImageUrl('/network/phone.png')
const SaleExperienceIcon = getImageUrl('/network/sale-experience.png')
const MaintenanceRepairIcon = getImageUrl('/network/maintenance-repair.png')

// 城市选择器相关
interface PickerItem {
  label: string
  value: string
}

const selectedCityValue = ref<string>('')
const selectedCity = ref('天津市')
const cityColumns = ref<[PickerItem[], PickerItem[]]>([[], []])
const longitude = ref<number>(0)
const latitude = ref<number>(0)
const isLoadingData = ref(false)

async function getProvinceList() {
  try {
    const res = await httpGet<{ provinceName: string, provinceCode: string }[]>('/common/store/provinces')
    console.log('获取省份列表成功:', res)
    if (res.code === '200') {
      cityColumns.value[0] = res.data.map(item => ({
        label: item.provinceName,
        value: item.provinceCode,
      }))
    }
  }
  catch (error) {
    console.error('获取省份列表失败:', error)
  }
}

async function fetchCityList(provinceCode: string): Promise<PickerItem[]> {
  try {
    const res = await httpGet<{ cityName: string, cityCode: string }[]>('/common/store/cities', { provinceCode })
    console.log('获取城市列表成功:', res)
    if (res.code === '200') {
      return res.data.map(item => ({
        label: item.cityName,
        value: item.cityCode,
      }))
    }
    return []
  }
  catch (error) {
    console.error('获取城市列表失败:', error)
    return []
  }
}

async function onChangeCity(pickerView: any, value: PickerItem[], columnIndex: number, resolve: () => void) {
  if (columnIndex === 0) {
    try {
      const cities = await fetchCityList(value[0].value)
      pickerView.setColumnData(1, cities)
    }
    catch {
      pickerView.setColumnData(1, [])
    }
  }
  resolve()
}

// 获取位置信息
async function getCurrentLocation() {
  try {
    const res = await getLocation() as UniApp.GetLocationSuccess
    console.log('获取位置信息成功:', res)
    longitude.value = res.longitude
    latitude.value = res.latitude
    getLocationInfo(res.longitude, res.latitude)
  }
  catch (error) {
    console.error('获取位置失败:', error)
    uni.showToast({ title: '定位失败，将显示全部门店', icon: 'none' })
    selectedCity.value = '全国'
    selectedCityValue.value = ''
    await getProvinceList()
    loadStoreData(true)
  }
}

async function getLocationInfo(longitude: number, latitude: number) {
  try {
    const res = await httpGet<LocationInfo>('/common/store/locate', { longitude, latitude })
    console.log('获取位置信息成功:', res)
    selectedCity.value = res.data.cityName
    selectedCityValue.value = res.data.cityCode

    await getProvinceList()
    const cities = await fetchCityList(res.data.provinceCode)
    cityColumns.value[1] = cities

    loadStoreData(true)
  }
  catch (error) {
    console.error('获取位置信息失败:', error)
    uni.showToast({ title: '定位失败，将显示全部门店', icon: 'none' })
    selectedCity.value = '全国'
    selectedCityValue.value = ''
    await getProvinceList()
    loadStoreData(true)
  }
}

function handleCityConfirm({ selectedItems }: { selectedItems: PickerItem[] }) {
  if (selectedItems && selectedItems.length > 0) {
    selectedCity.value = selectedItems[0].label
    selectedCityValue.value = selectedItems[0].value

    loadStoreData(true)
  }
}

// 门店列表 API 类型
interface StoreItem {
  id: number
  storeName: string
  fullAddress: string
  contactPhone: string
  businessStatus: number
  businessStatusDesc: string
  distance: number
  distanceDesc: string
  services: string[]
  longitude: number
  latitude: number
}

interface StoreResponse {
  total: number
  pageNum: number
  pageSize: number
  list: StoreItem[]
}

// 门店列表响应式数据
const storeList = ref<StoreItem[]>([])
const pageNum = ref(1)
const pageSize = ref(20)
const total = ref(0)
const loadmoreState = ref<'loading' | 'finished' | 'error'>('loading')

type TabType = 'sale' | 'maintain'
const activeTab = ref<TabType>('sale')

async function loadStoreData(reset = false) {
  if (reset) {
    pageNum.value = 1
    storeList.value = []
    loadmoreState.value = 'loading'
  }

  if (loadmoreState.value === 'finished' && !reset)
    return

  try {
    loadmoreState.value = 'loading'
    isLoadingData.value = true
    const params: Record<string, any> = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      latitude: latitude.value,
      longitude: longitude.value,
    }
    if (selectedCityValue.value) {
      params.cityCode = selectedCityValue.value
    }
    if (activeTab.value === 'sale') {
      params.category = '体验销售'
    }
    else if (activeTab.value === 'maintain') {
      params.category = '维修保养'
    }

    const res = await httpGet<StoreResponse>('/common/store/list', params)

    if (res.code === '200') {
      const records = res.data?.list || []
      total.value = res.data?.total || 0

      if (reset) {
        storeList.value = records
      }
      else {
        storeList.value = [...storeList.value, ...records]
      }

      if (storeList.value.length >= total.value || records.length < pageSize.value) {
        loadmoreState.value = 'finished'
      }
      else {
        loadmoreState.value = 'loading'
      }
    }
    else {
      loadmoreState.value = 'error'
    }
  }
  catch (err) {
    console.error('获取门店列表失败', err)
    loadmoreState.value = 'error'
  }
  finally {
    isLoadingData.value = false
  }
}

onMounted(() => {
  getCurrentLocation()
})

onReachBottom(() => {
  if (loadmoreState.value === 'finished')
    return
  pageNum.value += 1
  loadStoreData()
})

// 切换标签方法
function switchTab(tabType: TabType) {
  activeTab.value = tabType
  // 切换时回到列表顶部
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 300,
  })
  loadStoreData(true)
}

// 拨打电话
function callPhone(phone: string) {
  uni.makePhoneCall({
    phoneNumber: phone,
    fail: () => {
      uni.showToast({ title: '拨打电话失败', icon: 'none' })
    },
  })
}

// 导航到店
function navigateToStore(store: StoreItem) {
  uni.openLocation({
    latitude: store.latitude,
    longitude: store.longitude,
    address: store.fullAddress,
    name: store.storeName,
    fail: () => {
      uni.showToast({ title: '打开地图失败', icon: 'none' })
    },
  })
}
</script>

<template>
  <view class="page-container">
    <!-- Banner区域 -->
    <view class="banner-wrap">
      <view class="banner">
        <image class="banner-bg" :src="NearbyTitleIcon" mode="widthFix" />
      </view>
    </view>

    <view class="content-wrap">
      <!-- 城市选择栏 -->
      <view class="city-wrap">
        <view class="city-bar">
          <view class="flex items-center justify-center">
            <image
              class="mr-19rpx h-31rpx w-25rpx"
              :src="NearbyLocationBlankIcon"
              mode="scaleToFill"
            />
            <text class="city-name mr-19rpx">
              {{ selectedCity }}
            </text>
            <image
              class="h-30rpx w-30rpx"
              :src="NearbyArrowIcon"
              mode="scaleToFill"
            />
          </view>
          <view class="flex items-center justify-center">
            <wd-picker
              v-model="selectedCityValue"
              :columns="cityColumns"
              label-key="label"
              value-key="value"
              use-default-slot
              :column-change="onChangeCity"
              @confirm="handleCityConfirm"
            >
              <span class="change-city">
                更改城市
              </span>
              <wd-icon name="arrow-right" size="20px" color="#333" />
            </wd-picker>
          </view>
        </view>
      </view>

      <!-- 标签切换栏 -->
      <view class="flex items-center justify-center">
        <view class="tab-wrap">
          <view class="tab-bar">
            <!-- 体验销售标签 - 点击切换 -->
            <view
              class="tab-item"
              :class="{ active: activeTab === 'sale' }"
              @click="switchTab('sale')"
            >
              <image
                class="tab-icon"
                :src="SaleExperienceIcon"
                mode="scaleToFill"
              />
              <text class="tab-text">
                体验销售
              </text>
            </view>
            <!-- 维修保养标签 - 点击切换 -->
            <view
              class="tab-item"
              :class="{ active: activeTab === 'maintain' }"
              @click="switchTab('maintain')"
            >
              <image
                class="tab-icon"
                :src="MaintenanceRepairIcon"
                mode="scaleToFill"
              />
              <text class="tab-text">
                维修保养
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 门店列表 -->
      <view class="store-list">
        <view v-for="item in storeList" :key="item.id" class="store-item">
          <view class="store-top">
            <text class="store-name">
              {{ item.storeName }}
            </text>
            <text class="distance">
              {{ item.distanceDesc }}
            </text>
          </view>
          <text class="store-address">
            {{ item.fullAddress }}
          </text>

          <view class="flex items-center justify-between pb-16rpx">
            <!-- 门店标签 -->
            <view class="tag-group">
              <view v-for="(service, sIdx) in item.services" :key="sIdx">
                <view class="store-tag-normal">
                  {{ service }}
                </view>
              </view>
            </view>

            <view class="store-actions">
              <image class="action-btn call-btn" :src="PhoneIcon" mode="scaleToFill" @click="callPhone(item.contactPhone)" />
              <image class="action-btn nav-btn" :src="NearbyLocationIcon" mode="scaleToFill" @click="navigateToStore(item)" />
            </view>
          </view>
        </view>

        <!-- 空白 -->
        <view v-if="storeList.length === 0 && loadmoreState === 'finished'" class="h-300rpx w-100% bg-white pb-200rpx">
          <wd-status-tip image="https://wot-ui.cn/assets/search.png" tip="当前搜索无结果" />
        </view>
        <!-- 加载更多 -->
        <wd-loadmore v-else custom-class="loadmore" :state="loadmoreState" @reload="loadStoreData(true)" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page-container {
  padding: 20rpx;
  background-color: #DDE3EC;
  min-height: 100vh;
  .content-wrap {
    padding: 0 20rpx;
    background-color: #fff;
    border-radius: 20rpx;
  }
}

.capsule {
  display: flex;
  gap: 15rpx;
  font-size: 24rpx;
}

/* Banner容器（虚线边框） */
.banner-wrap {
  padding: 5rpx;
  margin-bottom: 20rpx;
}
.banner {
  position: relative;
  width: 710rpx;
  height: 300rpx;
  border-radius: 8rpx;
  overflow: hidden;
}
.banner-bg {
  width: 100%;
  height: 100%;
  opacity: 0.8;
}
.banner-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
.banner-main-text {
  display: block;
  font-size: 48rpx;
  color: #2e86de;
  font-weight: bold;
  margin-bottom: 10rpx;
}
.banner-sub-text {
  font-size: 28rpx;
  color: #2e86de;
}

/* 城市选择栏（虚线边框） */
.city-wrap {
  padding: 5rpx;
  margin-bottom: 20rpx;
}
.city-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 15rpx;
  background-color: #fff;
}
.city-icon {
  font-size: 28rpx;
  margin-right: 10rpx;
}
.city-name {
  font-size: 32rpx;
  color: #333;
}
.city-edit {
  font-size: 24rpx;
  color: #333;
  margin-right: 20rpx;
}
.change-city {
  font-size: 28rpx;
  color: #333;
  margin-right: 19rpx;
}
.city-arrow {
  font-size: 24rpx;
  color: #999;
}

/* 标签切换栏 */
.tab-wrap {
  padding: 5rpx;
  margin-bottom: 20rpx;
  width: 600rpx;
  height: 80rpx;
  background-color: #F0F0F0;
  border-radius: 50rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tab-bar {
  display: flex;

  // background-color: #fff;
}
.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  // padding: 25rpx 0;
  // border-bottom: 3rpx solid #fff;
  border-radius: 50rpx;
  width: 300rpx;
  height: 76rpx;
}
.tab-item.active {
  background-color: #fff;
  color: #333;
  // border-bottom: 3rpx solid #2e86de;
}
.tab-icon {
  font-size: 24rpx;
  margin-right: 10rpx;
  width: 30rpx;
  height: 30rpx;
}
.tab-text {
  font-size: 30rpx;
  color: #C8C8C8;
}
.tab-item.active .tab-text {
  color: #333;
  font-weight: 500;
}

/* 门店列表 */
.store-list {
  margin-bottom: 50rpx;
}
.store-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.store-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 29rpx;
}
.store-name {
  font-size: 30rpx;
  color: #333;
  font-weight: 400;
}
.store-name.recommend {
  color: #ff6600;
}
.distance {
  font-size: 28rpx;
  color: #999;
}
.store-address {
  display: block;
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 15rpx;
}

/* 门店标签（虚线边框版） */
.tag-wrap {
  display: inline-block;
  padding: 2rpx;
  margin-bottom: 15rpx;
  margin-right: 15rpx;
}
.store-tag {
  padding: 8rpx 25rpx;
  background-color: #ffffff;
  color: #6E6E6E;
  font-size: 26rpx;
  border-radius: 20rpx;
  border: 1rpx solid #6E6E6E;
}

/* 门店标签（普通版） */
.store-tag-normal {
  display: inline-block;
  padding: 8rpx 25rpx;
  background-color: #ffffff;
  color: #6E6E6E;
  font-size: 26rpx;
  border-radius: 20rpx;
  margin-right: 15rpx;
  // margin-bottom: 15rpx;
  border: 1rpx solid #6E6E6E;
}
.tag-group {
  display: flex;
  flex-wrap: wrap;
}

/* 操作按钮 */
.store-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
}
.action-btn {
  width: 50rpx;
  height: 50rpx;
  line-height: 50rpx;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 50%;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.call-btn {
  background-color: #fff;
  margin-right: 32rpx;
}
.nav-btn {
  background-color: #fff;
  margin-right: 18rpx;
}

/* 加载更多 */
.loadmore {
  padding: 30rpx 0;
}

/* 空提示样式 */
.empty-tip {
  text-align: center;
  padding: 150rpx 0;
  font-size: 28rpx;
  color: #999;
  height: 400rpx;
}
</style>
