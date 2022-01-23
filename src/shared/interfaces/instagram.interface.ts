export interface IQueryHash {
    anyPost: any,
    post: any,
    comment: any,
    hashtag: any,
    location: any,
}
export interface FriendshipStatus {
    following: boolean;
    outgoing_request: boolean;
    is_bestie: boolean;
    is_restricted: boolean;
    is_feed_favorite: boolean;
}

export interface User {
    pk: number;
    username: string;
    full_name: string;
    is_private: boolean;
    profile_pic_url: string;
    profile_pic_id: string;
    friendship_status: FriendshipStatus;
    is_verified: boolean;
    follow_friction_type: number;
    has_anonymous_profile_picture: boolean;
    is_unpublished: boolean;
    is_favorite: boolean;
    latest_reel_media: number;
    has_highlight_reels: boolean;
    live_broadcast_id?: any;
    live_broadcast_visibility?: any;
}

export interface LikerConfig {
    is_daisy: boolean;
    hide_view_count: boolean;
    show_count_in_likers_list: boolean;
    show_view_count_in_likers_list: boolean;
    show_daisy_liker_list_header: boolean;
    show_learn_more: boolean;
    ads_display_mode: number;
    display_mode: number;
    disable_liker_list_navigation: boolean;
    show_author_view_likes_button: boolean;
    is_in_daisy_controls: boolean;
}

export interface Candidate {
    width: number;
    height: number;
    url: string;
}

export interface IgtvFirstFrame {
    width: number;
    height: number;
    url: string;
}

export interface FirstFrame {
    width: number;
    height: number;
    url: string;
}

export interface AdditionalCandidates {
    igtv_first_frame: IgtvFirstFrame;
    first_frame: FirstFrame;
}

export interface Default {
    video_length: number;
    thumbnail_width: number;
    thumbnail_height: number;
    thumbnail_duration: number;
    sprite_urls: string[];
    thumbnails_per_row: number;
    total_thumbnail_num_per_sprite: number;
    max_thumbnails_per_sprite: number;
    sprite_width: number;
    sprite_height: number;
    rendered_width: number;
    file_size_kb: number;
}

export interface AnimatedThumbnailSpritesheetInfoCandidates {
    default: Default;
}

export interface ImageVersions2 {
    candidates: Candidate[];
    additional_candidates: AdditionalCandidates;
    animated_thumbnail_spritesheet_info_candidates: AnimatedThumbnailSpritesheetInfoCandidates;
}

export interface ReelsVideo {
    type: number;
    width: number;
    height: number;
    url: string;
    id: string;
}

export interface SharingFrictionInfo {
    should_have_sharing_friction: boolean;
    bloks_app_url?: any;
}

export interface CommentInformTreatment {
    should_have_inform_treatment: boolean;
    text: string;
}

export interface IgArtist {
    pk: number;
    username: string;
    full_name: string;
    is_private: boolean;
    profile_pic_url: string;
    profile_pic_id: string;
    is_verified: boolean;
    follow_friction_type: number;
}

export interface ConsumptionInfo {
    is_bookmarked: boolean;
    should_mute_audio_reason: string;
    is_trending_in_clips: boolean;
}

export interface OriginalSoundInfo {
    audio_asset_id: number;
    progressive_download_url: string;
    dash_manifest: string;
    ig_artist: IgArtist;
    should_mute_audio: boolean;
    original_media_id: number;
    hide_remixing: boolean;
    duration_in_ms: number;
    time_created: number;
    original_audio_title: string[];
    consumption_info: ConsumptionInfo;
    allow_creator_to_rename: boolean;
    can_remix_be_shared_to_fb: boolean;
    formatted_clips_media_count?: any;
    audio_parts: any[];
    is_explicit: boolean;
    original_audio_subtype: string;
    is_audio_automatically_attributed: boolean;
}

