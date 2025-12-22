import { defineStore } from 'pinia'
import { ref } from 'vue'

interface AppInfoVo {
  networkType: string
}

// 初始化状态
const appInfoState: AppInfoVo = {
  // 获取网络状态
  networkType: 'none', // 'networkType' | 'wifi' | '2g' | '3g' | '4g' | '5g' | 'unknown'
}

export const useAppStore = defineStore(
  'app',
  () => {
    // 定义当前车辆信息
    const appInfo = ref<AppInfoVo>({ ...appInfoState })

    //  是否有网络连接
    const hasNetwork = computed(() => Boolean(appInfo.value.networkType !== 'none' && appInfo.value.networkType !== 'offline'))

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
      hasNetwork,

      // 方法
      getAppInfo,

    }
  },
  {
    persist: true,
  },
)
