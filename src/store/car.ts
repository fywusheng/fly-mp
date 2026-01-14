import { defineStore } from 'pinia'
import { ref } from 'vue'

interface ICarInfoVo {
  network: boolean
  deviceNo: string
  id: number
  hasNetwork: boolean
  hasBluetooth: boolean
  hasBeidou: number
  bluetoothVendor: string | null
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

  // 连接的蓝牙设备编号
  bluetoothDeviceNo: null,
  // 目前不用了 连接的蓝牙设备类型 number | null 1 华惠 2 E车星 null 无主机
  bluetoothDeviceType: null,

  // 是否支持北斗/卫星定位 number | null 1 支持 0 不支持
  hasBeidou: 0,
  //  是否支持4G
  hasNetwork: false,
  // 是否支持蓝牙
  hasBluetooth: false,
  // 蓝牙厂商 ECS：E车星  HUAHUI：华惠
  bluetoothVendor: 'ECS',
  // 连接的蓝牙设备名称
  bluetoothDeviceName: null,
  // 连接的蓝牙设备密钥
  bluetoothDeviceKey: null,
  /**
   * 设备类型 number | null
   * 1 华惠4G
   * 2 E车星蓝牙
   * 3 华惠4G+E车星蓝牙
   * 4 华慧蓝牙
   * 5 E车星一体机
   * 6 华惠一体机
   * 7 E车星4G+华惠蓝牙
   *
   */
  deviceType: null,

}

export const useCarStore = defineStore(
  'car',
  () => {
    // 定义当前车辆信息
    const carInfo = ref<ICarInfoVo>({ ...userInfoState })

    // 是否4g
    const network = computed(() => Boolean(carInfo.value.hasNetwork))
    // const network = ref(false)

    // 是否蓝牙
    const hasBluetooth = computed(() => Boolean(carInfo.value.hasBluetooth))

    // 设置车辆信息
    function setCarInfo(val: ICarInfoVo) {
      carInfo.value = val
    }

    function resetCarInfo() {
      carInfo.value = { ...userInfoState }
    }

    // 改变设备4g状态，用于测试
    function setNetwork(val) {
      carInfo.value.hasNetwork = val
    }

    return {
      // 状态
      carInfo,

      //  计算属性
      network,
      hasBluetooth,

      // 方法
      setCarInfo,
      setNetwork,
      resetCarInfo,
    }
  },
  {
    persist: true,
  },
)
