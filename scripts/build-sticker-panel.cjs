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

// 8 Curated Sounds & Animated Sticker Reactions
const items = [
	{
		id: 'bruh',
		title: 'Bruh Sound #2',
		tag: 'Meme Reaction',
		stickerEmoji: '🗿',
		reactionText: 'BRUH!',
		stickerBg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
		borderGlow: 'rgba(139, 92, 246, 0.5)',
		origB64: getB64('sfx-funny-1.mp3'),
		takeB64: getB64('fart-with-reverb.mp3'),
		hasTake: true,
	},
	{
		id: 'reverb',
		title: 'Fart Reverb',
		tag: 'Bass Boosted',
		stickerEmoji: '💨',
		reactionText: 'PFFT!',
		stickerBg: 'linear-gradient(135deg, #ec4899, #be185d)',
		borderGlow: 'rgba(236, 72, 153, 0.5)',
		origB64: getB64('fart-with-reverb.mp3'),
		takeB64: getB64('sfx-funny-1.mp3'),
		hasTake: true,
	},
	{
		id: 'vineboom',
		title: 'Vine Boom',
		tag: 'Dramatic Shock',
		stickerEmoji: '🤨',
		reactionText: 'BOOM!',
		stickerBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
		borderGlow: 'rgba(245, 158, 11, 0.5)',
		origB64: getB64('vine-boom.mp3'),
		hasTake: false,
	},
	{
		id: 'wow',
		title: 'Anime Wow',
		tag: 'Cute Sparkle',
		stickerEmoji: '✨',
		reactionText: 'SUGOI!',
		stickerBg: 'linear-gradient(135deg, #06b6d4, #0284c7)',
		borderGlow: 'rgba(6, 182, 212, 0.5)',
		origB64: getB64('anime-wow-sound-effect.mp3'),
		hasTake: false,
	},
	{
		id: 'emotional',
		title: 'Emotional Damage',
		tag: 'Slipper Hit',
		stickerEmoji: '💔',
		reactionText: 'DAMAGE!',
		stickerBg: 'linear-gradient(135deg, #ef4444, #dc2626)',
		borderGlow: 'rgba(239, 68, 68, 0.5)',
		origB64: getB64('emotional-damage-meme.mp3'),
		hasTake: false,
	},
	{
		id: 'fbi',
		title: 'FBI Open Up',
		tag: 'Police Raid',
		stickerEmoji: '🚨',
		reactionText: 'OPEN UP!',
		stickerBg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
		borderGlow: 'rgba(59, 130, 246, 0.5)',
		origB64: getB64('fbi-open-up-sfx.mp3'),
		hasTake: false,
	},
	{
		id: 'hurt',
		title: 'Classic Oof',
		tag: 'Damage SFX',
		stickerEmoji: '🤕',
		reactionText: 'OOF!',
		stickerBg: 'linear-gradient(135deg, #e11d48, #9f1239)',
		borderGlow: 'rgba(225, 29, 72, 0.5)',
		origB64: getB64('classic_hurt.mp3'),
		hasTake: false,
	},
	{
		id: 'oneup',
		title: 'Retro 1-Up',
		tag: 'Power Level Up',
		stickerEmoji: '🍄',
		reactionText: '+1 UP!',
		stickerBg: 'linear-gradient(135deg, #10b981, #047857)',
		borderGlow: 'rgba(16, 185, 129, 0.5)',
		origB64: getB64('1up.mp3'),
		hasTake: false,
	},
];

