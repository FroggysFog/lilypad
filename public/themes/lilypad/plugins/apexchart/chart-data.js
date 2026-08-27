'use strict';

document.addEventListener('DOMContentLoaded', function () {

  function generateData(baseval, count, yrange) {
    var i = 0;
    var series = [];
    while (i < count) {
      var x = Math.floor(Math.random() * (750 - 1 + 1)) + 1;;
      var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
      var z = Math.floor(Math.random() * (75 - 15 + 1)) + 15;

      series.push([x, y, z]);
      baseval += 86400000;
      i++;
    }
    return series;
  }


  // Column chart
  if (document.querySelector('#sales_chart')) {
    var columnCtx = document.getElementById("sales_chart"),
      columnConfig = {
        colors: ['#7638ff', '#fda600'],
        series: [
          {
            name: "Received",
            type: "column",
            data: [70, 150, 80, 180, 150, 175, 201, 60, 200, 120, 190, 160, 50]
          },
          {
            name: "Pending",
            type: "column",
            data: [23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 16, 80]
          }
        ],
        chart: {
          type: 'bar',
          fontFamily: 'Poppins, sans-serif',
          height: 350,
          toolbar: {
            show: false
          }
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '60%',
            endingShape: 'rounded'
          },
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        },
        yaxis: {
          title: {
            text: '$ (thousands)'
          }
        },
        fill: {
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return "$ " + val + " thousands"
            }
          }
        }
      };
    var columnChart = new ApexCharts(columnCtx, columnConfig);
    columnChart.render();
  }


  if (document.querySelector('#reservation-chart')) {
    var sCol = {
      chart: {
        width: '100%',
        height: 'auto', // Adjusts dynamically
        type: 'bar',
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '80%', // Adjust spacing
          endingShape: 'rounded'
        }
      },
      colors: ['#D0E3E6', '#4361ee'],
      states: {
        hover: {
          filter: {
            type: 'darken',
            value: 0.3
          }
        }
      },
      dataLabels: { enabled: false },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      series: [{
        name: 'Net Profit',
        data: [7, 9, 4, 9, 6, 8, 10]
      }],
      fill: { opacity: 1 },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July'],
        labels: { show: false },
        axisTicks: { show: false },
        axisBorder: { show: false }
      },
      grid: {
        show: false, // Hides grid lines
        padding: { left: 0, right: 0, top: 0, bottom: 0 }
      },
      yaxis: { labels: { show: false } },
      tooltip: {
        y: {
          formatter: function (val) {
            return val;
          }
        }
      }
    };

    var chart = new ApexCharts(
      document.querySelector("#reservation-chart"),
      sCol
    );

    chart.render();
  }


if (document.querySelector('#revenue-breakdown-chart')) {

  var options = {
    chart: {
      type: 'bar',
      height: 250,
      toolbar: { show: false }
    },

    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '55%',
        borderRadius: 8,
        distributed: true   // ✅ IMPORTANT
      }
    },

    series: [{
      data: [2.3, 1.9, 1.4, 0.9]
    }],

    xaxis: {
      categories: [
        'Enterprise Suite',
        'Professional Plan',
        'Starter Package',
        'Add-ons & Services'
      ],
      fontSize: '14px',
      min: 0,
      max: 2.6,
      tickAmount: 4,
      labels: {
        style: {
          fontSize: '12px'
        },
        formatter: function (val) {
          return "$" + val.toFixed(1) + "M";
        }
      }
    },
    yaxis: {
      labels: {
          style: {
          fontSize: '12px',          
        },
      }
    },

    colors: [
      '#C594FA',  // Purple start
      '#ff6a6a',  // Red start
      '#ffc107',  // Orange start
      '#5bc0ff'   // Blue start
    ],
     tooltip: {
		marker: false,
	},
    fill: {
      type: 'gradient',
      gradient: {
        type: 'horizontal',
        shadeIntensity: 0,
        opacityFrom: 1,
        opacityTo: 1,
        gradientToColors: [
          '#7F24E3',  // Purple end
          '#dc3545',  // Red end
          '#ff9800',  // Orange end
          '#0dcaf0'   // Blue end
        ],
        stops: [0, 100]
      }
    },

    dataLabels: { enabled: false },
    grid: { show: false },
    stroke: { show: false },
    legend: { show: false }
  };

  var chart = new ApexCharts(
    document.querySelector("#revenue-breakdown-chart"),
    options
  );

  chart.render();
}

if (document.querySelector('#revenue-performance-chart')) {

  var options = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: false }
    },

    series: [
      {
        name: "Actual Revenue",
        data: [120, 210, 290, 260, 240, 420, 460, 380, 300, 320, 480, 600]
      },
      {
        name: "Forecasted",
        data: [110, 200, 270, 230, 220, 300, 270, 220, 180, 210, 420, 520]
      },
      {
        name: "Prior Year",
        data: [60, 120, 160, 140, 130, 220, 260, 210, 170, 160, 330, 510]
      }
    ],

    stroke: {
      curve: 'smooth',
      width: 2
    },

    colors: ['#3B44F6', '#22C55E', '#FF3B30'],

    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },

    dataLabels: { enabled: false },

    xaxis: {
      categories: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ],
      labels: {
        style: { fontSize: '12px' }
      }
    },

    yaxis: {
      labels: {
        formatter: function (val) {
          return "$" + val + "K";
        },
        style: { fontSize: '12px' }
      }
    },

    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4
    },

    tooltip: {
      marker: false,
      shared: true,
      intersect: false,
      y: {
        formatter: function (val) {
          return "$" + val + "K";
        }
      }
    },

    legend: {
      show: false   // ✅ removed legend
    }
  };

  var chart = new ApexCharts(
    document.querySelector("#revenue-performance-chart"),
    options
  );

  chart.render();
}

if (document.querySelector('#revenue_expense')) {

  var options = {
    chart: {
      type: 'bar',
      height: 250,
      toolbar: { show: false }
    },

    series: [{
      name: 'Amount',
      data: [80, 45] // Revenue, Expense
    }],

    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        barHeight: '55%',
        distributed: true
      }
    },

    colors: ['#6D5EF3', '#FF5B5B'], // Purple & Red

    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: "horizontal",
        shadeIntensity: 0.5,
        gradientToColors: ['#8B7CF6', '#FF7B7B'], // lighter end color
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    },

    dataLabels: {
      enabled: false
    },

    xaxis: {
      categories: ['Revenue', 'Expense'],
       min: 0,
        max: 3,              // change based on your data range
        tickAmount: 6,
      labels: {
        show: true,
        formatter: function (val) {
          return "" + val.toFixed(1) + "M"; 
        },
      }
    },

    yaxis: {
      labels: {
        style: {
          fontSize: '14px'
        }
      }
    },

    grid: {
      show: false
    },

    legend: {
      show: false
    },

    tooltip: {
      y: {
        formatter: function (val) {
          return val + "%";
        }
      }
    }
  };

  var chart = new ApexCharts(
    document.querySelector("#revenue_expense"),
    options
  );

  chart.render();
}

if (document.querySelector('#comparison-chart')) {

  var options = {
    chart: {
      type: 'bar',
      height: 260,
      toolbar: { show: false }
    },

    series: [
      {
        name: 'Current',
        data: [156, 28.4, 47]
      },
      {
        name: 'Previous',
        data: [152, 26.9, 42]
      }
    ],

    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 12,
        barHeight: '65%',
        distributed: false
      }
    },

    colors: ['#6D5EF3', '#9E9E9E'], // Current & Previous

    dataLabels: {
      enabled: true,
      style: {
        fontSize: '14px',
        fontWeight: 600
      },
      formatter: function (val, opts) {
        if (opts.dataPointIndex === 1) {
          return val + "%";
        }
        return val;
      }
    },

    xaxis: {
      categories: ['Deals Closed', 'Win Rate', 'Sales Cycle (days)'],
      labels: {
        show: false
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },

    yaxis: {
      labels: {
        style: {
          fontSize: '14px',
          fontWeight: 500
        }
      }
    },

    grid: {
      show: false
    },

    legend: {
      show: false
    },

    tooltip: {
      y: {
        formatter: function (val, opts) {
          if (opts.dataPointIndex === 1) {
            return val + "%";
          }
          return val;
        }
      }
    }
  };

  var chart = new ApexCharts(
    document.querySelector("#comparison-chart"),
    options
  );

  chart.render();
}

  //Report Chart
  if (document.querySelector('#report_chart')) {
    var options = {
      series: [{
        data: [0, 6, 24, 14, 20, 15, 37]
      }],
      chart: {
        type: 'area',
        width: 70,
        height: 46,
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      colors: ['#7539FF'],

      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function (seriesName) {
              return ''
            }
          }
        },
        marker: {
          show: false
        }
      }
    };


    var chart = new ApexCharts(document.querySelector("#report_chart"), options);
    chart.render();
  }
  if (document.querySelector('#report_chart_2')) {
    var options = {
      series: [{
        data: [0, 6, 24, 14, 20, 15, 37]
      }],
      chart: {
        type: 'area',
        width: 70,
        height: 50,
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      colors: ['#27AE60'],

      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function (seriesName) {
              return ''
            }
          }
        },
        marker: {
          show: false
        }
      }
    };


    var chart = new ApexCharts(document.querySelector("#report_chart_2"), options);
    chart.render();
  }
  if (document.querySelector('#report_chart_3')) {
    var options = {
      series: [{
        data: [0, 6, 24, 14, 20, 15, 37]
      }],
      chart: {
        type: 'area',
        width: 70,
        height: 50,
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      colors: ['#E2B93B'],

      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function (seriesName) {
              return ''
            }
          }
        },
        marker: {
          show: false
        }
      }
    };

    var chart = new ApexCharts(document.querySelector("#report_chart_3"), options);
    chart.render();
  }
  if (document.querySelector('#report_chart_4')) {
    var options = {
      series: [{
        data: [0, 6, 24, 14, 20, 15, 37]
      }],
      chart: {
        type: 'area',
        width: 70,
        height: 50,
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      colors: ['#EF1E1E'],

      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function (seriesName) {
              return ''
            }
          }
        },
        marker: {
          show: false
        }
      }
    };

    var chart = new ApexCharts(document.querySelector("#report_chart_4"), options);
    chart.render();
  }
  //Payment Report Chart
  if (document.querySelector('#payment_report_chart')) {
    var options = {
      series: [{
        data: [0, 6, 24, 14, 20, 15, 37]
      }],
      chart: {
        type: 'area',
        height: 46,
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      colors: ['#7539FF'],

      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function (seriesName) {
              return ''
            }
          }
        },
        marker: {
          show: false
        }
      }
    };




    var chart = new ApexCharts(document.querySelector("#payment_report_chart"), options);
    chart.render();
  }
  if (document.querySelector('#payment_report_chart_2')) {
    var options = {
      series: [{
        data: [0, 6, 24, 14, 20, 15, 37]
      }],
      chart: {
        type: 'area',
        height: 50,
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      colors: ['#27AE60'],

      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function (seriesName) {
              return ''
            }
          }
        },
        marker: {
          show: false
        }
      }
    };




    var chart = new ApexCharts(document.querySelector("#payment_report_chart_2"), options);
    chart.render();
  }
  if (document.querySelector('#payment_report_chart_3')) {
    var options = {
      series: [{
        data: [0, 6, 24, 14, 20, 15, 37]
      }],
      chart: {
        type: 'area',
        height: 50,
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      colors: ['#E2B93B'],

      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function (seriesName) {
              return ''
            }
          }
        },
        marker: {
          show: false
        }
      }
    };

    var chart = new ApexCharts(document.querySelector("#payment_report_chart_3"), options);
    chart.render();
  }
  if (document.querySelector('#payment_report_chart_4')) {
    var options = {
      series: [{
        data: [0, 6, 24, 14, 20, 15, 37]
      }],
      chart: {
        type: 'area',
        height: 50,
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      colors: ['#EF1E1E'],

      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function (seriesName) {
              return ''
            }
          }
        },
        marker: {
          show: false
        }
      }
    };

    var chart = new ApexCharts(document.querySelector("#payment_report_chart_4"), options);
    chart.render();
  }
  //Pie Chart
  if (document.querySelector('#invoice_chart')) {
    var pieCtx = document.getElementById("invoice_chart"),
      pieConfig = {
        colors: ['#03C95A', '#E70D0D', '#AB47BC', '#FFC107'],
        series: [45, 15, 21, 5],
        chart: {
          fontFamily: 'Poppins, sans-serif',
          height: 150,
          type: 'donut',
          offsetX: -30,
        },
        labels: ['Paid', 'Overdue', 'Pending', 'Draft'],
        legend: { show: true },
        dataLabels: {
          enabled: false // Disable the data labels
        },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                name: {
                  show: true,
                  fontSize: '2px',
                },
                value: {
                  show: true,
                  fontSize: '12px',
                  formatter: function (val) {
                    return val + "%";
                  }
                },
                total: {
                  show: true,
                  showAlways: true,
                  formatter: function (w) {
                    return w.globals.seriesTotals.reduce((a, b) => {
                      return 45;
                    }, 0);
                  },
                  label: 'Paid'
                }
              }
            }
          }
        },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 300
            },
            legend: {
              position: 'right'
            }
          }
        }]
      };
    var pieChart = new ApexCharts(pieCtx, pieConfig);
    pieChart.render();
  }


  // Simple Line
  if (document.querySelector('#s-line')) {
    var sline = {
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        },
        toolbar: {
          show: false,
        }
      },
      colors: ['#3550DC'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      series: [{
        name: "Desktops",
        data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
      }],
      title: {
        text: 'Product Trends by Month',
        align: 'left'
      },
      grid: {
        row: {
          colors: ['#f1f2f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5
        },
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      }
    }

    var chart = new ApexCharts(
      document.querySelector("#s-line"),
      sline
    );

    chart.render();
  }


  // Simple Line Area
  if (document.querySelector('#s-line-area')) {
    var sLineArea = {
      chart: {
        height: 350,
        type: 'area',
        toolbar: {
          show: false,
        }
      },
      colors: ['#3550DC', '#888ea8'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth'
      },
      series: [{
        name: 'series1',
        data: [31, 40, 28, 51, 42, 109, 100]
      }, {
        name: 'series2',
        data: [11, 32, 45, 32, 34, 52, 41]
      }],

      xaxis: {
        type: 'datetime',
        categories: ["2018-09-19T00:00:00", "2018-09-19T01:30:00", "2018-09-19T02:30:00", "2018-09-19T03:30:00", "2018-09-19T04:30:00", "2018-09-19T05:30:00", "2018-09-19T06:30:00"],
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy HH:mm'
        },
      }
    }

    var chart = new ApexCharts(
      document.querySelector("#s-line-area"),
      sLineArea
    );

    chart.render();
  }

  if (document.querySelector('#s-col')) {
    var sCol = {
      chart: {
        height: 290,
        type: 'bar',
        toolbar: {
          show: false,
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '80%',
          borderRadius: 5,
          endingShape: 'rounded', // This rounds the top edges of the bars
        },
      },
      colors: ['#FFAD6A', '#5777E6', '#5CC583'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },

      series: [{
        name: 'Inprogress',
        data: [19, 65, 19, 19, 19, 19, 19]
      }, {
        name: 'Active',
        data: [89, 45, 89, 46, 61, 25, 79]
      },
      {
        name: 'Completed',
        data: [39, 39, 39, 80, 48, 48, 48]
      }],
      xaxis: {
        categories: ['15 Jan', '16 Jan', '17 Jan', '18 Jan', '19 Jan', '20 Jan', '21 Jan'],
        labels: {
          style: {
            colors: '#0C1C29',
            fontSize: '12px',
          }
        }
      },
      yaxis: {
        labels: {
          offsetX: -15,
          style: {
            colors: '#6D777F',
            fontSize: '14px',
          }
        }
      },
      grid: {
        borderColor: '#CED2D4',
        strokeDashArray: 5,
        padding: {
          left: -8,
          right: -15,
        },
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "" + val + "%"
          }
        }
      }
    }

    var chart = new ApexCharts(
      document.querySelector("#s-col"),
      sCol
    );

    chart.render();
  }

  if (document.querySelector('#earnings-chart')) {
    var sCol = {
      chart: {
        height: 390,
        type: 'bar',
        toolbar: {
          show: false,
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
          borderRadius: 10,
          borderRadiusApplication: 'end', // this makes only the top of vertical bars rounded
          endingShape: 'rounded',
        },
      },
      colors: ['#7539FF'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },

      series: [{
        name: 'Income',
        data: [28, 28, 43, 75, 45, 38, 47, 28, 33, 23, 58, 40]
      }],
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        labels: {
          style: {
            colors: '#051321',
            fontSize: '14px',
          }
        }
      },
      yaxis: {
        max: 100,
        labels: {
          offsetX: -15,
          style: {
            colors: '#051321',
            fontSize: '14px',
          }
        }
      },
      grid: {
        borderColor: '#CED2D4',
        strokeDashArray: 5,
        padding: {
          left: -8,
          right: -15,
        },
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "" + val + "%"
          }
        }
      }
    }

    var chart = new ApexCharts(
      document.querySelector("#earnings-chart"),
      sCol
    );

    chart.render();
  }

  if (document.querySelector('#register-chart')) {
    var sCol = {
      chart: {
        height: 320,
        type: 'area',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false
        }
      },
      stroke: {
        curve: 'straight', // creates those spiky angles like in the image
        width: 1,
        colors: ['#7539FF']
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: '#7539FF',
          type: "vertical",
          shadeIntensity: 1,
          gradientToColors: ['#ffffff'], // fade into white
          inverseColors: false,
          opacityFrom: 0.9,
          opacityTo: 0,
          stops: [0, 100]
        }
      },
      colors: ['#7539FF'],
      dataLabels: {
        enabled: false
      },
      series: [{
        name: 'Companies Registered',
        data: [40, 30, 80, 25, 60, 25, 40,] // you can adjust this data
      }],
      xaxis: {
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        tickPlacement: 'between',
        labels: {
          style: {
            colors: '#051321',
            fontSize: '14px',
          }
        }
      },
      yaxis: {
        max: 100,
        labels: {
          offsetX: -15,
          style: {
            colors: '#051321',
            fontSize: '14px',
          }
        }
      },
      grid: {
        borderColor: '#CED2D4',
        strokeDashArray: 5,
        padding: {
          left: -8,
          right: -15,
        },
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " companies";
          }
        }
      }
    }

    var chart = new ApexCharts(
      document.querySelector("#register-chart"),
      sCol
    );

    chart.render();
  }

  if (document.querySelector('#plane-chart')) {
    var options = {
      series: [{
        data: [400, 325, 312, 294, 254, 254]
      }],
      chart: {
        type: 'bar',
        height: 300,
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          barHeight: '100%',
          distributed: true,
          horizontal: true,
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '14px',
          fontWeight: '500',
          colors: ['#1D1D1D']
        },
        formatter: function (val, opt) {
          // Show label from category with value
          return categories[opt.dataPointIndex] + ": " + val;
          show
        },
        offsetX: 10,
        dropShadow: {
          enabled: false
        }
      },
      grid: {
        padding: {
          left: -10,
          right: 0,
          top: 0,
          bottom: -15
        }
      },
      legend: {
        show: false
      },
      colors: ['#FFECEC', '#DDF3FF', '#EADDFF', '#E1FFED', '#EADFF0', '#FFF8E7'],
      stroke: {
        width: 0,
        colors: ['#1D1D1D'],
      },
      xaxis: {
        labels: {
          show: false
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        labels: {
          show: false
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      tooltip: {
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function () {
              return ''; // Hide the title
            }
          },
          formatter: function (val, opts) {
            return categories[opts.dataPointIndex] + ': ' + val;
          }
        }
      }
    };

    // Categories used for labeling inside dataLabels
    const categories = [
      'Enterprise (Monthly) • Sales: $6,100.00',
      'Basic (Yearly) • Sales: $5,100.00',
      'Advanced (Monthly) • Sales: $4,200.00',
      'Enterprise (Yearly) • Sales: $4,100.00',
      'Basic (Monthly) • Sales: $3,100.00',
      'Advanced (Monthly) • Sales: $2,900.00'
    ];

    var chart = new ApexCharts(document.querySelector("#plane-chart"), options);
    chart.render();
  }


  // Simple Column Stacked
  if (document.querySelector('#s-col-stacked')) {
    var sColStacked = {
      chart: {
        height: 290,
        type: 'bar',
        stacked: true,
        toolbar: {
          show: false,
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
            offsetX: -10,
            offsetY: 0
          }
        }
      }],
      plotOptions: {
        bar: {
          horizontal: false,
        },
      },
      colors: ['#3550DC', '#E70D0D', '#03C95A', '#1B84FF'],
      series: [{
        name: 'PRODUCT A',
        data: [44, 55, 41, 67, 22, 43]
      }, {
        name: 'PRODUCT B',
        data: [13, 23, 20, 8, 13, 27]
      }, {
        name: 'PRODUCT C',
        data: [11, 17, 15, 15, 21, 14]
      }, {
        name: 'PRODUCT D',
        data: [21, 7, 25, 13, 22, 8]
      }],
      xaxis: {
        type: 'datetime',
        categories: ['01/01/2011 GMT', '01/02/2011 GMT', '01/03/2011 GMT', '01/04/2011 GMT', '01/05/2011 GMT', '01/06/2011 GMT'],
      },
      legend: {
        position: 'right',
        offsetY: 40
      },
      fill: {
        opacity: 1
      },
    }

    var chart = new ApexCharts(
      document.querySelector("#s-col-stacked"),
      sColStacked
    );

    chart.render();
  }

  // Simple Bar
  if (document.querySelector('#s-bar')) {
    var sBar = {
      chart: {
        height: 350,
        type: 'bar',
        toolbar: {
          show: false,
        }
      },
      colors: ['#3550DC'],
      plotOptions: {
        bar: {
          horizontal: true,
        }
      },
      dataLabels: {
        enabled: false
      },
      series: [{
        data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380]
      }],
      xaxis: {
        categories: ['South Korea', 'Canada', 'United Kingdom', 'Netherlands', 'Italy', 'France', 'Japan', 'United States', 'China', 'Germany'],
      }
    }

    var chart = new ApexCharts(
      document.querySelector("#s-bar"),
      sBar
    );

    chart.render();
  }

  // Mixed Chart
  if (document.querySelector('#mixed-chart')) {
    var options = {
      chart: {
        height: 350,
        type: 'line',
        toolbar: {
          show: false,
        }
      },
      colors: ['#3550DC', '#888ea8'],
      series: [{
        name: 'Website Blog',
        type: 'column',
        data: [440, 505, 414, 671, 227, 413, 201, 352, 752, 320, 257, 160]
      }, {
        name: 'Social Media',
        type: 'line',
        data: [23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 16]
      }],
      stroke: {
        width: [0, 4]
      },
      title: {
        text: 'Traffic Sources'
      },
      labels: ['01 Jan 2001', '02 Jan 2001', '03 Jan 2001', '04 Jan 2001', '05 Jan 2001', '06 Jan 2001', '07 Jan 2001', '08 Jan 2001', '09 Jan 2001', '10 Jan 2001', '11 Jan 2001', '12 Jan 2001'],
      xaxis: {
        type: 'datetime'
      },
      yaxis: [{
        title: {
          text: 'Website Blog',
        },

      }, {
        opposite: true,
        title: {
          text: 'Social Media'
        }
      }]

    }

    var chart = new ApexCharts(
      document.querySelector("#mixed-chart"),
      options
    );

    chart.render();
  }

  // Donut Chart

  if (document.querySelector('#donut-chart')) {
    var donutChart = {
      chart: {
        height: 350,
        type: 'donut',
        toolbar: {
          show: false,
        }
      },
      // colors: ['#4361ee', '#888ea8', '#e3e4eb', '#d3d3d3'],
      series: [44, 55, 41, 17],
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    }

    var donut = new ApexCharts(
      document.querySelector("#donut-chart"),
      donutChart
    );

    donut.render();
  }

  // Radial Chart
  if (document.querySelector('#radial-chart')) {
    var radialChart = {
      chart: {
        height: 350,
        type: 'radialBar',
        toolbar: {
          show: false,
        }
      },
      // colors: ['#4361ee', '#888ea8', '#e3e4eb', '#d3d3d3'],
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: {
              fontSize: '22px',
            },
            value: {
              fontSize: '16px',
            },
            total: {
              show: true,
              label: 'Total',
              formatter: function (w) {
                return 249
              }
            }
          }
        }
      },
      series: [44, 55, 67, 83],
      labels: ['Apples', 'Oranges', 'Bananas', 'Berries'],
    }

    var chart = new ApexCharts(
      document.querySelector("#radial-chart"),
      radialChart
    );

    chart.render();
  }

  // Radial Chart2
  if (document.querySelector('#radial-chart2')) {
    var options = {
      chart: {
        type: 'donut',
        height: 164,
      },
      series: [30, 10, 30, 30],
      labels: ['Total', 'Total', 'Total', 'Total'],
      colors: ['#7539FF', '#E2B93B', '#27AE60', '#DD2590'],
      legend: {
        show: false
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: false, // No gap between segments
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '70%',
            labels: {
              show: true, // ✅ Ensure donut center is always visible
              name: {
                show: true,
                text: 'Total',
                fontSize: '13px',
                offsetY: -4,
                color: '#5D6772'
              },
              value: {
                show: true,
                fontSize: '18px',
                fontWeight: 700,
                offsetY: 10,
                color: '#051321',
                formatter: function () {
                  return "$3656"; // ✅ Always shows this value
                }
              }
            }
          }
        }
      },
      tooltip: {
        enabled: false
      }
    };

    var chart = new ApexCharts(
      document.querySelector("#radial-chart2"),
      options
    );

    chart.render();
  }

  // Radial Chart3
  if (document.querySelector('#radial-chart3')) {
    var options = {
      chart: {
        type: 'donut',
        height: 49,
        width: 49,
      },
      series: [75, 25], // Adjust this for progress percentage
      labels: ['Completed', 'Remaining'],
      colors: ['#7539FF', '#EFEEFF'],
      legend: {
        show: false
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: false
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '80%', // Adjust for better inner circle spacing
            labels: {
              show: true,
              name: {
                show: false
              },
              value: {
                show: true,
                fontSize: '10px', // Small font to fit the size
                fontWeight: 600,
                offsetY: 0,
                color: '#7539FF',
                formatter: function () {
                  return '75%'; // or any other center label
                }
              }
            }
          }
        }
      },
      tooltip: {
        enabled: false
      }
    };

    var chart = new ApexCharts(
      document.querySelector("#radial-chart3"),
      options
    );

    chart.render();
  }

  // Radial Chart4
  if (document.querySelector('#radial-chart4')) {
    var options = {
      chart: {
        type: 'donut',
        height: 49,
        width: 49,
      },
      series: [75, 25], // Adjust this for progress percentage
      labels: ['Completed', 'Remaining'],
      colors: ['#27AE60', '#E9F7EF'],
      legend: {
        show: false
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: false
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '80%', // Adjust for better inner circle spacing
            labels: {
              show: true,
              name: {
                show: false
              },
              value: {
                show: true,
                fontSize: '10px', // Small font to fit the size
                fontWeight: 600,
                offsetY: 0,
                color: '#7539FF',
                formatter: function () {
                  return '75%'; // or any other center label
                }
              }
            }
          }
        }
      },
      tooltip: {
        enabled: false
      }
    };

    var chart = new ApexCharts(
      document.querySelector("#radial-chart4"),
      options
    );

    chart.render();
  }


  // Radial Chart5
  if (document.querySelector('#radial-chart5')) {
    var options = {
      chart: {
        type: 'donut',
        height: 49,
        width: 49,
      },
      series: [75, 25], // Adjust this for progress percentage
      labels: ['Completed', 'Remaining'],
      colors: ['#E2B93B', '#FCF8EB'],
      legend: {
        show: false
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: false
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '80%', // Adjust for better inner circle spacing
            labels: {
              show: true,
              name: {
                show: false
              },
              value: {
                show: true,
                fontSize: '10px', // Small font to fit the size
                fontWeight: 600,
                offsetY: 0,
                color: '#7539FF',
                formatter: function () {
                  return '75%'; // or any other center label
                }
              }
            }
          }
        }
      },
      tooltip: {
        enabled: false
      }
    };

    var chart = new ApexCharts(
      document.querySelector("#radial-chart5"),
      options
    );

    chart.render();
  }

  // Radial Chart6
  if (document.querySelector('#radial-chart6')) {
    var options = {
      chart: {
        type: 'donut',
        height: 49,
        width: 49,
      },
      series: [75, 25], // Adjust this for progress percentage
      labels: ['Completed', 'Remaining'],
      colors: ['#EF1E1E', '#FDE9E9'],
      legend: {
        show: false
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: false
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '80%', // Adjust for better inner circle spacing
            labels: {
              show: true,
              name: {
                show: false
              },
              value: {
                show: true,
                fontSize: '10px', // Small font to fit the size
                fontWeight: 600,
                offsetY: 0,
                color: '#7539FF',
                formatter: function () {
                  return '75%'; // or any other center label
                }
              }
            }
          }
        }
      },
      tooltip: {
        enabled: false
      }
    };

    var chart = new ApexCharts(
      document.querySelector("#radial-chart6"),
      options
    );

    chart.render();
  }

  // Radial Chart7
  if (document.querySelector('#radial-chart7')) {
    var options = {
      chart: {
        type: 'donut',
        height: 49,
        width: 49,
      },
      series: [75, 25], // Adjust this for progress percentage
      labels: ['Completed', 'Remaining'],
      colors: ['#27AE60', '#EFEEFF'],
      legend: {
        show: false
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: false
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '60%', // Adjust for better inner circle spacing
            labels: {
              show: true,
              name: {
                show: false
              },
              value: {
                show: true,
                fontSize: '10px', // Small font to fit the size
                fontWeight: 600,
                offsetY: 0,
                color: '#7539FF',
                formatter: function () {
                  return '75%'; // or any other center label
                }
              }
            }
          }
        }
      },
      tooltip: {
        enabled: false
      }
    };

    var chart = new ApexCharts(
      document.querySelector("#radial-chart7"),
      options
    );

    chart.render();
  }

  // Radial Chart8
  if (document.querySelector('#radial-chart8')) {
    var options = {
      chart: {
        type: 'donut',
        height: 49,
        width: 49,
      },
      series: [75, 25], // Adjust this for progress percentage
      labels: ['Completed', 'Remaining'],
      colors: ['#E2B93B', '#EFEEFF'],
      legend: {
        show: false
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: false
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '60%', // Adjust for better inner circle spacing
            labels: {
              show: true,
              name: {
                show: false
              },
              value: {
                show: true,
                fontSize: '10px', // Small font to fit the size
                fontWeight: 600,
                offsetY: 0,
                color: '#7539FF',
                formatter: function () {
                  return '75%'; // or any other center label
                }
              }
            }
          }
        }
      },
      tooltip: {
        enabled: false
      }
    };

    var chart = new ApexCharts(
      document.querySelector("#radial-chart8"),
      options
    );

    chart.render();
  }

  // Radial Chart9
  if (document.querySelector('#radial-chart9')) {
    var options = {
      chart: {
        type: 'donut',
        height: 49,
        width: 49,
      },
      series: [75, 25], // Adjust this for progress percentage
      labels: ['Completed', 'Remaining'],
      colors: ['#EF1E1E', '#EFEEFF'],
      legend: {
        show: false
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: false
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '60%', // Adjust for better inner circle spacing
            labels: {
              show: true,
              name: {
                show: false
              },
              value: {
                show: true,
                fontSize: '10px', // Small font to fit the size
                fontWeight: 600,
                offsetY: 0,
                color: '#7539FF',
                formatter: function () {
                  return '75%'; // or any other center label
                }
              }
            }
          }
        }
      },
      tooltip: {
        enabled: false
      }
    };

    var chart = new ApexCharts(
      document.querySelector("#radial-chart9"),
      options
    );

    chart.render();
  }

  // Radial Chart10
  if (document.querySelector('#radial-chart10')) {
    var options = {
      chart: {
        type: 'donut',
        height: 49,
        width: 49,
      },
      series: [75, 25], // Adjust this for progress percentage
      labels: ['Completed', 'Remaining'],
      colors: ['#7539FF', '#EFEEFF'],
      legend: {
        show: false
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: false
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '60%', // Adjust for better inner circle spacing
            labels: {
              show: true,
              name: {
                show: false
              },
              value: {
                show: true,
                fontSize: '10px', // Small font to fit the size
                fontWeight: 600,
                offsetY: 0,
                color: '#7539FF',
                formatter: function () {
                  return '75%'; // or any other center label
                }
              }
            }
          }
        }
      },
      tooltip: {
        enabled: false
      }
    };

    var chart = new ApexCharts(
      document.querySelector("#radial-chart10"),
      options
    );

    chart.render();
  }

  // Radial Chart11
  if (document.querySelector('#radial-chart11')) {
    var options = {
      chart: {
        type: 'donut',
        height: 49,
        width: 49,
      },
      series: [75, 25], // Adjust this for progress percentage
      labels: ['Completed', 'Remaining'],
      colors: ['#7539FF', '#EFEEFF'],
      legend: {
        show: false
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: false
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '60%', // Adjust for better inner circle spacing
            labels: {
              show: true,
              name: {
                show: false
              },
              value: {
                show: true,
                fontSize: '10px', // Small font to fit the size
                fontWeight: 600,
                offsetY: 0,
                color: '#7539FF',
                formatter: function () {
                  return '75%'; // or any other center label
                }
              }
            }
          }
        }
      },
      tooltip: {
        enabled: false
      }
    };

    var chart = new ApexCharts(
      document.querySelector("#radial-chart11"),
      options
    );

    chart.render();
  }

  // Radial Chart12
  if (document.querySelector('#radial-chart12')) {
    var options = {
      chart: {
        type: 'donut',
        height: 49,
        width: 49,
      },
      series: [75, 25], // Adjust this for progress percentage
      labels: ['Completed', 'Remaining'],
      colors: ['#27AE60', '#EFEEFF'],
      legend: {
        show: false
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: false
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '60%', // Adjust for better inner circle spacing
            labels: {
              show: true,
              name: {
                show: false
              },
              value: {
                show: true,
                fontSize: '10px', // Small font to fit the size
                fontWeight: 600,
                offsetY: 0,
                color: '#7539FF',
                formatter: function () {
                  return '75%'; // or any other center label
                }
              }
            }
          }
        }
      },
      tooltip: {
        enabled: false
      }
    };

    var chart = new ApexCharts(
      document.querySelector("#radial-chart12"),
      options
    );

    chart.render();
  }

  // Radial Chart13
  if (document.querySelector('#radial-chart13')) {
    var options = {
      chart: {
        type: 'donut',
        height: 49,
        width: 49,
      },
      series: [75, 25], // Adjust this for progress percentage
      labels: ['Completed', 'Remaining'],
      colors: ['#E2B93B', '#EFEEFF'],
      legend: {
        show: false
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: false
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '60%', // Adjust for better inner circle spacing
            labels: {
              show: true,
              name: {
                show: false
              },
              value: {
                show: true,
                fontSize: '10px', // Small font to fit the size
                fontWeight: 600,
                offsetY: 0,
                color: '#7539FF',
                formatter: function () {
                  return '75%'; // or any other center label
                }
              }
            }
          }
        }
      },
      tooltip: {
        enabled: false
      }
    };

    var chart = new ApexCharts(
      document.querySelector("#radial-chart13"),
      options
    );

    chart.render();
  }

  // Radial Chart14
  if (document.querySelector('#radial-chart14')) {
    var options = {
      chart: {
        type: 'donut',
        height: 49,
        width: 49,
      },
      series: [75, 25], // Adjust this for progress percentage
      labels: ['Completed', 'Remaining'],
      colors: ['#EF1E1E', '#EFEEFF'],
      legend: {
        show: false
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: false
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '60%', // Adjust for better inner circle spacing
            labels: {
              show: true,
              name: {
                show: false
              },
              value: {
                show: true,
                fontSize: '10px', // Small font to fit the size
                fontWeight: 600,
                offsetY: 0,
                color: '#7539FF',
                formatter: function () {
                  return '75%'; // or any other center label
                }
              }
            }
          }
        }
      },
      tooltip: {
        enabled: false
      }
    };

    var chart = new ApexCharts(
      document.querySelector("#radial-chart14"),
      options
    );

    chart.render();
  }


  // end chart

  if (document.querySelector('#sales_charts')) {
    var options = {
      series: [{
        name: 'Sales',
        data: [130, 210, 300, 290, 150, 50, 210, 280, 105],
      }, {
        name: 'Purchase',
        data: [-150, -90, -50, -180, -50, -70, -100, -90, -105]
      }],
      colors: ['#28C76F', '#EA5455'],
      chart: {
        type: 'bar',
        height: 320,
        stacked: true,

        zoom: {
          enabled: true
        }
      },
      responsive: [{
        breakpoint: 280,
        options: {
          legend: {
            position: 'bottom',
            offsetY: 0
          }
        }
      }],
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 4,
          borderRadiusApplication: "end", // "around" / "end" 
          borderRadiusWhenStacked: "all", // "all"/"last"
          columnWidth: '20%',
        },
      },
      dataLabels: {
        enabled: false
      },
      yaxis: {
        min: -200,
        max: 300,
        tickAmount: 5,
      },
      xaxis: {
        categories: [' Jan ', 'Feb', 'Mar', 'Apr',
          'May', 'Jun', 'Jul', 'Aug', 'Sep'
        ],
      },
      legend: { show: false },
      fill: {
        opacity: 1
      }
    };

    var chart = new ApexCharts(document.querySelector("#sales_charts"), options);
    chart.render();
  }

  if (document.querySelector('#sales-analysis')) {
    var options = {
      series: [{
        name: "Sales Analysis",
        data: [25, 30, 18, 15, 22, 20, 30, 20, 22, 18, 15, 20]
      }],
      chart: {
        height: 273,
        type: 'area',
        zoom: {
          enabled: false
        }
      },
      colors: ['#FF9F43'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      title: {
        text: '',
        align: 'left'
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      },
      yaxis: {
        min: 10,
        max: 60,
        tickAmount: 5,
        labels: {
          formatter: (val) => {
            return val / 1 + 'K'
          }
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left'
      }
    };

    var chart = new ApexCharts(document.querySelector("#sales-analysis"), options);
    chart.render();
  }

  // Student Chart

  if (document.querySelector('#teacher-chart')) {
    var donutChart = {
      chart: {
        height: 260,
        type: 'donut',
        toolbar: {
          show: false,
        }
      },
      colors: ['#3D5EE1', '#6FCCD8'],
      series: [346, 54],
      labels: ['Present', 'Absent'],
      legend: { show: false },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            height: 180,
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    }

    var donut = new ApexCharts(
      document.querySelector("#teacher-chart"),
      donutChart
    );

    donut.render();
  }


  // Student Chart

  if (document.querySelector('#staff-chart')) {
    var donutChart = {
      chart: {
        height: 260,
        type: 'donut',
        toolbar: {
          show: false,
        }
      },
      colors: ['#3D5EE1', '#6FCCD8'],
      series: [620, 80],
      labels: ['Present', 'Absent'],
      legend: { show: false },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            height: 180,
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    }

    var donut = new ApexCharts(
      document.querySelector("#staff-chart"),
      donutChart
    );

    donut.render();
  }


  // Class Chart

  if (document.querySelector('#class-chart')) {
    var donutChart = {
      chart: {
        height: 130,
        type: 'donut',
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: true
        }
      },
      colors: ['#3D5EE1', '#EAB300', '#E82646'],
      series: [45, 11, 2],
      labels: ['Good', 'Average', 'Below Average'],
      legend: { show: false },
      dataLabels: {
        enabled: false
      },
      yaxis: {
        tickAmount: 3,
        labels: {
          offsetX: -15,
        },
      },
      grid: {
        padding: {
          left: -8,
        },
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    }

    var donut = new ApexCharts(
      document.querySelector("#class-chart"),
      donutChart
    );

    donut.render();
  }

  // Leaves Chart

  if (document.querySelector('#web_chart')) {
    var donutChart = {
      chart: {
        height: 205,
        type: 'donut',
        toolbar: {
          show: false,
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '30%',
        },
      },
      dataLabels: {
        enabled: false
      },
      series: [41, 11, 7, 18, 6, 12, 4, 16],
      colors: ['#FF7F00', '#FF0000', '#8000FF', '#27EAEA', '#01B664', '#F9B801', '#24CDBA', '#AB47BC'],
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 50,
          },
          legend: {
            show: false
          }
        }
      }],
      legend: {
        show: false
      }
    }

    var donut = new ApexCharts(
      document.querySelector("#web_chart"),
      donutChart
    );

    donut.render();
  }

  // Fees Chart

  if (document.querySelector('#fees-chart')) {
    var sCol = {
      chart: {
        height: 275,
        type: 'bar',
        stacked: true,
        toolbar: {
          show: false,
        }
      },
      legend: {
        show: true,
        horizontalAlign: 'left',
        position: 'top',
        fontSize: '14px',
        labels: {
          colors: '#5D6369',
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
          endingShape: 'rounded'
        },
      },
      colors: ['#3D5EE1', '#E9EDF4'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      grid: {
        padding: {
          left: -8,
        },
      },
      series: [{
        name: 'Collected Fee',
        data: [30, 40, 38, 40, 38, 30, 35, 38, 40]
      }, {
        name: 'Total Fee',
        data: [45, 50, 48, 50, 48, 40, 40, 50, 55]
      }],
      xaxis: {
        categories: ['Q1: 2023', 'Q1: 2023', 'Q1: 2023', 'Q1: 2023', 'Q1: 2023', 'uQ1: 2023l', 'Q1: 2023', 'Q1: 2023', 'Q1: 2023'],
      },
      yaxis: {
      },
      yaxis: {
        tickAmount: 3,
        labels: {
          offsetX: -15
        },
      },
      fill: {
        opacity: 1

      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "$ " + val + " thousands"
          }
        }
      }
    }

    var chart = new ApexCharts(
      document.querySelector("#fees-chart"),
      sCol
    );

    chart.render();
  }

  if (document.querySelector('#exam-result-chart')) {
    var options = {
      chart: {
        type: 'bar',
        height: 310
      },
      series: [{
        name: 'Marks',
        data: [100, 92, 90, 82, 90] // Corresponding scores for Maths, Physics, Chemistry, English, Spanish
      }],
      xaxis: {
        categories: ['Mat', 'Phy', 'Che', 'Eng', 'Sci']
      },
      plotOptions: {
        bar: {
          distributed: true,
          columnWidth: '50%',
          colors: {
            backgroundBarColors: ['#E9EDF4', '#fff'],
            backgroundBarOpacity: 1,
            backgroundBarRadius: 5,
          },
          dataLabels: {
            position: 'top'
          },
        }
      },
      colors: ['#E9EDF4', '#3D5EE1', '#E9EDF4', '#E9EDF4', '#E9EDF4'], // Set specific colors for each bar
      tooltip: {
        y: {
          formatter: function (val) {
            return val + "%"
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val + "%";
        },
        offsetY: -20,
        style: {
          fontSize: '14px',
          colors: ["#304758"]
        }
      },
      grid: {
        yaxis: {
          lines: {
            show: false
          }
        },
      },

      legend: {
        show: false
      }
    }

    var chart = new ApexCharts(document.querySelector("#exam-result-chart"), options);
    chart.render();
  }

  if (document.querySelector('#performance_chart')) {
    var options = {
      chart: {
        type: 'area',
        height: 355
      },
      series: [{
        name: 'Avg. Exam Score',
        data: [75, 68, 65, 68, 75] // Sample data
      }, {
        name: 'Avg. Attendance',
        data: [85, 78, 75, 78, 85] // Sample data
      }],
      xaxis: {
        categories: ['Quarter 1', 'Quarter 2', 'Half yearly', 'Model', 'Final']
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + "%";
          }
        },
        shared: true,
        intersect: false,
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          return `<div class="apexcharts-tooltip">${w.globals.labels[dataPointIndex]}<br>Exam Score: <span style="color: #1E90FF;">${series[0][dataPointIndex]}%</span><br>Attendance: <span style="color: #00BFFF;">${series[1][dataPointIndex]}%</span></div>`;
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth'
      },
      grid: {
        padding: {
          left: -15,
          right: 0,
        },
      },
      grid: {
        yaxis: {
          axisTicks: {
            show: true,
            borderType: 'solid',
            color: '#78909C',
            width: 6,
            offsetX: 0,
            offsetY: 0
          },

        },
      },
      yaxis: {
        labels: {
          offsetX: -15
        },
      },
      markers: {
        size: 5,
        colors: ['#1E90FF', '#00BFFF'],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: {
          size: 7
        }
      },
      colors: ['#3D5EE1', '#6FCCD8'], // Color for the lines
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 90, 100]
        }
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center'
      }
    }
    var chart = new ApexCharts(document.querySelector("#performance_chart"), options);
    chart.render();
  }

  // Plan Chart

  if (document.querySelector('#plan_chart')) {
    var donutChart = {
      chart: {
        height: 90,
        type: 'donut',
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: true
        }
      },
      grid: {
        show: false,
        padding: {
          left: 0,
          right: 0
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%'
        },
      },
      dataLabels: {
        enabled: false
      },

      series: [95, 5],
      labels: [
        'Completed',
        'Pending'

      ],
      legend: { show: false },
      colors: ['#3D5EE1', '#E82646'],
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 100
          },
          legend: {
            position: 'bottom'
          }
        }
      }],
      legend: {
        position: 'bottom'
      }
    }

    var donut = new ApexCharts(
      document.querySelector("#plan_chart"),
      donutChart
    );

    donut.render();
  }

  if (document.querySelector('#statistic_chart')) {
    var options = {
      chart: {
        type: 'line',
        height: 345,
      },
      series: [{
        name: 'Avg. Exam Score',
        data: [0, 32, 40, 50, 60, 52, 50, 44, 40, 60, 75, 70] // Sample data
      }, {
        name: 'Avg. Attendance',
        data: [0, 35, 43, 34, 30, 28, 25, 50, 60, 75, 77, 80] // Sample data
      }],
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + "%";
          }
        },
        shared: true,
        intersect: false,
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          return `<div class="apexcharts-tooltip">${w.globals.labels[dataPointIndex]}<br>Exam Score: <span style="color: #1E90FF;">${series[0][dataPointIndex]}%</span><br>Attendance: <span style="color: #00BFFF;">${series[1][dataPointIndex]}%</span></div>`;
        }
      },
      dataLabels: {
        enabled: false
      },
      grid: {
        yaxis: {
          lines: {
            show: true
          }
        },
      },
      yaxis: {
        labels: {
          offsetX: -15
        },
      },
      grid: {
        padding: {
          left: -8,
        },
      },
      markers: {
        size: 0,
        colors: ['#1E90FF', '#00BFFF'],
        strokeColors: '#fff',
        strokeWidth: 1,
        hover: {
          size: 7
        }
      },
      colors: ['#3D5EE1', '#6FCCD8'], // Color for the lines
      legend: {
        position: 'top',
        horizontalAlign: 'left'
      }
    }
    var chart = new ApexCharts(document.querySelector("#statistic_chart"), options);
    chart.render();
  }

  if (document.querySelector('#attendance_chart2')) {
    var donutChart = {
      chart: {
        height: 290,
        type: 'donut',
        toolbar: {
          show: false,
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%'
        },
      },
      dataLabels: {
        enabled: false
      },

      series: [60, 5, 15, 20],
      labels: [
        'Present',
        'Late',
        'Half Day',
        'Absent'
      ],
      colors: ['#1ABE17', '#1170E4', '#E9EDF4', '#E82646'],
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'left'
          }
        }
      }],
      legend: {
        position: 'left',
      }
    }

    var donut = new ApexCharts(
      document.querySelector("#attendance_chart2"),
      donutChart
    );

    donut.render();
  }

  // Total Earning
  if (document.querySelector('#total-earning')) {
    var sLineArea = {
      chart: {
        height: 90,
        type: 'area',
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: true
        }
      },
      colors: ['#3D5EE1'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      series: [{
        name: 'Earnings',
        data: [50, 60, 40, 50, 45, 55, 50]
      }]
    }

    var chart = new ApexCharts(
      document.querySelector("#total-earning"),
      sLineArea
    );

    chart.render();
  }

  // Total Expenses
  if (document.querySelector('#total-expenses')) {
    var sLineArea = {
      chart: {
        height: 90,
        type: 'area',
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: true
        }
      },
      colors: ['#E82646'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      series: [{
        name: 'Earnings',
        data: [40, 20, 60, 55, 50, 55, 40]
      }]
    }

    var chart = new ApexCharts(
      document.querySelector("#total-expenses"),
      sLineArea
    );

    chart.render();
  }

  if (document.querySelector('#leads-report')) {
    var options = {
      series: [{
        name: "Reports",
        colors: ['#FFC38F'],
        data: [{
          x: 'Jan',
          y: 400,
        }, {
          x: 'Feb',
          y: 130
        }, {
          x: 'Mar',
          y: 240
        }, {
          x: 'Apr',
          y: 450
        }, {
          x: 'May',
          y: 250
        }, {
          x: 'Jun',
          y: 180
        }, {
          x: 'Jul',
          y: 300
        }, {
          x: 'Aug',
          y: 240
        }, {
          x: 'Sep',
          y: 300
        }, {
          x: 'Oct',
          y: 150
        }, {
          x: 'Nov',
          y: 250
        },
        {
          x: 'Dec',
          y: 500
        }]
      }],
      chart: {
        type: 'bar',
        height: 275,
      },
      plotOptions: {
        bar: {
          borderRadiusApplication: 'around',
          columnWidth: '50%',
        }
      },
	  tooltip: {
			marker: false,
		},
      colors: ['#00918E'],
      xaxis: {
        type: 'category',
        group: {
          style: {
            fontSize: '0px',
            fontWeight: 700,
          },
        }
      },

    };

    var chart = new ApexCharts(document.querySelector("#leads-report"), options);
    chart.render();
  }

  if (document.querySelector('#leads-analysis')) {
    var options = {
      series: [44, 55, 41, 17],
      chart: {
        type: 'donut',
      },
      colors: ['#0092E4', '#4A00E5', '#E41F07', '#FFA201'],
      labels: ['Campaigns', 'Google', 'Referrals', 'Paid Social'],
      plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 270,
          size: '10',
        }
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        position: 'bottom',
        formatter: function (val, opts) {
          return val + " - " + opts.w.globals.series[opts.seriesIndex]
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    };

    var chart = new ApexCharts(document.querySelector("#leads-analysis"), options);
    chart.render();
  }
});

