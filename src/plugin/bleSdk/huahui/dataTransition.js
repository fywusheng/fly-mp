const CRC16Data = [
  0x0000,
  0x1189,
  0x2312,
  0x329B,
  0x4624,
  0x57AD,
  0x6536,
  0x74BF,
  0x8C48,
  0x9DC1,
  0xAF5A,
  0xBED3,
  0xCA6C,
  0xDBE5,
  0xE97E,
  0xF8F7,
  0x1081,
  0x0108,
  0x3393,
  0x221A,
  0x56A5,
  0x472C,
  0x75B7,
  0x643E,
  0x9CC9,
  0x8D40,
  0xBFDB,
  0xAE52,
  0xDAED,
  0xCB64,
  0xF9FF,
  0xE876,
  0x2102,
  0x308B,
  0x0210,
  0x1399,
  0x6726,
  0x76AF,
  0x4434,
  0x55BD,
  0xAD4A,
  0xBCC3,
  0x8E58,
  0x9FD1,
  0xEB6E,
  0xFAE7,
  0xC87C,
  0xD9F5,
  0x3183,
  0x200A,
  0x1291,
  0x0318,
  0x77A7,
  0x662E,
  0x54B5,
  0x453C,
  0xBDCB,
  0xAC42,
  0x9ED9,
  0x8F50,
  0xFBEF,
  0xEA66,
  0xD8FD,
  0xC974,
  0x4204,
  0x538D,
  0x6116,
  0x709F,
  0x0420,
  0x15A9,
  0x2732,
  0x36BB,
  0xCE4C,
  0xDFC5,
  0xED5E,
  0xFCD7,
  0x8868,
  0x99E1,
  0xAB7A,
  0xBAF3,
  0x5285,
  0x430C,
  0x7197,
  0x601E,
  0x14A1,
  0x0528,
  0x37B3,
  0x263A,
  0xDECD,
  0xCF44,
  0xFDDF,
  0xEC56,
  0x98E9,
  0x8960,
  0xBBFB,
  0xAA72,
  0x6306,
  0x728F,
  0x4014,
  0x519D,
  0x2522,
  0x34AB,
  0x0630,
  0x17B9,
  0xEF4E,
  0xFEC7,
  0xCC5C,
  0xDDD5,
  0xA96A,
  0xB8E3,
  0x8A78,
  0x9BF1,
  0x7387,
  0x620E,
  0x5095,
  0x411C,
  0x35A3,
  0x242A,
  0x16B1,
  0x0738,
  0xFFCF,
  0xEE46,
  0xDCDD,
  0xCD54,
  0xB9EB,
  0xA862,
  0x9AF9,
  0x8B70,
  0x8408,
  0x9581,
  0xA71A,
  0xB693,
  0xC22C,
  0xD3A5,
  0xE13E,
  0xF0B7,
  0x0840,
  0x19C9,
  0x2B52,
  0x3ADB,
  0x4E64,
  0x5FED,
  0x6D76,
  0x7CFF,
  0x9489,
  0x8500,
  0xB79B,
  0xA612,
  0xD2AD,
  0xC324,
  0xF1BF,
  0xE036,
  0x18C1,
  0x0948,
  0x3BD3,
  0x2A5A,
  0x5EE5,
  0x4F6C,
  0x7DF7,
  0x6C7E,
  0xA50A,
  0xB483,
  0x8618,
  0x9791,
  0xE32E,
  0xF2A7,
  0xC03C,
  0xD1B5,
  0x2942,
  0x38CB,
  0x0A50,
  0x1BD9,
  0x6F66,
  0x7EEF,
  0x4C74,
  0x5DFD,
  0xB58B,
  0xA402,
  0x9699,
  0x8710,
  0xF3AF,
  0xE226,
  0xD0BD,
  0xC134,
  0x39C3,
  0x284A,
  0x1AD1,
  0x0B58,
  0x7FE7,
  0x6E6E,
  0x5CF5,
  0x4D7C,
  0xC60C,
  0xD785,
  0xE51E,
  0xF497,
  0x8028,
  0x91A1,
  0xA33A,
  0xB2B3,
  0x4A44,
  0x5BCD,
  0x6956,
  0x78DF,
  0x0C60,
  0x1DE9,
  0x2F72,
  0x3EFB,
  0xD68D,
  0xC704,
  0xF59F,
  0xE416,
  0x90A9,
  0x8120,
  0xB3BB,
  0xA232,
  0x5AC5,
  0x4B4C,
  0x79D7,
  0x685E,
  0x1CE1,
  0x0D68,
  0x3FF3,
  0x2E7A,
  0xE70E,
  0xF687,
  0xC41C,
  0xD595,
  0xA12A,
  0xB0A3,
  0x8238,
  0x93B1,
  0x6B46,
  0x7ACF,
  0x4854,
  0x59DD,
  0x2D62,
  0x3CEB,
  0x0E70,
  0x1FF9,
  0xF78F,
  0xE606,
  0xD49D,
  0xC514,
  0xB1AB,
  0xA022,
  0x92B9,
  0x8330,
  0x7BC7,
  0x6A4E,
  0x58D5,
  0x495C,
  0x3DE3,
  0x2C6A,
  0x1EF1,
  0x0F78,

]

