import createError from 'http-errors';
import session from 'express-session';
import express, { RequestHandler, ErrorRequestHandler } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { connectToDatabase } from './services/database.service';

import indexRouter from './routes/index';
import usersRouter from './routes/users';
import signupRouter from './routes/auth/signup';
import loginRouter from './routes/auth/login';
import logoutRouter from './routes/auth/logout';
import filesRouter from './routes/files/uploadFile';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.connectDatabase();
    this.config();
  }

  private config() {
    // view engine setup
    this.app.set('views', path.join(__dirname, 'views'));
    this.app.set('view engine', 'ejs');

    this.app.use(logger('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());
    this.app.use(express.static(path.join(__dirname, 'public')));
    this.app.use(
      session({
        secret: 'accessToken',
        resave: false,
        saveUninitialized: true,
      })
    );
  }

  private routerSetup() {
    this.app.use('/', indexRouter);
    this.app.use('/users', usersRouter);
    this.app.use('/auth/signup', signupRouter);
    this.app.use('/auth/login', loginRouter);
    this.app.use('/auth/logout', logoutRouter);
    this.app.use('/file-upload', filesRouter);
  }

  private errorHandler() {
    // catch 404 and forward to error handler
    const requestHandler: RequestHandler = function (_req, _res, next) {
      next(createError(404));
    };
    this.app.use(requestHandler);

    // error handler
    const errorRequestHandler: ErrorRequestHandler = function (err, req, res) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render('error');
    };
    this.app.use(errorRequestHandler);
  }

  private async connectDatabase() {
    try {
      connectToDatabase().then(() => {
        this.routerSetup();
        this.errorHandler();
        console.log('Connected to the database');
      });
    } catch (error) {
      console.error('Failed to connect to the database:', error);
    }
  }
}

export default new App().app;
