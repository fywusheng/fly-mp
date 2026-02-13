/**
 * 安卓蓝牙查找
 * 只负责找到设备，不负责连接。
 * 如果发现设备之前连着，会主动断开，为 SDK 连接做准备。
 */
export function androidOpenAndSearchAndConnect(options) {
  const {
    name,
    deviceId,
    serviceUUID = ['0000ae40-0000-1000-8000-00805f9b34fb', 'FEE7', '0000FFF0-0000-1000-8000-00805F9B34FB'], // 搜索时通常不需要过滤 Service，除非你很确定
    timeout = 15000,
  } = options

  let found = false
  let timer = null
  let _discoveryStarted = false

  // 辅助：断开连接并返回（为 SDK 腾位置）
  const disconnectAndResolve = (device, resolve) => {
    // 停止搜索
    if (_discoveryStarted) {
      wx.stopBluetoothDevicesDiscovery()
      _discoveryStarted = false
    }

    // 检查设备当前是否连接，如果连着，必须断开，否则 SDK 会报错
    wx.getConnectedBluetoothDevices({
      // services: ['0000ae40-0000-1000-8000-00805f9b34fb'],
      services: [],
      success(res) {
        const isConnected = res.devices.find(d => d.deviceId === device.deviceId)
        if (isConnected) {
          console.log('检测到设备已占用连接，正在断开以供 SDK 使用...', device.deviceId)
          wx.closeBLEConnection({
            deviceId: device.deviceId,
            complete: () => {
              // 关键延迟：给安卓底层一点时间释放句柄
              setTimeout(() => {
                console.log('设备已断开，返回给 SDK')
                resolve(device)
              }, 200)
            },
          })
        }
        else {
          // 没连着，直接返回
          resolve(device)
        }
      },
      fail() {
        resolve(device)
      },
    })
  }

  return new Promise((resolve, reject) => {
    // 1. 检查已连接 (如果已在系统列表，直接拿来用，但在返回前会断开)
    const checkConnected = () => {
      wx.getConnectedBluetoothDevices({
        // services: ['0000ae40-0000-1000-8000-00805f9b34fb'],
        services: [],
        success(res) {
          const devices = res.devices || []
          const target = devices.find(d =>
            (deviceId && d.deviceId === deviceId)
            || (name && d.name === name),
          )
          if (target) {
            console.log('在已连接列表中找到设备')
            found = true
            disconnectAndResolve(target, resolve) // 走断开流程
            return
          }
          startDiscovery() // 没找到，去搜索
        },
        fail: () => startDiscovery(),
      })
    }

    // 2. 初始化
    wx.openBluetoothAdapter({
      success: checkConnected,
      fail: (err) => {
        if (err.errMsg && err.errMsg.includes('already opened')) {
          checkConnected()
        }
        else {
          reject(new Error('请打开手机蓝牙'))
        }
      },
    })

    // 3. 搜索
    function startDiscovery() {
      _discoveryStarted = true
      wx.startBluetoothDevicesDiscovery({
        services: ['00001812-0000-1000-8000-00805F9B34FB'],
        allowDuplicatesKey: false,
        success() {
          wx.onBluetoothDeviceFound(listener)
          timer = setTimeout(() => {
            if (!found) {
              cleanup()
              reject(new Error('搜索设备超时，未发现目标设备'))
            }
          }, timeout)
        },
        fail: err => reject(err),
      })
    }

    // 4. 监听
    function listener(res) {
      if (found)
        return

      const devices = res.devices || (res.deviceId ? [res] : [])
      for (const d of devices) {
        const isMatch = (deviceId && d.deviceId === deviceId) || (name && d.name === name)
        if (isMatch) {
          console.log('搜索到目标设备:', d.deviceId)
          found = true
          cleanup()
          // 这里的设备通常是未连接的，直接返回
          resolve(d)
          return
        }
      }
    }

    function cleanup() {
      if (timer)
        clearTimeout(timer)
      wx.offBluetoothDeviceFound()
      if (_discoveryStarted) {
        wx.stopBluetoothDevicesDiscovery()
        _discoveryStarted = false
      }
    }
  })
}

