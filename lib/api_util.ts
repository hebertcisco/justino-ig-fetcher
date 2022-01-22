import https from 'https';
import QueryUtil from "./query_util";
const insta = 'https://www.instagram.com/';

class ApiUtil {
  static get(
    path: string,
    sessionId: string,
    tryParse: boolean = true,
    params?: any
  ): any {
    return new Promise((resolve, reject) => {
      params = JSON.stringify({ __a: sessionId ? '1' : undefined, ...params });
      const url = insta + path + ((params !== '{}')
        ? ('/?' + QueryUtil.querystring(JSON.parse(params)))
        : (tryParse ? '/' : ''));

      https.get(url, {
        headers: {
          cookie: sessionId ? `sessionid=${sessionId}` : ''
        }
      }, (res: any) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode !== 200) {
            switch (res.statusCode) {
              case 302: {
                switch (res.headers.location) {
                  case insta + 'accounts/login/':
                    return reject(429);
                  case insta + 'accounts/login/?next=/accounts/edit/%3F__a%3D1':
                    return reject(401);
                  default: {
                    if (res.headers.location.startsWith(insta + 'challenge/?next='))
                      return reject(409);
                    reject(res.statusCode);
                  }
                }
                break;
              }
              default: reject(res.statusCode);
            }
          } else if (tryParse) {
            try {
              resolve(Object.values(JSON.parse(body)['graphql'] || JSON.parse(body))[0]);
            }
            catch (_) {
              try {
                resolve(Object.values(Object.values(JSON.parse(body.match(/_sharedData = (.+);/)[1])['entry_data'])[0][0]['graphql'])[0]);
              }
              catch (_) {
                reject(406);
              }
            }
          }
          else {
            resolve(body);
          }
        });
        res.on('error', reject);
      });
    });
  }

  static graphQL(query, queryHash, sessionId) {
    return ApiUtil.get('graphql/query', sessionId, undefined, {
      query_hash: queryHash,
      variables: query ? JSON.stringify(query) : undefined
    });
  }
}

export default ApiUtil;