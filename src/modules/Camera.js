export class Camera {
  constructor(videoElement) {
    this.video = videoElement;
  }

  async init() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Ваш браузер не поддерживает доступ к камере");
    }

    const constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user"
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = stream;
      
      // Ждем, пока видео начнет реально воспроизводиться
      return new Promise((resolve) => {
        this.video.onloadedmetadata = () => {
          this.video.play();
          resolve(this.video);
        };
      });
    } catch (err) {
      console.error("Ошибка при запуске камеры:", err);
      throw err;
    }
  }
}