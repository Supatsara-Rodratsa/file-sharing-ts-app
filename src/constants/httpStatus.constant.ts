export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  SUCCESS: 200,
  INTERNAL_SERVER_ERROR: 500,
};

export const HTTP_STATUS_DESC = {
  BAD_REQUEST: 'Bad Request',
  UNAUTHORIZED: 'Unauthorized',
  SUCCESS: 'Success',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
};

export const HTTP_STATUS_ERROR_MSG = {
  BAD_REQUEST: 'Invalid Request Body',
  LOGIN_UNAUTHORIZED: 'Invalid username or password',
  UNAUTHORIZED: 'Missing Access Token',
  INVALID_ACCESS_TOKEN: 'Access Token is invalid',
  EXPIRED_ACCESS_TOKEN: 'Access Token is expired',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
};
