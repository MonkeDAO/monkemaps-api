import express, { Router } from 'express';
import MonkeMapsController from '../controllers/MonkeMapsController';

const router = Router();
const monkeMapsController = new MonkeMapsController();

router.get('/events', monkeMapsController.get);
router.post('/users', monkeMapsController.createmonke);
router.get('/users/:id', monkeMapsController.getUser);
router.put('/users/:id', monkeMapsController.updatemonke);
router.delete('/users/:id', monkeMapsController.deleteMonke);



export default router;