import { Router } from 'express';
import MonkeMapsController from '../controllers/MonkeMapsController';
import AuthController from '../controllers/AuthController';
import { check } from "express-validator";
import auth from '../middleware/auth';

const router = Router();
const monkeMapsController = new MonkeMapsController();

router.get('/', monkeMapsController.get);
router.get('/events', monkeMapsController.get);
router.get('/users', monkeMapsController.getAllMonkes);
router.post('/users', auth, monkeMapsController.createmonke);
router.get('/users/:id', monkeMapsController.getUser);
router.put('/users/:id', auth, monkeMapsController.updatemonke);
router.delete('/users/:id', auth, monkeMapsController.deleteMonke);



export default router;