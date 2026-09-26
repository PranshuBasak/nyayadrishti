// Runs outside React on the audio rendering thread. No audio is persisted.
class PcmCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.sum = 0;
    this.samples = 0;
    this.phase = 0;
    this.buffer = new Int16Array(1600);
    this.offset = 0;
  }
  process(inputs) {
    const channel = inputs[0]?.[0];
    if (channel)
      for (const sample of channel) {
        this.sum += sample;
        this.samples++;
        this.phase += 16000;
        if (this.phase >= sampleRate) {
          const value = Math.max(-1, Math.min(1, this.sum / this.samples));
          this.buffer[this.offset++] = value * (value < 0 ? 32768 : 32767);
          this.phase -= sampleRate;
          this.sum = 0;
          this.samples = 0;
          if (this.offset === this.buffer.length) {
            this.port.postMessage(this.buffer.buffer, [this.buffer.buffer]);
            this.buffer = new Int16Array(1600);
            this.offset = 0;
          }
        }
      }
    return true;
  }
}
registerProcessor("pcm-capture", PcmCapture);
