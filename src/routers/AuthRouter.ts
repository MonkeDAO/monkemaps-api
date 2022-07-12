import { Router } from 'express'
import AuthController from '../controllers/AuthController'

const router = Router()
const authController = new AuthController()

router.post('/txn', authController.initTxnSigned)
router.post('/sign', authController.signedMessage)


export default router
