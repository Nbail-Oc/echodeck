const fs = require('fs');
const path = require('path');

function getB64(filename) {
	try {
		return fs.readFileSync(path.join(__dirname, '../public/sfx', filename)).toString('base64');
	} catch (e) {
		console.warn('Could not read SFX:', filename, e.message);
		return '';
	}
}

const logoB64 = fs.readFileSync(path.join(__dirname, '../public/logo-no-bg.png')).toString('base64');

// 6 Clean Sound Effects with vector SVG icons from useicons collection
const sounds = [
	{
		id: 'bruh',
		name: 'Bruh Sound',
		color: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
		svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`,
		origB64: getB64('sfx-funny-1.mp3'),
		takeB64: getB64('fart-with-reverb.mp3'),
		hasTake: true,
	},
	{
		id: 'reverb',
		name: 'Fart Reverb',
		color: 'linear-gradient(135deg, #ec4899, #be185d)',
		svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.8 19.6A2 2 0 1 0 14 16H2"></path><path d="M17.5 15.6A3 3 0 1 0 19 10H2"></path><path d="M9.8 4.4A2 2 0 1 1 11 8H2"></path></svg>`,
		origB64: getB64('fart-with-reverb.mp3'),
		takeB64: getB64('sfx-funny-1.mp3'),
		hasTake: true,
	},
	{
		id: 'vineboom',
		name: 'Vine Boom',
		color: 'linear-gradient(135deg, #f59e0b, #d97706)',
		svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
		origB64: getB64('vine-boom.mp3'),
		hasTake: false,
	},
	{
		id: 'wow',
		name: 'Anime Wow',
		color: 'linear-gradient(135deg, #06b6d4, #0284c7)',
		svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path></svg>`,
		origB64: getB64('anime-wow-sound-effect.mp3'),
		hasTake: false,
	},
	{
		id: 'emotional',
		name: 'Emotional',
		color: 'linear-gradient(135deg, #ef4444, #dc2626)',
		svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path><path d="m12 13-1-1 2-2-3-3 2-2"></path></svg>`,
		origB64: getB64('emotional-damage-meme.mp3'),
		hasTake: false,
	},
	{
		id: 'oneup',
		name: '1-Up Retro',
		color: 'linear-gradient(135deg, #10b981, #047857)',
		svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="12" y2="12"></line><line x1="8" x2="8" y1="10" y2="14"></line><line x1="15" x2="15.01" y1="13" y2="13"></line><line x1="18" x2="18.01" y1="11" y2="11"></line><rect width="20" height="12" x="2" y="6" rx="6"></rect></svg>`,
		origB64: getB64('1up.mp3'),
		hasTake: false,
	},
];

// 3 Square Stickers (Using user-provided GIF & WebP files)
const stickers = [
	{
		id: 'speed',
		name: 'Speed Laugh',
		file: 'stickers/speed-laugh.gif',
		soundB64: getB64('1-sitcom-laughter-track.mp3'),
		text: 'HAHAHA!',
	},
	{
		id: 'streamer',
		name: 'Streamer Rage',
		file: 'stickers/streamer.gif',
		soundB64: getB64('fbi-open-up-sfx.mp3'),
		text: 'LET\'S GO!',
	},
	{
		id: 'meme1',
		name: 'Meme Special',
		file: 'stickers/meme1.webp',
		soundB64: getB64('classic_hurt.mp3'),
		text: 'OMG!',
	},
];

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
			background: #09090b;
			color: #f4f4f5;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
			width: 318px;
			height: 490px;
			padding: 10px;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			border: 1px solid rgba(255, 255, 255, 0.08);
			border-radius: 14px;
			overflow: hidden;
			background-image: radial-gradient(circle at 50% 0%, rgba(145, 70, 255, 0.14), transparent 75%);
		}

		/* CLEAN AUTHENTIC HEADER (No "ready" pill) */
		.header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding-bottom: 8px;
			border-bottom: 1px solid rgba(255, 255, 255, 0.08);
			flex-shrink: 0;
		}

		.brand-left {
			display: flex;
			align-items: center;
			gap: 8px;
		}

		.brand-logo {
			width: 26px;
			height: 26px;
			object-fit: contain;
			filter: drop-shadow(0 2px 6px rgba(145, 70, 255, 0.5));
		}

		.brand-meta h3 {
			font-size: 13px;
			font-weight: 800;
			letter-spacing: 0.4px;
			color: #ffffff;
			line-height: 1.1;
		}

		.brand-meta span {
			font-size: 9px;
			color: #a1a1aa;
			letter-spacing: 0.2px;
		}

		.cooldown-text {
			font-size: 9.5px;
			font-weight: 700;
			color: #a78bfa;
			padding: 3px 8px;
			background: rgba(145, 70, 255, 0.1);
			border-radius: 12px;
			border: 1px solid rgba(145, 70, 255, 0.2);
			transition: all 0.2s ease;
		}

		.cooldown-text.active {
			color: #f59e0b;
			background: rgba(245, 158, 11, 0.15);
			border-color: rgba(245, 158, 11, 0.4);
		}

		/* VERTICAL SCROLL FEED */
		.scroll-feed {
			flex: 1;
			overflow-y: auto;
			overflow-x: hidden;
			margin: 6px 0;
			padding-right: 4px;
			scrollbar-width: thin;
			scrollbar-color: #3f3f46 transparent;
		}

		.scroll-feed::-webkit-scrollbar {
			width: 4px;
		}

		.scroll-feed::-webkit-scrollbar-thumb {
			background: #3f3f46;
			border-radius: 4px;
		}

		/* SECTION HEADINGS */
		.sec-label {
			font-size: 10px;
			font-weight: 700;
			text-transform: uppercase;
			color: #71717a;
			letter-spacing: 0.6px;
			margin: 6px 0 6px 2px;
		}

		/* SECTION 1: 6 CIRCULAR BUZZERS WITH VECTOR ICONS */
		.buzzer-grid {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 12px 6px;
			justify-items: center;
			margin-bottom: 12px;
		}

		.buzzer-unit {
			display: flex;
			flex-direction: column;
			align-items: center;
			cursor: pointer;
			width: 78px;
			transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
		}

		.buzzer-circle {
			width: 54px;
			height: 54px;
			border-radius: 50%;
			background: var(--btn-color);
			display: flex;
			align-items: center;
			justify-content: center;
			color: #ffffff;
			box-shadow: 
				0 4px 10px rgba(0, 0, 0, 0.5),
				inset 0 2px 2px rgba(255, 255, 255, 0.3),
				inset 0 -3px 4px rgba(0, 0, 0, 0.4);
			transition: all 0.12s ease;
			position: relative;
		}

		.buzzer-circle svg {
			filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
		}

		.buzzer-unit:hover .buzzer-circle {
			transform: scale(1.08);
			box-shadow: 
				0 6px 16px rgba(145, 70, 255, 0.4),
				inset 0 2px 2px rgba(255, 255, 255, 0.4);
		}

		.buzzer-unit:active .buzzer-circle, .buzzer-unit.active-pop .buzzer-circle {
			transform: scale(0.92);
			box-shadow: 
				0 1px 4px rgba(0, 0, 0, 0.8),
				0 0 16px #00f593;
		}

		.buzzer-title {
			font-size: 10px;
			font-weight: 700;
			color: #f4f4f5;
			margin-top: 5px;
			text-align: center;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			max-width: 76px;
		}

		/* Compact Take Switcher for sounds with Mimic Take */
		.take-pill {
			display: flex;
			align-items: center;
			background: #18181f;
			border: 1px solid rgba(255, 255, 255, 0.1);
			border-radius: 8px;
			margin-top: 3px;
			padding: 1px;
			gap: 1px;
			width: 68px;
		}

		.take-opt {
			flex: 1;
			background: transparent;
			border: none;
			color: #71717a;
			font-size: 7.5px;
			font-weight: 700;
			padding: 2px 0;
			border-radius: 6px;
			cursor: pointer;
			text-align: center;
			transition: all 0.12s ease;
		}

		.take-opt.active {
			background: #9146FF;
			color: #ffffff;
		}

		/* SECTION 2: 3 SQUARE STICKERS / GIFS */
		.sticker-grid {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 8px;
			margin-bottom: 4px;
		}

		.sticker-card {
			background: #141418;
			border: 1px solid rgba(255, 255, 255, 0.1);
			border-radius: 12px;
			aspect-ratio: 1 / 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 4px;
			cursor: pointer;
			position: relative;
			overflow: hidden;
			transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
			box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
		}

		.sticker-card:hover {
			border-color: #9146FF;
			transform: translateY(-3px) scale(1.03);
			box-shadow: 0 8px 18px rgba(145, 70, 255, 0.3);
		}

		.sticker-card:active, .sticker-card.active-pop {
			transform: scale(0.92);
			border-color: #00f593;
			box-shadow: 0 0 16px rgba(0, 245, 147, 0.5);
		}

		.sticker-img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			border-radius: 8px;
			pointer-events: none;
		}

		.sticker-overlay {
			position: absolute;
			bottom: 4px;
			left: 4px;
			right: 4px;
			background: rgba(0, 0, 0, 0.75);
			backdrop-filter: blur(4px);
			border-radius: 6px;
			font-size: 8px;
			font-weight: 800;
			color: #ffffff;
			text-align: center;
			padding: 2px 0;
			letter-spacing: 0.3px;
		}

		/* FLOATING REACTION BURST */
		.float-pop {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			font-size: 11px;
			font-weight: 900;
			color: #00f593;
			background: rgba(0, 0, 0, 0.85);
			padding: 2px 6px;
			border-radius: 6px;
			border: 1px solid #00f593;
			pointer-events: none;
			animation: popFly 0.5s ease-out forwards;
			z-index: 20;
		}

		@keyframes popFly {
			0% { opacity: 1; transform: translate(-50%, -50%) scale(0.7); }
			100% { opacity: 0; transform: translate(-50%, -120%) scale(1.2); }
		}

		/* FOOTER */
		.footer {
			border-top: 1px solid rgba(255, 255, 255, 0.08);
			padding-top: 6px;
			flex-shrink: 0;
		}

		.vol-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			font-size: 10px;
			color: #a1a1aa;
			margin-bottom: 3px;
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
			height: 3px;
		}

		.status-text {
			font-size: 9px;
			color: #bf94ff;
			text-align: center;
			font-weight: 600;
			margin-top: 4px;
			min-height: 12px;
		}
	</style>
</head>
<body>

	<!-- Brand Header -->
	<div class="header">
		<div class="brand-left">
			<img class="brand-logo" src="data:image/png;base64,${logoB64}" alt="EchoDeck">
			<div class="brand-meta">
				<h3>EchoDeck</h3>
				<span>Reactions & Soundboard</span>
			</div>
		</div>
		<div class="cooldown-text" id="cooldown-text">Ready</div>
	</div>

	<!-- Scrollable Feed -->
	<div class="scroll-feed" id="scroll-feed">
		<!-- Section 1: 6 Circular Buzzers with Vector Icons -->
		<div class="sec-label">Sound Effects</div>
		<div class="buzzer-grid" id="buzzer-grid"></div>

		<!-- Section 2: 3 Square Stickers / GIFs -->
		<div class="sec-label">Live Stickers & GIFs</div>
		<div class="sticker-grid" id="sticker-grid"></div>
	</div>

	<!-- Bottom Volume & Status Bar -->
	<div class="footer">
		<div class="vol-row">
			<div class="vol-left">
				<button class="mute-btn" id="btn-mute" title="Toggle Mute">🔊</button>
				<span>Volume</span>
			</div>
			<span id="vol-text">80%</span>
		</div>
		<input type="range" id="vol-slider" min="0" max="1" step="0.05" value="0.8">
		<div class="status-text" id="status-text">Scroll & tap any buzzer or sticker</div>
	</div>

	<!-- External CSP Compliant Script -->
	<script src="panel.js"></script>
</body>
</html>
`;

// Build panel.js
const soundsPayload = JSON.stringify(sounds.map(s => ({
	id: s.id,
	name: s.name,
	color: s.color,
	svg: s.svg,
	hasTake: s.hasTake,
	origB64: s.origB64,
	takeB64: s.takeB64 || s.origB64,
})));

const stickersPayload = JSON.stringify(stickers.map(st => ({
	id: st.id,
	name: st.name,
	file: st.file,
	text: st.text,
	soundB64: st.soundB64,
})));

const js = `
const SOUNDS = ${soundsPayload};
const STICKERS = ${stickersPayload};

let volume = 0.8;
let isMuted = false;
let previousVol = 0.8;
let isCooldown = false;
const COOLDOWN_MS = 2500;
let soundModes = {}; // 'orig' vs 'take'

let audioCtx = null;
function getAudioContext() {
	if (!audioCtx) {
		const AudioCtx = window.AudioContext || window.webkitAudioContext;
		if (AudioCtx) audioCtx = new AudioCtx();
	}
	if (audioCtx && audioCtx.state === 'suspended') {
		audioCtx.resume();
	}
	return audioCtx;
}

// Render 6 Pure Circular Buzzers with Vector Icons
function renderBuzzers() {
	const grid = document.getElementById('buzzer-grid');
	if (!grid) return;
	grid.innerHTML = '';

	SOUNDS.forEach((sound) => {
		soundModes[sound.id] = 'orig';

		const unit = document.createElement('div');
		unit.className = 'buzzer-unit';
		unit.id = 'buzzer-' + sound.id;

		// Circular Buzzer Button with clean SVG vector
		const circle = document.createElement('div');
		circle.className = 'buzzer-circle';
		circle.style.setProperty('--btn-color', sound.color);
		circle.innerHTML = sound.svg;
		unit.appendChild(circle);

		// Title
		const title = document.createElement('div');
		title.className = 'buzzer-title';
		title.textContent = sound.name;
		unit.appendChild(title);

		// Take switcher if sound has mimic take
		if (sound.hasTake) {
			const pill = document.createElement('div');
			pill.className = 'take-pill';

			const btnOrig = document.createElement('button');
			btnOrig.className = 'take-opt active';
			btnOrig.textContent = 'Orig';

			const btnTake = document.createElement('button');
			btnTake.className = 'take-opt';
			btnTake.textContent = 'Take 🎙️';

			btnOrig.addEventListener('click', (e) => {
				e.stopPropagation();
				soundModes[sound.id] = 'orig';
				btnOrig.classList.add('active');
				btnTake.classList.remove('active');
				setStatus(sound.name + ' (Original)');
			});

			btnTake.addEventListener('click', (e) => {
				e.stopPropagation();
				soundModes[sound.id] = 'take';
				btnTake.classList.add('active');
				btnOrig.classList.remove('active');
				setStatus(sound.name + " (Streamer's Take)");
			});

			pill.appendChild(btnOrig);
			pill.appendChild(btnTake);
			unit.appendChild(pill);
		}

		unit.addEventListener('click', () => triggerSound(sound));
		grid.appendChild(unit);
	});
}

// Render 3 Square Stickers / GIFs
function renderStickers() {
	const grid = document.getElementById('sticker-grid');
	if (!grid) return;
	grid.innerHTML = '';

	STICKERS.forEach((st) => {
		const card = document.createElement('div');
		card.className = 'sticker-card';
		card.id = 'sticker-' + st.id;

		const img = document.createElement('img');
		img.className = 'sticker-img';
		img.src = st.file;
		img.alt = st.name;

		const overlay = document.createElement('div');
		overlay.className = 'sticker-overlay';
		overlay.textContent = st.name;

		card.appendChild(img);
		card.appendChild(overlay);

		card.addEventListener('click', () => triggerSticker(st));
		grid.appendChild(card);
	});
}

function triggerSound(sound) {
	if (isCooldown) {
		setStatus('⏱️ Cooldown active. Please wait!');
		return;
	}

	const mode = soundModes[sound.id] || 'orig';
	const b64 = mode === 'take' && sound.takeB64 ? sound.takeB64 : sound.origB64;
	const modeText = mode === 'take' ? "Take" : "Orig";

	const unit = document.getElementById('buzzer-' + sound.id);
	if (unit) {
		unit.classList.add('active-pop');
		setTimeout(() => unit.classList.remove('active-pop'), 350);
	}

	playAudio(b64);
	setStatus('🔊 Played ' + sound.name + ' [' + modeText + ']');
	startCooldown();
}

function triggerSticker(st) {
	if (isCooldown) {
		setStatus('⏱️ Cooldown active. Please wait!');
		return;
	}

	const card = document.getElementById('sticker-' + st.id);
	if (card) {
		card.classList.add('active-pop');
		setTimeout(() => card.classList.remove('active-pop'), 400);

		const pop = document.createElement('div');
		pop.className = 'float-pop';
		pop.textContent = st.text;
		card.appendChild(pop);
		setTimeout(() => pop.remove(), 500);
	}

	playAudio(st.soundB64);
	setStatus('✨ Reacted with ' + st.name);
	startCooldown();
}

function playAudio(b64) {
	if (isMuted || volume <= 0) return;
	getAudioContext();

	if (b64) {
		try {
			const audio = new Audio('data:audio/mp3;base64,' + b64);
			audio.volume = volume;
			audio.play().catch(() => playSynth(320));
		} catch (e) {
			playSynth(320);
		}
	} else {
		playSynth(440);
	}
}

function playSynth(freq) {
	try {
		const ctx = getAudioContext();
		if (!ctx) return;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = 'triangle';
		osc.frequency.setValueAtTime(freq, ctx.currentTime);
		gain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start();
		osc.stop(ctx.currentTime + 0.25);
	} catch (e) {}
}

function startCooldown() {
	isCooldown = true;
	const pill = document.getElementById('cooldown-text');
	if (pill) {
		pill.classList.add('active');
		pill.textContent = 'Wait 2.5s';
	}

	let remaining = COOLDOWN_MS / 1000;
	const timer = setInterval(() => {
		remaining -= 0.5;
		if (remaining > 0) {
			if (pill) pill.textContent = 'Wait ' + remaining.toFixed(1) + 's';
		} else {
			clearInterval(timer);
			isCooldown = false;
			if (pill) {
				pill.classList.remove('active');
				pill.textContent = 'Ready';
			}
		}
	}, 500);
}

function setStatus(msg) {
	const el = document.getElementById('status-text');
	if (el) el.textContent = msg;
}

function setVolume(val) {
	volume = parseFloat(val);
	isMuted = volume === 0;
	updateVolUI();
}

function toggleMute() {
	if (isMuted) {
		isMuted = false;
		volume = previousVol > 0 ? previousVol : 0.8;
	} else {
		previousVol = volume;
		isMuted = true;
		volume = 0;
	}
	updateVolUI();
}

function updateVolUI() {
	const volText = document.getElementById('vol-text');
	const slider = document.getElementById('vol-slider');
	const muteBtn = document.getElementById('btn-mute');

	if (volText) volText.textContent = isMuted ? 'Muted' : Math.round(volume * 100) + '%';
	if (slider) slider.value = volume;
	if (muteBtn) muteBtn.textContent = isMuted ? '🔇' : (volume > 0.5 ? '🔊' : '🔉');
}

document.addEventListener('DOMContentLoaded', () => {
	renderBuzzers();
	renderStickers();

	const slider = document.getElementById('vol-slider');
	if (slider) slider.addEventListener('input', (e) => setVolume(e.target.value));

	const mute = document.getElementById('btn-mute');
	if (mute) mute.addEventListener('click', toggleMute);

	if (window.Twitch && window.Twitch.ext) {
		window.Twitch.ext.onAuthorized((auth) => {
			setStatus('Connected to channel (' + auth.channelId.slice(-4) + ')');
		});
	}
});
`;

fs.writeFileSync(path.join(__dirname, '../public/panel.html'), html, 'utf8');
fs.writeFileSync(path.join(__dirname, '../public/extension/panel.html'), html, 'utf8');
fs.writeFileSync(path.join(__dirname, '../public/panel.js'), js, 'utf8');
fs.writeFileSync(path.join(__dirname, '../public/extension/panel.js'), js, 'utf8');

console.log('Successfully generated SVG vector icon soundboard + stickers!');
