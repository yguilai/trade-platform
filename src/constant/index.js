import _ORDER from './modules/order'
import _QINIU from './modules/qiniu'
import _FILE from './modules/file'
import _GOODS from './modules/goods'

const SUCCESS = 2000,
  FAIL = 4000,
  LOGIN_FAIL = 4001,
  CAPTCHA_NOT_NULL = 4004,
  USER_EXIST = 2002,
  USER_NOT_EXIST = 2003

export default {
  SUCCESS,
  FAIL,
  LOGIN_FAIL,
  CAPTCHA_NOT_NULL,
  USER_EXIST,
  USER_NOT_EXIST,
  ORDER: {
    ..._ORDER,
  },
}

export const QINIU = {
  ..._QINIU,
}

export const FILE_CST = {
  ..._FILE,
}

export const GOODS_CST = {
  ..._GOODS,
}

export const ORDER_CST = {
  ..._ORDER,
}
