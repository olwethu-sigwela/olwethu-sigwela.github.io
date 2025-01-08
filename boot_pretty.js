var textRenderer = {
    preferredElementNodeName: "PRE",
    render: render$1
};
const backBuffer = [];
let cols$1, rows$1;

function render$1(e, t) {
    const o = e.settings.element;
    for (o.style.backgroundColor = e.settings.background, o.style.color = e.settings.color, o.style.fontWeight = e.settings.weight, e.rows == rows$1 && e.cols == cols$1 || (cols$1 = e.cols, rows$1 = e.rows, backBuffer.length = 0); o.childElementCount < rows$1;) {
        const e = document.createElement("span");
        e.style.display = "block", o.appendChild(e)
    }
    for (; o.childElementCount > rows$1;) o.removeChild(o.lastChild);
    for (let r = 0; r < rows$1; r++) {
        const n = r * cols$1;
        let a = !1;
        for (let e = 0; e < cols$1; e++) {
            const o = e + n,
                r = t[o];
            isSameCell(r, backBuffer[o]) || (a = !0, backBuffer[o] = {
                ...r
            })
        }
        if (0 == a) continue;
        let s = "",
            i = {},
            l = !1;
        for (let o = 0; o < cols$1; o++) {
            const r = t[o + n];
            if (r.beginHTML && (l && (s += "</span>", i = {}, l = !1), s += r.beginHTML), !isSameCellStyle(r, i)) {
                l && (s += "</span>");
                const t = r.color === e.settings.color ? null : r.color,
                    o = r.background === e.settings.background ? null : r.background,
                    n = r.weight === e.settings.weight ? null : r.weight;
                let a = "";
                t && (a += "color:" + t + ";"), o && (a += "background:" + o + ";"), n && (a += "font-weight:" + n + ";"), a && (a = ' style="' + a + '"'), s += "<span" + a + ">", l = !0
            }
            s += r.char, i = r, r.endHTML && (l && (s += "</span>", i = {}, l = !1), s += r.endHTML)
        }
        l && (s += "</span>"), o.childNodes[r].innerHTML = s
    }
}

function isSameCell(e, t) {
    return "object" == typeof e && ("object" == typeof t && (e.char === t.char && (e.weight === t.weight && (e.color === t.color && e.background === t.background))))
}

function isSameCellStyle(e, t) {
    return e.weight === t.weight && (e.color === t.color && e.background === t.background)
}
var canvasRenderer = {
    preferredElementNodeName: "CANVAS",
    render
};

function render(e, t) {
    const o = e.settings.element,
        r = devicePixelRatio,
        n = e.cols,
        a = e.rows,
        s = e.metrics,
        i = s.cellWidth,
        l = Math.round(s.lineHeight),
        c = e.settings;
    c.canvasSize ? (o.width = c.canvasSize.width * r, o.height = c.canvasSize.height * r, o.style.width = c.canvasSize.width + "px", o.style.height = c.canvasSize.height + "px") : (o.width = e.width * r, o.height = e.height * r);
    const d = " " + s.fontSize + "px " + s.fontFamily,
        h = c && c.background ? c.background : "white",
        u = c && c.color ? c.color : "black",
        f = c && c.weight ? c.color : "400";
    o.style.backgroundColor = c.background || "white";
    const g = o.getContext("2d");
    if (g.fillStyle = h, g.fillRect(0, 0, o.width, o.height), g.save(), g.scale(r, r), c.canvasOffset) {
        const e = c.canvasOffset,
            t = Math.round("auto" == e.x ? (o.width / r - n * i) / 2 : e.x),
            s = Math.round("auto" == e.y ? (o.height / r - a * l) / 2 : e.y);
        g.translate(t, s)
    }
    g.fillStyle = u, g.textBaseline = "top";
    for (let e = 0; e < a; e++)
        for (let o = 0; o < n; o++) {
            const r = t[e * n + o],
                a = o * i,
                s = e * l;
            r.background && r.background != h && (g.fillStyle = r.background || h, g.fillRect(Math.round(a), s, Math.ceil(i), l)), g.font = (r.weight || f) + d, g.fillStyle = r.color || u, g.fillText(r.char, a, s)
        }
    g.restore()
}
class FPS {
    constructor() {
        this.frames = 0, this.ptime = 0, this.fps = 0
    }
    update(e) {
        return this.frames++, e >= this.ptime + 1e3 && (this.fps = 1e3 * this.frames / (e - this.ptime), this.ptime = e, this.frames = 0), this.fps
    }
}
var storage = {
    store: function(e, t) {
        try {
            return localStorage.setItem(e, JSON.stringify(t)), !0
        } catch (e) {
            return !1
        }
    },
    restore: function(e, t = {}) {
        const o = JSON.parse(localStorage.getItem(e));
        return Object.assign(t, o), t
    },
    clear: function(e) {
        localStorage.removeItem(e)
    }
};
const renderers = {
        canvas: canvasRenderer,
        text: textRenderer
    },
    defaultSettings = {
        element: null,
        cols: 0,
        rows: 0,
        once: !1,
        fps: 30,
        renderer: "text",
        background: "",
        color: "",
        weight: "",
        allowSelect: !1,
        restoreState: !1
    };

