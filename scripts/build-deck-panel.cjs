const fs = require('fs');
const path = require('path');

// Read SFX files to embed
function getB64(filename) {
	try {
		return fs.readFileSync(path.join(__dirname, '../public/sfx', filename)).toString('base64');
	} catch (e) {
		console.warn('Could not read SFX:', filename, e.message);
		return '';
	}
}

const sounds = [
	{
		id: 'bruh',
		name: 'Bruh Sound #2',
		tag: 'Meme Classic',
		icon: '🔊',
		key: '1',
		color: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
		origB64: getB64('sfx-funny-1.mp3'),
		takeB64: getB64('fart-with-reverb.mp3'), // Alternate streamer mimic take!
		hasTake: true,
	},
	{
		id: 'reverb',
		name: 'Fart Reverb',
		tag: 'Bass Boosted',
		icon: '💨',
		key: '2',
		color: 'linear-gradient(135deg, #ec4899, #be185d)',
		origB64: getB64('fart-with-reverb.mp3'),
		takeB64: getB64('sfx-funny-1.mp3'),
		hasTake: true,
	},
	{
		id: 'vineboom',
		name: 'Vine Boom',
		tag: 'Impact SFX',
		icon: '💥',
		key: '3',
		color: 'linear-gradient(135deg, #f59e0b, #d97706)',
		origB64: getB64('vine-boom.mp3'),
		hasTake: false,
	},
	{
		id: 'wow',
		name: 'Anime Wow',
		tag: 'Reaction',
		icon: '✨',
		key: '4',
		color: 'linear-gradient(135deg, #06b6d4, #0284c7)',
		origB64: getB64('anime-wow-sound-effect.mp3'),
		hasTake: false,
	},
	{
		id: 'hurt',
		name: 'Classic Oof',
		tag: 'Damage SFX',
		icon: '🤕',
		key: '5',
		color: 'linear-gradient(135deg, #ef4444, #b91c1c)',
		origB64: getB64('classic_hurt.mp3'),
		hasTake: false,
	},
	{
		id: 'oneup',
		name: 'Retro 1-Up',
		tag: 'Gaming SFX',
		icon: '🍄',
		key: '6',
		color: 'linear-gradient(135deg, #10b981, #047857)',
		origB64: getB64('1up.mp3'),
		hasTake: false,
	},
];

