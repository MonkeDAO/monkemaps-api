import express, { Router } from 'express'
import HelloController from '../controllers/HelloController'

const router = Router()
const helloController = new HelloController()

router.get('/', helloController.hello)

export default router
