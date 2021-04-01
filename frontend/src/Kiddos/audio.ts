// let processed_audio = [];
// let f0 = [];
// let f0_std_hz = [];

export class AudioCapture {
    private context: any;
    private processor: any;
    private signal: any[] = [];

    constructor(
        private readonly socketId: string,
        private readonly postUrl = 'http://localhost:5000/json_upload'
        // private fs = -1,
        // private receivedAudio = false,
    ) {}

    public tryAudioCapture() {
        // @ts-ignore
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext({sampleRate: 16000});
        console.log(`Sampling Rate is:${this.context.sampleRate}`)
        // Script processor buffer size must be one of these:
        // 256, 512, 1024, 2048, 4096, 8192, 16384. If 0, it's auto selected

        this.processor = this.context.createScriptProcessor(16384, 1, 1);
        this.processor.connect(this.context.destination);

        let myConstraints = {
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
            },
            video: false
        }

        navigator.mediaDevices.getUserMedia(myConstraints)
            .then(this.handleSuccess.bind(this));
    }

    private handleSuccess (stream: any) {
        const input = this.context.createMediaStreamSource(stream);
        input.connect(this.processor);

        const classScope = this;
        // TODO replace with audioworker https://developer.mozilla.org/en-US/docs/Web/API/ScriptProcessorNode/onaudioprocess
        this.processor.onaudioprocess = (e: { inputBuffer: { getChannelData: (arg0: number) => any; sampleRate: number; }; }) => {
            // This will be called multiple times per second.
            let audioSamples = e.inputBuffer.getChannelData(0);
            // this.fs = e.inputBuffer.sampleRate;
            // let sum = audioSamples.map(x => x*x).reduce((x, y) => x + y);
            // rms_range.value =  Math.max(rms_range.value, Math.sqrt(sum / audioSamples.length));
            // this.receivedAudio = true;
            classScope.signal.push(...Array.from(audioSamples))
            if (classScope.signal.length > 16000) {
                classScope.postSignal();
                classScope.signal = [];
            }
        }
    }

    // @ts-ignore
    private resampleTo16Khz(samples: any, sampleRate: number) {
        const interpolate = (sampleRate % 16000 !== 0);
        const multiplier = sampleRate / 16000;
        const original = samples;
        const subsamples = new Float32Array(1024);
        for (var i = 0; i < 1024; i++) {
            if (!interpolate) {
                subsamples[i] = original[i * multiplier];
            } else {
                // simplistic, linear resampling
                var left = Math.floor(i * multiplier);
                var right = left + 1;
                var p = i * multiplier - left;
                subsamples[i] = (1 - p) * original[left] + p * original[right];
            }
        }
        return subsamples;
    }

    private postSignal() {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("X-Request-ID", this.socketId);

        const raw = JSON.stringify(this.signal);
        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        fetch(this.postUrl, requestOptions)
            .then(response => response.text())
            .catch(error => console.log('error', error));
    }
}



