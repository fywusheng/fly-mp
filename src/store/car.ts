import { defineStore } from 'pinia'
import { ref } from 'vue'

interface ICarInfoVo {
  network: boolean
  deviceNo: string
  id: number
}

// 初始化状态
const userInfoState: ICarInfoVo = {
  // 硬件支持4g
  network: true,
  deviceNo: '',
  id: 0,
}

export const useCarStore = defineStore(
  'car',
  () => {
    // 定义当前车辆信息
    const carInfo = ref<ICarInfoVo>({ ...userInfoState })

    // 计算属性
    // const network = computed(() => Boolean(carInfo.value.network))
    // 设置支持4g
    const network = computed(() => Boolean(true))

    // 设置车辆信息
    function setCarInfo(val: ICarInfoVo) {
      carInfo.value = val
    }

    return {
      // 状态
      carInfo,

      //  计算属性
      network,

      // 方法
      setCarInfo,
    }
  },
  {
    persist: true,
  },
)
