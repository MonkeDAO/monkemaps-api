import express, { Router } from 'express';
import MonkeMapsController from '../controllers/MonkeMapsController';

const router = Router();
const monkeMapsController = new MonkeMapsController();

router.get('/todos', monkeMapsController.get);

export default router;