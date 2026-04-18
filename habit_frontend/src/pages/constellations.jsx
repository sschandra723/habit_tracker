// ─── CONSTELLATION DEFINITIONS ───────────────────────────────────────────────
// Each constellation has:
//   name        - display name
//   days        - how many days to complete it
//   myth        - short flavour text shown on completion
//   stars       - array of {x,y} normalised 0-100 positions
//   lines       - pairs of star indices to draw connecting lines
//
// Star counts match the `days` value exactly — each star = 1 day.

export const CONSTELLATIONS = [
    {
        name: "Crux",
        days: 5,
        myth: "The Southern Cross — the sailor's guide through dark waters.",
        stars: [
            { x: 50, y: 15 },
            { x: 50, y: 45 },
            { x: 50, y: 75 },
            { x: 25, y: 45 },
            { x: 75, y: 45 },
        ],
        lines: [[0,1],[1,2],[3,4]],
    },
    {
        name: "Triangulum",
        days: 7,
        myth: "The Triangle — simple geometry that maps the heavens.",
        stars: [
            { x: 50, y: 10 },
            { x: 20, y: 70 },
            { x: 80, y: 70 },
            { x: 35, y: 40 },
            { x: 65, y: 40 },
            { x: 50, y: 55 },
            { x: 50, y: 85 },
        ],
        lines: [[0,1],[0,2],[1,2],[3,4],[3,5],[4,5],[5,6]],
    },
    {
        name: "Aries",
        days: 10,
        myth: "The Ram — first of the zodiac, charging into new beginnings.",
        stars: [
            { x: 15, y: 50 },
            { x: 30, y: 35 },
            { x: 45, y: 28 },
            { x: 55, y: 30 },
            { x: 65, y: 40 },
            { x: 72, y: 55 },
            { x: 68, y: 68 },
            { x: 55, y: 75 },
            { x: 40, y: 72 },
            { x: 25, y: 62 },
        ],
        lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,0]],
    },
    {
        name: "Lyra",
        days: 14,
        myth: "The Lyre of Orpheus — its music could move mountains and stars.",
        stars: [
            { x: 50, y: 10 },
            { x: 30, y: 30 },
            { x: 70, y: 30 },
            { x: 25, y: 50 },
            { x: 50, y: 45 },
            { x: 75, y: 50 },
            { x: 20, y: 68 },
            { x: 40, y: 65 },
            { x: 60, y: 65 },
            { x: 80, y: 68 },
            { x: 30, y: 82 },
            { x: 50, y: 78 },
            { x: 70, y: 82 },
            { x: 50, y: 92 },
        ],
        lines: [[0,1],[0,2],[1,3],[2,5],[3,4],[4,5],[3,6],[4,7],[4,8],[5,9],[6,10],[7,11],[8,12],[10,11],[11,12],[11,13]],
    },
    {
        name: "Cassiopeia",
        days: 21,
        myth: "The Queen — her W shape blazes eternally in the northern sky.",
        stars: [
            { x: 10, y: 40 },{ x: 20, y: 20 },{ x: 35, y: 50 },
            { x: 50, y: 20 },{ x: 65, y: 50 },{ x: 80, y: 20 },
            { x: 90, y: 40 },{ x: 15, y: 65 },{ x: 30, y: 75 },
            { x: 50, y: 65 },{ x: 70, y: 75 },{ x: 85, y: 65 },
            { x: 25, y: 85 },{ x: 50, y: 88 },{ x: 75, y: 85 },
            { x: 10, y: 80 },{ x: 90, y: 80 },{ x: 40, y: 92 },
            { x: 60, y: 92 },{ x: 50, y: 96 },{ x: 35, y: 30 },
        ],
        lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[0,7],[6,11],[7,8],[8,9],[9,10],[10,11],[8,12],[9,13],[10,14],[12,17],[13,17],[13,18],[14,18],[17,19],[18,19],[1,20],[3,20],[2,9]],
    },
    {
        name: "Orion",
        days: 30,
        myth: "The Hunter — the mightiest constellation, guardian of winter skies.",
        stars: [
            // Head
            { x: 50, y: 8 },
            // Shoulders
            { x: 28, y: 22 },{ x: 72, y: 22 },
            // Belt
            { x: 38, y: 48 },{ x: 50, y: 48 },{ x: 62, y: 48 },
            // Arms
            { x: 12, y: 30 },{ x: 88, y: 30 },
            // Body
            { x: 35, y: 38 },{ x: 65, y: 38 },
            // Sword
            { x: 45, y: 60 },{ x: 50, y: 68 },{ x: 55, y: 60 },
            // Legs
            { x: 25, y: 75 },{ x: 75, y: 75 },
            { x: 20, y: 88 },{ x: 80, y: 88 },
            // Extra body detail
            { x: 42, y: 55 },{ x: 58, y: 55 },
            { x: 38, y: 30 },{ x: 62, y: 30 },
            // Knee
            { x: 28, y: 82 },{ x: 72, y: 82 },
            // Feet
            { x: 18, y: 94 },{ x: 82, y: 94 },
            // Club
            { x: 8, y: 18 },{ x: 5, y: 10 },
            // Shield
            { x: 90, y: 18 },{ x: 93, y: 10 },{ x: 95, y: 25 },
        ],
        lines: [
            [0,1],[0,2],[1,6],[2,7],[1,19],[2,20],[19,8],[20,9],
            [8,3],[9,5],[3,4],[4,5],[3,17],[5,18],[17,10],[18,12],[10,11],[11,12],
            [8,13],[9,14],[13,21],[14,22],[21,15],[22,16],[15,23],[16,24],
            [6,25],[25,26],[7,27],[27,28],[28,29],
        ],
    },
    {
        name: "Scorpius",
        days: 45,
        myth: "The Scorpion — ancient rival of Orion, its tail curves with venom.",
        stars: [
            // Head cluster
            { x: 20, y: 15 },{ x: 30, y: 12 },{ x: 40, y: 15 },
            // Body
            { x: 35, y: 28 },{ x: 40, y: 38 },{ x: 42, y: 50 },
            { x: 45, y: 60 },{ x: 50, y: 68 },
            // Tail curve
            { x: 55, y: 72 },{ x: 62, y: 75 },{ x: 68, y: 72 },
            { x: 73, y: 65 },{ x: 78, y: 58 },{ x: 82, y: 50 },
            { x: 85, y: 42 },{ x: 88, y: 52 },
            // Claws
            { x: 25, y: 40 },{ x: 15, y: 35 },{ x: 10, y: 28 },
            { x: 48, y: 35 },{ x: 55, y: 28 },{ x: 62, y: 22 },
            // Fill body
            { x: 38, y: 45 },{ x: 43, y: 55 },{ x: 48, y: 63 },
            { x: 58, y: 68 },{ x: 65, y: 68 },{ x: 70, y: 60 },
            { x: 75, y: 52 },{ x: 80, y: 45 },
            // Extra head
            { x: 15, y: 20 },{ x: 45, y: 22 },
            // Extra tail
            { x: 83, y: 35 },{ x: 87, y: 30 },
            // Stinger
            { x: 84, y: 58 },{ x: 82, y: 65 },
            // Extra body
            { x: 36, y: 34 },{ x: 41, y: 44 },{ x: 44, y: 56 },
            { x: 47, y: 64 },{ x: 52, y: 70 },{ x: 57, y: 72 },
            { x: 63, y: 72 },{ x: 69, y: 67 },{ x: 74, y: 60 },
        ],
        lines: [
            [0,1],[1,2],[0,30],[2,31],[1,3],[3,36],[36,4],[4,37],[37,5],[5,38],
            [38,6],[6,39],[39,7],[7,40],[40,8],[8,41],[41,9],[9,42],[42,10],
            [10,43],[43,11],[11,44],[12,13],[13,14],[14,15],[14,34],[34,15],
            [3,16],[16,17],[17,18],[4,19],[19,20],[20,21],
            [22,23],[23,24],[24,25],[25,26],[26,27],[27,28],[28,29],[29,32],[32,33],
        ],
    },
    {
        name: "Hercules",
        days: 60,
        myth: "The Hero — 12 labours completed, now immortal among the stars.",
        stars: Array.from({ length: 60 }, (_, i) => {
            const angle = (i / 60) * Math.PI * 2 * 3 + (i % 7) * 0.4;
            const r = 30 + (i % 5) * 8;
            return {
                x: Math.round(50 + r * Math.cos(angle)),
                y: Math.round(50 + r * Math.sin(angle) * 0.8),
            };
        }),
        lines: Array.from({ length: 59 }, (_, i) => [i, i + 1]),
    },
    {
        name: "Perseus",
        days: 90,
        myth: "The Champion — slayer of Medusa, rescuer of Andromeda.",
        stars: Array.from({ length: 90 }, (_, i) => {
            const t = i / 90;
            const angle = t * Math.PI * 4;
            const r = 20 + t * 25 + (i % 3) * 5;
            return {
                x: Math.round(50 + r * Math.cos(angle)),
                y: Math.round(50 + r * Math.sin(angle) * 0.75),
            };
        }),
        lines: Array.from({ length: 89 }, (_, i) => [i, i + 1]),
    },
    {
        name: "Andromeda",
        days: 120,
        myth: "The Chained Princess — her galaxy visible to the naked eye, 2.5 million light-years away.",
        stars: Array.from({ length: 120 }, (_, i) => {
            const t = i / 120;
            const spiralAngle = t * Math.PI * 6;
            const r = 5 + t * 40;
            const wobble = Math.sin(i * 0.7) * 6;
            return {
                x: Math.round(50 + (r + wobble) * Math.cos(spiralAngle)),
                y: Math.round(50 + (r + wobble) * Math.sin(spiralAngle) * 0.6),
            };
        }),
        lines: Array.from({ length: 119 }, (_, i) => [i, i + 1]),
    },
    {
        name: "Ophiuchus",
        days: 150,
        myth: "The Serpent Bearer — the forgotten 13th constellation, healer of the heavens.",
        stars: Array.from({ length: 150 }, (_, i) => {
            const t = i / 150;
            const wave = Math.sin(t * Math.PI * 8) * 20;
            const drift = Math.cos(t * Math.PI * 5) * 15;
            return {
                x: Math.round(10 + t * 80 + drift),
                y: Math.round(50 + wave + (i % 4 - 2) * 5),
            };
        }),
        lines: Array.from({ length: 149 }, (_, i) => [i, i + 1]),
    },
];

