import { httpGet, httpPost } from '@/utils/http'

export interface MemberPackage {
  id: number
  name: string
  durationDays: number
  originalPrice: number | string
  discountPrice: number | string
  applicableUser: string
  status: string
  sortOrder: number
  description?: string
  code?: string
  recommended?: number | boolean
}

export interface MemberBenefit {
  id: number
  benefitName: string
  displayName: string
  memberType: 'BLUETOOTH' | '4G' | 'ALL' | string
  inactiveIcon: string
  activeIcon: string
  status: string
  sortOrder: number
  description: string
  code: string
}

export interface CreateMemberPurchaseParams {
  packageId: number
  vehicleId?: number
}

export interface WechatJsApiPayParams {
  orderNo: string
  appId: string
  timeStamp: string
  nonceStr: string
  packageValue: string
  signType: string
  paySign: string
}

export interface MemberOrderStatus {
  orderNo: string
  paymentStatus: 'UNPAID' | 'PAID' | 'CLOSED' | 'REFUNDED' | string
  paymentAmount: number | string
  packageName: string
}

export function getMemberPackages(query?: { deviceType?: string }) {
  return httpGet<MemberPackage[]>('/user/mini/member/packages', query)
}

export function getMemberBenefits(query?: { deviceType?: string }) {
  return httpGet<MemberBenefit[]>('/user/mini/member/benefits', query)
}

export function createMemberPurchase(data: CreateMemberPurchaseParams) {
  return httpPost<WechatJsApiPayParams>('/user/mini/member/purchase', data)
}

export function getMemberOrderStatus(orderNo: string) {
  return httpGet<MemberOrderStatus>('/user/mini/member/order/status', { orderNo }, undefined, { hideErrorToast: true })
}
