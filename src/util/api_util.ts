import https = require('https');
import {INSTAGRAM_BASE_URL} from "../shared/constants";
import {queryString} from "../shared/helpers/queryString";

class ApiUtil {
  public static async get(
    path: string | any,
    sessionId?: string | any,
    tryParse = true,
    params?: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      params = JSON.stringify({ __a: sessionId ? '1' : undefined, ...params });
      const url = INSTAGRAM_BASE_URL + path + ((params !== '{}')
        ? ('/?' + queryString(JSON.parse(params)))
        : (tryParse ? '/' : ''));

      https.get(url, {
        headers: {
          cookie: sessionId ? `sessionid=${sessionId}` : ''
        }
      }, (res: any) => {
        let body = '';
        res.on('data', (chunk: any) => body += chunk);
        res.on('end', () => {
          if (res.statusCode !== 200) {
            switch (res.statusCode) {
              case 302: {
                switch (res.headers.location) {
                  case INSTAGRAM_BASE_URL + 'accounts/login/':
                    return reject(429);
                  case INSTAGRAM_BASE_URL + 'accounts/login/?next=/accounts/edit/%3F__a%3D1':
                    return reject(401);
                  default: {
                    if (res.headers.location.startsWith(INSTAGRAM_BASE_URL + 'challenge/?next='))
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
                // @ts-ignore
                resolve(Object.values(Object.values(
                    // @ts-ignore
                    JSON.parse(body.match(/_sharedData = (.+);/)[1])['entry_data'])[0][0]['graphql'])[0]);
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

  public static async graphQL(query: object, queryHash: any, sessionId: any): Promise<any> {
    return await ApiUtil.get('graphql/query', sessionId, undefined, {
      query_hash: queryHash,
      variables: query ? JSON.stringify(query) : undefined
    });
  }
}

export default ApiUtil;
