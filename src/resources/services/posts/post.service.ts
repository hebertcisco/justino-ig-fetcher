import {HASHTAGS_REGEX_PATTERN, INSTAGRAM_BASE_URL, USERNAMES_REGEX_PATTERN} from "../../../shared/constants";

export class PostsService {
    public static postComment(comment: any){
        return ({
            id: comment['node']['id'],
            user: comment['node']['owner']['username'],
            content: comment['node']['text'],
            timestamp: comment['node']['created_at'],
            hashtags: comment['node']['text'].match(HASHTAGS_REGEX_PATTERN),
            mentions: comment['node']['text'].match(USERNAMES_REGEX_PATTERN),
            likes: comment['node']['edge_liked_by']['count']
        })
    }
    public static partialPost(post: any) {
        return ({
            shortcode: post['node']['shortcode'],
            caption: post['node']['edge_media_to_caption']['edges'].length > 0
                ? post['node']['edge_media_to_caption']['edges'][0]['node']['text'] : null,
            comments: post['node']['edge_media_to_comment']['count'],
            likes: post['node']['edge_liked_by']['count'],
            thumbnail: post['node']['display_url'],
            timestamp: post['node']['taken_at_timestamp']
        });
    }
    public static fullPost(post: any){
        const caption = post['edge_media_to_caption']['edges'].length > 0 ? post['edge_media_to_caption']['edges'][0]['node']['text'] : null, username = post['owner']['username'], shortcode = post['shortcode'];
        return {
            shortcode,
            author: {
                id: post['owner']['id'],
                username,
                name: post['owner']['full_name'],
                pic: post['owner']['profile_pic_url'],
                verified: post['owner']['is_verified'],
                link: `${INSTAGRAM_BASE_URL}/${ username }`
            },
            location: post['location'] ? {
                id: post['location']['id'],
                name: post['location']['name'],
                ...(post['location']['address_json'] ? {
                    city: JSON.parse(post['location']['address_json'])['city_name']
                } : {})
            } : null,
            ...(post['__typename'] === 'GraphImage' ? {
                contents: [{
                    type: 'photo',
                    url: post['display_url']
                }]
            } : {}),
            ...(post['__typename'] === 'GraphVideo' ? {
                contents: [{
                    type: 'video',
                    url: post['video_url'],
                    thumbnail: post['display_url'],
                    views: post['video_view_count']
                }]
            } : {}),
            ...(post['__typename'] === 'GraphSidecar' ? {
                contents: post['edge_sidecar_to_children']['edges']
                    .map((content: { [x: string]: { [x: string]: any; }; }) => ({
                        type: content['node']['is_video'] ? 'video' : 'photo',
                        url: content['node']['is_video'] ? content['node']['video_url'] : content['node']['display_url'],
                        ...(content['node']['is_video'] ? {
                            thumbnail: content['node']['display_url'],
                            views: content['node']['video_view_count']
                        } : {})
                    }))
            } : {}),
            ...(post['edge_media_to_tagged_user'] ? {
                tagged: post['edge_media_to_tagged_user']['edges']
                    .map((u: { [x: string]: { [x: string]: { [x: string]: any; }; }; }) => u['node']['user']['username'])
            } : {}),
            likes: post['edge_media_preview_like']['count'],
            caption,
            hashtags: caption ? caption.match(HASHTAGS_REGEX_PATTERN) : null,
            mentions: caption ? caption.match(USERNAMES_REGEX_PATTERN) : null,
            edited: post['caption_is_edited'] || false,
            ...(post['edge_media_preview_comment'] ? {
                comments: post['comments_disabled'] ? null : post['edge_media_preview_comment']['edges'].map(this.postComment),
                commentCount: post['edge_media_preview_comment']['count']
            } : {}),
            timestamp: post['taken_at_timestamp'],
            link: INSTAGRAM_BASE_URL + 'p/' + shortcode
        }
    }
}