function run(e, t, o = {}) {
    return new Promise((function(r) {
        const n = {
                ...defaultSettings,
                ...t,
                ...e.settings
            },
            a = {
                time: 0,
                frame: 0,
                cycle: 0
            },
            s = "currentState";
        let i;
        n.restoreState && (storage.restore(s, a), a.cycle++), n.element ? "canvas" == n.renderer ? "CANVAS" == n.element.nodeName ? i = renderers[n.renderer] : console.warn("This renderer expects a canvas target element.") : "CANVAS" != n.element.nodeName ? i = renderers[n.renderer] : console.warn("This renderer expects a text target element.") : (i = renderers[n.renderer] || renderers.text, n.element = document.createElement(i.preferredElementNodeName), document.body.appendChild(n.element));
        const l = [],
            c = {
                x: 0,
                y: 0,
                pressed: !1,
                px: 0,
                py: 0,
                ppressed: !1
            };
        n.element.addEventListener("pointermove", (e => {
            const t = n.element.getBoundingClientRect();
            c.x = e.clientX - t.left, c.y = e.clientY - t.top, l.push("pointerMove")
        })), n.element.addEventListener("pointerdown", (e => {
            c.pressed = !0, l.push("pointerDown")
        })), n.element.addEventListener("pointerup", (e => {
            c.pressed = !1, l.push("pointerUp")
        })), n.element.style.fontStrech = "normal", n.allowSelect || disableSelect(n.element), document.fonts.ready.then((t => {
            let r = 3;
            ! function t() {
                --r > 0 ? requestAnimationFrame(t) : function() {
                    g = calcMetrics(n.element);
                    const t = getContext(a, n, g, d);
                    "function" == typeof e.boot && e.boot(t, f, o);
                    requestAnimationFrame(y)
                }()
            }()
        }));
        const d = new FPS,
            h = " ",
            u = Object.freeze({
                color: n.color,
                background: n.background,
                weight: n.weight
            }),
            f = [];
        let g;
        let m = 0;
        const p = 1e3 / n.fps,
            b = a.time;
        let S, w;

        function y(t) {
            const x = t - m;
            if (x < p) return void(n.once || requestAnimationFrame(y));
            const A = getContext(a, n, g, d);
            d.update(t), m = t - x % p, a.time = t + b, a.frame++, storage.store(s, a);
            const E = {
                x: c.x / g.cellWidth,
                y: c.y / g.lineHeight,
                pressed: c.pressed,
                p: {
                    x: c.px / g.cellWidth,
                    y: c.py / g.lineHeight,
                    pressed: c.ppressed
                }
            };
            if (c.px = c.x, c.py = c.y, c.ppressed = c.pressed, S != A.cols || w != A.rows) {
                S = A.cols, w = A.rows, f.length = A.cols * A.rows;
                for (let e = 0; e < f.length; e++) f[e] = {
                    ...u,
                    char: h
                }
            }
            if ("function" == typeof e.pre && e.pre(A, E, f, o), "function" == typeof e.main)
                for (let t = 0; t < A.rows; t++) {
                    const r = t * A.cols;
                    for (let n = 0; n < A.cols; n++) {
                        const a = n + r,
                            s = e.main({
                                x: n,
                                y: t,
                                index: a
                            }, A, E, f, o);
                        f[a] = "object" == typeof s && null !== s ? {
                            ...f[a],
                            ...s
                        } : {
                            ...f[a],
                            char: s
                        }, Boolean(f[a].char) || 0 === f[a].char || (f[a].char = h)
                    }
                }
            for ("function" == typeof e.post && e.post(A, E, f, o), i.render(A, f, n); l.length > 0;) {
                const t = l.shift();
                t && "function" == typeof e[t] && e[t](A, E, f)
            }
            n.once || requestAnimationFrame(y), r(A)
        }
    }))
}

function getContext(e, t, o, r) {
    const n = t.element.getBoundingClientRect(),
        a = t.cols || Math.floor(n.width / o.cellWidth),
        s = t.rows || Math.floor(n.height / o.lineHeight);
    return Object.freeze({
        frame: e.frame,
        time: e.time,
        cols: a,
        rows: s,
        metrics: o,
        width: n.width,
        height: n.height,
        settings: t,
        runtime: Object.freeze({
            cycle: e.cycle,
            fps: r.fps
        })
    })
}

function disableSelect(e) {
    e.style.userSelect = "none", e.style.webkitUserSelect = "none", e.style.mozUserSelect = "none", e.dataset.selectionEnabled = "false"
}

