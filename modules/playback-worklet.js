class PlaybackWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.playing = false;

    this.port.onmessage = (event) => {
      if (event.data.type === 'buffer') {
        this.buffer.push(...event.data.data);
        this.playing = true;
      } else if (event.data.type === 'stop') {
        this.buffer = [];
        this.playing = false;
      }
    };
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];

    if (!this.playing || this.buffer.length === 0) {
      return true;
    }

    for (let channel = 0; channel < output.length; channel++) {
      const outputChannel = output[channel];
      for (let i = 0; i < outputChannel.length; i++) {
        if (this.buffer.length > 0) {
          outputChannel[i] = this.buffer.shift();
        } else {
          outputChannel[i] = 0;
          this.playing = false;
        }
      }
    }

    return true;
  }
}

registerProcessor('playback-worklet', PlaybackWorkletProcessor);
