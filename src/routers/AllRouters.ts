import { Router } from 'express';
import defaultRouter from './DefaultRouter';
import monkeRouter from './MonkeMapsRouter';


const routes = Router();

routes.use('/', defaultRouter);
routes.use('/monkemaps', monkeRouter);

export default routes;