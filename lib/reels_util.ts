import { Reels } from './types/reels';

class ReelsUtil {
  static partialReels(reelsList: Reels[]) {
    const reelsVideo = reelsList[0];
    const versions = reelsVideo.video_versions;
    // Sorting by quality
    versions.sort((a, b) => b.width - a.width);
    const bestQualityVideo = versions[0];
    return bestQualityVideo;
  }
}

export default ReelsUtil