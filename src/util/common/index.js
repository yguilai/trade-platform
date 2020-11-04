export default {
  isReqSuccess(res) {
    return !!(res && res.status === 200 && res.data);
  }
}
