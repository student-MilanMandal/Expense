import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_expense_tracker_2026_khata', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

export default generateToken;
