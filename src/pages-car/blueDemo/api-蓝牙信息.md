车辆多设备绑定与控制方案
1. 目标
支持以下三类车辆设备形态：

仅 4G 设备
仅蓝牙设备
4G + 蓝牙 组合设备（示例：华惠 4G + E车星蓝牙）
要求：

用户扫码任意一个设备号都能完成绑定（按业务策略可限制）。
前端能区分设备类型，并选择正确的控制方式（4G 控制 / 蓝牙 SDK）。
方案可扩展到更多厂家和协议。
2. 后端数据模型
2.1 device 表（单设备信息）
关键字段：
device_no：设备编号（二维码内容）
device_type：设备类型编码，对应类型字典表
一辆车可以对应多条 device 记录（例如 1 条 4G + 1 条 BLE）。
2.2 设备类型字典 device_type_dict
用于描述每种设备类型的元数据，例如厂商、协议、大类（通信/蓝牙）。

重要字段：

type_code：设备类型编码
type_name：类型名称（如“华惠4G”、“E车星蓝牙”）
vendor：厂商标识（如 HUAHUI、ECS）
protocol：协议标识（如 HH-4G、ECS-BLE）
category：大类
COMM：通信设备（4G/2G/NB 等）
BLE：蓝牙设备
当前约定值示例：

type_code	type_name	vendor	category
1	华惠4G	HUAHUI	COMM
2	E车星蓝牙	ECS	BLE
后续有新厂商/新设备类型，在这张表中扩展即可。

2.3 设备组合表 device_combo_mapping
用于描述“一辆车上的多设备组合关系”，尤其是“4G + 蓝牙”。

字段说明：

primary_device_no：主设备编号（当前推荐扫码绑定用的设备号）
secondary_device_no：从设备编号
secondary_type_code：从设备类型编码（如 2=E车星蓝牙）
示例：华惠4G + E车星蓝牙

primary_device_no	secondary_device_no	secondary_type_code
QX123	ECS456	2
3. 绑定与设备形态
3.1 通用规则
用户通过小程序扫码获得 scanDeviceNo。
后端以 scanDeviceNo 作为车辆主设备号，绑定到车辆信息上：
VehicleInfo.deviceNo = scanDeviceNo。
后端再根据组合表查找是否存在配套设备，并在接口返回中一并告知前端。
是否允许“组合车扫蓝牙也能绑定”，由业务策略控制（后端可通过 deviceType 的 category 做限制）。

3.2 三种典型形态
仅 4G 设备
只有一条 
Device
 记录，category=COMM，无组合记录。
绑定：扫 4G 即可。
控制：全部通过 4G。
仅蓝牙设备
只有一条 
Device
 记录，category=BLE，无组合记录。
绑定：扫蓝牙设备号即可。
控制：全部通过蓝牙 SDK。
4G + 蓝牙 组合设备
至少两条 
Device
：一条 COMM（4G），一条 BLE（蓝牙）。
device_combo_mapping 记录两者关系。
推荐绑定方式：扫描 4G 设备号。
控制方式：
通信相关（远程锁车、状态上报）：走 4G 协议；
近场控制（本地解锁等）：走蓝牙 SDK。
4. 前端接口与字段
所有使用 
VehicleDto
 的接口（例如）：

GET /vehicle/{vehicleId}
GET /vehicle/user/vehicles
GET /vehicle/user/complete
GET /vehicle/device/{deviceNo}
都会返回以下三个关键字段：

4.1 deviceType
类型：number
含义：主设备类型编码，对应 device_type_dict.type_code。
用法：
通过字典接口（建议提供 GET /device/types）获取：
typeCode -> { typeName, vendor, category }
用 category 区分：
COMM：通信设备（4G 主设备）
BLE：蓝牙设备
4.2 bluetoothDeviceNo
类型：string | null
含义：组合蓝牙设备号（如存在 E车星 蓝牙）。
用法：
非空表示这辆车还有一个蓝牙伙伴设备；
对应 E车星 蓝牙模块的设备号，供蓝牙 SDK 使用。
4.3 bluetoothDeviceType
类型：number | null
含义：组合蓝牙设备类型编码，同样对应 device_type_dict.type_code。
用法：
通过类型字典判断蓝牙厂商/协议；
例如 bluetoothDeviceType=2 → vendor=ECS → 使用 E车星 BLE SDK。