if (document.querySelector('#deals-report')) {
	var sCol = {
		chart: {
			height: 270,
			type: 'bar',
			toolbar: {
				show: false,
			}
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '55%',
				endingShape: 'rounded'
			},
		},
		colors: ['#5CB85C', '#FC0027'],
		dataLabels: {
			enabled: false
		},
		stroke: {
			show: true,
			width: 2,
			colors: ['transparent']
		},
		series: [{
			name: 'Won Deals',
			data: [110, 85, 100, 90, 85, 105, 90, 115, 95]
		}, {
			name: 'Lost Deals',
			data: [45, 55, 50, 55, 40, 60, 55, 60, 66]
		}],
		xaxis: {
			categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
		},
		fill: {
			opacity: 1

		},
		tooltip: {
			marker: false,
			y: {
				formatter: function (val) {
					return val + " Deals"
				}
			}
		}
	};

	var chart = new ApexCharts(document.querySelector("#deals-report"), sCol);
	chart.render();
}

// Donut Chart

if (document.querySelector('#storage-chart')) {
	var donutChart = {
		chart: {
			height: 200,
			type: 'donut',
			toolbar: {
				show: false,
			},
			offsetY: -10,
			events: {
				rendered: function () {
					// Adding the center text
					var chartElement = document.querySelector("#donutChart");
					var innerText = '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">' +
						'<span style="font-size: 24px; font-weight: bold;">Total</span><br>' +
						'<span style="font-size: 16px;">abb</span>' +
						'</div>';
					chartElement.innerHTML += innerText;
				}
			},
		},
		plotOptions: {
			pie: {
				startAngle: -100,
				endAngle: 100,
				donut: {
					size: '80%',
					labels: {
						show: true,
						name: {
							show: true,
						}
					}
				}
			}
		},
		dataLabels: {
			enabled: false
		},
		legend: {
			show: false
		},
		stroke: {
			show: false
		},
		colors: ['#0C4B5E', '#FFC107', '#1B84FF', '#AB47BC', '#FD3995'],
		series: [20, 20, 20, 20, 20],
		labels: ['Documents', 'Video', 'Music', 'Photos', 'Other'],
		responsive: [{
			breakpoint: 480,
			options: {
				chart: {
					width: 200
				},
				legend: {
					position: 'bottom'
				}
			}
		}],
		grid: {
			padding: {
				bottom: -60  // Reduce padding from the bottom
			}
		}
	}

	var donut = new ApexCharts(
		document.querySelector("#storage-chart"),
		donutChart
	);

	donut.render();
}

// Total Company

if (document.querySelector('#work-chart')) {

	var options = {
		series: [{
			name: "Messages",
			data: [25, 66, 41, 12, 36, 9, 21]
		}],
		fill: {
			type: 'gradient',
			gradient: {
				opacityFrom: 0, // Start with 0 opacity (transparent)
				opacityTo: 0    // End with 0 opacity (transparent)
			}
		},
		chart: {
			foreColor: '#fff',
			type: "area",
			width: 50,
			toolbar: {
				show: !1
			},
			zoom: {
				enabled: !1
			},
			dropShadow: {
				enabled: 0,
				top: 3,
				left: 14,
				blur: 4,
				opacity: .12,
				color: "#fff"
			},
			sparkline: {
				enabled: !0
			}
		},
		markers: {
			size: 0,
			colors: ["#F26522"],
			strokeColors: "#fff",
			strokeWidth: 2,
			hover: {
				size: 7
			}
		},
		plotOptions: {
			bar: {
				horizontal: !1,
				columnWidth: "35%",
				endingShape: "rounded"
			}
		},
		dataLabels: {
			enabled: !1
		},
		stroke: {
			show: !0,
			width: 2.5,
			curve: "smooth"
		},
		colors: ["#F26522"],
		xaxis: {
			categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"]
		},
		tooltip: {
			theme: "dark",
			fixed: {
				enabled: !1
			},
			x: {
				show: !1
			},
			y: {
				title: {
					formatter: function (e) {
						return ""
					}
				}
			},
			marker: {
				show: !1
			}
		}
	};

	var chart = new ApexCharts(document.querySelector("#work-chart"), options);
	chart.render();
}

// Active Company

if (document.querySelector('#productive-chart')) {

	var options = {
		series: [{
			name: "Active Company",
			data: [25, 40, 35, 20, 36, 9, 21]
		}],
		fill: {
			type: 'gradient',
			gradient: {
				opacityFrom: 0, // Start with 0 opacity (transparent)
				opacityTo: 0    // End with 0 opacity (transparent)
			}
		},
		chart: {
			foreColor: '#fff',
			type: "area",
			width: 50,
			toolbar: {
				show: !1
			},
			zoom: {
				enabled: !1
			},
			dropShadow: {
				enabled: 0,
				top: 3,
				left: 14,
				blur: 4,
				opacity: .12,
				color: "#fff"
			},
			sparkline: {
				enabled: !0
			}
		},
		markers: {
			size: 0,
			colors: ["#F26522"],
			strokeColors: "#fff",
			strokeWidth: 2,
			hover: {
				size: 7
			}
		},
		plotOptions: {
			bar: {
				horizontal: !1,
				columnWidth: "35%",
				endingShape: "rounded"
			}
		},
		dataLabels: {
			enabled: !1
		},
		stroke: {
			show: !0,
			width: 2.5,
			curve: "smooth"
		},
		colors: ["#F26522"],
		xaxis: {
			categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"]
		},
		tooltip: {
			theme: "dark",
			fixed: {
				enabled: !1
			},
			x: {
				show: !1
			},
			y: {
				title: {
					formatter: function (e) {
						return ""
					}
				}
			},
			marker: {
				show: !1
			}
		}
	};

	var chart = new ApexCharts(document.querySelector("#productive-chart"), options);
	chart.render();
}

// Inactive Company

if (document.querySelector('#unproductive-chart')) {

	var options = {
		series: [{
			name: "Inactive Company",
			data: [25, 10, 35, 5, 25, 28, 21]
		}],
		fill: {
			type: 'gradient',
			gradient: {
				opacityFrom: 0, // Start with 0 opacity (transparent)
				opacityTo: 0    // End with 0 opacity (transparent)
			}
		},
		chart: {
			foreColor: '#fff',
			type: "area",
			width: 50,
			toolbar: {
				show: !1
			},
			zoom: {
				enabled: !1
			},
			dropShadow: {
				enabled: 0,
				top: 3,
				left: 14,
				blur: 4,
				opacity: .12,
				color: "#fff"
			},
			sparkline: {
				enabled: !0
			}
		},
		markers: {
			size: 0,
			colors: ["#F26522"],
			strokeColors: "#fff",
			strokeWidth: 2,
			hover: {
				size: 7
			}
		},
		plotOptions: {
			bar: {
				horizontal: !1,
				columnWidth: "35%",
				endingShape: "rounded"
			}
		},
		dataLabels: {
			enabled: !1
		},
		stroke: {
			show: !0,
			width: 2.5,
			curve: "smooth"
		},
		colors: ["#F26522"],
		xaxis: {
			categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"]
		},
		tooltip: {
			theme: "dark",
			fixed: {
				enabled: !1
			},
			x: {
				show: !1
			},
			y: {
				title: {
					formatter: function (e) {
						return ""
					}
				}
			},
			marker: {
				show: !1
			}
		}
	};

	var chart = new ApexCharts(document.querySelector("#unproductive-chart"), options);
	chart.render();
}

if (document.querySelector('#forecasted-revenue')) {

  var options = {
    series: [{
      name: "Revenue",
      data: [25, 35, 45, 30, 22, 40, 38, 28, 48, 26, 33]
    }],
    chart: {
      type: "bar",
      height: 70,
      width: '100%',
      sparkline: {
        enabled: true
      },
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        columnWidth: "40%",
        borderRadius: 6,     // rounded bars
        distributed: false
      }
    },
      fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0,
        gradientToColors: ["#27AE60"],  // light green top
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    },
    colors: ["#0E9384"],   // dark green bottom   // green color like image
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: false
    },
    tooltip: {
      enabled: true,
	  marker: false
    },
    xaxis: {
      crosshairs: {
        show: false
      }
    },
    yaxis: {
      show: false
    },
    grid: {
      show: false
    }
  };

  var chart = new ApexCharts(
    document.querySelector("#forecasted-revenue"),
    options
  );
  chart.render();
}

if (document.querySelector('#deal-value-chart')) {

  var options = {
    series: [{
      data: [90, 55]   // 2 bars (tall + short)
    }],
    chart: {
      type: "bar",
      height: 97,
      width: 75,
      sparkline: {
        enabled: true
      },
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        columnWidth: "55%",
        borderRadius: 4,
        distributed: true   // allows different colors per bar
      }
    },
    colors: ["#8446FF", "#F6495C"],  // purple & red base colors
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: false
    },
    tooltip: {
      enabled: false
    },
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      show: false
    },
    grid: {
      show: false
    }
  };

  var chart = new ApexCharts(
    document.querySelector("#deal-value-chart"),
    options
  );

  chart.render();
}
// Location Company

if (document.querySelector('#utilization-chart')) {

	var options = {
		series: [{
			name: "Inactive Company",
			data: [30, 40, 15, 23, 20, 23, 25]
		}],
		fill: {
			type: 'gradient',
			gradient: {
				opacityFrom: 0, // Start with 0 opacity (transparent)
				opacityTo: 0    // End with 0 opacity (transparent)
			}
		},
		chart: {
			foreColor: '#fff',
			type: "area",
			width: 50,
			toolbar: {
				show: !1
			},
			zoom: {
				enabled: !1
			},
			dropShadow: {
				enabled: 0,
				top: 3,
				left: 14,
				blur: 4,
				opacity: .12,
				color: "#fff"
			},
			sparkline: {
				enabled: !0
			}
		},
		markers: {
			size: 0,
			colors: ["#F26522"],
			strokeColors: "#fff",
			strokeWidth: 2,
			hover: {
				size: 7
			}
		},
		plotOptions: {
			bar: {
				horizontal: !1,
				columnWidth: "35%",
				endingShape: "rounded"
			}
		},
		dataLabels: {
			enabled: !1
		},
		stroke: {
			show: !0,
			width: 2.5,
			curve: "smooth"
		},
		colors: ["#F26522"],
		xaxis: {
			categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"]
		},
		tooltip: {
			theme: "dark",
			fixed: {
				enabled: !1
			},
			x: {
				show: !1
			},
			y: {
				title: {
					formatter: function (e) {
						return ""
					}
				}
			},
			marker: {
				show: !1
			}
		}
	};

	var chart = new ApexCharts(document.querySelector("#utilization-chart"), options);
	chart.render();
}

