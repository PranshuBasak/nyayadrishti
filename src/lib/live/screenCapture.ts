export class ScreenCaptureManager {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  public async startScreenShare(videoEl: HTMLVideoElement): Promise<boolean> {
    try {
      this.videoElement = videoEl;
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
      });
      videoEl.srcObject = this.stream;
      await videoEl.play();
      return true;
    } catch (err) {
      console.error("Screen share error:", err);
      return false;
    }
  }

  public captureScreenFrame(): string | null {
    if (!this.videoElement || !this.stream) return null;
    const canvas = document.createElement("canvas");
    canvas.width = this.videoElement.videoWidth || 1280;
    canvas.height = this.videoElement.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  }

  public stopScreenShare() {
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
