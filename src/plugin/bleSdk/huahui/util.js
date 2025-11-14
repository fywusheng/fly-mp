function formatTime(date) {
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()

  let hour = date.getHours()
  let minute = date.getMinutes()
  let second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 确认提示modal框，有取消按钮
function showModal(content, cb, error) {
  wx.showModal({
    title: '温馨提示',
    content,
    showCancel: true,
    success(res) {
      if (res.confirm) {
        cb && cb()
      }
      else {
        error && error()
      }
    },
  })
}

// 确认提示modal框，无取消按钮
function showModal_nocancel(content, cb) {
  wx.showModal({
    title: '温馨提示',
    content,
    showCancel: false,
    success(res) {
      if (res.confirm) {
        cb && cb()
      }
    },
  })
}

export default {
  formatTime,
  showModal_nocancel,
  showModal,
}

// module.exports = {
//   formatTime,
//   showModal_nocancel,
//   showModal,
// }
