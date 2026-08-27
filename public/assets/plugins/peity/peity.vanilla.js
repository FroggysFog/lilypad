/*!
 * Vanilla JS port of the small subset of Peity (jquery.peity.min.js) used by this project.
 * Renders inline SVG pie / donut / line / bar charts from an element's text content,
 * matching peity's value formats: "a/b" fraction, "a,b,c" comma-separated series.
 * No jQuery dependency.
 */
(function (window) {
	function parseValues(text) {
		text = text.trim();
		if (text.indexOf('/') > -1) {
			return text.split('/').map(Number);
		}
		return text.split(',').map(Number);
	}

	function svgEl(tag, attrs) {
		const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
		Object.keys(attrs || {}).forEach(key => el.setAttribute(key, attrs[key]));
		return el;
	}

	function renderPie(el, opts) {
		const values = parseValues(el.textContent);
		const width = parseFloat(opts.width) || el.offsetWidth || 32;
		const height = parseFloat(opts.height) || el.offsetHeight || 32;
		const radius = opts.radius || Math.min(width, height) / 2;
		const innerRadius = opts.innerRadius || 0;
		const cx = width / 2;
		const cy = height / 2;
		const fill = opts.fill || ['#ff9900', '#fff4dd'];

		let total, slices;
		if (values.length === 2 && el.textContent.indexOf('/') > -1) {
			total = values[1];
			slices = [values[0], values[1] - values[0]];
		} else {
			total = values.reduce((a, b) => a + b, 0);
			slices = values;
		}
		if (total <= 0) total = 1;

		const svg = svgEl('svg', { width: width, height: height, class: 'peity' });
		let startAngle = -Math.PI / 2;

		slices.forEach((value, i) => {
			const angle = (value / total) * Math.PI * 2;
			const endAngle = startAngle + angle;
			const color = fill[i % fill.length];

			if (slices.length === 1 || value >= total) {
				// full circle
				const circle = svgEl('circle', { cx: cx, cy: cy, r: radius, fill: color });
				svg.appendChild(circle);
			} else if (value > 0) {
				const x1 = cx + radius * Math.cos(startAngle);
				const y1 = cy + radius * Math.sin(startAngle);
				const x2 = cx + radius * Math.cos(endAngle);
				const y2 = cy + radius * Math.sin(endAngle);
				const largeArc = angle > Math.PI ? 1 : 0;
				const path = svgEl('path', {
					d: `M${cx},${cy} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`,
					fill: color
				});
				svg.appendChild(path);
			}
			startAngle = endAngle;
		});

		if (innerRadius > 0) {
			svg.appendChild(svgEl('circle', { cx: cx, cy: cy, r: innerRadius, fill: getBackgroundColor(el) }));
		}

		replaceWithSvg(el, svg);
	}

	function getBackgroundColor(el) {
		let node = el;
		while (node) {
			const bg = window.getComputedStyle(node).backgroundColor;
			if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
			node = node.parentElement;
		}
		return '#fff';
	}

	function renderLine(el, opts) {
		const values = parseValues(el.textContent);
		const width = parseWidth(opts.width, el);
		const height = parseFloat(opts.height) || el.offsetHeight || 20;
		const fill = (opts.fill && opts.fill[0]) || '#c6d9fd';
		const stroke = (opts.stroke && opts.stroke[0]) || fill;
		const strokeWidth = opts.strokeWidth || 1;

		const max = Math.max.apply(null, values.concat([0]));
		const min = Math.min.apply(null, values.concat([0]));
		const range = (max - min) || 1;
		const stepX = width / (values.length - 1 || 1);

		const points = values.map((v, i) => {
			const x = i * stepX;
			const y = height - ((v - min) / range) * height;
			return [x, y];
		});

		const linePath = points.map((p, i) => (i === 0 ? 'M' : 'L') + p[0] + ',' + p[1]).join(' ');
		const areaPath = linePath + ` L${width},${height} L0,${height} Z`;

		const svg = svgEl('svg', { width: width, height: height, class: 'peity' });
		svg.appendChild(svgEl('path', { d: areaPath, fill: fill, stroke: 'none' }));
		svg.appendChild(svgEl('path', { d: linePath, fill: 'none', stroke: stroke, 'stroke-width': strokeWidth }));

		replaceWithSvg(el, svg);
	}

	function renderBar(el, opts) {
		const values = parseValues(el.textContent);
		const width = parseWidth(opts.width, el);
		const height = parseFloat(opts.height) || el.offsetHeight || 20;
		const fill = opts.fill || ['#4d89f9', '#c6d9fd'];

		const max = Math.max.apply(null, values.map(Math.abs).concat([1]));
		const gap = 2;
		const barWidth = (width - gap * (values.length - 1)) / values.length;
		const zeroY = values.some(v => v < 0) ? height / 2 : height;
		const scale = (values.some(v => v < 0) ? height / 2 : height) / max;

		const svg = svgEl('svg', { width: width, height: height, class: 'peity' });
		values.forEach((v, i) => {
			const barHeight = Math.abs(v) * scale;
			const x = i * (barWidth + gap);
			const y = v >= 0 ? zeroY - barHeight : zeroY;
			const color = v >= 0 ? fill[0] : (fill[1] || fill[0]);
			svg.appendChild(svgEl('rect', { x: x, y: y, width: barWidth, height: barHeight, fill: color }));
		});

		replaceWithSvg(el, svg);
	}

	function parseWidth(width, el) {
		if (typeof width === 'string' && width.indexOf('%') > -1) {
			return el.parentElement ? el.parentElement.clientWidth || 100 : 100;
		}
		return parseFloat(width) || el.offsetWidth || 100;
	}

	function replaceWithSvg(el, svg) {
		// Preserve the original element (hidden) so re-render / text-content driven updates still work,
		// matching Peity's approach of keeping the source element and inserting the chart alongside it.
		const existing = el.nextElementSibling;
		if (existing && existing.classList && existing.classList.contains('peity-svg')) {
			existing.remove();
		}
		svg.classList.add('peity-svg');
		el.style.display = 'none';
		el.insertAdjacentElement('afterend', svg);
	}

	function getDataPeityConfig(el) {
		const raw = el.getAttribute('data-peity');
		if (!raw) return {};
		try {
			return JSON.parse(raw);
		} catch (e) {
			return {};
		}
	}

	function renderChart(el, type, defaults) {
		const config = Object.assign({}, defaults || {}, getDataPeityConfig(el));
		if (el.hasAttribute('data-width')) config.width = el.getAttribute('data-width');
		if (el.hasAttribute('data-height')) config.height = el.getAttribute('data-height');

		if (type === 'pie' || type === 'donut') {
			if (type === 'donut' && !config.innerRadius) {
				const width = parseFloat(config.width) || el.offsetWidth || 32;
				config.innerRadius = width / 4;
			}
			renderPie(el, config);
		} else if (type === 'line') {
			renderLine(el, config);
		} else if (type === 'bar') {
			renderBar(el, config);
		}
	}

	function peity(selector, type, defaults) {
		document.querySelectorAll(selector).forEach(el => renderChart(el, type, defaults));
	}

	window.peityVanilla = peity;
})(window);
