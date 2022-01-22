class QueryUtil {
  static querystring(object: any) {
    return Object.keys(object).map(key => `${key}=${object[key]}`).join('&');
  }
}

export default QueryUtil;