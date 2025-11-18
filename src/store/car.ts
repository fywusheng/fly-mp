import { defineStore } from 'pinia'
import { ref } from 'vue'

interface ICarInfoVo {
  network: boolean
}

// 初始化状态
const userInfoState: ICarInfoVo = {
  // 硬件支持4g
  network: true,
}

export const useCarStore = defineStore(
  'car',
  () => {
    // 定义当前车辆信息
    const carInfo = ref<ICarInfoVo>({ ...userInfoState })

    // 计算属性
    const network = computed(() => Boolean(carInfo.value.network))

    return {
      // 状态
      carInfo,

      //  计算属性
      network,

    }
  },
  {
    persist: true,
  },
)
