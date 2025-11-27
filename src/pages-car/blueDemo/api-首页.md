下面是整理好的 **3 个对前端开放的接口文档**，全部在 `ebike-device-service` 的 [VehicleControlController](cci:2://file:///d:/WorkSpace/%E5%85%BC%E8%81%8C/ebike-bak/ebike-iot-platform/ebike-device-service/src/main/java/com/ebike/device/controller/VehicleControlController.java:24:0-173:1) 下。

---

# 1. 下发设备命令（通用控车接口）

- **URL**

`POST /v2/devices/{deviceId}/commands`

- **Path 参数**

| 名称       | 类型   | 必填 | 说明           |
|------------|--------|------|----------------|
| deviceId   | string | 是   | 设备号 / 车架号，对应 `device.device_no` |

- **Request Body（JSON）**

```json
{
  "commandType": "unlock",
  "commandId": "optional-自定义ID",
  "timeout": 30,
  "...": "其他参数"
}
```

说明：

- `commandType`：必填，字符串，支持的值示例（会自动映射成硬件控制码）：
  - `defense`         → 设防（关锁，0x01）
  - `undefense`       → 撤防（0x02）
  - `find`            → 寻车（0x09）
  - `unlock`          → 开锁（0x0B）
  - `lock`            → 加锁（0x0C）
  - `batteryLockOpen` → 电池锁开（0x0F）
  - `batteryLockClose`→ 电池锁关（0x10）
  - `wheelLockOpen`   → 轮毂锁开（0x16）
  - `wheelLockClose`  → 轮毂锁关（0x17）
  - `tempLock`        → 临时关锁（0x30）
  - `tempUnlock`      → 临时开锁（0x31）
  - `muteArmOn`       → 静音设防（0xF5）
  - `keylessOn`       → 感应借车开（0xF6）
  - `keylessOff`      → 感应借车关（0xF7）
  - `overspeedOn`     → 超速提醒开（0xF8）
  - `overspeedOff`    → 超速提醒关（0xF9）
- `commandId`：可选，字符串。如不传，后端自动生成唯一 `commandId`，同时作为下发 0x06/07/08 协议的 `MsgID`。
- `timeout`：可选，单位秒，默认 30。
- 其他字段：全部会被透传到下行参数中（目前主要给内部用，比如 `msgId`。前端一般只需 `commandType` 即可）。

- **Response（JSON）**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "commandId": "cmd_1732089485_101_008F",
    "status": "sent"
  }
}
```

- `code = 0` 表示成功。
- `data.commandId`：本次命令 ID，可用于后续追踪（同时对应硬件协议的 `MsgID`）。

---

# 2. 首页4G – 车辆位置信息

- **URL**

`GET /v2/devices/{deviceId}/location/basic`

- **Path 参数**

| 名称       | 类型   | 必填 | 说明                |
|------------|--------|------|---------------------|
| deviceId   | string | 是   | 设备号 / 车架号     |

- **Request Body**

无。

- **Response（JSON）**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "address": "广东省深圳市",
    "rideId": null
  }
}
```

字段说明：

- `address`：根据设备最近一次定位的经纬度，调用逆地理服务解析出的 **省 + 市** 文本。
  - 若当前没有经纬度，或逆地理失败，则可能返回空字符串 `""`。
- `rideId`：当前骑行会话 ID。
  - 现阶段逻辑中尚未打通“设备 → 正在进行的骑行记录”，暂时返回 `null` 占位；
  - 后续打通后，这里会返回对应 `ride_records.ride_id`，前端可以用它去查骑行详情/轨迹。

错误示例（设备不存在）：

```json
{
  "code": 1,
  "msg": "设备不存在: 181030008F",
  "data": null
}
```

---

# 3. 首页4G – 获取车辆状态

- **URL**

`GET /v2/devices/{deviceId}/status`

- **Path 参数**

| 名称       | 类型   | 必填 | 说明                |
|------------|--------|------|---------------------|
| deviceId   | string | 是   | 设备号 / 车架号     |

- **Request Body**

无。

- **Response（JSON）**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "warnCount": 3,
    "battery": 85,
    "isStarted": true,
    "isLocked": false,
    "isArmed": true,
    "isMuteArmOn": false,
    "isKeylessOn": false,
    "keylessRange": 0,
    "isOverspeedOn": false
  }
}
```

字段说明：

- `warnCount`：该设备告警总数（暂未区分已处理/未处理，后端当前是统计 `device_alarm` 中所有记录数）。
- `battery`：电量百分比，优先 `device.lastSoc`，否则用电池快照中的 `batterySocRel`，取不到则为 `0`。
- `isStarted`：
  - 解析车辆状态位 `D3`（ACC），`1` 表示整车供电（视为已启动），`0` 为断电。
- `isLocked`：
  - 由电机锁状态 `D2` 和 后轮锁状态 `D11` 综合判断：
    - `motorUnlocked = (D2 == 1)`
    - `rearWheelUnlocked = (D11 == 1)`
    - `isLocked = !(motorUnlocked && rearWheelUnlocked)`  
    → 只要电机锁或后轮锁有一个是锁住，就认为整体是加锁。
- `isArmed`：
  - 使用状态位 `D13,D14` 组合：
    - 组合值 `2` = 撤防 → `isArmed = false`
    - 其他值视为设防 → `isArmed = true`
- `isMuteArmOn` / `isKeylessOn` / `keylessRange` / `isOverspeedOn`：
  - 协议里当前尚未映射到具体位，后端暂时返回默认值：
    - `isMuteArmOn = false`
    - `isKeylessOn = false`
    - `keylessRange = 0`
    - `isOverspeedOn = false`
  - 后续如果协议补充了对应 bit/参数，这里会再做映射。

错误示例（设备不存在）：

```json
{
  "code": 1,
  "msg": "设备不存在: 181030008F",
  "data": null
}
```