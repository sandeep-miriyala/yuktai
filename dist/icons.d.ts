import * as react_jsx_runtime from 'react/jsx-runtime';
import React from 'react';

declare const ICON_PATHS: {
    readonly accessibility: "<circle cx=\"12\" cy=\"4\" r=\"2\"/><path d=\"M4 8l8-1 8 1M12 7v5m-5 9 5-8 5 8M7 12l-2 5m12-5 2 5\"/>";
    readonly contrast: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3a9 9 0 0 0 0 18z\"/>";
    readonly moon: "<path d=\"M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z\"/>";
    readonly motion: "<path d=\"M4 12h12m-5-5 5 5-5 5M20 5v14\"/>";
    readonly reading: "<path d=\"M4 5h16M4 10h12M4 15h16M4 20h10\"/>";
    readonly target: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/>";
    readonly speaker: "<path d=\"M4 9v6h4l5 4V5L8 9H4z\"/><path d=\"M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11\"/>";
    readonly palette: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"8\" cy=\"10\" r=\"1.3\"/><circle cx=\"12\" cy=\"7.5\" r=\"1.3\"/><circle cx=\"16\" cy=\"10\" r=\"1.3\"/><path d=\"M12 21a3 3 0 0 1 0-6h2\"/>";
    readonly skip: "<path d=\"M5 5l7 7-7 7M13 5l7 7-7 7\"/>";
    readonly close: "<path d=\"m18 6-12 12M6 6l12 12\"/>";
    readonly plus: "<path d=\"M12 5v14M5 12h14\"/>";
    readonly minus: "<path d=\"M5 12h14\"/>";
    readonly reset: "<path d=\"M3 12a9 9 0 1 0 3-6.7L3 8\"/><path d=\"M3 3v5h5\"/>";
    readonly search: "<circle cx=\"11\" cy=\"11\" r=\"6.5\"/><path d=\"m16 16 5 5\"/>";
    readonly sort: "<path d=\"m8 9 4-4 4 4m-8 6 4 4 4-4\"/>";
    readonly sortUp: "<path d=\"m6 15 6-6 6 6\"/>";
    readonly sortDown: "<path d=\"m6 9 6 6 6-6\"/>";
    readonly chevrons: "<path d=\"m8 9 4-4 4 4m-8 6 4 4 4-4\"/>";
    readonly grid: "<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/>";
    readonly cards: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"7\" rx=\"1.5\"/><rect x=\"3\" y=\"13\" width=\"18\" height=\"7\" rx=\"1.5\"/>";
    readonly chat: "<path d=\"M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3H13a8.5 8.5 0 0 1 8 8z\"/>";
    readonly mic: "<rect x=\"9\" y=\"2\" width=\"6\" height=\"12\" rx=\"3\"/><path d=\"M5 10a7 7 0 0 0 14 0M12 17v5m-4 0h8\"/>";
    readonly stop: "<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2\"/>";
    readonly download: "<path d=\"M12 3v12m-5-5 5 5 5-5M4 21h16\"/>";
    readonly copy: "<rect x=\"9\" y=\"9\" width=\"11\" height=\"11\" rx=\"2\"/><path d=\"M5 15V5a2 2 0 0 1 2-2h10\"/>";
    readonly filter: "<path d=\"M4 5h16l-6 7v6l-4 2v-8z\"/>";
    readonly check: "<path d=\"m5 12 4 4L19 6\"/>";
    readonly left: "<path d=\"m15 18-6-6 6-6\"/>";
    readonly right: "<path d=\"m9 18 6-6-6-6\"/>";
    readonly first: "<path d=\"m11 18-6-6 6-6M19 18l-6-6 6-6\"/>";
    readonly last: "<path d=\"m13 18 6-6-6-6M5 18l6-6-6-6\"/>";
    readonly spark: "<path d=\"m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2zM19 14l1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2z\"/>";
    readonly alert: "<path d=\"m12 3 10 18H2L12 3z\"/><path d=\"M12 9v5m0 3h.01\"/>";
    readonly info: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 11v6m0-9h.01\"/>";
    readonly form: "<rect x=\"5\" y=\"3\" width=\"14\" height=\"18\" rx=\"2\"/><path d=\"M9 8h6M9 12h6M9 16h3\"/>";
    readonly eye: "<path d=\"M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>";
    readonly layout: "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 9h18M9 21V9\"/>";
    readonly wand: "<path d=\"m15 4 5 5L9 20H4v-5z\"/><path d=\"m13 6 5 5\"/>";
    readonly undo: "<path d=\"M9 14 4 9l5-5\"/><path d=\"M4 9h10a6 6 0 0 1 0 12h-3\"/>";
    readonly tools: "<path d=\"M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z\"/>";
    readonly plug: "<path d=\"M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4\"/>";
    readonly home: "<path d=\"M3 11 12 4l9 7\"/><path d=\"M5 10v10h5v-6h4v6h5V10\"/>";
    readonly menu: "<path d=\"M4 6h16M4 12h16M4 18h16\"/>";
    readonly book: "<path d=\"M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2zM12 6v14\"/>";
    readonly calendar: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M3 10h18M8 3v4M16 3v4M7.5 14h2M14.5 14h2M7.5 17.5h2\"/>";
    readonly clock: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/>";
    readonly person: "<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21a8 8 0 0 1 16 0\"/>";
    readonly users: "<circle cx=\"9\" cy=\"8\" r=\"3.5\"/><path d=\"M2 20a7 7 0 0 1 14 0\"/><path d=\"M16 4.5a3.5 3.5 0 0 1 0 7M18 13.5a7 7 0 0 1 4 6.5\"/>";
    readonly globe: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18\"/>";
    readonly lamp: "<path d=\"M12 3c2 2.6 3 4.3 3 6a3 3 0 0 1-6 0c0-1.7 1-3.4 3-6z\"/><path d=\"M3 14h18c0 3.5-4 6-9 6s-9-2.5-9-6z\"/><path d=\"M12 12v2\"/>";
    readonly play: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M10 8.5v7l6-3.5z\"/>";
    readonly pause: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M10 9v6M14 9v6\"/>";
    readonly send: "<path d=\"M21 3 3 10.5l7 3 3 7.5z\"/><path d=\"m10 13.5 4.5-4.5\"/>";
    readonly share: "<circle cx=\"18\" cy=\"5\" r=\"2.5\"/><circle cx=\"6\" cy=\"12\" r=\"2.5\"/><circle cx=\"18\" cy=\"19\" r=\"2.5\"/><path d=\"m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6\"/>";
    readonly gift: "<rect x=\"3\" y=\"8\" width=\"18\" height=\"4\" rx=\"1\"/><path d=\"M5 12v9h14v-9M12 8v13M12 8C10.5 5 7 4 7 6.5S10 8 12 8zm0 0c1.5-3 5-4 5-1.5S14 8 12 8z\"/>";
    readonly image: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"/><circle cx=\"8.5\" cy=\"9.5\" r=\"1.5\"/><path d=\"m21 15-5-5-10 10\"/>";
    readonly file: "<path d=\"M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z\"/><path d=\"M14 3v5h5M9 13h6M9 17h6\"/>";
    readonly external: "<path d=\"M14 4h6v6M20 4l-9 9\"/><path d=\"M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5\"/>";
    readonly arrowUp: "<path d=\"M12 19V5m-6 6 6-6 6 6\"/>";
    readonly arrowLeft: "<path d=\"M19 12H5m6-6-6 6 6 6\"/>";
    readonly arrowRight: "<path d=\"M5 12h14m-6-6 6 6-6 6\"/>";
    readonly headphones: "<path d=\"M4 15v-3a8 8 0 0 1 16 0v3\"/><rect x=\"3\" y=\"14\" width=\"4\" height=\"7\" rx=\"1.5\"/><rect x=\"17\" y=\"14\" width=\"4\" height=\"7\" rx=\"1.5\"/>";
    readonly music: "<path d=\"M9 18V5l11-2v13\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><circle cx=\"17\" cy=\"16\" r=\"3\"/>";
    readonly pin: "<path d=\"M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z\"/><circle cx=\"12\" cy=\"9.5\" r=\"2.5\"/>";
    readonly map: "<path d=\"M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z\"/><path d=\"M9 3v15M15 6v15\"/>";
    readonly pen: "<path d=\"M12 3 6 9l1.5 8h9L18 9z\"/><path d=\"M12 3v7.5\"/><circle cx=\"12\" cy=\"12\" r=\"1.5\"/><path d=\"M8 21h8\"/>";
    readonly wallet: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2\"/><path d=\"M16 13.5h2M6 7l9-4 2 4\"/>";
    readonly install: "<rect x=\"6\" y=\"2\" width=\"12\" height=\"20\" rx=\"2\"/><path d=\"M12 6v8m-3-3 3 3 3-3M10 18h4\"/>";
    readonly help: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01\"/>";
    readonly temple: "<path d=\"M12 2v2M10 4h4l1 3H9zM8 7h8l1.5 4h-11zM6.5 11h11L19 15H5zM4 15h16v6H4z\"/><path d=\"M10 21v-3a2 2 0 0 1 4 0v3\"/>";
    readonly meditate: "<circle cx=\"12\" cy=\"4.5\" r=\"2.2\"/><path d=\"M12 8c-2.2 0-3.3 1.3-3.7 3.2L7.5 16M12 8c2.2 0 3.3 1.3 3.7 3.2l.8 4.8\"/><path d=\"M4 18c3 2 5.5 2.4 8 1.2 2.5 1.2 5 .8 8-1.2\"/><path d=\"M7.5 16c1.4 1.4 3 2 4.5 2s3.1-.6 4.5-2\"/>";
    readonly trophy: "<path d=\"M8 4h8v5a4 4 0 0 1-8 0z\"/><path d=\"M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6\"/>";
    readonly bulb: "<path d=\"M9 18h6M10 21h4\"/><path d=\"M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z\"/>";
    readonly sun: "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8\"/>";
    readonly delete: "<path d=\"M4 7h16M10 11v6M14 11v6M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M9 7V4h6v3\"/>";
    readonly robot: "<rect x=\"4\" y=\"8\" width=\"16\" height=\"12\" rx=\"3\"/><path d=\"M12 8V4M9.5 4h5M2 13v3M22 13v3\"/><circle cx=\"9\" cy=\"14\" r=\"1.3\"/><circle cx=\"15\" cy=\"14\" r=\"1.3\"/>";
    readonly heart: "<path d=\"M12 20s-7.5-4.6-9.2-9.3A4.9 4.9 0 0 1 12 6.6a4.9 4.9 0 0 1 9.2 4.1C19.5 15.4 12 20 12 20z\"/>";
    readonly heartFilled: "<path fill=\"currentColor\" d=\"M12 20s-7.5-4.6-9.2-9.3A4.9 4.9 0 0 1 12 6.6a4.9 4.9 0 0 1 9.2 4.1C19.5 15.4 12 20 12 20z\"/>";
    readonly hub: "<circle cx=\"12\" cy=\"12\" r=\"3\"/><circle cx=\"5\" cy=\"5\" r=\"2\"/><circle cx=\"19\" cy=\"5\" r=\"2\"/><circle cx=\"5\" cy=\"19\" r=\"2\"/><circle cx=\"19\" cy=\"19\" r=\"2\"/><path d=\"m6.5 6.5 3.4 3.4M17.5 6.5l-3.4 3.4M6.5 17.5l3.4-3.4M17.5 17.5l-3.4-3.4\"/>";
    readonly code: "<path d=\"m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16\"/>";
    readonly text: "<path d=\"M3 7V5h11v2M8.5 5v14M6.5 19h4M14 12v-1.5h7V12M17.5 10.5V19M16 19h3\"/>";
    readonly bold: "<path d=\"M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z\"/>";
    readonly italic: "<path d=\"M10 4h9M5 20h9M15 4 9 20\"/>";
    readonly underline: "<path d=\"M7 4v7a5 5 0 0 0 10 0V4M5 21h14\"/>";
    readonly alignLeft: "<path d=\"M4 5h16M4 9.5h9M4 14h16M4 18.5h9\"/>";
    readonly alignCenter: "<path d=\"M4 5h16M7.5 9.5h9M4 14h16M7.5 18.5h9\"/>";
    readonly alignRight: "<path d=\"M4 5h16M11 9.5h9M4 14h16M11 18.5h9\"/>";
    readonly alignJustify: "<path d=\"M4 5h16M4 9.5h16M4 14h16M4 18.5h16\"/>";
    readonly quote: "<path d=\"M4 18v-6.5A6.5 6.5 0 0 1 10.5 5M4 12h5.5v6H4zM13.5 18v-6.5A6.5 6.5 0 0 1 20 5M13.5 12H19v6h-5.5z\"/>";
    readonly title: "<path d=\"M5 6V4h14v2M12 4v16M9 20h6\"/>";
    readonly font: "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"3\"/><path d=\"m8 17 4-10 4 10M9.4 13.5h5.2\"/>";
    readonly spellcheck: "<path d=\"m3 14 4-10 4 10M4.6 10.5h4.8M11 17l3 3 7-7\"/>";
    readonly abc: "<path d=\"m2 16 2.5-8L7 16M3 13.5h3M9.5 8v8h2.5a2 2 0 0 0 0-4H9.5h2a2 2 0 0 0 0-4H9.5M21 9.4a3.1 3.1 0 1 0 0 5.2\"/>";
    readonly pageBreak: "<path d=\"M6 3v5h12V3M6 21v-5h12v5M3 12h3M9 12h6M18 12h3\"/>";
    readonly link: "<path d=\"M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1\"/><path d=\"M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1\"/>";
    readonly style: "<rect x=\"3\" y=\"3\" width=\"7\" height=\"18\" rx=\"2\"/><path d=\"m10 7.5 4.4-2.6a2 2 0 0 1 2.7.7l3.2 5.6a2 2 0 0 1-.7 2.7L10 19\"/><circle cx=\"6.5\" cy=\"17\" r=\"1\"/>";
    readonly lock: "<rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"/><path d=\"M8 11V8a4 4 0 0 1 8 0v3M12 15v2\"/>";
    readonly unlock: "<rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"/><path d=\"M8 11V8a4 4 0 0 1 7.6-1.8M12 15v2\"/>";
    readonly key: "<circle cx=\"8\" cy=\"15\" r=\"4\"/><path d=\"m11 12 9-9M17 6l3 3M14.5 8.5l2 2\"/>";
    readonly redo: "<path d=\"m15 14 5-5-5-5\"/><path d=\"M20 9H10a6 6 0 0 0 0 12h3\"/>";
    readonly swap: "<path d=\"M7 4 3 8l4 4M3 8h14M17 12l4 4-4 4M21 16H7\"/>";
    readonly shuffle: "<path d=\"M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5\"/>";
    readonly fullscreen: "<path d=\"M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5\"/>";
    readonly fullscreenExit: "<path d=\"M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5\"/>";
    readonly merge: "<circle cx=\"6\" cy=\"5\" r=\"2\"/><circle cx=\"6\" cy=\"19\" r=\"2\"/><circle cx=\"18\" cy=\"12\" r=\"2\"/><path d=\"M6 7v10M6 7c0 4 4 5 10 5\"/>";
    readonly join: "<circle cx=\"9\" cy=\"12\" r=\"6\"/><circle cx=\"15\" cy=\"12\" r=\"6\"/>";
    readonly touch: "<path d=\"M9 11V5a1.5 1.5 0 0 1 3 0v6M12 10a1.5 1.5 0 0 1 3 0v1M15 11a1.5 1.5 0 0 1 3 0v3c0 4-2.5 7-6 7-2.5 0-4-1-5.5-3.5L4.6 14a1.5 1.5 0 0 1 2.5-1.6L9 15\"/>";
    readonly volumeOff: "<path d=\"M4 9v6h4l5 4V5L8 9H4z\"/><path d=\"m16.5 9.5 5 5M21.5 9.5l-5 5\"/>";
    readonly musicOff: "<path d=\"M9 13v5M9 7V5l11-2v9\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><path d=\"M3 3l18 18\"/>";
    readonly musicVideo: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M10.5 15V8.5l5-1V13\"/><circle cx=\"9\" cy=\"15\" r=\"1.5\"/><circle cx=\"14\" cy=\"13\" r=\"1.5\"/>";
    readonly movie: "<rect x=\"3\" y=\"9\" width=\"18\" height=\"11\" rx=\"2\"/><path d=\"m3.5 9-.6-3 16.6-3.4.6 3L3.5 9zM8.5 4.8l1.8 2.9M13.8 3.7l1.8 2.9\"/>";
    readonly slideshow: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"13\" rx=\"2\"/><path d=\"M10 8v5l4-2.5zM8 21h8M12 17v4\"/>";
    readonly storage: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"/><path d=\"M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3\"/>";
    readonly api: "<path d=\"M3 17v-6a2.5 2.5 0 0 1 5 0v6M3 14h5M11 17V7h2.5a2.5 2.5 0 0 1 0 5H11M18 7h3M19.5 7v10M18 17h3\"/>";
    readonly dataObject: "<path d=\"M8 4H7a2 2 0 0 0-2 2v4l-2 2 2 2v4a2 2 0 0 0 2 2h1M16 4h1a2 2 0 0 1 2 2v4l2 2-2 2v4a2 2 0 0 1-2 2h-1\"/>";
    readonly computer: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"/><path d=\"M8 20h8M12 16v4\"/>";
    readonly phone: "<rect x=\"6\" y=\"2\" width=\"12\" height=\"20\" rx=\"2\"/><path d=\"M10.5 18.5h3\"/>";
    readonly cloud: "<path d=\"M7 19a5 5 0 0 1-.6-10A6.5 6.5 0 0 1 18.6 9.5 4.8 4.8 0 0 1 17.5 19z\"/>";
    readonly wifi: "<path d=\"M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01\"/>";
    readonly wifiOff: "<path d=\"M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01M3 3l18 18\"/>";
    readonly searchOff: "<circle cx=\"11\" cy=\"11\" r=\"6.5\"/><path d=\"m16 16 5 5M8.7 8.7l4.6 4.6M13.3 8.7l-4.6 4.6\"/>";
    readonly eyeOff: "<path d=\"M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18\"/>";
    readonly bookmark: "<path d=\"M6 3h12v18l-6-4-6 4z\"/>";
    readonly school: "<path d=\"m2 9 10-5 10 5-10 5z\"/><path d=\"M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6\"/>";
    readonly gavel: "<path d=\"m13 3.5 7.5 7.5M10 6.5l7.5 7.5M11.5 5l7 7-3 3-7-7zM10 11.5 3.5 18a1.4 1.4 0 0 0 2 2L12 13.5M13 21h8\"/>";
    readonly architecture: "<circle cx=\"12\" cy=\"5\" r=\"2\"/><path d=\"M12 3V2M11 7 5.5 21M13 7l5.5 14M8 15h8\"/>";
    readonly brain: "<path d=\"M11 5.5A3 3 0 0 0 5.6 7 3 3 0 0 0 4 12a3 3 0 0 0 1.6 5A3 3 0 0 0 11 18.5zM13 5.5A3 3 0 0 1 18.4 7 3 3 0 0 1 20 12a3 3 0 0 1-1.6 5 3 3 0 0 1-5.4 1.5z\"/><path d=\"M8 10h3M13 14h3\"/>";
    readonly volunteer: "<path d=\"M12 11s-3.5-2.2-3.5-4.6a1.8 1.8 0 0 1 3.5-.7 1.8 1.8 0 0 1 3.5.7C15.5 8.8 12 11 12 11z\"/><path d=\"M2 15h3l3.5 1.5H13a1.5 1.5 0 0 1 0 3H9.5M5 21l1.5-1.5H14l5.5-4a1.6 1.6 0 0 0-2-2.4L14 15.6\"/>";
    readonly radio: "<circle cx=\"12\" cy=\"12\" r=\"9\"/>";
    readonly radioChecked: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"4\" fill=\"currentColor\"/>";
    readonly upload: "<path d=\"M12 15V3m-5 5 5-5 5 5M4 21h16\"/>";
    readonly arrowDown: "<path d=\"M12 5v14m-6-6 6 6 6-6\"/>";
};
type IconName = keyof typeof ICON_PATHS;
declare const ICON_NAMES: IconName[];