export interface MashupInfo {
    mashups_allowed: boolean;
    can_toggle_mashups_allowed: boolean;
    has_been_mashed_up: boolean;
    formatted_mashups_count?: any;
    original_media?: any;
    non_privacy_filtered_mashups_media_count?: any;
}

export interface BrandedContentTagInfo {
    can_add_tag: boolean;
}

export interface AudioReattributionInfo {
    should_allow_restore: boolean;
}

export interface AdditionalAudioInfo {
    additional_audio_username?: any;
    audio_reattribution_info: AudioReattributionInfo;
}

export interface AudioRankingInfo {
    best_audio_cluster_id?: any;
}

export interface ClipsMetadata {
    music_info?: any;
    original_sound_info: OriginalSoundInfo;
    audio_type: string;
    music_canonical_id: string;
    featured_label?: any;
    mashup_info: MashupInfo;
    nux_info?: any;
    viewer_interaction_settings?: any;
    branded_content_tag_info: BrandedContentTagInfo;
    shopping_info?: any;
    additional_audio_info: AdditionalAudioInfo;
    is_shared_to_fb: boolean;
    breaking_content_info?: any;
    challenge_info?: any;
    reels_on_the_rise_info?: any;
    breaking_creator_info?: any;
    asset_recommendation_info?: any;
    contextual_highlight_info?: any;
    clips_creation_entry_point: string;
    audio_ranking_info: AudioRankingInfo;
}

export interface CreationToolInfo {
    appearance_effect: number;
    camera_tool: number;
    color_filters: string;
    duration_selector_seconds: number;
    speed_selector: number;
    timer_selector_seconds: number;
}

export interface CreativeConfig {
    camera_tools: string[];
    capture_type: string;
    creation_tool_info: CreationToolInfo[];
}

export interface SquareCrop {
    crop_bottom: number;
    crop_left: number;
    crop_right: number;
    crop_top: number;
}

export interface MediaCroppingInfo {
    feed_preview_crop?: any;
    square_crop: SquareCrop;
}

export interface Reels {
    taken_at: number;
    pk: number;
    id: string;
    device_timestamp: number;
    media_type: number;
    code: string;
    client_cache_key: string;
    filter_type: number;
    is_unified_video: boolean;
    user: User;
    can_viewer_reshare: boolean;
    caption_is_edited: boolean;
    like_and_view_counts_disabled: boolean;
    liker_config: LikerConfig;
    featured_products_cta?: any;
    commerciality_status: string;
    is_paid_partnership: boolean;
    is_visual_reply_commenter_notice_enabled: boolean;
    original_media_has_visual_reply_media: boolean;
    comment_likes_enabled: boolean;
    comment_threading_enabled: boolean;
    has_more_comments: boolean;
    max_num_visible_preview_comments: number;
    preview_comments: any[];
    comments: any[];
    can_view_more_preview_comments: boolean;
    comment_count: number;
    hide_view_all_comment_entrypoint: boolean;
    inline_composer_display_condition: string;
    image_versions2: ImageVersions2;
    original_width: number;
    original_height: number;
    like_count: number;
    has_liked: boolean;
    top_likers: string[];
    facepile_top_likers: any[];
    photo_of_you: boolean;
    can_see_insights_as_brand: boolean;
    is_dash_eligible: number;
    video_dash_manifest: string;
    video_codec: string;
    number_of_qualities: number;
    video_versions: ReelsVideo[];
    has_audio: boolean;
    video_duration: number;
    view_count: number;
    play_count: number;
    caption?: any;
    can_viewer_save: boolean;
    organic_tracking_token: string;
    sharing_friction_info: SharingFrictionInfo;
    comment_inform_treatment: CommentInformTreatment;
    product_type: string;
    is_in_profile_grid: boolean;
    profile_grid_control_enabled: boolean;
    deleted_reason: number;
    integrity_review_decision: string;
    music_metadata?: any;
    clips_metadata: ClipsMetadata;
    creative_config: CreativeConfig;
    media_cropping_info: MediaCroppingInfo;
}