console.log('Loaded sounds count:', sounds.length);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>EchoDeck Viewer Soundboard</title>
	<script src="https://extension-files.twitch.tv/helper/v1/twitch-ext.min.js"></script>
	<style>
		* {
			box-sizing: border-box;
			margin: 0;
			padding: 0;
			user-select: none;
			-webkit-tap-highlight-color: transparent;
		}

		body {
			background-color: #0e0e10;
			color: #efeff1;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
			width: 318px;
			min-height: 480px;
			padding: 10px;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			border: 1px solid #26262c;
			border-radius: 12px;
			transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
			overflow-x: hidden;
		}

		/* THEME: MINIMAL VIEW (Obsidian Streamer Style) */
		body.theme-minimal {
			background-color: #141416;
			border-color: #27272a;
			box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
		}

		/* THEME: LIQUID GLASS VIEW */
		body.theme-glass {
			background: linear-gradient(135deg, rgba(20, 20, 28, 0.92), rgba(12, 12, 18, 0.96)), radial-gradient(circle at top right, rgba(145, 70, 255, 0.18), transparent 70%);
			backdrop-filter: blur(20px);
			-webkit-backdrop-filter: blur(20px);
			border: 1px solid rgba(255, 255, 255, 0.14);
			box-shadow: 0 12px 40px rgba(145, 70, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
		}

		/* Header */
		.header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding-bottom: 8px;
			border-bottom: 1px solid #27272a;
		}

		body.theme-glass .header {
			border-bottom-color: rgba(255, 255, 255, 0.1);
		}

		.brand-row {
			display: flex;
			align-items: center;
			gap: 6px;
		}

		.logo-pill {
			background: #9146FF;
			color: #ffffff;
			width: 22px;
			height: 22px;
			border-radius: 6px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 11px;
			font-weight: 900;
			box-shadow: 0 2px 6px rgba(145, 70, 255, 0.4);
		}

		.brand-name {
			font-size: 12px;
			font-weight: 800;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			color: #ffffff;
		}

		.live-indicator {
			display: flex;
			align-items: center;
			gap: 4px;
			font-size: 9px;
			font-weight: 800;
			color: #00f593;
			background: rgba(0, 245, 147, 0.1);
			padding: 2px 6px;
			border-radius: 10px;
			border: 1px solid rgba(0, 245, 147, 0.25);
		}

		.live-dot {
			width: 5px;
			height: 5px;
			background: #00f593;
			border-radius: 50%;
			animation: pulseDot 1.5s infinite;
		}

		@keyframes pulseDot {
			0%, 100% { opacity: 1; transform: scale(1); }
			50% { opacity: 0.4; transform: scale(0.85); }
		}

		/* Mode Switcher */
		.mode-toggle {
			display: flex;
			align-items: center;
			background: #1f1f23;
			border: 1px solid #2f2f35;
			border-radius: 16px;
			padding: 2px;
			gap: 2px;
		}

		body.theme-glass .mode-toggle {
			background: rgba(0, 0, 0, 0.4);
			border-color: rgba(255, 255, 255, 0.12);
		}

		.mode-btn {
			border: none;
			background: transparent;
			color: #adadb8;
			font-size: 10px;
			font-weight: 700;
			padding: 3px 8px;
			border-radius: 12px;
			cursor: pointer;
			transition: all 0.2s ease;
		}

		.mode-btn.active {
			background: #9146FF;
			color: #ffffff;
			box-shadow: 0 2px 6px rgba(145, 70, 255, 0.35);
		}

		/* Rate Limit Banner */
		.rate-banner {
			display: flex;
			align-items: center;
			justify-content: space-between;
			background: #18181b;
			border: 1px solid #27272a;
			border-radius: 8px;
			padding: 6px 10px;
			margin: 8px 0;
			font-size: 10px;
		}

		body.theme-glass .rate-banner {
			background: rgba(255, 255, 255, 0.04);
			border-color: rgba(255, 255, 255, 0.08);
		}

		.rate-label {
			color: #adadb8;
			display: flex;
			align-items: center;
			gap: 4px;
		}

		.rate-status {
			color: #bf94ff;
			font-weight: 700;
		}

		.rate-cooldown-bar {
			height: 2px;
			width: 100%;
			background: #27272a;
			border-radius: 2px;
			margin-top: 4px;
			overflow: hidden;
			display: none;
		}

		.rate-cooldown-progress {
			height: 100%;
			width: 100%;
			background: #9146FF;
			transition: width 0.1s linear;
		}

		/* 2-COLUMN BUZZER GRID (Matches Streamer Deck Design) */
		.deck-grid {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 8px;
			margin: 4px 0 8px 0;
		}

		.buzzer-card {
			background: #18181b;
			border: 1px solid #27272a;
			border-radius: 12px;
			padding: 8px;
			display: flex;
			flex-direction: column;
			align-items: center;
			text-align: center;
			position: relative;
			cursor: pointer;
			transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
		}

		body.theme-minimal .buzzer-card:hover {
			border-color: #9146FF;
			background: #202024;
			transform: translateY(-2px);
			box-shadow: 0 4px 12px rgba(145, 70, 255, 0.18);
		}

		body.theme-glass .buzzer-card {
			background: rgba(255, 255, 255, 0.04);
			border: 1px solid rgba(255, 255, 255, 0.08);
			backdrop-filter: blur(8px);
		}

		body.theme-glass .buzzer-card:hover {
			background: rgba(255, 255, 255, 0.08);
			border-color: rgba(145, 70, 255, 0.6);
			transform: translateY(-2px);
			box-shadow: 0 6px 16px rgba(145, 70, 255, 0.25);
		}

		.buzzer-card:active {
			transform: scale(0.95);
		}

		.buzzer-card.playing {
			border-color: #00f593 !important;
			box-shadow: 0 0 16px rgba(0, 245, 147, 0.4) !important;
		}

		.buzzer-card.cooling {
			opacity: 0.6;
			pointer-events: none;
		}

		/* Buzzer Button Circle */
		.buzzer-circle {
			width: 44px;
			height: 44px;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 20px;
			margin-bottom: 6px;
			box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4), inset 0 2px 3px rgba(255, 255, 255, 0.25);
			position: relative;
			transition: all 0.15s ease;
		}

		.hotkey-badge {
			position: absolute;
			top: -3px;
			right: -3px;
			background: #0e0e10;
			border: 1px solid #3f3f46;
			color: #a1a1aa;
			font-size: 8px;
			font-weight: 800;
			width: 14px;
			height: 14px;
			border-radius: 4px;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.sound-title {
			font-size: 11px;
			font-weight: 700;
			color: #ffffff;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			max-width: 120px;
		}

		.sound-tag {
			font-size: 9px;
			color: #71717a;
			margin-top: 1px;
		}

		/* Version Selector Toggle (Orig vs Take) */
		.version-pill {
			display: flex;
			align-items: center;
			background: #121214;
			border: 1px solid #27272a;
			border-radius: 10px;
			padding: 1px;
			margin-top: 5px;
			gap: 1px;
			width: 100%;
			justify-content: center;
		}

		.version-opt {
			border: none;
			background: transparent;
			color: #71717a;
			font-size: 8px;
			font-weight: 700;
			padding: 2px 6px;
			border-radius: 8px;
			cursor: pointer;
			transition: all 0.12s ease;
		}

		.version-opt.selected {
			background: #9146FF;
			color: #ffffff;
		}

		/* Bottom Controls */
		.footer {
			border-top: 1px solid #27272a;
			padding-top: 8px;
		}

		body.theme-glass .footer {
			border-top-color: rgba(255, 255, 255, 0.08);
		}

		.vol-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			font-size: 10px;
			color: #a1a1aa;
			margin-bottom: 4px;
		}

		.vol-left {
			display: flex;
			align-items: center;
			gap: 6px;
		}

		.mute-btn {
			background: transparent;
			border: none;
			color: #a1a1aa;
			cursor: pointer;
			font-size: 12px;
		}

		.mute-btn:hover {
			color: #ffffff;
		}

		input[type=range] {
			width: 100%;
			accent-color: #9146FF;
			cursor: pointer;
			height: 4px;
		}

		.status-bar {
			text-align: center;
			font-size: 10px;
			color: #bf94ff;
			font-weight: 700;
			margin-top: 6px;
			min-height: 14px;
		}
	</style>
