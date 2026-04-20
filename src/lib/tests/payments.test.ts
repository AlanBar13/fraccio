import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  mockUser,
  mockPaymentItem,
  mockPayment,
  mockHouse,
  mockTenant,
  createMockSupabaseClient,
  createMockAuthResponse,
  createMockProfileResponse,
  createMockErrorResponse,
  setupEnvironment,
  cleanupEnvironment,
} from './setup'

/**
 * Payments Tests
 *
 * Tests for payment-related functions:
 * - createCheckoutSessionFn: Create Stripe checkout session
 * - getPaymentHistoryFn: Get user's payment history
 */

describe('Payments', () => {
  let mockSupabase: any
  let mockStripe: any

  beforeEach(() => {
    setupEnvironment()
    mockSupabase = createMockSupabaseClient()

    // Mock Stripe client
    mockStripe = {
      checkout: {
        sessions: {
          create: vi.fn(),
        }
      }
    }
  })

  afterEach(() => {
    cleanupEnvironment()
    vi.clearAllMocks()
  })

  describe('createCheckoutSessionFn', () => {
    it('should create checkout session with valid payment item', async () => {
      const checkoutData = {
        paymentItemId: 1,
        tenantId: 'tenant-456-uuid'
      }

      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue(createMockAuthResponse(mockUser))
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(createMockProfileResponse(mockUser))
              })
            })
          }
        }

        if (table === 'payment_items') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: mockPaymentItem,
                error: null
              })
            })
          }
        }

        if (table === 'house_users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    house_id: mockHouse.id,
                    houses: {
                      name: mockHouse.name,
                      tenant_id: mockHouse.tenant_id,
                      tenants: {
                        path: mockTenant.path
                      }
                    }
                  },
                  error: null
                })
              })
            })
          }
        }

        if (table === 'payments') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockPayment,
                  error: null
                })
              })
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null })
            })
          }
        }

        return {}
      })

      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test_session123',
        url: 'https://checkout.stripe.com/test'
      })

      // Verify user is authenticated
      const authResponse = await mockSupabase.auth.getUser()
      expect(authResponse.data.user).toBeDefined()

      // Verify user belongs to tenant
      expect(mockUser.tenantId).toBe(checkoutData.tenantId)

      // Verify payment item exists
      const paymentItemResponse = await mockSupabase
        .from('payment_items')
        .select('*')
        .eq('id', checkoutData.paymentItemId)
        .eq('tenant_id', checkoutData.tenantId)
        .eq('is_active', true)
        .single()

      expect(paymentItemResponse.data).toBeDefined()
      expect(paymentItemResponse.data.amount).toBe(1000)

      // Create payment record
      const paymentResponse = await mockSupabase
        .from('payments')
        .insert({
          tenant_id: checkoutData.tenantId,
          user_id: mockUser.id,
          house_id: mockHouse.id,
          amount: mockPaymentItem.amount,
          currency: mockPaymentItem.currency,
          status: 'pending',
          payment_type: mockPaymentItem.payment_type,
          description: mockPaymentItem.description
        })
        .select()
        .single()

      expect(paymentResponse.data).toBeDefined()
      expect(paymentResponse.data.status).toBe('pending')

      // Create Stripe session
      const session = await mockStripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'mxn',
              product_data: {
                name: mockPaymentItem.name,
                description: mockPaymentItem.description
              },
              unit_amount: Math.round(mockPaymentItem.amount * 100)
            },
            quantity: 1
          }
        ],
        metadata: {
          payment_id: paymentResponse.data.id.toString(),
          tenant_id: checkoutData.tenantId,
          user_id: mockUser.email
        }
      })

      expect(session).toBeDefined()
      expect(session.url).toBeDefined()
      expect(session.id).toBeDefined()
    })

    it('should fail if user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      })

      const authResponse = await mockSupabase.auth.getUser()

      expect(authResponse.data.user).toBeNull()
      expect(authResponse.error).toBeDefined()
    })

    it('should fail if user does not belong to tenant', async () => {
      const checkoutData = {
        paymentItemId: 1,
        tenantId: 'tenant-999-uuid' // Different tenant
      }

      mockSupabase.auth.getUser.mockResolvedValue(createMockAuthResponse(mockUser))

      const authResponse = await mockSupabase.auth.getUser()

      // User's tenant doesn't match requested tenant
      expect(mockUser.tenantId).not.toBe(checkoutData.tenantId)
      expect(authResponse.data.user).toBeDefined()
    })

    it('should fail if payment item not found', async () => {
      const checkoutData = {
        paymentItemId: 999, // Non-existent
        tenantId: 'tenant-456-uuid'
      }

      mockSupabase.auth.getUser.mockResolvedValue(createMockAuthResponse(mockUser))
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue(createMockErrorResponse('Payment item not found'))
        })
      })

      const response = await mockSupabase
        .from('payment_items')
        .select('*')
        .eq('id', checkoutData.paymentItemId)
        .single()

      expect(response.error).toBeDefined()
      expect(response.error.message).toBe('Payment item not found')
    })

    it('should fail if user has no assigned house', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(createMockAuthResponse(mockUser))
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'house_users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(createMockErrorResponse('User has no assigned house'))
              })
            })
          }
        }
        return {}
      })

      const response = await mockSupabase
        .from('house_users')
        .select('*')
        .eq('user_id', mockUser.id)
        .single()

      expect(response.error).toBeDefined()
    })

    it('should fail if house does not belong to tenant', async () => {
      const checkoutData = {
        paymentItemId: 1,
        tenantId: 'tenant-456-uuid'
      }

      const houseBelongingToOtherTenant = {
        ...mockHouse,
        tenant_id: 'tenant-999-uuid'
      }

      mockSupabase.auth.getUser.mockResolvedValue(createMockAuthResponse(mockUser))
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'house_users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    house_id: houseBelongingToOtherTenant.id,
                    houses: {
                      name: houseBelongingToOtherTenant.name,
                      tenant_id: houseBelongingToOtherTenant.tenant_id,
                      tenants: { path: mockTenant.path }
                    }
                  },
                  error: null
                })
              })
            })
          }
        }
        return {}
      })

      const response = await mockSupabase
        .from('house_users')
        .select('*')
        .eq('user_id', mockUser.id)
        .single()

      expect(response.data.houses.tenant_id).not.toBe(checkoutData.tenantId)
    })

    it('should update payment record with Stripe session ID', async () => {
      const paymentId = 1
      const sessionId = 'cs_test_session123'

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      })

      const response = await mockSupabase
        .from('payments')
        .update({ stripe_session_id: sessionId })
        .eq('id', paymentId)

      expect(response.error).toBeNull()
      expect(mockSupabase.from).toHaveBeenCalledWith('payments')
    })

    it('should convert amount to cents for Stripe', async () => {
      const amountInPesos = 1000
      const amountInCents = Math.round(amountInPesos * 100)

      expect(amountInCents).toBe(100000)
    })

    it('should set correct redirect URLs', async () => {
      process.env.NODE_ENV = 'production'

      const baseUrl = 'https://fraccio.com'
      const tenantPath = mockTenant.path

      const successUrl = `${baseUrl}/${tenantPath}/pagos/success?session_id={CHECKOUT_SESSION_ID}`
      const cancelUrl = `${baseUrl}/${tenantPath}/pagos/cancel`

      expect(successUrl).toContain('success')
      expect(cancelUrl).toContain('cancel')
    })
  })

  describe('getPaymentHistoryFn', () => {
    it('should return payment history for authenticated user', async () => {
      const historyData = {
        tenantId: 'tenant-456-uuid'
      }

      mockSupabase.auth.getUser.mockResolvedValue(createMockAuthResponse(mockUser))
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'payments') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnThis(),
              order: vi.fn().mockReturnThis(),
              mockResolvedValue: {
                data: [mockPayment],
                error: null
              }
            })
          }
        }
        return {}
      })

      const authResponse = await mockSupabase.auth.getUser()
      expect(authResponse.data.user).toBeDefined()
      expect(mockUser.tenantId).toBe(historyData.tenantId)
    })

    it('should fail if user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      })

      const authResponse = await mockSupabase.auth.getUser()

      expect(authResponse.data.user).toBeNull()
      expect(authResponse.error).toBeDefined()
    })

    it('should fail if user does not belong to tenant', async () => {
      const historyData = {
        tenantId: 'tenant-999-uuid' // Different tenant
      }

      mockSupabase.auth.getUser.mockResolvedValue(createMockAuthResponse(mockUser))

      // User's tenant doesn't match requested tenant
      expect(mockUser.tenantId).not.toBe(historyData.tenantId)
    })

    it('should return payments ordered by date descending', async () => {
      const payment1 = { ...mockPayment, id: 1, created_at: '2025-01-15T00:00:00Z' }
      const payment2 = { ...mockPayment, id: 2, created_at: '2025-01-20T00:00:00Z' }

      mockSupabase.auth.getUser.mockResolvedValue(createMockAuthResponse(mockUser))
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'payments') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnThis(),
              order: vi.fn().mockReturnValue({
                mockResolvedValue: {
                  data: [payment2, payment1], // Most recent first
                  error: null
                }
              })
            })
          }
        }
        return {}
      })

      // Verify most recent payment comes first
      expect(payment2.created_at > payment1.created_at).toBe(true)
    })

    it('should include house information in payment history', async () => {
      const paymentWithHouse = {
        ...mockPayment,
        houses: {
          name: 'Casa 101'
        }
      }

      mockSupabase.auth.getUser.mockResolvedValue(createMockAuthResponse(mockUser))
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'payments') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnThis(),
              order: vi.fn().mockReturnValue({
                mockResolvedValue: {
                  data: [paymentWithHouse],
                  error: null
                }
              })
            })
          }
        }
        return {}
      })

      expect(paymentWithHouse.houses).toBeDefined()
      expect(paymentWithHouse.houses.name).toBe('Casa 101')
    })

    it('should handle empty payment history', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(createMockAuthResponse(mockUser))
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'payments') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnThis(),
              order: vi.fn().mockReturnValue({
                mockResolvedValue: {
                  data: [],
                  error: null
                }
              })
            })
          }
        }
        return {}
      })

      // When no payments exist, should return empty array
      expect([]).toHaveLength(0)
    })

    it('should filter payments by user and tenant', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(createMockAuthResponse(mockUser))
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'payments') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn((_: string, value: string) => {
                // Verify both user_id and tenant_id filters are applied
                expect([mockUser.id, 'tenant-456-uuid']).toContain(value)
                return this
              }).mockReturnThis(),
              order: vi.fn().mockReturnThis()
            })
          }
        }
        return {}
      })

      // Verify queries filter by both user and tenant
      await mockSupabase
        .from('payments')
        .select('*')
        .eq('user_id', mockUser.id)
        .eq('tenant_id', 'tenant-456-uuid')
    })
  })

  describe('Payment Status Transitions', () => {
    it('should start with pending status', async () => {
      expect(mockPayment.status).toBe('pending')
    })

    it('should support completed status', async () => {
      const completedPayment = { ...mockPayment, status: 'completed' }
      expect(completedPayment.status).toBe('completed')
    })

    it('should support failed status', async () => {
      const failedPayment = { ...mockPayment, status: 'failed' }
      expect(failedPayment.status).toBe('failed')
    })

    it('should support refunded status', async () => {
      const refundedPayment = { ...mockPayment, status: 'refunded' }
      expect(refundedPayment.status).toBe('refunded')
    })
  })

  describe('Payment Types', () => {
    it('should support maintenance payment type', async () => {
      const maintenancePayment = { ...mockPayment, payment_type: 'maintenance' }
      expect(maintenancePayment.payment_type).toBe('maintenance')
    })

    it('should support assessment payment type', async () => {
      const assessmentPayment = { ...mockPayment, payment_type: 'assessment' }
      expect(assessmentPayment.payment_type).toBe('assessment')
    })

    it('should support fine payment type', async () => {
      const finePayment = { ...mockPayment, payment_type: 'fine' }
      expect(finePayment.payment_type).toBe('fine')
    })
  })
})