type IconVariant = "outline" | "filled";
type IconShape = "circle" | "rounded";
/** WCAG 1.4.11 minimum for graphical objects. */
declare const ICON_MIN_CONTRAST = 3;
interface IconColourOptions {
    variant?: IconVariant;
    /** outline: the line colour · filled: the background colour. Default currentColor. */
    color?: string;
    /** filled only: the glyph colour. Default: white or near-black, whichever contrasts more. */
    glyphColor?: string;
    /** filled only: background shape. Default "rounded". */
    shape?: IconShape;
}
/** Contrast between two colours, or null when either is not a hex/rgb() value (e.g. currentColor). */
declare function iconContrast(fg: string, bg: string): number | null;
/** Best glyph colour (white or near-black) for a filled background. */
declare function pickGlyphColor(background: string): string;
/** Resolved colours for one icon, plus a contrast check (WCAG 1.4.11). */
declare function resolveIconColours(options?: IconColourOptions): {
    variant: "outline";
    color: string;
    glyph: string;
    contrast: number | null;
} | {
    variant: "filled";
    color: string;
    glyph: string;
    contrast: number | null;
};
interface IconSvgOptions extends IconColourOptions {
    size?: number | string;
    strokeWidth?: number;
    /** Accessible name. Omit for decorative icons. */
    label?: string;
}
/** SVG markup for any icon (used by the vanilla build: yuktai.icon). */
declare function iconSvg(name: IconName | string, options?: IconSvgOptions): string;

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
    /** Size in pixels — applied to both width and height. Default: 20 */
    size?: number | string;
    /** outline: line colour · filled: background colour. Default: currentColor */
    color?: string;
    /** Stroke width override — default: 2.5 (outline), 2.6 (filled) */
    strokeWidth?: number;
    /** Accessible label — if provided, icon becomes non-decorative */
    label?: string;
    /** "outline" (default) or "filled" */
    variant?: IconVariant;
    /** filled only: glyph colour. Default: white or near-black, whichever contrasts more */
    glyphColor?: string;
    /** filled only: "rounded" (default) or "circle" */
    shape?: IconShape;
}
/**
 * Shared base for all yuktai icons.
 * Children should be SVG path/circle/rect elements.
 */
