/**
 * Euclidean distance between two normalized landmark points.
 */
export function getDist(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

/**
 * PoseAnalyzer evaluates per-hand poses and two-hand interactions from
 * MediaPipe hand landmarks.
 */
export class PoseAnalyzer {
    constructor() {
        this.lastPinchState = [false, false];
        this.pinchThreshold = 0.05;
    }

    /**
     * @param {Array} hands - MediaPipe multiHandLandmarks array
     * @param {Function} onPinch - Callback fired when a pinch starts: (midpoint, handIndex)
     */
    detect(hands, onPinch) {
        let poseName = "None";
        let opennessPct = 0;

        if (!hands || hands.length === 0) {
            this.lastPinchState = [false, false];
            return { poseName, opennessPct };
        }

        // Openness measured on the primary hand
        const h0 = hands[0];
        if (h0) {
            const wrist = h0[0];
            const indexTip = h0[8];
            const pinkyTip = h0[20];

            const distIndex = getDist(wrist, indexTip);
            const distPinky = getDist(wrist, pinkyTip);
            const spread = (distIndex + distPinky) / 2;

            // Closed fist ~0.22, fully open hand ~0.60
            opennessPct = Math.max(0, Math.min(100, Math.round(((spread - 0.22) / 0.38) * 100)));
            poseName = opennessPct > 62 ? "Hand Open" : (opennessPct < 22 ? "Closed Fist" : "Tracking");
        }

        // Pinch detection per hand
        hands.forEach((hand, idx) => {
            if (idx > 1) return;

            const thumbTip = hand[4];
            const indexTip = hand[8];
            const dist = getDist(thumbTip, indexTip);
            const isPinching = dist < this.pinchThreshold;

            if (isPinching && !this.lastPinchState[idx]) {
                const midpoint = {
                    x: (thumbTip.x + indexTip.x) / 2,
                    y: (thumbTip.y + indexTip.y) / 2
                };
                if (onPinch) onPinch(midpoint, idx);
            }

            this.lastPinchState[idx] = isPinching;

            if (isPinching) {
                poseName = `Pinch Grip (Hand ${idx + 1})`;
            }
        });

        // Two-hand interactions
        if (hands.length >= 2) {
            const h1 = hands[0];
            const h2 = hands[1];
            const tipDist = getDist(h1[8], h2[8]);

            if (tipDist < 0.10) {
                poseName = "Power Surge";
            } else if (tipDist < 0.30) {
                poseName = "Spark Bridge";
            }
        }

        return { poseName, opennessPct };
    }
}