// ─── SVG RENDERER ─────────────────────────────────────────────────────────────
// completedDays: number of days completed so far
// width, height: SVG canvas size
// onStarHover: callback(starIndex | null)

export function ConstellationSVG({
                                     constellation,
                                     completedDays,
                                     width = 300,
                                     height = 220,
                                     compact = false,
                                 }) {
    if (!constellation) return null;

    const W = width;
    const H = height;
    const pad = compact ? 8 : 14;

    // Map normalised 0-100 coords to pixel space
    const px = (nx) => pad + (nx / 100) * (W - pad * 2);
    const py = (ny) => pad + (ny / 100) * (H - pad * 2);

    const { stars, lines, days } = constellation;

    return (
        <svg
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            style={{ display: "block", overflow: "visible" }}
        >
            {/* Deep space background */}
            <defs>
                <radialGradient id={`bg-${constellation.name}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0a1628" />
                    <stop offset="100%" stopColor="#020917" />
                </radialGradient>
                {/* Glow filter for completed stars */}
                <filter id={`glow-${constellation.name}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <filter id={`softglow-${constellation.name}`} x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <rect width={W} height={H} fill={`url(#bg-${constellation.name})`} rx={compact ? 8 : 12} />

            {/* Connection lines */}
            {lines.map(([a, b], i) => {
                const bothDone = a < completedDays && b < completedDays;
                const partDone = (a < completedDays) !== (b < completedDays);
                return (
                    <line
                        key={i}
                        x1={px(stars[a].x)} y1={py(stars[a].y)}
                        x2={px(stars[b].x)} y2={py(stars[b].y)}
                        stroke={bothDone ? "#e2e8f0" : partDone ? "#334155" : "#1a2540"}
                        strokeWidth={bothDone ? 1.2 : 0.7}
                        strokeOpacity={bothDone ? 0.5 : 0.3}
                        strokeDasharray={partDone ? "3 3" : "none"}
                    />
                );
            })}

            {/* Stars */}
            {stars.map((star, i) => {
                const done = i < completedDays;
                const isNext = i === completedDays; // the very next star to earn
                const r = done ? (compact ? 3.5 : 4.5) : (compact ? 2 : 2.8);

                return (
                    <g key={i}>
                        {/* Outer halo for done stars */}
                        {done && (
                            <circle
                                cx={px(star.x)} cy={py(star.y)}
                                r={compact ? 7 : 10}
                                fill="#f0f9ff"
                                fillOpacity={0.06}
                            />
                        )}
                        {/* Next-star pulse ring */}
                        {isNext && (
                            <circle
                                cx={px(star.x)} cy={py(star.y)}
                                r={compact ? 5 : 7}
                                fill="none"
                                stroke="#60a5fa"
                                strokeWidth={1}
                                strokeOpacity={0.5}
                                strokeDasharray="2 2"
                            />
                        )}
                        {/* Star body */}
                        <circle
                            cx={px(star.x)} cy={py(star.y)}
                            r={r}
                            fill={done ? "#f0f9ff" : isNext ? "#1e3a5f" : "#0f1f35"}
                            filter={done ? `url(#glow-${constellation.name})` : "none"}
                            style={{ transition: "all 0.4s" }}
                        />
                        {/* Sparkle cross for done stars */}
                        {done && !compact && (
                            <>
                                <line
                                    x1={px(star.x)} y1={py(star.y) - r - 3}
                                    x2={px(star.x)} y2={py(star.y) + r + 3}
                                    stroke="#f0f9ff" strokeWidth={0.5} strokeOpacity={0.4}
                                />
                                <line
                                    x1={px(star.x) - r - 3} y1={py(star.y)}
                                    x2={px(star.x) + r + 3} y2={py(star.y)}
                                    stroke="#f0f9ff" strokeWidth={0.5} strokeOpacity={0.4}
                                />
                            </>
                        )}
                    </g>
                );
            })}

            {/* Day counter label */}
            {!compact && (
                <text
                    x={W - pad} y={H - 5}
                    textAnchor="end"
                    fontSize={9}
                    fill="#334155"
                    fontFamily="monospace"
                >
                    {completedDays}/{days}d
                </text>
            )}
        </svg>
    );
}