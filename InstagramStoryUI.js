import React, { useState, useRef, useEffect } from 'react';
import { Camera, Disc, Image, Sparkles, X, RotateCcw, Download, Sun, Video, Type, Smile, Sliders, Share2 } from 'lucide-react';

const filters = {
  none: 'none',
  grayscale: 'grayscale(100%)',
  sepia: 'sepia(100%)',
  invert: 'invert(100%)',
};

const stickers = ['😊', '😎', '🎉', '❤️', '👍'];

const InstagramStoryUI = () => {
  const [activeTab, setActiveTab] = useState('normal');
  const [stream, setStream] = useState(null);
  const [mediaType, setMediaType] = useState('photo');
  const [capturedMedia, setCapturedMedia] = useState(null);
  const [currentFilter, setCurrentFilter] = useState('none');
  const [facingMode, setFacingMode] = useState('user');
  const [flashOn, setFlashOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [addingText, setAddingText] = useState(false);
  const [addingSticker, setAddingSticker] = useState(false);
  const [editingImage, setEditingImage] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [overlays, setOverlays] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const constraints = {
        video: { facingMode: facingMode },
        audio: true
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const captureMedia = () => {
    if (mediaType === 'photo') {
      captureImage();
    } else {
      toggleRecording();
    }
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.filter = filters[currentFilter];
    ctx.drawImage(video, 0, 0);
    applyOverlays(ctx);
    setCapturedMedia(canvas.toDataURL('image/jpeg'));
  };

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      chunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setCapturedMedia(URL.createObjectURL(blob));
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const switchCamera = () => {
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
  };

  const toggleFlash = () => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      if (capabilities.torch) {
        track.applyConstraints({
          advanced: [{ torch: !flashOn }]
        });
        setFlashOn(!flashOn);
      } else {
        alert('Flash is not supported on this device');
      }
    }
  };

  const saveMedia = () => {
    if (capturedMedia) {
      const link = document.createElement('a');
      link.href = capturedMedia;
      link.download = `instagram-story.${mediaType === 'photo' ? 'jpg' : 'webm'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const addTextOverlay = (text) => {
    setOverlays([...overlays, { type: 'text', content: text, x: 50, y: 50 }]);
    setAddingText(false);
  };

  const addStickerOverlay = (sticker) => {
    setOverlays([...overlays, { type: 'sticker', content: sticker, x: 50, y: 50 }]);
    setAddingSticker(false);
  };

  const applyOverlays = (ctx) => {
    overlays.forEach(overlay => {
      if (overlay.type === 'text') {
        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(overlay.content, overlay.x, overlay.y);
      } else if (overlay.type === 'sticker') {
        ctx.font = '40px Arial';
        ctx.fillText(overlay.content, overlay.x, overlay.y);
      }
    });
  };

  const shareMedia = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Instagram Story',
        text: 'Check out my Instagram Story!',
        url: capturedMedia,
      })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    } else {
      alert('Web Share API is not supported in your browser');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4">
        <X className="w-6 h-6" onClick={() => setCapturedMedia(null)} />
        <div className="flex space-x-4">
          <Sparkles className="w-6 h-6" onClick={() => setCurrentFilter(prevFilter => {
            const filterKeys = Object.keys(filters);
            return filterKeys[(filterKeys.indexOf(prevFilter) + 1) % filterKeys.length];
          })} />
          <Disc className="w-6 h-6" onClick={switchCamera} />
          <Sun className={`w-6 h-6 ${flashOn ? 'text-yellow-400' : ''}`} onClick={toggleFlash} />
          <Type className="w-6 h-6" onClick={() => setAddingText(true)} />
          <Smile className="w-6 h-6" onClick={() => setAddingSticker(true)} />
          <Sliders className="w-6 h-6" onClick={() => setEditingImage(true)} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex items-center justify-center relative">
        {capturedMedia ? (
          mediaType === 'photo' ? (
            <img 
              src={capturedMedia} 
              alt="Captured" 
              className="max-h-full max-w-full object-contain"
              style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
            />
          ) : (
            <video 
              src={capturedMedia} 
              controls 
              className="max-h-full max-w-full object-contain"
            />
          )
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="max-h-full max-w-full object-contain"
            style={{ filter: filters[currentFilter] }}
          />
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Bottom Bar */}
      <div className="flex justify-between items-center p-4">
        <div className="flex space-x-4">
          <Image className="w-6 h-6" onClick={() => setMediaType('photo')} />
          <Video className="w-6 h-6" onClick={() => setMediaType('video')} />
        </div>
        {capturedMedia ? (
          <div className="flex space-x-4">
            <RotateCcw className="w-8 h-8" onClick={() => setCapturedMedia(null)} />
            <Download className="w-8 h-8" onClick={saveMedia} />
            <Share2 className="w-8 h-8" onClick={shareMedia} />
          </div>
        ) : (
          <button
            className={`w-16 h-16 rounded-full border-4 ${isRecording ? 'border-red-500' : 'border-white'} flex items-center justify-center`}
            onClick={captureMedia}
          >
            {mediaType === 'photo' ? (
              <Camera className="w-8 h-8" />
            ) : (
              <div className={`w-8 h-8 rounded-full ${isRecording ? 'bg-red-500' : 'bg-white'}`} />
            )}
          </button>
        )}
      </div>

      {/* Overlays */}
      {addingText && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <input 
            type="text" 
            className="p-2 text-black" 
            placeholder="Enter text"
            onKeyPress={(e) => e.key === 'Enter' && addTextOverlay(e.target.value)}
          />
        </div>
      )}
      {addingSticker && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            {stickers.map((sticker, index) => (
              <button key={index} className="text-2xl m-1" onClick={() => addStickerOverlay(sticker)}>
                {sticker}
              </button>
            ))}
          </div>
        </div>
      )}
      {editingImage && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
          <input 
            type="range" 
            min="0" 
            max="200" 
            value={brightness} 
            onChange={(e) => setBrightness(e.target.value)}
            className="mb-4"
          />
          <input 
            type="range" 
            min="0" 
            max="200" 
            value={contrast} 
            onChange={(e) => setContrast(e.target.value)}
          />
          <button className="mt-4 bg-blue-500 p-2 rounded" onClick={() => setEditingImage(false)}>
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

export default InstagramStoryUI;