function calcMetrics(e) {
    const t = getComputedStyle(e),
        o = t.getPropertyValue("font-family"),
        r = parseFloat(t.getPropertyValue("line-height")),
        n = parseFloat(t.getPropertyValue("font-size")),
        a = ("CANVAS" == e.nodeName ? e : document.createElement("canvas")).getContext("2d");
    a.font = n + "px " + o;
    const s = a.measureText("".padEnd(10, "x")).width / 10,
        i = {
            aspect: s / r,
            cellWidth: s,
            lineHeight: r,
            fontFamily: o,
            fontSize: n,
            _update: function() {
                const t = calcMetrics(e);
                for (var o in t) "number" != typeof t[o] && "string" != typeof t[o] || (i[o] = t[o])
            }
        };
    return i
}
class BoxElement {
    constructor(e) {
        this.DOMElement = e
    }
    updateBB() {
        this.bb = this.DOMElement.getBoundingClientRect()
    }
    property(e) {
        return getComputedStyle(this.DOMElement).getPropertyValue(e).trim()
    }
    width(e) {
        return Math.round(this.bb.width / e.cellWidth)
    }
    height(e) {
        return Math.round(this.bb.height / e.lineHeight)
    }
    x(e) {
        return Math.round(this.bb.left / e.cellWidth)
    }
    y(e) {
        return Math.round(this.bb.top / e.lineHeight)
    }
    background() {
        return getComputedStyle(this.DOMElement).backgroundColor
    }
    update(e) {
        return {
            x: x(e),
            y: y(e),
            width: width(e),
            height: height(e)
        }
    }
}

function map(e, t, o, r, n) {
    return r + (e - t) / (o - t) * (n - r)
}

function clamp(e, t, o) {
    return e < t ? t : e > o ? o : e
}

function mix(e, t, o) {
    return e * (1 - o) + t * o
}

function smoothstep(e, t, o) {
    const r = clamp((o - e) / (t - e), 0, 1);
    return r * r * (3 - 2 * r)
}

function smootherstep(e, t, o) {
    const r = clamp((o - e) / (t - e), 0, 1);
    return r * r * r * (r * (6 * r - 15) + 10)
}

function valueNoise() {
    const e = 256,
        t = new Array(e),
        o = new Array(512);
    for (let r = 0; r < e; r++) t[r] = Math.random(), o[r] = r;
    for (let t = 0; t < e; t++) {
        const r = Math.floor(Math.random() * e);
        [o[t], o[r]] = [o[r], o[t]], o[t + e] = o[t]
    }
    let r, n, a, s, i, l, c, d, h, u, f, g, m, p, b, S;
    return function(w, y) {
        return r = Math.floor(w), n = Math.floor(y), a = w - r, s = y - n, i = (r + e) % e, l = (i + 1 + e) % e, c = (n + e) % e, d = (c + 1 + e) % e, h = t[o[o[i] + c]], u = t[o[o[l] + c]], f = t[o[o[i] + d]], g = t[o[o[l] + d]], m = smoothstep(0, 1, a), p = smoothstep(0, 1, s), b = mix(h, u, m), S = mix(f, g, m), mix(b, S, p)
    }
}

function get(e, t, o, r, n) {
    if (e < 0 || e >= r) return {};
    if (t < 0 || t >= n) return {};
    return o[e + t * r]
}

function merge(e, t, o, r, n, a) {
    if (t < 0 || t >= n) return;
    if (o < 0 || o >= a) return;
    const s = t + o * n,
        i = "object" == typeof r[s] ? r[s] : {
            char: r[s]
        };
    r[s] = {
        ...i,
        ...e
    }
}

function mergeRect(e, t, o, r, n, a, s, i) {
    for (let l = o; l < o + n; l++)
        for (let o = t; o < t + r; o++) merge(e, o, l, a, s, i)
}

function mergeText(e, t, o, r, n, a) {
    let s, i;
    "object" == typeof e ? (s = e.text, i = {
        ...e
    }, delete i.text) : s = e;
    let l = t,
        c = o;
    const d = [];
    return s.split("\n").forEach(((e, o) => {
        e.split("").forEach(((e, o) => {
            l = t + o, merge({
                char: e,
                ...i
            }, l, c, r, n, a)
        }));
        const s = get(t, c, r, n, a),
            h = get(t + e.length - 1, c, r, n, a);
        d.push({
            first: s,
            last: h
        }), c++
    })), c = Math.max(o, c - 1), {
        offset: {
            col: l,
            row: c
        },
        wrapInfo: d
    }
}

