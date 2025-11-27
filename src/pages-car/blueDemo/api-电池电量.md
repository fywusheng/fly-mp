- 电池详细信息查询  
- 车辆详情（内含简要电池信息）  
- 设置/修改电池电压类型  

---

# 一、查询电池详细信息接口

用于“电池电量”弹窗/页面的详细展示。

## 1.1 URL

```http
GET /vehicle/batteryInfo/{deviceNo}
```

## 1.2 路径参数

- `deviceNo`：字符串，设备编号，必填。

## 1.3 Query 参数

- `voltageType`：整数，可选。  
  - 取值：`48` / `60` / `72`。  
  - 不传时，后端会尝试从车辆表 `vehicle_info.battery_voltage_type` 读取。  
  - 若两边都有，目前实现是：  
    - 优先用 Query 参数 `voltageType`；  
    - 否则才用车辆里的配置。

## 1.4 返回结构

统一包装：`ApiResponse<BatteryInfoDTO>`

[BatteryInfoDTO](cci:2://file:///d:/WorkSpace/%E5%85%BC%E8%81%8C/ebike-bak/ebike-iot-platform/ebike-common/src/main/java/com/ebike/common/dto/BatteryInfoDTO.java:11:0-40:1) 字段：

- `deviceNo`：String，设备编号  
- `batteryPercent`：Double，电量百分比，0–100，保留 1 位小数，可能为 null  
- `voltage`：Double，当前电压(V)（由 mV / 1000.0 转换）  
- `voltageType`：Integer，电池电压类型（48/60/72），是**实际参与计算的值**  
- `soh`：Integer，SOH 百分比  
- `cycleCount`：Integer，循环次数  
- `temperatureRaw`：Integer，温度原始值  
- `currentRaw`：Integer，电流原始值  

### 1.5 电量计算规则（前端只需知晓，逻辑在后端）

1. 若 `batterySocRel` 在 0–100：
   - `batteryPercent = socRel`
2. 否则若 `batterySocAbs` 在 0–100：
   - `batteryPercent = socAbs`
3. 否则（SOC 不可信 && 有电压档位）按电压估算：
   - 档位区间：
     - 48V：`vMin=42.0`, `vMax=54.6`
     - 60V：`vMin=50.0`, `vMax=67.2`
     - 72V：`vMin=60.0`, `vMax=84.0`
     - 其他：默认按 48V
   - `v <= vMin → 0%`  
     `v >= vMax → 100%`  
     中间线性插值 `(v - vMin) * 100 / (vMax - vMin)`
   - 最后用 BigDecimal 四舍五入到**1 位小数**。

### 1.6 返回示例

```json
{
  "code": "200",
  "msg": "success",
  "data": {
    "deviceNo": "205103099",
    "batteryPercent": 73.5,
    "voltage": 46.08,
    "voltageType": 48,
    "soh": 0,
    "cycleCount": 0,
    "temperatureRaw": 0,
    "currentRaw": 0
  }
}
```

---

# 二、车辆详情（内含简要电池信息）

用于首页“我的车辆”卡片、车辆列表等场景。

## 2.1 获取车辆详情（按车辆ID）

```http
GET /vehicle/{vehicleId}
```

- 返回：`ApiResponse<VehicleDto>`

[VehicleDto](cci:2://file:///d:/WorkSpace/%E5%85%BC%E8%81%8C/ebike-bak/ebike-iot-platform/ebike-common/src/main/java/com/ebike/common/dto/VehicleDto.java:12:0-87:1) 中与电池相关字段：

- `batteryVoltageType`：Integer，电池电压类型（48/60/72），来自 `vehicle_info.battery_voltage_type`  
- `batteryLevel`：Double，电池电量百分比 (0–100)  
  - 来自 `Device.lastSoc`（最近一次定位/电池包），范围 0–100  
- `batteryVoltage`：Double，电池电压(V)  
  - 来自 `Device.lastBatteryVoltage / 1000.0`

其它字段略（车辆名、颜色、品牌、骑行次数等未变）。

## 2.2 获取用户车辆列表

```http
GET /vehicle/user/vehicles
```

- 返回：`ApiResponse<List<VehicleDto>>`
- 列表中的每个 [VehicleDto](cci:2://file:///d:/WorkSpace/%E5%85%BC%E8%81%8C/ebike-bak/ebike-iot-platform/ebike-common/src/main/java/com/ebike/common/dto/VehicleDto.java:12:0-87:1) 同样包含 `batteryVoltageType`、`batteryLevel`、`batteryVoltage`。

---

# 三、设置 / 修改电池电压类型接口

电压类型保存在 `vehicle_info.battery_voltage_type` 字段。  
前端“选择 48V / 60V / 72V”后，通过更新车辆信息接口写回。

## 3.1 URL

```http
POST /vehicle/update
Content-Type: application/json
```

## 3.2 请求体（示例）

[VehicleInfo](cci:2://file:///d:/WorkSpace/%E5%85%BC%E8%81%8C/ebike-bak/ebike-iot-platform/ebike-device-service/src/main/java/com/ebike/device/entity/VehicleInfo.java:11:0-118:1) 作为请求体，常用字段如下（只需要传要修改的字段）：

```json
{
  "id": 123,               // 车辆ID，必填，用于定位哪辆车
  "deviceNo": "205103099", // 建议一并传
  "batteryVoltageType": 48 // 48 / 60 / 72
}
```

说明：

- 后端已有 [VehicleInfo](cci:2://file:///d:/WorkSpace/%E5%85%BC%E8%81%8C/ebike-bak/ebike-iot-platform/ebike-device-service/src/main/java/com/ebike/device/entity/VehicleInfo.java:11:0-118:1) 实体增加了 `batteryVoltageType` 字段：  
  `@TableField("battery_voltage_type") private Integer batteryVoltageType;`
- `/vehicle/update` 的实现是 [vehicleService.updateVehicleInfo(vehicleInfo)](cci:1://file:///d:/WorkSpace/%E5%85%BC%E8%81%8C/ebike-bak/ebike-iot-platform/ebike-device-service/src/main/java/com/ebike/device/controller/VehicleController.java:272:4-288:5)，会根据 `id` 更新对应记录。

## 3.3 返回

```json
{
  "code": "200",
  "msg": "success",
  "data": {
    "...": "更新后的VehicleInfo对象"
  }
}
```

前端通常只关心 `code == "200"` 即算成功。

---

# 四、前端调用建议流程

### 4.1 首次/修改电压类型

1. 打开“电池电量”页面 → 调用：
   ```http
   GET /vehicle/{vehicleId}
   ```
   - 展示当前 `batteryVoltageType` （高亮 48/60/72 中的一个）。
2. 用户选择新电压类型（比如 60V）→ 点击“确定”后调用：
   ```http
   POST /vehicle/update
   {
     "id": vehicleId,
     "deviceNo": "...",
     "batteryVoltageType": 60
   }
   ```
3. 成功后，可重新调用：
   ```http
   GET /vehicle/batteryInfo/{deviceNo}
   ```
   拿到基于新档位重新计算的 `batteryPercent`。

### 4.2 展示电量图标

- 列表/详情页：直接使用 `VehicleDto.batteryLevel`、`batteryVoltage` 显示简要信息。
- 电池详情页：使用 `/vehicle/batteryInfo/{deviceNo}` 的 `batteryPercent` 作为主数据源：
  - 0–10：空电图标  
  - 10–30：低电  
  - 30–60：中电  
  - 60–90：高电  
  - 90–100：满电  
- 图标下可显示电压：`${voltage} V`，例如 `46.1 V`。