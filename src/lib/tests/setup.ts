import { vi } from 'vitest'
import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Mock User object for testing
 */
export const mockUser = {
  id: 'user-123-uuid',
  email: 'test@example.com',
  role: 'user',
  tenantId: 'tenant-456-uuid',
  full_name: 'Test User'
}

export const mockAdminUser = {
  id: 'admin-123-uuid',
  email: 'admin@example.com',
  role: 'admin',
  tenantId: 'tenant-456-uuid',
  full_name: 'Admin User'
}

export const mockSuperAdminUser = {
  id: 'superadmin-123-uuid',
  email: 'superadmin@example.com',
  role: 'superadmin',
  tenantId: null,
  full_name: 'Super Admin User'
}

export const mockOwnerUser = {
  id: 'owner-123-uuid',
  email: 'owner@example.com',
  role: 'owner',
  tenantId: 'tenant-456-uuid',
  full_name: 'Owner User'
}

/**
 * Mock tenant object for testing
 */
export const mockTenant = {
  id: 'tenant-456-uuid',
  name: 'Test Fraccionamiento',
  path: 'test-fracc',
  created_at: '2025-01-01T00:00:00Z'
}

export const mockTenant2 = {
  id: 'tenant-789-uuid',
  name: 'Another Fraccionamiento',
  path: 'another-fracc',
  created_at: '2025-01-01T00:00:00Z'
}

/**
 * Mock house object for testing
 */
export const mockHouse = {
  id: 1,
  tenant_id: 'tenant-456-uuid',
  name: 'Casa 101',
  number: '101',
  created_at: '2025-01-01T00:00:00Z'
}

/**
 * Mock payment item for testing
 */
export const mockPaymentItem = {
  id: 1,
  tenant_id: 'tenant-456-uuid',
  name: 'Cuota de Mantenimiento',
  description: 'Cuota mensual de mantenimiento',
  amount: 1000,
  currency: 'mxn',
  payment_type: 'maintenance',
  is_active: true,
  created_at: '2025-01-01T00:00:00Z'
}

/**
 * Mock payment for testing
 */
export const mockPayment = {
  id: 1,
  tenant_id: 'tenant-456-uuid',
  user_id: 'user-123-uuid',
  house_id: 1,
  amount: 1000,
  currency: 'mxn',
  status: 'pending',
  payment_type: 'maintenance',
  description: 'Cuota de Mantenimiento',
  stripe_session_id: null,
  stripe_payment_intent_id: null,
  receipt_url: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z'
}

/**
 * Create a mock Supabase client
 */
export function createMockSupabaseClient(): Partial<SupabaseClient> {
  return {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as any,
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    })) as any,
  }
}

/**
 * Helper to create a mock auth response
 */
export function createMockAuthResponse(user = mockUser) {
  return {
    data: {
      user: {
        id: user.id,
        email: user.email,
      }
    },
    error: null
  }
}

/**
 * Helper to create a mock profile response
 */
export function createMockProfileResponse(user = mockUser) {
  return {
    data: {
      full_name: user.full_name,
      role: user.role,
      tenant_id: user.tenantId,
    },
    error: null
  }
}

/**
 * Helper to create a mock error response
 */
export function createMockErrorResponse(message: string) {
  return {
    data: null,
    error: {
      message,
      status: 400,
    }
  }
}

/**
 * Helper to setup default mock implementations
 */
export function setupDefaultMocks(supabase: any, user = mockUser) {
  supabase.auth.getUser.mockResolvedValue(createMockAuthResponse(user))
  supabase.from.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(createMockProfileResponse(user))
      })
    })
  })
}

/**
 * Mock environment variables
 */
export function setupEnvironment() {
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock_stripe_key'
  process.env.NODE_ENV = 'test'
}

/**
 * Cleanup environment
 */
export function cleanupEnvironment() {
  delete process.env.STRIPE_SECRET_KEY
}
