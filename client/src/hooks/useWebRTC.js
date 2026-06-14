import { useState, useEffect, useRef, useCallback } from 'react';

export function useWebRTC(roomId, userId, socket) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionState, setConnectionState] = useState('new');
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  const createPeerConnection = useCallback(() => {
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(config);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        const targetUserId = peerRef.current?.remoteUserId;
        if (targetUserId) {
          socket.sendIceCandidate(roomId, event.candidate, targetUserId);
        }
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      setConnectionState(pc.connectionState);
    };

    peerRef.current = pc;
    return pc;
  }, [roomId, socket]);

  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error('Error getting media stream:', error);
      return null;
    }
  }, []);

  const call = useCallback(
    async (targetUserId) => {
      const stream = localStreamRef.current || await startLocalStream();
      if (!stream) return;

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      peerRef.current.remoteUserId = targetUserId;

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.sendVideoOffer(roomId, offer, targetUserId);
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    },
    [roomId, socket, createPeerConnection, startLocalStream]
  );

  const answer = useCallback(
    async (offer, fromUserId) => {
      const stream = localStreamRef.current || await startLocalStream();
      if (!stream) return;

      let pc = peerRef.current;
      if (!pc) {
        pc = createPeerConnection();
      }

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      peerRef.current.remoteUserId = fromUserId;

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.sendVideoAnswer(roomId, answer, fromUserId);
      } catch (error) {
        console.error('Error creating answer:', error);
      }
    },
    [roomId, socket, createPeerConnection, startLocalStream]
  );

  const handleAnswer = useCallback(async (answer) => {
    if (peerRef.current) {
      try {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error('Error setting remote description:', error);
      }
    }
  }, []);

  const handleIceCandidate = useCallback(async (candidate) => {
    if (peerRef.current) {
      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff((prev) => !prev);
    }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      if (localStreamRef.current && peerRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        const sender = peerRef.current.getSenders().find(
          (s) => s.track?.kind === 'video'
        );
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      }
      setIsScreenSharing(false);
      socket.sendScreenShareStopped(roomId);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const screenTrack = screenStream.getVideoTracks()[0];

        if (peerRef.current) {
          const sender = peerRef.current.getSenders().find(
            (s) => s.track?.kind === 'video'
          );
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        }

        screenTrack.onended = () => {
          toggleScreenShare();
        };

        setIsScreenSharing(true);
        socket.sendScreenShareStarted(roomId);
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    }
  }, [isScreenSharing, roomId, socket]);

  const hangup = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setConnectionState('closed');
  }, []);

  useEffect(() => {
    return () => {
      hangup();
    };
  }, [hangup]);

  return {
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    isScreenSharing,
    connectionState,
    startLocalStream,
    call,
    answer,
    handleAnswer,
    handleIceCandidate,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    hangup,
  };
}
