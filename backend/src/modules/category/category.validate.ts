const { body, param, query } = require('express-validator');

export const categoryValidation = {
  create: [
    body('name').notEmpty().isLength({ min: 2, max: 100 }).trim(),
    body('slug').notEmpty().isLength({ min: 2, max: 100 }).trim(),
    body('description').optional().isLength({ max: 5000 }).trim(),
    body('parent_id').optional().isUUID(),
    body('icon').optional().isLength({ max: 100 }).trim(),
    body('color').optional().isLength({ max: 20 }).trim(),
    body('order_index').optional().isInt({ min: 0 }).toInt(),
    body('is_active').optional().isBoolean().toBoolean(),
  ],

  update: [
    param('id').notEmpty().isUUID(),
    body('name').optional().isLength({ min: 2, max: 100 }).trim(),
    body('slug').optional().isLength({ min: 2, max: 100 }).trim(),
    body('description').optional().isLength({ max: 5000 }).trim(),
    body('parent_id').optional().isUUID(),
    body('icon').optional().isLength({ max: 100 }).trim(),
    body('color').optional().isLength({ max: 20 }).trim(),
    body('order_index').optional().isInt({ min: 0 }).toInt(),
    body('is_active').optional().isBoolean().toBoolean(),
  ],

  idParam: [param('id').notEmpty().isUUID()],

  list: [
    query('include_subcategories').optional().isBoolean().toBoolean(),
    query('only_active').optional().isBoolean().toBoolean(),
  ],
};












