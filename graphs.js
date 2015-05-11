function setCookie(cname,cvalue,exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = 'expires=' + d.toGMTString();
    document.cookie = cname + '=' + cvalue + '; ' + expires;
}

function getCookie(cname) {
    var name = cname + '=';
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}

function delCookie(cname) {
    document.cookie = cname + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
}

function checkCookie() {
    //delCookie('API_key');
    var user=getCookie('API_key');
    if (user === '') {
       user = prompt('Please enter your Forecast.io API key:','');
       if (user !== '' && user !== null) {
           setCookie('API_key', user, 30);
       }//
    } else {
        setCookie('API_key', user, 30);
    }
}

function showPosition(position) {
    latlon = position.coords.latitude + "," + position.coords.longitude;
}

google.setOnLoadCallback(drawBasic);

//API key: be813c5d4727d05034822cff2e7e5c04
function drawBasic() {
    checkCookie();
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {   
                var latlon = position.coords.latitude + "," + position.coords.longitude;
                $.ajax({
                    url: 'https://api.forecast.io/forecast/' + getCookie('API_key') + '/' +
                                latlon + '?extend=hourly',
                    dataType: 'jsonp',
                    success: function(data) {
                        var temp_datatable = new google.visualization.DataTable();
                        temp_datatable.addColumn('datetime', '');
                        temp_datatable.addColumn('number', 'Dew Point');
                        temp_datatable.addColumn('number', 'Freezing Point');
                        temp_datatable.addColumn('number', 'Temperature');
                        temp_datatable.addColumn({
                            id: 'i0',
                            type: 'number',
                            role: 'interval'
                        });
                        temp_datatable.addColumn({
                            id: 'i1',
                            type: 'number',
                            role: 'interval'
                        });

                        var hourly_weather_data = data.hourly.data;
                        var Temp = 0;
                        var appTemp = 0;
                        for (var i = 0; i < hourly_weather_data.length; i++) {
                            Temp = hourly_weather_data[i].temperature;
                            appTemp = hourly_weather_data[i].apparentTemperature;

                            if (Temp > appTemp) {
                                temp_datatable.addRow([new Date(hourly_weather_data[i].time * 1000),
                                                       hourly_weather_data[i].dewPoint,
                                                       32,
                                                       hourly_weather_data[i].temperature,
                                                       hourly_weather_data[i].apparentTemperature,
                                                       hourly_weather_data[i].temperature
                                                      ]);
                            } else {
                                temp_datatable.addRow([new Date(hourly_weather_data[i].time * 1000),
                                                       hourly_weather_data[i].dewPoint,
                                                       32,
                                                       hourly_weather_data[i].temperature,
                                                       hourly_weather_data[i].temperature,
                                                       hourly_weather_data[i].apparentTemperature
                                                      ]);
                            }
                        }

                        var hAxis_ticks = [];
                        for (i = 0; i <= 7; i++) {
                            hAxis_ticks.push(new Date((hourly_weather_data[0].time + 24 * 3600 * i) * 1000));
                        }
                        var vAxis_ticks = [0, 25, 32, 50, 75, 100];

                        var temp_options = {
                            height: 500,
                            title: 'Temperature for the Next Week',
                            curveType: 'function',
                            intervals: {
                                'style': 'area'
                            },
                            series: {
                                0: {
                                    color: 'black'
                                },
                                1: {
                                    color: 'black',
                                    lineWidth: 0.6,
                                    visibleInLegend: false,
                                    enableInteractivity: false
                                },
                                2: {
                                    color: '#3E6ECE'
                                }
                            },
                            legend: {
                                position: 'bottom'
                            },
                            hAxis: {
                                format: 'MMM d',
                                ticks: hAxis_ticks
                            },
                            vAxis: {
                                ticks: vAxis_ticks,
                                title: 'Temperature (°F)'
                            }
                        };

                        ///////////////////////////////////////////////////////////////////////////////////////

                        var cloud_datatable = new google.visualization.DataTable();
                        cloud_datatable.addColumn('datetime', '');
                        cloud_datatable.addColumn('number', 'Precipitation Probability');
                        cloud_datatable.addColumn('number', 'Precipitation Intensity');
                        cloud_datatable.addColumn('number', 'Cloudiness');
                        cloud_datatable.addColumn({
                            type: 'string',
                            role: 'style'
                        });

                        var PrecProb = 0;
                        var PrecInt = 0;
                        var Clouds = 0;
                        for (i = 0; i < hourly_weather_data.length; i++) {
                            PrecInt = Math.round(hourly_weather_data[i].precipIntensity * 10000) / 10;
                            if (PrecInt === 0) {
                                PrecInt = 1;
                            }
                            PrecProb = Math.round(hourly_weather_data[i].precipProbability * 1000) / 10;
                            Clouds = Math.round((1 - 0.3 * hourly_weather_data[i].cloudCover) * 255);

                            cloud_datatable.addRow([new Date(hourly_weather_data[i].time * 1000),
                                                    PrecProb,
                                                    PrecInt,
                                                    100,
                                                    rgbToHex(Clouds, Clouds, Clouds)
                                                   ]);
                        }

                        hAxis_ticks = [];
                        for (i = 0; i <= 7; i++) {
                            hAxis_ticks.push(new Date((hourly_weather_data[0].time + 24 * 3600 * i) * 1000));
                        }

                        vAxis_ticks = [2, 17, 100, 400, 1000];

                        var cloud_options = {
                            height: 500,
                            title: 'Weather for the Next Week',
                            curveType: 'function',
                            seriesType: 'line',
                            bar: {
                                groupWidth: '100%'
                            },
                            series: {
                                0: {
                                    targetAxisIndex: 0
                                },
                                1: {
                                    targetAxisIndex: 1,
                                    color: 'black'
                                },
                                2: {
                                    targetAxisIndex: 0,
                                    type: 'bars',
                                    visibleInLegend: false,
                                    enableInteractivity: false
                                }
                            },
                            legend: {
                                position: 'bottom'
                            },
                            hAxis: {
                                format: 'MMM d',
                                ticks: hAxis_ticks
                            },
                            vAxes: {
                                0: {
                                    title: 'Probability (%)',
                                    viewWindow: {
                                        min: 0,
                                        max: 100
                                    }
                                },
                                1: {
                                    logScale: true,
                                    ticks: vAxis_ticks,
                                    title: 'Intensity (mils/hr)',
                                    viewWindow: {
                                        min: 1
                                    }
                                }
                            }
                        };
                        function resize () {
                            var temp_wrapper = new google.visualization.ChartWrapper({
                                chartType: 'LineChart',
                                dataTable: temp_datatable,
                                options: temp_options,
                                containerId: 'temp_chart_div'
                            });
                            var cloud_wrapper = new google.visualization.ChartWrapper({
                                chartType: 'ComboChart',
                                dataTable: cloud_datatable,
                                options: cloud_options,
                                containerId: 'cloud_chart_div'
                            });

                            temp_wrapper.draw();
                            cloud_wrapper.draw();

                            google.visualization.events.addListener(cloud_wrapper, 'ready', function() {
                                $('.delay').show();
                            });
                        }

                        window.onload = resize();
                        window.onresize = resize;
                    },
                    error: function() {
                        $('.chart').html('Your API key was entered incorrectly.');
                    }
                });
            }, function (error) {               
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        $('.chart').html('User denied the request for Geolocation.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        $('.chart').html('Location information is unavailable.');
                        break;
                    case error.TIMEOUT:
                        $('.chart').html('The request to get user location timed out.');
                        break;
                    case error.UNKNOWN_ERROR:
                        $('.chart').html('An unknown error occurred.');
                        break;
                }
            }
        );
    } else {
        $('.chart').html('Geolocation is not supported by this browser.');
    }
}

function rgbToHex(R,G,B) {return '#' + toHex(R) + toHex(G) + toHex(B);}
function toHex(n) {
    n = parseInt(n,10);
    if (isNaN(n)) return '00';
    n = Math.max(0,Math.min(n,255));
    return '0123456789ABCDEF'.charAt((n-n%16)/16) + '0123456789ABCDEF'.charAt(n%16);
}