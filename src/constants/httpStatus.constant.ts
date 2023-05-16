export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  SUCCESS: 200,
  INTERNAL_SERVER_ERROR: 500,
  CONFLICT: 409,
  NOT_FOUND: 404,
};

export const HTTP_STATUS_DESC = {
  BAD_REQUEST: 'Bad Request',
  UNAUTHORIZED: 'Unauthorized',
  SUCCESS: 'Success',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  CONFLICT: 'Conflict',
  NOT_FOUND: 'Not Found',
};

export const HTTP_STATUS_ERROR_MSG = {
  BAD_REQUEST: 'Invalid Request Body',
  LOGIN_UNAUTHORIZED: 'Invalid username or password',
  UNAUTHORIZED: 'Missing Access Token',
  INVALID_ACCESS_TOKEN: 'Access Token is invalid',
  EXPIRED_ACCESS_TOKEN: 'Access Token is expired',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  EXIST_USERNAME: 'Username already exists',
  USERNAME_NOT_FOUND: 'Username does not exist',
};
