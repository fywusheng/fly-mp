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
import Find from './components/Find.vue'
import Home from './components/Home.vue'
import Infor from './components/Infor.vue'
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

// 页面状态
const tabbar = ref<string>('home')

// 标签栏配置
const tabbarItems: TabbarItem[] = [
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

// 处理页面加载参数
onLoad((option: Record<string, string>) => {
  // 验证选项卡是否有效
  const validTab = option?.name && tabbarItems.some(item => item.name === option.name)
  tabbar.value = validTab ? option.name : 'home'
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
