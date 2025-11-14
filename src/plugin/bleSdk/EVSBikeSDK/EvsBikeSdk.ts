export function openAndSearchAndConnect(options) {
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