// 获取流水号
function getSequenceId(sequenceId) {
  if (sequenceId > 255)
    sequenceId = 0
  let n = sequenceId.toString(16)
  let s = `00${n}`
  return s.substr(n.length, s.length) // 截取最后2位字符
}

// 获取数据的字节长度
function getPayLoadLength(content) {
  let c = (content.length / 2).toString(16)
  let s = `0000${c}`
  return s.substr(c.length, s.length)
}

// 获取秘钥长度
function getSecretKeyLength(content) {
  let c = (content.length / 2).toString(16)
  let s = `00${c}`
  return s.substr(c.length, s.length)
}

function getCRC16(content) {
  let mCrc = 0xFFFF
  // [0x03, 0x00, 0x82, 0x01, 0x00]
  content.forEach((value, index, array) => {
    mCrc = (mCrc >>> 8) ^ CRC16Data[(mCrc ^ value) & 0xFF]
  })

  let value = ((~mCrc) & 0xFFFF).toString(16)
  let s = `0000${value}`

  return s.substr(value.length, s.length)
}

// 数据包请求头,ack
function header(sendData, ack, systemState, sequenceId) {
  let payLoadLength = this.getPayLoadLength(sendData.toString().replace(/\s+/g, ''))

  let contentArr = Array.prototype.map.call(sendData.split(' '), (value) => {
    return `0x${value}`
  })

  let CRC16 = this.getCRC16(contentArr).toLowerCase()

  /*
 ack 0 ,1,反馈为1，发送为0
 systemState,反馈为带过来的值，发送为00
 sequenceId,为流水号，自增
 payLoadLength,数据包的长度
 CRC16,数据包经过CRC算法得到的结果
  */

  let header = `aa${ack}2${systemState}${sequenceId}${payLoadLength}${CRC16}`
  return header
}

// 数据包
function content(secretKey, sendValue) {
  if (secretKey.length == 0)
    return sendValue
  else return `${secretKey}${sendValue}`
}

// TID号加密解密算法描述
// 466fe489d=>70537421
const szKey3 = [0x35, 0x41, 0x32, 0x42, 0x33, 0x43, 0x36, 0x44, 0x39, 0x45, 0x38, 0x46, 0x37, 0x34, 0x31, 0x30,
]
// 解密 ，参数16进制
function encrypt(number) {
  number = number.toUpperCase()
  let out_number = ''
  if (!number)
    return
  let len = number.length

  if (len > 16)
    return
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < 16; j++) {
      if (number.charAt(i).charCodeAt() == szKey3[j]) // 字符转ascii码
        out_number += String.fromCharCode(0x2A + j)
      else
        continue
    }
  }
  return out_number
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  let hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    (bit) => {
      return (`00${bit.toString(16)}`).slice(-2)
    },
  )
  return hexArr.join('')
}

// 字符串平均切割成数组
function strAverage2Arr(str, no) {
  let arr = []
  for (let i = 0; i < str.length; i += no) {
    arr.push(str.slice(i, i + 2))
  }
  return arr
}

// 数组的每个元素加前缀
function addFlagBeforeArr(arr) {
  return Array.prototype.map.call(arr, (value) => {
    return `0x${value}`
  })
}

// 字符转ArrayBuffer
function hexStringToArrayBuffer(str) {
  // 将16进制转化为ArrayBuffer
  return new Uint8Array(str.match(/[\da-f]{2}/gi).map((h) => {
    return Number.parseInt(h, 16)
  })).buffer
}

export default {
  header,
  content,
  getCRC16,
  getSequenceId,
  getSecretKeyLength,
  getPayLoadLength,
  encrypt,
  ab2hex,
  strAverage2Arr,
  addFlagBeforeArr,
  hexStringToArrayBuffer,
}
//   getSequenceId,
//   getSecretKeyLength,
//   getPayLoadLength,
//   encrypt,
//   ab2hex,
//   strAverage2Arr,
//   addFlagBeforeArr,
//   hexStringToArrayBuffer,
// }
