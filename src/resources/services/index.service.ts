import { INSTAGRAM_BASE_URL} from '../../shared/constants';
import ApiUtil from "../../util/api_util";
import {IQueryHash} from "../../shared/interfaces";
import {PostsService} from "./posts/post.service";
import {IGetPostOptions} from "./posts/post.type";

const profileIds: any[] = [];

export class Instagram {
    private tryParse: boolean;
    protected sessionId: string | undefined;
    protected username: string | undefined;
    protected queryHashs: IQueryHash;

    constructor() {
        this.tryParse = true;
        this.sessionId = undefined;
        this.username = undefined;
        this.queryHashs = {
            anyPost: undefined,
            post: undefined,
            comment: undefined,
            hashtag: undefined,
            location: undefined,
        };
    }
    public setSessionId(sessionId: string): void {
        this.sessionId = sessionId;
    }
    public async getPost(shortcode: string, options?: IGetPostOptions){
        return new Promise((resolve, reject) => {
            if(options?.useGraphQL){
                this._getQueryHashs().then((queryHashs) => {
                    ApiUtil.graphQL({ shortcode }, queryHashs?.anyPost, this.sessionId)
                        .then(data => resolve(PostsService.fullPost(data['shortcode_media'])))
                        .catch(reject);
                });
            }
            else {
                ApiUtil.get(`p/${shortcode}`, this.sessionId)
                    .then(post => resolve(PostsService.fullPost(post)))
                    .catch(reject);
            }
        });
    }
    public async getProfilePostsById(profileId: any, maxCount: number, pageId: any){
        const queryHashs = await this._getQueryHashs() as any;
        const res = await ApiUtil.graphQL({
            id: profileId,
            first: maxCount,
            after: pageId
        }, queryHashs.post, this.sessionId);
        return Object.assign(
            res['user']['edge_owner_to_timeline_media']['edges'].map((item: any) => PostsService.fullPost(item['node'])),
            {
                nextPageId: res['user']['edge_owner_to_timeline_media']['page_info']['has_next_page']
                    ? res['user']['edge_owner_to_timeline_media']['page_info']['end_cursor']
                    : undefined
            }
        );
    }
    public async subscribeAccountNotifications(callback: (interval: number, lastNotificationId?: any) => void, {
        interval = 30,
        lastNotificationId
    }: any){
        let active = true;
        const checkNewNotifications = () => {
            if(!active) return;
            (async () => {
                try {
                    const notifications = await this.getAccountNotifications() as any;
                    const lastNotificationIndex = notifications.findIndex((notification: any) => notification.id === lastNotificationId);
                    if(lastNotificationIndex !== -1){
                        for(let i = lastNotificationIndex - 1; i > -1 ; i--){
                            callback(notifications[i]);
                        }
                    }
                    lastNotificationId = notifications[0].id;
                    setTimeout(checkNewNotifications, interval * 1000);
                }
                catch(err){
                    callback(0, err);
                    checkNewNotifications();
                }
            })();
        };
        checkNewNotifications();
        return {
            unsubscribe: () => {
                active = false;
            }
        };
    }
    subscribeUserPosts(username: string, callback: any, {
        interval = 30,
        lastPostShortcode = {},
        fullPosts = false
    } = {}){
        let active = true;
        const checkNewPosts = () => {
            if(!active) return;
            (async () => {
                try {
                    const profile = await this.getProfile(username) as any;
                    const lastPostIndex = profile.lastPosts.findIndex((post: any) => post.shortcode === lastPostShortcode);
                    if(lastPostIndex !== -1){
                        for(let i = lastPostIndex - 1; i > -1 ; i--){
                            callback(fullPosts ? (await this.getPost(profile.lastPosts[i].shortcode)) : profile.lastPosts[i]);
                        }
                    }
                    lastPostShortcode = profile.lastPosts[0].shortcode;
                    setTimeout(checkNewPosts, interval * 1000);
                }
                catch(err){
                    callback(undefined, err);
                    checkNewPosts();
                }
            })();
        };
        checkNewPosts();
        return {
            unsubscribe: () => {
                active = false;
            }
        };
    }
    public async subscribeHashtagPosts(hashtagName: any, callback: any, {
        interval = 30,
        lastPostShortcode = undefined,
        fullPosts = false
    } = {}){
        let active = true;
        const checkNewPosts = () => {
            if(!active) return;
            (async () => {
                try {
                    const hashtag = await this.getHashtag(hashtagName) as any;
                    const lastPostIndex = hashtag.lastPosts.findIndex((post: any) => post.shortcode === lastPostShortcode);
                    for(let i = lastPostIndex - 1; i > -1 ; i--){
                        callback(fullPosts ? (await this.getPost(hashtag.lastPosts[i].shortcode)) : hashtag.lastPosts[i]);
                    }
                    lastPostShortcode = hashtag.lastPosts[0].shortcode;
                    setTimeout(checkNewPosts, interval * 1000);
                }
                catch(err){
                    callback(undefined, err);
                    checkNewPosts();
                }
            })();
        };
        checkNewPosts();
        return {
            unsubscribe: () => {
                active = false;
            }
        };
    }
    public async getAccountNotifications(): Promise<any>{
        return new Promise((resolve, reject) => {
            if(!this.sessionId) return reject(401);
            ApiUtil.get('accounts/activity', this.sessionId).then(res => {
                resolve(res['activity_feed']['edge_web_activity_feed']['edges']
                    .map((item: any) => item['node'])
                    .map((notification: any) => ({
                    id: notification['id'],
                    timestamp: notification['timestamp'],
                    // @ts-ignore
                    type: ({
                        'GraphLikeAggregatedStory' : 'like',
                        'GraphMentionStory': 'mention',
                        'GraphCommentMediaStory': 'comment',
                        'GraphFollowAggregatedStory': 'follow'
                    })[notification['__typename']],
                    ...(notification['media'] ? {
                        post: {
                            shortcode: notification['media']['shortcode'],
                            thumbnail: notification['media']['thumbnail_src']
                        }
                    } : {}),
                    ...(notification['user'] ? {
                        by: {
                            username: notification['user']['username'],
                            name: notification['user']['full_name'],
                            pic: notification['user']['profile_pic_url']
                        }
                    } : {}),
                    ...(notification['__typename'] === 'GraphMentionStory' ? {
                        content: notification['text']
                    } : {})
                })));
            }).catch(reject);
        });
    }
    public async getAccountStories(): Promise<any>{
        return new Promise((resolve, reject) => {
            if(!this.sessionId) return reject(401);
            ApiUtil.get('', this.sessionId, false, { __a: undefined }).then(body => {
                ApiUtil.graphQL(
                    {},
                    body.match(/<link rel="preload" href="\/graphql\/query\/\?query_hash=(.+)&amp;/)[1],
                    this.sessionId
                ).then(body => {
                    resolve(body['user']['feed_reels_tray']['edge_reels_tray_to_reel']['edges']
                        .map((item: any) => ({
                        unread: item['node']['latest_reel_media'] !== item['node']['seen'],
                        author: {
                            id: item['node']['user']['id'],
                            username: item['node']['user']['username'],
                            pic: item['node']['user']['profile_pic_url']
                        },
                        user: {
                            requesting: item['node']['user']['requested_by_viewer'],
                            following: item['node']['user']['followed_by_viewer']
                        }
                    })));
                }).catch(reject);
            }).catch(reject);
        });
    }

    public async searchHashtag(query: object): Promise<any> {
        return new Promise((resolve, reject) => this.search(query)
            .then((res: any) => resolve(res['hashtags'].map((item: any) => item['hashtag'])
                .map((hashtag: any) => ({ name: hashtag['name'], posts: hashtag['media_count'] }))))
            .catch(reject));
    }
    public async searchLocation(query:object): Promise<any> {
        return new Promise((resolve, reject) => this.search(query)
            .then((res: any) => resolve(res['places']
                .map((item: any) => item['place']['location'])
                .map((location: any) => ({
                id: location['pk'],
                name: location['name'],
                address: {
                    street: location['address'],
                    city: location['city'],
                    latitude: location['lat'],
                    longitude: location['lng']
                }
            }))))
            .catch(reject));
    }
    public async searchProfile(query: object): Promise<any> {
        return new Promise((resolve, reject) => this.search(query, this.sessionId)
            .then((res: any) => resolve(res['users'].map((item: any) => item['user']).map((profile: any) => ({
                username: profile['username'],
                name: profile['full_name'],
                pic: profile['profile_pic_url'],
                private: profile['is_private'],
                verified: profile['is_verified'],
                followers: profile['follower_count'],
                ...(this.sessionId ? {
                    user: {
                        following: profile['following']
                    }
                } : {})
            }))))
            .catch(reject));
    }
    public async getPostComments(shortcode: string, maxCount: number, pageId: any): Promise<any> {
        const res = await ApiUtil.graphQL({
            shortcode,
            first: maxCount,
            after: pageId
        }, (await this._getQueryHashs()).comment, this.sessionId);
        return Object.assign(
            res['shortcode_media']['edge_media_to_parent_comment']['edges'].map(PostsService.postComment),
            {
                nextPageId: res['shortcode_media']['edge_media_to_parent_comment']['page_info']['has_next_page']
                    ? res['shortcode_media']['edge_media_to_parent_comment']['page_info']['end_cursor']
                    : undefined
            }
        );
    }

    public getLocation(id: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const path = `explore/locations/${id}`;
            ApiUtil.get(path)
                .then((location: any) => {
                    const address = JSON.parse(location['address_json']);
                    resolve({
                        pic: location['profile_pic_url'],
                        posts: location['edge_location_to_media']['count'],
                        address: {
                            street: address['street_address'],
                            zipCode: address['zip_code'],
                            city: address['city_name'],
                            latitude: location['lat'],
                            longitude: location['lng']
                        },
                        website: location['website'],
                        phone: location['phone'],
                        featuredPosts: location['edge_location_to_top_posts']['edges']
                            .map((post: any) => PostsService.partialPost(post)),
                        lastPosts: location['edge_location_to_media']['edges']
                            .map((post: any) => PostsService.partialPost(post)),
                        link: INSTAGRAM_BASE_URL + path
                    });
                })
                .catch(reject);
        });
    }
    public async getHashtag(hashtag: string){
        return new Promise((resolve, reject) => {
            const path = `explore/tags/${hashtag}`;
            ApiUtil.get(path, this.sessionId)
                .then(hashtag => resolve({
                    pic: hashtag['profile_pic_url'],
                    posts: hashtag['edge_hashtag_to_media']['count'],
                    featuredPosts: hashtag['edge_hashtag_to_top_posts']['edges'].map((post: any) => PostsService.partialPost(post)),
                    lastPosts: hashtag['edge_hashtag_to_media']['edges'].map((post: any) => PostsService.partialPost(post)),
                    link: INSTAGRAM_BASE_URL + path,
                    ...(this.sessionId ? {
                        user: {
                            following: hashtag['is_following']
                        }
                    } : {})
                }))
                .catch(reject);
        });
    }
    public getProfileStory(username = this.username){
        return new Promise((resolve, reject) => {
            this._getProfileId(username)
                .then(id =>
                    this.getProfileStoryById(id)
                        .then(resolve)
                        .catch(reject))
                .catch(reject);
        });
    }
    public async getProfileStoryById(id: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if(!this.sessionId) return reject(401);
            this._getQueryHashs().then((queryHashs: any) => ApiUtil.graphQL({
                reel_ids: [ id ],
                precomposed_overlay: false
            }, queryHashs.story, this.sessionId).then((data: any) => resolve(data['reels_media'][0] ? {
                unread: data['reels_media'][0]['latest_reel_media'] !== data['reels_media'][0]['seen'],
                author: {
                    username: data['reels_media'][0]['user']['username'],
                    pic: data['reels_media'][0]['user']['profile_pic_url']
                },
                user: {
                    requesting: data['reels_media'][0]['user']['requested_by_viewer'],
                    following: data['reels_media'][0]['user']['followed_by_viewer']
                },
                items: data['reels_media'][0]['items'].map((item: any) => ({
                    url: item['is_video'] ? item['video_resources'][0]['src'] : item['display_url'],
                    type: item['is_video'] ? 'video' : 'photo',
                    timestamp: item['taken_at_timestamp'],
                    expirationTimestamp: item['expiring_at_timestamp'],
                    ...(item['story_cta_url'] ? {
                        externalLink: item['story_cta_url']
                    } : {})
                }))
            } : null)).catch(reject)).catch(reject);
        });
    }
    protected async _getQueryHashs(){
        if(JSON.stringify(this.queryHashs) !== '{}') return this.queryHashs;
        const
            {
                Consumer,
                ConsumerLibCommons,
                TagPageContainer,
                LocationPageContainer,
            } = Object.fromEntries([
                ...(await ApiUtil.get('', this.sessionId, false, { __a: undefined }))
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
        ] = [...mainScriptBody.matchAll(/queryId:"([^"]+)"/g)];
        this.queryHashs = {
            // story: mainScriptBody.match(/50,[a-zA-Z]="([^"]+)",/)[1],
            anyPost: mainScriptBody.match(/RETRY_TEXT.+var [a-zA-Z]="([^"]+)",/)[1],
            post: secondaryScriptBody.match(/queryId:"([^"]+)"/)[1],
            comment,
            hashtag: hashtagScriptBody.match(localQueryIdRegex)[1],
            location: locationScriptBody.match(localQueryIdRegex)[1]
        };
        return this.queryHashs;
    }
    public getProfile(username: string | any = this.username, anonymous = false){
        return new Promise((resolve, reject) => ApiUtil.get(username, anonymous ? null : this.sessionId)
            .then((profile: any) => {
                const
                    id = profile['id'],
                    access = !profile['is_private'] || !!profile['followed_by_viewer'] || profile['username'] === this.username;
                profileIds[username] = id;
                resolve({
                    id,
                    name: profile['full_name'],
                    pic: profile['profile_pic_url_hd'],
                    bio: profile['biography'],
                    private: profile['is_private'],
                    access,
                    verified: profile['is_verified'],
                    website: profile['external_url'],
                    followers: profile['edge_followed_by']['count'],
                    following: profile['edge_follow']['count'],
                    posts: profile['edge_owner_to_timeline_media']['count'],
                    lastPosts: access ? profile['edge_owner_to_timeline_media']['edges'].map((post: any) => PostsService.partialPost(post)) : null,
                    link: INSTAGRAM_BASE_URL + profile['username'],
                    ...(profile['is_business_account'] ? {
                        business: profile['business_category_name']
                    } : {}),
                    ...(this.sessionId ? {
                        user: {
                            mutualFollowers: profile['edge_mutual_followed_by']['edges'].map((item: any) => item['node']['username']),
                            blocking: profile['blocked_by_viewer'],
                            blocked: profile['has_blocked_viewer'],
                            requesting: profile['requested_by_viewer'],
                            requested: profile['has_requested_viewer'],
                            following: profile['followed_by_viewer'],
                            followed: profile['follows_viewer']
                        }
                    } : {})
                });
            })
            .catch((err: number) => {
                if(err === 204){
                    this.getProfile(username, true)
                        .then(profile => resolve(Object.assign(profile, {
                            user: { blocked: true }
                        })))
                        .catch(reject);
                }
                else
                    reject(err);
            }));
    }
    private async _getProfileId(username: any) {
        const profile = await this.getProfile(username) as any;
        if(!profileIds[username])
            profileIds[username] = String(profile.id);
        return profileIds[username];
    }
    public authBySessionId(sessionId: string): Promise<any> {
        return new Promise((resolve, reject) => ApiUtil.get('accounts/edit', sessionId)
            .then(body => {
                if(this.sessionId)
                    process.emitWarning('Session ID changed');
                this.sessionId = sessionId;
                this.username = body['username'];
                resolve(body);
            })
            .catch(reject));
    }
    protected async search(query: object, sessionId?: any): Promise<any>{
        return new Promise(async (resolve, reject) => {
            return await ApiUtil.get('web/search/topsearch', sessionId, false, {context: 'blended', query})
                .then((body: string) => resolve(JSON.parse(body)))
                .catch(reject);
        });
    }
}
