# 360 view based on video file

This is working prototype of concept to use video as source of 360 view component.

To scroll video smoothly you need to export each frame as keyframe - ffmpeg/h.264`-x264opts keyint=1`

## Concept

The basic concept is very simple - use seek control of video player to control image rotation.

Main pros:

* compression algorithms
* browser optimization
* network resources utilization

Cons:

* seek available only after video is buffered
* not all browser allow programmatically play video
* Safari could not handle precises steps of seek
