document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    const videoPreview = document.getElementById('video-preview');
    const canvas = document.getElementById('canvas');
    const capturedImage = document.getElementById('captured-image');
    const capturedVideo = document.getElementById('captured-video');
    const captureBtn = document.getElementById('capture-btn');
    const closeBtn = document.getElementById('close-btn');
    const switchCameraBtn = document.getElementById('switch-camera-btn');
    const flashBtn = document.getElementById('flash-btn');
    const filterBtn = document.getElementById('filter-btn');
    const addTextBtn = document.getElementById('add-text-btn');
    const addStickerBtn = document.getElementById('add-sticker-btn');
    const editImageBtn = document.getElementById('edit-image-btn');
    const photoBtn = document.getElementById('photo-btn');
    const videoBtn = document.getElementById('video-btn');
    const retakeBtn = document.getElementById('retake-btn');
    const saveBtn = document.getElementById('save-btn');
    const shareBtn = document.getElementById('share-btn');
    const textOverlay = document.getElementById('text-overlay');
    const textInput = document.getElementById('text-input');
    const stickerOverlay = document.getElementById('sticker-overlay');
    const editOverlay = document.getElementById('edit-overlay');
    const brightnessSlider = document.getElementById('brightness-slider');
    const contrastSlider = document.getElementById('contrast-slider');
    const applyEditBtn = document.getElementById('apply-edit-btn');

    let stream;
    let mediaRecorder;
    let recordedChunks = [];
    let isRecording = false;
    let facingMode = 'user';
    let flashOn = false;
    let currentFilter = 'none';
    let mediaType = 'photo';
    let brightness = 100;
    let contrast = 100;

    const filters = {
        none: 'none',
        grayscale: 'grayscale(100%)',
        sepia: 'sepia(100%)',
        invert: 'invert(100%)',
    };

    async function startCamera() {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            const constraints = {
                video: { facingMode: facingMode },
                audio: true
            };
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoPreview.srcObject = stream;
        } catch (err) {
            console.error("Error accessing camera:", err);
        }
    }

    function captureMedia() {
        if (mediaType === 'photo') {
            captureImage();
        } else {
            toggleRecording();
        }
    }

    function captureImage() {
        canvas.width = videoPreview.videoWidth;
        canvas.height = videoPreview.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.filter = filters[currentFilter];
        ctx.drawImage(videoPreview, 0, 0);
        capturedImage.src = canvas.toDataURL('image/jpeg');
        capturedImage.style.display = 'block';
        videoPreview.style.display = 'none';
        document.querySelector('.post-capture-actions').style.display = 'flex';
    }

    function toggleRecording() {
        if (isRecording) {
            mediaRecorder.stop();
            captureBtn.classList.remove('recording');
            isRecording = false;
        } else {
            recordedChunks = [];
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    recordedChunks.push(e.data);
                }
            };
            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                capturedVideo.src = URL.createObjectURL(blob);
                capturedVideo.style.display = 'block';
                videoPreview.style.display = 'none';
                document.querySelector('.post-capture-actions').style.display = 'flex';
            };
            mediaRecorder.start();
            captureBtn.classList.add('recording');
            isRecording = true;
        }
    }

    function switchCamera() {
        facingMode = facingMode === 'user' ? 'environment' : 'user';
        startCamera();
    }

    function toggleFlash() {
        if (stream) {
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities();
            if (capabilities.torch) {
                flashOn = !flashOn;
                track.applyConstraints({
                    advanced: [{ torch: flashOn }]
                });
                flashBtn.classList.toggle('active', flashOn);
            } else {
                alert('Flash is not supported on this device');
            }
        }
    }

    function changeFilter() {
        const filterKeys = Object.keys(filters);
        currentFilter = filterKeys[(filterKeys.indexOf(currentFilter) + 1) % filterKeys.length];
        videoPreview.style.filter = filters[currentFilter];
    }

    function saveMedia() {
        const link = document.createElement('a');
        if (mediaType === 'photo') {
            link.href = capturedImage.src;
            link.download = 'instagram-story.jpg';
        } else {
            link.href = capturedVideo.src;
            link.download = 'instagram-story.webm';
        }
        link.click();
    }

    function shareMedia() {
        if (navigator.share) {
            navigator.share({
                title: 'My Instagram Story',
                text: 'Check out my Instagram Story!',
                url: mediaType === 'photo' ? capturedImage.src : capturedVideo.src,
            })
                .then(() => console.log('Successful share'))
                .catch((error) => console.log('Error sharing', error));
        } else {
            alert('Web Share API is not supported in your browser');
        }
    }

    function resetUI() {
        videoPreview.style.display = 'block';
        capturedImage.style.display = 'none';
        capturedVideo.style.display = 'none';
        document.querySelector('.post-capture-actions').style.display = 'none';
    }

    function applyImageEdit() {
        capturedImage.style.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        editOverlay.style.display = 'none';
    }

    // Event Listeners
    captureBtn.addEventListener('click', captureMedia);
    closeBtn.addEventListener('click', resetUI);
    switchCameraBtn.addEventListener('click', switchCamera);
    flashBtn.addEventListener('click', toggleFlash);
    filterBtn.addEventListener('click', changeFilter);
    photoBtn.addEventListener('click', () => { mediaType = 'photo'; });
    videoBtn.addEventListener('click', () => { mediaType = 'video'; });
    retakeBtn.addEventListener('click', resetUI);
    saveBtn.addEventListener('click', saveMedia);
    shareBtn.addEventListener('click', shareMedia);
    addTextBtn.addEventListener('click', () => { textOverlay.style.display = 'flex'; });
    addStickerBtn.addEventListener('click', () => { stickerOverlay.style.display = 'flex'; });
    editImageBtn.addEventListener('click', () => { editOverlay.style.display = 'flex'; });
    applyEditBtn.addEventListener('click', applyImageEdit);

    brightnessSlider.addEventListener('input', (e) => {
        brightness = e.target.value;
        capturedImage.style.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    });

    contrastSlider.addEventListener('input', (e) => {
        contrast = e.target.value;
        capturedImage.style.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    });

    textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            // Add text overlay logic here
            textOverlay.style.display = 'none';
        }
    });

    stickerOverlay.querySelectorAll('.sticker').forEach(stickerBtn => {
        stickerBtn.addEventListener('click', () => {
            // Add sticker overlay logic here
            stickerOverlay.style.display = 'none';
        });
    });

    // Initialize
    startCamera();
});
