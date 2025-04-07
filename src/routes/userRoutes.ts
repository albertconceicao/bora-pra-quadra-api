import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
    changePasswordValidation,
    loginValidation,
    registerValidation,
    updateProfileValidation,
} from '../middleware/validation/userValidation';

const router = Router();
const userController = new UserController();

// Public routes
router.post('/register', validate(registerValidation), userController.register.bind(userController));
router.post('/login', validate(loginValidation), userController.login.bind(userController));

// Protected routes
router.use(authenticate);
router.get('/profile', userController.getProfile.bind(userController));
router.put('/profile', validate(updateProfileValidation), userController.updateProfile.bind(userController));
router.put('/change-password', validate(changePasswordValidation), userController.changePassword.bind(userController));

export default router; 