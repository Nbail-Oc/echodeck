const fs = require('fs');
const path = require('path');

const bruhBase64 = fs.readFileSync(path.join(__dirname, '../public/sfx/sfx-funny-1.mp3')).toString('base64');
const reverbBase64 = fs.readFileSync(path.join(__dirname, '../public/sfx/fart-with-reverb.mp3')).toString('base64');

// 1. Strict CSP Compliant HTML (Zero inline script, zero onclick attributes)
const html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>EchoDeck Twitch Extension Panel</title>
	<!-- Official Twitch Extension JS Helper -->
	<script src="https://extension-files.twitch.tv/helper/v1/twitch-ext.min.js"></script>
	<style>
		* {
			box-sizing: border-box;
			margin: 0;
			padding: 0;
			user-select: none;
		}

		body {
			background-color: #0e0e10;
			color: #efeff1;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
			width: 318px;
			min-height: 420px;
			padding: 12px;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			border: 2px solid #FACC15;
			border-radius: 8px;
		}

		.header {
			border-bottom: 1px solid #27272a;
			padding-bottom: 8px;
		}

		.title-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		.brand {
			display: flex;
			align-items: center;
			gap: 6px;
			font-size: 13px;
			font-weight: 700;
			text-transform: uppercase;
			color: #FACC15;
			letter-spacing: 0.5px;
		}

		.icon-badge {
			background: #FACC15;
			color: #000000;
			width: 22px;
			height: 22px;
			border-radius: 6px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 13px;
			font-weight: 900;
		}

		.live-badge {
			display: flex;
			align-items: center;
			gap: 4px;
			font-size: 10px;
			font-weight: 800;
			color: #000000;
			background: #FACC15;
			padding: 2px 7px;
			border-radius: 10px;
		}

		.subtitle {
			font-size: 11px;
			color: #a1a1aa;
			margin-top: 4px;
			line-height: 1.3;
		}

		.sound-box {
			background: #18181b;
			border: 1px solid #3f3f46;
			border-radius: 10px;
			padding: 12px;
			margin: 8px 0;
			display: flex;
			align-items: center;
			justify-content: space-between;
			cursor: pointer;
			transition: all 0.15s ease;
		}

		.sound-box:hover {
			border-color: #FACC15;
			background: #27272a;
			transform: translateY(-2px);
			box-shadow: 0 4px 14px rgba(250, 204, 21, 0.25);
		}

		.sound-box:active {
			transform: scale(0.97);
		}

		.sound-info {
			display: flex;
			align-items: center;
			gap: 10px;
			pointer-events: none;
		}

		.sound-icon {
			width: 38px;
			height: 38px;
			background: #27272a;
			border: 1px solid #52525b;
			border-radius: 8px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 18px;
		}

		.sound-text h4 {
			font-size: 13px;
			font-weight: 700;
			color: #ffffff;
		}

		.sound-text span {
			font-size: 10px;
			color: #FACC15;
			background: rgba(250, 204, 21, 0.1);
			padding: 1px 6px;
			border-radius: 4px;
			margin-top: 2px;
			display: inline-block;
			font-weight: 600;
		}

		.play-btn {
			background: #FACC15;
			color: #000000;
			border: none;
			padding: 6px 14px;
			border-radius: 6px;
			font-size: 11px;
			font-weight: 800;
			cursor: pointer;
			transition: all 0.15s ease;
		}

		.play-btn:active {
			transform: scale(0.95);
		}

		.footer {
			border-top: 1px solid #27272a;
			padding-top: 8px;
			margin-top: 4px;
		}

		.vol-row {
			display: flex;
			justify-content: space-between;
			font-size: 11px;
			color: #a1a1aa;
			margin-bottom: 4px;
		}

		input[type=range] {
			width: 100%;
			accent-color: #FACC15;
			cursor: pointer;
		}

		.debug-box {
			background: #111113;
			border: 1px solid #27272a;
			border-radius: 6px;
			padding: 6px 8px;
			margin-top: 6px;
			font-family: monospace;
			font-size: 10px;
			color: #FACC15;
			min-height: 36px;
			display: flex;
			flex-direction: column;
			gap: 2px;
		}

		.test-row {
			display: flex;
			gap: 6px;
			margin-top: 6px;
		}

		.test-btn {
			flex: 1;
			background: #27272a;
			color: #ffffff;
			border: 1px solid #3f3f46;
			border-radius: 4px;
			padding: 5px;
			font-size: 10px;
			cursor: pointer;
			font-weight: 600;
		}

		.test-btn:hover {
			background: #3f3f46;
			border-color: #FACC15;
		}
	</style>