function wrap(e, t = 0) {
    // console.log("e = " + e)
    if (0 == t) return measure(e);
    const o = e.split("\n");
    let r = "",
        n = 0,
        a = 0;
    for (const e of o) {
        const o = e.split(" ");
        let s = 0;
        for (const e of o) 0 == s ? (r += e, s = e.length, n = Math.max(n, s)) : s + 1 + e.length <= t ? (r += " " + e, s += e.length + 1, n = Math.max(n, s)) : (r += "\n" + e, s = e.length + 1, a++);
        r += "\n", a++
    }
    return r = r.slice(0, -1), "\n" == r.charAt(r.length - 1) && a--, {
        text: r,
        numLines: a,
        maxWidth: n
    }
}

function measure(e) {
    let t = 0,
        o = 0,
        r = 0;
    for (let n = 0; n < e.length; n++) {
        "\n" == e[n] ? (r = 0, t++) : (r++, o = Math.max(o, r))
    }
    return {
        text: e,
        numLines: t,
        maxWidth: o
    }
}

function dist(e, t) {
    const o = e.x - t.x,
        r = e.y - t.y;
    return Math.sqrt(o * o + r * r)
}
const BIT_LENGTH$1 = 32;
class Bitmap {
    constructor(e, t) {
        this.width = e, this.height = t, this.data = new Array(e * t).fill(0)
    }
    setBmp(e, t, o) {
        for (let r = 0; r < e.height; r++)
            for (let n = 0; n < e.width; n++) {
                const a = t + n + (r + o) * this.width;
                this.data[a] = e.get(n, r)
            }
    }
    get(e, t) {
        return e < 0 || e >= this.width || t < 0 || t >= this.height ? 0 : this.data[e + t * this.width]
    }
    sample(e, t) {
        const o = e * this.width - .5,
            r = t * this.height - .5;
        let n = Math.floor(o),
            a = Math.floor(r),
            s = n + 1,
            i = a + 1;
        const l = o - n,
            c = r - a,
            d = mix(this.get(n, a), this.get(s, a), l),
            h = mix(this.get(n, i), this.get(s, i), l);
        return mix(d, h, c)
    }
    print() {
        let e = "";
        for (let t = 0; t < this.height; t++) {
            for (let o = 0; o < this.width; o++) e += this.get(o, t) < .5 ? "K" : "T";
            e += "\n"
        }
        return e
    }
    pack() {
        const e = [],
            t = Math.ceil(this.data.length / 32);
        for (let o = 0; o < t; o++) {
            let t = 0;
            for (let e = 0; e < 32; e++) this.data[e + 32 * o] > .5 && (t = bit_set(t, e));
            e.push(t)
        }
        return e
    }
    unpack(e, t) {
        for (let o = 0; o < t; o++) {
            const t = e[Math.floor(o / 32)],
                r = o % 32;
            this.data[o] = bit_test(t, r) ? 1 : 0
        }
    }
}

function bit_test(e, t) {
    return (e >> t) % 2 != 0
}

function bit_set(e, t) {
    return e | 1 << t
}
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    CELL_SIZE_X = 8,
    CELL_SIZE_Y = 11,
    DATA = [1667446300, 1667465059, 25443, 1667457855, 1667457855, 16227, 50553662, 50529027, 15971, 1667445535, 1667457891, 7987, 50529151, 50529087, 32515, 50529151, 50529087, 771, 50553662, 1667457915, 32355, 1667457891, 1667457919, 25443, 202116159, 202116108, 16140, 808464504, 858796080, 7731, 456352611, 857411343, 25443, 50529027, 50529027, 32515, 2138530659, 1667984235, 25443, 1734828899, 1936948079, 25443, 1667457854, 1667457891, 15971, 1667457855, 50544483, 771, 1667457854, 1868784483, 6305371, 1667457855, 858987327, 25443, 100885310, 1613764620, 15971, 404232447, 404232216, 6168, 1667457891, 1667457891, 15971, 1667457891, 912483171, 2076, 1801675619, 2137746283, 13878, 912483171, 1664490524, 25443, 858993459, 202120755, 3084, 811622527, 50727960, 32515, 1801675582, 1667984235, 15971, 404626456, 404232216, 32280, 1616929598, 101455920, 32515, 1616929598, 1616928828, 15971, 1010315296, 813642550, 12336, 50529151, 1616928831, 15971, 50529852, 1667457855, 15971, 1616929663, 202119216, 3084, 1667457854, 1667457854, 15971, -471604290, -522125597, 8429232],
    BIT_LENGTH = 32,
    EMPTY$1 = new Bitmap(8, 11),
    fontTable = {};