declare function IconBase({ size, color, strokeWidth, label, variant, glyphColor, shape, children, ...rest }: IconProps & {
    children: React.ReactNode;
}): react_jsx_runtime.JSX.Element;

declare function SearchIcon(props: IconProps): react_jsx_runtime.JSX.Element;

declare function SortUpIcon(props: IconProps): react_jsx_runtime.JSX.Element;

declare function SortDownIcon(props: IconProps): react_jsx_runtime.JSX.Element;

declare function ChevronLeftIcon(props: IconProps): react_jsx_runtime.JSX.Element;

declare function ChevronRightIcon(props: IconProps): react_jsx_runtime.JSX.Element;

declare function CheckIcon(props: IconProps): react_jsx_runtime.JSX.Element;

declare function CloseIcon(props: IconProps): react_jsx_runtime.JSX.Element;

interface YuktaiIconProps extends Omit<IconProps, "name"> {
    /** Icon name, e.g. "mic", "wand", "accessibility". See ICON_NAMES. */
    name: IconName;
}
/** Any yuktai icon by name. Paths are fixed constants from paths.ts (never user input). */
declare function YuktaiIcon({ name, ...props }: YuktaiIconProps): react_jsx_runtime.JSX.Element;
/** Accessibility settings */
declare const AccessibilityIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** High contrast */
declare const ContrastIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Dark mode */
declare const MoonIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Reduce motion */
declare const MotionIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Reading / dyslexia support */
declare const ReadingIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Large targets */
declare const TargetIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Speak on focus */
declare const SpeakerIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Colour-blind modes */
declare const PaletteIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Skip links */
declare const SkipIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Increase / add */
declare const PlusIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Decrease / remove */
declare const MinusIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Reset */
declare const ResetIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Sortable column (unsorted) */
declare const SortIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Expand / collapse */
declare const ChevronsIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Table view */
declare const GridIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Card view */
declare const CardsIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Ask / assistant */
declare const ChatIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Voice input */
declare const MicIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Stop listening */
declare const StopIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Download / export / install */
declare const DownloadIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Copy */
declare const CopyIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Filter */
declare const FilterIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** First page */
declare const FirstIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Last page */
declare const LastIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** AI / agentic answer */
declare const SparkIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Warning */
declare const AlertIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Information */
declare const InfoIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Form review */
declare const FormIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Show on page / watch */
declare const EyeIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Design review */
declare const LayoutIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Auto-fix */
declare const WandIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Undo */
declare const UndoIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Page tools */
declare const ToolsIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** WebMCP / integrations */
declare const PlugIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Home */
declare const HomeIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Menu */
declare const MenuIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Book */
declare const BookIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Calendar */
declare const CalendarIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Clock */
declare const ClockIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Person */
declare const PersonIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Group of people */
declare const UsersIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Language / world */
declare const GlobeIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Oil lamp (deepam) */
declare const LampIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Play */
declare const PlayIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Pause */
declare const PauseIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Send */
declare const SendIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Share */
declare const ShareIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Gift */
declare const GiftIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Image */
declare const ImageIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** File / document */
declare const FileIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Opens in a new tab */
declare const ExternalIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Arrow up */
declare const ArrowUpIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Arrow left */
declare const ArrowLeftIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Arrow right */
declare const ArrowRightIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Headphones / listen */
declare const HeadphonesIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Music / audio */
declare const MusicIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Location pin */
declare const PinIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Map / directions */
declare const MapIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Pen / write */
declare const PenIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Wallet / money */
declare const WalletIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Install app */
declare const InstallIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Help */
declare const HelpIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Temple */
declare const TempleIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Meditation */
declare const MeditateIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Trophy / result */
declare const TrophyIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Idea / tip */
declare const BulbIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Sun / light mode */
declare const SunIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Delete */
declare const DeleteIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Robot / AI assistant */
declare const RobotIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Heart (not liked) */
declare const HeartIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Heart (liked) */
declare const HeartFilledIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Hub / network */
declare const HubIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Code */
declare const CodeIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Text field */
declare const TextIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Bold */
declare const BoldIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Italic */
declare const ItalicIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Underline */
declare const UnderlineIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Align left */
declare const AlignLeftIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Align centre */
declare const AlignCenterIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Align right */
declare const AlignRightIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Justify */
declare const AlignJustifyIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Quote */
declare const QuoteIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Title */
declare const TitleIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Font */
declare const FontIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Spell check */
declare const SpellcheckIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Letters (ABC) */
declare const AbcIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Page break */
declare const PageBreakIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Link */
declare const LinkIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Style */
declare const StyleIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Lock */
declare const LockIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Unlock */
declare const UnlockIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Key */
declare const KeyIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Redo */
declare const RedoIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Swap */
declare const SwapIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Shuffle */
declare const ShuffleIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Full screen */
declare const FullscreenIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Exit full screen */
declare const FullscreenExitIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Merge */
declare const MergeIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Join */
declare const JoinIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Tap / touch */
declare const TouchIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Sound off */
declare const VolumeOffIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Music off */
declare const MusicOffIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Music video */
declare const MusicVideoIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Movie */
declare const MovieIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Slide show */
declare const SlideshowIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Storage / database */
declare const StorageIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** API */
declare const ApiIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Data object { } */
declare const DataObjectIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Computer */
declare const ComputerIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Phone */
declare const PhoneIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Cloud */
declare const CloudIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Wi-Fi */
declare const WifiIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** No Wi-Fi / offline */
declare const WifiOffIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** No results */
declare const SearchOffIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Hide */
declare const EyeOffIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Bookmark */
declare const BookmarkIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** School / learning */
declare const SchoolIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Law / rules */
declare const GavelIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Architecture / design */
declare const ArchitectureIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Brain / thinking */
declare const BrainIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Volunteer / care */
declare const VolunteerIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Radio button (off) */
declare const RadioIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Radio button (on) */
declare const RadioCheckedIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Upload */
declare const UploadIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;
/** Arrow down */
declare const ArrowDownIcon: (props: IconProps) => react_jsx_runtime.JSX.Element;

