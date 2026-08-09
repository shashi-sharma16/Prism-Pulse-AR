/**
 * SoundEngine - lightweight Web Audio API synth for reactive feedback tones.
 */
export class SoundEngine {
    constructor() {
        this.audioCtx = null;
        this.humOsc = null;
        this.humGain = null;
        this.masterGain = null;
        this.volume = 0.4; // 40% default volume
        this.ready = false;
    }

    /**
     * Boots the AudioContext and synth graph. Must run after a user gesture.
     */
    init() {
        if (this.ready) return;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContextClass();

            this.masterGain = this.audioCtx.createGain();
            this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
            this.masterGain.connect(this.audioCtx.destination);

            // Continuous proximity hum, driven by two-hand distance
            this.humOsc = this.audioCtx.createOscillator();
            this.humGain = this.audioCtx.createGain();

            this.humOsc.type = 'triangle';
            this.humOsc.frequency.setValueAtTime(80, this.audioCtx.currentTime);
            this.humGain.gain.setValueAtTime(0, this.audioCtx.currentTime);

            this.humOsc.connect(this.humGain);
            this.humGain.connect(this.masterGain);

            this.humOsc.start();
            this.ready = true;
            console.log("Prism Pulse sound engine ready");
        } catch (e) {
            console.error("Failed to start Web Audio API", e);
        }
    }

    async resume() {
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            await this.audioCtx.resume();
        }
    }

    /**
     * @param {number} value - Normalized volume between 0 and 1
     */
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        if (this.masterGain && this.audioCtx) {
            this.masterGain.gain.setTargetAtTime(this.volume, this.audioCtx.currentTime, 0.05);
        }
    }

    /**
     * Short synthetic pulse triggered on pinch events.
     */
    triggerPulse() {
        if (!this.ready || !this.audioCtx) return;
        this.resume();

        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(650, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(25, this.audioCtx.currentTime + 0.14);

        gainNode.gain.setValueAtTime(0.32, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.14);

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.17);
    }

    /**
     * Modulates the ambient hum based on the distance between both hands' index tips.
     * @param {Array} activeHands - Hand landmarks from MediaPipe
     */
    updateHum(activeHands) {
        if (!this.ready || !this.humGain || !this.audioCtx) return;
        this.resume();

        if (activeHands.length < 2) {
            this.humGain.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.15);
            return;
        }

        const p1 = activeHands[0][8];
        const p2 = activeHands[1][8];
        if (!p1 || !p2) return;

        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const proximity = Math.max(0, 1 - dist);

        // Pitch ramps from 70Hz up to 380Hz as hands get closer
        const targetFreq = 70 + (proximity * 310);
        const targetVolume = 0.015 + (proximity * 0.16);

        this.humOsc.frequency.setTargetAtTime(targetFreq, this.audioCtx.currentTime, 0.08);
        this.humGain.gain.setTargetAtTime(targetVolume, this.audioCtx.currentTime, 0.08);
    }
}