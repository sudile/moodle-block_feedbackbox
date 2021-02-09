// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.
/*
 * feedbackbox
 *
 * @version    1.0.0
 * @package    mod_feedbackbox
 * @author     Vincent Schneider <vincent.schneider@sudile.com> 2020
 * @copyright  2020 Sudile GbR (http://www.sudile.com)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define(['jquery', 'core/ajax', 'mod_feedbackbox/chart'],
    function ($, ajax, Chart) {
        var images = [];

        function getSVG(src) {
            var request = new XMLHttpRequest();
            request.open('GET', src, false);
            request.onload = function () {
                var parser = new DOMParser();
                var result = parser.parseFromString(request.responseText, 'text/xml');
                var inlineSVG = result.getElementsByTagName("svg")[0];
                inlineSVG.setAttribute('width', '30px');
                inlineSVG.setAttribute('height', '30px');
                var svg64 = btoa(new XMLSerializer().serializeToString(inlineSVG));
                var img64 = 'data:image/svg+xml;base64,' + svg64;
                var image = new Image();
                image.src = img64;
                image.onload = function () {
                    var canvas = document.createElement("canvas");
                    canvas.width = this.width;
                    canvas.height = this.height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(this, 0, 0);
                    var img = new Image();
                    img.src = canvas.toDataURL("image/png");
                    images.push(img);
                };
            };
            request.send();
        }

        var obj = {
            init: function (chartdata) {
                $('#feedbackboxicons').children().each(function () {
                    getSVG($(this).attr('src'));
                });
                let ctxc = $('#studchartblock');
                new Chart(ctxc, {
                    type: 'bar',
                    plugins: [{
                        afterDraw: chart => {
                            var ctx = chart.chart.ctx;
                            var xAxis = chart.scales['x-axis-0'];
                            var yAxis = chart.scales['y-axis-0'];
                            yAxis.ticks.forEach((value, index) => {
                                if (index in images) {
                                    var x = xAxis.getPixelForTick(index);
                                    if (x !== undefined && x !== null) {
                                        ctx.drawImage(images[index], x - 15, yAxis.bottom, 30, 30);
                                    }
                                }
                            });
                        }
                    }],
                    data: {
                        labels: ['', '', '', ''],
                        datasets: [{
                            data: chartdata.data,
                            maxBarThickness: 50,
                        }],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        legend: {
                            display: false
                        },
                        tooltips: {
                            enabled: true
                        },
                        elements: {
                            rectangle: {
                                backgroundColor: 'rgba(255, 172, 37, 0.2)',
                                borderColor: 'rgba(255, 172, 37, 1)',
                                borderWidth: 2
                            }
                        },
                        scales: {
                            yAxes: [{
                                display: false,
                                gridLines: {
                                    display: false
                                },
                                ticks: {
                                    suggestedMin: 0,
                                }
                            }],
                            xAxes: [{
                                gridLines: {
                                    display: false
                                }
                            }],
                        }
                    }
                });
            }
        };
        return obj;
    }
);