</head>
<body>
	<!-- Real Audio DOM Elements with Data URIs -->
	<audio id="audio-bruh" preload="auto" src="data:audio/mp3;base64,${bruhBase64}"></audio>
	<audio id="audio-reverb" preload="auto" src="data:audio/mp3;base64,${reverbBase64}"></audio>

	<div class="header">
		<div class="title-row">
			<div class="brand">
				<div class="icon-badge">⚡</div>
				<span>ECHODECK AUDIO</span>
			</div>
			<div class="live-badge">CSP SAFE</div>
		</div>
		<p class="subtitle">Click any sound box below to test audio.</p>
	</div>

	<!-- Box 1: Bruh Sound -->
	<div class="sound-box" id="box-bruh">
		<div class="sound-info">
			<div class="sound-icon">🔊</div>
			<div class="sound-text">
				<h4>Bruh Sound #2</h4>
				<span>Instant Meme SFX</span>
			</div>
		</div>
		<button class="play-btn" id="btn-bruh">Play</button>
	</div>

	<!-- Box 2: Fart Reverb -->
	<div class="sound-box" id="box-reverb">
		<div class="sound-info">
			<div class="sound-icon">💨</div>
			<div class="sound-text">
				<h4>Fart Reverb</h4>
				<span>Bass Boosted SFX</span>
			</div>
		</div>
		<button class="play-btn" id="btn-reverb">Play</button>
	</div>

	<!-- Direct Tone Synth Test -->
	<div class="test-row">
		<button class="test-btn" id="btn-synth-440">🔊 Test 440Hz Tone</button>
		<button class="test-btn" id="btn-synth-880">🔊 Test 880Hz Tone</button>
	</div>

	<div class="footer">
		<div class="vol-row">
			<span>Extension Volume</span>
			<span id="vol-label">100%</span>
		</div>
		<input type="range" id="vol-slider" min="0" max="1" step="0.05" value="1.0">
		
		<div class="debug-box" id="debug-box">
			<div id="dbg-status">Status: CSP Safe Engine Ready</div>
			<div id="dbg-clicks">Clicks: 0 | Output: Standing by</div>
		</div>
	</div>

	<!-- External script to comply with Twitch CSP (bans inline scripts/onclick) -->
	<script src="panel.js"></script>
</body>
</html>
`;

// 2. Strict CSP Compliant External JavaScript File
const js = `
let volume = 1.0;
let clickCount = 0;
let audioCtx = null;

function getAudioContext() {
	if (!audioCtx) {
		const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
		if (AudioCtxClass) {
			audioCtx = new AudioCtxClass();
		}
	}
	if (audioCtx && audioCtx.state === 'suspended') {
		audioCtx.resume();
	}
	return audioCtx;
}

function log(msg, detail) {
	const statusEl = document.getElementById('dbg-status');
	const clicksEl = document.getElementById('dbg-clicks');
	if (statusEl) statusEl.textContent = 'Status: ' + msg;
	if (clicksEl && detail) clicksEl.textContent = detail;
}

function updateVolume(val) {
	volume = parseFloat(val);
	const volLabel = document.getElementById('vol-label');
	if (volLabel) volLabel.textContent = Math.round(volume * 100) + '%';
	const audio1 = document.getElementById('audio-bruh');
	const audio2 = document.getElementById('audio-reverb');
	if (audio1) audio1.volume = volume;
	if (audio2) audio2.volume = volume;
}