function loadFromData(e, t, o, r, n) {
    const a = t * o,
        s = Math.ceil(a / 32);
    for (let n = 0; n < r.length; n++) {
        const i = new Bitmap(t, o),
            l = n * s;
        i.unpack(e.slice(l, l + s), a);
        const c = r[n];
        fontTable[c] = i
    }
}
loadFromData(DATA, 8, 11, CHARS);
var font = {
    width: 8,
    height: 11,
    char: function(e) {
        return fontTable[e] || EMPTY$1
    },
    charMap: CHARS
};
const three = ["abs", "ace", "act", "add", "age", "ago", "aha", "aim", "air", "all", "alt", "amp", "and", "ant", "any", "ape", "app", "apt", "arc", "ark", "arm", "art", "ash", "ask", "asp", "ass", "ate", "ave", "awe", "axe", "aye", "bad", "bag", "ban", "bar", "bat", "bay", "bed", "bee", "beg", "ben", "bet", "bid", "big", "bin", "bio", "bis", "bit", "biz", "bob", "bog", "boo", "bow", "box", "boy", "bra", "bud", "Bug", "bum", "bun", "bus", "but", "buy", "bye", "cab", "cad", "cam", "can", "cap", "car", "cat", "chi", "cob", "con", "cop", "cos", "cow", "cry", "cub", "cue", "cum", "cup", "cut", "dab", "dad", "dal", "dam", "dan", "day", "Dee", "def", "del", "den", "dew", "did", "die", "dig", "dim", "din", "dip", "dis", "doc", "doe", "dog", "don", "dot", "dry", "dub", "due", "dug", "dun", "duo", "dye", "ear", "eat", "ebb", "ecu", "eft", "egg", "ego", "elf", "elm", "emu", "end", "era", "eta", "eve", "eye", "fab", "fad", "fan", "far", "fat", "fax", "fay", "fed", "fee", "fen", "few", "fig", "fin", "fit", "fix", "flu", "fly", "foe", "fog", "for", "fox", "fry", "fun", "fur", "gag", "gal", "gap", "gas", "gay", "gee", "gel", "gem", "get", "gig", "gin", "god", "got", "gum", "gun", "gut", "guy", "gym", "had", "ham", "has", "hat", "hay", "hem", "hen", "her", "hey", "hid", "him", "hip", "his", "hit", "hog", "hop", "hot", "how", "hub", "hue", "hug", "huh", "hum", "hut", "ice", "icy", "ill", "ink", "inn", "ion", "its", "ivy", "jam", "jar", "jaw", "jay", "jet", "jew", "job", "joe", "jog", "joy", "jug", "kay", "ken", "key", "kid", "kin", "kit", "lad", "lap", "law", "lax", "lay", "lea", "led", "leg", "let", "lib", "lid", "lie", "lip", "lit", "log", "lol", "lot", "low", "mac", "mad", "man", "map", "mat", "max", "may", "med", "men", "met", "mid", "mix", "mob", "mod", "mom", "mop", "mud", "mug", "mum", "nan", "nap", "nay", "net", "new", "nil", "nod", "nor", "not", "now", "nun", "nut", "oak", "odd", "off", "oft", "oil", "old", "ole", "one", "ooh", "opt", "orb", "our", "out", "owe", "owl", "own", "pac", "pad", "pal", "pam", "pan", "pat", "paw", "pay", "pea", "peg", "pen", "pep", "pet", "phi", "pic", "pie", "pig", "pin", "pip", "pit", "ply", "pod", "pop", "pot", "pro", "psi", "pub", "pup", "put", "rad", "rag", "ram", "rap", "rat", "raw", "ray", "red", "rem", "rep", "rev", "rib", "rid", "rig", "rim", "rip", "rob", "rod", "row", "rub", "rug", "rum", "run", "rye", "sac", "sad", "sat", "saw", "say", "sea", "see", "set", "sew", "sex", "she", "shy", "sic", "sim", "sin", "sip", "sir", "sis", "sit", "six", "ski", "sky", "sly", "sol", "son", "soy", "spa", "spy", "sub", "sue", "sum", "sun", "sup", "tab", "tag", "tam", "tan", "tap", "tar", "tax", "tea", "ted", "tee", "ten", "the", "tie", "tin", "tip", "tod", "toe", "tom", "ton", "too", "top", "tow", "toy", "try", "tub", "tug", "two", "use", "van", "vet", "via", "vow", "war", "was", "wax", "way", "web", "wed", "wee", "wet", "who", "why", "wig", "win", "wit", "won", "woo", "wow", "wry", "xxx", "yen", "yep", "yes", "yet", "you", "zip", "zoo"],
    MAX_LEN = 3,
    EMPTY = 0,
    FONT_SPACING = 0,
    FLAP_CHARS$1 = " " + font.charMap;
shuffle(three), three.unshift("cvb"), three.unshift("dfg"), three.unshift("ert");
const current = new Array(MAX_LEN).fill(EMPTY),
    dest = new Array(MAX_LEN).fill(EMPTY),
    heat = new Array(MAX_LEN).fill(0);
let currentWordIndex = 0;
const w = font.width * MAX_LEN + FONT_SPACING * (MAX_LEN - 1),
    h = font.height;

function shuffle(e) {
    for (let t = e.length - 1; t > 0; t--) {
        const o = Math.floor(Math.random() * t);
        [e[t], e[o]] = [e[o], e[t]]
    }
}
const bmp = new Bitmap(w, h);

