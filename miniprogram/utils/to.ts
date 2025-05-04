/*
 * 将Promisr的结果和错误，转化为一个数组返回。
 * @params {Promise}
 * @return {array} [err, res]
 */
const to = (promise: Promise<any>) => promise
  .then((res) => [null, res])
  .catch((err) => [err, null]);

export default to;
