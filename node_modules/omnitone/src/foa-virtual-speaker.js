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
 * @fileOverview Virtual speaker abstraction for first-order-ambisonics
 *               decoding.
 */

'use strict';

/**
 * @class FOAVirtualSpeaker
 * @description A virtual speaker with ambisonic decoding gain coefficients
 *              and HRTF convolution for first-order-ambisonics stream.
 *              Note that the subgraph directly connects to context's
 *              destination.
 * @param {AudioContext} context        Associated AudioContext.
 * @param {Object} options              Options for speaker.
 * @param {Array} options.coefficients  Decoding coefficients for (W,Y,Z,X).
 * @param {AudioBuffer} options.IR      Stereo IR buffer for HRTF convolution.
 * @param {Number} options.gain         Post-gain for the speaker.
 */
function FOAVirtualSpeaker (context, options) {
  if (options.IR.numberOfChannels !== 2)
    throw 'IR does not have 2 channels. cannot proceed.';

  this._active = false;
  
  this._context = context;

  this._input = this._context.createChannelSplitter(4);
  this._cW = this._context.createGain();
  this._cY = this._context.createGain();
  this._cZ = this._context.createGain();
  this._cX = this._context.createGain();
  this._convolver = this._context.createConvolver();
  this._gain = this._context.createGain();

  this._input.connect(this._cW, 0);
  this._input.connect(this._cY, 1);
  this._input.connect(this._cZ, 2);
  this._input.connect(this._cX, 3);
  this._cW.connect(this._convolver);
  this._cY.connect(this._convolver);
  this._cZ.connect(this._convolver);
  this._cX.connect(this._convolver);
  this._convolver.connect(this._gain);
  this._gain.connect(this._context.destination);

  this.enable();

  this._convolver.normalize = false;
  this._convolver.buffer = options.IR;
  this._gain.gain.value = options.gain;

  // Set gain coefficients for FOA ambisonic streams.
  this._cW.gain.value = options.coefficients[0];
  this._cY.gain.value = options.coefficients[1];
  this._cZ.gain.value = options.coefficients[2];
  this._cX.gain.value = options.coefficients[3];

  // Input proxy. Output directly connects to the destination.
  this.input = this._input;
}

FOAVirtualSpeaker.prototype.enable = function () {
  this._gain.connect(this._context.destination);
  this._active = true;
};

FOAVirtualSpeaker.prototype.disable = function () {
  this._gain.disconnect();
  this._active = false;
};

module.exports = FOAVirtualSpeaker;
