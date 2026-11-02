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

// Sound definitions with custom SVG artwork & base64 audio
const sounds = [
	{
		id: 'bruh',
		title: 'Bruh Sound',
		subtitle: 'Original Meme',
		color: '#9146FF',
		glow: 'rgba(145, 70, 255, 0.45)',
		svgIcon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
		origB64: getB64('sfx-funny-1.mp3'),
		takeB64: getB64('fart-with-reverb.mp3'),
		hasTake: true,
	},
	{
		id: 'reverb',
		title: 'Fart Reverb',
		subtitle: 'Sub-Bass',
		color: '#EC4899',
		glow: 'rgba(236, 72, 153, 0.45)',
		svgIcon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="2"/></svg>`,
		origB64: getB64('fart-with-reverb.mp3'),
		takeB64: getB64('sfx-funny-1.mp3'),
		hasTake: true,
	},
	{
		id: 'vineboom',
		title: 'Vine Boom',
		subtitle: 'Heavy Hit',
		color: '#F59E0B',
		glow: 'rgba(245, 158, 11, 0.45)',
		svgIcon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
		origB64: getB64('vine-boom.mp3'),
		hasTake: false,
	},
	{
		id: 'wow',
		title: 'Anime Wow',
		subtitle: 'Sparkle Voice',
		color: '#06B6D4',
		glow: 'rgba(6, 182, 212, 0.45)',
		svgIcon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
		origB64: getB64('anime-wow-sound-effect.mp3'),
		hasTake: false,
	},
	{
		id: 'hurt',
		title: 'Classic Oof',
		subtitle: 'Retro Damage',
		color: '#EF4444',
		glow: 'rgba(239, 68, 68, 0.45)',
		svgIcon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
		origB64: getB64('classic_hurt.mp3'),
		hasTake: false,
	},
	{
		id: 'oneup',
		title: 'Retro 1-Up',
		subtitle: 'Power Arcade',
		color: '#10B981',
		glow: 'rgba(16, 185, 129, 0.45)',
		svgIcon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>`,
		origB64: getB64('1up.mp3'),
		hasTake: false,
	},
];

console.log('Packaging', sounds.length, 'isometric sounds...');