</head>
<body class="theme-minimal" id="body-root">

	<!-- Header with Brand & Minimal / Glass Mode Switcher -->
	<div class="header">
		<div class="brand-row">
			<div class="logo-pill">⚡</div>
			<span class="brand-name">EchoDeck</span>
			<div class="live-indicator">
				<div class="live-dot"></div>
				<span>DECK</span>
			</div>
		</div>

		<!-- View Switcher: Minimal vs Glass -->
		<div class="mode-toggle">
			<button class="mode-btn active" id="btn-theme-minimal">🎛️ Minimal</button>
			<button class="mode-btn" id="btn-theme-glass">✨ Glass</button>
		</div>
	</div>

	<!-- Rate Limit / Cooldown Status Banner -->
	<div class="rate-banner">
		<div class="rate-label">
			<span>⏱️ Viewer Cooldown</span>
		</div>
		<div class="rate-status" id="rate-text">Ready to Play</div>
	</div>
	<div class="rate-cooldown-bar" id="cooldown-bar">
		<div class="rate-cooldown-progress" id="cooldown-progress"></div>
	</div>

	<!-- 2-COLUMN BUZZER GRID (Vertical fit for Twitch Panels) -->
	<div class="deck-grid" id="deck-grid">
		<!-- Injected dynamically by panel.js -->
	</div>

	<!-- Footer with Twitch Compliant Audio Volume & Status -->
	<div class="footer">
		<div class="vol-row">
			<div class="vol-left">
				<button class="mute-btn" id="btn-mute" title="Toggle Mute">🔊</button>
				<span>Viewer Volume</span>
			</div>
			<span id="vol-label">80%</span>
		</div>
		<input type="range" id="vol-slider" min="0" max="1" step="0.05" value="0.8">
		<div class="status-bar" id="status-bar">Tap any buzzer to request sound</div>
	</div>

	<!-- CSP Compliant External JavaScript -->
	<script src="panel.js"></script>
</body>
</html>
`;

// Script building panel.js
const soundsJson = JSON.stringify(sounds.map(s => ({
	id: s.id,
	name: s.name,
	tag: s.tag,
	icon: s.icon,
	key: s.key,
	color: s.color,
	hasTake: s.hasTake,
	origB64: s.origB64,
	takeB64: s.takeB64 || s.origB64,
})));

const js = `
const SOUNDS = ${soundsJson};