if (document.querySelector('#expense-analysis')) {
	var options = {
		series: [{
			name: "Sales Analysis",
			data: [10, 30, 18, 15, 22, 30, 40, 50, 40, 40, 60, 70]
		}],
		chart: {
			height: 190,
			type: 'area',
			zoom: {
				enabled: false
			}
		},
		colors: ['#FF9F43'],
		dataLabels: {
			enabled: false
		},
		stroke: {
			curve: 'smooth'
		},
		title: {
			text: '',
			align: 'left'
		},
		// grid: {
		//   row: {
		//     colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
		//     opacity: 0.5
		//   },
		// },
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
		},
		yaxis: {
			min: 10,
			max: 60,
			tickAmount: 5,
			labels: {
				offsetX: -15,
				formatter: (val) => {
					return val / 1 + 'K'
				}
			}
		},
		legend: {
			position: 'top',
			horizontalAlign: 'left'
		}
	};

	var chart = new ApexCharts(document.querySelector("#expense-analysis"), options);
	chart.render();
}

if (document.querySelector('#invoice-report')) {
	var options = {
		series: [{
			name: 'Total Invoices',
			data: [40, 30, 40, 30, 40, 30]
		}, {
			name: 'Paid Invoices',
			data: [20, 10, 20, 10, 20, 10]
		}],
		chart: {
			height: 250,
			type: 'area'
		},
		dataLabels: {
			enabled: false
		},
		stroke: {
			curve: 'straight'
		},
		xaxis: {
			type: 'category',
			categories: ["January", "February", "March", "April", "May", "June", "July"]
		},
		yaxis: {
			labels: {
				offsetX: -15,
				formatter: function (value) {
					return value + "k"; // Display values with 'k' suffix
				}
			},
		},
		tooltip: {
			x: {
				formatter: function (value) {
					return value; // Tooltip shows month labels
				}
			},
			y: {
				formatter: function (value) {
					return value + "k"; // Tooltip shows amounts with 'k' suffix
				}
			}
		},
		colors: ['#FD3995', '#FF9F43'],
		dataLabels: {
			enabled: false
		},
	};

	// Create the chart instance
	var chart = new ApexCharts(document.querySelector("#invoice-report"), options);
	chart.render();
}

if (document.querySelector('#payment-report')) {
	var options = {
		series: [44, 55, 41, 17],
		chart: {
			type: 'donut',
		},
		colors: ['#0DCAF0', '#FD3995', '#AB47BC', '#FFC107'],
		labels: ['Paypal', 'Debit Card', 'Bank Transfer', 'Credit Card'],
		plotOptions: {
			pie: {
				startAngle: -90,
				endAngle: 270,
				stroke: {
					show: true,
					width: 10, // Width of the gap
					colors: ['#FFFFFF'] // Color of the gap
				},
				donut: {
					size: '80%' // Adjusts the size of the donut hole
				}
			}
		},
		dataLabels: {
			enabled: false
		},
		legend: {
			show: false // Set this to false to hide the legend
		},
		annotations: {
			position: 'front', // Ensure it appears above other elements
			style: {
				fontSize: '24px', // Adjust font size
				fontWeight: 'bold',
				color: '#000000' // Change color if needed
			},
			text: {
				// Set the annotation text
				text: '+14%',
				// Optional styling for the text box
				background: {
					enabled: true,
					foreColor: '#FFFFFF', // Text color
					border: '#000000', // Border color
					borderWidth: 1,
					borderRadius: 2,
					opacity: 0.7
				}
			},
			x: '50%', // Center horizontally
			y: '50%', // Center vertically
		},
		responsive: [{
			breakpoint: 480,
			options: {
				chart: {
					width: 200
				},
				legend: {
					show: false // Also hide legend on smaller screens
				}
			}
		}]
	};

	var chart = new ApexCharts(document.querySelector("#payment-report"), options);
	chart.render();
}

if (document.querySelector('#task-reports')) {
	var options = {
		series: [40, 30, 20, 10],
		chart: {
			type: 'donut',
			width: 220,
		},
		colors: ['#03C95A', '#0DCAF0', '#FFC107', '#AB47BC'],
		labels: ['Completed ', 'Pending', 'Inprogress ', 'On Hold '],
		plotOptions: {
			pie: {
				startAngle: -90,
				endAngle: 270,
				stroke: {
					show: true,
					width: 10, // Width of the gap
					colors: ['#FFFFFF'] // Color of the gap
				},
				donut: {
					size: '80%' // Adjusts the size of the donut hole
				}
			}
		},
		dataLabels: {
			enabled: false
		},
		legend: {
			show: false // Set this to false to hide the legend
		},
		annotations: {
			position: 'front', // Ensure it appears above other elements
			style: {
				fontSize: '24px', // Adjust font size
				fontWeight: 'bold',
				color: '#000000' // Change color if needed
			},
			text: {
				// Set the annotation text
				text: '+14%',
				// Optional styling for the text box
				background: {
					enabled: true,
					foreColor: '#FFFFFF', // Text color
					border: '#000000', // Border color
					borderWidth: 1,
					borderRadius: 2,
					opacity: 0.7
				}
			},
			x: '50%', // Center horizontally
			y: '50%', // Center vertically
		},
		responsive: [{
			breakpoint: 480,
			options: {
				chart: {
					width: 200
				},
				legend: {
					show: false // Also hide legend on smaller screens
				}
			}
		}]
	};

	var chart = new ApexCharts(document.querySelector("#task-reports"), options);
	chart.render();
}


if (document.querySelector('#project-report')) {
	var options = {
		series: [30, 10, 20, 40],
		chart: {
			width: 280,
			type: 'pie',
		},
		labels: ['Pending', 'On Hold', 'In Progress', 'Completed'], // Set your labels here
		colors: ['#0DCAF0', '#AB47BC', '#FFC107', '#03C95A'], // Custom colors for each segment
		dataLabels: {
			enabled: false // Disable data labels to remove numbers
		},
		legend: {
			show: false // Hide the legend
		},
		tooltip: {
			y: {
				formatter: function (value, { seriesIndex }) {
					return 'Value: ' + value; // Customize the tooltip text
				}
			}
		},
		responsive: [{
			breakpoint: 480,
			options: {
				chart: {
					width: 200
				},
				legend: {
					position: 'bottom'
				}
			}
		}]
	};

	var chart = new ApexCharts(document.querySelector("#project-report"), options);
	chart.render();
}

if (document.querySelector('#employee-reports')) {
	var options = {
		series: [{
			name: 'Active Employees',
			data: [50, 55, 57, 56, 61, 58, 63, 60, 66]
		}, {
			name: 'Inactive Employees',
			data: [76, 85, 101, 98, 87, 105, 91, 114, 94]
		}],
		chart: {
			type: 'bar',
			height: 180
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '55%',
				endingShape: 'rounded'
			}
		},
		colors: ['#03C95A', '#E8E9EA'], // Active Employees - Green, Inactive Employees - Gray
		dataLabels: {
			enabled: false, // Disable data labels
		},
		stroke: {
			show: true,
			width: 2,
			colors: ['transparent']
		},
		xaxis: {
			categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
		}, yaxis: {
			labels: {
				offsetX: -15,
			}
		},
		fill: {
			opacity: 1
		},
		legend: {
			show: false
		},
		tooltip: {
			y: {
				formatter: function (val) {
					return "$ " + val + " thousands";
				}
			}
		}
	};

	var chart = new ApexCharts(document.querySelector("#employee-reports"), options);
	chart.render();
}

if (document.querySelector('#attendance-report')) {
	var options = {
		series: [{
			name: "Present",
			data: [30, 65, 70, 75, 80, 95, 100, 70, 65] // Example data for Present
		}, {
			name: "Absent",
			data: [30, 55, 60, 65, 50, 70, 80, 60, 70] // Example data for Absent
		}],
		chart: {
			height: 200, // Change height here
			type: 'line',
			zoom: {
				enabled: false
			}
		},
		dataLabels: {
			enabled: false
		},
		stroke: {
			curve: 'smooth' // Change to 'smooth' for a nicer appearance
		},
		grid: {
			row: {
				colors: ['#f3f3f3', 'transparent'], // alternating row colors
				opacity: 0.5
			},
		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
		}, yaxis: {
			labels: {
				offsetX: -15,
			}
		},
		colors: ['#28a745', '#ff69b4'] // Green for Present, Pink for Absent
	};

	var chart = new ApexCharts(document.querySelector("#attendance-report"), options);
	chart.render();
}

if (document.querySelector('#leave-report')) {
	var options = {
		series: [{
			name: 'Annual Leave',
			data: [30, 40, 35, 50, 50, 60, 30, 40, 35, 50, 50, 60] // Replace with your data
		}, {
			name: 'Casual Leave',
			data: [20, 30, 25, 40, 50, 60, 20, 30, 25, 40, 50, 60] // Replace with your data
		}, {
			name: 'Medical Leave',
			data: [15, 10, 20, 15, 50, 60, 15, 10, 20, 15, 50, 60] // Replace with your data
		}, {
			name: 'Others',
			data: [25, 20, 30, 35, 50, 60, 25, 20, 30, 35, 50, 60] // Replace with your data
		},
		],
		chart: {
			type: 'bar',
			height: 210, // Change this value to your desired height
			stacked: true,
			stackType: '100%'
		},
		responsive: [{
			breakpoint: 480,
			options: {
				legend: {
					position: 'bottom',
					offsetX: -10,
					offsetY: 0
				}
			}
		}],
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',] // Update to match your time frame
		},
		yaxis: {
			labels: {
				offsetX: -15,
			}
		},
		fill: {
			opacity: 1
		},
		legend: {
			show: false
		},
		colors: ['#03C95A', '#FFC107', '#0C4B5E', '#F26522'], // Set your colors here
		dataLabels: {
			enabled: false // Disable data labels
		}
	};

	var chart = new ApexCharts(document.querySelector("#leave-report"), options);
	chart.render();
}

if (document.querySelector('#daily-report')) {
	var options = {
		series: [{
			name: "Present",
			data: [60, 40, 30, 20, 70,] // Sample data for Present
		}, {
			name: "Absent",
			data: [20, 60, 45, 60, 80,] // Sample data for Absent
		}],
		chart: {
			height: 130, // Changed height
			type: 'line',
			zoom: {
				enabled: false
			}
		},
		dataLabels: {
			enabled: false
		},
		legend: {
			show: false
		},
		stroke: {
			curve: 'smooth' // You can change this to 'straight' if preferred
		},
		grid: {
			row: {
				colors: ['#f3f3f3', 'transparent'],
				opacity: 0.5
			}
		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
		},
		yaxis: {
			labels: {
				offsetX: -15,
			}
		},
		colors: ['#4CAF50', '#F44336'] // Green for Present, Red for Absent
	};

	var chart = new ApexCharts(document.querySelector("#daily-report"), options);
	chart.render();
}

if (document.querySelector('#revenue-chart')) {
	var sCol = {
		chart: {
			height: 200,
			type: 'bar',
			stacked: true,
			toolbar: {
				show: false,
			}
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '50%',
				endingShape: 'rounded'
			},
		},
		dataLabels: {
			enabled: false
		},
		stroke: {
			show: true,
			width: 1,
		},
		series: [{
			name: 'High',
			color: '#0E9384',
			data: [50, 40, 15, 45, 35, 48, 65]
		}],
		xaxis: {
			categories: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
		},
		tooltip: {
			y: {
				formatter: function (val) {
					return "$ " + val + "k"
				}
			}
		}
	}

	var chart = new ApexCharts(
		document.querySelector("#revenue-chart"),
		sCol
	);

	chart.render();
}

if (document.querySelector('#revenue-chart2')) {

	// 🔴 Actual revenue values (0–100 scale)
	var revenueData = [50, 30, 75, 60, 40, 55, 42];

	// ⚪ Auto-calc remaining (100 - revenue)
	var remainingData = revenueData.map(function (val) {
		return 100 - val;
	});

	var options = {
		chart: {
			type: 'bar',
			height: 292,
			width: '100%',
			stacked: true,
			toolbar: { show: false }
		},

		series: [
			{
				name: 'Revenue',
				data: revenueData
			},
			{
				name: 'Remaining',
				data: remainingData
			}
		],

		plotOptions: {
			bar: {
				columnWidth: '70%',
				borderRadius: 5,
				borderRadiusWhenStacked: 'all'
			}
		},

		dataLabels: { enabled: false },
		stroke: { show: false },

		colors: [
			'#E11D48',  // red bottom
			'#E5E7EB'   // grey top
		],

		fill: {
			type: ['gradient', 'solid'],
			gradient: {
				type: "vertical",
				shadeIntensity: 0,
				gradientToColors: ['#FB7185'],
				opacityFrom: 1,
				opacityTo: 1,
				stops: [0, 100]
			}
		},

		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July'],
			axisBorder: { show: false },
			axisTicks: { show: false },
			labels: {
				style: {
					fontSize: '14px',
					colors: '#6B7280'
				}
			}
		},

		yaxis: {
			show: false,
			max: 100
		},

		grid: { show: false },
		legend: { show: false },

		tooltip: {
			custom: function ({ series, seriesIndex, dataPointIndex, w }) {

				var month = w.globals.labels[dataPointIndex];
				var value = series[seriesIndex][dataPointIndex];

				return `
				<div style="
					background:#ffffff;
					padding:20px 24px;
					border-radius:20px;
					box-shadow:0 25px 50px rgba(0,0,0,0.08);
					min-width:160px;
				">
					<div style="
						font-size:18px;
						font-weight:600;
						color:#111827;
						margin-bottom:12px;
					">
						${month}
					</div>

					<div style="
						display:flex;
						align-items:center;
						font-size:15px;
						color:#6B7280;
						margin-bottom:6px;
					">
						<span style="
							width:8px;
							height:8px;
							background:#EF4444;
							border-radius:50%;
							display:inline-block;
							margin-right:8px;
						"></span>
						Revenue
					</div>

					<div style="
						font-size:22px;
						font-weight:700;
						color:#111827;
					">
						$${value}k
					</div>
				</div>
				`;
			}
		},

		responsive: [{
			breakpoint: 768,
			options: {
				plotOptions: {
					bar: { columnWidth: '60%' }
				}
			}
		}]
	};

	var chart = new ApexCharts(
		document.querySelector("#revenue-chart2"),
		options
	);

	chart.render();
}

if (document.querySelector('#renewal_expiry')) {

	var options = {
		chart: {
			type: 'bar',
			height: 292,
			toolbar: { show: false }
		},

		series: [
			{
				name: 'Renewed Contracts',
				data: [40, 35, 50, 45, 55, 60]
			},
			{
				name: 'Expired Contracts',
				data: [12, 15, 8, 10, 7, 14]
			}
		],

		plotOptions: {
			bar: {
				columnWidth: '45%',
				borderRadius: 6,
				borderRadiusApplication: 'end'
			}
		},

		dataLabels: { enabled: false },
		stroke: { show: false },

		colors: [
			'#7C3AED',  // Purple (Renewed)
			'#EF4444'   // Red (Expired)
		],

		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
			axisBorder: { show: false },
			axisTicks: { show: false },
			labels: {
				style: {
					fontSize: '10px',
					colors: '#94A3B8'
				}
			}
		},

		yaxis: {
			show: true,
			labels: {
				style: {
					fontSize: '10px',
					colors: '#94A3B8'
				}
			}
		},

		grid: {
			borderColor: '#E5E7EB',
			strokeDashArray: 4
		},

		legend: {
			show: false   // 🔴 Legend hidden as per image
		},

		tooltip: {
			marker: false,
			y: {
				formatter: function (val) {
					return val;
				}
			}
		},

		responsive: [{
			breakpoint: 768,
			options: {
				plotOptions: {
					bar: { columnWidth: '55%' }
				}
			}
		}]
	};

	var chart = new ApexCharts(
		document.querySelector("#renewal_expiry"),
		options
	);

	chart.render();
}

if (document.querySelector('#growth-trend')) {

	var revenueData = [700, 180, 320, 210, 410, 120, 580, 160, 590, 540, 920, 430];

	var options = {
		chart: {
			type: 'area',
			height: 350,
			toolbar: { show: false }
		},

		series: [{
			name: 'Revenue',
			data: revenueData
		}],

		stroke: {
			curve: 'smooth',
			width: 2,
			colors: ['#EF4444']
		},

		markers: {
			size: 4,
			colors: ['#fff'],
			strokeColors: '#EF4444',
			strokeWidth: 2,
			hover: {
				size: 6
			}
		},

		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.45,
				opacityTo: 0.05,
				stops: [0, 100],
				colorStops: [
					{
						offset: 0,
						color: '#EF4444',
						opacity: 0.4
					},
					{
						offset: 100,
						color: '#EF4444',
						opacity: 0.05
					}
				]
			}
		},

		colors: ['#EF4444'],

		xaxis: {
			categories: ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			axisBorder: { show: false },
			axisTicks: { show: false },
			labels: {
				style: {
					colors: '#707070',
					fontSize: '12px'
				}
			}
		},

		yaxis: {
			min: 0,
			max: 1000,
			tickAmount: 5,
			labels: {
				formatter: function (val) {
					return val + "k";
				},
				style: {
					colors: '#707070',
					fontSize: '12px',
				}
			},
		},

		grid: {
			borderColor: '#E5E7EB',
			strokeDashArray: 4,
			xaxis: { lines: { show: true } },
			yaxis: { lines: { show: true } },
		},

		dataLabels: { enabled: false },

		tooltip: {
			 marker: {
				show: false   // 🔥 This removes the circle in tooltip
			},
			x: {
				show: true // Shows the month in tooltip
			},
			y: {
				padding: 0,
				formatter: function (value) {
					return value + "k"; // Shows '1k' in tooltip
				},
				title: {
					formatter: function () {
						return ''; // Keeps the series name hidden as per your request
					}
				}
			},
		},

		legend: { show: false }
	};

	var chart = new ApexCharts(
		document.querySelector("#growth-trend"),
		options
	);

	chart.render();
}

if (document.querySelector('#traffic-sources-chart')) {

    var options = {
        chart: {
            type: 'donut',
            height: 250,
        },

        series: [6598, 2458, 1456, 845],

        labels: ['Organic Search', 'Direct Traffic', 'Referral Traffic', 'Social Media'],

        colors: ['#2EAD5F', '#3B82F6', '#F59E0B', '#8B0A8B'],

        plotOptions: {
            pie: {
                expandOnClick: false,
                donut: {
                    size: '60%',
                    labels: {
                        show: true,
                        total: {
                            show: false
                        }
                    }
                }
            }
        },

        stroke: {
            width: 6,
            colors: ['#fff'] // white spacing between segments
        },

        dataLabels: {
            enabled: true,
            formatter: function (val) {
                return Math.round(val) + "%";
            },
            style: {
                fontSize: '12px',
                fontWeight: 600
            },
            dropShadow: {
                enabled: false
            }
        },

        legend: {
            show: false   // ✅ No legend
        },

        tooltip: {
            y: {
                formatter: function (val) {
                    return val.toLocaleString();
                }
            }
        }
    };

    var chart = new ApexCharts(
        document.querySelector("#traffic-sources-chart"),
        options
    );

    chart.render();
}

if (document.querySelector('#region-wise-growth')) {

	var options = {
		chart: {
			type: 'donut',
			height: 292,
			width: '100%',
			toolbar: { show: false }
		},

		series: [30, 20, 20, 15, 10],

		labels: [
			'North America',
			'Europe',
			'Asia Pacific',
			'Latin America',
			'Middle East'
		],

		colors: [
			'#5B6EF5',
			'#60C28E',
			'#F5A544',
			'#1FBAD6',
			'#8C7AE6'
		],

		stroke: {
			width: 0
		},

		plotOptions: {
			pie: {
				expandOnClick: false,
				customScale: 1,
				offsetY: 0,
				dataLabels: {
					offset: 40,
					minAngleToShowLabel: 10
				},
				donut: {
					size: '65%',
					labels: {
						show: true,
						total: {
							show: true,
							formatter: function () {
								return '100%';
							}
						}
					}
				}
			}
		},

		dataLabels: {
			enabled: false,
			textAnchor: 'middle',
			formatter: function (val, opts) {
				return opts.w.globals.labels[opts.seriesIndex] + '\n' +
					Math.round(val) + '%';
			},
			style: {
				fontSize: '13px',
				fontWeight: 600,
				colors: ['#000']   // White text
			},
			background: {
				enabled: true,
				foreColor: '#ffffff',
				borderRadius: 6,
				padding: 6,
				opacity: 1,
				borderWidth: 0
			},
			dropShadow: { enabled: false }
		},

		legend: { show: false },

		responsive: [{
			breakpoint: 768,
			options: {
				chart: { height: 260 }
			}
		}]
	};

	var chart = new ApexCharts(
		document.querySelector("#region-wise-growth"),
		options
	);

	chart.render();
}

// Employee Department

if (document.querySelector('#emp-department')) {
	var sBar = {
		chart: {
			height: 220,
			type: 'bar',
			padding: {
				top: 0,
				left: 0,
				right: 0,
				bottom: 0
			},
			toolbar: {
				show: false,
			}
		},
		colors: ['#FF6F28'],
		grid: {
			borderColor: '#E5E7EB',
			strokeDashArray: 5,
			padding: {
				top: -20,
				left: 0,
				right: 0,
				bottom: 0
			}
		},
		plotOptions: {
			bar: {
				borderRadius: 5,
				horizontal: true,
				barHeight: '35%',
				endingShape: 'rounded'
			}
		},
		dataLabels: {
			enabled: false
		},
		series: [{
			data: [80, 110, 80, 20, 60, 100],
			name: 'Employee'
		}],
		xaxis: {
			categories: ['UI/UX', 'Development', 'Management', 'HR', 'Testing', 'Marketing'],
			labels: {
				style: {
					colors: '#111827',
					fontSize: '13px',
				}
			}
		}
	}

	var chart = new ApexCharts(
		document.querySelector("#emp-department"),
		sBar
	);

	chart.render();
}

// Company Chart

if (document.querySelector('#company-chart')) {
	var sColStacked = {
		chart: {
			height: 290,
			type: 'bar',
			toolbar: {
				show: false,
			},
			background: '#fff' // Background of the full chart area
		},
		colors: ['#E04F16'], // Progress bar color
		plotOptions: {
			bar: {
				borderRadius: 5,
				horizontal: false,
				columnWidth: '10px', // Progress bar width
				endingShape: 'rounded',
				colors: {
					backgroundBarColors: ['#E8E8E8'], // Background of each bar
					backgroundBarOpacity: 1,
				}
			},
		},
		dataLabels: {
			enabled: false
		},
		stroke: {
			show: false
		},
		series: [{
			name: 'Company',
			data: [40, 60, 20, 80, 60, 60, 60]
		}],
		xaxis: {
			categories: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
			labels: {
				style: {
					colors: '#E04F16',
					fontSize: '13px',
				}
			}
		},
		yaxis: {
			labels: {
				offsetX: -15,
				show: false
			}
		},
		grid: {
			borderColor: '#E5E7EB',
			strokeDashArray: 5,
			padding: {
				left: -8,
			},
		},
		legend: {
			show: false
		},
		fill: {
			opacity: 1
		},
		responsive: [{
			breakpoint: 480,
			options: {
				legend: {
					position: 'bottom',
					offsetX: -10,
					offsetY: 0
				}
			}
		}]
	};

	var chart = new ApexCharts(
		document.querySelector("#company-chart"),
		sColStacked
	);

	chart.render();
}

// Plan Chart

if (document.querySelector('#plan-overview')) {
	var donutChart = {
		chart: {
			height: 220,
			type: 'donut',
			toolbar: {
				show: false,
			}
		},
		colors: ['#E41F07', '#FFA201', '#2F80ED'],
		series: [20, 20, 60],
		labels: ['Enterprise', 'Premium', 'Basic'],
		plotOptions: {
			pie: {
				donut: {
					size: '50%',
					labels: {
						show: false
					},
					borderRadius: 30
				}
			}
		},
		stroke: {
			lineCap: 'round',
			show: true,
			width: 0,    // Space between donut sections
			colors: '#fff'
		},
		dataLabels: {
			enabled: false
		},
		legend: { show: false },
		responsive: [{
			breakpoint: 480,
			options: {
				chart: {
					height: 180,
				},
				legend: {
					position: 'bottom'
				}
			}
		}]
	}

	var donut = new ApexCharts(
		document.querySelector("#plan-overview"),
		donutChart
	);

	donut.render();
}

// sales income

if (document.querySelector('#sales-income')) {
	var sColStacked = {
		chart: {
			height: 290,
			type: 'bar',
			stacked: true,
			toolbar: {
				show: false,
			}
		},
		colors: ['#FF6F28', '#F8F9FA'],
		responsive: [{
			breakpoint: 480,
			options: {
				legend: {
					position: 'bottom',
					offsetX: -10,
					offsetY: 0
				}
			}
		}],
		plotOptions: {
			bar: {
				borderRadius: 5,
				borderRadiusWhenStacked: 'all',
				horizontal: false,
				endingShape: 'rounded'
			},
		},
		series: [{
			name: 'Income',
			data: [40, 30, 45, 80, 85, 90, 80, 80, 80, 85, 20, 80]
		}, {
			name: 'Expenses',
			data: [60, 70, 55, 20, 15, 10, 20, 20, 20, 15, 80, 20]
		}],
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			labels: {
				style: {
					colors: '#6B7280',
					fontSize: '13px',
				}
			}
		},
		yaxis: {
			labels: {
				offsetX: -15,
				style: {
					colors: '#6B7280',
					fontSize: '13px',
				}
			}
		},
		grid: {
			borderColor: '#E5E7EB',
			strokeDashArray: 5,
			padding: {
				left: -8,
			},
		},
		legend: {
			show: false
		},
		dataLabels: {
			enabled: false // Disable data labels
		},
		fill: {
			opacity: 1
		},
	}

	var chart = new ApexCharts(
		document.querySelector("#sales-income"),
		sColStacked
	);

	chart.render();
}

// Performance Chart
if (document.querySelector('#performance_chart2')) {
	var options = {
		series: [{
			name: "performance",
			data: [20, 20, 35, 35, 40, 60, 60]
		}],
		chart: {
			height: 273,
			type: 'area',
			zoom: {
				enabled: false
			}
		},
		colors: ['#03C95A'],
		dataLabels: {
			enabled: false
		},
		stroke: {
			curve: 'straight'
		},
		title: {
			text: '',
			align: 'left'
		},
		// grid: {
		//   row: {
		//     colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
		//     opacity: 0.5
		//   },
		// },
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
		},
		yaxis: {
			min: 10,
			max: 60,
			tickAmount: 5,
			labels: {
				formatter: (val) => {
					return val / 1 + 'K'
				}
			}
		},
		legend: {
			position: 'top',
			horizontalAlign: 'left'
		}
	};

	var chart = new ApexCharts(document.querySelector("#performance_chart2"), options);
	chart.render();
}

// Deals Stage

if (document.querySelector('#deals_stage')) {
	var sColStacked = {
		chart: {
			height: 310,
			type: 'bar',
			stacked: true,
			toolbar: {
				show: false,
			}
		},
		colors: ['#FF6F28', '#F8F9FA'],
		responsive: [{
			breakpoint: 480,
			options: {
				legend: {
					position: 'bottom',
					offsetX: -10,
					offsetY: 0
				}
			}
		}],
		plotOptions: {
			bar: {
				borderRadius: 5,
				horizontal: false,
				endingShape: 'rounded'
			},
		},
		series: [{
			name: 'Income',
			data: [80, 40, 100, 20]
		}, {
			name: 'Expenses',
			data: [100, 100, 100, 100]
		}],
		xaxis: {
			categories: ['Inpipeline', 'Follow Up', 'Schedule', 'Conversion'],
			labels: {
				style: {
					colors: '#6B7280',
					fontSize: '13px',
				}
			}
		},
		yaxis: {
			labels: {
				offsetX: -15,
				style: {
					colors: '#6B7280',
					fontSize: '13px',
				}
			}
		},
		grid: {
			borderColor: '#E5E7EB',
			strokeDashArray: 5
		},
		legend: {
			show: false
		},
		dataLabels: {
			enabled: false // Disable data labels
		},
		fill: {
			opacity: 1
		},
	}

	var chart = new ApexCharts(
		document.querySelector("#deals_stage"),
		sColStacked
	);

	chart.render();
}
if (document.querySelector('#top_deal_chart')) {
	var options = {
		series: [{
			name: 'Series 1',
			data: [80, 50, 30, 40, 100, 20],
			color: '#F37438',

		}, {
			name: 'Series 2',
			data: [20, 30, 40, 80, 20, 80],
			color: '#B359C3',
		}, {
			name: 'Series 3',
			data: [44, 76, 78, 13, 43, 10],
			color: '#1CCE6B',
		}],
		chart: {
			height: 200,
			type: 'radar',
			dropShadow: {
				enabled: true,
				blur: 1,
				left: 1,
				top: 1
			}
		},
		plotOptions: {
			radar: {
				spiderWeb: false
			}
		},
		stroke: {
			width: 2,
			curve: 'smooth'
		},
		fill: {
			opacity: 1
		},
		markers: {
			size: 0
		},
		yaxis: {
			stepSize: 20
		},
		legend: {
			show: false,
		},
		xaxis: {
			categories: ['Mar', 'Feb', 'Jan', 'Aug', 'Jul', 'Jun', 'May', 'Apr']
		}
	};

	var chart = new ApexCharts(document.querySelector("#top_deal_chart"), options);
	chart.render();
}

// Pipeline Chart
if (document.querySelector('#pipeline_chart')) {
	var options = {
		series: [
			{
				name: "",
				data: [1380, 1100, 990, 880, 740, 540],
			},
		],
		chart: {
			type: 'bar',
			height: 280,
		},
		plotOptions: {
			bar: {
				borderRadius: 0,
				horizontal: true,
				distributed: true,
				barHeight: '80%',
				isFunnel: true,
			},
		},
		colors: [
			'#F26522',
			'#F37438',
			'#F5844E',
			'#F69364',
			'#F7A37A',
			'#F9B291'
		],
		dataLabels: {
			enabled: true,
			formatter: function (val, opt) {
				return opt.w.globals.labels[opt.dataPointIndex]
			},
			dropShadow: {
				enabled: true,
			},
		},
		title: {
			align: 'top',
		},
		xaxis: {
			categories: ['Marketing : 7,898', 'Sales : 4658', 'Email : 2898', 'Chat : 789', 'Operational : 655', 'Calls : 454'],
		},
		legend: {
			show: false,
		},
	};

	var chart = new ApexCharts(document.querySelector("#pipeline_chart"), options);
	chart.render();
}