function isValidString(e) {
    if ("string" != typeof e) return !1;
    if (e.length != MAX_LEN) return !1;
    for (const t in e)
        if (-1 == FLAP_CHARS$1.indexOf(t)) return !1;
    return !0
}

function bitmapRenderLoop(e, t) {
    if (e.frame % 300 == 0) {
        const e = (isValidString(t) ? t : three[currentWordIndex]).toUpperCase();
        dest.fill(EMPTY);
        for (let t = 0; t < e.length; t++) dest[t] = FLAP_CHARS$1.indexOf(e[t]);
        currentWordIndex = (currentWordIndex + 1) % three.length;
        for (let e = 0; e < MAX_LEN; e++) heat[e] = 6 * e
    }
    if (e.frame % 2 == 1) {
        for (let e = 0; e < MAX_LEN; e++) 0 == heat[e] ? current[e] != dest[e] && (current[e] = (current[e] + 1) % FLAP_CHARS$1.length) : heat[e]--;
        for (let e = 0; e < MAX_LEN; e++) {
            const t = (font.width + FONT_SPACING) * e,
                o = 0,
                r = current[e];
            bmp.setBmp(font.char(FLAP_CHARS$1[r]), t, o)
        }
    }
}
const {
    min,
    max,
    sin,
    cos,
    floor,
    round,
    random
} = Math, FILETTO_H = "â”€", FILETTO_V = "â”‚", DENSITY_END = [];
DENSITY_END.push("  "), DENSITY_END.push("+ "), DENSITY_END.push(" ."), DENSITY_END.push("+ "), DENSITY_END.push(" ,"), DENSITY_END.push("Â· "), DENSITY_END.push(": "), DENSITY_END.push("â€¢ ");
const FLAP_CHARS = " .,Â·-â€¢â”€~+:;=*Ï€â€™â€œâ€â”â”Œâ”˜â””â”¼â”œâ”¤â”´â”¬â”‚â•—â•”â•â•šâ•¬â• â•£â•©â•¦â•‘â–‘â–’â–“â–ˆâ–„â–€â–Œâ–â– !?&#$@aÃ bcdefghijklmnoÃ²pqrstuÃ¼vwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%()".split(""),
    DENSITY_A = " .Â·â€¢-+=:;*ABC0123!*".split(""),
    DENSITY_B = " Â·-â€¢~+:*abcXYZ*".split("");
let endIndex = floor(random() * DENSITY_END.length);
DENSITY_A[DENSITY_A.length - 1] = DENSITY_END[endIndex][0], DENSITY_B[DENSITY_B.length - 1] = DENSITY_END[endIndex][1];
for (const e of DENSITY_END) - 1 == FLAP_CHARS.indexOf(e[0]) && FLAP_CHARS.push(e[0]), -1 == FLAP_CHARS.indexOf(e[1]) && FLAP_CHARS.push(e[1]);
const FLAP_CHARS_HASH = FLAP_CHARS.reduce(((e, t, o) => (e[t] = o, e)), {});

function sample(e) {
    const t = null == e ? 0 : e.length;
    return t ? e[Math.floor(Math.random() * t)] : void 0
}

function lerpColor(e, t, o) {
    return rgb(mix(e.r, t.r, o), mix(e.g, t.g, o), mix(e.b, t.b, o))
}

function rgb(e, t, o, r = 1) {
    return {
        r: e,
        g: t,
        b: o,
        a: r
    }
}

function rgb2hex(e) {
    let t = Math.round(e.r).toString(16).padStart(2, "0"),
        o = Math.round(e.g).toString(16).padStart(2, "0"),
        r = Math.round(e.b).toString(16).padStart(2, "0");
        // console.log("t = " + t)
        // console.log("o = " + o)
        // console.log("r = " + r)

        // let returnValue = void 0 === e.a ? "#" + t + o + r : "#" + t + o + r + Math.round(255 * e.a).toString(16).padStart(2, "0")

        let returnValue = void 0 === e.a ? "#" + t + o + r : "#" + t + o + r + "22"

        // console.log("returnValue = " + returnValue)
    return returnValue
}

function int2rgb(e) {
    return {
        a: 1,
        r: e >> 16 & 255,
        g: e >> 8 & 255,
        b: 255 & e
    }
}
const PALETTE = [int2rgb(43690), int2rgb(11141120), int2rgb(11162880), int2rgb(5592575), int2rgb(5635925), int2rgb(5636095), int2rgb(16733525), int2rgb(16733695), int2rgb(16777215)],
    baseColors = {
        a: rgb(238, 237, 240),//, 0.5),
        b: rgb(143, 182, 195)//, 0.5)

        // a: rgb(143, 182, 195),
        // b:  rgb(238, 237, 240)
        // a: rgb(238, 237, 240),
        // b: rgb(143, 182, 195)
    },
    currentColors = {
        ...baseColors
    },
    noise = valueNoise(),
    sharedState = {
        colorA: 0,
        colorB: 0,
        radiusSq: 0,
        movAmt: 0,
        scale: 0,
        data: []
    },
    boxes = Array.from(document.querySelectorAll("main div")).map((e => new BoxElement(e))),
    bodyBox = new BoxElement(document.body);
