import { defineStore } from 'pinia'

export const useToggleStore = defineStore('toggle', {
  state: () => ({
    privacyModal: {
      show: false,
      resolvePrivacyAuthorization: (...args: any[]) => {},
    },
  }),
  actions: {
    togglePrivacyModal(value: boolean) {
      this.privacyModal.show = value
    },
  },
})