// Leads Stage

if (document.querySelector('#leads_stage')) {
	var sColStacked = {
		chart: {
			height: 355,
			type: 'bar',
			stacked: true,
			toolbar: {
				show: false,
			}
		},
		colors: ['#FF6F28', '#F8F9FA'],
		responsive: [{
			breakpoint: 480,
			options: {
				legend: {
					position: 'bottom',
					offsetX: -10,
					offsetY: 0
				}
			}
		}],
		plotOptions: {
			bar: {
				borderRadius: 5,
				borderRadiusWhenStacked: 'all',
				horizontal: false,
				endingShape: 'rounded'
			},
		},
		series: [{
			name: 'Income',
			data: [80, 40, 60, 40]
		}, {
			name: 'Expenses',
			data: [100, 100, 100, 100]
		}],
		xaxis: {
			categories: ['Competitor', 'Budget', 'Unresponsie', 'Timing'],
			labels: {
				style: {
					colors: '#6B7280',
					fontSize: '9px',
				}
			}
		},
		yaxis: {
			labels: {
				offsetX: -15,
				style: {
					colors: '#6B7280',
					fontSize: '10px',
				}
			}
		},
		grid: {
			borderColor: '#E5E7EB',
			strokeDashArray: 5
		},
		legend: {
			show: false
		},
		dataLabels: {
			enabled: false // Disable data labels
		},
		fill: {
			opacity: 1
		},
	}

	var chart = new ApexCharts(
		document.querySelector("#leads_stage"),
		sColStacked
	);

	chart.render();
}

if (document.querySelector('#donut-chart-2')) {
	var options = {
		series: [25, 30, 10, 35], // Percentages for each section
		chart: {
			type: 'donut',
			height: 185,
		},
		labels: ['Paid', 'Google', 'Referals', 'Campaigns'], // Labels for the data
		colors: ['#FFC107', '#0C4B5E', '#AB47BC', '#FD3995'], // Colors from the image
		plotOptions: {
			pie: {
				donut: {
					size: '60%',
					labels: {
						show: true,
						total: {
							show: true,
							label: 'Google',
							formatter: function (w) {
								return '40%';
							}
						}
					}
				}
			}
		},
		stroke: {

			lineCap: 'round',
			show: true,
			width: 0,    // Space between donut sections
			colors: '#fff'
		},
		legend: {
			show: false,
		},
		dataLabels: {
			enabled: false
		},
		label: {
			show: false,
		}
	};

	var chart = new ApexCharts(document.querySelector("#donut-chart-2"), options);
	chart.render();
}



// Revenue income
if (document.querySelector('#revenue-income')) {
	var sColStacked = {
		chart: {
			height: 260,
			type: 'bar',
			stacked: true,
			toolbar: {
				show: false,
			}
		},
		colors: ['#0E9384', '#E8E8E8'], // Progress then background
		plotOptions: {
			bar: {
				borderRadius: 5,
				borderRadiusWhenStacked: 'all',
				horizontal: false,
				endingShape: 'rounded',
				columnWidth: '24px',
			},
		},
		series: [
			{
				name: 'Income',
				data: [40, 30, 45, 80, 85, 90, 80, 80, 80, 85, 20, 80]
			},
			{
				name: 'Expenses (bg)',
				data: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
			}
		],
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			labels: {
				style: {
					colors: '#0E9384',
					fontSize: '13px',
				}
			}
		},
		yaxis: {
			min: 0,
			max: 100,
			labels: {
				offsetX: -15,
				style: {
					colors: '#6B7280',
					fontSize: '13px',
				},
				formatter: function (value) {
					return value + "K";
				}
			}
		},
		grid: {
			borderColor: 'transparent',
			strokeDashArray: 5,
			padding: {
				left: -8,
			},
		},
		legend: {
			show: false
		},
		dataLabels: {
			enabled: false
		},
		tooltip: {
			y: {
				formatter: function (val) {
					return val / 10 + " k";
				}
			}
		},
		fill: {
			opacity: 1
		},
		responsive: [{
			breakpoint: 480,
			options: {
				legend: {
					position: 'bottom',
					offsetX: -10,
					offsetY: 0
				}
			}
		}]
	}

	var chart = new ApexCharts(
		document.querySelector("#revenue-income"),
		sColStacked
	);

	chart.render();
}

if (document.querySelector('#heat_chart')) {
	var options = {
		chart: {
			type: 'heatmap',
			height: 300,
		},
		colors: [
			"#9CA3AF",
			"#F37438",
			"#9CA3AF",
			"#F37438",
			"#9CA3AF",
			"#F37438",
		],
		series: [
			{
				name: "0",
				data: [{
					x: 'Mon',
					y: 22
				},
				{
					x: 'Tue',
					y: 29
				},
				{
					x: 'Wed',
					y: 13
				},
				{
					x: 'Thu',
					y: 32
				},
				{
					x: 'Fri',
					y: 32
				},
				{
					x: 'Sat',
					y: 32
				},
				{
					x: 'Sun',
					y: 32
				},
				]
			},
			{
				name: "20",
				data: [{
					x: 'Mon',
					y: 22,
					color: '#ff5722'
				},
				{
					x: 'Tue',
					y: 29
				},
				{
					x: 'Wed',
					y: 13
				},
				{
					x: 'Thu',
					y: 32
				},
				{
					x: 'Fri',
					y: 32
				},
				{
					x: 'Sat',
					y: 32
				},
				{
					x: 'Sun',
					y: 32
				},
				]
			},
			{
				name: "40",
				data: [{
					x: 'Mon',
					y: 22
				},
				{
					x: 'Tue',
					y: 29
				},
				{
					x: 'Wed',
					y: 13
				},
				{
					x: 'Thu',
					y: 32
				},
				{
					x: 'Fri',
					y: 32
				},
				{
					x: 'Sat',
					y: 32
				},
				{
					x: 'Sun',
					y: 32
				},
				]
			},
			{
				name: "60",
				data: [{
					x: 'Mon',
					y: 0
				},
				{
					x: 'Tue',
					y: 29
				},
				{
					x: 'Wed',
					y: 13
				},
				{
					x: 'Thu',
					y: 32
				},
				{
					x: 'Fri',
					y: 0
				},
				{
					x: 'Sat',
					y: 0
				},
				{
					x: 'Sun',
					y: 32
				},
				]
			},
			{
				name: "80",
				data: [{
					x: 'Mon',
					y: 0
				},
				{
					x: 'Tue',
					y: 20
				},
				{
					x: 'Wed',
					y: 13
				},
				{
					x: 'Thu',
					y: 32
				},
				{
					x: 'Fri',
					y: 0
				},
				{
					x: 'Sat',
					y: 0
				},
				{
					x: 'Sun',
					y: 32
				},
				]
			},
			{
				name: "120",
				data: [{
					x: 'Mon',
					y: 0
				},
				{
					x: 'Tue',
					y: 0
				},
				{
					x: 'Wed',
					y: 75
				},
				{
					x: 'Thu',
					y: 0
				},
				{
					x: 'Fri',
					y: 0
				},
				{
					x: 'Sat',
					y: 0
				},
				{
					x: 'Sun',
					y: 0
				},
				]
			},
		]
	};
	var chart = new ApexCharts(document.querySelector("#heat_chart"), options);
	chart.render();
}

if (document.querySelector('#payslip-chart')) {
	var options = {
		series: [{
			data: [22, 20, 30, 45, 55, 45, 20, 70, 25, 30, 10, 30]
		}],
		chart: {
			type: 'line',
			height: 200,
		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			labels: {
			}
		},
		stroke: {
			curve: 'stepline',
		},
		dataLabels: {
			enabled: false
		},
		markers: {
			hover: {
				sizeOffset: 4
			}
		},
		colors: ['#FF5733'],
	};

	var chart = new ApexCharts(document.querySelector("#payslip-chart"), options);
	chart.render();
}

if (document.querySelector('#user-chart')) {
	var options = {
		series: [{
			name: 'Data',
			data: [34, 44, 54, 21, 12, 43, 33, 23, 66, 66, 58, 29] // Sample data for each month
		}],
		chart: {
			type: 'bar',
			height: 185
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '55%',
				endingShape: 'rounded'
			},
		},
		dataLabels: {
			enabled: false
		},
		stroke: {
			show: true,
			width: 2,
			colors: ['transparent']
		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // Months
		},
		fill: {
			opacity: 1
		},
		tooltip: {
			y: {
				formatter: function (val) {
					return val + " units";
				}
			}
		},
		colors: ['#00E396'] // Bar color (green in this case)
	};

	var chart = new ApexCharts(document.querySelector("#user-chart"), options);
	chart.render();
}


// web app chart
if (document.querySelector('#web_app_chart')) {
	var donutChart = {
		chart: {
			height: 284,
			type: 'donut',
			toolbar: {
				show: false,
			}
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '50%'
			},
		},
		dataLabels: {
			enabled: false
		},

		series: [6, 20, 5, 20, 15, 10, 10, 30],
		labels: ['Codecanyon', 'Slack', 'Windows ', 'Freepik', 'Chrome', 'Gmail', 'Dribble', 'Figma'],
		colors: ['#FF0000', '#3e9ab5', '#3550dc', '#01B664', '#F9B801', '#24CDBA', '#3550dc', '#f9b801'],
		responsive: [{
			breakpoint: 480,
			options: {
				chart: {
					width: 252,
				},
				legend: {
					show: false
				}
			}
		}],
		legend: {
			show: false
		}
	}

	var donut = new ApexCharts(
		document.querySelector("#web_app_chart"),
		donutChart
	);

	donut.render();
}

if (document.querySelector('#utilization')) {
	var sCol = {
		chart: {
			height: 350,
			type: 'bar',
			toolbar: {
				show: false,
			}
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '80%',
				// endingShape: 'rounded', // This rounds the top edges of the bars
				borderRadius: 5 // This is an example, not natively supported, but works with some hacks.
			},
		},
		colors: ['#3550DC', '#FE9738', '#27EAEA'],
		dataLabels: {
			enabled: true
		},
		stroke: {
			show: true,
			width: 2,
			colors: ['transparent']
		},
		series: [{
			name: 'Inprogress',
			data: [60, 80, 100, 70, 30, 50, 70, 90, 50, 70]
		}, {
			name: 'Active',
			data: [30, 20, 2, 10, 60, 20, 30, 2, 20, 10]
		},
		{
			name: 'Completed',
			data: [10, 2, 2, 20, 10, 30, 2, 10, 30, 20]
		}],
		xaxis: {
			categories: ['1 hr', '2 hr', '3 hr', '4 hr', '5 hr', '6 hr', '7 hr', '8 hr', '9 hr', '10 hr'],
		},
		fill: {
			opacity: 1
		},
		tooltip: {
			y: {
				formatter: function (val) {
					return "" + val + "%"
				}
			}
		}
	}

	var chart = new ApexCharts(
		document.querySelector("#utilization"),
		sCol
	);

	chart.render();
}


// app chart
if (document.querySelector('#car-chart')) {
	var sCol = {
		chart: {
			width: '100',
			height: 90,
			type: 'bar',
			toolbar: {
				show: false,
			},
			padding: 0
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '100%', // Removes space between bars
				barHeight: '100%',
				endingShape: 'rounded'
			},
		},
		colors: ['#F0ECFF', '#4361ee'],
		states: {
			hover: {
				filter: {
					type: 'darken', // Options: 'none', 'lighten', 'darken'
					value: 0.3 // Adjust hover intensity
				}
			}
		},
		dataLabels: {
			enabled: false
		},
		stroke: {
			show: true,
			width: 2,
			colors: ['transparent']
		},
		series: [{
			name: 'Car',
			data: [9, 4, 7, 7, 4, 9, 8]
		}],
		fill: {
			opacity: 1

		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July'],
			labels: { show: false },
			axisTicks: { show: false },
			axisBorder: { show: false }
		},
		grid: {
			show: false, // Set false to hide all grid lines
			padding: { left: 0, right: 0, top: -15, bottom: 0 }
		},
		yaxis: {
			labels: { show: false }  // Hides Y-axis values
		},
		tooltip: {
			y: {
				formatter: function (val) {
					return val
				}
			}
		}
	}

	var chart = new ApexCharts(
		document.querySelector("#car-chart"),
		sCol
	);

	chart.render();
}


if (document.querySelector('#locationChart')) {
	var sCol1 = {
		series: [
			{ group: 'budget', data: [20000] },
			{ group: 'budget', data: [40000] }
		],
		chart: {
			type: 'bar',
			height: 250,
			stacked: true,
		},
		stroke: {
			width: 1,
			colors: ['#fff']
		},
		dataLabels: {
			formatter: (val) => val / 1000 + 'K'
		},
		plotOptions: {
			bar: {
				horizontal: true
			}
		},
		xaxis: {
			labels: {
				formatter: (val) => val + ''
			}
		},
		fill: {
			opacity: 1,
		},
		colors: ['#3550DC', '#FE9738']
	};

	// Only initialize chart once
	var chart = new ApexCharts(
		document.querySelector("#locationChart"),
		sCol1
	);
	chart.render();
}




if (document.querySelector('#summary_chart')) {
	var options = {
		chart: {
			type: 'heatmap',
			height: 330, toolbar: {
				show: false
			}
		},
		plotOptions: {
			heatmap: {
				radius: 5,
				enableShades: false,
				colorScale: {
					ranges: [{
						from: 1,
						to: 70,
						color: '#FFF5ED'
					},
					{
						from: 0,
						to: 0,
						color: '#FFCDA4'
					},
					{
						from: 80,
						to: 100,
						color: '#FE9738'
					},
					],
				},

			}
		},
		legend: {
			show: false
		},
		dataLabels: {
			enabled: false
		},
		stroke: {
			width: 5,
			colors: ['#fff']
		},
		grid: {
			borderColor: '#333',
			strokeDashArray: 7,
		},
		xaxis: {
			lines: {
				show: false,
			}
		},
		grid: {
			show: false,
			xaxis: {
				lines: {
					show: false,
				}
			},
			padding: {
				top: -30,
				bottom: 0,
				left: 0,
				right: -20, // Minimize padding around the heatmap
			},
		},
		xaxis: {
			axisBorder: { show: false },
			axisTicks: { show: false } // ❌ Removes axis ticks
		},
		yaxis: {
			labels: {
				offsetX: -15, // Adjust horizontal alignment
			},
		},
		series: [
			{
				name: "Sat",
				data: [{
					x: '09:00',
					y: 90
				},
				{
					x: '10:00',
					y: 100
				},
				{
					x: '11:00',
					y: 0
				},
				{
					x: '12:00',
					y: 50
				},
				{
					x: '01:00',
					y: 90
				},
				{
					x: '02:00',
					y: 90
				},
				{
					x: '04:00',
					y: 60
				},
				{
					x: '05:00',
					y: 100
				},
				{
					x: '06:00',
					y: 90
				},
				{
					x: '07:00',
					y: 80
				},
				{
					x: '08:00',
					y: 70
				},
				]
			},
			{
				name: "Fri",
				data: [{
					x: '09:00',
					y: 50
				},
				{
					x: '10:00',
					y: 60
				},
				{
					x: '11:00',
					y: 60
				},
				{
					x: '12:00',
					y: 50
				},
				{
					x: '01:00',
					y: 0
				},
				{
					x: '02:00',
					y: 60
				},
				{
					x: '04:00',
					y: 60
				},
				{
					x: '05:00',
					y: 0
				},
				{
					x: '06:00',
					y: 0
				},
				{
					x: '07:00',
					y: 0
				},
				{
					x: '08:00',
					y: 70
				},
				]
			},
			{
				name: "Thu",
				data: [{
					x: '09:00',
					y: 50
				},
				{
					x: '10:00',
					y: 0
				},
				{
					x: '11:00',
					y: 60
				},
				{
					x: '12:00',
					y: 90
				},
				{
					x: '01:00',
					y: 60
				},
				{
					x: '02:00',
					y: 0
				},
				{
					x: '04:00',
					y: 0
				},
				{
					x: '05:00',
					y: 100
				},
				{
					x: '06:00',
					y: 60
				},
				{
					x: '07:00',
					y: 80
				},
				{
					x: '08:00',
					y: 70
				},
				]
			},
			{
				name: "Wed",
				data: [{
					x: '09:00',
					y: 0
				},
				{
					x: '10:00',
					y: 0
				},
				{
					x: '11:00',
					y: 60
				},
				{
					x: '12:00',
					y: 0
				},
				{
					x: '01:00',
					y: 90
				},
				{
					x: '02:00',
					y: 0
				},
				{
					x: '04:00',
					y: 0
				},
				{
					x: '05:00',
					y: 0
				},
				{
					x: '06:00',
					y: 0
				},
				{
					x: '07:00',
					y: 90
				},
				{
					x: '08:00',
					y: 0
				},
				]
			},
			{
				name: "Tue",
				data: [{
					x: '09:00',
					y: 0
				},
				{
					x: '10:00',
					y: 50
				},
				{
					x: '11:00',
					y: 0
				},
				{
					x: '12:00',
					y: 0
				},
				{
					x: '01:00',
					y: 60
				},
				{
					x: '02:00',
					y: 90
				},
				{
					x: '04:00',
					y: 0
				},
				{
					x: '05:00',
					y: 90
				},
				{
					x: '06:00',
					y: 0
				},
				{
					x: '07:00',
					y: 0
				},
				{
					x: '08:00',
					y: 0
				},
				]
			},
			{
				name: "Mon",
				data: [{
					x: '09:00',
					y: 90
				},
				{
					x: '10:00',
					y: 0
				},
				{
					x: '11:00',
					y: 90
				},
				{
					x: '12:00',
					y: 80
				},
				{
					x: '01:00',
					y: 80
				},
				{
					x: '02:00',
					y: 90
				},
				{
					x: '04:00',
					y: 80
				},
				{
					x: '05:00',
					y: 90
				},
				{
					x: '06:00',
					y: 90
				},
				{
					x: '07:00',
					y: 90
				},
				{
					x: '08:00',
					y: 0
				},
				]
			},
		]
	};
	var chart = new ApexCharts(document.querySelector("#summary_chart"), options);
	chart.render();
}

if (document.querySelector('#hours_chart')) {
	var options = {
		series: [{
			name: 'Worked Hours',
			data: [8, 6, 5, 6, 5, 7],
		},],
		grid: {
			show: false,
			xaxis: {
				lines: {
					show: false,
				}
			},
			padding: {
				top: 5, // Adds space on the left
				right: 5, // Adds space on the right
			},
		},
		colors: ['#E8EEFE', '#3550DC', '#E8EEFE', '#E8EEFE'],
		chart: {
			type: 'bar',
			height: 240,
			stacked: true,
			zoom: {
				enabled: true
			}, toolbar: {
				show: false // ✅ Add this line to hide toolbar
			}
		},
		responsive: [{
			breakpoint: 280,
			options: {
				legend: {
					position: 'bottom',
					offsetY: 0
				}
			}
		}],
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '90%',
				distributed: true,
			},
		},
		dataLabels: {
			enabled: false
		},
		yaxis: {
			labels: {
				offsetX: -15,
				formatter: (val) => {
					return val / 1 + 'h'
				},
			},
			min: 0,
			max: 12,
			tickAmount: 6,
		},
		xaxis: {
			categories: [' Mon', 'Tue', 'Wed', 'Thu',
				'Fri', 'Sat'
			],
		},
		grid: {
			padding: {
				right: -10,
			},
		},
		legend: { show: false },
		fill: {
			opacity: 1
		},
		states: {
			hover: {
				filter: {
					type: 'none', // Disable default filter effect
				},
				color: '#3550DC' // Change to your primary color
			}
		},
	};


	var chart = new ApexCharts(document.querySelector("#hours_chart"), options);
	chart.render();
}

if (document.querySelector('#total_tasks')) {
	var options = {
		series: [30, 10, 60], // Percentages for each section
		chart: {
			type: 'donut',
			height: 275,
		},
		labels: ['Inprogress', 'To Do', 'Completed'], // Labels for the data
		colors: ['#6DB3A7', '#FFA86E', '#6A89EB'], // Colors from the image
		plotOptions: {
			pie: {
				donut: {
					size: '60%',
					labels: {
						show: false,
						total: {
							show: true,
							label: 'Leads',
							formatter: function (w) {
								return '589';
							}
						}
					}
				}
			}
		},
		dataLabels: {
			enabled: false
		},
		legend: {
			show: false,
		},
		label: {
			show: false,
		}
	};

	var chart = new ApexCharts(document.querySelector("#total_tasks"), options);
	chart.render();
}

// Sales Statistics

if (document.querySelector('#total_sales')) {
	var options = {
		series: [35, 40, 25], // Percentages for each section
		chart: {
			type: 'donut',
			height: 300,
		},
		labels: ['Dell XPS 13', 'Nike T-shirt', 'Apple iPhone 15'], // Labels for the data
		colors: ['#F38BBB', '#5297FE', '#7DCEA0'], // Colors from the image
		plotOptions: {
			pie: {
				startAngle: -110, // Start from the top
				endAngle: 110, // End at the bottom
				donut: {
					size: '60%',
					labels: {
						show: false,
						total: {
							show: true,
							label: 'Leads',
							formatter: function (w) {
								return '589';
							}
						}
					}
				}
			}
		},
		dataLabels: {
			enabled: false
		},
		legend: {
			show: false,
		},
		label: {
			show: false,
		}
	};

	var chart = new ApexCharts(document.querySelector("#total_sales"), options);
	chart.render();
}

// Simple Line Area
if (document.querySelector('#invoice_income')) {
	var sLineArea = {
		chart: {
			height: 60,
			type: 'area',
			background: '#ffffff',
			toolbar: {
				show: false,
			}
		},
		colors: ['#27AE60'],
		fill: {
			type: 'solid',
			opacity: 0 // Ensure solid fill
		}, dataLabels: {
			enabled: false
		},
		stroke: {
			curve: 'smooth'
		},
		series: [{
			name: 'Income',
			data: [30, 35, 45, 40, 55, 45, 56, 53, 68, 63, 70, 80]
		}],
		grid: {
			show: false, // Set false to hide all grid lines
			padding: { left: -10, right: -10, top: -30, bottom: -28 }
		},
		yaxis: {
			min: 0,
			max: 80,
			labels: { show: false }  // Hides Y-axis values
		},
		xaxis: {
			categories: ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"],
			labels: { show: false }
		},
	}

	var chart = new ApexCharts(
		document.querySelector("#invoice_income"),
		sLineArea
	);

	chart.render();
}

// Revenue
if (document.querySelector('#revenue_chart')) {
	var sColStacked = {
		chart: {
			height: 360,
			type: 'bar',
			stacked: true,
			toolbar: {
				show: false,
			}
		},
		responsive: [{
			breakpoint: 480,
			options: {
			}
		}],
		plotOptions: {
			bar: {
				horizontal: false,
				borderRadius: 5,
				borderRadiusWhenStacked: 'all',
				endingShape: 'rounded',
				columnWidth: '40%'
			},
		},
		legend: {
			show: false,
		},
		dataLabels: {
			enabled: false
		},
		label: {
			show: false,
		},
		colors: ['#7539FF', '#F8F5FF'],
		series: [{
			name: 'Outstanding',
			data: [0, 10, 30, 50, 25, 38, 40]
		}, {
			name: 'Received ',
			data: [30, 30, 80, 70, 80, 80, 80]
		},],
		grid: {
			borderColor: '#E2E4E6',
			strokeDashArray: 5,
			padding: {
				right: -10, left: -10,
			},
		},
		xaxis: {
			categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
		},
		yaxis: {
			min: 0,
			max: 100,
			labels: { show: false }
		},
		fill: {
			opacity: 1
		},
	}

	var chart = new ApexCharts(
		document.querySelector("#revenue_chart"),
		sColStacked
	);

	chart.render();
}

// Revenue
if (document.querySelector('#sales_analytics')) {
	var sColStacked = {
		chart: {
			height: 300,
			type: 'bar',
			toolbar: {
				show: false,
			}
		},
		plotOptions: {
			bar: {
				horizontal: false,
			},
		},
		legend: {
			show: false,
		},
		dataLabels: {
			enabled: false
		},
		label: {
			show: false,
		},
		colors: ['#2F80ED', '#E2B93B'],
		series: [{
			name: 'Received ',
			data: [80, 100, 50, 50, 80, 60, 100, 60, 40, 55, 30, 70]
		}, {
			name: 'Pending ',
			data: [40, 60, 60, 60, 20, 80, 40, 20, 50, 70, 40, 60]
		},],
		grid: {
			borderColor: '#E2E4E6',
			strokeDashArray: 5,
			padding: {
				right: -10, left: 0,
			},
		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		},
		yaxis: {
			min: 0,
			max: 100,
			labels: {
				offsetX: -15,
				formatter: (val) => {
					return '$' + val / 1
				}
			}
		},
		fill: {
			opacity: 1
		},
	}

	var chart = new ApexCharts(
		document.querySelector("#sales_analytics"),
		sColStacked
	);

	chart.render();
}

// Sales Statistics

if (document.querySelector('#invoice_analytics')) {
	var options = {
		series: [40, 35, 25], // Percentages for each section
		chart: {
			type: 'donut',
			height: 240,
		},
		labels: ['Invoiced', 'Received', 'Pending'], // Labels for the data
		colors: ['#2F80ED', '#27AE60', '#E2B93B'], // Colors from the image
		plotOptions: {
			pie: {
				donut: {
					size: '70%',
					labels: {
						show: false,
						total: {
							show: true,
							label: 'Leads',
							formatter: function (w) {
								return '589';
							}
						}
					}
				}
			}
		},
		dataLabels: {
			enabled: true
		},
		legend: {
			show: true,
			position: "bottom",
		},
		label: {
			show: false,
		}
	};

	var chart = new ApexCharts(document.querySelector("#invoice_analytics"), options);
	chart.render();
}


// s-col-1
if (document.querySelector('#s-col-1')) {
	var sCol = {
		chart: {
			width: 40,
			height: 54,
			type: 'bar',
			toolbar: { show: false },
			sparkline: { enabled: true }
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '70%',
				borderRadius: 0,
				endingShape: 'rounded'
			}
		},
		dataLabels: { enabled: false },
		stroke: { show: false },
		series: [{
			name: 'Data',
			data: [
				{ x: 'A', y: 80, fillColor: '#3550DC' },
				{ x: 'B', y: 35, fillColor: '#3550DC' },
				{ x: 'C', y: 50, fillColor: '#3550DC' },
				{ x: 'D', y: 45, fillColor: '#3550DC' },
				{ x: 'E', y: 35, fillColor: '#3550DC' }
			]
		}],
		xaxis: {
			labels: { show: false },
			axisTicks: { show: false },
			axisBorder: { show: false }
		},
		yaxis: { show: false },
		grid: { show: false },
		tooltip: { enabled: false }
	};

	var chart = new ApexCharts(document.querySelector("#s-col-1"), sCol);
	chart.render();
}

// s-col-2
if (document.querySelector('#s-col-2')) {
	var sCol = {
		chart: {
			width: 40,
			height: 54,
			type: 'bar',
			toolbar: { show: false },
			sparkline: { enabled: true }
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '70%',
				borderRadius: 0,
				endingShape: 'rounded'
			}
		},
		dataLabels: { enabled: false },
		stroke: { show: false },
		series: [{
			name: 'Data',
			data: [
				{ x: 'A', y: 90, fillColor: '#01B664' },
				{ x: 'B', y: 35, fillColor: '#01B664' },
				{ x: 'C', y: 40, fillColor: '#01B664' },
				{ x: 'D', y: 65, fillColor: '#01B664' },
				{ x: 'E', y: 55, fillColor: '#01B664' }
			]
		}],
		xaxis: {
			labels: { show: false },
			axisTicks: { show: false },
			axisBorder: { show: false }
		},
		yaxis: { show: false },
		grid: { show: false },
		tooltip: { enabled: false }
	};

	var chart = new ApexCharts(document.querySelector("#s-col-2"), sCol);
	chart.render();
}

// s-col-3
if (document.querySelector('#s-col-3')) {
	var sCol = {
		chart: {
			width: 40,
			height: 54,
			type: 'bar',
			toolbar: { show: false },
			sparkline: { enabled: true }
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '70%',
				borderRadius: 0,
				endingShape: 'rounded'
			}
		},
		dataLabels: { enabled: false },
		stroke: { show: false },
		series: [{
			name: 'Data',
			data: [
				{ x: 'A', y: 90, fillColor: '#FF0000' },
				{ x: 'B', y: 65, fillColor: '#FF0000' },
				{ x: 'C', y: 60, fillColor: '#FF0000' },
				{ x: 'D', y: 45, fillColor: '#FF0000' },
				{ x: 'E', y: 25, fillColor: '#FF0000' }
			]
		}],
		xaxis: {
			labels: { show: false },
			axisTicks: { show: false },
			axisBorder: { show: false }
		},
		yaxis: { show: false },
		grid: { show: false },
		tooltip: { enabled: false }
	};

	var chart = new ApexCharts(document.querySelector("#s-col-3"), sCol);
	chart.render();
}

// s-col-4
if (document.querySelector('#s-col-4')) {
	var sCol = {
		chart: {
			width: 40,
			height: 54,
			type: 'bar',
			toolbar: { show: false },
			sparkline: { enabled: true }
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '70%',
				borderRadius: 0,
				endingShape: 'rounded'
			}
		},
		dataLabels: { enabled: false },
		stroke: { show: false },
		series: [{
			name: 'Data',
			data: [
				{ x: 'A', y: 80, fillColor: '#FF0000' },
				{ x: 'B', y: 85, fillColor: '#FF0000' },
				{ x: 'C', y: 50, fillColor: '#FF0000' },
				{ x: 'D', y: 55, fillColor: '#FF0000' },
				{ x: 'E', y: 95, fillColor: '#FF0000' }
			]
		}],
		xaxis: {
			labels: { show: false },
			axisTicks: { show: false },
			axisBorder: { show: false }
		},
		yaxis: { show: false },
		grid: { show: false },
		tooltip: { enabled: false }
	};

	var chart = new ApexCharts(document.querySelector("#s-col-4"), sCol);
	chart.render();
}