let cols, rows, fontSizeChange = bodyBox.property("--font-size-change");

function boot$1(e, t, o) {
    cols = e.cols, rows = e.rows;
    const r = cols * rows;
    for (let e = 0; e < r; e++) {
        const t = Math.floor(e / cols),
            o = e % cols;
        sharedState.data[e] = {
            fade: 0,
            heat: Math.floor(o / 4 + 2 * t) + 2,
            curr: 0
        }
    }
}

function pre(e, t, o, r) {
    const n = bodyBox.property("--font-size-change");
    if (fontSizeChange != n && (e.metrics._update(), fontSizeChange = n), cols != e.cols || rows != e.rows) {
        cols = e.cols, rows = e.rows;
        const t = cols * rows;
        for (let e = 0; e < t; e++) sharedState.data[e] = {
            fade: 0,
            heat: 0,
            curr: 0
        }
    }
    if ("white" == r.color) sharedState.colorA = "lightgray", sharedState.colorB = "white";
    else if (r.color) e.frame % 2e3 == 0 && (baseColors.a = sample(PALETTE), baseColors.b = sample(PALETTE)), currentColors.a = lerpColor(currentColors.a, baseColors.a, .01), currentColors.b = lerpColor(currentColors.b, baseColors.b, .01), sharedState.colorA = rgb2hex(currentColors.a), sharedState.colorB = rgb2hex(currentColors.b);
    else {
        const e = dist(t, t.p);
        sharedState.radiusSq *= .75, sharedState.radiusSq = min(sharedState.radiusSq + .4 * e, 20);
        const o = e > .1 ? .008 : 0;
        if (sharedState.movAmt = min(sharedState.movAmt + o, 1), sharedState.movAmt < .3)
            for (currentColors.a = sample(PALETTE), currentColors.b = sample(PALETTE); currentColors.b == currentColors.a;) currentColors.b = sample(PALETTE);
        const r = smootherstep(.3, .8, sharedState.movAmt);
        sharedState.colorA = rgb2hex(lerpColor(baseColors.a, currentColors.a, r)), sharedState.colorB = rgb2hex(lerpColor(baseColors.b, currentColors.b, r))
    }
    "screensaver" == r.mode && e.frame % 3e3 == 0 && (endIndex = floor(random() * DENSITY_END.length)), 1 == sharedState.movAmt && (endIndex = floor(random() * DENSITY_END.length));
    const a = DENSITY_A[DENSITY_A.length - 1];
    if (a != DENSITY_END[endIndex][0]) {
        const e = (FLAP_CHARS_HASH[a] + 1) % FLAP_CHARS.length;
        DENSITY_A[DENSITY_A.length - 1] = FLAP_CHARS[e]
    }
    const s = DENSITY_B[DENSITY_B.length - 1];
    if (s != DENSITY_END[endIndex][1]) {
        const e = (FLAP_CHARS_HASH[s] + 1) % FLAP_CHARS.length;
        DENSITY_B[DENSITY_B.length - 1] = FLAP_CHARS[e]
    }
    sharedState.movAmt = max(sharedState.movAmt - .003, 0);
    const i = e.cols < 80 ? 1.3 : .8;
    sharedState.scale += .01 * (i - sharedState.scale);
    const l = e.metrics.aspect,
        c = bmp.width / bmp.height / l;
    let d, h;
    if (c < e.cols / e.rows) {
        const t = e.rows;
        d = 1 / t / c / sharedState.scale, h = 1 / t / sharedState.scale
    } else {
        const t = e.cols;
        d = 1 / t / sharedState.scale, h = 1 / t * c / sharedState.scale
    }
    const u = 4e-4 * e.time;
    bitmapRenderLoop(e, r && r.word ? r.word : "");
    const f = map(cos(u), -1, 1, 1.2, .5);
    let g, m, p, b, S, w, y;
    for (let e = 0; e < rows; e++)
        for (let t = 0; t < cols; t++) g = d * (t - .5 * cols) + .5, m = h * (e - .5 * rows) + .5, p = g + .5 * (noise(g * f + u, m * f) - .5), b = m + 1.8 * (noise(g * f, m * f + u) - .5), S = Math.floor(p * bmp.width), w = Math.floor(b * bmp.height), y = t + e * cols, sharedState.data[y].tex = max(bmp.sample(p, b), bmp.get(S, w))
}

