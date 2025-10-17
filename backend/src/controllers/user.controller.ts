// Dùng cho các API quản lý chung của admin hoặc hệ thống
import { Request, Response, NextFunction } from 'express';
import { UserModuleService } from '../modules/user/user.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/response.util';
import { RESPONSE_CONSTANTS } from '../constants/response.constants';
import logger from '../utils/logger.util';

const userModuleService = new UserModuleService();

// Get user info by ID
export const getUserInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userModuleService.getUserById(req.params.id);
    sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, user);
  } catch (err) {
    logger.error('Error getting user info:', err);
    next(err);
  }
};

// Get user info by email
export const getUserByEmailInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userModuleService.getUserById(req.query.email as string);
    sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, user);
  } catch (err) {
    logger.error('Error getting user by email:', err);
    next(err);
  }
};

// Create new user
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await (userModuleService as any).createUser(req.body);
    sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.CREATED, user, RESPONSE_CONSTANTS.STATUS_CODE.CREATED);
  } catch (err) {
    logger.error('Error creating user:', err);
    next(err);
  }
};

// Update user
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await (userModuleService as any).updateUser(req.params.id, req.body);
    sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.UPDATED, user);
  } catch (err) {
    logger.error('Error updating user:', err);
    next(err);
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await (userModuleService as any).deleteUser(req.params.id);
    sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.DELETED, null, RESPONSE_CONSTANTS.STATUS_CODE.NO_CONTENT);
  } catch (err) {
    logger.error('Error deleting user:', err);
    next(err);
  }
};

// Get all users with pagination
export const getAllUsersInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      role: req.query.role,
      status: req.query.status,
      search: req.query.search,
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'DESC'
    };
    
    const result = await userModuleService.getAllUsers(options);
    sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, result.users, RESPONSE_CONSTANTS.STATUS_CODE.OK, result.pagination);
  } catch (err) {
    logger.error('Error getting all users:', err);
    next(err);
  }
};

// Get users by role
export const getUsersByRoleInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await (userModuleService as any).getUsersByRole(req.params.role);
    sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, users);
  } catch (err) {
    logger.error('Error getting users by role:', err);
    next(err);
  }
};

// Get user statistics
export const getUserStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await userModuleService.getUserStats(req.params.id);
    sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, stats);
  } catch (err) {
    logger.error('Error getting user stats:', err);
    next(err);
  }
};

// Change user status
export const changeUserStatusInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await (userModuleService as any).changeUserStatus(req.params.id, req.body.status);
    sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.UPDATED, user);
  } catch (err) {
    logger.error('Error changing user status:', err);
    next(err);
  }
};
