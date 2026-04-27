import type { MemberOrderStatus, WechatJsApiPayParams } from '@/api/member'

export interface PaymentRequestParams extends WechatJsApiPayParams {
  package?: string
}

export interface PollPaymentStatusOptions {
  interval?: number
  maxTimes?: number
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function requestWechatPayment(params: PaymentRequestParams) {
  return new Promise<any>((resolve, reject) => {
    const paymentOptions = {
      provider: 'wxpay',
      timeStamp: params.timeStamp,
      nonceStr: params.nonceStr,
      package: params.package || params.packageValue,
      signType: params.signType,
      paySign: params.paySign,
      success: resolve,
      fail: reject,
    }

    uni.requestPayment(paymentOptions as any)
  })
}

export async function pollPaymentStatus(
  queryStatus: () => Promise<IResData<MemberOrderStatus>>,
  options: PollPaymentStatusOptions = {},
) {
  const interval = options.interval ?? 2000
  const maxTimes = options.maxTimes ?? 15

  for (let index = 0; index < maxTimes; index += 1) {
    const res = await queryStatus()
    const status = res.data?.paymentStatus

    if (status === 'PAID') {
      return res.data
    }

    if (status === 'CLOSED' || status === 'REFUNDED') {
      throw new Error(status)
    }

    if (index < maxTimes - 1) {
      await sleep(interval)
    }
  }

  throw new Error('PAYMENT_STATUS_TIMEOUT')
}
