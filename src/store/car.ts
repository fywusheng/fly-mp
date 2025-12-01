import { defineStore } from 'pinia'
import { ref } from 'vue'

interface ICarInfoVo {
  network: boolean
  deviceNo: string
  id: number
  bluetoothDeviceNo: string | null
  bluetoothDeviceType: number | null
  deviceType: number | null
  bluetoothDeviceName: string | null
  bluetoothDeviceKey: string | null
}

// 初始化状态
const userInfoState: ICarInfoVo = {
  // 硬件支持4g
  network: true,
  deviceNo: '',
  id: 0,

  // 设备类型 number | null 1 华惠 2 E车星 null 无主机
  deviceType: null,

  // 连接的蓝牙设备编号
  bluetoothDeviceNo: null,

  // 连接的蓝牙设备类型 number | null 1 华惠 2 E车星 null 无主机
  bluetoothDeviceType: null,
  // 连接的蓝牙设备名称
  bluetoothDeviceName: null,
  // 连接的蓝牙设备密钥
  bluetoothDeviceKey: null,

}

export const useCarStore = defineStore(
  'car',
  () => {
    // 定义当前车辆信息
    const carInfo = ref<ICarInfoVo>({ ...userInfoState })
    const network = ref(true)

    // 是否4g
    // const network = computed(() => Boolean(carInfo.value.deviceType !==null))

    // 是否蓝牙
    const bluetooth = computed(() => Boolean(carInfo.value.bluetoothDeviceType !== null))

    // 设置车辆信息
    function setCarInfo(val: ICarInfoVo) {
      carInfo.value = val
    }

    function setNetwork(val) {
      network.value = val
    }

    return {
      // 状态
      carInfo,

      //  计算属性
      network,
      bluetooth,

      // 方法
      setCarInfo,
      setNetwork,
    }
  },
  {
    persist: true,
  },
)
