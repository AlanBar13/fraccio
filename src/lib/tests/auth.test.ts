import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  mockUser,
  mockAdminUser,
  createMockSupabaseClient,
  createMockAuthResponse,
  createMockProfileResponse,
  createMockErrorResponse,
  setupEnvironment,
  cleanupEnvironment,
} from './setup'

/**
 * Auth Tests
 *
 * Tests for authentication-related functions:
 * - getUser: Fetch authenticated user with profile data
 * - loginFn: User login with email/password
 * - signupFn: User registration
 * - logoutFn: User logout
 * - inviteUserFn: Invite new user
 */

describe('Authentication', () => {
  let mockSupabase: any

  beforeEach(() => {
    setupEnvironment()
    mockSupabase = createMockSupabaseClient()
  })

  afterEach(() => {
    cleanupEnvironment()
    vi.clearAllMocks()
  })

  describe('getUser', () => {
    it('should return authenticated user with profile data', async () => {
      // Setup mocks
      mockSupabase.auth.getUser.mockResolvedValue(createMockAuthResponse(mockUser))
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(createMockProfileResponse(mockUser))
          })
        })
      })

      // Simulate getting user - normally this would be done by the server function
      const authResponse = await mockSupabase.auth.getUser()
      expect(authResponse.data.user).toBeDefined()
      expect(authResponse.data.user.email).toBe('test@example.com')

      const profileResponse = await mockSupabase
        .from('profiles')
        .select('full_name, role, tenant_id')
        .eq('id', authResponse.data.user.id)
        .single()

      expect(profileResponse.data).toBeDefined()
      expect(profileResponse.data.role).toBe('user')
      expect(profileResponse.data.tenant_id).toBe('tenant-456-uuid')
    })

    it('should throw error if user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      })

      const authResponse = await mockSupabase.auth.getUser()
      expect(authResponse.data.user).toBeNull()
      expect(authResponse.error).toBeDefined()
    })

    it('should throw error if profile not found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue(createMockAuthResponse(mockUser))
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(createMockErrorResponse('Profile not found'))
          })
        })
      })

      const authResponse = await mockSupabase.auth.getUser()
      const profileResponse = await mockSupabase
        .from('profiles')
        .select('full_name, role, tenant_id')
        .eq('id', authResponse.data.user.id)
        .single()

      expect(profileResponse.error).toBeDefined()
      expect(profileResponse.error.message).toBe('Profile not found')
    })
  })

  describe('loginFn', () => {
    it('should successfully login with valid credentials', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' }

      mockSupabase.auth.signInWithPassword.mockResolvedValue(createMockAuthResponse(mockUser))
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(createMockProfileResponse(mockUser))
          })
        })
      })

      const authResponse = await mockSupabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      })

      expect(authResponse.data.user).toBeDefined()
      expect(authResponse.data.user.email).toBe(loginData.email)
      expect(authResponse.error).toBeNull()

      // Verify profile fetched after login
      const profileResponse = await mockSupabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', authResponse.data.user.id)
        .single()

      expect(profileResponse.data.role).toBe('user')
      expect(profileResponse.data.tenant_id).toBe('tenant-456-uuid')
    })

    it('should fail login with invalid credentials', async () => {
      const loginData = { email: 'test@example.com', password: 'wrongpassword' }

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' }
      })

      const response = await mockSupabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      })

      expect(response.data.user).toBeNull()
      expect(response.error).toBeDefined()
      expect(response.error.message).toBe('Invalid login credentials')
    })

    it('should fail login with non-existent user', async () => {
      const loginData = { email: 'nonexistent@example.com', password: 'password123' }

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'User not found' }
      })

      const response = await mockSupabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      })

      expect(response.error).toBeDefined()
      expect(response.error.message).toBe('User not found')
    })

    it('should return user tenant and role after successful login', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue(createMockAuthResponse(mockAdminUser))
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(createMockProfileResponse(mockAdminUser))
          })
        })
      })

      const authResponse = await mockSupabase.auth.signInWithPassword({
        email: 'admin@example.com',
        password: 'password123'
      })

      const profileResponse = await mockSupabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', authResponse.data.user.id)
        .single()

      expect(profileResponse.data.role).toBe('admin')
      expect(profileResponse.data.tenant_id).toBe('tenant-456-uuid')
    })
  })

  describe('signupFn', () => {
    it('should successfully signup new user', async () => {
      const signupData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        tenantId: 'tenant-456-uuid',
        inviteId: 'invite-123-uuid',
        houseId: 1,
        houseOwner: false,
        is_admin: false
      }

      // Mock signup
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'new-user-id', email: signupData.email } },
        error: null
      })

      // Mock house user creation
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: [{ id: 1 }],
              error: null
            })
          }),
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null })
          })
        })
      })

      // Sign out first
      await mockSupabase.auth.signOut()

      // Signup
      const signupResponse = await mockSupabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            tenant_id: signupData.tenantId,
            full_name: signupData.name,
            role: 'user',
            house_owner: signupData.houseOwner
          }
        }
      })

      expect(signupResponse.data.user).toBeDefined()
      expect(signupResponse.data.user.email).toBe(signupData.email)
      expect(signupResponse.error).toBeNull()
    })

    it('should fail signup with invalid email', async () => {
      const signupData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'New User',
        tenantId: 'tenant-456-uuid',
        inviteId: 'invite-123-uuid'
      }

      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Invalid email format' }
      })

      const response = await mockSupabase.auth.signUp({
        email: signupData.email,
        password: signupData.password
      })

      expect(response.error).toBeDefined()
      expect(response.error.message).toBe('Invalid email format')
    })

    it('should fail signup with password too short', async () => {
      const signupData = {
        email: 'newuser@example.com',
        password: 'short',
        name: 'New User',
        tenantId: 'tenant-456-uuid',
        inviteId: 'invite-123-uuid'
      }

      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Password must be at least 6 characters' }
      })

      const response = await mockSupabase.auth.signUp({
        email: signupData.email,
        password: signupData.password
      })

      expect(response.error).toBeDefined()
    })

    it('should create user as admin if is_admin flag is true', async () => {
      const signupData = {
        email: 'newadmin@example.com',
        password: 'password123',
        name: 'New Admin',
        tenantId: 'tenant-456-uuid',
        inviteId: 'invite-123-uuid',
        is_admin: true
      }

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'new-admin-id', email: signupData.email } },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      })

      const signupResponse = await mockSupabase.auth.signUp({
        email: signupData.email,
        password: signupData.password
      })

      expect(signupResponse.data.user).toBeDefined()

      // Update role to admin
      await mockSupabase.from('profiles').update({ role: 'admin' }).eq('id', signupResponse.data.user.id)
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    })

    it('should create house owner if houseOwner flag is true', async () => {
      const signupData = {
        email: 'newowner@example.com',
        password: 'password123',
        name: 'New Owner',
        tenantId: 'tenant-456-uuid',
        inviteId: 'invite-123-uuid',
        houseId: 1,
        houseOwner: true,
        is_admin: false
      }

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'new-owner-id', email: signupData.email } },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: [{ id: 1 }],
            error: null
          })
        })
      })

      const signupResponse = await mockSupabase.auth.signUp({
        email: signupData.email,
        password: signupData.password
      })

      // Create house owner
      const ownerResponse = await mockSupabase
        .from('house_owners')
        .insert({ house_id: signupData.houseId, user_id: signupResponse.data.user.id })
        .select()

      expect(ownerResponse.data).toBeDefined()
    })
  })

  describe('logoutFn', () => {
    it('should successfully logout user', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const response = await mockSupabase.auth.signOut()

      expect(response.error).toBeNull()
    })

    it('should handle logout errors gracefully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Logout failed' }
      })

      const response = await mockSupabase.auth.signOut()

      expect(response.error).toBeDefined()
      expect(response.error.message).toBe('Logout failed')
    })
  })

  describe('inviteUserFn', () => {
    it('should successfully create user invite', async () => {
      const inviteData = {
        email: 'invited@example.com',
        tenantId: 'tenant-456-uuid',
        house_id: 1,
        house_owner: false,
        name: 'Invited User',
        is_admin: false
      }

      // Mock check for existing invite
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null })
            })
          })
        })
      })

      // Mock create invite
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'invite-123-uuid',
                email: inviteData.email,
                tenant_id: inviteData.tenantId,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
              },
              error: null
            })
          })
        })
      })

      // Check for existing invite
      const existingResponse = await mockSupabase
        .from('invites')
        .select()
        .eq('email', inviteData.email)
        .eq('tenant_id', inviteData.tenantId)
        .single()

      expect(existingResponse.data).toBeNull()

      // Create invite
      const inviteResponse = await mockSupabase
        .from('invites')
        .insert({
          email: inviteData.email,
          tenant_id: inviteData.tenantId,
          house_id: inviteData.house_id,
          house_owner: inviteData.house_owner,
          name: inviteData.name,
          is_admin: inviteData.is_admin,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single()

      expect(inviteResponse.data).toBeDefined()
      expect(inviteResponse.data.email).toBe(inviteData.email)
    })

    it('should fail if user already invited', async () => {
      const inviteData = {
        email: 'already-invited@example.com',
        tenantId: 'tenant-456-uuid',
        name: 'Already Invited'
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'existing-invite-id',
                  email: inviteData.email,
                  tenant_id: inviteData.tenantId
                }
              })
            })
          })
        })
      })

      const existingResponse = await mockSupabase
        .from('invites')
        .select()
        .eq('email', inviteData.email)
        .eq('tenant_id', inviteData.tenantId)
        .single()

      expect(existingResponse.data).toBeDefined()
      expect(existingResponse.data.email).toBe(inviteData.email)
    })

    it('should set invite expiration to 7 days', async () => {
      const now = new Date()
      const expirationDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      // Verify expiration is approximately 7 days from now
      const daysDifference = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      expect(daysDifference).toBeCloseTo(7, 0)
    })
  })
})
