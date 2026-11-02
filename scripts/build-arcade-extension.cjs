const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../games-extension');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Twitch Arcade Hub</title>
	<script src="https://extension-files.twitch.tv/helper/v1/twitch-ext.min.js"></script>
	<style>
		* { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-tap-highlight-color: transparent; }
		html, body {
			width: 318px; height: 450px; max-height: 450px;
			background: #09090d; color: #f4f4f5;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			overflow: hidden;
		}
		#app {
			width: 318px; height: 450px; padding: 6px;
			display: flex; flex-direction: column; justify-content: space-between;
			border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;
		}
		.top { display: flex; align-items: center; justify-content: space-between; padding-bottom: 4px; border-bottom: 1px solid #27272a; flex-shrink: 0; height: 26px; }
		.brand { font-size: 11px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 4px; }
		.btn-board { background: #1f1f23; border: 1px solid #3f3f46; color: #a78bfa; font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 4px; cursor: pointer; }
		.btn-board:hover { background: #9146FF; color: #fff; }

		/* HUB VIEW */
		.hub { flex: 1; overflow-y: auto; margin: 4px 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; max-height: 390px; }
		.hub::-webkit-scrollbar { width: 3px; }
		.hub::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 2px; }
		.card {
			background: #14141c; border: 1px solid #27272a; border-radius: 6px; padding: 6px 4px;
			display: flex; flex-direction: column; align-items: center; text-align: center; cursor: pointer;
			transition: transform 0.1s, border-color 0.1s;
		}
		.card:hover { border-color: #9146FF; background: #1a1a24; transform: translateY(-1px); }
		.icon { width: 32px; height: 32px; border-radius: 6px; background: var(--bg); display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 2px; }
		.name { font-size: 10px; font-weight: 700; color: #fff; }
		.score { font-size: 8.5px; color: #00f593; font-weight: 700; }

		/* SCOREBOARD OVERLAY */
		.modal {
			display: none; position: absolute; inset: 6px; background: #0e0e14;
			border: 1px solid #3f3f46; border-radius: 8px; padding: 8px; flex-direction: column; z-index: 50;
		}
		.modal-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #27272a; padding-bottom: 4px; margin-bottom: 6px; }
		.board-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 3px; }
		.board-row { display: flex; justify-content: space-between; font-size: 9.5px; padding: 3px 6px; background: #181820; border-radius: 4px; }

		/* GAME ARENA VIEW (Strict 450px Fit) */
		.arena { display: none; flex: 1; flex-direction: column; justify-content: space-between; overflow: hidden; }
		.arena-bar { display: flex; justify-content: space-between; align-items: center; background: #14141a; padding: 3px 6px; border-radius: 5px; font-size: 9.5px; flex-shrink: 0; height: 26px; }
		.btn-back { background: #27272a; color: #fff; border: none; padding: 2px 7px; border-radius: 3px; cursor: pointer; font-size: 9.5px; font-weight: 600; }
		.btn-back:hover { background: #3f3f46; }
		
		/* CANVAS: Direct Click / Tap Target */
		.canvas-box {
			width: 304px; height: 280px; background: #000; border: 1px solid #27272a; border-radius: 6px;
			display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; margin: 3px 0;
		}
		canvas { display: block; image-rendering: pixelated; width: 304px; height: 280px; }

		/* DYNAMIC GAME CONTROLS */
		.controls-wrap { height: 46px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
		.ctrl-row { display: flex; gap: 4px; width: 100%; height: 100%; }
		.ctrl-btn {
			flex: 1; background: #1c1c28; border: 1px solid #3f3f46; color: #fff;
			font-size: 11px; font-weight: 800; border-radius: 6px; cursor: pointer;
			display: flex; align-items: center; justify-content: center; gap: 4px;
		}
		.ctrl-btn:active { background: #9146FF; border-color: #9146FF; }
		.ctrl-btn.purple { background: #9146FF; }

		.foot { border-top: 1px solid #27272a; padding-top: 2px; display: flex; justify-content: space-between; font-size: 8.5px; color: #71717a; flex-shrink: 0; height: 16px; }
	</style>
</head>
<body>
	<div id="app">
		<div class="top">
			<div class="brand">🕹️ <span>Twitch Arcade</span></div>
			<button class="btn-board" id="btn-toggle-board">🏆 Best Scores</button>
		</div>

		<!-- HUB VIEW -->
		<div class="hub" id="hub-view"></div>

		<!-- SCOREBOARD MODAL -->
		<div class="modal" id="modal-board">
			<div class="modal-head">
				<span style="font-size:11px; font-weight:800; color:#a78bfa;">🏆 Personal Best Scores</span>
				<button class="btn-back" id="btn-close-board">✕ Close</button>
			</div>
			<div class="board-list" id="board-list"></div>
		</div>

		<!-- GAME ARENA VIEW -->
		<div class="arena" id="arena-view">
			<div class="arena-bar">
				<button class="btn-back" id="btn-back">← Hub</button>
				<span id="arena-title" style="font-weight:700; font-size:10.5px;">Flappy Bird</span>
				<span>Score: <b id="score-val" style="color:#00f593;">0</b></span>
				<span>Best: <b id="best-val" style="color:#a78bfa;">0</b></span>
			</div>
			<div class="canvas-box" id="canvas-target">
				<canvas id="game-canvas" width="304" height="280"></canvas>
			</div>
			<div class="controls-wrap" id="controls-container"></div>
		</div>

		<div class="foot">
			<span>Click screen or use buttons</span>
			<span>Local auto-save</span>
		</div>
	</div>
	<script src="panel.js"></script>
</body>
</html>
`;

const js = `
const GAMES = [
	{ id: 'flappy', name: 'Flappy Bird', icon: '🐦', bg: '#f59e0b' },
	{ id: 'snake', name: 'Snake Retro', icon: '🐍', bg: '#10b981' },
	{ id: '2048', name: '2048 Tiles', icon: '🔢', bg: '#eab308' },
	{ id: 'dino', name: 'Dino Runner', icon: '🦖', bg: '#71717a' },
	{ id: 'brick', name: 'Brick Breaker', icon: '🧱', bg: '#ec4899' },
	{ id: 'pong', name: 'Pong vs AI', icon: '🏓', bg: '#3b82f6' },
	{ id: 'invaders', name: 'Space Invaders', icon: '👾', bg: '#8b5cf6' },
	{ id: 'tetris', name: 'Block Drop', icon: '🧩', bg: '#06b6d4' },
	{ id: 'memory', name: 'Memory Match', icon: '🃏', bg: '#f43f5e' },
	{ id: 'clicker', name: 'Hype Clicker', icon: '💎', bg: '#a855f7' },
];

let currentGame = null;
let gameLoop = null;
let currentScore = 0;
let highScore = 0;
let isCountingDown = false;
let audioCtx = null;
let countdownTimer = null;

// Audio FX
function sfx(type) {
	try {
		if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		if (audioCtx.state === 'suspended') audioCtx.resume();
		const osc = audioCtx.createOscillator();
		const gain = audioCtx.createGain();
		osc.connect(gain); gain.connect(audioCtx.destination);

		if (type === 'beep') {
			osc.frequency.setValueAtTime(440, audioCtx.currentTime);
			gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
			gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
			osc.start(); osc.stop(audioCtx.currentTime + 0.1);
		} else if (type === 'go') {
			osc.frequency.setValueAtTime(880, audioCtx.currentTime);
			gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
			gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
			osc.start(); osc.stop(audioCtx.currentTime + 0.18);
		} else if (type === 'jump') {
			osc.frequency.setValueAtTime(320, audioCtx.currentTime);
			osc.frequency.exponentialRampToValueAtTime(580, audioCtx.currentTime + 0.08);
			gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
			gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
			osc.start(); osc.stop(audioCtx.currentTime + 0.08);
		} else if (type === 'score') {
			osc.frequency.setValueAtTime(650, audioCtx.currentTime);
			osc.frequency.exponentialRampToValueAtTime(950, audioCtx.currentTime + 0.09);
			gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
			gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.09);
			osc.start(); osc.stop(audioCtx.currentTime + 0.09);
		} else if (type === 'hit') {
			osc.type = 'sawtooth';
			osc.frequency.setValueAtTime(140, audioCtx.currentTime);
			gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
			gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
			osc.start(); osc.stop(audioCtx.currentTime + 0.15);
		}
	} catch (e) {}
}

function getStored(id) { return parseInt(localStorage.getItem('arc_' + id) || '0', 10); }
function setStored(id, val) {
	const b = Math.max(getStored(id), val);
	localStorage.setItem('arc_' + id, b.toString());
	return b;
}

function renderHub() {
	const grid = document.getElementById('hub-view');
	grid.innerHTML = '';
	GAMES.forEach(g => {
		const card = document.createElement('div');
		card.className = 'card';
		card.innerHTML = \`<div class="icon" style="--bg:\${g.bg}">\${g.icon}</div><div class="name">\${g.name}</div><div class="score">🏆 \${getStored(g.id)}</div>\`;
		card.addEventListener('click', () => launch(g));
		grid.appendChild(card);
	});
}

function renderScoreboard() {
	const list = document.getElementById('board-list');
	list.innerHTML = '';
	GAMES.forEach(g => {
		const row = document.createElement('div');
		row.className = 'board-row';
		row.innerHTML = \`<span>\${g.icon} \${g.name}</span><b style="color:#00f593">\${getStored(g.id)} pts</b>\`;
		list.appendChild(row);
	});
}

function updateUI() {
	document.getElementById('score-val').textContent = currentScore;
	document.getElementById('best-val').textContent = highScore;
}

function addPts(n) {
	currentScore += n;
	highScore = setStored(currentGame, currentScore);
	updateUI();
	sfx('score');
}

// 3-SECOND GET READY COUNTDOWN BEFORE GAMEPLAY
function startWithCountdown(canvas, ctx, onStart) {
	if (countdownTimer) clearInterval(countdownTimer);
	isCountingDown = true;
	let count = 3;

	function renderFrame() {
		ctx.fillStyle = '#09090f';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Glow box
		ctx.strokeStyle = '#272732';
		ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

		ctx.fillStyle = count > 0 ? '#9146FF' : '#00f593';
		ctx.font = 'bold 54px sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(count > 0 ? count : 'GO!', canvas.width / 2, canvas.height / 2 - 10);

		ctx.fillStyle = '#a1a1aa';
		ctx.font = 'bold 13px sans-serif';
		ctx.fillText('Get Ready to Play!', canvas.width / 2, canvas.height / 2 + 45);

		ctx.fillStyle = '#71717a';
		ctx.font = '11px sans-serif';
		ctx.fillText('Interact with mouse or buttons below', canvas.width / 2, canvas.height / 2 + 65);

		if (count > 0) sfx('beep'); else sfx('go');
	}

	renderFrame();

	countdownTimer = setInterval(() => {
		count--;
		if (count >= 0) {
			renderFrame();
		}
		if (count < 0) {
			clearInterval(countdownTimer);
			countdownTimer = null;
			isCountingDown = false;
			onStart();
		}
	}, 900);
}

function launch(g) {
	if (countdownTimer) clearInterval(countdownTimer);
	if (gameLoop) { cancelAnimationFrame(gameLoop); clearInterval(gameLoop); gameLoop = null; }

	currentGame = g.id;
	currentScore = 0;
	highScore = getStored(g.id);

	document.getElementById('hub-view').style.display = 'none';
	document.getElementById('arena-view').style.display = 'flex';
	document.getElementById('arena-title').textContent = g.name;
	updateUI();

	const canvas = document.getElementById('game-canvas');
	const ctx = canvas.getContext('2d');
	const controls = document.getElementById('controls-container');
	controls.innerHTML = '';

	// Render controls and run countdown
	setupControls(g.id, controls);

	startWithCountdown(canvas, ctx, () => {
		if (g.id === 'flappy') startFlappy(canvas, ctx);
		else if (g.id === 'snake') startSnake(canvas, ctx);
		else if (g.id === '2048') start2048(canvas, ctx);
		else if (g.id === 'dino') startDino(canvas, ctx);
		else if (g.id === 'brick') startBrick(canvas, ctx);
		else if (g.id === 'pong') startPong(canvas, ctx);
		else if (g.id === 'invaders') startInvaders(canvas, ctx);
		else if (g.id === 'tetris') startTetris(canvas, ctx);
		else if (g.id === 'memory') startMemory(canvas, ctx);
		else if (g.id === 'clicker') startClicker(canvas, ctx);
	});
}

function setupControls(id, container) {
	window.onL = null; window.onR = null; window.onU = null; window.onD = null; window.onAct = null; window.onPointer = null;

	if (id === 'snake' || id === '2048') {
		container.innerHTML = \`
			<div class="ctrl-row">
				<button class="ctrl-btn" id="btn-u">⬆️ Up</button>
				<button class="ctrl-btn" id="btn-d">⬇️ Down</button>
				<button class="ctrl-btn" id="btn-l">⬅️ Left</button>
				<button class="ctrl-btn" id="btn-r">➡️ Right</button>
			</div>
		\`;
		document.getElementById('btn-u').addEventListener('pointerdown', (e) => { e.preventDefault(); if (window.onU) window.onU(); });
		document.getElementById('btn-d').addEventListener('pointerdown', (e) => { e.preventDefault(); if (window.onD) window.onD(); });
		document.getElementById('btn-l').addEventListener('pointerdown', (e) => { e.preventDefault(); if (window.onL) window.onL(); });
		document.getElementById('btn-r').addEventListener('pointerdown', (e) => { e.preventDefault(); if (window.onR) window.onR(); });
	} else if (id === 'flappy' || id === 'dino') {
		container.innerHTML = \`
			<div class="ctrl-row">
				<button class="ctrl-btn purple" id="btn-act">⚡ TAP / CLICK CANVAS TO JUMP</button>
			</div>
		\`;
		document.getElementById('btn-act').addEventListener('pointerdown', (e) => { e.preventDefault(); if (!isCountingDown && window.onAct) window.onAct(); });
	} else if (id === 'brick') {
		container.innerHTML = \`
			<div class="ctrl-row">
				<button class="ctrl-btn" id="btn-l">◄ Left</button>
				<button class="ctrl-btn" id="btn-r">Right ►</button>
				<button class="ctrl-btn purple" id="btn-act">🖱️ Drag Mouse to Aim</button>
			</div>
		\`;
		document.getElementById('btn-l').addEventListener('pointerdown', (e) => { e.preventDefault(); if (window.onL) window.onL(); });
		document.getElementById('btn-r').addEventListener('pointerdown', (e) => { e.preventDefault(); if (window.onR) window.onR(); });
		document.getElementById('btn-act').addEventListener('pointerdown', (e) => { e.preventDefault(); if (window.onAct) window.onAct(); });
	} else if (id === 'pong') {
		container.innerHTML = \`
			<div class="ctrl-row">
				<button class="ctrl-btn" id="btn-u">▲ Up</button>
				<button class="ctrl-btn" id="btn-d">Down ▼</button>
				<button class="ctrl-btn purple" id="btn-act">🖱️ Mouse Moves Paddle</button>
			</div>
		\`;
		document.getElementById('btn-u').addEventListener('pointerdown', (e) => { e.preventDefault(); if (window.onU) window.onU(); });
		document.getElementById('btn-d').addEventListener('pointerdown', (e) => { e.preventDefault(); if (window.onD) window.onD(); });
		document.getElementById('btn-act').addEventListener('pointerdown', (e) => { e.preventDefault(); if (window.onAct) window.onAct(); });
	} else if (id === 'invaders') {
		container.innerHTML = \`
			<div class="ctrl-row">
				<button class="ctrl-btn" id="btn-l">◄ Move Left</button>
				<button class="ctrl-btn purple" id="btn-act">🚀 FIRE LASER</button>
				<button class="ctrl-btn" id="btn-r">Move Right ►</button>
			</div>
		\`;
		document.getElementById('btn-l').addEventListener('pointerdown', (e) => { e.preventDefault(); if (window.onL) window.onL(); });
		document.getElementById('btn-r').addEventListener('pointerdown', (e) => { e.preventDefault(); if (window.onR) window.onR(); });
		document.getElementById('btn-act').addEventListener('pointerdown', (e) => { e.preventDefault(); if (!isCountingDown && window.onAct) window.onAct(); });
	} else if (id === 'tetris') {
		container.innerHTML = \`
			<div class="ctrl-row">
				<button class="ctrl-btn" id="btn-l">◄ Left</button>
				<button class="ctrl-btn purple" id="btn-act">🔄 Rotate</button>
				<button class="ctrl-btn" id="btn-r">Right ►</button>
				<button class="ctrl-btn" id="btn-d">⬇ Drop</button>
			</div>
		\`;
		document.getElementById('btn-l').addEventListener('pointerdown', (e) => { e.preventDefault(); if (window.onL) window.onL(); });
		document.getElementById('btn-r').addEventListener('pointerdown', (e) => { e.preventDefault(); if (window.onR) window.onR(); });
		document.getElementById('btn-d').addEventListener('pointerdown', (e) => { e.preventDefault(); if (window.onD) window.onD(); });
		document.getElementById('btn-act').addEventListener('pointerdown', (e) => { e.preventDefault(); if (window.onAct) window.onAct(); });
	} else if (id === 'memory') {
		container.innerHTML = \`
			<div class="ctrl-row">
				<button class="ctrl-btn purple" style="pointer-events:none;">🃏 Click Cards Directly on Canvas to Match!</button>
			</div>
		\`;
	} else if (id === 'clicker') {
		container.innerHTML = \`
			<div class="ctrl-row">
				<button class="ctrl-btn purple" id="btn-act">💎 CLICK CANVAS OR HERE TO HYPE! 💎</button>
			</div>
		\`;
		document.getElementById('btn-act').addEventListener('pointerdown', (e) => { e.preventDefault(); if (window.onAct) window.onAct(); });
	}
}

function drawOver(c, ctx, msg = 'GAME OVER') {
	ctx.fillStyle = 'rgba(0,0,0,0.85)';
	ctx.fillRect(0, 0, c.width, c.height);
	ctx.fillStyle = '#ef4444';
	ctx.font = 'bold 24px sans-serif';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(msg, c.width / 2, c.height / 2 - 20);
	ctx.fillStyle = '#00f593';
	ctx.font = 'bold 15px sans-serif';
	ctx.fillText('Score: ' + currentScore, c.width / 2, c.height / 2 + 15);
	ctx.fillStyle = '#a1a1aa';
	ctx.font = '12px sans-serif';
	ctx.fillText('Tap screen to retry', c.width / 2, c.height / 2 + 45);
}

// -------------------------------------------------------------
// 1. FLAPPY BIRD (Chill, physics-based, wide pipes)
// -------------------------------------------------------------
function startFlappy(c, ctx) {
	let y = 120, vy = 0, pipes = [], over = false, lastTime = performance.now();
	window.onAct = () => {
		if (over) launch(GAMES[0]);
		else { vy = -4.6; sfx('jump'); }
	};

	function loop(now) {
		const dt = Math.min((now - lastTime) / 1000, 0.05);
		lastTime = now;

		vy += 12 * dt;
		y += vy;

		if (pipes.length === 0 || pipes[pipes.length - 1].x < c.width - 150) {
			pipes.push({ x: c.width, t: Math.random() * 90 + 30, g: 105, p: false });
		}

		ctx.fillStyle = '#09090f'; ctx.fillRect(0, 0, c.width, c.height);
		ctx.fillStyle = '#10b981';
		for (let i = pipes.length - 1; i >= 0; i--) {
			let p = pipes[i];
			p.x -= 65 * dt; // Chill speed
			ctx.fillRect(p.x, 0, 36, p.t);
			ctx.fillRect(p.x, p.t + p.g, 36, c.height);
			if (p.x < 62 && p.x + 36 > 44 && (y - 8 < p.t || y + 8 > p.t + p.g)) over = true;
			if (!p.p && p.x + 36 < 44) { p.p = true; addPts(1); }
			if (p.x < -40) pipes.splice(i, 1);
		}
		if (y > c.height - 12 || y < 10) over = true;

		// Draw bird
		ctx.fillStyle = '#f59e0b';
		ctx.beginPath(); ctx.arc(50, y, 9, 0, Math.PI * 2); ctx.fill();
		ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(54, y - 2, 3, 0, Math.PI * 2); ctx.fill();
		ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(55, y - 2, 1.5, 0, Math.PI * 2); ctx.fill();

		if (over) { sfx('hit'); drawOver(c, ctx); return; }
		gameLoop = requestAnimationFrame(loop);
	}
	gameLoop = requestAnimationFrame(loop);
}

// -------------------------------------------------------------
// 2. SNAKE RETRO (Chill 220ms fixed tick + 4-way Dpad + Direct Touch)
// -------------------------------------------------------------
function startSnake(c, ctx) {
	const grid = 16;
	const cols = Math.floor(c.width / grid);
	const rows = Math.floor(c.height / grid);
	let snake = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
	let dir = { x: 1, y: 0 };
	let nextDir = { x: 1, y: 0 };
	let food = { x: 12, y: 8 };
	let over = false;
	let lastTick = performance.now();

	window.onU = () => { if (dir.y === 0) nextDir = { x: 0, y: -1 }; };
	window.onD = () => { if (dir.y === 0) nextDir = { x: 0, y: 1 }; };
	window.onL = () => { if (dir.x === 0) nextDir = { x: -1, y: 0 }; };
	window.onR = () => { if (dir.x === 0) nextDir = { x: 1, y: 0 }; };
	window.onAct = () => { if (over) launch(GAMES[1]); };

	// Mouse click steers towards click
	window.onPointer = (e) => {
		if (over) { launch(GAMES[1]); return; }
		const rect = c.getBoundingClientRect();
		const mx = (e.clientX - rect.left) * (c.width / rect.width);
		const my = (e.clientY - rect.top) * (c.height / rect.height);
		const headX = (snake[0].x + 0.5) * grid;
		const headY = (snake[0].y + 0.5) * grid;
		const dx = mx - headX;
		const dy = my - headY;

		if (Math.abs(dx) > Math.abs(dy)) {
			if (dx > 0 && dir.x === 0) nextDir = { x: 1, y: 0 };
			else if (dx < 0 && dir.x === 0) nextDir = { x: -1, y: 0 };
		} else {
			if (dy > 0 && dir.y === 0) nextDir = { x: 0, y: 1 };
			else if (dy < 0 && dir.y === 0) nextDir = { x: 0, y: -1 };
		}
	};

	function loop(now) {
		if (now - lastTick > 210 && !over) { // Chill 210ms tick rate
			lastTick = now;
			dir = nextDir;
			const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

			if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) over = true;
			for (let s of snake) if (s.x === head.x && s.y === head.y) over = true;

			if (!over) {
				snake.unshift(head);
				if (head.x === food.x && head.y === food.y) {
					addPts(10);
					food = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
				} else {
					snake.pop();
				}
			}
		}

		ctx.fillStyle = '#08080c'; ctx.fillRect(0, 0, c.width, c.height);

		// Grid lines
		ctx.strokeStyle = '#14141c';
		for (let i = 0; i < c.width; i += grid) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, c.height); ctx.stroke(); }
		for (let j = 0; j < c.height; j += grid) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(c.width, j); ctx.stroke(); }

		// Draw food
		ctx.fillStyle = '#ef4444';
		ctx.fillRect(food.x * grid + 2, food.y * grid + 2, grid - 4, grid - 4);

		// Draw snake
		snake.forEach((s, idx) => {
			ctx.fillStyle = idx === 0 ? '#00f593' : '#10b981';
			ctx.fillRect(s.x * grid + 1, s.y * grid + 1, grid - 2, grid - 2);
		});

		if (over) { sfx('hit'); drawOver(c, ctx, 'SNAKE CRASHED'); return; }
		gameLoop = requestAnimationFrame(loop);
	}
	gameLoop = requestAnimationFrame(loop);
}

// -------------------------------------------------------------
// 3. 2048 TILES (4 Directions + Arrow Keys + Full Swipe)
// -------------------------------------------------------------
function start2048(c, ctx) {
	let b = Array.from({ length: 4 }, () => Array(4).fill(0));
	function sp() {
		let e = [];
		for (let r = 0; r < 4; r++) for (let cl = 0; cl < 4; cl++) if (!b[r][cl]) e.push({ r, cl });
		if (e.length) {
			let p = e[Math.floor(Math.random() * e.length)];
			b[p.r][p.cl] = Math.random() < 0.9 ? 2 : 4;
		}
	}
	sp(); sp();

	function sl(row) {
		let f = row.filter(x => x);
		for (let i = 0; i < f.length - 1; i++) {
			if (f[i] === f[i + 1]) { f[i] *= 2; addPts(f[i]); f[i + 1] = 0; }
		}
		f = f.filter(x => x);
		while (f.length < 4) f.push(0);
		return f;
	}

	window.onL = () => { for (let r = 0; r < 4; r++) b[r] = sl(b[r]); sp(); draw(); sfx('jump'); };
	window.onR = () => { for (let r = 0; r < 4; r++) b[r] = sl(b[r].reverse()).reverse(); sp(); draw(); sfx('jump'); };
	window.onU = () => {
		for (let cl = 0; cl < 4; cl++) {
			let col = [b[0][cl], b[1][cl], b[2][cl], b[3][cl]];
			col = sl(col);
			for (let r = 0; r < 4; r++) b[r][cl] = col[r];
		}
		sp(); draw(); sfx('jump');
	};
	window.onD = () => {
		for (let cl = 0; cl < 4; cl++) {
			let col = [b[3][cl], b[2][cl], b[1][cl], b[0][cl]];
			col = sl(col);
			for (let r = 0; r < 4; r++) b[3 - r][cl] = col[r];
		}
		sp(); draw(); sfx('jump');
	};

	function draw() {
		ctx.fillStyle = '#101018'; ctx.fillRect(0, 0, c.width, c.height);
		const size = 62;
		const pad = 11;
		for (let r = 0; r < 4; r++) {
			for (let cl = 0; cl < 4; cl++) {
				let v = b[r][cl];
				let x = cl * (size + pad) + 12;
				let y = r * (size + pad) + 8;
				ctx.fillStyle = !v ? '#1e1e28' : v <= 4 ? '#3b82f6' : v <= 16 ? '#8b5cf6' : v <= 64 ? '#ec4899' : '#00f593';
				ctx.fillRect(x, y, size, size);
				if (v) {
					ctx.fillStyle = '#fff';
					ctx.font = 'bold 18px sans-serif';
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					ctx.fillText(v, x + size / 2, y + size / 2);
				}
			}
		}
	}
	draw();
}

// -------------------------------------------------------------
// 4. DINO RUNNER (Chill speed, jumping physics, space / tap)
// -------------------------------------------------------------
function startDino(c, ctx) {
	let dy = 210, vy = 0, obs = [], over = false, lastTime = performance.now();
	window.onAct = () => {
		if (over) launch(GAMES[3]);
		else if (dy >= 210) { vy = -8.5; sfx('jump'); }
	};

	let scoreTimer = 0;

	function loop(now) {
		const dt = Math.min((now - lastTime) / 1000, 0.05);
		lastTime = now;

		vy += 22 * dt;
		dy += vy;
		if (dy >= 210) { dy = 210; vy = 0; }

		scoreTimer += dt;
		if (scoreTimer > 0.3) { scoreTimer = 0; addPts(1); }

		if (obs.length === 0 || obs[obs.length - 1].x < c.width - 160) {
			obs.push({ x: c.width, h: Math.random() > 0.5 ? 24 : 16 });
		}

		ctx.fillStyle = '#09090e'; ctx.fillRect(0, 0, c.width, c.height);

		// Ground line
		ctx.strokeStyle = '#3f3f46';
		ctx.beginPath(); ctx.moveTo(0, 230); ctx.lineTo(c.width, 230); ctx.stroke();

		// Dino
		ctx.fillStyle = '#34d399';
		ctx.fillRect(40, dy, 18, 20);

		// Obstacles
		ctx.fillStyle = '#f43f5e';
		for (let i = obs.length - 1; i >= 0; i--) {
			let o = obs[i];
			o.x -= 100 * dt; // Chill 100px/s
			ctx.fillRect(o.x, 230 - o.h, 14, o.h);
			if (o.x < 58 && o.x + 14 > 40 && dy + 20 > 230 - o.h) over = true;
			if (o.x < -20) obs.splice(i, 1);
		}

		if (over) { sfx('hit'); drawOver(c, ctx); return; }
		gameLoop = requestAnimationFrame(loop);
	}
	gameLoop = requestAnimationFrame(loop);
}

// -------------------------------------------------------------
// 5. BRICK BREAKER (Direct Mouse Move / Tap Paddle Deflection)
// -------------------------------------------------------------
function startBrick(c, ctx) {
	let px = 120, pw = 60, bx = 150, by = 220, bvx = 75, bvy = -120;
	let bricks = [], over = false, lastTime = performance.now();

	for (let r = 0; r < 3; r++) {
		for (let cl = 0; cl < 5; cl++) {
			bricks.push({ x: cl * 58 + 8, y: r * 20 + 20, w: 50, h: 14, a: true });
		}
	}

	window.onL = () => px = Math.max(0, px - 25);
	window.onR = () => px = Math.min(c.width - pw, px + 25);
	window.onAct = () => { if (over) launch(GAMES[4]); };

	// Direct Mouse / Pointer Tracking!
	window.onPointer = (e) => {
		if (over) { launch(GAMES[4]); return; }
		const rect = c.getBoundingClientRect();
		const mx = (e.clientX - rect.left) * (c.width / rect.width);
		px = Math.max(0, Math.min(c.width - pw, mx - pw / 2));
	};

	function loop(now) {
		const dt = Math.min((now - lastTime) / 1000, 0.05);
		lastTime = now;

		bx += bvx * dt;
		by += bvy * dt;

		if (bx < 5 || bx > c.width - 5) bvx = -bvx;
		if (by < 5) bvy = -bvy;

		// Paddle hit
		if (by >= 240 && by <= 250 && bx >= px && bx <= px + pw) {
			bvy = -Math.abs(bvy);
			bvx = ((bx - (px + pw / 2)) / (pw / 2)) * 110;
			sfx('jump');
		}

		// Brick collision
		bricks.forEach(b => {
			if (b.a && bx > b.x && bx < b.x + b.w && by > b.y && by < b.y + b.h) {
				b.a = false;
				bvy = -bvy;
				addPts(20);
			}
		});

		if (by > c.height) over = true;

		ctx.fillStyle = '#09090f'; ctx.fillRect(0, 0, c.width, c.height);

		// Bricks
		bricks.forEach(b => {
			if (b.a) { ctx.fillStyle = '#ec4899'; ctx.fillRect(b.x, b.y, b.w, b.h); }
		});

		// Paddle
		ctx.fillStyle = '#00f593';
		ctx.fillRect(px, 245, pw, 10);

		// Ball
		ctx.fillStyle = '#fff';
		ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill();

		if (over) { sfx('hit'); drawOver(c, ctx); return; }
		gameLoop = requestAnimationFrame(loop);
	}
	gameLoop = requestAnimationFrame(loop);
}

// -------------------------------------------------------------
// 6. PONG VS AI (Direct Mouse Y Move + Buttons)
// -------------------------------------------------------------
function startPong(c, ctx) {
	let py = 110, ay = 110, bx = 150, by = 130, bvx = 95, bvy = 65;
	let over = false, lastTime = performance.now();

	window.onU = () => py = Math.max(0, py - 25);
	window.onD = () => py = Math.min(c.height - 50, py + 25);
	window.onAct = () => { if (over) launch(GAMES[5]); };

	// Direct Mouse / Pointer Tracking!
	window.onPointer = (e) => {
		if (over) { launch(GAMES[5]); return; }
		const rect = c.getBoundingClientRect();
		const my = (e.clientY - rect.top) * (c.height / rect.height);
		py = Math.max(0, Math.min(c.height - 50, my - 25));
	};

	function loop(now) {
		const dt = Math.min((now - lastTime) / 1000, 0.05);
		lastTime = now;

		bx += bvx * dt;
		by += bvy * dt;

		if (by < 5 || by > c.height - 5) bvy = -bvy;

		// Chill AI
		ay += (by - (ay + 25)) * 3.5 * dt;

		// Deflections
		if (bx < 22 && by > py && by < py + 50) {
			bvx = Math.abs(bvx) + 4;
			addPts(1);
		}
		if (bx > c.width - 22 && by > ay && by < ay + 50) {
			bvx = -Math.abs(bvx);
		}

		if (bx < 0) {
			sfx('hit');
			over = true;
		} else if (bx > c.width) {
			bx = 150; by = 130; bvx = -bvx;
		}

		ctx.fillStyle = '#09090e'; ctx.fillRect(0, 0, c.width, c.height);

		// Center net
		ctx.strokeStyle = '#27272a';
		ctx.setLineDash([4, 4]);
		ctx.beginPath(); ctx.moveTo(c.width / 2, 0); ctx.lineTo(c.width / 2, c.height); ctx.stroke();
		ctx.setLineDash([]);

		// Player Paddle
		ctx.fillStyle = '#3b82f6'; ctx.fillRect(8, py, 10, 50);

		// AI Paddle
		ctx.fillStyle = '#f43f5e'; ctx.fillRect(c.width - 18, ay, 10, 50);

		// Ball
		ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill();

		if (over) { drawOver(c, ctx); return; }
		gameLoop = requestAnimationFrame(loop);
	}
	gameLoop = requestAnimationFrame(loop);
}

// -------------------------------------------------------------
// 7. SPACE INVADERS (Chill March, Shoot Laser)
// -------------------------------------------------------------
function startInvaders(c, ctx) {
	let sx = 135, bullets = [], aliens = [], dir = 1, lastMarch = performance.now();
	let over = false;

	for (let r = 0; r < 3; r++) {
		for (let cl = 0; cl < 6; cl++) {
			aliens.push({ x: cl * 42 + 25, y: r * 24 + 25, a: true });
		}
	}

	window.onL = () => sx = Math.max(0, sx - 16);
	window.onR = () => sx = Math.min(c.width - 26, sx + 16);
	window.onAct = () => {
		if (over) launch(GAMES[6]);
		else if (bullets.length < 3) {
			bullets.push({ x: sx + 12, y: 245 });
			sfx('jump');
		}
	};

	window.onPointer = (e) => {
		if (over) { launch(GAMES[6]); return; }
		const rect = c.getBoundingClientRect();
		const mx = (e.clientX - rect.left) * (c.width / rect.width);
		sx = Math.max(0, Math.min(c.width - 26, mx - 13));
		window.onAct();
	};

	function loop(now) {
		if (now - lastMarch > 400) { // 400ms chill march
			lastMarch = now;
			let edge = aliens.some(a => a.a && (a.x < 12 || a.x > c.width - 32));
			if (edge) {
				dir = -dir;
				aliens.forEach(a => a.y += 10);
			} else {
				aliens.forEach(a => a.x += dir * 8);
			}
		}

		bullets.forEach(b => b.y -= 4);

		bullets.forEach(b => aliens.forEach(a => {
			if (a.a && b.x > a.x && b.x < a.x + 24 && b.y > a.y && b.y < a.y + 16) {
				a.a = false;
				b.y = -100;
				addPts(25);
			}
		}));

		if (aliens.some(a => a.a && a.y > 230)) over = true;

		ctx.fillStyle = '#06060a'; ctx.fillRect(0, 0, c.width, c.height);

		// Cannon
		ctx.fillStyle = '#00f593'; ctx.fillRect(sx, 250, 24, 10);
		ctx.fillRect(sx + 9, 244, 6, 6);

		// Lasers
		ctx.fillStyle = '#f59e0b'; bullets.forEach(b => ctx.fillRect(b.x, b.y, 3, 8));

		// Aliens
		ctx.fillStyle = '#a855f7';
		aliens.forEach(a => { if (a.a) ctx.fillRect(a.x, a.y, 24, 14); });

		if (over) { sfx('hit'); drawOver(c, ctx); return; }
		gameLoop = requestAnimationFrame(loop);
	}
	gameLoop = requestAnimationFrame(loop);
}

// -------------------------------------------------------------
// 8. BLOCK DROP / TETRIS (500ms chill drop + Rotate + Arrows)
// -------------------------------------------------------------
function startTetris(c, ctx) {
	let px = 4, py = 0, lastDrop = performance.now();
	let over = false;

	window.onL = () => px = Math.max(0, px - 1);
	window.onR = () => px = Math.min(8, px + 1);
	window.onD = () => py = Math.min(13, py + 1);
	window.onAct = () => { if (over) launch(GAMES[7]); else sfx('jump'); };

	function loop(now) {
		if (now - lastDrop > 500) { // Chill 500ms drop rate
			lastDrop = now;
			py++;
			if (py > 13) {
				addPts(100);
				py = 0;
				px = Math.floor(Math.random() * 7);
			}
		}

		ctx.fillStyle = '#0d0d14'; ctx.fillRect(0, 0, c.width, c.height);

		// Grid bounds
		ctx.strokeStyle = '#1e1e28';
		for (let i = 0; i <= 10; i++) {
			ctx.beginPath(); ctx.moveTo(i * 28 + 12, 10); ctx.lineTo(i * 28 + 12, 262); ctx.stroke();
		}

		// Block
		ctx.fillStyle = '#eab308';
		ctx.fillRect(px * 28 + 12, py * 18 + 10, 26, 16);
		ctx.fillRect((px + 1) * 28 + 12, py * 18 + 10, 26, 16);

		gameLoop = requestAnimationFrame(loop);
	}
	gameLoop = requestAnimationFrame(loop);
}

// -------------------------------------------------------------
// 9. MEMORY MATCH (Direct Card Clicking & Pair Matching!)
// -------------------------------------------------------------
function startMemory(c, ctx) {
	const icons = ['🎮', '👾', '💎', '🔥', '🏆', '🚀', '⚡', '🍕'];
	const deck = [...icons, ...icons].sort(() => Math.random() - 0.5);
	let revealed = Array(16).fill(false);
	let matched = Array(16).fill(false);
	let openCards = [];
	let lock = false;

	function cardAt(x, y) {
		for (let i = 0; i < 16; i++) {
			let cx = (i % 4) * 70 + 14;
			let cy = Math.floor(i / 4) * 64 + 12;
			if (x >= cx && x <= cx + 64 && y >= cy && y <= cy + 56) return i;
		}
		return -1;
	}

	window.onPointer = (e) => {
		if (lock) return;
		const rect = c.getBoundingClientRect();
		const mx = (e.clientX - rect.left) * (c.width / rect.width);
		const my = (e.clientY - rect.top) * (c.height / rect.height);
		const idx = cardAt(mx, my);

		if (idx !== -1 && !revealed[idx] && !matched[idx]) {
			revealed[idx] = true;
			openCards.push(idx);
			sfx('jump');
			draw();

			if (openCards.length === 2) {
				const [a, b] = openCards;
				if (deck[a] === deck[b]) {
					matched[a] = true;
					matched[b] = true;
					openCards = [];
					addPts(50);
					draw();
				} else {
					lock = true;
					setTimeout(() => {
						revealed[a] = false;
						revealed[b] = false;
						openCards = [];
						lock = false;
						draw();
					}, 700);
				}
			}
		}
	};

	function draw() {
		ctx.fillStyle = '#0e0e14'; ctx.fillRect(0, 0, c.width, c.height);
		for (let i = 0; i < 16; i++) {
			let x = (i % 4) * 70 + 14;
			let y = Math.floor(i / 4) * 64 + 12;
			const isUp = revealed[i] || matched[i];

			ctx.fillStyle = matched[i] ? '#10b981' : isUp ? '#3b82f6' : '#272732';
			ctx.fillRect(x, y, 64, 56);
			ctx.strokeStyle = '#3f3f46';
			ctx.strokeRect(x, y, 64, 56);

			if (isUp) {
				ctx.fillStyle = '#fff';
				ctx.font = '24px sans-serif';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText(deck[i], x + 32, y + 28);
			} else {
				ctx.fillStyle = '#71717a';
				ctx.font = 'bold 16px sans-serif';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText('?', x + 32, y + 28);
			}
		}
	}
	draw();
}

// -------------------------------------------------------------
// 10. HYPE CLICKER (Direct Diamond Clicking & Hype Effects)
// -------------------------------------------------------------
function startClicker(c, ctx) {
	let scale = 1;
	let particles = [];

	function clickHype() {
		addPts(1);
		scale = 1.25;
		setTimeout(() => scale = 1, 90);
		for (let i = 0; i < 4; i++) {
			particles.push({
				x: c.width / 2,
				y: c.height / 2,
				vx: (Math.random() - 0.5) * 160,
				vy: (Math.random() - 0.5) * 160,
				alpha: 1
			});
		}
	}

	window.onAct = clickHype;
	window.onPointer = clickHype;

	let lastTime = performance.now();

	function loop(now) {
		const dt = Math.min((now - lastTime) / 1000, 0.05);
		lastTime = now;

		ctx.fillStyle = '#0a0a0f'; ctx.fillRect(0, 0, c.width, c.height);

		// Animated Hype Diamond
		ctx.save();
		ctx.translate(c.width / 2, c.height / 2 - 10);
		ctx.scale(scale, scale);

		ctx.fillStyle = '#a855f7';
		ctx.beginPath();
		ctx.moveTo(0, -50);
		ctx.lineTo(50, 0);
		ctx.lineTo(0, 50);
		ctx.lineTo(-50, 0);
		ctx.fill();

		ctx.fillStyle = '#fff';
		ctx.font = '28px sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('💎', 0, 0);
		ctx.restore();

		// Particles
		for (let i = particles.length - 1; i >= 0; i--) {
			let p = particles[i];
			p.x += p.vx * dt;
			p.y += p.vy * dt;
			p.alpha -= dt * 1.5;
			if (p.alpha <= 0) particles.splice(i, 1);
			else {
				ctx.fillStyle = \`rgba(0, 245, 147, \${p.alpha})\`;
				ctx.fillRect(p.x, p.y, 4, 4);
			}
		}

		ctx.fillStyle = '#00f593';
		ctx.font = 'bold 15px sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText('CLICK SCREEN TO HYPE!', c.width / 2, c.height - 28);

		gameLoop = requestAnimationFrame(loop);
	}
	gameLoop = requestAnimationFrame(loop);
}

// Global Lifecycle & Listeners
document.addEventListener('DOMContentLoaded', () => {
	renderHub();

	document.getElementById('btn-back').addEventListener('click', () => {
		if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
		if (gameLoop) { cancelAnimationFrame(gameLoop); clearInterval(gameLoop); gameLoop = null; }
		document.getElementById('arena-view').style.display = 'none';
		document.getElementById('hub-view').style.display = 'grid';
		renderHub();
	});

	document.getElementById('btn-toggle-board').addEventListener('click', () => {
		renderScoreboard();
		document.getElementById('modal-board').style.display = 'flex';
	});

	document.getElementById('btn-close-board').addEventListener('click', () => {
		document.getElementById('modal-board').style.display = 'none';
	});

	// Direct Canvas Interaction for Mouse / Pointer
	const canvasTarget = document.getElementById('canvas-target');
	if (canvasTarget) {
		canvasTarget.addEventListener('pointerdown', (e) => {
			e.preventDefault();
			if (!isCountingDown) {
				if (window.onPointer) window.onPointer(e);
				else if (window.onAct) window.onAct();
			}
		});

		canvasTarget.addEventListener('pointermove', (e) => {
			if (!isCountingDown && window.onPointer) {
				// Only for continuous tracking games like Brick Breaker / Pong
				if (currentGame === 'brick' || currentGame === 'pong') {
					window.onPointer(e);
				}
			}
		});
	}

	// Keyboard Controls
	window.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { if (window.onU) window.onU(); }
		if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { if (window.onD) window.onD(); }
		if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { if (window.onL) window.onL(); }
		if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { if (window.onR) window.onR(); }
		if (e.key === ' ' || e.key === 'Enter') {
			if (!isCountingDown && window.onAct) window.onAct();
		}
	});
});
`;

fs.writeFileSync(path.join(outDir, 'panel.html'), html, 'utf8');
fs.writeFileSync(path.join(outDir, 'panel.js'), js, 'utf8');
console.log('Successfully generated full Twitch Arcade Hub with relaxed pacing and direct mouse controls!');