// iOS通用的蓝牙连接方法
export function iosOpenAndSearchAndConnect(options) {
  const {
    name,
    deviceId,
    serviceUUID = ['0000ae40-0000-1000-8000-00805f9b34fb', 'FEE7'],
    timeout = 30000,
  } = options

  let found = false
  let timer = null

  return new Promise((resolve, reject) => {
    // 0. 先打开蓝牙适配器
    wx.openBluetoothAdapter({
      success() {
        // 1. 查询已连接设备
        wx.getConnectedBluetoothDevices({
          services: serviceUUID,
          allowDuplicatesKey: false,
          interval: 300,
          success(res) {
            console.log('已连接设备', res)
            const devices = res.devices || []
            let target = null
            if (deviceId) {
              target = devices.find(d => d.deviceId === deviceId)
            }
            else if (name) {
              target = devices.find(d => d.name === name)
            }
            console.log(target, 'target')
            if (target) {
              found = true
              wx.createBLEConnection({
                deviceId: target.deviceId,
                success: () => resolve(target),
                fail: err => reject(err),
              })
              return
            }
            // 2. 未找到则开始搜索
            startDiscovery()
          },
          fail() {
            // 查询失败也直接开始搜索
            startDiscovery()
          },
        })
      },
      fail(err) {
        if (err.errMsg === 'openBluetoothAdapter:fail already opened') {
          wx.getConnectedBluetoothDevices({
            services: serviceUUID,
            allowDuplicatesKey: false,
            interval: 300,
            success(res) {
              console.log('已连接设备', res)
              const devices = res.devices || []
              let target = null
              if (deviceId) {
                target = devices.find(d => d.deviceId === deviceId)
              }
              else if (name) {
                target = devices.find(d => d.name === name)
              }
              console.log(target, 'target')
              if (target) {
                found = true
                wx.createBLEConnection({
                  deviceId: target.deviceId,
                  success: () => resolve(target),
                  fail: err => reject(err),
                })
                return
              }
              // 2. 未找到则开始搜索
              startDiscovery()
            },
            fail() {
            // 查询失败也直接开始搜索
              startDiscovery()
            },
          })
        }
        else {
          reject(err)
        }
      },
    })

    function startDiscovery() {
      wx.startBluetoothDevicesDiscovery({
        services: [...serviceUUID, '00001812-0000-1000-8000-00805F9B34FB'],
        allowDuplicatesKey: false,
        success() {
          wx.onBluetoothDeviceFound(listener)
          timer = setTimeout(() => {
            cleanup()
            reject(new Error('查找蓝牙超超时'))
          }, timeout)
        },
        fail(err) {
          reject(err)
        },
      })
    }

    function listener(res) {
      const devices = res.devices || (res.deviceId ? [res] : [])
      let target = null
      if (deviceId) {
        target = devices.find(d => d.deviceId === deviceId)
      }
      else if (name) {
        target = devices.find(d => d.name === name)
      }
      console.log('搜索到的', devices)
      if (target && !found) {
        found = true
        cleanup()
        wx.createBLEConnection({
          deviceId: target.deviceId,
          success: () => resolve(target),
          fail: err => reject(err),
        })
      }
    }

    function cleanup() {
      if (timer)
        clearTimeout(timer)
      wx.stopBluetoothDevicesDiscovery()
      wx.offBluetoothDeviceFound(listener)
    }
  })
}

/**
 * 安卓蓝牙深度初始化
 */
export function initBluetoothAndroid(deviceId?: string) {
  return new Promise((resolve, reject) => {
    // 1. 获取系统信息，检查蓝牙和定位开关
    const sysInfo = wx.getSystemInfoSync()

    if (!sysInfo.bluetoothEnabled) {
      return reject({ msg: '请先开启手机蓝牙开关' })
    }

    // 安卓搜索蓝牙必须开启系统定位(GPS)
    if (sysInfo.platform === 'android' && !sysInfo.locationEnabled) {
      return reject({ msg: '安卓机型请务必开启手机GPS定位开关' })
    }

    // 2. 调用微信 API 初始化
    wx.openBluetoothAdapter({
      // mode: 'central', // 明确指定为主机模式
      success: (res) => {
        console.log('蓝牙适配器初始化成功')
        // 监听蓝牙状态变化（如中途用户关了蓝牙）
        watchBluetoothState()

        // 注意：如果之前已经连着设备了，SDK 可能会连接失败（因为微信这边还占着），所以这里主动断开一下（如果有的话）
        wx.closeBLEConnection({
          deviceId,
          complete: () => {
            // 关键延迟：给安卓底层一点时间释放句柄
            setTimeout(() => {
              console.log('设备已断开，返回给 SDK')
              resolve(res)
            }, 200)
          },
        })
        // resolve(res)
      },
      fail: (err) => {
        // 如果已经初始化过了，直接算成功
        if (err.errCode === 10001 || err.errMsg.includes('already opened')) {
          // resolve(err)
          // 注意：如果之前已经连着设备了，SDK 可能会连接失败（因为微信这边还占着），所以这里主动断开一下（如果有的话）
          wx.closeBLEConnection({
            deviceId,
            complete: () => {
            // 关键延迟：给安卓底层一点时间释放句柄
              setTimeout(() => {
                console.log('设备已断开，返回给 SDK')
                resolve(err)
              }, 200)
            },
          })
        }
        else {
          console.error('初始化失败', err)
          reject(err)
        }
      },
    })
  })
}

function watchBluetoothState() {
  wx.onBluetoothAdapterStateChange((res) => {
    if (!res.available) {
      console.warn('蓝牙适配器不可用，请检查蓝牙开关')
    }
  })
}
