

# 1. 车辆预警列表

- **URL**：`GET /v2/devices/{deviceId}/alarms`
- **说明**：分页查询某设备的告警列表，可按类型筛选“全部 / 位移 / 震动”。

## 请求参数

- **Path**
  - `deviceId`：设备号（字符串）

- **Query**
  - `type`：告警类型，默认 `all`
    - `all`：全部告警  
    - `move`：位移告警（`alarmCode` = 22/25）
    - `shake`：震动告警（`alarmCode` = 63）
  - `pageNo`：页码（从 1 开始），默认 `1`
  - `pageSize`：每页条数，默认 `20`，最大 `100`

## 响应数据结构

```json
{
  "code": "200",
  "message": "操作成功",
  "data": {
    "items": [
      {
        "id": 123,                     // 告警记录ID
        "time": "2025-09-24 07:43:33", // 告警时间(设备时间，格式: yyyy-MM-dd HH:mm:ss)
        "title": "2025-09-24 07:43:33",// 标题（前端可直接用或自拼）
        "content": "您的车辆出现告警",   // 内容文案（前端可根据 alarmCode 做二次加工）
        "alarmCode": 22,              // 告警编码（见协议定义）
        "category": "move"            // 告警分类: move / shake / other
      }
    ],
    "pageNo": 1,
    "pageSize": 20,
    "total": 2
  },
  "success": true
}
```

> 注：`category` 是后端根据 `alarmCode` 归类的结果。  
> - `move`：22(轮动告警), 25(非法移动)  
> - `shake`：63(震动告警)  
> - 其它：`other`

---

# 2. 车辆预警统计汇总（Tab 角标）

- **URL**：`GET /v2/devices/{deviceId}/alarms/summary`
- **说明**：获取该设备的“全部 / 位移 / 震动”告警总数，用于 Tab 角标显示。

## 请求参数

- **Path**
  - `deviceId`：设备号

无 Query 参数。

## 响应数据结构

```json
{
  "code": "200",
  "message": "操作成功",
  "data": {
    "all": 10,    // 全部告警总数
    "move": 120,  // 位移告警总数 (alarmCode in [22,25])
    "shake": 305  // 震动告警总数 (alarmCode = 63)
  },
  "success": true
}
```

 

---

# 3. 车辆预警 - 清除未读

- **URL**：`POST /v2/devices/{deviceId}/alarms/clear-unread`
- **说明**：对应页面“清除未读”按钮，目前告警表未区分已读/未读，该接口为**占位实现**，只返回成功，不改数据。

## 请求参数

- **Path**
  - `deviceId`：设备号

无 Body / Query 参数。

## 响应数据结构

```json
{
  "code": "200",
  "message": "操作成功",
  "data": null,
  "success": true
}
```