import type { IUserInfoVo } from '@/api/types/login'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getUserInfo as _getUserInfo,
  login as _login,
  logout as _logout,
  updateInfo as _updateInfo,
  wxLogin as _wxLogin,
  getWxCode,
} from '@/api/login'
import { toast } from '@/utils/toast'

// 初始化状态
const userInfoState: IUserInfoVo = {
  userId: 0,
  nickname: '',
  avatar: '',
  token: '',
  gender: 0,
  lastLoginTime: '',
  mobile: '',
  openId: null,
  status: 1,
  userType: 0,
  defaultVehicleId: 0,
}

export const useUserStore = defineStore(
  'user',
  () => {
    // 定义用户信息
    const userInfo = ref<IUserInfoVo>({ ...userInfoState })
    // 计算属性
    const isLoggedIn = computed(() => Boolean(userInfo.value.token && userInfo.value.userId))

    // 设置用户信息
    const setUserInfo = (val: IUserInfoVo) => {
      // console.log('设置用户信息', val)
      // val.token = uni.getStorageSync('token')
      // // 若头像为空 则使用默认头像
      // if (!val.avatar) {
      //   val.avatar = userInfoState.avatar
      // }
      // else {
      //   val.avatar = 'https://oss.laf.run/ukw0y1-site/avatar.jpg?feige'
      // }
      userInfo.value = val
    }
    const setUserAvatar = (avatar: string) => {
      userInfo.value.avatar = avatar
      console.log('设置用户头像', avatar)
      console.log('userInfo', userInfo.value)
    }
    // 删除用户信息
    const removeUserInfo = () => {
      userInfo.value = { ...userInfoState }
      uni.removeStorageSync('userInfo')
      uni.removeStorageSync('token')
    }

    /**
     * 获取用户信息
     */
    const getUserInfo = async () => {
      const res = await _getUserInfo()
      // 设置token
      res.data.token = uni.getStorageSync('token')
      // 设置用户信息
      setUserInfo(res.data)
      uni.setStorageSync('userInfo', res.data)
      // TODO 这里可以增加获取用户路由的方法 根据用户的角色动态生成路由
      return res
    }
    /**
     * 更新用户信息
     */
    const updateInfo = async (data) => {
      // 更新用户信息
      const res = await _updateInfo(data)
      // 获取用户信息
      await getUserInfo()
      return res
    }
    /**
     * 用户登录
     * @param credentials 登录参数
     * @returns R<IUserLogin>
     */
    const login = async (credentials: {
      username: string
      password: string
      code: string
      uuid: string
    }) => {
      const res = await _login(credentials)
      console.log('登录信息', res)
      toast.success('登录成功')
      await getUserInfo()
      return res
    }

    /**
     * 退出登录 并 删除用户信息
     */
    const logout = async () => {
      const res = await _logout()
      if (res.code === '200') {
        removeUserInfo()
      }
      return res
    }
    /**
     * 微信登录
     */
    const wxLogin = async ({ phoneCode }) => {
      // 获取微信小程序登录的code
      const data = await getWxCode()
      const res = await _wxLogin({ code: data.code, phoneCode })

      if (res.code === '200') {
        // 设置token
        uni.setStorageSync('token', (res.data as IUserInfoVo).token)
        // 获取用户信息
        await getUserInfo()
      }

      return res
    }
    // 刷新token并同步到缓存
    const refreshToken = (token: string) => {
      userInfo.value.token = token
      uni.setStorageSync('token', token)
    }

    return {
      // 状态
      userInfo,

      //  计算属性
      isLoggedIn,

      // 方法
      login,
      wxLogin,
      getUserInfo,
      setUserAvatar,
      logout,
      updateInfo,
      refreshToken,
    }
  },
  {
    persist: true,
  },
)
