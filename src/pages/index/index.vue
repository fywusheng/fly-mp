<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5" type="home">
{
  layout: 'tabbar',
  style: {
    // 'custom' 表示开启自定义导航栏，默认 'default'
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
    "backgroundColor": "#6EA6F6",
  },
}
</route>

<script lang="ts" setup>
//4G+蓝牙
import Find from './components/Find.vue'
import Home from './components/Home.vue'
import Infor from './components/Infor.vue'
import Mine from './components/Mine.vue'
// 蓝牙版本
import HomeBlue from './components/HomeBlue.vue'
import InforBlue from './components/InforBlue.vue'
import MineBlue from './components/MineBlue.vue'

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


const tabbar = ref<string>('home') // 页面状态
const status = ref<string>('blue') // 车辆版本
const tabbarItems = ref<TabbarItem[]>([])

// 4G+蓝牙标签栏配置
const FourTabbarItems: TabbarItem[] = [
  {
    name: 'home',
    title: '骑行',
    icon: '/static/tabbar/home.png',
    activeIcon: '/static/tabbar/home-active.png',
  },
  {
    name: 'find',
    title: '发现',
    icon: '/static/tabbar/find.png',
    activeIcon: '/static/tabbar/find-active.png',
  },
  {
    name: 'infor',
    title: '数据',
    icon: '/static/tabbar/data.png',
    activeIcon: '/static/tabbar/data-active.png',
  },
  {
    name: 'mine',
    title: '我的',
    icon: '/static/tabbar/mine.png',
    activeIcon: '/static/tabbar/mine-active.png',
  },
]

// 蓝牙版标签栏配置
const BluetoothTabbarItems: TabbarItem[] = [
  {
    name: 'HomeBlue',
    title: '骑行',
    icon: '/static/tabbar/home.png',
    activeIcon: '/static/tabbar/home-active.png',
  },
  
  {
    name: 'InforBlue',
    title: '数据',
    icon: '/static/tabbar/data.png',
    activeIcon: '/static/tabbar/data-active.png',
  },
  {
    name: 'MineBlue',
    title: '我的',
    icon: '/static/tabbar/mine.png',
    activeIcon: '/static/tabbar/mine-active.png',
  },
]

// 处理页面加载参数
onLoad((option: Record<string, string>) => {
  // 初始化标签栏
  tabbarItems.value = status.value === 'blue' ? BluetoothTabbarItems : FourTabbarItems
    // 验证选项卡是否有效
  const validTab = option?.name && tabbarItems.value.some(item => item.name === option.name)
  tabbar.value = validTab ? option.name : 'HomeBlue'

  // 获取小程序位置
  uni.getLocation({
    type: 'gcj02',
    success: ({ longitude, latitude }) => {
      console.log(`小程序位置：${longitude}, ${latitude}`)
    },
    fail: (error) => {
      console.log(`获取小程序位置失败：${error}`)
    }
  })
})
</script>

<template>
  <view class="bg-white">
    <!-- 协议弹窗 -->
    <privacyPopup />

    <!-- 内容区 -->
    <Home v-show="tabbar === 'home'" />
    <Find v-show="tabbar === 'find'" />
    <Infor v-show="tabbar === 'infor'" />
    <Mine v-show="tabbar === 'mine'" />
    
    <HomeBlue v-show="tabbar === 'HomeBlue'" />
    <InforBlue v-show="tabbar === 'InforBlue'" />
    <MineBlue v-show="tabbar === 'MineBlue'" />

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