function main(e, t, o, r, n) {
    const a = e.index,
        s = max(sharedState.data[a].tex, sharedState.data[a].fade),
        i = (e.x - o.x) * t.metrics.aspect,
        l = e.y - o.y,
        c = i * i + l * l;
    if (c < sharedState.radiusSq) {
        const e = FLAP_CHARS_HASH[0] + floor(sharedState.radiusSq - c);
        sharedState.data[a].curr = e, sharedState.data[a].heat = 1
    }
    sharedState.data[a].fade = .95 * s;
    const d = (e.x + e.y) % 2 ? DENSITY_A : DENSITY_B;
    return {
        char: d[floor(s * (d.length - 1))],
        color: s >= .99 ? sharedState.colorA : sharedState.colorB
    }
}

function post(e, t, o, r) {
    if ("screensaver" == r.mode) return;
    const n = e.metrics,
        a = [];
    let s = 0;
    const i = bodyBox.property("--display-mode");
    for (const t of boxes) {
        const o = [];
        flatten(t.DOMElement, o), t.updateBB();
        const r = t.x(n),
            l = t.y(n),
            c = t.width(n);
        t.height(n);
        let d = r,
            h = l;
        for (let t of o)
            if ("BR" == t.tag) h += 1, d = r, s = max(s, h);
            else if ("DIV" == t.tag) {
            const o = wrap(t.text, c),
                r = mergeText(o.text, d, h, sharedState.data, e.cols, e.rows);
            d = r.offset.col + 1, h = r.offset.row, s = max(s, o.numLines)
        } else if ("A" == t.tag && t.text) {
            const o = wrap(t.text, c),
                r = mergeText({
                    text: o.text,
                    aheat: t.data?.flap ? 1 : 0
                }, d, h, sharedState.data, e.cols, e.rows);
            for (const e of r.wrapInfo) e.first.beginHTML = t.beginHTML, e.last.endHTML = t.endHTML;
            d = r.offset.col + 1, h = r.offset.row, s = max(s, o.numLines)
        }
        a.push({
            x: r,
            y: l,
            displayMode: i,
            width: c
        })
    }
    for (const t of a) "rows" == t.displayMode ? mergeRect({
        char: "â”€"
    }, t.x, t.y - 1, t.width, 1, sharedState.data, e.cols, e.rows) : "cols" == t.displayMode && mergeRect({
        char: "â”‚"
    }, t.x - 1, 0, 1, s, sharedState.data, e.cols, e.rows);
    for (let e = 0; e < o.length; e++) {
        const t = sharedState.data[e];
        t.char && (t.heat = Math.max(t.heat, t.aheat || 0), 1 == t.heat ? t.curr != FLAP_CHARS_HASH[t.char] ? (t.char = FLAP_CHARS[t.curr], t.curr = (t.curr + 1) % FLAP_CHARS.length) : t.heat = 0 : t.heat > 1 && (t.heat--, t.char = FLAP_CHARS[t.curr]), o[e] = {
            ...t
        }, delete sharedState.data[e].char, delete sharedState.data[e].beginHTML, delete sharedState.data[e].endHTML, delete sharedState.data[e].color)
    }
}

function flatten(e, t) {
    // for (const o of e.childNodes)
    //     if (0 == o.childNodes.length) {
    //         if (o.nodeType == Node.TEXT_NODE) {
    //             const e = o.textContent.trim();
    //             if (e) {
    //                 const r = o.parentNode.tagName,
    //                     n = {
    //                         text: e,
    //                         tag: r
    //                     };
    //                 // if (Object.keys(o.parentNode.dataset) && (n.data = o.parentNode.dataset), "A" == r) {
    //                 //     const e = o.parentNode.attributes,
    //                 //         t = e.target ? ` target='${e.target.nodeValue}'` : "",
    //                 //         r = e.href ? ` href='${e.href.nodeValue}'` : "";
    //                 //     n.beginHTML = `<a${r}${t}>`, n.endHTML = "</a>"
    //                 // }
    //                 t.push(n)
    //             }
    //         } else if (o.nodeType == Node.ELEMENT_NODE) {
    //             const e = {
    //                 tag: o.tagName
    //             };
    //             t.push(e)
    //         }
    //     } else flatten(o, t)
}
"ontouchstart" in window ? document.addEventListener("touchstart", (function(e) {
    e.target.href && (e.preventDefault(), location.href = e.target.href)
})) : document.addEventListener("mousedown", (function(e) {
    0 === e.button && e.target.href && (e.preventDefault(), "_blank" == e.target.target ? window.open(e.target.href) : location.href = e.target.href)
}));
var program = Object.freeze({
    __proto__: null,
    boot: boot$1,
    main,
    post,
    pre,
    rgb,
    rgb2hex
});

function boot(e) {
    const t = document.querySelector("PRE");
    run(program, {
        element: t,
        fps: 60,
        allowSelect: !1
    }, e), document.addEventListener("keydown", (e => {
        "f" == e.key && document.body.requestFullscreen && document.body.requestFullscreen().catch((e => console.warn(e)))
    }))
}
// export {
//     boot
// };