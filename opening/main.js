/* ================================================
    MATRIX RAIN — very low opacity, atmosphere only
    Characters drawn: code symbols + katakana hints
    ================================================ */
(function initMatrix() {
    const canvas = document.getElementById('matrixCanvas');
    canvas.width  = 1920;
    canvas.height = 1080;
    const ctx  = canvas.getContext('2d');
    const fs   = 15;
    const cols = Math.floor(1920 / fs);
    const drops = Array.from({length: cols}, () => Math.floor(Math.random() * 72));
    const chars = '01アウエカキクコ<>/{}[];:=>';

    function draw() {
        ctx.fillStyle = 'rgba(6,13,6,0.06)';
        ctx.fillRect(0, 0, 1920, 1080);
        ctx.fillStyle = '#4ade80';
        ctx.font = `${fs}px monospace`;
        for (let i = 0; i < drops.length; i++) {
            ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fs, drops[i] * fs);
            if (drops[i] * fs > 1080 && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }
    setInterval(draw, 80);
})();

/* ================================================
    SLIDE PRESENTATION CONTROLLER
    Keyboard · touch/swipe · mouse wheel
    ================================================ */
class SlidePresentation {
    constructor(startIdx = 0) {
        this.slides = Array.from(document.querySelectorAll('.slide'));
        this.total  = this.slides.length;
        this.current = 0;
        this.stage  = document.getElementById('deckStage');
        this.bar    = document.getElementById('progressBar');

        this.setupScale();
        this.setupKeyboard();
        this.setupTouch();
        this.setupWheel();
        this.show(startIdx, false);
    }

    /* Scale the fixed 1920×1080 stage to fit the viewport */
    setupScale() {
        const scale = () => {
            const f = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
            const x = (window.innerWidth  - 1920 * f) / 2;
            const y = (window.innerHeight - 1080 * f) / 2;
            this.stage.style.transform = `translate(${x}px,${y}px) scale(${f})`;
        };
        scale();
        window.addEventListener('resize', scale);
    }

    setupKeyboard() {
        document.addEventListener('keydown', e => {
            if (e.target.getAttribute('contenteditable')) return;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ')
                { e.preventDefault(); this.next(); }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
                { e.preventDefault(); this.prev(); }
            if (e.key === 'Home') this.show(0);
            if (e.key === 'End')  this.show(this.total - 1);
        });
    }

    setupTouch() {
        let sx = 0, sy = 0;
        document.addEventListener('touchstart', e => {
            sx = e.touches[0].clientX;
            sy = e.touches[0].clientY;
        }, {passive: true});
        document.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].clientX - sx;
            const dy = e.changedTouches[0].clientY - sy;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50)
                dx < 0 ? this.next() : this.prev();
        });
    }

    setupWheel() {
        let last = 0;
        document.addEventListener('wheel', e => {
            const now = Date.now();
            if (now - last < 600) return;
            last = now;
            e.deltaY > 0 ? this.next() : this.prev();
        }, {passive: true});
    }

    next() { this.show(this.current + 1); }
    prev() { this.show(this.current - 1); }

    show(idx, push = true) {
        this.current = Math.max(0, Math.min(idx, this.total - 1));
        this.slides.forEach((s, i) => {
            const on = i === this.current;
            s.classList.toggle('active',  on);
            s.classList.toggle('visible', on);
        });
        this.bar.style.width = ((this.current + 1) / this.total * 100) + '%';
        const url = '#' + (this.current + 1);
        if (push) history.pushState({slide: this.current + 1}, '', url);
        else      history.replaceState({slide: this.current + 1}, '', url);
    }
}

const initialHash = parseInt(location.hash.slice(1));
const deck = new SlidePresentation(initialHash >= 1 ? initialHash - 1 : 0);

window.addEventListener('popstate', e => {
    const slide = e.state?.slide ?? parseInt(location.hash.slice(1));
    if (slide >= 1) deck.show(slide - 1, false);
});
