<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { usePageAuth } from '@/hooks/usePageAuth'
import { useToggleStore } from '@/store'
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'

usePageAuth()

onLaunch(() => {
  // 处理隐私协议
  listenPrivacyOpen()
  // 版本更新检查
  updateApp()
})

// 监听隐私协议弹窗
function listenPrivacyOpen() {
  if (!wx.canIUse('onNeedPrivacyAuthorization'))
    return
  const toggleStore = useToggleStore()
  wx.onNeedPrivacyAuthorization((resolve) => {
    toggleStore.privacyModal.resolvePrivacyAuthorization = resolve as any
    toggleStore.togglePrivacyModal(true)
  })
}

// 版本更新
function updateApp() {
  const updateManager = uni.getUpdateManager()

  updateManager.onCheckForUpdate((res) => {
    // 请求完新版本信息的回调
    console.log(res.hasUpdate)
  })
  updateManager.onUpdateReady((res) => {
    uni.showModal({
      title: '更新提示',
      content: '新版本已经准备好，是否重启应用？',
      success(res) {
        if (res.confirm) {
          // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
          updateManager.applyUpdate()
        }
        else if (res.cancel) {
          console.log('用户点击取消，不更新')
        }
      },
    })
  })
  updateManager.onUpdateFailed((res) => {
    // 新的版本下载失败
    uni.showModal({
      title: '已经有新版本了哟~',
      content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
    })
  })
}
</script>

<style lang="scss">
button::after {
  border: none;
}

swiper,
scroll-view {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

image {
  width: 100%;
  height: 100%;
  vertical-align: middle;
}

// 单行省略，优先使用 unocss: text-ellipsis
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 两行省略
.ellipsis-2 {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

// 三行省略
.ellipsis-3 {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
