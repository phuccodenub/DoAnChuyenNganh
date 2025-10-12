// Dùng cho các API quản lý chung của admin hoặc hệ thống
import { 
  getUserById, 
  getUserByEmail, 
  addUser, 
  updateUserInfo, 
  removeUser,
  getAllUsers,
  getUsersByRole,
  getUserStatistics,
  changeUserStatus
} from '../services/user.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/response.util';
import { RESPONSE_CONSTANTS } from '../constants/response.constants';
import logger from '../utils/logger.util';

// Get user info by ID
export const getUserInfo = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, user);
  } catch (err) {
    logger.error('Error getting user info:', err);
    next(err);
  }
};

// Get user info by email
export const getUserByEmailInfo = async (req, res, next) => {
  try {
    const user = await getUserByEmail(req.query.email);
    sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, user);
  } catch (err) {
    logger.error('Error getting user by email:', err);
    next(err);
  }
};

// Create new user
export const createUser = async (req, res, next) => {
  try {
    const user = await addUser(req.body);
    sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.CREATED, user, RESPONSE_CONSTANTS.STATUS_CODE.CREATED);
  } catch (err) {
    logger.error('Error creating user:', err);
    next(err);
  }
};

// Update user
export const updateUser = async (req, res, next) => {
  try {
    const user = await updateUserInfo(req.params.id, req.body);
    sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.UPDATED, user);
  } catch (err) {
    logger.error('Error updating user:', err);
    next(err);
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  try {
    await removeUser(req.params.id);
    sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.DELETED, null, RESPONSE_CONSTANTS.STATUS_CODE.NO_CONTENT);
  } catch (err) {
    logger.error('Error deleting user:', err);
    next(err);
  }
};

// Get all users with pagination
export const getAllUsersInfo = async (req, res, next) => {
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
    
    const result = await getAllUsers(options);
    sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, result.users, RESPONSE_CONSTANTS.STATUS_CODE.OK, result.pagination);
  } catch (err) {
    logger.error('Error getting all users:', err);
    next(err);
  }
};

// Get users by role
export const getUsersByRoleInfo = async (req, res, next) => {
  try {
    const users = await getUsersByRole(req.params.role);
    sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, users);
  } catch (err) {
    logger.error('Error getting users by role:', err);
    next(err);
  }
};

// Get user statistics
export const getUserStats = async (req, res, next) => {
  try {
    const stats = await getUserStatistics();
    sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, stats);
  } catch (err) {
    logger.error('Error getting user stats:', err);
    next(err);
  }
};

// Change user status
export const changeUserStatusInfo = async (req, res, next) => {
  try {
    const user = await changeUserStatus(req.params.id, req.body.status);
    sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.UPDATED, user);
  } catch (err) {
    logger.error('Error changing user status:', err);
    next(err);
  }
};
