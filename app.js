const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const overlayImage = document.getElementById('overlay-image');
const captureBtn = document.getElementById('capture-btn');
const previewContainer = document.getElementById('preview-container');
const capturedImage = document.getElementById('captured-image');
const closeBtn = document.getElementById('close-btn');
const imageInput = document.getElementById('image-input');
const shutterSound = document.getElementById('shutter-sound');
const closeTabBtn = document.getElementById('close-tab');
const rotateLink = document.getElementById('rotate-link');

const overlays = ['images/default-overlay.png', 'images/default-overlay1.png', 'images/default-overlay2.png', 'images/default-overlay3.png'];
let currentOverlayIndex = 0;

let overlayScale = 1;
let overlayStartDistance = 0;
let overlayX = 0;
let overlayY = 0;
let isDragging = false;
let startX, startY;

// カメラの初期化
const constraints = {
  video: {
    facingMode: 'environment'
  }
};

navigator.mediaDevices.getUserMedia(constraints)
  .then(stream => {
    video.srcObject = stream;
    video.play();
  })
  .catch(err => console.error(err));

// 写真の撮影
captureBtn.addEventListener('click', () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const videoRect = video.getBoundingClientRect();
  const overlayRect = overlayImage.getBoundingClientRect();
  const overlayWidthRatio = overlayRect.width / videoRect.width;
  const overlayHeightRatio = overlayRect.height / videoRect.height;
  const overlayLeftRatio = (overlayRect.left - videoRect.left) / videoRect.width;
  const overlayTopRatio = (overlayRect.top - videoRect.top) / videoRect.height;

  const captureOverlayWidth = canvas.width * overlayWidthRatio;
  const captureOverlayHeight = canvas.height * overlayHeightRatio;
  const captureOverlayLeft = canvas.width * overlayLeftRatio;
  const captureOverlayTop = canvas.height * overlayTopRatio;

  if (overlayImage.src) {
    ctx.drawImage(overlayImage, captureOverlayLeft, captureOverlayTop, captureOverlayWidth, captureOverlayHeight);
  }

  const dataURL = canvas.toDataURL('image/png');
  capturedImage.src = dataURL;
  previewContainer.style.display = 'flex';
  shutterSound.play();
});

// プレビューを閉じる
closeBtn.addEventListener('click', () => {
  previewContainer.style.display = 'none';
});

// 画像のオーバーレイ
imageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    overlayImage.src = reader.result;
    overlayImage.style.transform = 'translate(0px, 0px) scale(1)';
    overlayScale = 1;
    overlayX = 0;
    overlayY = 0;
  };
  if (file) {
    reader.readAsDataURL(file);
  }
});

// ピンチ操作のイベントリスナー
overlayImage.addEventListener('touchstart', handleTouchStart, false);
overlayImage.addEventListener('touchmove', handleTouchMove, false);
overlayImage.addEventListener('touchend', handleTouchEnd, false);

// ドラッグ操作のイベントリスナー
overlayImage.addEventListener('touchstart', handleDragStart, false);
overlayImage.addEventListener('touchmove', handleDragMove, false);
overlayImage.addEventListener('touchend', handleDragEnd, false);

// ピンチ操作の開始
function handleTouchStart(event) {
  if (event.touches.length === 2) {
    event.preventDefault();
    overlayStartDistance = getDistance(event.touches[0], event.touches[1]);
  }
}

// ピンチ操作の移動
function handleTouchMove(event) {
  if (event.touches.length === 2) {
    event.preventDefault();
    const distance = getDistance(event.touches[0], event.touches[1]);
    const scale = distance / overlayStartDistance;
    overlayScale *= scale;
    overlayImage.style.transform = `translate(${overlayX}px, ${overlayY}px) scale(${overlayScale})`;
    overlayStartDistance = distance;
  }
}

// ピンチ操作の終了
function handleTouchEnd(event) {
  if (event.touches.length === 0) {
    overlayStartDistance = 0;
  }
}

// ドラッグ操作の開始
function handleDragStart(event) {
  if (event.touches.length === 1) {
    isDragging = true;
    startX = event.touches[0].clientX - overlayX;
    startY = event.touches[0].clientY - overlayY;
  }
}

// ドラッグ操作の移動
function handleDragMove(event) {
  if (isDragging && event.touches.length === 1) {
    event.preventDefault();
    overlayX = event.touches[0].clientX - startX;
    overlayY = event.touches[0].clientY - startY;
    overlayImage.style.transform = `translate(${overlayX}px, ${overlayY}px) scale(${overlayScale})`;
  }
}

// ドラッグ操作の終了
function handleDragEnd(event) {
  isDragging = false;
}

// 2点間の距離を計算
function getDistance(touch1, touch2) {
  const x = touch1.clientX - touch2.clientX;
  const y = touch1.clientY - touch2.clientY;
  return Math.sqrt(x * x + y * y);
}

// タブを閉じる
closeTabBtn.addEventListener('click', () => {
  window.close();
});

// オーバーレイ画像を切り替える
rotateLink.addEventListener('click', (event) => {
  event.preventDefault(); // リンクの動作をキャンセル
  currentOverlayIndex = (currentOverlayIndex + 1) % overlays.length;
  overlayImage.src = overlays[currentOverlayIndex];
});
