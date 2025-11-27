
# 1. 首页骑行仪表盘

用于首页“今日骑行时间 / 今日骑行里程 + 下方统计卡片”的整体数据。

- **接口地址**：`GET /dashboard/riding`
- **说明**：返回单辆车在某天的完整骑行仪表盘数据（累计 + 当日 + 当日记录列表 + 摘要）。
- **是否需要登录**：是（从网关 / Header 中获取当前用户）。

## 请求

- **Query 参数**

| 参数名      | 类型     | 必填 | 说明                                   |
|------------|----------|------|----------------------------------------|
| `vehicleId`| Long     | 是   | 车辆 ID（设备绑定的车辆主键 ID）      |
| `date`     | String   | 否   | 查询日期 `yyyy-MM-dd`，不传=当天      |

示例：

```http
GET /dashboard/riding?vehicleId=123&date=2025-09-28
```

## 响应

- **响应包装**：`ApiResponse<RidingDashboardDTO>`

### RidingDashboardDTO 字段

```jsonc
{
  "code": 200,
  "message": "success",
  "data": {
    "cumulativeStats": { ... },
    "currentLocation": { ... },
    "dailyStats": { ... },
    "ridingRecords": [ ... ],
    "ridingSummary": { ... },
    "ownerType": 0
  }
}
```

