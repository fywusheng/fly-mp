- `deviceType`
- `bluetoothDeviceNo`
- `bluetoothDeviceType`

---

## 1. 只有 4G 主机（无蓝牙）

例如一辆 **只有华惠 4G 主机** 的车：

```json
{
  "deviceType": 1,
  "bluetoothDeviceNo": null,
  "bluetoothDeviceType": null
}
```

- **deviceType = 1**  
  表示主设备是「华惠 4G 主机」，对应 `device_type_dict.type_code = 1`，`category = "COMM"`。  

- **bluetoothDeviceNo = null**  
  没有组合蓝牙设备。  

- **bluetoothDeviceType = null**  
  同上。

---

## 2. 4G + 蓝牙 组合（你现在重点的场景）

例如一辆 **华惠 4G 主机 + E车星 蓝牙模块** 的车：

```json
{
  "deviceType": 1,
  "bluetoothDeviceNo": "ECS12345678",
  "bluetoothDeviceType": 2
}
```

- **deviceType = 1**  
  主设备仍然是华惠 4G 主机（`type_code = 1`）。  

- **bluetoothDeviceNo = "ECS12345678"`**  
  这个是组合蓝牙模块的设备号，用于 BLE SDK 连接。  

- **bluetoothDeviceType = 2**  
  表示这个蓝牙模块的类型编码，比如：
  - `2` → E车星 BLE 设备，对应 `device_type_dict.type_code = 2`，`category = "BLE"`。

前端如果需要更多信息（厂商、协议等），可以用：

- `GET /device/types`  
  根据 `typeCode` 反查：`{ typeName, vendor, category }`。

---

## 3. 只有蓝牙设备（纯 BLE 车，若存在）

如果后面有**纯蓝牙车**（没有 4G 主机），典型返回会是：

```json
{
  "deviceType": 2,
  "bluetoothDeviceNo": null,
  "bluetoothDeviceType": null
}
```

- **deviceType = 2**  
 
- 这种情况下，一般不会再挂一个“组合蓝牙伙伴”，所以 `bluetoothDeviceNo` / `bluetoothDeviceType` 通常都是 `null`。

---