/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */



/**
 * @fileOverview Phase matched filter for first-order-ambisonics decoding.
 */

'use strict';

var Utils = require('./utils.js');

// Static parameters.
var FREQUENCY = 700;
var COEFFICIENTS = [1.4142, 0.8166, 0.8166, 0.8166];

/**
 * @class FOAPhaseMatchedFilter
 * @description A set of filters (LP/HP) with a crossover frequency to
 *              compensate the gain of high frequency contents without a phase
 *              difference.
 * @param {AudioContext} context        Associated AudioContext.
 */
function FOAPhaseMatchedFilter (context) {
  this._context = context;

  this._input = this._context.createGain();

  // TODO: calculate the freq/reso based on the context sample rate.
  if (!this._context.createIIRFilter) {
    Utils.LOG('IIR filter is missing. Using Biquad filter instead.');
    this._lpf = this._context.createBiquadFilter();
    this._hpf = this._context.createBiquadFilter();
    this._lpf.frequency.value = FREQUENCY;
    this._hpf.frequency.value = FREQUENCY;
    this._hpf.type = 'highpass';
  } else {
    this._lpf = this._context.createIIRFilter(
      [0.00058914319, 0.0011782864, 0.00058914319],
      [1, -1.9029109, 0.90526748]
    );
    this._hpf = this._context.createIIRFilter(
      [0.95204461, -1.9040892, 0.95204461],
      [1, -1.9029109, 0.90526748]
    );
  }

  this._splitterLow = this._context.createChannelSplitter(4);
  this._splitterHigh = this._context.createChannelSplitter(4);
  this._gainHighW = this._context.createGain();
  this._gainHighY = this._context.createGain();
  this._gainHighZ = this._context.createGain();
  this._gainHighX = this._context.createGain();
  this._merger = this._context.createChannelMerger(4);

  this._input.connect(this._hpf);
  this._hpf.connect(this._splitterHigh);
  this._splitterHigh.connect(this._gainHighW, 0);
  this._splitterHigh.connect(this._gainHighY, 1);
  this._splitterHigh.connect(this._gainHighZ, 2);
  this._splitterHigh.connect(this._gainHighX, 3);
  this._gainHighW.connect(this._merger, 0, 0);
  this._gainHighY.connect(this._merger, 0, 1);
  this._gainHighZ.connect(this._merger, 0, 2);
  this._gainHighX.connect(this._merger, 0, 3);

  this._input.connect(this._lpf);
  this._lpf.connect(this._splitterLow);
  this._splitterLow.connect(this._merger, 0, 0);
  this._splitterLow.connect(this._merger, 0, 1);
  this._splitterLow.connect(this._merger, 0, 2);
  this._splitterLow.connect(this._merger, 0, 3);

  // Apply gain correction to hi-passed pressure and velocity components:
  // Inverting sign is necessary as the low-passed and high-passed portion are
  // out-of-phase after the filtering.
  this._gainHighW.gain.value = -1 * COEFFICIENTS[0];
  this._gainHighY.gain.value = -1 * COEFFICIENTS[1];
  this._gainHighZ.gain.value = -1 * COEFFICIENTS[2];
  this._gainHighX.gain.value = -1 * COEFFICIENTS[3];

  // Input/output Proxy.
  this.input = this._input;
  this.output = this._merger;
}

module.exports = FOAPhaseMatchedFilter;