- **data.cumulativeStats**（[UserCumulativeStatsDTO](cci:2://file:///d:/WorkSpace/%E5%85%BC%E8%81%8C/ebike-bak/ebike-iot-platform/ebike-common/src/main/java/com/ebike/common/dto/ride/UserCumulativeStatsDTO.java:11:0-33:1)）——用于“累计里程 / 累计时间 / 总骑行次数 / 陪伴天数”等

| 字段名              | 类型     | 说明                           |
|--------------------|----------|--------------------------------|
| `totalTrips`       | Integer  | 累计出行次数                   |
| `totalRidingMinutes` | Integer| 累计骑行时间（分钟）           |
| `companionshipDays` | Integer | 陪伴天数                       |
| `totalDistanceKm`  | Double   | 累计骑行里程（公里）           |
| `ageLabel`         | String   | 年龄标签文案                   |
| `vehicleImageUrl`  | String   | 车辆图片 URL（首页车图）       |

- **data.currentLocation**（`LocationInfoDTO`，字段略，主要是当前地址描述等）

- **data.dailyStats**（[DailyRidingStatsDTO](cci:2://file:///d:/WorkSpace/%E5%85%BC%E8%81%8C/ebike-bak/ebike-iot-platform/ebike-common/src/main/java/com/ebike/common/dto/ride/DailyRidingStatsDTO.java:11:0-27:1)）——首页“今日骑行时间 / 今日骑行里程 / 今日最高时速”等

| 字段名             | 类型    | 说明                                   |
|-------------------|---------|----------------------------------------|
| `tripSegments`    | Integer | 当日骑行段数                           |
| `totalRidingTime` | Integer | 当日总骑行时间（分钟）                 |
| `maxSpeed`        | Double  | 当日最高时速（km/h）                   |
| `totalDistanceKm` | Double  | 当日总骑行里程（公里）                 |

- **data.ridingRecords**（`List<RidingRecordDTO>`）——若首页需要当日多段记录，可按这里补充（当前你主要使用 history 接口）

- **data.ridingSummary**（`RidingSummaryDTO`）——当日汇总块

- **data.ownerType**  

| 值  | 含义       |
|-----|------------|
| `0` | 车主数据   |
| `1` | 成员/用户数据 |

---

# 2. 骑行历史列表（“骑行轨迹”列表页）

对应第一张截图中的“骑行轨迹”列表，每条记录显示：日期时间、起止地址、本次里程、平均速度、骑行时间、减碳量等。

- **接口地址**：`GET /ride/history`
- **说明**：分页查询某辆车的骑行历史记录。
- **是否需要登录**：是（内部会做车主/成员权限判断）。

## 请求

- **Query 参数**

| 参数名      | 类型    | 必填 | 说明                                           |
|------------|---------|------|------------------------------------------------|
| `vehicleId`| Long    | 是   | 车辆 ID                                        |
| `page`     | int     | 否   | 页码，从 0 开始，默认 0                        |
| `size`     | int     | 否   | 每页大小，默认 10                              |

示例：

```http
GET /ride/history?vehicleId=123&page=0&size=10
```

## 响应

- **响应包装**：`ApiResponse<Page<RideHistoryDTO>>`   

典型结构：

```jsonc
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [
      {
        "rideId": "xxx",
        "startTime": "2025-09-28T12:01:48",
        "endTime": "2025-09-28T12:07:56",
        "distance": 2.04,
        "duration": 1412,
        "mapThumbnailUrl": "http://.../maps/ride_xxx_thumb.png",
        "startAddress": "广东省广州市珠海区...",
        "endAddress": "广东省广州市珠海区...",
        "avgSpeed": 20.4,
        "carbonReduction": 204
      }
    ],
    "total": 20,
    "size": 10,
    "current": 0,
    "pages": 2
  }
}
```

### RideHistoryDTO 字段（与 UI 对应）

| 字段名           | 类型    | 说明                                                     | UI 映射                      |
|-----------------|---------|----------------------------------------------------------|-----------------------------|
| `rideId`        | String  | 骑行记录 ID，后续“查看轨迹”要带给详情接口               | 列表项“查看轨迹”跳转参数    |
| `startTime`     | Date    | 开始时间                                                 | 顶部 `2025/09/28 12:01:48` |
| `endTime`       | Date    | 结束时间                                                 | 顶部 `12:07:56`            |
| `distance`      | Double  | 骑行距离（公里）                                         | “本次里程 204”（注意单位换算） |
| `duration`      | Long    | 骑行时长（毫秒）                                         | “骑行时间 00:23:32”        |
| `mapThumbnailUrl` | String| 地图缩略图 URL                                          | 列表条目或详情中的缩略图    |
| `startAddress`  | String  | 起点地址                                                 | 第一行红点文本              |
| `endAddress`    | String  | 终点地址                                                 | 第二行绿点文本              |
| `avgSpeed`      | Double  | 平均速度（km/h），后端已计算                            | “评价速度 204km/h”         |
| `carbonReduction` | Double| 减少碳排放量（单位自定义：g 或 kg，由前端展示控制）     | “减少碳排放 204g”          |

---

# 3. 骑行轨迹详情（“查看轨迹”地图页）

地图详情页：顶部起止时间、起终地址、地图路径、骑行时间、最高速度等。

- **接口地址**：`GET /ride/track/detail/{rideId}`
- **说明**：根据骑行记录 ID 获取完整轨迹详情和汇总信息。
- **是否需要登录**：是（内部做权限验证）。

## 请求

- **Path 参数**

| 参数名   | 类型   | 必填 | 说明           |
|---------|--------|------|----------------|
| `rideId`| String | 是   | 骑行记录 ID    |

示例：

```http
GET /ride/track/detail/d69ab3b8-8a9e-45fd-9e40-377ad81082c7
```

## 响应

- **响应包装**：`ApiResponse<RideTrackDetailDTO>`

典型结构（字段根据 `RideTrackDetailDTO`）：

```jsonc
{
  "code": 200,
  "message": "success",
  "data": {
    "rideId": "xxx",
    "startLocation": "广东省广州市珠海区...",
    "endLocation": "广东省广州市珠海区...",
    "startTime": "12:01",
    "endTime": "12:07",
    "ridingTimeMinutes": 23,
    "maxSpeed": 20.4,
    "trackPoints": [
      {
        "latitude": 23.0,
        "longitude": 113.0,
        "timestamp": 1764041944000
      }
    ]
  }
}
```

### 关键字段 

| 字段名              | 类型    | 说明                                       | UI 映射                           |
|--------------------|---------|--------------------------------------------|----------------------------------|
| `rideId`           | String  | 骑行记录 ID                                | 内部使用                         |
| `startLocation`    | String  | 起点地址                                   | 红点旁文案                       |
| `endLocation`      | String  | 终点地址                                   | 绿点旁文案                       |
| `startTime`        | String  | 起点时间（HH:mm）                           
| `endTime`          | String  | 终点时间（HH:mm）                        
| `ridingTimeMinutes`| Integer | 骑行时长（分钟）                           | “骑行时间 00:23:32”             |
| `maxSpeed`         | Double  | 最高速度（km/h），内部限制最大 25km/h      | “最高速度 204km/h”（示意）      |
| `trackPoints`      | List    | 轨迹点列表（按时间倒序，终点在前，起点在后） | 地图 polyline 绘制               |

`trackPoints` 元素（`RideTrackDetailDTO.TrackPointDTO`）：

| 字段名     | 类型    | 说明                          |
|-----------|---------|-------------------------------|
| `latitude`| Double  | 纬度                          |
| `longitude`| Double | 经度                          |
| `timestamp`| Long   | 毫秒时间戳，用于前端回放/打点 |

---