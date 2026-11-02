// Centralized Audio Engine with Automatic Sequenced Playback Queue
// When one SFX is playing and another is triggered, it cues up cleanly without overlapping audio.

export type AudioQueueItem = {
	id: string;
	title: string;
	audioUrl?: string;
	frequency?: number;
	type?: OscillatorType;
	durationSec?: number;
};

class SoundQueueManager {
	private currentItem: AudioQueueItem | null = null;
	private queue: AudioQueueItem[] = [];
	private currentAudioElement: HTMLAudioElement | null = null;
	private currentAudioTimeout: NodeJS.Timeout | null = null;

	public enqueue(item: AudioQueueItem): { status: "playing" | "queued"; position: number } {
		if (typeof window === "undefined") return { status: "playing", position: 0 };

		// If nothing is playing, play immediately
		if (!this.currentItem) {
			this.playItem(item);
			return { status: "playing", position: 0 };
		}

		// Prevent infinite queue buildup (cap at 12 items)
		if (this.queue.length >= 12) {
			return { status: "queued", position: this.queue.length };
		}

		this.queue.push(item);
		this.notifyState();
		return { status: "queued", position: this.queue.length };
	}

	private playItem(item: AudioQueueItem): void {
		this.currentItem = item;
		this.notifyState();

		const finishCurrent = () => {
			this.cleanupCurrent();
			this.currentItem = null;

			// Play next item in queue
			if (this.queue.length > 0) {
				const next = this.queue.shift()!;
				this.playItem(next);
			} else {
				this.notifyState();
			}
		};

		if (item.audioUrl) {
			try {
				const audio = new Audio(item.audioUrl);
				this.currentAudioElement = audio;

				audio.onended = () => {
					finishCurrent();
				};

				audio.onerror = () => {
					// Fallback to synth if audio file fails
					this.playSynthetic(item.frequency || 440, item.type || "sine", item.durationSec || 0.4, finishCurrent);
				};

				audio.play().catch(() => {
					this.playSynthetic(item.frequency || 440, item.type || "sine", item.durationSec || 0.4, finishCurrent);
				});
				return;
			} catch {
				// Fallback
			}
		}

		// Play synthetic Web Audio
		this.playSynthetic(item.frequency || 440, item.type || "sine", item.durationSec || 0.4, finishCurrent);
	}

	private playSynthetic(
		frequency = 440,
		type: OscillatorType = "sine",
		duration = 0.35,
		onComplete?: () => void
	): void {
		try {
			const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
			const ctx = new AudioCtx();
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();

			osc.type = type;
			osc.frequency.setValueAtTime(frequency, ctx.currentTime);

			if (type === "sawtooth") {
				osc.frequency.exponentialRampToValueAtTime(Math.max(60, frequency * 0.2), ctx.currentTime + duration);
			} else if (type === "square") {
				osc.frequency.setValueAtTime(frequency, ctx.currentTime);
				osc.frequency.setValueAtTime(frequency * 1.5, ctx.currentTime + 0.08);
			}

			gain.gain.setValueAtTime(0.25, ctx.currentTime);
			gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

			osc.connect(gain);
			gain.connect(ctx.destination);

			osc.start();
			osc.stop(ctx.currentTime + duration);

			this.currentAudioTimeout = setTimeout(() => {
				ctx.close().catch(() => {});
				if (onComplete) onComplete();
			}, duration * 1000 + 50);
		} catch {
			if (onComplete) onComplete();
		}
	}

	public skipCurrent(): void {
		this.cleanupCurrent();
		this.currentItem = null;
		if (this.queue.length > 0) {
			const next = this.queue.shift()!;
			this.playItem(next);
		} else {
			this.notifyState();
		}
	}

	public clearQueue(): void {
		this.cleanupCurrent();
		this.currentItem = null;
		this.queue = [];
		this.notifyState();
	}

	private cleanupCurrent(): void {
		if (this.currentAudioElement) {
			this.currentAudioElement.pause();
			this.currentAudioElement = null;
		}
		if (this.currentAudioTimeout) {
			clearTimeout(this.currentAudioTimeout);
			this.currentAudioTimeout = null;
		}
	}

	public getState() {
		return {
			current: this.currentItem,
			queue: [...this.queue],
			count: this.queue.length + (this.currentItem ? 1 : 0),
		};
	}

	private notifyState(): void {
		if (typeof window === "undefined") return;
		window.dispatchEvent(
			new CustomEvent("echodeck_queue_updated", {
				detail: this.getState(),
			})
		);
	}
}

export const soundQueue = new SoundQueueManager();

// Synthesizes punchy SFX directly (stand-alone single shot)
export function playSyntheticSfx(frequency = 440, type: OscillatorType = "sine", duration = 0.3) {
	if (typeof window === "undefined") return;
	try {
		const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
		const ctx = new AudioCtx();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.type = type;
		osc.frequency.setValueAtTime(frequency, ctx.currentTime);

		if (type === "sawtooth") {
			osc.frequency.exponentialRampToValueAtTime(Math.max(60, frequency * 0.2), ctx.currentTime + duration);
		} else if (type === "square") {
			osc.frequency.setValueAtTime(frequency, ctx.currentTime);
			osc.frequency.setValueAtTime(frequency * 1.5, ctx.currentTime + 0.08);
		}

		gain.gain.setValueAtTime(0.25, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

		osc.connect(gain);
		gain.connect(ctx.destination);

		osc.start();
		osc.stop(ctx.currentTime + duration);
		setTimeout(() => ctx.close().catch(() => {}), duration * 1000 + 50);
	} catch {}
}

// Queue-aware broadcast audio player: cues up if another sound is already active!
export function playBroadcastSfx(
	audioUrl?: string,
	frequency = 440,
	type: OscillatorType = "sine",
	duration = 0.3,
	title = "Sound Effect",
	soundId?: string
) {
	return soundQueue.enqueue({
		id: soundId || `sfx-${Date.now()}-${Math.random()}`,
		title,
		audioUrl,
		frequency,
		type,
		durationSec: duration,
	});
}