console.log('Building sticker & audio panel with', items.length, 'cards...');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>EchoDeck Viewer Stickers & Sounds</title>
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
			background: #0e0e12;
			color: #f4f4f5;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
			width: 318px;
			height: 490px;
			padding: 10px;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			border: 1px solid #27272f;
			border-radius: 14px;
			overflow: hidden;
			position: relative;
			background-image: radial-gradient(circle at 50% 0%, rgba(145, 70, 255, 0.12), transparent 75%);
		}

		/* AUTHENTIC ECHODECK HEADER */
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
			width: 28px;
			height: 28px;
			object-contain: contain;
			filter: drop-shadow(0 2px 6px rgba(145, 70, 255, 0.5));
		}

		.brand-meta h3 {
			font-size: 13px;
			font-weight: 800;
			letter-spacing: 0.3px;
			color: #ffffff;
			line-height: 1.1;
		}

		.brand-meta span {
			font-size: 9px;
			color: #a1a1aa;
			letter-spacing: 0.2px;
		}

		.cooldown-pill {
			font-size: 9.5px;
			font-weight: 700;
			color: #a78bfa;
			background: rgba(145, 70, 255, 0.12);
			border: 1px solid rgba(145, 70, 255, 0.3);
			padding: 3px 8px;
			border-radius: 12px;
			transition: all 0.2s ease;
		}

		.cooldown-pill.active {
			color: #f59e0b;
			background: rgba(245, 158, 11, 0.15);
			border-color: rgba(245, 158, 11, 0.4);
		}

		/* SCROLLABLE STICKER & SOUNDBOARD FEED */
		.scroll-feed {
			flex: 1;
			overflow-y: auto;
			overflow-x: hidden;
			margin: 8px 0;
			padding-right: 4px;
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 8px;
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

		/* STICKER SOUND CARD */
		.sticker-card {
			background: #18181f;
			border: 1px solid rgba(255, 255, 255, 0.08);
			border-radius: 12px;
			padding: 10px 8px 8px 8px;
			display: flex;
			flex-direction: column;
			align-items: center;
			text-align: center;
			cursor: pointer;
			position: relative;
			transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s ease, border-color 0.15s ease;
		}

		.sticker-card:hover {
			transform: translateY(-3px) scale(1.02);
			border-color: var(--card-glow);
			box-shadow: 0 8px 20px -4px var(--card-glow);
			background: #1f1f28;
		}

		.sticker-card:active, .sticker-card.active-pop {
			transform: scale(0.94);
		}

		/* DIE-CUT ANIMATED STICKER BADGE */
		.sticker-badge {
			width: 52px;
			height: 52px;
			border-radius: 16px;
			background: var(--sticker-bg);
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 26px;
			margin-bottom: 6px;
			position: relative;
			box-shadow: 
				0 4px 12px rgba(0, 0, 0, 0.4),
				0 0 0 2px #ffffff,
				0 0 16px var(--card-glow);
			transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
		}

		.sticker-card:hover .sticker-badge {
			transform: scale(1.1) rotate(-3deg);
		}

		.sticker-card.active-pop .sticker-badge {
			animation: stickerBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
		}

		@keyframes stickerBounce {
			0% { transform: scale(0.9) rotate(0deg); }
			50% { transform: scale(1.25) rotate(6deg); }
			100% { transform: scale(1) rotate(0deg); }
		}

		/* TEXT LABELS */
		.card-title {
			font-size: 11px;
			font-weight: 700;
			color: #ffffff;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			max-width: 120px;
		}

		.card-tag {
			font-size: 9px;
			color: #a1a1aa;
			margin-top: 1px;
		}

		/* VERSION TOGGLE PILL (Orig vs Take) */
		.take-toggle {
			display: flex;
			align-items: center;
			background: #111116;
			border: 1px solid rgba(255, 255, 255, 0.1);
			border-radius: 10px;
			padding: 1px;
			margin-top: 5px;
			width: 100%;
			gap: 1px;
		}

		.take-btn {
			flex: 1;
			background: transparent;
			border: none;
			color: #71717a;
			font-size: 8px;
			font-weight: 700;
			padding: 2px;
			border-radius: 8px;
			cursor: pointer;
			transition: all 0.12s ease;
		}

		.take-btn.selected {
			background: #9146FF;
			color: #ffffff;
		}

		/* FLOATING REACTION BURST (+1 POP) */
		.float-bubble {
			position: absolute;
			top: 10px;
			font-size: 11px;
			font-weight: 900;
			color: #00f593;
			background: rgba(0, 0, 0, 0.8);
			padding: 2px 6px;
			border-radius: 8px;
			border: 1px solid #00f593;
			pointer-events: none;
			animation: floatUp 0.6s ease-out forwards;
			z-index: 10;
		}

		@keyframes floatUp {
			0% { opacity: 1; transform: translateY(0) scale(0.8); }
			100% { opacity: 0; transform: translateY(-24px) scale(1.2); }
		}

		/* FOOTER */
		.footer {
			border-top: 1px solid rgba(255, 255, 255, 0.08);
			padding-top: 6px;
			flex-shrink: 0;
		}

		.vol-bar {
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
			height: 3px;
		}

		.status-msg {
			font-size: 9.5px;
			color: #bf94ff;
			text-align: center;
			font-weight: 600;
			margin-top: 4px;
			min-height: 14px;
		}
	</style>
</head>
<body>

	<!-- Official EchoDeck Header -->
	<div class="header">
		<div class="brand-left">
			<img class="brand-logo" src="data:image/png;base64,${logoB64}" alt="EchoDeck">
			<div class="brand-meta">
				<h3>EchoDeck</h3>
				<span>Stickers & Reactions</span>
			</div>
		</div>
		<div class="cooldown-pill" id="cooldown-pill">Ready to React</div>
	</div>

	<!-- Scrollable Sound & Sticker Feed -->
	<div class="scroll-feed" id="scroll-feed">
		<!-- Injected dynamically by panel.js -->
	</div>

	<!-- Bottom Volume Bar -->
	<div class="footer">
		<div class="vol-bar">
			<div class="vol-left">
				<button class="mute-btn" id="btn-mute" title="Toggle Mute">🔊</button>
				<span>Audio Volume</span>
			</div>
			<span id="vol-text">80%</span>
		</div>
		<input type="range" id="vol-slider" min="0" max="1" step="0.05" value="0.8">
		<div class="status-msg" id="status-msg">Scroll & tap any sticker to react!</div>
	</div>

	<!-- External CSP-Compliant Script -->
	<script src="panel.js"></script>
</body>
</html>
`;

const itemsJson = JSON.stringify(items.map(it => ({
	id: it.id,
	title: it.title,
	tag: it.tag,
	stickerEmoji: it.stickerEmoji,
	reactionText: it.reactionText,
	stickerBg: it.stickerBg,
	borderGlow: it.borderGlow,
	hasTake: it.hasTake,
	origB64: it.origB64,
	takeB64: it.takeB64 || it.origB64,
})));

const js = `
const ITEMS = ${itemsJson};

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

function renderStickerBoard() {
	const feed = document.getElementById('scroll-feed');
	if (!feed) return;
	feed.innerHTML = '';

	ITEMS.forEach((item) => {
		soundModes[item.id] = 'orig';

		const card = document.createElement('div');
		card.className = 'sticker-card';
		card.id = 'card-' + item.id;
		card.style.setProperty('--sticker-bg', item.stickerBg);
		card.style.setProperty('--card-glow', item.borderGlow);

		// Die-Cut Sticker Badge with Emoji Art
		const badge = document.createElement('div');
		badge.className = 'sticker-badge';
		badge.textContent = item.stickerEmoji;
		card.appendChild(badge);

		// Titles
		const title = document.createElement('div');
		title.className = 'card-title';
		title.textContent = item.title;

		const tag = document.createElement('div');
		tag.className = 'card-tag';
		tag.textContent = item.tag;

		card.appendChild(title);
		card.appendChild(tag);

		// If sound has Streamer Take, add [Orig | Take 🎙️] toggle
		if (item.hasTake) {
			const toggleBox = document.createElement('div');
			toggleBox.className = 'take-toggle';

			const btnOrig = document.createElement('button');
			btnOrig.className = 'take-btn selected';
			btnOrig.textContent = 'Orig';

			const btnTake = document.createElement('button');
			btnTake.className = 'take-btn';
			btnTake.textContent = 'Take 🎙️';

			btnOrig.addEventListener('click', (e) => {
				e.stopPropagation();
				soundModes[item.id] = 'orig';
				btnOrig.classList.add('selected');
				btnTake.classList.remove('selected');
				setStatus('Selected: ' + item.title + ' (Original)');
			});

			btnTake.addEventListener('click', (e) => {
				e.stopPropagation();
				soundModes[item.id] = 'take';
				btnTake.classList.add('selected');
				btnOrig.classList.remove('selected');
				setStatus('Selected: ' + item.title + " (Streamer's Take)");
			});

			toggleBox.appendChild(btnOrig);
			toggleBox.appendChild(btnTake);
			card.appendChild(toggleBox);
		}

		// Click to trigger sound & reaction bubble
		card.addEventListener('click', () => triggerReaction(item));

		feed.appendChild(card);
	});
}

function triggerReaction(item) {
	if (isCooldown) {
		setStatus('⏱️ Cooldown active! Please wait.');
		return;
	}

	const mode = soundModes[item.id] || 'orig';
	const b64 = mode === 'take' && item.takeB64 ? item.takeB64 : item.origB64;
	const modeLabel = mode === 'take' ? "Streamer's Take" : "Original";

	// Animate Sticker
	const card = document.getElementById('card-' + item.id);
	if (card) {
		card.classList.add('active-pop');
		setTimeout(() => card.classList.remove('active-pop'), 400);

		// Spawn floating reaction bubble
		const bubble = document.createElement('div');
		bubble.className = 'float-bubble';
		bubble.textContent = item.reactionText;
		card.appendChild(bubble);
		setTimeout(() => bubble.remove(), 600);
	}

	// Play sound
	playSound(b64);
	setStatus('🎉 Reacted: ' + item.title + ' (' + modeLabel + ')');

	// Cooldown
	startCooldown();
}

function playSound(b64) {
	if (isMuted || volume <= 0) return;
	getAudioContext();

	if (b64) {
		try {
			const audio = new Audio('data:audio/mp3;base64,' + b64);
			audio.volume = volume;
			audio.play().catch(() => playSynthFallback(300));
		} catch (e) {
			playSynthFallback(300);
		}
	} else {
		playSynthFallback(440);
	}
}

function playSynthFallback(freq) {
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
	const pill = document.getElementById('cooldown-pill');
	if (pill) {
		pill.classList.add('active');
		pill.textContent = 'Wait 2.5s';
	}

	let remaining = COOLDOWN_MS / 1000;
	const interval = setInterval(() => {
		remaining -= 0.5;
		if (remaining > 0) {
			if (pill) pill.textContent = 'Wait ' + remaining.toFixed(1) + 's';
		} else {
			clearInterval(interval);
			isCooldown = false;
			if (pill) {
				pill.classList.remove('active');
				pill.textContent = 'Ready to React';
			}
		}
	}, 500);
}

function setStatus(msg) {
	const el = document.getElementById('status-msg');
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
	renderStickerBoard();

	const slider = document.getElementById('vol-slider');
	if (slider) slider.addEventListener('input', (e) => setVolume(e.target.value));

	const mute = document.getElementById('btn-mute');
	if (mute) mute.addEventListener('click', toggleMute);

	if (window.Twitch && window.Twitch.ext) {
		window.Twitch.ext.onAuthorized((auth) => {
			setStatus('Connected to Stream: ' + auth.channelId.slice(-4));
		});
	}
});
`;

fs.writeFileSync(path.join(__dirname, '../public/panel.html'), html, 'utf8');
fs.writeFileSync(path.join(__dirname, '../public/extension/panel.html'), html, 'utf8');
fs.writeFileSync(path.join(__dirname, '../public/panel.js'), js, 'utf8');
fs.writeFileSync(path.join(__dirname, '../public/extension/panel.js'), js, 'utf8');

console.log('Successfully generated Sticker & Sound reaction deck!');

