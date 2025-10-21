// lib/auth.ts
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { prisma, logError, logInfo, logWarn } from './database'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// export interface UserPayload {
//   userId: string
//   username: string
//   role?: string
//   iat?: number
//   exp?: number
// }

// สร้าง JWT Token
export const createToken = (payload) => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    logInfo('JWT token created', { userId: payload.userId, username: payload.username });
    return token;
  } catch (error) {
    logError('Error creating JWT token', error);
    throw new Error('Cannot create authentication token');
  }
};

// ตรวจสอบ JWT Token
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    logInfo('JWT token verified', { userId: decoded.userId, username: decoded.username })
    return decoded
  } catch (error) {
    logError('Error verifying JWT token', error)
    throw new Error('Invalid authentication token')
  }
}

// ดึง Token จาก Request Header
export const getTokenFromRequest = (request) => {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return null
    }
    
    // รองรับทั้ง "Bearer token" และ "token" เฉยๆ
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader
    
    return token || null
  } catch (error) {
    logError('Error extracting token from request', error)
    return null
  }
}

// ตรวจสอบสิทธิ์จาก Request
export const authenticateRequest = (request) => {
  try {
    const token = getTokenFromRequest(request)
    
    if (!token) {
      return null
    }
    
    return verifyToken(token)
  } catch (error) {
    logError('Authentication failed', error)
    return null
  }
}

// Middleware function สำหรับตรวจสอบสิทธิ์
export const requireAuth = (handler) => {
  return async (request) => {
    try {
      const user = authenticateRequest(request);

      if (!user) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Authentication required',
            message: 'กรุณาเข้าสู่ระบบก่อนใช้งาน',
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return await handler(request, user);
    } catch (error) {
      logError('Auth middleware error', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentication error',
          message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
};


// Hash password
export const hashPassword = async (password) => {
  try {
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    logInfo('Password hashed successfully')
    return hashedPassword
  } catch (error) {
    logError('Error hashing password', error)
    throw new Error('Cannot hash password')
  }
}

// Verify password
export const verifyPassword = async (password, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword)
    logInfo('Password verification completed', { isMatch })
    return isMatch
  } catch (error) {
    logError('Error verifying password', error)
    return false
  }
}

// User validation จากฐานข้อมูล
export const validateUser = async (username, password) => {
  try {
    logInfo('Validating user from database', { username })
    
    // ค้นหา user จากฐานข้อมูล
    const user = await prisma.user.findUnique({
      where: { username }
    })
    
    if (!user) {
      logWarn('User not found', { username })
      return null
    }
    
    if (!user.isActive) {
      logWarn('User is inactive', { username, userId: user.id })
      return null
    }
    
    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = await verifyPassword(password, user.password)
    
    if (!isPasswordValid) {
      logWarn('Invalid password', { username, userId: user.id })
      return null
    }
    
    // อัพเดท lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })
    
    logInfo('User validation successful', { userId: user.id, username: user.username })
    
    return {
      userId: user.id,
      username: user.username,
      role: user.role
    }
    
  } catch (error) {
    logError('Error validating user', error)
    return null
  }
}

// สร้าง User ใหม่
export const createUser = async (userData) => {
  try {
    logInfo('Creating new user', { username: userData.username, role: userData.role })
    
    // ตรวจสอบว่า username ซ้ำหรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { username: userData.username }
    })
    
    if (existingUser) {
      logWarn('Username already exists', { username: userData.username })
      return null
    }
    
    // ตรวจสอบว่า email ซ้ำหรือไม่ (ถ้ามี)
    if (userData.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: userData.email }
      })
      
      if (existingEmail) {
        logWarn('Email already exists', { email: userData.email })
        return null
      }
    }
    
    // Hash password
    const hashedPassword = await hashPassword(userData.password)
    
    // สร้าง user ใหม่
    const newUser = await prisma.user.create({
      data: {
        username: userData.username,
        password: hashedPassword,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'user'
      }
    })
    
    logInfo('User created successfully', { userId: newUser.id, username: newUser.username })
    
    return {
      userId: newUser.id,
      username: newUser.username,
      role: newUser.role
    }
    
  } catch (error) {
    logError('Error creating user', error)
    return null
  }
}

// ดึงข้อมูล User
export const getUserById = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    return user
  } catch (error) {
    logError('Error getting user by ID', error)
    return null
  }
}

// ดึงรายการ Users ทั้งหมด (สำหรับ admin)
export const getAllUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return users
  } catch (error) {
    logError('Error getting all users', error)
    return []
  }
}

// อัพเดท User
export const updateUser = async (userId, updateData) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        updatedAt: true
      }
    })
    
    logInfo('User updated successfully', { userId, updateData })
    return updatedUser
  } catch (error) {
    logError('Error updating user', error)
    return null
  }
}

// เปลี่ยนรหัสผ่าน
export const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    // ดึงข้อมูล user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      logWarn('User not found for password change', { userId })
      return false
    }
    
    // ตรวจสอบรหัสผ่านเดิม
    const isOldPasswordValid = await verifyPassword(oldPassword, user.password)
    
    if (!isOldPasswordValid) {
      logWarn('Invalid old password', { userId })
      return false
    }
    
    // Hash รหัสผ่านใหม่
    const hashedNewPassword = await hashPassword(newPassword)
    
    // อัพเดทรหัสผ่าน
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    })
    
    logInfo('Password changed successfully', { userId })
    return true
    
  } catch (error) {
    logError('Error changing password', error)
    return false
  }
}

// Function สำหรับสร้าง Response แบบ Unauthorized
export const createUnauthorizedResponse = (message = 'ไม่มีสิทธิ์เข้าถึง') => {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Unauthorized',
      message
    }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

// Function สำหรับสร้าง Response แบบ Forbidden
export const createForbiddenResponse = (message = 'ไม่อนุญาตให้เข้าถึง') => {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Forbidden',
      message
    }),
    {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}