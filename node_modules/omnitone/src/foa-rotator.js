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

'use strict';


/**
 * @fileOverview Sound field rotator for first-order-ambisonics decoding.
 */


/**
 * @class First-order-ambisonic decoder based on gain node network.
 * @param {AudioContext} context    Associated AudioContext.
 */
function FOARotator (context) {
  this._context = context;

  this._splitter = this._context.createChannelSplitter(4);
  this._inY = this._context.createGain();
  this._inZ = this._context.createGain();
  this._inX = this._context.createGain();
  this._m0 = this._context.createGain();
  this._m1 = this._context.createGain();
  this._m2 = this._context.createGain();
  this._m3 = this._context.createGain();
  this._m4 = this._context.createGain();
  this._m5 = this._context.createGain();
  this._m6 = this._context.createGain();
  this._m7 = this._context.createGain();
  this._m8 = this._context.createGain();
  this._outY = this._context.createGain();
  this._outZ = this._context.createGain();
  this._outX = this._context.createGain();
  this._merger = this._context.createChannelMerger(4);

    // ACN channel ordering: [1, 2, 3] => [-Y, Z, -X]
  this._splitter.connect(this._inY, 1); // Y (from channel 1)
  this._splitter.connect(this._inZ, 2); // Z (from channel 2)
  this._splitter.connect(this._inX, 3); // X (from channel 3)
  this._inY.gain.value = -1;
  this._inX.gain.value = -1;

  // Apply the rotation in the world space.
  // |Y|   | m0  m3  m6 |   | Y * m0 + Z * m3 + X * m6 |   | Yr |
  // |Z| * | m1  m4  m7 | = | Y * m1 + Z * m4 + X * m7 | = | Zr |
  // |X|   | m2  m5  m8 |   | Y * m2 + Z * m5 + X * m8 |   | Xr |
  this._inY.connect(this._m0);
  this._inY.connect(this._m1);
  this._inY.connect(this._m2);
  this._inZ.connect(this._m3);
  this._inZ.connect(this._m4);
  this._inZ.connect(this._m5);
  this._inX.connect(this._m6);
  this._inX.connect(this._m7);
  this._inX.connect(this._m8);
  this._m0.connect(this._outY);
  this._m1.connect(this._outZ);
  this._m2.connect(this._outX);
  this._m3.connect(this._outY);
  this._m4.connect(this._outZ);
  this._m5.connect(this._outX);
  this._m6.connect(this._outY);
  this._m7.connect(this._outZ);
  this._m8.connect(this._outX);

  // Transform 3: world space to audio space.
  this._splitter.connect(this._merger, 0, 0); // W -> W (to channel 0)
  this._outY.connect(this._merger, 0, 1); // Y (to channel 1)
  this._outZ.connect(this._merger, 0, 2); // Z (to channel 2)
  this._outX.connect(this._merger, 0, 3); // X (to channel 3)
  this._outY.gain.value = -1;
  this._outX.gain.value = -1;

  this.setRotationMatrix(new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]));

  // input/output proxy.
  this.input = this._splitter;
  this.output = this._merger;
}


/**
 * Set 3x3 matrix for soundfield rotation.
 * @param {Array} rotationMatrix    A 3x3 matrix of soundfield rotation. The
 *                                  matrix is in the row-major representation.
 */
FOARotator.prototype.setRotationMatrix = function (rotationMatrix) {
  this._m0.gain.value = rotationMatrix[0];
  this._m1.gain.value = rotationMatrix[1];
  this._m2.gain.value = rotationMatrix[2];
  this._m3.gain.value = rotationMatrix[3];
  this._m4.gain.value = rotationMatrix[4];
  this._m5.gain.value = rotationMatrix[5];
  this._m6.gain.value = rotationMatrix[6];
  this._m7.gain.value = rotationMatrix[7];
  this._m8.gain.value = rotationMatrix[8];
};


/**
 * Returns the current rotation matrix.
 * @return {Array}                  A 3x3 matrix of soundfield rotation. The
 *                                  matrix is in the row-major representation.
 */
FOARotator.prototype.getRotationMatrix = function () {
  return [
    this._m0.gain.value, this._m1.gain.value, this._m2.gain.value,
    this._m3.gain.value, this._m4.gain.value, this._m5.gain.value,
    this._m6.gain.value, this._m7.gain.value, this._m8.gain.value
  ];
};


module.exports = FOARotator;