// chart 1
if (document.querySelector('#chart-1')) {
	var sCol = {
		chart: {
			width: '100%',
			height: 54,
			type: 'area',
			toolbar: { show: false },
			sparkline: { enabled: true }
		},
		stroke: {
			curve: 'smooth',
			width: 4,
			colors: ['#1F9CC6']
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.4,
				opacityTo: 0,
				stops: [0, 90, 100],
				colorStops: [
					{
						offset: 0,
						color: "#1F9CC6",
						opacity: 0.5
					},
					{
						offset: 100,
						color: "#ffffff",
						opacity: 0
					}
				]
			}
		},
		dataLabels: { enabled: false },
		series: [{
			name: 'Data',
			data: [12, 14, 15, 14, 18, 20, 20, 22, 23, 20]
		}],
		xaxis: {
			labels: { show: false },
			axisTicks: { show: false },
			axisBorder: { show: false }
		},
		yaxis: { show: false },
		grid: { show: false },
		tooltip: {
			enabled: true,
			custom: function ({ series, seriesIndex, dataPointIndex }) {
				const value = series[seriesIndex][dataPointIndex];
				return `<div style="padding:5px 10px; font-size:12px; background:#fff; border:1px solid #ccc; border-radius:4px;">
                    All Patients: ${value}
                  </div>`;
			}
		}
	};

	var chart = new ApexCharts(document.querySelector("#chart-1"), sCol);
	chart.render();
}

// chart 2
if (document.querySelector('#chart-2')) {
	var sCol = {
		chart: {
			width: '100%',
			height: 54,
			type: 'area',
			toolbar: { show: false },
			sparkline: { enabled: true }
		},
		stroke: {
			curve: 'smooth',
			width: 4,
			colors: ['#08BC90']
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.4,
				opacityTo: 0,
				stops: [0, 90, 100],
				colorStops: [
					{
						offset: 0,
						color: "#08BC90",
						opacity: 0.5
					},
					{
						offset: 100,
						color: "#ffffff",
						opacity: 0
					}
				]
			}
		},
		dataLabels: { enabled: false },
		series: [{
			name: 'Data',
			data: [12, 14, 15, 20, 18, 20, 20, 10, 23, 20]
		}],
		xaxis: {
			labels: { show: false },
			axisTicks: { show: false },
			axisBorder: { show: false }
		},
		yaxis: { show: false },
		grid: { show: false },
		tooltip: {
			enabled: true,
			custom: function ({ series, seriesIndex, dataPointIndex }) {
				const value = series[seriesIndex][dataPointIndex];
				return `<div style="padding:5px 10px; font-size:12px; background:#fff; border:1px solid #ccc; border-radius:4px;">
                    Appointments: ${value}
                  </div>`;
			}
		}
	};

	var chart = new ApexCharts(document.querySelector("#chart-2"), sCol);
	chart.render();
}

// chart 3
if (document.querySelector('#chart-3')) {
	var sCol = {
		chart: {
			width: '100%',
			height: 54,
			type: 'area',
			toolbar: { show: false },
			sparkline: { enabled: true }
		},
		stroke: {
			curve: 'smooth',
			width: 4,
			colors: ['#4A77FC']
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.4,
				opacityTo: 0,
				stops: [0, 90, 100],
				colorStops: [
					{
						offset: 0,
						color: "#4A77FC",
						opacity: 0.5
					},
					{
						offset: 100,
						color: "#ffffff",
						opacity: 0
					}
				]
			}
		},
		dataLabels: { enabled: false },
		series: [{
			name: 'Data',
			data: [12, 14, 15, 20, 18, 20, 20, 28, 20, 25]
		}],
		xaxis: {
			labels: { show: false },
			axisTicks: { show: false },
			axisBorder: { show: false }
		},
		yaxis: { show: false },
		grid: { show: false },
		tooltip: {
			enabled: true,
			custom: function ({ series, seriesIndex, dataPointIndex }) {
				const value = series[seriesIndex][dataPointIndex];
				return `<div style="padding:5px 10px; font-size:12px; background:#fff; border:1px solid #ccc; border-radius:4px;">
                    Total Doctors: ${value}
                  </div>`;
			}
		}
	};

	var chart = new ApexCharts(document.querySelector("#chart-3"), sCol);
	chart.render();
}

// chart 4
if (document.querySelector('#chart-4')) {
	var sCol = {
		chart: {
			width: '100%',
			height: 54,
			type: 'area',
			toolbar: { show: false },
			sparkline: { enabled: true }
		},
		stroke: {
			curve: 'smooth',
			width: 4,
			colors: ['#1ABE17']
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.4,
				opacityTo: 0,
				stops: [0, 90, 100],
				colorStops: [
					{
						offset: 0,
						color: "#1ABE17",
						opacity: 0.5
					},
					{
						offset: 100,
						color: "#ffffff",
						opacity: 0
					}
				]
			}
		},
		dataLabels: { enabled: false },
		series: [{
			name: 'Data',
			data: [12, 14, 2, 14, 18, 10, 20, 28, 5, 25]
		}],
		xaxis: {
			labels: { show: false },
			axisTicks: { show: false },
			axisBorder: { show: false }
		},
		yaxis: { show: false },
		grid: { show: false },
		tooltip: {
			enabled: true,
			custom: function ({ series, seriesIndex, dataPointIndex }) {
				const value = series[seriesIndex][dataPointIndex];
				return `<div style="padding:5px 10px; font-size:12px; background:#fff; border:1px solid #ccc; border-radius:4px;">
                    Total Transactions: ${value}
                  </div>`;
			}
		}
	};

	var chart = new ApexCharts(document.querySelector("#chart-4"), sCol);
	chart.render();
}

// chart 5
if (document.querySelector('#chart-5')) {
	var sCol = {
		chart: {
			type: 'bar',
			height: 290,
			stacked: true,
			toolbar: { show: false },
			sparkline: { enabled: false }
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '50%',
				borderRadius: 5,
				borderRadiusApplication: 'end'
			}
		},
		dataLabels: { enabled: false },
		stroke: {
			show: false
		},
		series: [
			{
				name: 'New Patients',
				data: [25, 30, 70, 25, 20, 40, 35]
			},
			{
				name: 'Old Patients',
				data: [20, 25, 15, 75, 50, 25, 10],
			}
		],
		colors: ['#43A6CC', '#42C39B'],
		xaxis: {
			categories: ['25 May', '26 May', '27 May', '28 May', '29 May', '30 May', '31 May'],
			labels: {
				style: {
					fontSize: '14px'
				}
			},
			axisBorder: { show: false },
			axisTicks: { show: false },
			tickPlacement: 'between'
		},
		yaxis: {
			max: 100,
			labels: {
				align: 'left',           // align text left
				offsetX: -10,            // move closer to the chart edge
				style: {
					fontSize: '14px'
				},
				formatter: function (val) {
					return val;
				}
			}
		},
		legend: { show: false },
		grid: {
			show: true,
			strokeDashArray: 4,
			padding: {
				left: 0,
				right: -20
			}
		},
		tooltip: {
			enabled: true,
			shared: true,
			intersect: false
		}
	};

	var chart = new ApexCharts(document.querySelector("#chart-5"), sCol);
	chart.render();
}

// chart 6
if (document.querySelector('#chart-6')) {
	var sCol = {
		chart: {
			type: 'area',
			height: 235,
			toolbar: { show: false },
			sparkline: { enabled: false }
		},
		dataLabels: {
			enabled: false,
			style: {
				fontSize: '12px',
				colors: ['#333']
			}
		},
		stroke: {
			curve: 'stepline',
			width: 2,
			colors: ['#E65100']
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.6,
				opacityTo: 0,
				stops: [0, 90, 100],
				colorStops: [
					{
						offset: 0,
						color: "#E65100",
						opacity: 0.4
					},
					{
						offset: 100,
						color: "#ffffff",
						opacity: 0
					}
				]
			}
		},
		series: [{
			name: 'Total Earnings',
			data: [20, 30, 40, 50, 60, 70, 80]
		}],
		xaxis: {
			show: false,
			labels: { show: false },
			axisBorder: { show: false },
			axisTicks: { show: false },
			tooltip: { enabled: false }
		},
		yaxis: {
			show: false
		},
		grid: {
			show: true,
			borderColor: '#e0e0e0',
			strokeDashArray: 4,
			padding: {
				left: 0,
				right: 0,
				top: 0,
				bottom: -10
			}
		},
		tooltip: {
			enabled: true,
			y: {
				formatter: function (val) {
					return `$${val}`;
				}
			}
		}
	};

	var chart = new ApexCharts(document.querySelector("#chart-6"), sCol);
	chart.render();
}

// chart 7
if (document.querySelector('#chart-7')) {
	var sCol = {
		chart: {
			height: 290,
			type: 'bar',
			toolbar: {
				show: false,
			}
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '40%', // Adjusted to make bars narrower
				barSpacing: 10,     // Adds space between the series
				borderRadius: 0,    // sharp edges
			},
		},
		colors: ['#1F9CC6', '#08BC90'], // blue and teal
		dataLabels: {
			enabled: false
		},
		stroke: {
			show: true,
			width: 2,
			colors: ['transparent']
		},
		series: [{
			name: 'Inprogress',
			data: [60, 50, 25, 20, 60, 55, 10, 120, 30, 10, 50, 60] // 12 points
		},
		{
			name: 'Completed',
			data: [35, 30, 10, 5, 40, 5, 5, 25, 15, 5, 30, 35] // 12 points
		}],
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			labels: {
				style: {
					colors: '#6B7280',
					fontSize: '14px',
				}
			}
		},
		yaxis: {
			max: 120,
			labels: {
				offsetX: -15,
				style: {
					colors: '#6B7280',
					fontSize: '14px',
				}
			}
		},
		legend: {
			show: false
		},
		grid: {
			borderColor: '#E5E7EB',
			strokeDashArray: 5,
			padding: {
				left: -8,
				right: -15,
				bottom: -10,
			},
		},
		fill: {
			opacity: 1
		},
		tooltip: {
			y: {
				formatter: function (val) {
					return val;
				}
			}
		}
	}

	var chart = new ApexCharts(
		document.querySelector("#chart-7"),
		sCol
	);

	chart.render();
}







// s-col-1
if (document.querySelector('#chart-col-1')) {
	var sCol = {
		chart: {
			width: 100,
			height: 54,
			type: 'area',
			toolbar: { show: false },
			sparkline: { enabled: true }
		},
		stroke: {
			curve: 'smooth',
			width: 1,
			colors: ['#3550dc']  // orange line
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.4,
				opacityTo: 0,
				stops: [0, 90, 100],
				colorStops: [
					{
						offset: 0,
						color: "#3550dc",
						opacity: 0.4
					},
					{
						offset: 100,
						color: "#ffffff",
						opacity: 0.8
					}
				]
			}
		},
		dataLabels: { enabled: false },
		series: [{
			name: 'Data',
			data: [22, 35, 30, 40, 28, 45, 40] // You can adjust these
		}],
		xaxis: {
			labels: { show: false },
			axisTicks: { show: false },
			axisBorder: { show: false }
		},
		yaxis: { show: false },
		grid: { show: false },
		tooltip: { enabled: false }
	};

	var chart = new ApexCharts(document.querySelector("#chart-col-1"), sCol);
	chart.render();
}

// s-col-2
if (document.querySelector('#chart-col-2')) {
	var sCol = {
		chart: {
			width: 100,
			height: 54,
			type: 'area',
			toolbar: { show: false },
			sparkline: { enabled: true }
		},
		stroke: {
			curve: 'smooth',
			width: 1,
			colors: ['#f9b801']  // orange line
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.4,
				opacityTo: 0,
				stops: [0, 90, 100],
				colorStops: [
					{
						offset: 0,
						color: "#f9b801",
						opacity: 0.4
					},
					{
						offset: 100,
						color: "#ffffff",
						opacity: 0.8
					}
				]
			}
		},
		dataLabels: { enabled: false },
		series: [{
			name: 'Data',
			data: [22, 35, 30, 40, 28, 45, 40] // You can adjust these
		}],
		xaxis: {
			labels: { show: false },
			axisTicks: { show: false },
			axisBorder: { show: false }
		},
		yaxis: { show: false },
		grid: { show: false },
		tooltip: { enabled: false }
	};

	var chart = new ApexCharts(document.querySelector("#chart-col-2"), sCol);
	chart.render();
}

// s-col-3
if (document.querySelector('#chart-col-3')) {
	var sCol = {
		chart: {
			width: 100,
			height: 54,
			type: 'area',
			toolbar: { show: false },
			sparkline: { enabled: true }
		},
		stroke: {
			curve: 'smooth',
			width: 1,
			colors: ['#3550dc']  // orange line
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.4,
				opacityTo: 0,
				stops: [0, 90, 100],
				colorStops: [
					{
						offset: 0,
						color: "#3550dc",
						opacity: 0.4
					},
					{
						offset: 100,
						color: "#ffffff",
						opacity: 0.8
					}
				]
			}
		},
		dataLabels: { enabled: false },
		series: [{
			name: 'Data',
			data: [22, 35, 30, 40, 28, 45, 40] // You can adjust these
		}],
		xaxis: {
			labels: { show: false },
			axisTicks: { show: false },
			axisBorder: { show: false }
		},
		yaxis: { show: false },
		grid: { show: false },
		tooltip: { enabled: false }
	};

	var chart = new ApexCharts(document.querySelector("#chart-col-3"), sCol);
	chart.render();
}

// s-col-4
if (document.querySelector('#chart-col-4')) {
	var sCol = {
		chart: {
			width: 100,
			height: 54,
			type: 'area',
			toolbar: { show: false },
			sparkline: { enabled: true }
		},
		stroke: {
			curve: 'smooth',
			width: 1,
			colors: ['#3e9ab5']  // orange line
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.4,
				opacityTo: 0,
				stops: [0, 90, 100],
				colorStops: [
					{
						offset: 0,
						color: "#3e9ab5",
						opacity: 0.4
					},
					{
						offset: 100,
						color: "#ffffff",
						opacity: 0.8
					}
				]
			}
		},
		dataLabels: { enabled: false },
		series: [{
			name: 'Data',
			data: [22, 35, 30, 40, 28, 45, 40] // You can adjust these
		}],
		xaxis: {
			labels: { show: false },
			axisTicks: { show: false },
			axisBorder: { show: false }
		},
		yaxis: { show: false },
		grid: { show: false },
		tooltip: { enabled: false }
	};

	var chart = new ApexCharts(document.querySelector("#chart-col-4"), sCol);
	chart.render();
}

// Poductive Chart

if (document.querySelector('#productivetime-chart')) {
	var sCol = {
		chart: {
			width: '100%',
			height: 60,
			type: 'bar',
			toolbar: {
				show: false,
			},
			padding: 0
		},
		legend: {
			show: false
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '100%', // Removes space between bars
				barHeight: '100%',
				endingShape: 'rounded',
				distributed: true,
			},
		},
		colors: ['#FFF5ED', '#FFAD6A', '#FFF5ED', '#FFAD6A'],
		states: {
			hover: {
				filter: {
					type: 'darken', // Options: 'none', 'lighten', 'darken'
					value: 0.3 // Adjust hover intensity
				}
			}
		},
		dataLabels: {
			enabled: false
		},
		stroke: {
			show: true,
			width: 2,
			colors: ['transparent']
		},
		series: [{
			name: 'Productive Time',
			data: [4, 8, 10, 14, 15, 16]
		}],
		fill: {
			opacity: 1

		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
			labels: { show: false },
			axisTicks: { show: false },
			axisBorder: { show: false }
		},
		grid: {
			show: false, // Set false to hide all grid lines
			padding: { left: 0, right: 0, top: -15, bottom: -28 }
		},
		yaxis: {
			min: 4,
			max: 16,
			labels: { show: false }  // Hides Y-axis values
		},
		tooltip: {
			y: {
				formatter: function (val) {
					return val
				}
			}
		}
	}

	var chart = new ApexCharts(
		document.querySelector("#productivetime-chart"),
		sCol
	);

	chart.render();
}

// Time Chart

if (document.querySelector('#unproductivetime-chart')) {
	var sCol = {
		chart: {
			width: '100%',
			height: 60,
			type: 'bar',
			toolbar: {
				show: false,
			},
			padding: 0
		},
		legend: {
			show: false
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '100%', // Removes space between bars
				barHeight: '100%',
				endingShape: 'rounded',
				distributed: true,
			},
		},
		colors: ['#35839a', '#F0ECFF', '#35839a', '#F0ECFF',],
		states: {
			hover: {
				filter: {
					type: 'darken', // Options: 'none', 'lighten', 'darken'
					value: 0.3 // Adjust hover intensity
				}
			}
		},
		dataLabels: {
			enabled: false
		},
		stroke: {
			show: true,
			width: 2,
			colors: ['transparent']
		},
		series: [{
			name: 'Unproductive Time',
			data: [5, 6, 7, 8, 9, 10]
		}],
		fill: {
			opacity: 1

		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
			labels: { show: false },
			axisTicks: { show: false },
			axisBorder: { show: false }
		},
		grid: {
			show: false, // Set false to hide all grid lines
			padding: { left: 0, right: 0, top: -15, bottom: -28 }
		},
		yaxis: {
			min: 3,
			max: 10,
			labels: { show: false }  // Hides Y-axis values
		},
		tooltip: {
			y: {
				formatter: function (val) {
					return val
				}
			}
		}
	}

	var chart = new ApexCharts(
		document.querySelector("#unproductivetime-chart"),
		sCol
	);

	chart.render();
}

// Time Chart

if (document.querySelector('#manualtime-chart')) {
	var sCol = {
		chart: {
			width: '100%',
			height: 60,
			type: 'bar',
			toolbar: {
				show: false,
			},
			padding: 0
		},
		legend: {
			show: false
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '100%', // Removes space between bars
				barHeight: '100%',
				endingShape: 'rounded',
				distributed: true,
			},
		},
		colors: ['#EBF4F2', '#56A89B', '#EBF4F2', '#56A89B',],
		states: {
			hover: {
				filter: {
					type: 'darken', // Options: 'none', 'lighten', 'darken'
					value: 0.3 // Adjust hover intensity
				}
			}
		},
		dataLabels: {
			enabled: false
		},
		stroke: {
			show: true,
			width: 2,
			colors: ['transparent']
		},
		series: [{
			name: 'Manual Time',
			data: [5, 7, 8, 10, 12, 14]
		}],
		fill: {
			opacity: 1

		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
			labels: { show: false },
			axisTicks: { show: false },
			axisBorder: { show: false }
		},
		grid: {
			show: false, // Set false to hide all grid lines
			padding: { left: 0, right: 0, top: -15, bottom: -28 }
		},
		yaxis: {
			min: 3,
			max: 14,
			labels: { show: false }  // Hides Y-axis values
		},
		tooltip: {
			y: {
				formatter: function (val) {
					return val
				}
			}
		}
	}

	var chart = new ApexCharts(
		document.querySelector("#manualtime-chart"),
		sCol
	);

	chart.render();
}

// Time Chart

if (document.querySelector('#worktime-chart')) {
	var sCol = {
		chart: {
			width: '100%',
			height: 60,
			type: 'bar',
			toolbar: {
				show: false,
			},
			padding: 0
		},
		legend: {
			show: false
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '100%', // Removes space between bars
				barHeight: '100%',
				endingShape: 'rounded',
				distributed: true,
			},
		},
		colors: ['#E8EEFE', '#E8EEFE', '#E8EEFE', '#4361ee'],
		states: {
			hover: {
				filter: {
					type: 'darken', // Options: 'none', 'lighten', 'darken'
					value: 0.3 // Adjust hover intensity
				}
			}
		},
		dataLabels: {
			enabled: false
		},
		stroke: {
			show: true,
			width: 2,
			colors: ['transparent']
		},
		series: [{
			name: 'Working Hours',
			data: [4, 5, 6, 7, 10, 12]
		}],
		fill: {
			opacity: 1

		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
			labels: { show: false },
			axisTicks: { show: false },
			axisBorder: { show: false }
		},
		grid: {
			show: false, // Set false to hide all grid lines
			padding: { left: 0, right: 0, top: -15, bottom: -28 }
		},
		yaxis: {
			min: 2,
			max: 12,
			labels: { show: false }  // Hides Y-axis values
		},
		tooltip: {
			y: {
				formatter: function (val) {
					return val
				}
			}
		}
	}

	var chart = new ApexCharts(
		document.querySelector("#worktime-chart"),
		sCol
	);

	chart.render();
}

if (document.querySelector('#timeline_chart')) {
	var options = {
		series: [25, 15, 60], // Percentages for each section
		chart: {
			type: 'pie',
			height: 245,
		},
		labels: ['Unproductive', 'Overtime', 'Productive'], // Labels for the data
		colors: ['#8000FF', '#FE9738', '#24CDBA'], // Colors from the image
		plotOptions: {
			pie: {
				startAngle: 55,
				donut: {
					size: '60%',
					labels: {
						show: false,
						total: {
							show: true,
							label: 'Leads',
							formatter: function (w) {
								return '589';
							}
						}
					}
				}
			}
		},
		dataLabels: {
			enabled: true
		},
		legend: {
			show: false,
		},
		label: {
			show: false,
		}
	};

	var chart = new ApexCharts(document.querySelector("#timeline_chart"), options);
	chart.render();
}


if (document.querySelector('#project-chart')) {
	var sCol = {
		chart: {
			height: 305,
			type: 'bar',
			toolbar: {
				show: false,
			}
		},
		legend: {
			show: false
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '80%',
				borderRadius: 5,
				endingShape: 'rounded', // This rounds the top edges of the bars
			},
		},
		colors: ['#FFAD6A', '#5777E6', '#5CC583'],
		dataLabels: {
			enabled: false
		},
		stroke: {
			show: true,
			width: 2,
			colors: ['transparent']
		},

		series: [{
			name: 'Inprogress',
			data: [19, 65, 19, 19, 19, 19, 19]
		}, {
			name: 'Active',
			data: [89, 45, 89, 46, 61, 25, 79]
		},
		{
			name: 'Completed',
			data: [39, 39, 39, 80, 48, 48, 48]
		}],
		xaxis: {
			categories: ['15 Jan', '16 Jan', '17 Jan', '18 Jan', '19 Jan', '20 Jan', '21 Jan'],
			labels: {
				style: {
					colors: '#0C1C29',
					fontSize: '12px',
				}
			}
		},
		yaxis: {
			labels: {
				offsetX: -15,
				style: {
					colors: '#6D777F',
					fontSize: '14px',
				}
			}
		},
		grid: {
			borderColor: '#CED2D4',
			strokeDashArray: 5,
			padding: {
				left: -8,
				right: -15,
			},
		},
		fill: {
			opacity: 1
		},
		tooltip: {
			y: {
				formatter: function (val) {
					return "" + val + "%"
				}
			}
		}
	}

	var chart = new ApexCharts(
		document.querySelector("#project-chart"),
		sCol
	);

	chart.render();
}

// Production Chart
if (document.querySelector('#production_chart')) {
	var radialChart = {
		chart: {
			//height: '130px',
			//width: '100%',
			height: 130,
			type: 'radialBar',
			parentHeightOffset: 0,
			offsetX: 0,
			offsetY: 0,
			toolbar: { show: false }
		},
		plotOptions: {
			radialBar: {
				hollow: {
					margin: 10,
					size: '30%',
				},
				track: {
					background: '#F3F4F6',
					strokeWidth: '100%',
					margin: 5,
				},
				dataLabels: {
					name: {
						offsetY: -5,
					},
					value: {
						offsetY: 5,
					},
				},
			},
		},
		grid: {
			padding: {
				top: -20,
				bottom: -20,
				left: -40,
				right: -10,
			},
		},
		stroke: {
			lineCap: 'round',
		},
		colors: ['#4565E1', '#FFA253'],
		series: [70, 70],
		labels: ['Production', 'Return Manual Time'],
		responsive: [{
			breakpoint: 1200,
			options: {
				chart: {
					height: 160
				},
				plotOptions: {
					radialBar: {
						hollow: {
							size: '25%'
						}
					}
				}
			}
		}]
	};

	var chart = new ApexCharts(
		document.querySelector("#production_chart"),
		radialChart
	);
	chart.render();
}


if (document.querySelector('#deals-year')) {
	var options = {
		series: [{
			name: "Deals",
			data: [1, 2, 3, 1.5, 2.2, 4, 3.0, 2.0, 3.0, 1.8, 3.0, 6.0]
		}],
		chart: {
			height: 273,
			type: 'area',
			zoom: {
				enabled: false
			},
			toolbar: {
				show: false
			}
		},
		colors: ['#FFA201'],
		dataLabels: {
			enabled: false
		},
		stroke: {
			curve: 'straight'
		},
		fill: {
			type: 'solid',
			opacity: 0 // ✅ this removes area bg color
		},
		markers: {
			size: 5,
			shape: 'circle',
			strokeWidth: 2,
			strokeColors: '#FFA201',
			hover: {
				size: 7
			}
		},
		grid: {
			borderColor: '#E8E8E8',
			strokeDashArray: 4,      // Dashed lines
		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		},
		yaxis: {
			min: 1,
			max: 6,
			tickAmount: 5,
			labels: {
				offsetX: -15,
				formatter: (val) => {
					return val / 1 + 'K'
				}
			}
		},
		tooltip: {
			marker: false,
		},
		legend: {
			position: 'top',
			horizontalAlign: 'left'
		}
	};

	var chart = new ApexCharts(document.querySelector("#deals-year"), options);
	chart.render();
}

if (document.querySelector('#last-chart')) {
	var options = {
		series: [{
			data: [400, 220, 448,]
		}],
		chart: {
			type: 'bar',
			height: 180,
			toolbar: {
				show: false
			}
		},

		plotOptions: {
			bar: {
				horizontal: true,
			}
		},
		dataLabels: {
			enabled: false
		},
		colors: ['#EF1E1E'],
		tooltip: {
			marker: false,
		},
		grid: {
			borderColor: '#E8E8E8',
			strokeDashArray: 4,
		},
		xaxis: {
			categories: ['Conversation', 'Follow Up', 'Inpipeline'
			],
		}
	};

	var chart = new ApexCharts(document.querySelector("#last-chart"), options);
	chart.render();
}

if (document.querySelector('#won-chart')) {
	var options = {
		series: [{
			data: [400, 122, 250]
		}],
		chart: {
			type: 'bar',
			height: 180,
			toolbar: {
				show: false
			}
		},
		plotOptions: {
			bar: {
				horizontal: true,
			}
		},
		dataLabels: {
			enabled: false
		},
		colors: ['#27AE60'],
		grid: {
			borderColor: '#E8E8E8',
			strokeDashArray: 4,
		},
		tooltip: {
			marker: false,
		},
		xaxis: {
			categories: ['Conversation', 'Follow Up', 'Inpipeline'
			],
		}
	};

	var chart = new ApexCharts(document.querySelector("#won-chart"), options);
	chart.render();
}

if (document.querySelector('#deals-chart')) {
	var options = {
		series: [{
			name: "sales",
			colors: ['#FFC38F'],
			data: [{
				x: 'Inpipeline',
				y: 400,

			}, {
				x: 'Follow Up',
				y: 130
			}, {
				x: 'Schedule',
				y: 248
			}, {
				x: 'Conversation',
				y: 470
			}, {
				x: 'Won',
				y: 470
			}, {
				x: 'Lost',
				y: 180
			}]
		}],
		chart: {
			type: 'bar',
			height: 375,
			toolbar: {
				show: false
			}
		},
		dataLabels: {
			enabled: false
		},
		grid: {
			borderColor: '#E8E8E8',
			strokeDashArray: 4,
			padding: {
				right: -20 // ✅ Remove extra right padding
			}
		},
		plotOptions: {
			bar: {
				borderRadiusApplication: 'around',
				columnWidth: '50%',
			}
		},
		colors: ['#0E9384'],
		tooltip: {
			marker: false,
		},
		xaxis: {
			type: 'category',
			group: {
				style: {
					fontSize: '7px',
					fontWeight: 700,
				},
			}
		},
		yaxis: {
			labels: {
				offsetX: -13,
			}
		}

	};

	var chart = new ApexCharts(document.querySelector("#deals-chart"), options);
	chart.render();
}

if (document.querySelector('#contact-report')) {
	var options = {
		series: [{
			name: "Reports",
			data: [3, 4.5, 2.0, 3.0, 2.5, 4, 2, 4, 3.5, 5, 3, 2]
		}],
		chart: {
			height: 273,
			type: 'area',
			zoom: {
				enabled: false
			},
			toolbar: {
				show: false
			}
		},
		colors: ['#4A00E5'],
		dataLabels: {
			enabled: false
		},
		title: {
			text: '',
			align: 'left'
		},
		grid: {
			borderColor: '#E8E8E8',
			strokeDashArray: 4,
		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		},
		yaxis: {
			min: 1,
			max: 6,
			tickAmount: 5,
			labels: {
				offsetX: -15,
				formatter: (val) => {
					return val / 1 + 'K'
				}
			}
		},
		tooltip: {
			marker: false,
		},
		legend: {
			position: 'top',
			horizontalAlign: 'left'
		}
	};
	var chart = new ApexCharts(document.querySelector("#contact-report"), options);
	chart.render();
}
if (document.querySelector('#company-year')) {
	var options = {
		series: [{
			name: "Company",
			data: [15, 20, 17, 40, 22, 40, 30, 15, 55, 30, 20, 25]
		}],
		chart: {
			height: 273,
			type: 'line',
			zoom: {
				enabled: false
			}
		},
		colors: ['#FFA201'],
		dataLabels: {
			enabled: false
		},
		stroke: {
			curve: 'straight'
		},
		title: {
			text: '',
			align: 'left'
		},
		tooltip: {
			marker: false,
		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		},
		yaxis: {
			min: 10,
			max: 60,
			tickAmount: 5,
			labels: {
				formatter: (val) => {
					return val / 1 + 'K'
				}
			}
		},
		legend: {
			position: 'top',
			horizontalAlign: 'left'
		}
	};

	var chart = new ApexCharts(document.querySelector("#company-year"), options);
	chart.render();
}
// Project Report by Year

