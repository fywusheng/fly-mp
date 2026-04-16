<script setup lang="ts">
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

const CarIcon = getImageUrl('/network/car.png')
const WeixinPayIcon = getImageUrl('/network/weixin-pay.png')
const MemberIcon = getImageUrl('/network/member.png')
const MemberNoIcon = getImageUrl('/network/member-none.png')

const NearbyArrowIcon = getImageUrl('/network/nearby-arrow.png')
const NearbyLocationBlankIcon = getImageUrl('/network/nearby-location-blank.png')
const NearbyLocationIcon = getImageUrl('/network/nearby-lotion.png')
const NearbyTitleIcon = getImageUrl('/network/nearby-title.png')
const PhoneIcon = getImageUrl('/network/phone.png')
const SaleExperienceIcon = getImageUrl('/network/sale-experience.png')
const MaintenanceRepairIcon = getImageUrl('/network/maintenance-repair.png')

// 城市选择器相关
const selectedCityValue = ref<string>('')
const selectedCity = ref('天津市')
const cityColumns = [
  { label: '北京市', value: 'beijing' },
  { label: '天津市', value: 'tianjin' },
  { label: '上海市', value: 'shanghai' },
  { label: '广州市', value: 'guangzhou' },
  { label: '深圳市', value: 'shenzhen' },
]

function openCityPicker() {
  uni.showToast({ title: '请选择城市', icon: 'none' })
}

function handleCityConfirm({ selectedItem }: { selectedItem: Array<{ label: string, value: string }> }) {
  if (selectedItem && selectedItem.length > 0) {
    selectedCity.value = selectedItem[0].label
    selectedCityValue.value = selectedItem[0].value
  }
}

// 定义门店类型接口
interface StoreItem {
  name: string
  distance: string
  address: string
  tags: Array<'sale' | 'maintain'> // 限定标签只能是sale/maintain
  phone: string
  recommend: boolean
}

// 定义标签类型
type TabType = 'sale' | 'maintain'

// 响应式数据
const activeTab = ref<TabType>('sale') // 当前选中的标签

// 完整门店数据（带类型约束）
const storeList = ref<StoreItem[]>([
  {
    name: '五马路店',
    distance: '563m',
    address: '天津市南开区南开五马路花园楼6号一楼底商',
    tags: ['sale'], // 仅体验销售
    phone: '13800138000',
    recommend: false,
  },
  {
    name: '多伦道店',
    distance: '1.4km',
    address: '天津市和平区多伦道124-126',
    tags: ['sale'], // 仅体验销售
    phone: '13800138001',
    recommend: true,
  },
  {
    name: '大王庄店',
    distance: '3.4km',
    address: '天津市河东区大王庄街道九经路冠华公寓1号楼',
    tags: ['sale', 'maintain'], // 两者都有
    phone: '13800138002',
    recommend: false,
  },
  {
    name: '榆关道店',
    distance: '5.6km',
    address: '天津市河北区榆关道447号小牛电动',
    tags: ['sale', 'maintain'], // 两者都有
    phone: '13800138003',
    recommend: false,
  },
  {
    name: '维修专享店',
    distance: '2.8km',
    address: '天津市河西区解放南路188号',
    tags: ['maintain'], // 仅维修保养
    phone: '13800138004',
    recommend: false,
  },
])

// 计算属性：根据选中的标签筛选门店
const filteredStoreList = computed<StoreItem[]>(() => {
  if (activeTab.value === 'sale') {
    // 体验销售：筛选包含sale标签的门店
    return storeList.value.filter(store => store.tags.includes('sale'))
  }
  else if (activeTab.value === 'maintain') {
    // 维修保养：筛选包含maintain标签的门店
    return storeList.value.filter(store => store.tags.includes('maintain'))
  }
  return storeList.value
})

// 切换标签方法
function switchTab(tabType: TabType) {
  activeTab.value = tabType
  // 切换时回到列表顶部
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 300,
  })
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
function navigateToStore(address: string) {
  uni.openLocation({
    latitude: 39.9042,
    longitude: 116.4074,
    address,
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
              use-default-slot
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

      <!-- 门店列表（根据选中标签筛选） -->
      <view class="store-list">
        <!-- 动态循环渲染门店，根据activeTab筛选 -->
        <view v-for="(item, index) in filteredStoreList" :key="index" class="store-item">
          <view class="store-top">
            <text class="store-name" :class="{ recommend: item.recommend }">
              {{ item.recommend ? '[四星推荐]' : '' }}{{ item.name }}
            </text>
            <text class="distance">
              {{ item.distance }}
            </text>
          </view>
          <text class="store-address">
            {{ item.address }}
          </text>

          <view class="flex items-center justify-between">
            <!-- 门店标签（动态渲染） -->
            <view class="tag-group">
              <view v-if="item.tags.includes('sale')" class="tag-wrap">
                <view class="store-tag">
                  体验销售
                </view>
              </view>
              <view v-if="item.tags.includes('maintain')" class="store-tag-normal">
                维修保养
              </view>
            </view>

            <view class="store-actions">
              <image class="action-btn call-btn" :src="PhoneIcon" mode="scaleToFill" @click="callPhone(item.phone)" />
              <image class="action-btn nav-btn" :src="NearbyLocationIcon" mode="scaleToFill" @click="navigateToStore(item.address)" />
            </view>
          </view>
        </view>

        <!-- 无匹配门店时显示空提示 -->
        <view v-if="filteredStoreList.length === 0" class="empty-tip">
          暂无该类型的门店
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page-container {
  padding: 20rpx;
  background-color: #DDE3EC;
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
  background: linear-gradient(to right, #e8f4fc, #d1e9fc);
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
  margin-bottom: 15rpx;
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
  margin-right: 62rpx;
}
.nav-btn {
  background-color: #fff;
  margin-right: 18rpx;
}

/* 空提示样式 */
.empty-tip {
  text-align: center;
  padding: 50rpx 0;
  font-size: 28rpx;
  color: #999;
}
</style>
