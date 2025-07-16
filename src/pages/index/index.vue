<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5" type="home">
{
  layout: 'tabbar',
  style: {
    // 'custom' 表示开启自定义导航栏，默认 'default'
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
}
</route>

<script lang="ts" setup>
import PLATFORM from '@/utils/platform'
import Find from './components/Find.vue'
import Home from './components/Home.vue'
import Infor from './components/Infor.vue'
import Mine from './components/Mine.vue'

defineOptions({
  name: 'Home',
})

const tabbar = ref('')
const tabbarItems = [
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

// 获取屏幕边界到安全区域距离
let safeAreaInsets
let systemInfo

// #ifdef MP-WEIXIN
// 微信小程序使用新的API
systemInfo = uni.getWindowInfo()
safeAreaInsets = systemInfo.safeArea
  ? {
      top: systemInfo.safeArea.top,
      right: systemInfo.windowWidth - systemInfo.safeArea.right,
      bottom: systemInfo.windowHeight - systemInfo.safeArea.bottom,
      left: systemInfo.safeArea.left,
    }
  : null
// #endif

// #ifndef MP-WEIXIN
// 其他平台继续使用uni API
systemInfo = uni.getSystemInfoSync()
safeAreaInsets = systemInfo.safeAreaInsets
// #endif

// 测试 uni API 自动引入
onLoad((option) => {
  tabbar.value = option.name || 'home'
})
</script>

<template>
  <view class="bg-white">
    <Home v-show="tabbar === 'home'" />
    <Find v-show="tabbar === 'find'" />
    <Infor v-show="tabbar === 'infor'" />
    <Mine v-show="tabbar === 'mine'" />

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
          />
        </template>
      </wd-tabbar-item>
    </wd-tabbar>
  </view>
</template>
