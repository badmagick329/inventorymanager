'use client';

import { useState } from 'react';

import HiddenPlayer from './hidden-player';
import VisiblePlayer from './visible-player';

export default function VideoPlayer({
  width,
  videoName,
}: {
  width: number;
  videoName: string;
}) {
  const [showVideo, setShowVideo] = useState(false);
  if (!showVideo) {
    return <HiddenPlayer width={width} callback={() => setShowVideo(true)} />;
  }

  return (
    <VisiblePlayer
      width={width}
      videoName={videoName}
      callback={() => setShowVideo(false)}
    />
  );
}
