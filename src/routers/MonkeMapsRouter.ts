import { Router } from 'express';
import MonkeMapsController from '../controllers/MonkeMapsController';
import AuthController from '../controllers/AuthController';
import { check } from 'express-validator';
import auth from '../middleware/auth';

const router = Router();
const monkeMapsController = new MonkeMapsController();
const authController = new AuthController();

router.get('/', auth, monkeMapsController.get);
router.get('/events', auth, monkeMapsController.get);
router.get('/users', auth, monkeMapsController.getAllMonkes);
router.post('/users', auth, monkeMapsController.createmonke);
router.get('/users/:id', auth, monkeMapsController.getUser);
router.put('/users/:id', auth, monkeMapsController.updatemonke);
router.delete('/users/:id', auth, monkeMapsController.deleteMonke);
router.post('/auth/txn', authController.initTxnSigned);
router.post('/auth/sign', authController.signedMessage);

export default router;
