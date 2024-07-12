// 既存の変数宣言
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
const shareBtn = document.getElementById('share-btn');

// 既存のコード（オーバーレイ、カメラ初期化など）はそのまま維持

// 写真の撮影
captureBtn.addEventListener('click', () => {
  // 既存のキャプチャコード

  // プレビューの表示
  previewContainer.style.display = 'flex';
  shutterSound.play();
});

// プレビューを閉じる
closeBtn.addEventListener('click', () => {
  previewContainer.style.display = 'none';
});

// シェア機能
shareBtn.addEventListener('click', () => {
  // キャンバスから画像データを取得
  const imageData = canvas.toDataURL('image/png');

  // Web Share APIをサポートしているか確認
  if (navigator.share) {
    fetch(imageData)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'photo.png', { type: 'image/png' });
        navigator.share({
          files: [file],
          title: '撮影した写真',
          text: 'チェキで撮影した写真をシェアします！'
        }).then(() => {
          console.log('共有に成功しました。');
        }).catch((error) => {
          console.log('共有に失敗しました', error);
        });
      });
  } else {
    // Web Share APIがサポートされていない場合の代替処理
    // 例: URLをクリップボードにコピー
    const dummyElement = document.createElement('textarea');
    document.body.appendChild(dummyElement);
    dummyElement.value = imageData;
    dummyElement.select();
    document.execCommand('copy');
    document.body.removeChild(dummyElement);
    alert('画像のURLをクリップボードにコピーしました。SNSに貼り付けてシェアできます。');
  }
});

// 既存のコード（タブを閉じる、オーバーレイ画像を切り替えるなど）
