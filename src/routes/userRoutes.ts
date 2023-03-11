import express from 'express';

import * as userController from '../controllers/userController';
import * as authController from '../controllers/authController';

const router = express.Router();

//Signup does not necessarily follow REST architecture
router.post('/signup', authController.signup);
router.get('/verifyEmail/:token', authController.verifyEmail);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//Protecting all the routers after this point because middleware run in sequence
//Using .use to use the middleware
router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);

//We are using authController.protect because we are passing user in that controller
router.patch('/updateMyPassword', authController.updatePassword);

router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

//Allowing only users to access below routes in addition to protection
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
