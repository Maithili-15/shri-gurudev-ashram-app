import donationApi from '../api/donationAxiosClient'

export const getDonationHeads = async () => {
  try {
    const { data } = await donationApi.get('/api/public/donation-heads')
    return data
  } catch {
    return { success: false, data: [] }
  }
}

export const createDonation = async (body: unknown) => {
  const { data } = await donationApi.post('/api/donations/create', body)
  return data
}

export const createDonationOrder = async (id: string) => {
  const { data } = await donationApi.post('/api/donations/create-order', { donationId: id })
  return data
}

export const verifyDonationPayment = async (body: { donationId?: string; razorpayOrderId?: string; razorpayPaymentId: string; razorpaySignature: string }) => {
  const { data } = await donationApi.post('/api/donations/verify-payment', body)
  return data
}

export const getDonationStatus = async (id: string) => {
  try {
    const { data } = await donationApi.get(`/api/donations/${id}/status`)
    return data
  } catch {
    return { data: null }
  }
}

export const getDonationHistory = async () => {
  try {
    const { data } = await donationApi.get('/api/donations/history')
    return data
  } catch {
    return { data: [] }
  }
}

export const getCollectorDashboard = async () => {
  try {
    const { data } = await donationApi.get('/api/collector/dashboard')
    return data
  } catch {
    return { data: {} }
  }
}

export const applyCollector = async (body: FormData) => {
  const { data } = await donationApi.post('/api/collector/apply', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const reapplyCollector = async (body: FormData) => {
  const { data } = await donationApi.post('/api/collector/reapply', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const getCollectorStatus = async () => {
  try {
    const { data } = await donationApi.get('/api/collector/status')
    return data
  } catch {
    return { data: null }
  }
}

export const getLeaderboard = async () => {
  try {
    const { data } = await donationApi.get('/api/collector/leaderboard')
    return data
  } catch {
    return { leaderboard: [] }
  }
}

export const getRecentDonations = async () => {
  try {
    const { data } = await donationApi.get('/api/public/donations/recent')
    return data
  } catch {
    return []
  }
}

export const getTopDonors = async () => {
  try {
    const { data } = await donationApi.get('/api/public/donations/top')
    return data
  } catch {
    return []
  }
}
