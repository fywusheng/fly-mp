URL
http
GET  /api/riding/dashboard/riding
 
入参
vehicleId（必填）：车辆 ID
date（可选）：查询日期，yyyy-MM-dd，不传=当天
返回结构（关键字段）
jsonc
{
  "code": 200,
  "message": "OK",
  "data": {
    // 我的总里程 + 累计信息 
    "cumulativeStats": {
      "totalTrips": 0,             // 累计出行次数
      "totalRidingMinutes": 0,     // 累计骑行时间（分钟）
      "companionshipDays": 0,      // 陪伴天数
      "totalDistanceKm": 0.0,      // 累计里程（km）——对标“我的总里程 0.00 KM”
      "ageLabel": "我今年15岁了",
      "vehicleImageUrl": "..."
    },

    // 今日骑行统计 
    "dailyStats": {
      "tripSegments": 3,           // 出行段数
      "totalRidingTime": 46,       // 总骑行时间（分钟）→ 前端可转成 46.28h 之类
      "maxSpeed": 25.5,            // 最高时速
      "totalDistanceKm": 4.25      // 今日总里程（km）
    },

    
    "currentLocation": { ... },
    "ridingRecords": [ ... ],
    "ridingSummary": { ... },
    "ownerType": 0
  }
}
 

“我的总里程 0.00 KM” → data.cumulativeStats.totalDistanceKm
“累计出行 0 次” → data.cumulativeStats.totalTrips
“陪伴时间 0 天” → data.cumulativeStats.companionshipDays
“今日骑行数据 · 骑行里程 4.25km” → data.dailyStats.totalDistanceKm
“总耗时 46.28h” → data.dailyStats.totalRidingTime（分钟，前端自己格式化）
“减少碳排放 270g” → 可用你之前的减碳公式在前端或后端换算（目前累计/今日里程都已经有）

2.  series 结构，和你截图里的 res 一样。

URL
http
GET /dashboard/mileage-chart
入参
vehicleId（必填）：车辆 ID
periodType（可选）：day/week/month，当前实现按 day 处理，默认 day
date（可选）：参考日期 yyyy-MM-dd，不传=当天
当前实现为：以 date 为结束，向前 7 天的每日总里程
返回结构
jsonc
{
  "code": 200,
  "message": "OK",
  "data": {
    "categories": ["10-14", "10-15", "10-16", "10-17", "10-18", "10-19", "10-20"],
    "series": [
      {
        "name": "骑行里程",
        "data": [48, 68, 110, 160, 180, 150, 174], // 每天总里程（km）
        "color": "#00C26F"
      }
    ]
  }
}