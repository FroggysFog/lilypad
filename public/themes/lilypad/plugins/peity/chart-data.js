(function () {
	"use strict";

	document.addEventListener('DOMContentLoaded', function () {
		// Just the defaults.
		peityVanilla('span.pie', 'pie', { width: 80, height: 80 });
		peityVanilla('span.donut', 'donut', { width: 50, height: 50 });
		peityVanilla('.peity-line', 'line', { width: '100%', height: 65, fill: ['#506EE4'] });
		peityVanilla('.bar', 'bar', { width: '100%', height: 50 });

		peityVanilla('.bar-colours-1', 'bar', { fill: ['#E8EEFE', '#E8EEFE', '#E8EEFE', '#5777E6', '#E8EEFE'], width: 66, height: 51 });
		peityVanilla('.bar-colours-2', 'bar', { fill: ['#FFF5ED', '#FFF5ED', '#FFF5ED', '#FFAD6A', '#FFF5ED'], width: 66, height: 51 });
		peityVanilla('.bar-colours-3', 'bar', { fill: ['#F0ECFF', '#F0ECFF', '#F0ECFF', '#945CFF', '#F0ECFF'], width: 66, height: 51 });
		peityVanilla('.bar-colours-4', 'bar', { fill: ['#EBF4F2', '#EBF4F2', '#EBF4F2', '#56A89B', '#EBF4F2'], width: 66, height: 51 });
		peityVanilla('.bar-colours-5', 'bar', { fill: ['#92ACF3', '#92ACF3', '#E8EEFE', '#92ACF3', '#92ACF3', '#E8EEFE', '#E8EEFE', '#E8EEFE', '#E8EEFE', '#E8EEFE'], width: 100, height: 52 });
		peityVanilla('.bar-colours-6', 'bar', { fill: ['#FFC292', '#FFC292', '#FFD7B7', '#FFD7B7', '#FFC292', '#FFC292', '#F3F4F6'], width: 100, height: 52 });

		peityVanilla('.pie-colours-1', 'pie', { fill: ['#705ec8', '#fa057a', '#2dce89', '#ff5b51'], width: 100, height: 100 });
		peityVanilla('.pie-colours-2', 'pie', { fill: ['#705ec8', '#fa057a', '#2dce89', '#ff5b51', '#fcbf09'], width: 100, height: 100 });

		// Using data attributes
		peityVanilla('.data-attributes span', 'donut', {});

		// Evented example.
		document.querySelectorAll('select').forEach(select => {
			select.addEventListener('change', function () {
				const text = this.value + '/' + 5;
				const parent = this.parentElement;
				const graph = parent ? parent.querySelector('span.graph') : null;
				if (graph) {
					graph.textContent = text;
					peityVanilla('span.graph', 'pie', {});
				}
				const notice = document.getElementById('notice');
				if (notice) notice.textContent = 'Chart updated: ' + text;
			});
		});

		peityVanilla('span.graph', 'pie', {});

		// Updating charts.
		const updatingCharts = document.querySelectorAll('.updating-chart');
		if (updatingCharts.length > 0) {
			peityVanilla('.updating-chart', 'line', { width: '100%', height: 65 });
			setInterval(function () {
				updatingCharts.forEach(chart => {
					const random = Math.round(Math.random() * 20);
					const values = chart.textContent.split(',');
					values.shift();
					values.push(random);
					chart.textContent = values.join(',');
				});
				peityVanilla('.updating-chart', 'line', { width: '100%', height: 65 });
			}, 2500);
		}
	});

	document.addEventListener('DOMContentLoaded', function () {
		peityVanilla('.ticket-chart-1', 'bar', { fill: ['#F26522'], width: '100%', height: 70 });
		peityVanilla('.ticket-chart-2', 'bar', { fill: ['#AB47BC'], width: '100%', height: 70 });
		peityVanilla('.ticket-chart-3', 'bar', { fill: ['#03C95A'], width: '100%', height: 70 });
		peityVanilla('.ticket-chart-4', 'bar', { fill: ['#0DCAF0'], width: '100%', height: 70 });

		peityVanilla('.subscription-line-1', 'line', { width: '100%', height: 35, fill: ['#F7A37A'], stroke: ['#F7A37A'] });
		peityVanilla('.subscription-line-2', 'line', { width: '100%', height: 25, fill: ['#70B1FF'], stroke: ['#70B1FF'] });
		peityVanilla('.subscription-line-3', 'line', { width: '100%', height: 25, fill: ['#60DD97'], stroke: ['#60DD97'] });
		peityVanilla('.subscription-line-4', 'line', { width: '100%', height: 25, fill: ['#DE5555'], stroke: ['#DE5555'] });

		peityVanilla('.country-chart-1', 'line', { width: '90%', height: 20, fill: ['#fe973821'], stroke: ['#FE9738'] });
		peityVanilla('.country-chart-2', 'line', { width: '90%', height: 20, fill: ['#8000ff26'], stroke: ['#8000FF'] });
		peityVanilla('.country-chart-3', 'line', { width: '90%', height: 20, fill: ['#3550dc1c'], stroke: ['#3550DC'] });
		peityVanilla('.country-chart-4', 'line', { width: '90%', height: 20, fill: ['#f301ca21'], stroke: ['#F301CA'] });

		peityVanilla('.company-bar1', 'bar', { fill: ['#3550DC'], width: 36, height: 37 });
		peityVanilla('.company-bar2', 'bar', { fill: ['#01B664'], width: 36, height: 37 });
		peityVanilla('.company-bar3', 'bar', { fill: ['#FF0000'], width: 36, height: 37 });
		peityVanilla('.company-bar4', 'bar', { fill: ['#FE9738'], width: 36, height: 37 });
	});
})();