let volume = 0.8;
let isMuted = false;
let previousVolume = 0.8;
let isCooldown = false;
const COOLDOWN_DURATION = 3000; // 3 second rate limit per viewer
let currentVersions = {}; // track 'orig' vs 'take' per sound id

// AudioContext instance for ultra-fast instant playback & tone fallback
let audioCtx = null;
function getAudioContext() {
	if (!audioCtx) {
		const AudioClass = window.AudioContext || window.webkitAudioContext;
		if (AudioClass) audioCtx = new AudioClass();
	}
	if (audioCtx && audioCtx.state === 'suspended') {
		audioCtx.resume();
	}
	return audioCtx;
}

// Render 2-Column Soundboard Grid
function renderGrid() {
	const grid = document.getElementById('deck-grid');
	if (!grid) return;
	grid.innerHTML = '';

	SOUNDS.forEach((sound) => {
		currentVersions[sound.id] = 'orig';

		const card = document.createElement('div');
		card.className = 'buzzer-card';
		card.id = 'card-' + sound.id;

		// Circle Buzzer Button
		const circle = document.createElement('div');
		circle.className = 'buzzer-circle';
		circle.style.background = sound.color;
		circle.textContent = sound.icon;

		const hotkey = document.createElement('span');
		hotkey.className = 'hotkey-badge';
		hotkey.textContent = sound.key;
		circle.appendChild(hotkey);

		// Titles
		const title = document.createElement('div');
		title.className = 'sound-title';
		title.textContent = sound.name;

		const tag = document.createElement('div');
		tag.className = 'sound-tag';
		tag.textContent = sound.tag;

		card.appendChild(circle);
		card.appendChild(title);
		card.appendChild(tag);

		// If sound has Streamer Take, add [Orig | Take] selector
		if (sound.hasTake) {
			const versionPill = document.createElement('div');
			versionPill.className = 'version-pill';

			const btnOrig = document.createElement('button');
			btnOrig.className = 'version-opt selected';
			btnOrig.textContent = 'Orig';
			btnOrig.id = 'ver-orig-' + sound.id;

			const btnTake = document.createElement('button');
			btnTake.className = 'version-opt';
			btnTake.textContent = 'Take 🎙️';
			btnTake.id = 'ver-take-' + sound.id;

			btnOrig.addEventListener('click', (e) => {
				e.stopPropagation();
				currentVersions[sound.id] = 'orig';
				btnOrig.classList.add('selected');
				btnTake.classList.remove('selected');
				setStatus('Selected: ' + sound.name + ' (Original)');
			});

			btnTake.addEventListener('click', (e) => {
				e.stopPropagation();
				currentVersions[sound.id] = 'take';
				btnTake.classList.add('selected');
				btnOrig.classList.remove('selected');
				setStatus('Selected: ' + sound.name + " (Streamer's Take)");
			});

			versionPill.appendChild(btnOrig);
			versionPill.appendChild(btnTake);
			card.appendChild(versionPill);
		}

		// Trigger sound on click
		card.addEventListener('click', () => triggerSound(sound));

		grid.appendChild(card);
	});
}

function triggerSound(sound) {
	if (isCooldown) {
		setStatus('⚠️ Rate limit! Please wait for cooldown.');
		return;
	}

	const version = currentVersions[sound.id] || 'orig';
	const b64 = version === 'take' && sound.takeB64 ? sound.takeB64 : sound.origB64;
	const versionName = version === 'take' ? "Streamer's Take" : "Original";

	// Visual buzzer animation
	const card = document.getElementById('card-' + sound.id);
	if (card) {
		card.classList.add('playing');
		setTimeout(() => card.classList.remove('playing'), 500);
	}

	// Play Audio
	playAudioData(b64);

	setStatus('🔊 Triggered: ' + sound.name + ' (' + versionName + ')');

	// Activate 3s Cooldown Rate Limit
	startCooldown();
}

function playAudioData(b64) {
	if (isMuted || volume <= 0) return;

	getAudioContext();

	if (b64) {
		try {
			const audio = new Audio('data:audio/mp3;base64,' + b64);
			audio.volume = volume;
			audio.play().catch(() => playBeepFallback(350));
		} catch (e) {
			playBeepFallback(350);
		}
	} else {
		playBeepFallback(440);
	}
}