export { AbcIcon, AccessibilityIcon, AlertIcon, AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon, ApiIcon, ArchitectureIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, BoldIcon, BookIcon, BookmarkIcon, BrainIcon, BulbIcon, CalendarIcon, CardsIcon, ChatIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsIcon, ClockIcon, CloseIcon, CloudIcon, CodeIcon, ComputerIcon, ContrastIcon, CopyIcon, DataObjectIcon, DeleteIcon, DownloadIcon, ExternalIcon, EyeIcon, EyeOffIcon, FileIcon, FilterIcon, FirstIcon, FontIcon, FormIcon, FullscreenExitIcon, FullscreenIcon, GavelIcon, GiftIcon, GlobeIcon, GridIcon, HeadphonesIcon, HeartFilledIcon, HeartIcon, HelpIcon, HomeIcon, HubIcon, ICON_MIN_CONTRAST, ICON_NAMES, ICON_PATHS, IconBase, type IconName, type IconProps, type IconShape, type IconSvgOptions, type IconVariant, ImageIcon, InfoIcon, InstallIcon, ItalicIcon, JoinIcon, KeyIcon, LampIcon, LastIcon, LayoutIcon, LinkIcon, LockIcon, MapIcon, MeditateIcon, MenuIcon, MergeIcon, MicIcon, MinusIcon, MoonIcon, MotionIcon, MovieIcon, MusicIcon, MusicOffIcon, MusicVideoIcon, PageBreakIcon, PaletteIcon, PauseIcon, PenIcon, PersonIcon, PhoneIcon, PinIcon, PlayIcon, PlugIcon, PlusIcon, QuoteIcon, RadioCheckedIcon, RadioIcon, ReadingIcon, RedoIcon, ResetIcon, RobotIcon, SchoolIcon, SearchIcon, SearchOffIcon, SendIcon, ShareIcon, ShuffleIcon, SkipIcon, SlideshowIcon, SortDownIcon, SortIcon, SortUpIcon, SparkIcon, SpeakerIcon, SpellcheckIcon, StopIcon, StorageIcon, StyleIcon, SunIcon, SwapIcon, TargetIcon, TempleIcon, TextIcon, TitleIcon, ToolsIcon, TouchIcon, TrophyIcon, UnderlineIcon, UndoIcon, UnlockIcon, UploadIcon, UsersIcon, VolumeOffIcon, VolunteerIcon, WalletIcon, WandIcon, WifiIcon, WifiOffIcon, YuktaiIcon, type YuktaiIconProps, iconContrast, iconSvg, pickGlyphColor, resolveIconColours };
