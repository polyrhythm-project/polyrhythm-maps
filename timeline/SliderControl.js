L.Control.SliderControl = L.Control.extend({

	options: {
		position: 'bottomright',
		timeAttribute: 'premiere_year',
		isEpoch: false,     // whether the time attribute is seconds elapsed from epoch
		startTimeIdx: 0,    // where to start looking for a timestring
		timeStrLength: 4,   // the size of  yyyy-mm-dd hh:mm:ss - if millis are present this will be larger
		maxValue: -1,
		minValue: 0,
		showAllOnStart: false,
		markers: null,
		range: true,
		follow: false,
		sameDate: false,
		alwaysShowDate : false,
		rezoom: null
	},

	initialize: function (options) {
		L.Util.setOptions(this, options);
		this._layer = this.options.layer;
	},

	extractTimestamp: function(time, options) {
		if (options.isEpoch) {
		    time = (new Date(parseInt(time))).toString(); // local time
		}
		return time.substr(options.startTimeIdx, options.startTimeIdx + options.timeStrLength);
	},

	setPosition: function (position) {
		let map = this._map;
		if (map) {
		    map.removeControl(this);
		}
		this.options.position = position;
		if (map) {
		    map.addControl(this);
		}
		this.startSlider();
		return this;
	},

	onAdd: function (map) {
		this.options.map = map;
		// Create a control sliderContainer with a jquery ui slider
		// Add image source for static graph. Still need to make div size responsive 
		let sliderContainer = L.DomUtil.create('div', 'slider', this._container);
		$(sliderContainer).append('<img src="./works-premiered_20230404.png" style="width:300px; margin-right:80%; padding: 0px 0px 10px 0px;"><div id="leaflet-slider" style="width:300px;"><div class="ui-slider-handle"></div><div id="slider-timestamp" style="width:200px; margin-top:13px; background-color:#FFFFFF; text-align:center; border-radius:5px;"></div>');
		//Prevent map panning/zooming while using the slider
		$(sliderContainer).mousedown(function () {
		    map.dragging.disable();
		});
		$(document).mouseup(function () {
		    map.dragging.enable();
		    //Hide the slider timestamp if not range and option alwaysShowDate is set on false
		    if (options.range || !options.alwaysShowDate) {
				$('#slider-timestamp').html('');
		    }
		});
		let options = this.options;
		this.options.markers = [];
		//If a layer has been provided: calculate the min and max values for the slider
		if (this._layer) {
		    let index_temp = 0;
		    this._layer.eachLayer(function (layer) {
				options.markers[index_temp] = layer;
				++index_temp;
		    });
		    options.maxValue = index_temp - 1;
		    this.options = options;
		} else {
		    console.log("Error: You have to specify a layer via new SliderControl({layer: your_layer});");
		}
		return sliderContainer;
	},

	onRemove: function (map) {
		//Delete all markers which where added via the slider and remove the slider div
		for (i = this.options.minValue; i <= this.options.maxValue; i++) {
		    map.removeLayer(this.options.markers[i]);
		}
		$('#leaflet-slider').remove();

		// unbind listeners to prevent memory leaks
		$(document).off("mouseup");
		$(".slider").off("mousedown");
	},

	startSlider: function () {
		_options = this.options;
		_extractTimestamp = this.extractTimestamp
		let index_start = _options.minValue;
		if (_options.showAllOnStart) {
			index_start = _options.maxValue;
			if (_options.range) {
				_options.values = [_options.minValue,_options.maxValue];
			} else {
				_options.value = _options.maxValue;
			}
		}
		$("#leaflet-slider").slider({
			range: _options.range,
			value: _options.value,
			values: _options.values,
			min: _options.minValue,
			max: _options.maxValue,
			sameDate: _options.sameDate,
			step: 1,
			slide: function (e, ui) {
				let map = _options.map;
				let fg = L.featureGroup();
				if (!!_options.markers[ui.value]) {
					// If there is no time property, this line has to be removed (or exchanged with a different property)
					if (_options.markers[ui.value].feature !== undefined) {
						if (_options.markers[ui.value].feature.properties[_options.timeAttribute]){
							if (_options.markers[ui.value]) $('#slider-timestamp').html(
								_extractTimestamp(_options.markers[ui.value].feature.properties[_options.timeAttribute], _options));
						} else {
							console.error("Time property "+ _options.timeAttribute +" not found in data");
						}
					} else {
						// set by leaflet Vector Layers
						if (_options.markers [ui.value].options[_options.timeAttribute]){
							if (_options.markers[ui.value]) $('#slider-timestamp').html(
								_extractTimestamp(_options.markers[ui.value].options[_options.timeAttribute], _options));
						} else {
							console.error("Time property "+ _options.timeAttribute +" not found in data");
						}
					}
					// clear markers
					for (let i = _options.minValue; i <= _options.maxValue; i++) {
						if (_options.markers[i]) map.removeLayer(_options.markers[i]);
					}
					if (_options.range){
						// jquery ui using range
						for (i = ui.values[0]; i <= ui.values[1]; i++){
							if (_options.markers[i]) {
								map.addLayer(_options.markers[i]);
								fg.addLayer(_options.markers[i]);
							}
						}
					} else if (_options.follow){
						for (let i = ui.value - _options.follow + 1; i <= ui.value ; i++) {
							if (_options.markers[i]) {
								map.addLayer(_options.markers[i]);
								fg.addLayer(_options.markers[i]);
							}
						}
					} else if (_options.sameDate) {
						let currentTime;
						if (_options.markers[ui.value].feature !== undefined) {
							currentTime = _options.markers[ui.value].feature.properties.time;
						} else {
							currentTime = _options.markers[ui.value].options.time;
						}
						for (let i=_options.minValue; i<=_options.maxValue; i++) {
							if (_options.markers[i].options.time == currentTime) map.addLayer(_options.markers[i]);
						}
					} else {
						for (let i = _options.minValue; i <= ui.value ; i++) {
							if (_options.markers[i]) {
								map.addLayer(_options.markers[i]);
								fg.addLayer(_options.markers[i]);
							}
						}
					}
				};
				if (_options.rezoom) {
					map.fitBounds(fg.getBounds(), {
						maxZoom: _options.rezoom
					});
				}
			}
		});
		if (!_options.range && _options.alwaysShowDate) {
			$('#slider-timestamp').html(_extractTimeStamp(_options.markers[index_start].feature.properties[_options.timeAttribute], _options));
		}
		for (let i=_options.minValue; i<=index_start; i++) {
			_options.map.addLayer(_options.markers[i]);
		}
	}
});

L.control.sliderControl = function (options) {
	return new L.Control.SliderControl(options);
};