if (document.querySelector('#project-year')) {
	var options = {
		series: [{
			name: "project",
			data: [15, 20, 17, 40, 22, 40, 30, 15, 55, 30, 20, 25]
		}],
		chart: {
			height: 273,
			type: 'line',
			zoom: {
				enabled: false
			}
		},
		colors: ['#EA00B7'],
		dataLabels: {
			enabled: false
		},
		stroke: {
			curve: 'smooth'
		},
		title: {
			text: '',
			align: 'left'
		},
		tooltip: {
			marker: false,
		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		},
		yaxis: {
			min: 10,
			max: 60,
			tickAmount: 5,
			labels: {
				formatter: (val) => {
					return val / 1 + 'K'
				}
			}
		},
		legend: {
			position: 'top',
			horizontalAlign: 'left'
		}
	};

	var chart = new ApexCharts(document.querySelector("#project-year"), options);
	chart.render();
}

// Project stage Report

if (document.querySelector('#project-type')) {
	var options = {
		series: [34, 55, 50, 17],
		chart: {
			type: 'donut',
		},
		colors: ['#4A00E5', '#5CB85C', '#339DFF', '#FFA201'],
		labels: ['Plan', 'Completed', 'Develop', 'Design'],
		plotOptions: {
			pie: {
				startAngle: -90,
				endAngle: 270
			}
		},
		dataLabels: {
			enabled: false
		},
		legend: {
			position: 'bottom',
			formatter: function (val, opts) {
				return val + " - " + opts.w.globals.series[opts.seriesIndex]
			}
		},
		responsive: [{
			breakpoint: 480,
			options: {
				chart: {
					width: 200
				},
				legend: {
					position: 'bottom'
				}
			}
		}]
	};

	var chart = new ApexCharts(document.querySelector("#project-type"), options);
	chart.render();
}

// Task Report by Year

if (document.querySelector('#task-year')) {
	var options = {
		series: [{
			name: "Task",
			data: [10, 38, 18, 47, 13, 32, 15, 40, 18, 50, 30, 15]
		}],
		chart: {
			height: 273,
			type: 'line',
			zoom: {
				enabled: false
			}
		},
		colors: ['#3C2371'],
		dataLabels: {
			enabled: false
		},
		stroke: {
			curve: 'stepline'
		},
		title: {
			text: '',
			align: 'left'
		},
		tooltip: {
			marker: false,
		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		},
		yaxis: {
			min: 10,
			max: 60,
			tickAmount: 5,
			labels: {
				formatter: (val) => {
					return val / 1 + 'K'
				}
			}
		},
		legend: {
			position: 'top',
			horizontalAlign: 'left'
		}
	};

	var chart = new ApexCharts(document.querySelector("#task-year"), options);
	chart.render();
}

if (document.querySelector('#leadpiechart')) {
	var options = {
		series: [44, 55, 13, 43],
		chart: {
			height: 340,
			type: 'pie',
		},
		legend: {
			position: 'bottom'
		},
		colors: ['#2F80ED', '#27AE60', '#FFA201', '#E41F07'],
		labels: ['Inpipeline', 'Follow Up', 'Schedule Service', 'Conversation'],
		dataLabels: {
			enabled: false
		},
		responsive: [{
			breakpoint: 1199,
			options: {
				chart: {
					height: 350
				},
				legend: {
					position: 'bottom'
				}
			}
		}, {
			breakpoint: 575,
			options: {
				chart: {
					height: 280
				},
				legend: {
					position: 'bottom'
				}
			}
		}]
	};

	var chart = new ApexCharts(document.querySelector("#leadpiechart"), options);
	chart.render();

}

if (document.querySelector('#contacts-analysis')) {
	var options = {
		series: [44, 55, 41, 17],
		chart: {
			type: 'donut',
			height: 340
		},
		colors: ['#4A00E5', '#FFA201', '#0092E4', '#E41F07'],
		labels: ['Campaigns', 'Google', 'Referrals', 'Paid Social'],
		plotOptions: {
			pie: {
				startAngle: -90,
				endAngle: 270
			}
		},
		dataLabels: {
			enabled: false
		},
		legend: {
			position: 'bottom',
			formatter: function (val, opts) {
				return val + " - " + opts.w.globals.series[opts.seriesIndex]
			}
		},
		responsive: [{
			breakpoint: 1199,
			options: {
				chart: {
					height: 320
				},
				legend: {
					position: 'bottom'
				}
			}
		}, {
			breakpoint: 575,
			options: {
				chart: {
					height: 280
				},
				legend: {
					position: 'bottom'
				}
			}
		}]
	};

	var chart = new ApexCharts(document.querySelector("#contacts-analysis"), options);
	chart.render();
}

if (document.querySelector('#deal-aging')) {

	var options = {
		series: [
			{
				name: 'Won',
				data: [
					[4, 30000], [5, 35000], [6, 42000], [8, 33000],
					[12, 38000], [16, 45000], [20, 52000],
					[25, 55000], [27, 62000], [30, 48000]
				]
			},
			{
				name: 'Lost',
				data: [
					[4, 11000], [5, 21000], [7, 16000], [9, 19000],
					[11, 25000], [15, 31000], [18, 35000],
					[22, 38000], [26, 41000], [29, 54000]
				]
			}
		],

		chart: {
			type: 'scatter',
			height: 390,
			zoom: { enabled: false },
			toolbar: { show: false }
		},

		colors: ['#27AE60', '#EF1E1E'], // green & red

		legend: {
			show: false   // ❌ Remove Won / Lost text
		},

		xaxis: {
			tickAmount: 10,
			labels: {
				style: { fontSize: '14px' }
			}
		},

		yaxis: {
			tickAmount: 5,
			labels: {
				style: { fontSize: '14px' },
				formatter: function (val) {
					return '$' + (val / 1000) + 'K';
				}
			}
		},

		markers: {
			size: 7
		},

		grid: {
			borderColor: '#e5e7eb',
			strokeDashArray: 5
		},

		tooltip: {
			marker: false,
			y: {
				formatter: function (val) {
					return '$' + val.toLocaleString();
				}
			}
		}
	};

	var chart = new ApexCharts(document.querySelector("#deal-aging"), options);
	chart.render();
}

if (document.querySelector('#login-split')) {

	var options = {
		series: [
			{
				name: "Successful Logins",
				data: [400, 430, 500, 400, 405, 470, 460, 560, 480, 550]
			},
			{
				name: "Failed Logins",
				data: [160, 200, 280, 220, 230, 180, 240, 320, 240, 310]
			}
		],

		chart: {
			type: 'area',
			height: 320,
			toolbar: { show: false },
			zoom: { enabled: false }
		},

		colors: ['#27AE60', '#EF1E1E'], // green & red

		dataLabels: {
			enabled: false
		},

		stroke: {
			curve: 'smooth',
			width: 3
		},

		fill: {
			type: 'solid',
			opacity: 0.05   // light area fill like image
		},

		legend: {
			show: false   // ❌ removes Successful / Failed text
		},

		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
			labels: {
				style: { fontSize: '14px' }
			}
		},

		yaxis: {
			tickAmount: 6,
			labels: {
				style: { fontSize: '14px' }
			}
		},

		grid: {
			borderColor: '#e5e7eb',
			strokeDashArray: 6
		},

		markers: {
			size: 0   // remove circle dots (image style)
		},

		tooltip: {
			marker: false,
			shared: true,
			intersect: false
		}
	};

	var chart = new ApexCharts(document.querySelector("#login-split"), options);
	chart.render();
}

if (document.querySelector('#pipeline-stage-report')) {

	var options = {
		series: [{
			name: "Pipeline",
			data: [45, 75, 68, 80, 61]
		}],

		chart: {
			type: 'area',
			height: 340,
			toolbar: { show: false }
		},

		colors: ['#4F46E5'],

		stroke: {
			curve: 'stepline',   // ✅ important
			width: 2
		},

		fill: {
			type: 'gradient',
			opacity: 0.05       // light shaded area
		},

		dataLabels: {
			enabled: false
		},

		markers: {
			size: 0
		},
        tooltip: {
			marker: false,
		},
		xaxis: {
			categories: [
				"Quality To Buy",
				"Contact Made",
				"Presentation",
				"Proposal Made",
				"Appointment"
			],
			labels: {
				style: { fontSize: '12px' }
			}
		},

		yaxis: {
			min: 0,
			max: 100,
			tickAmount: 5,
			labels: {
				style: { fontSize: '12px' }
			}
		},

		grid: {
			borderColor: '#e5e7eb',
			strokeDashArray: 5
		},

		legend: {
			show: false
		}
	};

	var chart = new ApexCharts(
		document.querySelector("#pipeline-stage-report"),
		options
	);

	chart.render();
}

if (document.querySelector('#monthly-estimation')) {

	var options = {
		series: [{
			name: "Revenue",
			data: [420000, 580000, 720000, 650000, 820000, 930000]
		}],

		chart: {
			type: 'area',
			height: 280,
			toolbar: { show: false }
		},

		colors: ['#16A34A'], // green color

		stroke: {
			curve: 'smooth',   // ✅ smooth curve like image
			width: 4
		},

		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.7,
				opacityTo: 0.2,
				stops: [0, 90, 100]
			}
		},

		dataLabels: {
			enabled: false
		},

		markers: {
			size: 0
		},

		tooltip: {
			marker: false,
		},

		xaxis: {
			categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
			labels: {
				style: { fontSize: '12px' }
			}
		},

		yaxis: {
			min: 0,
			max: 1000000,
			tickAmount: 4,
			labels: {
				formatter: function (value) {
					return "$" + (value / 1000) + "K";
				},
				style: { fontSize: '12px' }
			}
		},

		grid: {
			borderColor: '#E5E7EB',
			strokeDashArray: 4
		},

		legend: {
			show: false
		}
	};

	var chart = new ApexCharts(
		document.querySelector("#monthly-estimation"),
		options
	);

	chart.render();
}

if (document.querySelector('#monthly_contract')) {

	var options = {
		series: [
			{
				name: "Revenue",
				type: "column",
				data: [42, 38, 45, 40, 48, 52, 47, 56, 51, 58, 60, 63]
			},
			{
				name: "Revenue Line",
				type: "line",
				data: [42, 38, 45, 40, 48, 52, 47, 56, 51, 58, 60, 63]
			}
		],

		chart: {
			height: 292,
			type: 'line',
			toolbar: { show: false }
		},

		colors: ['#F59E0B', '#F59E0B'],

		stroke: {
			width: [0, 3],
			curve: 'smooth'
		},

		plotOptions: {
			bar: {
				columnWidth: '65%',
				borderRadius: 6,
				borderRadiusApplication: 'end'
			}
		},

		fill: {
			type: ['gradient', 'solid'],
			gradient: {
				shade: 'light',
				type: 'vertical',
				gradientToColors: ['#FDBA74'],
				opacityFrom: 1,
				opacityTo: 0.25,
				stops: [0, 100]
			}
		},

		markers: {
			size: 5,
			colors: ['#FF9500'],
			strokeColors: '#ffffff',
			strokeWidth: 3
		},

		dataLabels: {
			enabled: false
		},

		xaxis: {
			categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			axisBorder: {
				show: true,
				color: '#E5E7EB'
			},
			axisTicks: {
				show: false
			},
			labels: {
				style: {
					fontSize: '12px',
					colors: '#6B7280'
				}
			}
		},

		yaxis: {
			min: 0,
			max: 70,
			tickAmount: 4,
			labels: {
				style: {
					fontSize: '12px',
					colors: '#6B7280'
				}
			}
		},

		grid: {
			show: true,
			borderColor: '#E5E7EB',
			strokeDashArray: 4,
			xaxis: {
				lines: { show: false }
			},
			yaxis: {
				lines: { show: true }
			}
		},

		legend: { show: false },

		tooltip: {
			marker: false,
			theme: 'light'
		}
	};

	var chart = new ApexCharts(
		document.querySelector("#monthly_contract"),
		options
	);

	chart.render();
}

if (document.querySelector('#retained-chart')) {

	var options = {
		series: [{
			data: [20, 35, 28, 45, 38, 55]
		}],

		chart: {
			type: 'area',
			width: 84,
			height: 48,
			sparkline: {
				enabled: true
			},
			toolbar: { show: false }
		},

		colors: ['#22C55E'],

		stroke: {
			curve: 'smooth',
			width: 3
		},

		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.4,
				opacityTo: 0.05,
				stops: [0, 100]
			}
		},

		markers: {
			size: 0,
			discrete: [{
				seriesIndex: 0,
				dataPointIndex: 5, // 👈 last point index
				fillColor: '#ffffff',
				strokeColor: '#22C55E',
				size: 4,
				strokeWidth: 2
			}]
		},

		tooltip: {
			enabled: false
		}
	};

	var chart = new ApexCharts(
		document.querySelector("#retained-chart"),
		options
	);

	chart.render();
}

if (document.querySelector('#churned-chart')) {

	var options = {
		series: [{
			data: [30, 25, 5, 25, 20, 45]
		}],

		chart: {
			type: 'area',
			width: 84,
			height: 48,
			sparkline: {
				enabled: true
			},
			toolbar: { show: false }
		},

		colors: ['#E41F07'],

		stroke: {
			curve: 'smooth',
			width: 3
		},

		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.4,
				opacityTo: 0.05,
				stops: [0, 100]
			}
		},

		markers: {
			size: 0,
			discrete: [{
				seriesIndex: 0,
				dataPointIndex: 5, // 👈 last point index
				fillColor: '#ffffff',
				strokeColor: '#E41F07',
				size: 4,
				strokeWidth: 2
			}]
		},

		tooltip: {
			enabled: false
		}
	};

	var chart = new ApexCharts(
		document.querySelector("#churned-chart"),
		options
	);

	chart.render();
}

if (document.querySelector('#performance-metrics')) {

	var options = {
		series: [85, 42, 8], // Conversion, Satisfaction, On-Time

		chart: {
			type: 'radialBar',
			height: 350
		},

		colors: ['#16A34A', '#0EA5B7', '#FACC15'],

		plotOptions: {
			radialBar: {
				startAngle: -90,
				endAngle: 90,
				hollow: {
					margin: 0,
					size: '20%',
					background: 'transparent'
				},
				track: {
					background: '#E5E7EB',
					strokeWidth: '100%',
					margin: 10
				},
				dataLabels: {
					show: false
				}
			}
		},

		stroke: {
			lineCap: 'round'
		},

		labels: [
			'Conversion Rate',
			'Client Satisfaction',
			'On-Time Delivery'
		],

		legend: {
			show: false
		}
	};

	var chart = new ApexCharts(
		document.querySelector("#performance-metrics"),
		options
	);

	chart.render();
}

if (document.querySelector('#win-rate')) {

	var options = {
		series: [{
			name: 'Win Rate',
			data: [65, 40, 70, 55, 75]
		}],

		chart: {
			type: 'radar',
			height: 340,
			toolbar: { show: false }
		},

		colors: ['#16A34A'], // green line

		stroke: {
			width: 2
		},

		fill: {
			opacity: 0.2   // light green fill
		},

		markers: {
			size: 5,
			colors: ['#16A34A'],
			strokeColor: '#ffffff',
			strokeWidth: 2
		},
		tooltip: {
			marker: false,
		},

		xaxis: {
			categories: [
				"Quality to Buy",
				"Contact Made",
				"Presentation",
				"Proposal Made",
				"Appointment"
			],
			labels: {
				style: {
					fontSize: '13px',
					color: '#1F2020'
				}
			}
		},

		yaxis: {
			min: 0,
			max: 100,
			tickAmount: 0,
			labels: {
				show: false,  // hide numbers like in image
				style: {
					fontSize: '0'
				}
			}
		},

		grid: {
			borderColor: '#e5e7eb'
		},

		legend: {
			show: false
		}
	};

	var chart = new ApexCharts(
		document.querySelector("#win-rate"),
		options
	);

	chart.render();
}

if (document.querySelector('#revenue-split-report')) {

	var options = {
		series: [
			{
				name: "Revenue A",
				type: "column",
				data: [20, 15, 45, 65, 40, 30, 48, 50, 47, 46, 46, 47]
			},
			{
				name: "Revenue B",
				type: "column",
				data: [55, 50, 28, 80, 85, 75, 85, 120, 98, 80, 68, 98]
			},
			{
				name: "Total",
				type: "line",
				data: [105, 75, 130, 170, 150, 130, 150, 190, 160, 145, 130, 165]
			}
		],

		chart: {
			height: 260,
			type: 'line',
			stacked: true,
			toolbar: { show: false }
		},

		colors: ['#18A0B6', '#158F7E', '#D4A017'],

		stroke: {
			width: [0, 0, 2],
			curve: 'smooth'
		},

		plotOptions: {
			bar: {
				columnWidth: '45%',
				borderRadius: 0
			}
		},

		markers: {
			size: 5,
			strokeWidth: 2,
			strokeColors: '#ffffff'
		},

		dataLabels: {
			enabled: false
		},

		tooltip: {
			marker: false,
		},

		xaxis: {
			categories: [
				"Jan", "Feb", "Mar", "Apr", "May", "Jun",
				"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
			],
			labels: {
				style: { fontSize: '13px' }
			}
		},

		yaxis: {
			min: 0,
			max: 250,
			tickAmount: 5,
			labels: {
				formatter: function (val) {
					return "$" + val + "K";
				},
				style: { fontSize: '12px' }
			}
		},

		grid: {
			borderColor: '#e5e7eb',
			strokeDashArray: 5
		},

		legend: {
			show: false
		}
	};

	var chart = new ApexCharts(
		document.querySelector("#revenue-split-report"),
		options
	);

	chart.render();
}

if (document.querySelector('#growth')) {

	var options = {
		series: [75, 55],

		chart: {
			type: 'radialBar',
			height: 279,          // 🔥 increased height
			offsetY: -10,         // 🔥 removes top empty space
			sparkline: {
				enabled: true       // 🔥 removes default padding
			}
		},

		colors: ['#2F6FD4', '#E4570F'],

		plotOptions: {
			radialBar: {
				startAngle: -140,
				endAngle: 220,

				hollow: {
					size: '60%',      // 🔥 bigger inner hole
				},

				track: {
					background: '#E5E7EB',
					strokeWidth: '100%',
					margin: 6       // 🔥 spacing between rings
				},

				dataLabels: {
					show: false
				}
			}
		},

		stroke: {
			lineCap: 'round',
			width: 8              // 🔥 thicker ring
		},

		grid: {
			padding: {
				top: -20,
				bottom: -20
			}
		},

		legend: {
			show: false
		}
	};

	var chart = new ApexCharts(
		document.querySelector("#growth"),
		options
	);

	chart.render();
}

if (document.querySelector('#attendance-status')) {

	var options = {
		series: [45, 3, 5, 23], // Approved, Pending, Declined, Request

		chart: {
			type: 'donut',
			height: 350
		},

		colors: ['#22C55E', '#F59E0B', '#EF4444', '#3B82F6'],

		labels: ['Approved', 'Pending', 'Declined', 'Request'],

		plotOptions: {
			pie: {
				expandOnClick: false,
				donut: {
					size: '65%'   // controls inner circle size
				}
			}
		},

		dataLabels: {
			enabled: false
		},

		legend: {
			show: false   // ❌ remove legend
		},

		tooltip: {
			y: {
				formatter: function (val) {
					return val;
				}
			}
		},

		stroke: {
			width: 8,              // gap between segments
			colors: ['#ffffff']    // white spacing like image
		},

		responsive: [{
			breakpoint: 575,
			options: {
				chart: {
					height: 280
				}
			}
		}]
	};

	var chart = new ApexCharts(document.querySelector("#attendance-status"), options);
	chart.render();
}

if (document.querySelector('#risk-level')) {

	var options = {
		series: [16, 67, 24, 34], // Approved, Pending, Declined, Request

		chart: {
			type: 'donut',
			height: 350
		},

		colors: ['#DD2590', '#E2B93B', '#EF1E1E', '#27AE60'],

		labels: ['Critical', 'Medium', 'High', 'Low'],

		plotOptions: {
			pie: {
				expandOnClick: false,
				donut: {
					size: '60%'   // controls inner circle size
				}
			}
		},

		dataLabels: {
			enabled: false
		},

		legend: {
			show: false   // ❌ remove legend
		},

		tooltip: {
			y: {
				formatter: function (val) {
					return val;
				}
			}
		},

		stroke: {
			width: 8,              // gap between segments
			colors: ['#ffffff']    // white spacing like image
		},

		responsive: [{
			breakpoint: 575,
			options: {
				chart: {
					height: 230
				}
			}
		}]
	};

	var chart = new ApexCharts(document.querySelector("#risk-level"), options);
	chart.render();
}

if (document.querySelector('#project-stage')) {
	var options = {
		series: [
			{
				name: "",
				data: [1200, 1000, 800, 600, 400, 200],
			},
		],
		chart: {
			type: 'bar',
			height: 420,
			toolbar: {
				show: false
			}
		},

		plotOptions: {
			bar: {
				borderRadius: 0,
				horizontal: true,
				distributed: true,
				barHeight: '100%',
				isFunnel: true,
			},

		},
		colors: [
			'#3538CD',
			'#06AED4',
			'#FFA201',
			'#0E9384',
			'#27AE60',
			'#E41F07',
		],

		dataLabels: {
			enabled: true,
			formatter: function (val, opt) {
				return opt.w.globals.labels[opt.dataPointIndex]
			},
			dropShadow: {
				enabled: true,
			},

		},
		tooltip: {
			marker: false,
		},
		xaxis: {
			categories: ['Inpipeline : 1454', 'Follow Up : 1454', 'Schedule service : 1454', 'Conversation : 1454', 'Win : 1454', 'Lost : 1454'],
		},
		legend: {
			show: false,
		},
	};

	var chart = new ApexCharts(document.querySelector("#project-stage"), options);
	chart.render();
}

// Leads-chart
if (document.querySelector('#leads-chart')) {
	var options = {
		series: [{
			name: "sales",
			colors: ['#BEA4F2'],
			data: [{
				x: 'Inpipeline',
				y: 400,

			}, {
				x: 'Follow Up',
				y: 30
			}, {
				x: 'Schedule',
				y: 248
			}, {
				x: 'Conversation',
				y: 470
			}, {
				x: 'Won',
				y: 470
			}, {
				x: 'Lost',
				y: 180
			}]
		}],
		chart: {
			type: 'bar',
			height: 310,
			toolbar: {
				show: false,
			},
		},
		grid: {
			borderColor: '#E8E8E8',
			strokeDashArray: 4,
			padding: {
				right: -20 // ✅ Remove extra right padding
			}
		},
		plotOptions: {
			bar: {
				columnWidth: '30%',
				borderRadiusApplication: 'around',
			}
		},
		colors: ['#00918E'],
		yaxis: {
			labels: {
				offsetX: -13,
			}
		}

	};

	var chart = new ApexCharts(document.querySelector("#leads-chart"), options);
	chart.render();
}

if (document.querySelector('#last-chart-2')) {
	var options = {
		series: [{
			data: [400, 220, 448,]
		}],
		chart: {
			type: 'bar',
			height: 150,
			toolbar: {
				show: false
			}
		},

		plotOptions: {
			bar: {
				horizontal: true,
			}
		},
		dataLabels: {
			enabled: false
		},
		colors: ['#FC0027'],
		xaxis: {
			categories: ['Conversation', 'Follow Up', 'Inpipeline'
			],
		}
	};

	var chart = new ApexCharts(document.querySelector("#last-chart-2"), options);
	chart.render();
}

if (document.querySelector('#profit-chart')) {
	var sCol = {
		chart: {
			width: "100%",
			height: 50,
			type: 'bar',
			toolbar: { show: false },
			sparkline: { enabled: true }
		},
		dataLabels: { enabled: false },
		series: [{
			name: 'Profit',
			data: [30, 35, 38, 90, 40, 38, 30, 20, 30, 80, 85, 85] // You can adjust these
		}],
		colors: ['#E41F07'],
		plotOptions: {
			bar: {
				columnWidth: '30%',
				borderRadius: 4,
				borderRadiusWhenStacked: 'all',
				borderRadiusApplication: 'around', // Ensures top-only rounding for vertical bars
				endingShape: 'around',
				colors: {
					backgroundBarColors: ['#E8E8E8'], // Background color for bars
					backgroundBarOpacity: 0.5,
					backgroundBarRadius: 4,
					hover: {
						enabled: true,
						borderColor: '#F26522', // Color when hovering over the bar
					}
				}
			},
		},
		xaxis: {
			labels: { show: false },
			axisTicks: { show: false },
			axisBorder: { show: false }
		},
		yaxis: { show: false },
		grid: { show: false, },
		tooltip: { enabled: true, marker: false }
	};

	var chart = new ApexCharts(document.querySelector("#profit-chart"), sCol);
	chart.render();
}

if (document.querySelector('#contact-chart')) {
	var sCol = {
		chart: {
			width: 73,
			height: 50,
			type: 'bar',
			toolbar: { show: false },
			sparkline: { enabled: true }
		},
		dataLabels: { enabled: false },
		series: [{
			name: 'Contacts',
			data: [100, 80, 70, 80, 85, 80, 85] // You can adjust these
		}],
		colors: ['#FAD2CD'],
		plotOptions: {
			bar: {
				columnWidth: '40%',
				borderRadius: 0,
				borderRadiusWhenStacked: 'all',
			},
		},
		xaxis: {
			labels: { show: false },
			axisTicks: { show: false },
			axisBorder: { show: false }
		},
		yaxis: { show: false },
		grid: { show: false, },
		tooltip: { enabled: true, marker: false },
		states: {
			hover: {
				filter: {
					type: 'darken',
					value: 0.8
				}
			}
		}			
	};

	var chart = new ApexCharts(document.querySelector("#contact-chart"), sCol);
	chart.render();
}

// Pipeline chart
if (document.querySelector('#pipelineChart')) {
	var options = {
		series: [{
			name: 'Deals',
			data: [100, 80, 70, 60] // 4 bars
		}],
		chart: {
			type: 'bar',
			height: 62,
			width: '100%',
			toolbar: { show: false },
			sparkline: { enabled: true }, // removes chart padding
			parentHeightOffset: 0
		},
		plotOptions: {
			bar: {
				distributed: true,        // 
				horizontal: false,
				columnWidth: '90%', // 100% / number of bars
				borderRadius: 0
			}
		},
		colors: ['#E41F07', '#FFA201', '#800080', '#27AE60'],
		xaxis: {
			categories: ['Leads', 'Proposal', 'Sales', 'Won'], // required when distributed is false
			labels: { show: false },
			axisTicks: { show: false },
			axisBorder: { show: false },
		},
		yaxis: { show: false },
		grid: { show: false },
		tooltip: { enabled: true, marker: false }
	};


	const chart4 = new ApexCharts(document.querySelector("#pipelineChart"), options);
	chart4.render();
}


if (document.querySelector('#performance-stats')) {
	const options2 = {
		series: [{
			name: 'Revenue',
			data: [35, 20, 50, 50, 58, 40, 40, 10, 50, 30, 28, 20],
			type: 'bar',
		}, {
			name: 'Sales',
			data: [15, 20, 15, 20, 25, 40, 35, 30, 40, 32, 28, 30],
			type: 'area',
		}],
		chart: {
			height: 355,
			type: 'line',
			toolbar: {
				show: false,
			},
			background: 'none',
			fill: "#fff",
		},
		plotOptions: {
			bar: {
				borderRadius: 2,
				columnWidth: '60%',
			}
		},
		grid: {
			padding: {
				right: -10,
				left: -15
			},
			borderColor: "#f1f1f1",
			strokeDashArray: 2,
			xaxis: {
				lines: {
					show: true
				}
			},
			yaxis: {
				lines: {
					show: false
				}
			}
		},
		background: 'transparent',
		dataLabels: {
			enabled: false
		},
		stroke: {
			curve: 'smooth',
			width: [0, 0],
			dashArray: [0, 0]
		},
		legend: {
			show: false,
			position: 'bottom',
			markers: {
				width: 8,
				height: 8,
			},
			onItemClick: {
				toggleDataSeries: false   // 👈 add here to stop hiding on click
			}
		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			axisBorder: {
				show: false,
				color: 'rgba(119, 119, 142, 0.05)',
				offsetX: 0,
				offsetY: 0,
			},
			axisTicks: {
				show: false,
				borderType: 'solid',
				color: 'rgba(119, 119, 142, 0.05)',
				width: 6,
				offsetY: 0
			},
			labels: {
				show: false,
			}
		},
		fill: {
			type: ['gradient', 'solid'], // Gradient for Bar, Solid for Area
			gradient: {
				type: 'vertical', // 'vertical' usually looks best for bars
				shadeIntensity: 1,
				opacityFrom: 1,
				opacityTo: 1,
				colorStops: [
					[
						{ offset: 0, color: "#E41F07", opacity: 1 },
						{ offset: 100, color: "#FF3A22", opacity: 1 }
					],
					[
						{ offset: 0, color: "#F0F0F0", opacity: 1 } // Fallback for area
					]
				]
			},
			// This ensures the second series (Area) uses the hex color
			colors: ['E41F07', '#F0F0F0']
		},
		yaxis: {
			min: 0,
			max: 60,    // Forces the end at 60,000
			tickAmount: 6, // Optional: creates steps of 10k (0, 10k, 20k...)
			labels: {
				offsetX: -10,
				// Formatter to add the '$' and 'k' suffix
				formatter: function (value) {
					return "$" + value + "k";
				}
			}
		},
		tooltip: {
			marker: false,
			x: {
				format: 'dd/MM/yy HH:mm'
			},
		},
	};
	const chart4 = new ApexCharts(document.querySelector("#performance-stats"), options2);
	chart4.render();
}