// Pure HTML - zero inline event handlers or scripts (Twitch CSP Compliant)
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
			color: #fafafa;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Geist", Helvetica, Arial, sans-serif;
			width: 318px;
			min-height: 480px;
			padding: 12px;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			border: 1px solid rgba(255, 255, 255, 0.08);
			border-radius: 16px;
			overflow-x: hidden;
			background-image: 
				radial-gradient(ellipse at 50% 0%, rgba(145, 70, 255, 0.12), transparent 70%),
				linear-gradient(180deg, #0e0e13 0%, #08080a 100%);
		}

		/* TOP CHASSIS BAR */
		.deck-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding-bottom: 10px;
			border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		}

		.brand-group {
			display: flex;
			align-items: center;
			gap: 8px;
		}

		.chassis-badge {
			width: 24px;
			height: 24px;
			border-radius: 8px;
			background: linear-gradient(135deg, #9146FF 0%, #5b21b6 100%);
			display: flex;
			align-items: center;
			justify-content: center;
			color: #ffffff;
			font-size: 11px;
			font-weight: 900;
			box-shadow: 0 2px 8px rgba(145, 70, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3);
		}

		.brand-title {
			font-size: 11px;
			font-weight: 800;
			letter-spacing: 0.8px;
			text-transform: uppercase;
			color: #ffffff;
		}

		.live-tag {
			display: flex;
			align-items: center;
			gap: 4px;
			font-size: 9px;
			font-weight: 700;
			color: #34d399;
			background: rgba(52, 211, 153, 0.08);
			padding: 3px 8px;
			border-radius: 20px;
			border: 1px solid rgba(52, 211, 153, 0.2);
			letter-spacing: 0.4px;
		}

		.live-led {
			width: 5px;
			height: 5px;
			border-radius: 50%;
			background: #34d399;
			box-shadow: 0 0 6px #34d399;
			animation: ledPulse 1.8s infinite;
		}

		@keyframes ledPulse {
			0%, 100% { opacity: 1; transform: scale(1); }
			50% { opacity: 0.35; transform: scale(0.8); }
		}

		/* SUBTLE COOLDOWN HUD */
		.hud-strip {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin: 8px 0 6px 0;
			padding: 4px 6px;
			border-radius: 8px;
			background: rgba(255, 255, 255, 0.02);
			border: 1px solid rgba(255, 255, 255, 0.04);
		}

		.hud-label {
			font-size: 9px;
			color: #71717a;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			font-weight: 600;
		}

		.hud-status {
			font-size: 9px;
			font-weight: 700;
			color: #a78bfa;
			letter-spacing: 0.2px;
		}

		.cooldown-gauge {
			width: 100%;
			height: 2px;
			background: rgba(255, 255, 255, 0.05);
			border-radius: 2px;
			overflow: hidden;
			margin-bottom: 6px;
			display: none;
		}

		.cooldown-meter {
			height: 100%;
			width: 100%;
			background: linear-gradient(90deg, #9146FF, #00f593);
			border-radius: 2px;
			transition: width 0.1s linear;
		}

		/* 2-COLUMN ISOMETRIC BUZZER GRID */
		.iso-grid {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 10px;
			margin: 4px 0 10px 0;
		}

		/* MACHINED HARDWARE PAD HOUSING (Doppelrand) */
		.buzzer-cell {
			background: #111116;
			border: 1px solid rgba(255, 255, 255, 0.07);
			border-radius: 16px;
			padding: 12px 8px 8px 8px;
			display: flex;
			flex-direction: column;
			align-items: center;
			position: relative;
			box-shadow: 
				0 6px 16px -2px rgba(0, 0, 0, 0.5),
				inset 0 1px 0 rgba(255, 255, 255, 0.08);
			transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
			cursor: pointer;
		}

		.buzzer-cell:hover {
			border-color: rgba(255, 255, 255, 0.18);
			background: #15151c;
			transform: translateY(-2px);
			box-shadow: 
				0 10px 24px -4px rgba(0, 0, 0, 0.7),
				0 0 12px rgba(145, 70, 255, 0.15);
		}

		/* ISOMETRIC 3D TACTILE BUZZER BUTTON */
		.iso-bezel {
			width: 58px;
			height: 58px;
			border-radius: 50%;
			background: #16161d;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 
				0 6px 12px rgba(0, 0, 0, 0.8),
				inset 0 2px 4px rgba(0, 0, 0, 0.9),
				0 0 0 1px rgba(255, 255, 255, 0.05);
			margin-bottom: 8px;
			position: relative;
		}

		.iso-buzzer {
			width: 48px;
			height: 48px;
			border-radius: 50%;
			background: radial-gradient(circle at 35% 30%, #2f2f3c 0%, #1a1a24 60%, #101017 100%);
			display: flex;
			align-items: center;
			justify-content: center;
			position: relative;
			cursor: pointer;
			/* 3D Extrusion Shadow Stack */
			box-shadow: 
				0 1px 0 rgba(255, 255, 255, 0.25) inset,  /* Top Specular Rim */
				0 -2px 4px rgba(0, 0, 0, 0.9) inset,     /* Deep Bottom Bevel */
				0 5px 0 #07070a,                         /* Physical Extrusion Lip */
				0 8px 12px rgba(0, 0, 0, 0.7);           /* Ambient Drop */
			transition: transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.1s ease;
		}

		.buzzer-cell:hover .iso-buzzer {
			transform: translateY(-1px);
			box-shadow: 
				0 1px 0 rgba(255, 255, 255, 0.35) inset,
				0 -2px 4px rgba(0, 0, 0, 0.9) inset,
				0 6px 0 #07070a,
				0 10px 16px rgba(0, 0, 0, 0.8);
		}

		/* PHYSICAL COMPRESSION WHEN PRESSED */
		.buzzer-cell:active .iso-buzzer, .buzzer-cell.active-trigger .iso-buzzer {
			transform: translateY(4px);
			box-shadow: 
				0 1px 0 rgba(255, 255, 255, 0.1) inset,
				0 1px 0 #07070a,
				0 2px 4px rgba(0, 0, 0, 0.9),
				0 0 16px var(--accent-glow);
		}

		.buzzer-cell.active-trigger {
			border-color: var(--accent-color) !important;
		}

		/* ICON GLYPH INSIDE BUZZER */
		.iso-glyph {
			color: var(--accent-color);
			display: flex;
			align-items: center;
			justify-content: center;
			filter: drop-shadow(0 0 6px var(--accent-glow));
			transition: transform 0.12s ease;
		}

		.buzzer-cell:hover .iso-glyph {
			transform: scale(1.08);
		}

		/* SOUND LABELS (Minimalist - no numeric 1,2,3 noise) */
		.cell-title {
			font-size: 11px;
			font-weight: 700;
			color: #f4f4f5;
			letter-spacing: 0.2px;
			margin-bottom: 1px;
			text-align: center;
		}

		.cell-sub {
			font-size: 8.5px;
			color: #71717a;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			font-weight: 600;
		}

		/* MINIMAL TACTILE VERSION SWITCHER */
		.ver-switch {
			display: flex;
			align-items: center;
			background: #09090b;
			border: 1px solid rgba(255, 255, 255, 0.08);
			border-radius: 12px;
			padding: 2px;
			margin-top: 6px;
			gap: 2px;
			width: 100%;
		}

		.ver-btn {
			flex: 1;
			background: transparent;
			border: none;
			color: #71717a;
			font-size: 8px;
			font-weight: 700;
			padding: 2px 4px;
			border-radius: 10px;
			cursor: pointer;
			transition: all 0.15s ease;
		}

		.ver-btn.selected {
			background: rgba(255, 255, 255, 0.12);
			color: #ffffff;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
		}

		/* FOOTER CONTROLS */
		.deck-footer {
			border-top: 1px solid rgba(255, 255, 255, 0.06);
			padding-top: 8px;
		}

		.volume-cluster {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 4px;
			font-size: 10px;
			color: #71717a;
		}

		.vol-meta {
			display: flex;
			align-items: center;
			gap: 6px;
		}

		.mute-toggle {
			background: transparent;
			border: none;
			color: #a1a1aa;
			cursor: pointer;
			font-size: 12px;
			padding: 2px;
		}

		.mute-toggle:hover {
			color: #ffffff;
		}

		input[type=range] {
			width: 100%;
			accent-color: #9146FF;
			cursor: pointer;
			height: 3px;
		}

		.system-status {
			font-size: 9.5px;
			color: #a78bfa;
			text-align: center;
			font-weight: 600;
			margin-top: 6px;
			letter-spacing: 0.2px;
			min-height: 14px;
		}
	</style>
</head>
<body>

	<!-- Top Chassis Bar -->
	<div class="deck-header">
		<div class="brand-group">
			<div class="chassis-badge">⚡</div>
			<span class="brand-title">EchoDeck</span>
		</div>
		<div class="live-tag">
			<div class="live-led"></div>
			<span>READY</span>
		</div>
	</div>

	<!-- Cooldown HUD -->
	<div class="hud-strip">
		<span class="hud-label">Tactile Soundboard</span>
		<span class="hud-status" id="hud-status">Standby</span>
	</div>
	<div class="cooldown-gauge" id="cooldown-gauge">
		<div class="cooldown-meter" id="cooldown-meter"></div>
	</div>

	<!-- 2-Column Isometric Buzzer Grid -->
	<div class="iso-grid" id="iso-grid">
		<!-- Injected dynamically by panel.js -->
	</div>

	<!-- Footer with Compliant Volume & Mute -->
	<div class="deck-footer">
		<div class="volume-cluster">
			<div class="vol-meta">
				<button class="mute-toggle" id="btn-mute" title="Toggle Mute">🔊</button>
				<span>Volume</span>
			</div>
			<span id="vol-text">80%</span>
		</div>
		<input type="range" id="vol-slider" min="0" max="1" step="0.05" value="0.8">
		<div class="system-status" id="system-status">Press any buzzer to trigger sound</div>
	</div>

	<!-- External CSP-Compliant Script -->
	<script src="panel.js"></script>
</body>
</html>
`;

// Script building panel.js
const soundsPayload = JSON.stringify(sounds.map(s => ({
	id: s.id,
	title: s.title,
	subtitle: s.subtitle,
	color: s.color,
	glow: s.glow,
	svgIcon: s.svgIcon,
	hasTake: s.hasTake,
	origB64: s.origB64,
	takeB64: s.takeB64 || s.origB64,
})));

const js = `
const SOUNDS = ${soundsPayload};

let volume = 0.8;
let isMuted = false;
let previousVol = 0.8;
let isCooldown = false;
const COOLDOWN_MS = 2500;
let soundModes = {}; // tracks 'orig' vs 'take'

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

function renderIsometricDeck() {
	const grid = document.getElementById('iso-grid');
	if (!grid) return;
	grid.innerHTML = '';

	SOUNDS.forEach((sound) => {
		soundModes[sound.id] = 'orig';

		const cell = document.createElement('div');
		cell.className = 'buzzer-cell';
		cell.id = 'cell-' + sound.id;
		cell.style.setProperty('--accent-color', sound.color);
		cell.style.setProperty('--accent-glow', sound.glow);

		// Machined Bezel Shell (Doppelrand)
		const bezel = document.createElement('div');
		bezel.className = 'iso-bezel';

		// 3D Isometric Buzzer Core
		const buzzer = document.createElement('div');
		buzzer.className = 'iso-buzzer';

		const glyph = document.createElement('div');
		glyph.className = 'iso-glyph';
		glyph.innerHTML = sound.svgIcon;

		buzzer.appendChild(glyph);
		bezel.appendChild(buzzer);
		cell.appendChild(bezel);

		// Clean Minimalist Title & Subtitle (No numeric labels!)
		const title = document.createElement('div');
		title.className = 'cell-title';
		title.textContent = sound.title;

		const sub = document.createElement('div');
		sub.className = 'cell-sub';
		sub.textContent = sound.subtitle;

		cell.appendChild(title);
		cell.appendChild(sub);

		// Streamer Take Toggle (When mimic take exists)
		if (sound.hasTake) {
			const switchBox = document.createElement('div');
			switchBox.className = 'ver-switch';

			const btnOrig = document.createElement('button');
			btnOrig.className = 'ver-btn selected';
			btnOrig.textContent = 'Orig';

			const btnTake = document.createElement('button');
			btnTake.className = 'ver-btn';
			btnTake.textContent = 'Take 🎙️';

			btnOrig.addEventListener('click', (e) => {
				e.stopPropagation();
				soundModes[sound.id] = 'orig';
				btnOrig.classList.add('selected');
				btnTake.classList.remove('selected');
				setStatus('Mode: ' + sound.title + ' (Original)');
			});

			btnTake.addEventListener('click', (e) => {
				e.stopPropagation();
				soundModes[sound.id] = 'take';
				btnTake.classList.add('selected');
				btnOrig.classList.remove('selected');
				setStatus('Mode: ' + sound.title + " (Streamer's Take)");
			});

			switchBox.appendChild(btnOrig);
			switchBox.appendChild(btnTake);
			cell.appendChild(switchBox);
		}

		// Click to trigger sound
		cell.addEventListener('click', () => triggerSound(sound));

		grid.appendChild(cell);
	});
}

function triggerSound(sound) {
	if (isCooldown) {
		setStatus('⚠️ Cooldown active. Wait a moment.');
		return;
	}

	const mode = soundModes[sound.id] || 'orig';
	const b64 = mode === 'take' && sound.takeB64 ? sound.takeB64 : sound.origB64;
	const modeName = mode === 'take' ? "Take" : "Orig";

	// Physical compression visual state
	const cell = document.getElementById('cell-' + sound.id);
	if (cell) {
		cell.classList.add('active-trigger');
		setTimeout(() => cell.classList.remove('active-trigger'), 350);
	}

	// Play audio
	playAudio(b64);
	setStatus('🔊 Fired ' + sound.title + ' [' + modeName + ']');

	// Trigger rate limit cooldown
	startCooldown();
}

function playAudio(b64) {
	if (isMuted || volume <= 0) return;
	getAudioContext();

	if (b64) {
		try {
			const audio = new Audio('data:audio/mp3;base64,' + b64);
			audio.volume = volume;
			audio.play().catch(() => playSynthBeep(320));
		} catch (e) {
			playSynthBeep(320);
		}
	} else {
		playSynthBeep(440);
	}
}

function playSynthBeep(freq) {
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
	const hudStatus = document.getElementById('hud-status');
	const gauge = document.getElementById('cooldown-gauge');
	const meter = document.getElementById('cooldown-meter');

	if (gauge && meter) {
		gauge.style.display = 'block';
		meter.style.transition = 'none';
		meter.style.width = '100%';
		setTimeout(() => {
			meter.style.transition = 'width ' + (COOLDOWN_MS / 1000) + 's linear';
			meter.style.width = '0%';
		}, 10);
	}

	let left = COOLDOWN_MS / 1000;
	if (hudStatus) hudStatus.textContent = 'Wait ' + left.toFixed(1) + 's';

	const timer = setInterval(() => {
		left -= 0.5;
		if (left > 0) {
			if (hudStatus) hudStatus.textContent = 'Wait ' + left.toFixed(1) + 's';
		} else {
			clearInterval(timer);
			isCooldown = false;
			if (hudStatus) hudStatus.textContent = 'Standby';
			if (gauge) gauge.style.display = 'none';
		}
	}, 500);
}

function setStatus(msg) {
	const el = document.getElementById('system-status');
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
	renderIsometricDeck();

	const slider = document.getElementById('vol-slider');
	if (slider) slider.addEventListener('input', (e) => setVolume(e.target.value));

	const mute = document.getElementById('btn-mute');
	if (mute) mute.addEventListener('click', toggleMute);

	if (window.Twitch && window.Twitch.ext) {
		window.Twitch.ext.onAuthorized((auth) => {
			setStatus('Channel ID: ' + auth.channelId.slice(-4));
		});
	}
});
`;

fs.writeFileSync(path.join(__dirname, '../public/panel.html'), html, 'utf8');
fs.writeFileSync(path.join(__dirname, '../public/extension/panel.html'), html, 'utf8');
fs.writeFileSync(path.join(__dirname, '../public/panel.js'), js, 'utf8');
fs.writeFileSync(path.join(__dirname, '../public/extension/panel.js'), js, 'utf8');

console.log('Successfully written isometric tactile deck to panel.html and panel.js');