function playBeepFallback(freq) {
	try {
		const ctx = getAudioContext();
		if (!ctx) return;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = 'triangle';
		osc.frequency.setValueAtTime(freq, ctx.currentTime);
		gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start();
		osc.stop(ctx.currentTime + 0.3);
	} catch (e) {}
}

function startCooldown() {
	isCooldown = true;
	const rateText = document.getElementById('rate-text');
	const bar = document.getElementById('cooldown-bar');
	const progress = document.getElementById('cooldown-progress');

	if (bar && progress) {
		bar.style.display = 'block';
		progress.style.transition = 'none';
		progress.style.width = '100%';
		setTimeout(() => {
			progress.style.transition = 'width ' + (COOLDOWN_DURATION / 1000) + 's linear';
			progress.style.width = '0%';
		}, 10);
	}

	let remaining = COOLDOWN_DURATION / 1000;
	if (rateText) rateText.textContent = 'Wait ' + remaining + 's...';

	const interval = setInterval(() => {
		remaining -= 1;
		if (remaining > 0) {
			if (rateText) rateText.textContent = 'Wait ' + remaining + 's...';
		} else {
			clearInterval(interval);
			isCooldown = false;
			if (rateText) rateText.textContent = 'Ready to Play';
			if (bar) bar.style.display = 'none';
		}
	}, 1000);
}

function setStatus(text) {
	const bar = document.getElementById('status-bar');
	if (bar) bar.textContent = text;
}

// Volume Controls
function setVolume(val) {
	volume = parseFloat(val);
	isMuted = volume === 0;
	updateVolumeUI();
}

function toggleMute() {
	if (isMuted) {
		isMuted = false;
		volume = previousVolume > 0 ? previousVolume : 0.8;
	} else {
		previousVolume = volume;
		isMuted = true;
		volume = 0;
	}
	updateVolumeUI();
}

function updateVolumeUI() {
	const volLabel = document.getElementById('vol-label');
	const volSlider = document.getElementById('vol-slider');
	const muteBtn = document.getElementById('btn-mute');

	if (volLabel) volLabel.textContent = isMuted ? 'Muted' : Math.round(volume * 100) + '%';
	if (volSlider) volSlider.value = volume;
	if (muteBtn) muteBtn.textContent = isMuted ? '🔇' : (volume > 0.5 ? '🔊' : '🔉');
}

// Theme Switcher (Minimal vs Glass)
function setTheme(theme) {
	const body = document.getElementById('body-root');
	const btnMinimal = document.getElementById('btn-theme-minimal');
	const btnGlass = document.getElementById('btn-theme-glass');

	if (theme === 'glass') {
		body.className = 'theme-glass';
		btnGlass.classList.add('active');
		btnMinimal.classList.remove('active');
	} else {
		body.className = 'theme-minimal';
		btnMinimal.classList.add('active');
		btnGlass.classList.remove('active');
	}
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
	renderGrid();

	// Event Listeners for Theme
	const btnMinimal = document.getElementById('btn-theme-minimal');
	const btnGlass = document.getElementById('btn-theme-glass');
	if (btnMinimal) btnMinimal.addEventListener('click', () => setTheme('minimal'));
	if (btnGlass) btnGlass.addEventListener('click', () => setTheme('glass'));

	// Volume & Mute Listeners
	const volSlider = document.getElementById('vol-slider');
	if (volSlider) volSlider.addEventListener('input', (e) => setVolume(e.target.value));

	const muteBtn = document.getElementById('btn-mute');
	if (muteBtn) muteBtn.addEventListener('click', toggleMute);

	// Twitch Extension Auth
	if (window.Twitch && window.Twitch.ext) {
		window.Twitch.ext.onAuthorized((auth) => {
			setStatus('Connected to Channel (' + auth.channelId.slice(-4) + ')');
		});
	}
});
`;

fs.writeFileSync(path.join(__dirname, '../public/panel.html'), html, 'utf8');
fs.writeFileSync(path.join(__dirname, '../public/extension/panel.html'), html, 'utf8');
fs.writeFileSync(path.join(__dirname, '../public/panel.js'), js, 'utf8');
fs.writeFileSync(path.join(__dirname, '../public/extension/panel.js'), js, 'utf8');

console.log('Successfully generated sleek 2-column soundboard deck!');