if (document.querySelector('#deals-won')) {

    var options = {
        series: [75, 45], // Outer value, Inner value

        chart: {
            type: 'radialBar',
			width: 220,
            sparkline: { enabled: true }
        },

        plotOptions: {
            radialBar: {

                startAngle: 0,
                endAngle: 360, // ✅ Full Circle

                track: {
                    background: "#E5E7EB",
                    strokeWidth: '100%',
                    margin: 12 // spacing between bars
                },

				grid: {
					padding: {
						top: -10,
						bottom: -10,
						left: -10,
						right: -10
					}
				},

                hollow: {
                    size: '20%' // center hole size
                },

                dataLabels: {
                    show: false // hide center text
                }
            }
        },

        colors: ['#F59E0B', '#E41F07'], // Orange (outer), Red (inner)

        stroke: {
            lineCap: 'round'
        },
        fill: {
            type: 'solid'
        },

        legend: {
            show: false
        }
    };

    var chart = new ApexCharts(
        document.querySelector("#deals-won"),
        options
    );

    chart.render();
}
//Deal Chart
if (document.querySelector('#deal-chart')) {
	var options = {
		series: [{
			name: 'Sales',
			data: [2, 4, 1.5, 3.8, 5, 3, 4, 2, 6, 5, 4, 3]
		}],
		chart: {
			type: 'area',
			height: 330,
			// Note: sparkline: true hides axes. Set to false to show Jan-Dec labels.
			sparkline: {
				enabled: false
			},
			toolbar: {
				show: false
			}
		},
		stroke: {
			curve: 'smooth',
			width: 2
		},
		colors: ['#E41F07'],
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		},
		yaxis: {
			labels: {
				offsetX: -10,
				formatter: function (value) {
					return value + "k";
				}
			}
		},
		tooltip: {
			marker: false,
			x: {
				show: true // Shows the month in tooltip
			},
			y: {
				padding: 0,
				formatter: function (value) {
					return value + "k"; // Shows '1k' in tooltip
				},
				title: {
					formatter: function () {
						return ''; // Keeps the series name hidden as per your request
					}
				}
			},
		},
		grid: {
			padding: {
				left: 0,   // Removes padding inside the grid
				right: 0
			},
			borderColor: '#e0e0e0',
			strokeDashArray: 5, // Higher number = longer dashes
			position: 'back',
			yaxis: {
				lines: {
					show: true // Horizontal dashed lines
				}
			}
		},
		dataLabels: {
			enabled: false // This removes the numbers from the markers
		},
	};

	var chart = new ApexCharts(document.querySelector("#deal-chart"), options);
	chart.render();
}


//Deal Size
if (document.querySelector('#deal-size')) {
	var options = {
		series: [{
			name: 'Sales',
			data: [10, 10, 20, 28, 15, 10, 20]
		}],
		chart: {
			type: 'area',
			height: 330,
			// Note: sparkline: true hides axes. Set to false to show Jan-Dec labels.
			sparkline: {
				enabled: false
			},
			toolbar: {
				show: false
			}
		},
		stroke: {
			curve: 'stepline',
			width: 2
		},
		fill: {
			type: 'solid',
			opacity: 0 // Ensures no background color is visible
		},
		colors: ['#3C2371'],
		xaxis: {
			categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
		},
		yaxis: {
			min: 5,
			max: 30,
			tickAmount: 5,
			labels: {
				offsetX: -10,
				formatter: function (value) {
					return value + "k";
				}
			}
		},
		tooltip: {
			marker: false,
			x: {
				show: true // Shows the month in tooltip
			},
			y: {
				padding: 0,
				formatter: function (value) {
					return value + "k"; // Shows '1k' in tooltip
				},
				title: {
					formatter: function () {
						return ''; // Keeps the series name hidden as per your request
					}
				}
			},
		},
		grid: {
			padding: {
				left: 20,   // Removes padding inside the grid
				right: 0
			},
			borderColor: '#e0e0e0',
			strokeDashArray: 5, // Higher number = longer dashes
			position: 'back',
			yaxis: {
				labels: {
					align: 'left',    // Aligns text to the far left
					offsetX: 40,
				},
				lines: {
					show: true // Horizontal dashed lines
				}
			}
		},
		dataLabels: {
			enabled: false // This removes the numbers from the markers
		},
	};

	var chart = new ApexCharts(document.querySelector("#deal-size"), options);
	chart.render();
}

if (document.querySelector('#mtd-revenue')) {
	var sCol = {
		chart: {
			width: 66,
			height: 50,
			type: 'bar',
			toolbar: { show: false },
			sparkline: { enabled: true }
		},
		dataLabels: { enabled: false },
		series: [{
			name: 'Revenue',
			data: [60, 100, 20, 80, 75] // You can adjust these
		}],
		fill: {
			type: 'gradient',
			gradient: {
				type: 'vertical',
				shadeIntensity: 0,
				inverseColors: false, // Ensure top stays top and bottom stays bottom
				opacityFrom: 1,
				opacityTo: 1,
				stops: [0, 100],
				colorStops: [
					{
						offset: 0,
						color: "#D2CAF0", // Top Color (100% in your CSS)
						opacity: 1
					},
					{
						offset: 100,
						color: "#E7E3F7", // Bottom Color (0% in your CSS)
						opacity: 1
					}
				]
			}
		},

		plotOptions: {
			bar: {
				columnWidth: '40%',
				borderRadius: 0,
				borderRadiusWhenStacked: 'all',
			},
		},
		xaxis: {
			labels: { show: false },
			axisTicks: { show: false },
			axisBorder: { show: false }
		},
		yaxis: { show: false },
		grid: { show: false, },
		tooltip: { enabled: true, marker: false },
		states: {
			hover: {
				filter: {
					type: 'darken',
					value: 0.8
				}
			}
		}
	};

	var chart = new ApexCharts(document.querySelector("#mtd-revenue"), sCol);
	chart.render();
}


if (document.querySelector('#ytd-revenue')) {
	var sCol = {
		chart: {
			width: 66,
			height: 50,
			type: 'bar',
			toolbar: { show: false },
			sparkline: { enabled: true }
		},
		dataLabels: { enabled: false },
		series: [{
			name: 'Revenue',
			data: [50, 30, 70, 100, 40] // You can adjust these
		}],
		fill: {
			type: 'gradient',
			gradient: {
				type: 'vertical',
				shadeIntensity: 0,
				inverseColors: false, // Ensure top stays top and bottom stays bottom
				opacityFrom: 1,
				opacityTo: 1,
				stops: [0, 100],
				colorStops: [
					{
						offset: 0,
						color: "#D2CAF0", // Top Color (100% in your CSS)
						opacity: 1
					},
					{
						offset: 100,
						color: "#E7E3F7", // Bottom Color (0% in your CSS)
						opacity: 1
					}
				]
			}
		},

		plotOptions: {
			bar: {
				columnWidth: '40%',
				borderRadius: 0,
				borderRadiusWhenStacked: 'all',
			},
		},
		xaxis: {
			labels: { show: false },
			axisTicks: { show: false },
			axisBorder: { show: false }
		},
		yaxis: { show: false },
		grid: { show: false, },
		tooltip: { enabled: true, marker: false },
		states: {
			hover: {
				filter: {
					type: 'darken',
					value: 0.8
				}
			}
		}
	};

	var chart = new ApexCharts(document.querySelector("#ytd-revenue"), sCol);
	chart.render();
}

//Deal Chart
if (document.querySelector('#forecast-chart')) {
	var options = {
		series: [{
			name: 'Forecast',
			data: [170, 40, 80, 50, 90, 60, 80, 70, 120, 110, 200, 90]
		}, {
			name: 'Target',
			data: [260, 170, 170, 250, 150, 120, 100, 100, 320, 330, 340, 120]
		}],
		chart: {
			type: 'area',
			height: 244,
			// Note: sparkline: true hides axes. Set to false to show Jan-Dec labels.
			sparkline: {
				enabled: false
			},
			toolbar: {
				show: false
			}
		},
		legend: {
			show: false
		},
		stroke: {
			curve: 'straight',
			width: 2
		},
		colors: ['#7F24E3', '#27AE60'],
		markers: {
			size: 5,               // Size of the circle
			colors: ['#7F24E3', '#6FD195'], // Match your Forecast/Target colors
			strokeColors: '#fff',  // White border around the circle
			strokeWidth: 2,
			hover: {
				size: 7,             // Circle gets slightly larger on hover
			}
		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		},
		yaxis: {
			min: 0,
			max: 450,
			tickAmount: 5,
			labels: {
				offsetX: -10,
				formatter: function (value) {
					return value + "k";
				}
			}
		},
		tooltip: {
			marker: false,
			x: {
				show: true // Shows the month in tooltip
			},
			y: {
				padding: 0,
				formatter: function (value) {
					return value + "k"; // Shows '1k' in tooltip
				},
				title: {
					formatter: function () {
						return ''; // Keeps the series name hidden as per your request
					}
				}
			},
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 0,
				type: 'vertical',
				inverseColors: false,
				opacityFrom: [1, 0.3], // High opacity at top for Forecast, 0.3 for Target
				opacityTo: 0.05,        // Low opacity at bottom for both
				stops: [0, 100],
				colorStops: [
					[
						{ offset: 0, color: "#7F24E3", opacity: 1 },
						{ offset: 100, color: "#E8E8E8", opacity: 0.05 }
					],
					[
						{ offset: 0, color: "#6FD195", opacity: 0.3 },
						{ offset: 100, color: "#6FD195", opacity: 0.05 }
					]
				]
			}
		},
		grid: {
			padding: {
				left: 0,   // Removes padding inside the grid
				right: 0,
				top: -25
			},
			borderColor: '#e0e0e0',
			strokeDashArray: 5, // Higher number = longer dashes
			position: 'back',
			xaxis: {
				lines: {
					show: true // THIS ENABLES THE VERTICAL LINES
				}
			},
			yaxis: {
				lines: {
					show: true // Horizontal lines for 0, 90, 180...
				}
			},
		},
		dataLabels: {
			enabled: false // This removes the numbers from the markers
		},
	};

	var chart = new ApexCharts(document.querySelector("#forecast-chart"), options);
	chart.render();
}


if (document.querySelector('#top-deals')) {
	var options = {
		series: [{
			data: [70, 60, 40, 50, 35, 15]
		}],
		chart: {
			type: 'bar',
			height: 300,
			toolbar: {
				show: false
			}
		},

		plotOptions: {
			bar: {
				horizontal: true,
			}
		},
		dataLabels: {
			enabled: false
		},
		fill: {
			type: 'gradient',
			gradient: {
				type: 'vertical',
				shadeIntensity: 0,
				inverseColors: false, // Ensure top stays top and bottom stays bottom
				opacityFrom: 1,
				opacityTo: 1,
				stops: [0, 100],
				colorStops: [
					{
						offset: 0,
						color: "#175FFF", // Top Color (100% in your CSS)
						opacity: 1
					},
					{
						offset: 100,
						color: "#A8C4FF", // Bottom Color (0% in your CSS)
						opacity: 1
					}
				]
			}
		},
		grid: {
			borderColor: '#E8E8E8',
			strokeDashArray: 4,
		},
		tooltip: {
			marker: false,
		},
		xaxis: {
			categories: ['Brooklyn', 'Kathryn ', 'Richards', 'Robert', 'Bessie', 'Floyd'
			],
		}
	};

	var chart = new ApexCharts(document.querySelector("#top-deals"), options);
	chart.render();
}


if (document.querySelector('#usage-chart')) {
	var donutChart = {
		series: [50, 15, 20, 15],
		chart: {
			height: 350,
			type: 'donut',
		},
		colors: ['#3538cd', '#71d1fb', '#f9b801', '#dd2590'],
		stroke: {
			show: true,
			width: 5,
			colors: ['#fff']
		},
		plotOptions: {
			pie: {
				donut: {
					size: '65%',
					labels: {
						show: true,
						name: {
							show: true,
							fontSize: '14px',        // Updated: text-gray-900 approximate size
							fontWeight: 500,
							color: '#111827',        // Updated: Tailwind text-gray-900 hex code
							offsetY: -10
						},
						value: {
							show: true,
							fontSize: '18px',        // Updated: Percent font size
							fontWeight: 700,
							color: '#111827',        // Updated: Dark color text
							offsetY: 5,
							formatter: function (val) {
								return val + "%";
							}
						},
						total: {
							show: true,
							label: 'Leads',
							color: '#111827',
							fontSize: '14px',
							formatter: function (w) {
								// Returns the sum or a specific value
								return '50%';
							}
						}
					}
				}
			}
		},
		dataLabels: {
			enabled: false
		},
		legend: {
			show: false
		},
		tooltip: {
			enabled: true
		}
	};

	var donut = new ApexCharts(
		document.querySelector("#usage-chart"),
		donutChart
	);

	donut.render();
}


// Usage Chart
if (document.querySelector('#Usage-chart')) {
	var options = {
		series: [{
			name: "Users",
			// Adjust these data points to match the wave in your image
			data: [200, 195, 185, 160, 200, 175, 155, 210, 160]
		}],
		chart: {
			height: 250,
			type: 'area',
			toolbar: { show: false },
			zoom: { enabled: false },
			sparkline: { enabled: false }
		},
		// The soft orange color from your screenshot
		colors: ['#EEB68D'],
		dataLabels: {
			enabled: false
		},
		stroke: {
			show: true,
			curve: 'smooth',
			width: 2,
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.7,
				opacityTo: 0.1,
				// This creates the "fading down" look
				stops: [0, 90, 100]
			}
		},
		grid: {
			show: true,
			borderColor: '#E2E2E2',
			strokeDashArray: 3, // Makes the grid lines dashed like the screenshot
			xaxis: {
				lines: { show: true } // Enables vertical dashed lines
			},
			yaxis: {
				lines: { show: false }, // Removes horizontal lines
			},
			padding: {
				left: 0,
				right: 0,
				bottom: -10
			}
		},
		xaxis: {
			categories: ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', ''],
			labels: {
				style: {
					colors: '#94A3B8',
					fontSize: '14px'
				}
			},
			axisBorder: { show: false },
			axisTicks: { show: false }
		},
		yaxis: {
			min: 0,
			max: 200,
			tickAmount: 4,
			labels: {
				style: {
					colors: '#94A3B8',
					fontSize: '14px'
				},
				offsetX: -10
			}
		},
		tooltip: {
			enabled: true,
			theme: 'dark', // Matches the black tooltip in the screenshot
			custom: function ({ series, seriesIndex, dataPointIndex, w }) {
				return '<div class="custom-tooltip">' +
					'<span>' + series[seriesIndex][dataPointIndex] + ' Users</span>' +
					'</div>'
			},
			x: { show: false },
			marker: { show: false }
		}
	};

	var chart = new ApexCharts(document.querySelector("#Usage-chart"), options);
	chart.render();
}

// Leads Chart
if (document.querySelector('#leads-funnel-chart')) {
	var options = {
		series: [{
			name: "Leads",
			data: [800, 600, 400, 300, 200, 100]
		}],
		chart: {
			type: 'bar',
			height: 470,
			toolbar: { show: false }
		},
		plotOptions: {
			bar: {
				columnWidth: "80%",
				borderRadius: 12,
				distributed: true,
				dataLabels: { position: 'top' },
			}
		},
		// 1px Light Border as seen in your screenshot
		stroke: {
			show: true,
			width: 1,
			colors: ['#E0E0E0']
		},
		colors: [
			"#FFE0B2", "#FFE0B2",
			"#FFA201", // QUALIFIED - Solid Color
			"#FFE0B2", "#FFE0B2", "#FFE0B2"
		],
		fill: {
			type: 'gradient',
			gradient: {
				shade: 'light',
				type: 'vertical',
				shadeIntensity: 0.5,
				inverseColors: false,
				opacityFrom: 1,
				// Bar index 2 (Qualified) is solid (1 to 1), others fade (1 to 0.3)
				opacityTo: [0.3, 0.3, 1, 0.3, 0.3, 0.3],
				stops: [0, 100]
			}
		},
		dataLabels: {
			enabled: true,
			offsetY: -25,
			style: {
				fontSize: "13px",
				fontWeight: 600,
				colors: ["#333"]
			},
			formatter: function (val, opts) {
				const percents = ['33.7%', '25.28%', '16.85%', '11.24%', '8.43%', '4.49%'];
				return percents[opts.dataPointIndex];
			}
		},
		xaxis: {
			categories: ['New', 'Contacted', 'Qualified', 'Converted', 'Won', 'Lost'],
			axisBorder: { show: false },
			axisTicks: { show: false },
			labels: {
				style: { fontSize: '14px', fontWeight: 600, colors: '#1f2020' }
			}
		},
		yaxis: { show: false },
		grid: { show: false },
		legend: { show: false },
		annotations: {
			points: [
				{ x: "New", y: 40, marker: { size: 0 }, label: { text: "800 Leads", borderWidth: 0, style: { background: "transparent", color: "#666" } } },
				{ x: "Contacted", y: 40, marker: { size: 0 }, label: { text: "600 Leads", borderWidth: 0, style: { background: "transparent", color: "#666" } } },
				{ x: "Qualified", y: 40, marker: { size: 0 }, label: { text: "400 Leads", borderWidth: 0, style: { background: "transparent", color: "#fff", fontWeight: 700 } } },
				{ x: "Converted", y: 40, marker: { size: 0 }, label: { text: "300 Leads", borderWidth: 0, style: { background: "transparent", color: "#666" } } },
				{ x: "Won", y: 40, marker: { size: 0 }, label: { text: "200 Leads", borderWidth: 0, style: { background: "transparent", color: "#666" } } },
				{ x: "Lost", y: 40, marker: { size: 0 }, label: { text: "100 Leads", borderWidth: 0, style: { background: "transparent", color: "#666" } } }
			]
		}
	};

	var chart = new ApexCharts(document.querySelector("#leads-funnel-chart"), options);
	chart.render();
}

// Mountain-style Failed IT Dashboard
if (document.querySelector('#total-chart')) {
	var options = {
		series: [{
			name: "performance",
			// Peaks and valleys to create the mountain look
			data: [10, 85, 15, 45, 20, 50, 80, 15]
		}],
		chart: {
			height: 45,
			width: 80, // Fixed height at 50px
			type: 'area',
			toolbar: { show: false },
			zoom: { enabled: false },
			// sparkline: true hides all X/Y axes, labels, and grid lines automatically
			sparkline: { enabled: true }
		},
		colors: ['#5DB48A'], // Pink color from your screenshot
		stroke: {
			show: true,
			curve: 'straight', // Sharp mountain peaks
			width: 2
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.6,
				opacityTo: 0.1,
				stops: [0, 90, 100]
			}
		},
		// Ensure all axes and grids are off for a clean look
		grid: { show: false },
		xaxis: { labels: { show: false }, axisBorder: { show: false } },
		yaxis: { show: false },
		tooltip: { enabled: true }
	};

	var chart = new ApexCharts(document.querySelector("#total-chart"), options);
	chart.render();
}

// Mountain-style Failed IT Dashboard
if (document.querySelector('#average-chart')) {
	var options = {
		series: [{
			name: "performance",
			// Peaks and valleys to create the mountain look
			data: [20, 45, 85, 25, 40, 30, 80, 25]
		}],
		chart: {
			height: 45,
			width: 80, // Fixed height at 50px
			type: 'area',
			toolbar: { show: false },
			zoom: { enabled: false },
			// sparkline: true hides all X/Y axes, labels, and grid lines automatically
			sparkline: { enabled: true }
		},
		colors: ['#2F80ED'], // Pink color from your screenshot
		stroke: {
			show: true,
			curve: 'straight', // Sharp mountain peaks
			width: 2
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.6,
				opacityTo: 0.1,
				stops: [0, 90, 100]
			}
		},
		// Ensure all axes and grids are off for a clean look
		grid: { show: false },
		xaxis: { labels: { show: false }, axisBorder: { show: false } },
		yaxis: { show: false },
		tooltip: { enabled: true }
	};

	var chart = new ApexCharts(document.querySelector("#average-chart"), options);
	chart.render();
}

// Mountain-style Failed IT Dashboard
if (document.querySelector('#within-chart')) {
	var options = {
		series: [{
			name: "performance",
			// Peaks and valleys to create the mountain look
			data: [20, 35, 65, 25, 80, 80, 40, 25]
		}],
		chart: {
			height: 45,
			width: 80, // Fixed height at 50px
			type: 'area',
			toolbar: { show: false },
			zoom: { enabled: false },
			// sparkline: true hides all X/Y axes, labels, and grid lines automatically
			sparkline: { enabled: true }
		},
		colors: ['#E2B93B'], // Pink color from your screenshot
		stroke: {
			show: true,
			curve: 'straight', // Sharp mountain peaks
			width: 2
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.6,
				opacityTo: 0.1,
				stops: [0, 90, 100]
			}
		},
		// Ensure all axes and grids are off for a clean look
		grid: { show: false },
		xaxis: { labels: { show: false }, axisBorder: { show: false } },
		yaxis: { show: false },
		tooltip: { enabled: true }
	};

	var chart = new ApexCharts(document.querySelector("#within-chart"), options);
	chart.render();
}

// Mountain-style Failed IT Dashboard
if (document.querySelector('#breach-chart')) {
	var options = {
		series: [{
			name: "performance",
			// Peaks and valleys to create the mountain look
			data: [20, 85, 75, 25, 40, 30, 80, 25]
		}],
		chart: {
			height: 45,
			width: 80, // Fixed height at 50px
			type: 'area',
			toolbar: { show: false },
			zoom: { enabled: false },
			// sparkline: true hides all X/Y axes, labels, and grid lines automatically
			sparkline: { enabled: true }
		},
		colors: ['#EB7487'], // Pink color from your screenshot
		stroke: {
			show: true,
			curve: 'straight', // Sharp mountain peaks
			width: 2
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.6,
				opacityTo: 0.1,
				stops: [0, 90, 100]
			}
		},
		// Ensure all axes and grids are off for a clean look
		grid: { show: false },
		xaxis: { labels: { show: false }, axisBorder: { show: false } },
		yaxis: { show: false },
		tooltip: { enabled: true }
	};

	var chart = new ApexCharts(document.querySelector("#breach-chart"), options);
	chart.render();
}

// Risk Level Split Chart
if (document.querySelector('#risk-level-chart')) {
	var options = {
		series: [240, 670, 340, 160],
		chart: {
			height: 300,
			type: 'donut',
		},
		labels: ['High', 'Medium', 'Low', 'Critical'],
		colors: ['#F13535', '#E2B93B', '#27AE60', '#DD2590'],
		legend: {
			show: false
		},
		dataLabels: {
			enabled: false
		},
		plotOptions: {
			pie: {
				donut: {
					size: '65%'
				}
			}
		}
	};

	var chart = new ApexCharts(document.querySelector("#risk-level-chart"), options);
	chart.render();
}

// Aging Bucket Split Chart
if (document.querySelector('#aging-bucket-chart')) {
	var options = {
		series: [{
			name: 'Leads',
			data: [540, 740, 580, 360]
		}],
		chart: {
			type: 'bar',
			height: 380,
			toolbar: { show: false }
		},
		plotOptions: {
			bar: {
				horizontal: true,
				barHeight: '70%',
				borderRadius: 10,
				borderRadiusApplication: 'end',
			},
		},
		colors: ['#FF9292'],
		fill: {
			type: 'gradient',
			gradient: {
				shade: 'light',
				type: "horizontal",
				shadeIntensity: 0.25,
				gradientToColors: undefined,
				inverseColors: true,
				opacityFrom: 0.1,
				opacityTo: 1,
				stops: [0, 100]
			}
		},
		dataLabels: { enabled: false },
		xaxis: {
			categories: ['0-2 Days', '3-7 Days', '8-14 Days', '15+ Days'],
			min: 0,
			max: 800,
			tickAmount: 8, // Creates intervals of 100 (0, 100, 200... 800)
			axisBorder: { show: false },
			axisTicks: { show: false },
			labels: {
				style: {
					colors: '#888888',
					fontSize: '12px'
				}
			}
		},
		yaxis: {
			labels: {
				style: {
					colors: '#888888',
					fontSize: '12px'
				}
			}
		},
		tooltip: {
			marker: false,
		},
		grid: {
			show: true,
			borderColor: '#f1f1f1',
			strokeDashArray: 3,
			xaxis: {
				lines: { show: true }
			},
			yaxis: {
				lines: { show: false }
			},
			padding: {
				top: 0,
				right: 20,
				bottom: -10,
				left: -5
			}
		},
		legend: { show: false }
	};

	var chart = new ApexCharts(document.querySelector("#aging-bucket-chart"), options);
	chart.render();
}

// Team Members Chart
if (document.querySelector('#members-chart')) {
	var options = {
		series: [{
			name: "performance",
			data: [45, 20, 50, 35, 75, 45, 65, 45, 60]
		}],
		chart: {
			height: 80,
			width: '100%',
			type: 'area',
			toolbar: { show: false },
			zoom: { enabled: false },
			sparkline: { enabled: true }
		},

		colors: ['#27AE60'],
		dataLabels: {
			enabled: false
		},
		stroke: {
			show: true,
			curve: 'smooth',
			width: 1,
		},
		grid: {
			padding: {
				top: -20,
			}
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.5,
				opacityTo: 0.0,
				stops: [0, 100]
			}
		},
		tooltip: {
			enabled: false
		}
	};

	var chart = new ApexCharts(document.querySelector("#members-chart"), options);
	chart.render();
}

// Team Members Chart
if (document.querySelector('#pending-chart')) {
	var options = {
		series: [{
			name: "performance",
			// Data adjusted to mimic the exact wavy peaks and valleys in the screenshot
			data: [35, 30, 40, 35, 45, 55, 35, 45, 60]
		}],
		chart: {
			height: 80, // Increased slightly so the gradient is more visible
			width: '100%', // Allows it to fill the container nicely
			type: 'area',
			toolbar: { show: false },
			zoom: { enabled: false },
			sparkline: { enabled: true } // Keeps it clean with no axes or grid
		},
		// The exact bright green color from your screenshot
		colors: ['#EF1E1E'],
		dataLabels: {
			enabled: false
		},
		stroke: {
			show: true,
			curve: 'smooth',
			width: 1, // Thickened slightly to match the screenshot's line weight
		},
		grid: {
			padding: {
				top: -20,   // Removes padding inside the grid
			}
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.5, // Soft green at the top under the line
				opacityTo: 0.0,   // Fades completely to transparent at the bottom
				stops: [0, 100]
			}
		},
		tooltip: {
			enabled: false // Or true if you want hover effects
		}
	};

	var chart = new ApexCharts(document.querySelector("#pending-chart"), options);
	chart.render();
}

// Team Members Chart
if (document.querySelector('#total-deals-chart')) {
	var options = {
		series: [{
			name: "performance",
			// Data adjusted to mimic the exact wavy peaks and valleys in the screenshot
			data: [35, 55, 45, 60, 75, 35, 30, 65, 45]
		}],
		chart: {
			height: 80, // Increased slightly so the gradient is more visible
			width: '100%', // Allows it to fill the container nicely
			type: 'area',
			toolbar: { show: false },
			zoom: { enabled: false },
			sparkline: { enabled: true } // Keeps it clean with no axes or grid
		},
		// The exact bright green color from your screenshot
		colors: ['#3538cd'],
		dataLabels: {
			enabled: false
		},
		stroke: {
			show: true,
			curve: 'smooth',
			width: 1, // Thickened slightly to match the screenshot's line weight
		},
		grid: {
			padding: {
				top: -20,   // Removes padding inside the grid
			}
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.5, // Soft green at the top under the line
				opacityTo: 0.0,   // Fades completely to transparent at the bottom
				stops: [0, 100]
			}
		},
		tooltip: {
			enabled: false // Or true if you want hover effects
		}
	};

	var chart = new ApexCharts(document.querySelector("#total-deals-chart"), options);
	chart.render();
}

// Team Members Chart
if (document.querySelector('#total-revenue-chart')) {
	var options = {
		series: [{
			name: "performance",
			// Data adjusted to mimic the exact wavy peaks and valleys in the screenshot
			data: [45, 20, 50, 35, 75, 55, 45, 45, 60]
		}],
		chart: {
			height: 80, // Increased slightly so the gradient is more visible
			width: '100%', // Allows it to fill the container nicely
			type: 'area',
			toolbar: { show: false },
			zoom: { enabled: false },
			sparkline: { enabled: true } // Keeps it clean with no axes or grid
		},
		// The exact bright green color from your screenshot
		colors: ['#CC1EEF'],
		dataLabels: {
			enabled: false
		},
		stroke: {
			show: true,
			curve: 'smooth',
			width: 1, // Thickened slightly to match the screenshot's line weight
		},
		grid: {
			padding: {
				top: -20,   // Removes padding inside the grid
			}
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.5, // Soft green at the top under the line
				opacityTo: 0.0,   // Fades completely to transparent at the bottom
				stops: [0, 100]
			}
		},
		tooltip: {
			enabled: false // Or true if you want hover effects
		}
	};

	var chart = new ApexCharts(document.querySelector("#total-revenue-chart"), options);
	chart.render();
}

// Estimation Trend Chart
if (document.querySelector('#estimation-trend-chart')) {
	var sColStacked = {
		series: [{
			name: 'Metrics',
			data: [46, 88, 64, 33, 52]
		}],
		colors: ['#F23838'],
		chart: {
			height: 375,
			type: 'bar',
			toolbar: { show: false },
			// Reduced padding to 0 to align with grid edges
			sparkline: { enabled: false },
		},
		plotOptions: {
			bar: {
				columnWidth: '60%',
				// borderRadius: 8 applies to all corners if borderRadiusApplication isn't 'end'
				borderRadius: 8,
				borderRadiusApplication: 'end', // Keeps the bottom flat like the image
			},
		},
		fill: {
			type: 'gradient',
			gradient: {
				shade: 'light',
				type: 'vertical',
				shadeIntensity: 0.5,
				// This creates the "fade to transparent/white" effect
				gradientToColors: ['#FFFFFF'],
				inverseColors: false,
				opacityFrom: 1,
				opacityTo: 0.2, // Lower opacity at bottom for smoother blend
				stops: [0, 100]
			}
		},
		dataLabels: { enabled: false },
		tooltip: {
			marker: false,
		},
		xaxis: {
			categories: ['Quality To Buy', 'Contact Made', 'Presentation', 'Proposal Made', 'Appointment'],
			axisBorder: { show: false },
			axisTicks: { show: false },
			labels: {
				style: {
					colors: '#888888',
					fontSize: '13px',
					fontWeight: 500
				},
				offsetY: 0
			}
		},
		yaxis: {
			min: 0,
			max: 100,
			tickAmount: 5,
			labels: {
				show: true,
				style: { colors: '#888888', fontSize: '13px' },
				offsetX: -15
			}
		},
		grid: {
			show: true,
			borderColor: '#f1f1f1',
			strokeDashArray: 4,
			xaxis: { lines: { show: false } },
			yaxis: { lines: { show: true } },
			// Tightened padding to ensure the grid touches the edges
			padding: {
				top: 0,
				right: -30,
				bottom: -10,
				left: -15
			}
		},
		legend: { show: false }
	};

	var chart = new ApexCharts(
		document.querySelector("#estimation-trend-chart"),
		sColStacked
	);

	chart.render();
}

