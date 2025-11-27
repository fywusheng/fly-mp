<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5" type="home">
{
  layout: 'tabbar',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
    "backgroundColor": "#6EA6F6",
  },
}
</route>

<script lang="ts" setup>
import { useAppStore, useCarStore } from '@/store'
// 4G+蓝牙
import Find from './components/Find.vue'
import Home from './components/Home.vue'
// 蓝牙版本
import Infor from './components/Infor.vue'
import InforBlue from './components/InforBlue.vue'

import Mine from './components/Mine.vue'

// 类型定义
interface TabbarItem {
  name: string
  title: string
  icon: string
  activeIcon: string
}

defineOptions({
  name: 'Home',
})

const carStore = useCarStore()
const appStore = useAppStore()

const tabbar = ref<string>('home') // 页面标签名称
const tabbarItems = ref<TabbarItem[]>([])

// 4G+蓝牙标签栏配置
const FourTabbarItems: TabbarItem[] = [
  {
    name: 'home',
    title: '骑行',
    icon: 'http://115.190.57.206/static/tabbar/home.png',
    activeIcon: 'http://115.190.57.206/static/tabbar/home-active.png',
  },
  {
    name: 'find',
    title: '发现',
    icon: 'http://115.190.57.206/static/tabbar/find.png',
    activeIcon: 'http://115.190.57.206/static/tabbar/find-active.png',
  },
  {
    name: 'infor',
    title: '数据',
    icon: 'http://115.190.57.206/static/tabbar/data.png',
    activeIcon: 'http://115.190.57.206/static/tabbar/data-active.png',
  },
  {
    name: 'mine',
    title: '我的',
    icon: 'http://115.190.57.206/static/tabbar/mine.png',
    activeIcon: 'http://115.190.57.206/static/tabbar/mine-active.png',
  },
]

// 蓝牙版标签栏配置
const BluetoothTabbarItems: TabbarItem[] = [
  {
    name: 'home',
    title: '骑行',
    icon: 'http://115.190.57.206/static/tabbar/home.png',
    activeIcon: 'http://115.190.57.206/static/tabbar/home-active.png',
  },

  {
    name: 'InforBlue',
    title: '数据',
    icon: 'http://115.190.57.206/static/tabbar/data.png',
    activeIcon: 'http://115.190.57.206/static/tabbar/data-active.png',
  },
  {
    name: 'mine',
    title: '我的',
    icon: 'http://115.190.57.206/static/tabbar/mine.png',
    activeIcon: 'http://115.190.57.206/static/tabbar/mine-active.png',
  },
]

// 监听
watch(tabbar, (newVal) => {
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 300,
  })
})

// 监听当前车辆设备变化
watch(() => carStore.network, (network) => {
  setTabItems(network)
})

// 处理页面加载参数
onLoad((option: Record<string, string>) => {
  setTabItems(carStore.network)
  // 验证选项卡是否有效
  const validTab = option?.name && tabbarItems.value.some(item => item.name === option.name)
  tabbar.value = validTab ? option.name : 'home'
})
onShow(() => {
  // 获取当前网络状态
  appStore.getAppInfo()
})

// 设置tabbar
function setTabItems(network) {
  tabbarItems.value = network ? FourTabbarItems : BluetoothTabbarItems
}
</script>

<template>
  <view class="bg-white">
    <!-- 协议弹窗 -->
    <privacyPopup />

    <!-- 内容区 -->
    <Home v-show="tabbar === 'home'" :tab-name="tabbar" />
    <Find v-show="tabbar === 'find'" :tab-name="tabbar" />
    <Infor v-show="tabbar === 'infor'" :tab-name="tabbar" />
    <InforBlue v-if="tabbar === 'InforBlue'" />
    <Mine v-if="tabbar === 'mine'" />

    <!-- 底部导航栏 -->
    <wd-tabbar v-model="tabbar" placeholder safe-area-inset-bottom fixed>
      <wd-tabbar-item
        v-for="item in tabbarItems"
        :key="item.name"
        :name="item.name"
        :title="item.title"
        :icon="item.icon"
        :active-icon="item.activeIcon"
      >
        <template #icon>
          <wd-img
            height="40rpx"
            width="40rpx"
            :src="tabbar === item.name ? item.activeIcon : item.icon"
            mode="aspectFit"
          />
        </template>
      </wd-tabbar-item>
    </wd-tabbar>
  </view>
</template>
