export class CameraManager {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  public async startCamera(videoEl: HTMLVideoElement): Promise<boolean> {
    try {
      this.videoElement = videoEl;
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      videoEl.srcObject = this.stream;
      await videoEl.play();
      return true;
    } catch (err) {
      console.error("Camera access error:", err);
      return false;
    }
  }

  public captureFrame(): string | null {
    if (!this.videoElement || !this.stream) return null;
    const canvas = document.createElement("canvas");
    canvas.width = this.videoElement.videoWidth || 640;
    canvas.height = this.videoElement.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  }

  public stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }
}