// lead-sources-chart
if (document.querySelector('#lead-sources-chart')) {
	var options = {
		series: [
			{ name: 'Web Analytics', data: [2, 3, 3, 1] },
			{ name: 'Phone Calls', data: [1, 1, 1, 2] },
			{ name: 'Referrals', data: [3, 1, 2, 1] },
			{ name: 'Campaigns', data: [1, 1, 1, 3] },
			{ name: 'Google', data: [2, 3, 2, 1] }
		],
		chart: {
			height: 280,
			type: 'heatmap',
			toolbar: { show: false },
			// Removes internal chart padding
			sparkline: { enabled: false }
		},
		plotOptions: {
			heatmap: {
				radius: 10,
				enableShades: false,
				colorScale: {
					ranges: [
						{ from: 1, to: 1, color: '#F3E9D5' },
						{ from: 2, to: 2, color: '#F5C77E' },
						{ from: 3, to: 3, color: '#FF9800' }
					]
				}
			}
		},
		dataLabels: { enabled: false },
		stroke: {
			width: 4,
			colors: ['#ffffff']
		},
		xaxis: {
			categories: ['On Track', 'Paused', 'At Risk', 'Breached'],
			axisBorder: { show: false },
			axisTicks: { show: false },
			labels: {
				offsetY: 0, // Pulls the bottom labels closer to the blocks
				style: { fontSize: '12px', colors: '#666' }
			}
		},
		yaxis: {
			labels: {
				padding: 0,
				offsetX: 10, // Pulls the side labels closer to the blocks
				style: { fontSize: '12px', colors: '#666' }
			}
		},
		grid: {
			padding: {
				top: -10,    // Slight pull up to remove top white space
				right: 0,    // Flush with the right side
				bottom: 0,   // Set to 0 (Never use negative here or labels disappear)
				left: 10     // Small positive space to ensure Y-axis names aren't cut
			}
		},
		legend: { show: false }
	};

	var chart = new ApexCharts(document.querySelector("#lead-sources-chart"), options);
	chart.render();
}

if (document.querySelector('#sales-rep-chart')) {
	var options = {
		series: [
			{
				name: 'Deals Closed',
				type: 'column',
				data: [45, 38, 32, 28, 26, 22]
			},
			{
				name: 'Revenue',
				type: 'line',
				data: [290, 240, 200, 175, 160, 145]
			}
		],
		chart: {
			height: 280,
			type: 'line',
			toolbar: { show: false }
		},
		stroke: {
			width: [0, 3],
			curve: 'straight'
		},
		// The bars will use the gradient defined in 'fill', the line uses this green:
		colors: ['#667eea', '#42B96A'],

		plotOptions: {
			bar: {
				columnWidth: '55%',
				borderRadius: 8,
				borderRadiusApplication: 'end'
			}
		},
		fill: {
			type: ['gradient', 'solid'], // Gradient for bars, solid for the line
			gradient: {
				type: 'vertical',
				shadeIntensity: 1,
				// This matches your 180deg, rgba(102, 126, 234, 0.9) to 0.6
				opacityFrom: 0.9,
				opacityTo: 0.6,
				stops: [0, 100],
				colorStops: [
					[
						{ offset: 0, color: '#667eea', opacity: 0.9 },
						{ offset: 100, color: '#667eea', opacity: 0.6 }
					],
					[] // Empty for the second series (the line)
				]
			}
		},
		markers: {
			size: 6,
			colors: ['#42B96A'],
			strokeWidth: 0,
		},
		tooltip: {
			marker: false,
		},
		xaxis: {
			categories: ['John S.', 'Sarah J.', 'Mike D.', 'Emma W.', 'David B.', 'Lisa A.'],
			axisBorder: { show: false },
			axisTicks: { show: false },
			labels: { style: { colors: '#888', fontSize: '13px' } }
		},
		yaxis: [
			{
				min: 0,
				max: 60,
				tickAmount: 4,
				axisBorder: { show: true, color: '#eef0f2' },
				labels: { style: { colors: '#888' }, offsetX: -20 }
			},
			{
				opposite: true,
				min: 0,
				max: 300,
				tickAmount: 4,
				axisBorder: { show: true, color: '#eef0f2' },
				labels: {
					style: { colors: '#888' },
					formatter: function (val) { return "$" + val + "K"; }
				}
			}
		],
		grid: {
			show: true,
			borderColor: '#eef0f2',
			strokeDashArray: 4, // Dashed lines like the screenshot
			position: 'back',   // Ensures grid is behind the bars
			xaxis: {
				lines: { show: false }
			},
			yaxis: {
				lines: { show: true },
			},
			padding: {
				top: 0, right: -50, bottom: 0, left: -20
			}
		},
		legend: { show: false }
	};

	var chart = new ApexCharts(document.querySelector("#sales-rep-chart"), options);
	chart.render();
}
// Sales Revenue
if (document.querySelector('#sales-revenue')) {
	const options = {
		series: [{
			labels: ['Hours'],
			data: [10, 40, 25, 27, 23, 28, 25, 80, 15]
		}],
		chart: {
			height: 44,
			width: 100,
			type: 'area',
			zoom: {
				enabled: false
			},
			sparkline: {
				enabled: true
			},
		},
		tooltip: {
			enabled: true,
			x: {
				show: false
			},
			y: {
				title: {
					formatter: function (seriesName) {
						return ''
					}
				}
			},
			marker: {
				show: false
			}
		},
		dataLabels: {
			enabled: false
		},
		stroke: {
			curve: 'smooth',
			width: [1.5],
		},

		fill: {
			type: 'gradient',
			gradient: {
				type: 'vertical',
				shadeIntensity: 0,
				inverseColors: false, // Ensure top stays top and bottom stays bottom
				opacityFrom: 1,
				opacityTo: 1,
				stops: [0, 100],
				colorStops: [
					{
						offset: 0,
						color: "#3AB37E", // Top Color (100% in your CSS)
						opacity: 1
					},
					{
						offset: 100,
						color: "#D9D9D900", // Bottom Color (0% in your CSS)
						opacity: 1
					}
				]
			}
		},
		title: {
			text: undefined,
		},
		grid: {
			borderColor: 'transparent',
		},
		xaxis: {
			crosshairs: {
				show: false,
			}
		},
		colors: ["#3AB37E"],
	};
	const chart = new ApexCharts(document.querySelector("#sales-revenue"), options);
	chart.render();
}

// Customer Revenue
if (document.querySelector('#customer-revenue')) {
	const options = {
		series: [{
			labels: ['Customer'],
			data: [10, 40, 25, 27, 23, 28, 25, 80, 15]
		}],
		chart: {
			height: 44,
			width: 100,
			type: 'area',
			zoom: {
				enabled: false
			},
			sparkline: {
				enabled: true
			},
		},
		tooltip: {
			enabled: true,
			x: {
				show: false
			},
			y: {
				title: {
					formatter: function (seriesName) {
						return ''
					}
				}
			},
			marker: {
				show: false
			}
		},
		dataLabels: {
			enabled: false
		},
		stroke: {
			curve: 'smooth',
			width: [1.5],
		},

		fill: {
			type: 'gradient',
			gradient: {
				type: 'vertical',
				shadeIntensity: 0,
				inverseColors: false, // Ensure top stays top and bottom stays bottom
				opacityFrom: 1,
				opacityTo: 1,
				stops: [0, 100],
				colorStops: [
					{
						offset: 0,
						color: "#7F24E3", // Top Color (100% in your CSS)
						opacity: 1
					},
					{
						offset: 100,
						color: "#D9D9D900", // Bottom Color (0% in your CSS)
						opacity: 1
					}
				]
			}
		},
		title: {
			text: undefined,
		},
		grid: {
			borderColor: 'transparent',
		},
		xaxis: {
			crosshairs: {
				show: false,
			}
		},
		colors: ["#7F24E3"],
	};
	const chart = new ApexCharts(document.querySelector("#customer-revenue"), options);
	chart.render();
}

// Target Revenue
if (document.querySelector('#target-revenue')) {
	const options = {
		series: [{
			labels: ['Target'],
			data: [5, 40, 35, 30, 23, 28, 25, 80, 15]
		}],
		chart: {
			height: 44,
			width: 100,
			type: 'area',
			zoom: {
				enabled: false
			},
			sparkline: {
				enabled: true
			},
		},
		tooltip: {
			enabled: true,
			x: {
				show: false
			},
			y: {
				title: {
					formatter: function (seriesName) {
						return ''
					}
				}
			},
			marker: {
				show: false
			}
		},
		dataLabels: {
			enabled: false
		},
		stroke: {
			curve: 'smooth',
			width: [1.5],
		},

		fill: {
			type: 'gradient',
			gradient: {
				type: 'vertical',
				shadeIntensity: 0,
				inverseColors: false, // Ensure top stays top and bottom stays bottom
				opacityFrom: 1,
				opacityTo: 1,
				stops: [0, 100],
				colorStops: [
					{
						offset: 0,
						color: "#F07019", // Top Color (100% in your CSS)
						opacity: 1
					},
					{
						offset: 100,
						color: "#D9D9D900", // Bottom Color (0% in your CSS)
						opacity: 1
					}
				]
			}
		},
		title: {
			text: undefined,
		},
		grid: {
			borderColor: 'transparent',
		},
		xaxis: {
			crosshairs: {
				show: false,
			}
		},
		colors: ["#F07019"],
	};
	const chart = new ApexCharts(document.querySelector("#target-revenue"), options);
	chart.render();
}

// Profit Revenue
if (document.querySelector('#profit-revenue')) {
	const options = {
		series: [{
			labels: ['Hours'],
			data: [10, 30, 25, 27, 20, 28, 25, 80, 15]
		}],
		chart: {
			height: 44,
			width: 100,
			type: 'area',
			zoom: {
				enabled: false
			},
			sparkline: {
				enabled: true
			},
		},
		tooltip: {
			enabled: true,
			x: {
				show: false
			},
			y: {
				title: {
					formatter: function (seriesName) {
						return ''
					}
				}
			},
			marker: {
				show: false
			}
		},
		dataLabels: {
			enabled: false
		},
		stroke: {
			curve: 'smooth',
			width: [1.5],
		},

		fill: {
			type: 'gradient',
			gradient: {
				type: 'vertical',
				shadeIntensity: 0,
				inverseColors: false, // Ensure top stays top and bottom stays bottom
				opacityFrom: 1,
				opacityTo: 1,
				stops: [0, 100],
				colorStops: [
					{
						offset: 0,
						color: "#175FFF", // Top Color (100% in your CSS)
						opacity: 1
					},
					{
						offset: 100,
						color: "#D9D9D900", // Bottom Color (0% in your CSS)
						opacity: 1
					}
				]
			}
		},
		title: {
			text: undefined,
		},
		grid: {
			borderColor: 'transparent',
		},
		xaxis: {
			crosshairs: {
				show: false,
			}
		},
		colors: ["#175FFF"],
	};
	const chart = new ApexCharts(document.querySelector("#profit-revenue"), options);
	chart.render();
}

// Profit Revenue
if (document.querySelector('#conversion-chart')) {
	var options = {
		series: [{
			name: 'Series 1',
			data: [100, 100, 100, 40, 50, 50],
		}, {
			name: 'Series 2',
			data: [60, 60, 80, 100, 96, 58],
		}],
		chart: {
			width: 90,
			height: 100,
			type: 'radar',
			sparkline: {
				enabled: true
			},
			animations: {
				enabled: false // Sometimes helps with tooltip precision on very small charts
			},
			toolbar: {
				show: false
			},
			dropShadow: {
				enabled: true,
				blur: 1,
				left: 1,
				top: 1
			}
		},
		fill: {
			opacity: 0.7,
			type: 'gradient',
			gradient: {
				type: 'radial', // Matches your CSS intent
				shadeIntensity: 1,
				opacityFrom: 1,
				opacityTo: 1,
				stops: [3, 100], // Matches your '3%' and '100%' stops
				colorStops: [
					// Color Stops for Series 1 (Green)
					[
						{ offset: 3, color: "#54B17B", opacity: 0.8 },
						{ offset: 100, color: "#27A55C", opacity: 0.8 }
					],
					// Color Stops for Series 2 (Purple)
					[
						{ offset: 3, color: "#A673FD", opacity: 0.8 },
						{ offset: 100, color: "#7F24E3", opacity: 0.8 }
					]
				]
			}
		},
		grid: {
			position: 'front',
		},
		stroke: {
			width: 0
		},
		legend: {
			show: false
		},
		tooltip: {
			enabled: true,
			y: {
				formatter: function (seriesName) {
					return ''
				}
			},
		},
		plotOptions: {
			radar: {
				polygons: {
					// 1. Set the color of the spider-web rings
					strokeColors: '#e8e8e8',
					strokeWidth: 1,
					// 2. Set the color of the lines going to the center
					connectorColors: '#e8e8e8',
					// 3. Optional: Background fill between the rings
					fill: {
						colors: ['rgba(255,255,255,0.05)', 'transparent']
					}
				}
			}
		},

		dataLabels: {
			enabled: false
		},
		markers: {
			size: 0
		},
		yaxis: {
			stepSize: 20,

			show: false, // Hides Y-axis labels and scale
		},
		xaxis: {
			categories: ['2011', '2012', '2013', '2014', '2015', '2016'],
			labels: {
				show: true // Hides the category names (2011, 2012, etc.)
			},
			axisBorder: {
				show: false // Removes the outer border line
			}
		}
	};
	const chart = new ApexCharts(document.querySelector("#conversion-chart"), options);
	chart.render();
}

if (document.querySelector('#salesperson-chart')) {
	const options2 = {
		series: [{
			name: 'Revenue',
			data: [
				{ x: 'Arlene', y: 0.8, goals: [{ value: 0.8, name: 'Sales', strokeHeight: 3, strokeColor: '#F9934D', strokeLineCap: 'round', }] },
				{ x: 'Robert', y: 3.2, goals: [{ value: 3.2, name: 'Sales', strokeHeight: 3, strokeColor: '#F9934D', strokeLineCap: 'round', }] },
				{ x: 'Henry', y: 2.0, goals: [{ value: 2.0, name: 'Sales', strokeHeight: 3, strokeColor: '#F9934D', strokeLineCap: 'round', }] },
				{ x: 'Fox', y: 2.8, goals: [{ value: 2.8, name: 'Sales', strokeHeight: 3, strokeColor: '#F9934D', strokeLineCap: 'round', }] },
				{ x: 'Devon', y: 4.0, goals: [{ value: 4.0, name: 'Sales', strokeHeight: 3, strokeColor: '#F9934D', strokeLineCap: 'round', }] }
			]
		}],
		chart: {
			height: 300,
			type: 'bar',
			toolbar: {
				show: false,
			},
			background: 'none',
			fill: "#fff",
		},
		plotOptions: {
			bar: {
				borderRadius: 2,
				columnWidth: '60%',
				colors: {
					backgroundBarColors: ['var(--light)'],
					backgroundBarOpacity: 1,
					backgroundBarRadius: 5,
				},
			}
		},
		grid: {
			padding: {
				right: -10,
				left: -15,
				top: -15,
			},
			borderColor: ['var(--border-color)'],
			strokeDashArray: 5,
			xaxis: {
				lines: {
					show: false
				}
			},
			yaxis: {
				lines: {
					show: true,
				}
			}
		},
		background: 'transparent',
		dataLabels: {
			enabled: false
		},
		tooltip: {
			marker: false,
		},
		legend: {
			show: false,
			position: 'bottom',
			markers: {
				width: 8,
				height: 8,
			},
			onItemClick: {
				toggleDataSeries: false   // 👈 add here to stop hiding on click
			}
		},
		xaxis: {
			categories: ['Arlene', 'Robert', 'Henry', 'Fox', 'Devon'],
			axisBorder: {
				show: false,
				color: 'rgba(119, 119, 142, 0.05)',
				offsetX: 0,
				offsetY: 0,
			},
			axisTicks: {
				show: false,
				borderType: 'solid',
				color: 'rgba(119, 119, 142, 0.05)',
				offsetY: 0
			},
		},
		fill: {
			type: ['gradient', 'solid'], // Gradient for Bar, Solid for Area
			gradient: {
				type: 'vertical', // 'vertical' usually looks best for bars
				shadeIntensity: 1,
				opacityFrom: 1,
				opacityTo: 1,
				colorStops: [
					[
						{ offset: 0, color: "#F07019", opacity: 1 },
						{ offset: 100, color: "#F9934D", opacity: 1 }
					]
				]
			},
			// This ensures the second series (Area) uses the hex color
			colors: ['E41F07']
		},
		yaxis: {
			min: 0,
			max: 5,    // Forces the end at 60,000
			labels: {
				offsetX: -10,
				// Formatter to add the '$' and 'k' suffix
				formatter: function (value) {
					return "$" + value + "M";
				}
			},
			lines: {
				show: true,
			}
		},
		tooltip: {
			marker: false,
			custom: function({ series, seriesIndex, dataPointIndex, w }) {
				const value = series[seriesIndex][dataPointIndex];
				const name = w.globals.labels[dataPointIndex];

				return `
					<div class="apex-tooltip p-2">
						<span>${name}</span><br/>
						<strong>$${value}M</strong>
					</div>
				`;
			}
		}
	};
	const chart4 = new ApexCharts(document.querySelector("#salesperson-chart"), options2);
	chart4.render();
}

// Risk Level Split Chart
if (document.querySelector('#deals-status-chart')) {
	var options = {
		// Data updated to match the 50%, 30%, 20% split in the screenshot
		series: [50, 30, 20],
		chart: {
			height: 350,
			type: 'pie', // Changed from 'donut' to 'pie'
		},
		// Labels corresponding to the data
		labels: ['Completed', 'Pending', 'In-Progress'],

		// Exact colors from the screenshot: Green, Blue, Red
		colors: ['#27A361', '#3237D3', '#E91F1F'],

		legend: {
			show: false // Hidden to match the clean screenshot look
		},
		stroke: {
			show: false // Removes the white border between slices
		},
		dataLabels: {
			enabled: true,
			formatter: function (val) {
				return Math.round(val) + "%"; // Displays the percentage inside the slice
			},
			style: {
				fontSize: '14px',
				fontFamily: 'Helvetica, Arial, sans-serif',
				fontWeight: 'bold',
				colors: ['#fff'] // White text for better contrast
			},
			dropShadow: {
				enabled: false
			}
		},
		plotOptions: {
			pie: {
				expandOnClick: true,
				dataLabels: {
					offset: -10, // Moves labels toward the center of the slices
				}
			}
		},
		tooltip: {
			enabled: true,
			y: {
				formatter: function (val) {
					return val + "%";
				}
			}
		}
	};

	var chart = new ApexCharts(document.querySelector("#deals-status-chart"), options);
	chart.render();
}

// Proposal Conversion Rate Chart
if (document.querySelector('#proposal-conversion-rate-chart')) {
	var options = {
		series: [
			{
				name: "High",
				data: [28, 29, 33, 36, 32, 32, 33, 35, 38, 34, 31, 25]
			},
			{
				name: "Low",
				data: [12, 11, 14, 18, 17, 13, 13, 15, 18, 16, 14, 10]
			}
		],
		chart: {
			height: 350,
			type: 'line',
			toolbar: { show: false },
			zoom: { enabled: false },
			dropShadow: {
				enabled: false // Screenshot-la shadow illa, clean-ah iruku
			}
		},
		// Blue and Green colors from your second screenshot
		colors: ['#3B82F6', '#10B981'],
		stroke: {
			curve: 'smooth',
			width: 3
		},
		// Ippo values markers (dots) correct-ah varum
		markers: {
			size: 5,
			colors: ['#3B82F6', '#10B981'],
			strokeColors: '#fff',
			strokeWidth: 2,
			hover: { size: 7 }
		},
		grid: {
			show: true,
			borderColor: '#f1f1f1',
			// Dotted vertical and horizontal lines kaga idhu
			xaxis: {
				lines: { show: true }
			},
			yaxis: {
				lines: { show: true }
			},
			strokeDashArray: 4, // Idhu dhaan andha dotted effect-ah tharum
		},
		dataLabels: {
			enabled: false // Dots mela numbers screenshot-la illa
		},
		tooltip: {
			marker: false,
		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			axisBorder: { show: false },
			axisTicks: { show: false }
		},
		yaxis: {
			min: 0,
			max: 40,
			tickAmount: 4,
			labels: {
				style: { colors: '#9CA3AF' }
			}
		},
		legend: {
			show: false, // Idhu dhaan legend-ah display none pannum
			position: 'top',
			horizontalAlign: 'right',
			offsetY: -10
		}
	};

	var chart = new ApexCharts(document.querySelector("#proposal-conversion-rate-chart"), options);
	chart.render();
}

// Attendance Summary Report Chart
if (document.querySelector('#attendance-summary-report-chart-1')) {
	var sCol = {
		chart: {
			width: 100, // Screenshot-la konjam wide-ah iruku
			height: 40,
			type: 'bar',
			toolbar: { show: false },
			sparkline: { enabled: true }, // Sparkline mode on
		},
		plotOptions: {
			bar: {
				columnWidth: '65%',
				borderRadius: 3, // Rounded corners matching screenshot
				distributed: true, // Each bar can have its own color
			},
		},
		// Screenshot-la irukura bars height approximate-ah kuduthuruken
		series: [{
			name: 'Employees',
			data: [30, 45, 80, 70, 60, 85, 95, 80]
		}],
		// Gradient blue colors matching your screenshot
		colors: [
			'#A5C2FB', // Light Blue
			'#94B4F9',
			'#82A6F7',
			'#7098F5',
			'#3B82F6', // Vibrant Blue
			'#2563EB',
			'#1D4ED8',
			'#1E40AF'  // Dark Blue
		],
		grid: { show: false },
		xaxis: { labels: { show: false }, axisBorder: { show: false } },
		yaxis: { show: false },
		tooltip: { enabled: false }, // Tiny chart-la tooltip thevai illa
		legend: { show: false }
	};

	var chart = new ApexCharts(document.querySelector("#attendance-summary-report-chart-1"), sCol);
	chart.render();
}

// Attendance Summary Report Chart
if (document.querySelector('#attendance-summary-report-chart-2')) {
	var sCol = {
		chart: {
			width: 100, height: 40, type: 'bar',
			toolbar: { show: false }, sparkline: { enabled: true },
		},
		plotOptions: {
			bar: { columnWidth: '65%', borderRadius: 3, distributed: true },
		},
		series: [{
			name: 'Employees',
			data: [30, 45, 80, 70, 60, 85, 95, 80]
		}],
		// Gradient Green colors from screenshot
		colors: [
			'#C1EAD1', '#A8E1BE', '#8FD8AB', '#76CF98',
			'#5DC685', '#44BD72', '#2BB45F', '#12AB4C'
		],
		grid: { show: false },
		xaxis: { labels: { show: false }, axisBorder: { show: false } },
		yaxis: { show: false },
		tooltip: { enabled: false },
		legend: { show: false }
	};
	var chart = new ApexCharts(document.querySelector("#attendance-summary-report-chart-2"), sCol);
	chart.render();
}

// Attendance Summary Report Chart
if (document.querySelector('#attendance-summary-report-chart-3')) {
	var sCol = {
		chart: {
			width: 100, height: 40, type: 'bar',
			toolbar: { show: false }, sparkline: { enabled: true },
		},
		plotOptions: {
			bar: { columnWidth: '65%', borderRadius: 3, distributed: true },
		},
		series: [{
			name: 'Employees',
			data: [30, 45, 80, 70, 60, 85, 95, 80]
		}],
		// Gradient Purple colors from screenshot
		colors: [
			'#D8B9E6', '#C99DDC', '#BA81D2', '#AB65C8',
			'#9C49BE', '#8D2DB4', '#7E11AA', '#6F00A0'
		],
		grid: { show: false },
		xaxis: { labels: { show: false }, axisBorder: { show: false } },
		yaxis: { show: false },
		tooltip: { enabled: false },
		legend: { show: false }
	};
	var chart = new ApexCharts(document.querySelector("#attendance-summary-report-chart-3"), sCol);
	chart.render();
}

// Attendance Summary Report Chart
if (document.querySelector('#attendance-summary-report-chart-4')) {
	var sCol = {
		chart: {
			width: 100, height: 40, type: 'bar',
			toolbar: { show: false }, sparkline: { enabled: true },
		},
		plotOptions: {
			bar: { columnWidth: '65%', borderRadius: 3, distributed: true },
		},
		series: [{
			name: 'Employees',
			data: [30, 45, 80, 70, 60, 85, 95, 80]
		}],
		// Gradient Red colors from screenshot
		colors: [
			'#F9C7C0', '#F7B0A7', '#F5998E', '#F38275',
			'#F16B5C', '#EF5443', '#ED3D2A', '#EB2611'
		],
		grid: { show: false },
		xaxis: { labels: { show: false }, axisBorder: { show: false } },
		yaxis: { show: false },
		tooltip: { enabled: false },
		legend: { show: false }
	};
	var chart = new ApexCharts(document.querySelector("#attendance-summary-report-chart-4"), sCol);
	chart.render();
}

// Leave Summary Report Chart
if (document.querySelector('#leave-balance-report-chart-1')) {
	var options = {
		series: [80], // This represents the percentage (e.g., 480 out of 600)
		chart: {
			type: 'radialBar',
			height: 100,
			width: 100,
			sparkline: {
				enabled: true // Removes extra padding
			}
		},
		plotOptions: {
			radialBar: {
				startAngle: -90,
				endAngle: 90,
				track: {
					background: "#e7e7e7",
					strokeWidth: '97%',
					margin: 5, // margin is in pixels
				},
				dataLabels: {
					name: {
						show: false
					},
					value: {
						offsetY: -2,
						fontSize: '22px',
						show: false // Hidden because your image uses an external label ("600")
					}
				}
			}
		},
		grid: {
			padding: {
				top: -50
			}
		},
		fill: {
			type: 'gradient',
			gradient: {
				shade: 'light',
				shadeIntensity: 0.4,
				inverseColors: false,
				opacityFrom: 1,
				opacityTo: 1,
				stops: [0, 50, 53, 91],
				colorStops: [
					{
						offset: 0,
						color: "#1abe17", // Your pink color
						opacity: 1
					},
					{
						offset: 100,
						color: "#1abe178c", // Lighter pink for the gradient end
						opacity: 1
					}
				]
			},
		},
		labels: ['Total Allocated'],
	};

	var chart = new ApexCharts(document.querySelector("#leave-balance-report-chart-1"), options);
	chart.render();
}

// Leave Summary Report Chart
if (document.querySelector('#leave-balance-report-chart-2')) {
	var options = {
		series: [60], // This represents the percentage (e.g., 480 out of 600)
		chart: {
			type: 'radialBar',
			height: 100,
			width: 100,
			sparkline: {
				enabled: true // Removes extra padding
			}
		},
		plotOptions: {
			radialBar: {
				startAngle: -90,
				endAngle: 90,
				track: {
					background: "#e7e7e7",
					strokeWidth: '97%',
					margin: 5, // margin is in pixels
				},
				dataLabels: {
					name: {
						show: false
					},
					value: {
						offsetY: -2,
						fontSize: '22px',
						show: false // Hidden because your image uses an external label ("600")
					}
				}
			}
		},
		grid: {
			padding: {
				top: -50
			}
		},
		fill: {
			type: 'gradient',
			gradient: {
				shade: 'light',
				shadeIntensity: 0.4,
				inverseColors: false,
				opacityFrom: 1,
				opacityTo: 1,
				stops: [0, 50, 53, 91],
				colorStops: [
					{
						offset: 0,
						color: "#dd2590", // Your pink color
						opacity: 1
					},
					{
						offset: 100,
						color: "#dd259054", // Lighter pink for the gradient end
						opacity: 1
					}
				]
			},
		},
		labels: ['Total Allocated'],
	};

	var chart = new ApexCharts(document.querySelector("#leave-balance-report-chart-2"), options);
	chart.render();
}

// Leave Summary Report Chart
if (document.querySelector('#leave-balance-report-chart-3')) {
	var options = {
		series: [90], // This represents the percentage (e.g., 480 out of 600)
		chart: {
			type: 'radialBar',
			height: 100,
			width: 100,
			sparkline: {
				enabled: true // Removes extra padding
			}
		},
		plotOptions: {
			radialBar: {
				startAngle: -90,
				endAngle: 90,
				track: {
					background: "#e7e7e7",
					strokeWidth: '97%',
					margin: 5, // margin is in pixels
				},
				dataLabels: {
					name: {
						show: false
					},
					value: {
						offsetY: -2,
						fontSize: '22px',
						show: false // Hidden because your image uses an external label ("600")
					}
				}
			}
		},
		grid: {
			padding: {
				top: -50
			}
		},
		fill: {
			type: 'gradient',
			gradient: {
				shade: 'light',
				shadeIntensity: 0.4,
				inverseColors: false,
				opacityFrom: 1,
				opacityTo: 1,
				stops: [0, 50, 53, 91],
				colorStops: [
					{
						offset: 0,
						color: "#800080", // Your pink color
						opacity: 1
					},
					{
						offset: 100,
						color: "#8000806b", // Lighter pink for the gradient end
						opacity: 1
					}
				]
			},
		},
		labels: ['Total Allocated'],
	};

	var chart = new ApexCharts(document.querySelector("#leave-balance-report-chart-3"), options);
	chart.render();
}

// Leave Summary Report Chart
if (document.querySelector('#leave-balance-report-chart-4')) {
	var options = {
		series: [70], // This represents the percentage (e.g., 480 out of 600)
		chart: {
			type: 'radialBar',
			height: 100,
			width: 100,
			sparkline: {
				enabled: true // Removes extra padding
			}
		},
		plotOptions: {
			radialBar: {
				startAngle: -90,
				endAngle: 90,
				track: {
					background: "#e7e7e7",
					strokeWidth: '97%',
					margin: 5, // margin is in pixels
				},
				dataLabels: {
					name: {
						show: false
					},
					value: {
						offsetY: -2,
						fontSize: '22px',
						show: false // Hidden because your image uses an external label ("600")
					}
				}
			}
		},
		grid: {
			padding: {
				top: -50
			}
		},
		fill: {
			type: 'gradient',
			gradient: {
				shade: 'light',
				shadeIntensity: 0.4,
				inverseColors: false,
				opacityFrom: 1,
				opacityTo: 1,
				stops: [0, 50, 53, 91],
				colorStops: [
					{
						offset: 0,
						color: "#ef1e1e", // Your pink color
						opacity: 1
					},
					{
						offset: 100,
						color: "#ef1e1e5e", // Lighter pink for the gradient end
						opacity: 1
					}
				]
			},
		},
		labels: ['Total Allocated'],
	};

	var chart = new ApexCharts(document.querySelector("#leave-balance-report-chart-4"), options);
	chart.render();
}