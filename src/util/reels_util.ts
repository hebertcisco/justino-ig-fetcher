import {Reels} from '../shared/interfaces';

class ReelsUtil {
  public static partialReels(reelsList: Reels[]) {
    const reelsVideo = reelsList[0];
    const versions = reelsVideo.video_versions;
    // Sorting by quality
    versions.sort((a, b) => b.width - a.width);
    return versions[0];
  }
}

export default ReelsUtil
