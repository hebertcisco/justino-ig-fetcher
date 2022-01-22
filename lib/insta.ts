import ApiUtil from "./api_util";
import ReelsUtil from "./reels_util";

class InstaFetcher {

  sessionId: string;
  username: string;
  queryHashs: any;

  constructor() {
    this.sessionId = undefined;
    this.username = undefined;
    this.queryHashs = {};
  }

  authBySessionId(sessionId: string) {
    return new Promise((resolve, reject) => ApiUtil.get('accounts/edit', sessionId)
      .then((body: any) => {
        if (this.sessionId) {
          process.emitWarning('Session ID changed');
        }
        this.sessionId = sessionId;
        this.username = body['username'];
        resolve(body);
      })
      .catch(reject));
  }

  async _getQueryHashs() {
    if (JSON.stringify(this.queryHashs) !== '{}') return this.queryHashs;
    const
      {
        Consumer,
        ConsumerLibCommons,
        TagPageContainer,
        LocationPageContainer,
      } = Object.fromEntries([
        ...((await ApiUtil.get('', this.sessionId, false, { __a: undefined })) as any)
          .matchAll(/static\/bundles\/.+?\/(.+?)\.js\/.+?\.js/g)
      ].map(_ => _.reverse())),
      mainScriptBody = await ApiUtil.get(Consumer, undefined, false),
      secondaryScriptBody = await ApiUtil.get(ConsumerLibCommons, undefined, false),
      hashtagScriptBody = await ApiUtil.get(TagPageContainer, undefined, false),
      locationScriptBody = await ApiUtil.get(LocationPageContainer, undefined, false),
      localQueryIdRegex = /queryId:"([^"]+)"/;
    const [
      ,
      [, comment],
      ,
      [, post]
    ] = [...(mainScriptBody as any).matchAll(/queryId:"([^"]+)"/g)];
    this.queryHashs = {
      // story: mainScriptBody.match(/50,[a-zA-Z]="([^"]+)",/)[1],
      anyPost: (mainScriptBody as any).match(/RETRY_TEXT.+var [a-zA-Z]="([^"]+)",/)[1],
      post: (secondaryScriptBody as any).match(/queryId:"([^"]+)"/)[1],
      comment,
      hashtag: (hashtagScriptBody as any).match(localQueryIdRegex)[1],
      location: (locationScriptBody as any).match(localQueryIdRegex)[1]
    };
    return this.queryHashs;
  }

  getReels(shortcode: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const reelsPost = await ApiUtil.get(`reel/${shortcode}`, this.sessionId)
        resolve(ReelsUtil.partialReels(reelsPost));
      } catch (error) {
        reject(error)
      }
    });
  }
}

export default InstaFetcher;