import { defineStore } from 'pinia'
import { ref } from 'vue'

interface AppInfoVo {
  networkType: string
}

// 初始化状态
const appInfoState: AppInfoVo = {
  // 获取网络状态
  networkType: 'none',
}

export const useAppStore = defineStore(
  'app',
  () => {
    // 定义当前车辆信息
    const appInfo = ref<AppInfoVo>({ ...appInfoState })

    // 计算属性
    const networkType = computed(() => Boolean(appInfo.value.networkType !== 'none'))

    // 获取设备网络状态
    const getAppInfo = async () => {
      // 获取网络状态
      uni.getNetworkType({
        success: (res) => {
          appInfo.value.networkType = res.networkType
        },
      })
      // 监听网络状态变化
      uni.onNetworkStatusChange((res) => {
        appInfo.value.networkType = res.networkType
      })
    }

    return {
      // 状态
      appInfo,
      //  计算属性
      networkType,
      // 方法
      getAppInfo,

    }
  },
  {
    persist: true,
  },
)