function testSynth(freq) {
	clickCount++;
	try {
		const ctx = getAudioContext();
		if (!ctx) {
			log('Web Audio not supported in this browser');
			return;
		}
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = 'sine';
		osc.frequency.setValueAtTime(freq, ctx.currentTime);
		gain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start();
		osc.stop(ctx.currentTime + 0.4);
		log('Playing ' + freq + 'Hz Tone!', 'Clicks: ' + clickCount + ' | Synth Active');
	} catch (e) {
		log('Synth error: ' + e.message, 'Clicks: ' + clickCount);
	}
}

function handlePlay(id) {
	clickCount++;
	const btn = document.getElementById('btn-' + id);
	if (btn) {
		btn.textContent = 'Playing...';
		btn.style.background = '#ffffff';
	}

	getAudioContext();

	const el = document.getElementById('audio-' + id);
	if (el) {
		el.currentTime = 0;
		el.volume = volume;
		const playPromise = el.play();

		if (playPromise !== undefined) {
			playPromise.then(() => {
				log('🔊 Playing ' + id.toUpperCase() + '!', 'Clicks: ' + clickCount + ' | Audio playing');
			}).catch((err) => {
				log('Audio play error: ' + err.message, 'Clicks: ' + clickCount);
				// Fallback to synth
				testSynth(id === 'bruh' ? 220 : 150);
			});
		}
	} else {
		log('Audio element #' + id + ' not found', 'Clicks: ' + clickCount);
		testSynth(300);
	}

	setTimeout(() => {
		if (btn) {
			btn.textContent = 'Play';
			btn.style.background = '#FACC15';
		}
	}, 600);
}

// Attach all event listeners dynamically via DOM (Twitch CSP compliant!)
document.addEventListener('DOMContentLoaded', () => {
	log('Loaded & CSP compliant! Click any button.', 'Clicks: 0 | Standing by');

	// Attach to Sound Boxes and Buttons
	const boxBruh = document.getElementById('box-bruh');
	const btnBruh = document.getElementById('btn-bruh');
	if (boxBruh) boxBruh.addEventListener('click', () => handlePlay('bruh'));
	if (btnBruh) btnBruh.addEventListener('click', (e) => { e.stopPropagation(); handlePlay('bruh'); });

	const boxReverb = document.getElementById('box-reverb');
	const btnReverb = document.getElementById('btn-reverb');
	if (boxReverb) boxReverb.addEventListener('click', () => handlePlay('reverb'));
	if (btnReverb) btnReverb.addEventListener('click', (e) => { e.stopPropagation(); handlePlay('reverb'); });

	// Synth Buttons
	const btnSynth440 = document.getElementById('btn-synth-440');
	if (btnSynth440) btnSynth440.addEventListener('click', () => testSynth(440));

	const btnSynth880 = document.getElementById('btn-synth-880');
	if (btnSynth880) btnSynth880.addEventListener('click', () => testSynth(880));

	// Volume Slider
	const volSlider = document.getElementById('vol-slider');
	if (volSlider) volSlider.addEventListener('input', (e) => updateVolume(e.target.value));

	// Twitch Extension SDK Auth
	if (window.Twitch && window.Twitch.ext) {
		window.Twitch.ext.onAuthorized((auth) => {
			log('Twitch Authorized (Channel: ' + auth.channelId + ')');
		});
	}
});
`;

fs.writeFileSync(path.join(__dirname, '../public/panel.html'), html, 'utf8');
fs.writeFileSync(path.join(__dirname, '../public/extension/panel.html'), html, 'utf8');
fs.writeFileSync(path.join(__dirname, '../public/panel.js'), js, 'utf8');
fs.writeFileSync(path.join(__dirname, '../public/extension/panel.js'), js, 'utf8');

console.log('Successfully wrote CSP-safe panel.html and panel.js');
