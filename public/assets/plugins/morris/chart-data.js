(function () {
	'use strict';

	document.addEventListener('DOMContentLoaded', function () {
		const morrisData = [
			{ y: '2006', a: 12, b: 18 },
			{ y: '2007', a: 18, b: 22 },
			{ y: '2008', a: 15, b: 18 },
			{ y: '2009', a: 25, b: 28 },
			{ y: '2010', a: 30, b: 35 },
			{ y: '2011', a: 18, b: 28 },
			{ y: '2012', a: 12, b: 18 }
		];

		function getCanvas(id) {
			const container = document.getElementById(id);
			if (!container) return null;
			const canvas = document.createElement('canvas');
			container.appendChild(canvas);
			return canvas;
		}

		// morrisBar1 -> grouped bar chart
		const bar1Canvas = getCanvas('morrisBar1');
		if (bar1Canvas) {
			new Chart(bar1Canvas, {
				type: 'bar',
				data: {
					labels: morrisData.map(d => d.y),
					datasets: [
						{ label: 'Series A', data: morrisData.map(d => d.a), backgroundColor: '#664dc9' },
						{ label: 'Series B', data: morrisData.map(d => d.b), backgroundColor: '#44c4fa' }
					]
				},
				options: { responsive: true, maintainAspectRatio: false }
			});
		}

		// morrisBar3 -> stacked bar chart
		const bar3Canvas = getCanvas('morrisBar3');
		if (bar3Canvas) {
			new Chart(bar3Canvas, {
				type: 'bar',
				data: {
					labels: morrisData.map(d => d.y),
					datasets: [
						{ label: 'Series A', data: morrisData.map(d => d.a), backgroundColor: '#664dc9' },
						{ label: 'Series B', data: morrisData.map(d => d.b), backgroundColor: '#44c4fa' }
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					scales: { x: { stacked: true }, y: { stacked: true } }
				}
			});
		}

		// morrisLine1 -> line chart
		const line1Canvas = getCanvas('morrisLine1');
		if (line1Canvas) {
			new Chart(line1Canvas, {
				type: 'line',
				data: {
					labels: morrisData.map(d => d.y),
					datasets: [
						{ label: 'Series A', data: morrisData.map(d => d.a), borderColor: '#664dc9', fill: false, borderWidth: 1 },
						{ label: 'Series B', data: morrisData.map(d => d.b), borderColor: '#44c4fa', fill: false, borderWidth: 1 }
					]
				},
				options: { responsive: true, maintainAspectRatio: false, scales: { y: { suggestedMax: 50 } } }
			});
		}

		// morrisArea1 -> filled/area line chart
		const areaData = [
			{ y: '2006', a: 10, b: 15 },
			{ y: '2007', a: 25, b: 22 },
			{ y: '2008', a: 80, b: 60 },
			{ y: '2009', a: 25, b: 28 },
			{ y: '2010', a: 30, b: 35 },
			{ y: '2011', a: 18, b: 28 },
			{ y: '2012', a: 12, b: 18 }
		];
		const area1Canvas = getCanvas('morrisArea1');
		if (area1Canvas) {
			new Chart(area1Canvas, {
				type: 'line',
				data: {
					labels: areaData.map(d => d.y),
					datasets: [
						{ label: 'Series A', data: areaData.map(d => d.a), borderColor: '#664dc9', backgroundColor: '#664dc9', fill: true, borderWidth: 1 },
						{ label: 'Series B', data: areaData.map(d => d.b), borderColor: '#44c4fa', backgroundColor: '#44c4fa', fill: true, borderWidth: 1 }
					]
				},
				options: { responsive: true, maintainAspectRatio: false, scales: { y: { suggestedMax: 100 } } }
			});
		}

		// morrisBar6 -> live-updating sine/cosine line chart
		function data(offset) {
			const ret = [];
			for (let x = 0; x <= 360; x += 10) {
				const v = (offset + x) % 360;
				ret.push({
					x: x,
					y: Number(Math.sin(Math.PI * v / 180).toFixed(4)),
					z: Number(Math.cos(Math.PI * v / 180).toFixed(4))
				});
			}
			return ret;
		}

		const bar6Canvas = getCanvas('morrisBar6');
		if (bar6Canvas) {
			const initial = data(0);
			const bar6Chart = new Chart(bar6Canvas, {
				type: 'line',
				data: {
					labels: initial.map(d => d.x),
					datasets: [
						{ label: 'data1', data: initial.map(d => d.y), borderColor: '#664dc9', fill: false, pointRadius: 0, borderWidth: 1 },
						{ label: 'data2', data: initial.map(d => d.z), borderColor: '#44c4fa', fill: false, pointRadius: 0, borderWidth: 1 }
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					animation: false,
					scales: { y: { min: -1.0, max: 1.0 } },
					plugins: { tooltip: { enabled: false } }
				}
			});

			let nReloads = 0;
			setInterval(function () {
				nReloads++;
				const updated = data(5 * nReloads);
				bar6Chart.data.labels = updated.map(d => d.x);
				bar6Chart.data.datasets[0].data = updated.map(d => d.y);
				bar6Chart.data.datasets[1].data = updated.map(d => d.z);
				bar6Chart.update();
			}, 100);
		}

		// morrisBar7 -> line chart from period data
		const dayData = [
			{ period: '2012-10-01', licensed: 3407, sorned: 660 },
			{ period: '2012-09-30', licensed: 3351, sorned: 629 },
			{ period: '2012-09-29', licensed: 3269, sorned: 618 },
			{ period: '2012-09-20', licensed: 3246, sorned: 661 },
			{ period: '2012-09-19', licensed: 3257, sorned: 667 },
			{ period: '2012-09-18', licensed: 3248, sorned: 627 },
			{ period: '2012-09-17', licensed: 3171, sorned: 660 },
			{ period: '2012-09-16', licensed: 3171, sorned: 676 },
			{ period: '2012-09-15', licensed: 3201, sorned: 656 },
			{ period: '2012-09-10', licensed: 3215, sorned: 622 }
		];
		const bar7Canvas = getCanvas('morrisBar7');
		if (bar7Canvas) {
			new Chart(bar7Canvas, {
				type: 'line',
				data: {
					labels: dayData.map(d => d.period),
					datasets: [
						{ label: 'Licensed', data: dayData.map(d => d.licensed), borderColor: '#664dc9', fill: false, borderWidth: 1 },
						{ label: 'SORN', data: dayData.map(d => d.sorned), borderColor: '#44c4fa', fill: false, borderWidth: 1 }
					]
				},
				options: { responsive: true, maintainAspectRatio: false }
			});
		}

		// morrisDonut1 -> doughnut chart
		const donutCanvas = getCanvas('morrisDonut1');
		if (donutCanvas) {
			new Chart(donutCanvas, {
				type: 'doughnut',
				data: {
					labels: ['Sales', 'Pending;', 'Process'],
					datasets: [{
						data: [50, 30, 20],
						backgroundColor: ['#664dc9', '#44c4fa', '#38cb89'],
						borderColor: ['#664dc9', '#44c4fa', '#38cb89']
					}]
				},
				options: { responsive: true, maintainAspectRatio: false }
			});
		}

		// morrisline -> single-series line chart
		const dayData1 = [
			{ period: '2012-10-01', licensed: 20 },
			{ period: '2012-09-30', licensed: 10 },
			{ period: '2012-09-29', licensed: 15 },
			{ period: '2012-09-20', licensed: 10 },
			{ period: '2012-09-19', licensed: 20 },
			{ period: '2012-09-18', licensed: 10 }
		];
		const morrislineCanvas = getCanvas('morrisline');
		if (morrislineCanvas) {
			new Chart(morrislineCanvas, {
				type: 'line',
				data: {
					labels: dayData1.map(d => d.period),
					datasets: [
						{ label: 'Licensed', data: dayData1.map(d => d.licensed), borderColor: '#664dc9', fill: false, borderWidth: 1 }
					]
				},
				options: { responsive: true, maintainAspectRatio: false }
			});
		}
	});
})();
