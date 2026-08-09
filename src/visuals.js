/**
 * VisualsEngine drives canvas particles, ripples, and the animated background layers.
 */
export class VisualsEngine {
    constructor() {
        this.particles = [];
        this.ripples = [];
        this.stars = [];
        this.rainColumns = [];
        this.glyphSize = 18;

        this.seedStars(220);
    }

    seedStars(count) {
        this.stars = [];
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: (Math.random() - 0.5) * 1200,
                y: (Math.random() - 0.5) * 1200,
                z: Math.random() * 1000,
                size: Math.random() * 2.2 + 1
            });
        }
    }

    /**
     * Recalculates background metrics on viewport resize.
     */
    resize(width, height) {
        const columns = Math.floor(width / this.glyphSize);
        this.rainColumns = new Array(columns).fill(1).map(() => Math.random() * (height / this.glyphSize));
    }

    /**
     * Spawns particles at a position.
     * @param {Object} pos - {x, y}
     * @param {string} color
     * @param {number} density - normalized [0, 1] from UI slider
     */
    createParticles(pos, color, density = 0.55) {
        const count = Math.max(1, Math.round(5 * density));
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: pos.x,
                y: pos.y,
                vx: (Math.random() - 0.5) * 6.5,
                vy: (Math.random() - 0.5) * 6.5 - 1.5,
                life: 1.0,
                color: color,
                size: Math.random() * 2.8 + 1.4
            });
        }
    }

    createRipple(pos, color) {
        this.ripples.push({
            x: pos.x,
            y: pos.y,
            radius: 0,
            maxRadius: 130 + Math.random() * 70,
            life: 1.0,
            color: color
        });
    }

    /**
     * Draws the ambient background layer with a fading motion trail.
     */
    drawBackground(bgCtx, width, height, themeFn, time, handSpeed, mode, trailLength = 0.35) {
        bgCtx.globalCompositeOperation = 'destination-out';
        const fadeAlpha = 0.06 + (1 - trailLength) * 0.4;
        bgCtx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
        bgCtx.fillRect(0, 0, width, height);
        bgCtx.globalCompositeOperation = 'source-over';

        if (mode === 'none') return;

        if (mode === 'matrix') {
            bgCtx.fillStyle = themeFn(time, 1, 1);
            bgCtx.font = `${this.glyphSize}px monospace`;
            const speed = 1 + (handSpeed * 90);

            for (let i = 0; i < this.rainColumns.length; i++) {
                if (Math.random() > 0.945) {
                    const char = String.fromCharCode(0x30A0 + Math.random() * 96);
                    bgCtx.fillText(char, i * this.glyphSize, this.rainColumns[i] * this.glyphSize);
                }

                this.rainColumns[i] += Math.random() * speed;

                if (this.rainColumns[i] * this.glyphSize > height && Math.random() > 0.9) {
                    this.rainColumns[i] = 0;
                }
            }
        } else if (mode === 'starfield') {
            const speed = 2.2 + (handSpeed * 130);

            for (let star of this.stars) {
                star.z -= speed;

                if (star.z <= 0) {
                    star.z = 1000;
                    star.x = (Math.random() - 0.5) * 1200;
                    star.y = (Math.random() - 0.5) * 1200;
                }

                const px = (star.x / star.z) * width + width / 2;
                const py = (star.y / star.z) * height + height / 2;

                if (px >= 0 && px < width && py >= 0 && py < height) {
                    const depthPercent = 1 - (star.z / 1000);
                    const depthSize = depthPercent * star.size * 2.3;

                    bgCtx.fillStyle = themeFn(time, star.z, 1000);
                    bgCtx.globalAlpha = depthPercent;

                    bgCtx.beginPath();
                    bgCtx.arc(px, py, depthSize, 0, Math.PI * 2);
                    bgCtx.fill();
                }
            }
            bgCtx.globalAlpha = 1.0;
        }
    }

    /**
     * Updates and draws particles and ripples on the active canvas.
     */
    updatePhysics(ctx) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15; // gravity
            p.life -= 0.025;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.fill();
            }
        }

        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const r = this.ripples[i];
            r.radius += (r.maxRadius - r.radius) * 0.13;
            r.life -= 0.03;

            if (r.life <= 0) {
                this.ripples.splice(i, 1);
            } else {
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                ctx.strokeStyle = r.color;
                ctx.lineWidth = 4 * r.life;
                ctx.globalAlpha = r.life;
                ctx.stroke();
            }
        }
        ctx.globalAlpha = 1.0;
    }
}