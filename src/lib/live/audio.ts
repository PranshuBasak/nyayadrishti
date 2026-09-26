export function pcmBase64(buffer: ArrayBuffer) {
  const pcm = new Int16Array(buffer),
    bytes = new Uint8Array(pcm.length * 2),
    view = new DataView(bytes.buffer);
  for (let i = 0; i < pcm.length; i++) view.setInt16(i * 2, pcm[i], true);
  let binary = "";
  for (const byte of Array.from(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary);
}
export class LiveAudio {
  private input?: AudioContext;
  private output = new AudioContext({ sampleRate: 24000 });
  private stream?: MediaStream;
  private worklet?: AudioWorkletNode;
  private source?: MediaStreamAudioSourceNode;
  private nodes = new Set<AudioBufferSourceNode>();
  private next = 0;
  private closed = false;
  private muted = false;
  async prepare() {
    await this.output.resume();
  }
  async capture(send: (data: string) => void) {
    const acquisition = navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    void acquisition
      .then((stream) => {
        if (this.closed) stream.getTracks().forEach((t) => t.stop());
      })
      .catch(() => {});
    let permissionTimer: ReturnType<typeof setTimeout>;
    const stream = await Promise.race([
      acquisition,
      new Promise<MediaStream>((_, reject) => {
        permissionTimer = setTimeout(
          () =>
            reject(
              new DOMException(
                "Microphone permission unavailable",
                "NotAllowedError",
              ),
            ),
          15000,
        );
      }),
    ]).finally(() => clearTimeout(permissionTimer));
    if (this.closed) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }
    this.stream = stream;
    const ctx = (this.input = new AudioContext());
    await ctx.audioWorklet.addModule("/pcm-capture.js");
    if (this.closed) return;
    this.worklet = new AudioWorkletNode(ctx, "pcm-capture");
    this.worklet.port.onmessage = (e) => {
      if (!this.closed && !this.muted) send(pcmBase64(e.data));
    };
    this.source = ctx.createMediaStreamSource(stream);
    this.source.connect(this.worklet);
    const muteOutput = ctx.createGain();
    muteOutput.gain.value = 0;
    this.worklet.connect(muteOutput);
    muteOutput.connect(ctx.destination);
    await ctx.resume();
  }
  mute(value: boolean) {
    this.muted = value;
    this.stream?.getAudioTracks().forEach((track) => {
      track.enabled = !value;
    });
  }
  play(data: string) {
    if (this.closed) return;
    const raw = atob(data),
      bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0)),
      view = new DataView(bytes.buffer);
    const buffer = this.output.createBuffer(1, bytes.length / 2, 24000),
      channel = buffer.getChannelData(0);
    for (let i = 0; i < channel.length; i++)
      channel[i] = view.getInt16(i * 2, true) / 32768;
    const source = this.output.createBufferSource();
    source.buffer = buffer;
    source.connect(this.output.destination);
    source.onended = () => {
      this.nodes.delete(source);
      source.disconnect();
    };
    this.nodes.add(source);
    this.next = Math.max(this.output.currentTime, this.next);
    source.start(this.next);
    this.next += buffer.duration;
  }
  interrupt() {
    for (const node of Array.from(this.nodes)) {
      try {
        node.stop();
        node.disconnect();
      } catch {}
    }
    this.nodes.clear();
    this.next = 0;
  }
  close() {
    if (this.closed) return;
    this.closed = true;
    this.interrupt();
    this.stream?.getTracks().forEach((t) => t.stop());
    this.source?.disconnect();
    this.worklet?.disconnect();
    if (this.worklet) this.worklet.port.onmessage = null;
    void this.input?.close().catch(() => {});
    void this.output.close().catch(() => {});
  }
}
