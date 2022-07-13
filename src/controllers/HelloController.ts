import express, { Request, Response } from 'express';

export default class HelloController {
  public hello(req: Request, res: Response) {
    res.send('Running...');
  }
}
