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
 * See also:
 * https://github.com/google/spatial-media/tree/master/support/hrtfs/cube
 */

/**
 * The data for FOAVirtualSpeaker. Each entry contains the URL for IR files and
 * the gain coefficients for the associated IR files. Note that the order of
 * coefficients follows the ACN channel ordering. (W,Y,Z,X)
 * @type {Array}
 */
var FOASpeakerData = [{
  name: 'E35.26_A135',
  url: 'E35.26_A135_D1.4.wav',
  gainFactor: 1,
  coef: [.1250, 0.216495, 0.21653, -0.216495]
}, {
  name: 'E35.26_A-135',
  url: 'E35.26_A-135_D1.4.wav',
  gainFactor: 1,
  coef: [.1250, -0.216495, 0.21653, -0.216495]
}, {
  name: 'E-35.26_A135',
  url: 'E-35.26_A135_D1.4.wav',
  gainFactor: 1,
  coef: [.1250, 0.216495, -0.21653, -0.216495]
}, {
  name: 'E-35.26_A-135',
  url: 'E-35.26_A-135_D1.4.wav',
  gainFactor: 1,
  coef: [.1250, -0.216495, -0.21653, -0.216495]
}, {
  name: 'E35.26_A45',
  url: 'E35.26_A45_D1.4.wav',
  gainFactor: 1,
  coef: [.1250, 0.216495, 0.21653, 0.216495]
}, {
  name: 'E35.26_A-45',
  url: 'E35.26_A-45_D1.4.wav',
  gainFactor: 1,
  coef: [.1250, -0.216495, 0.21653, 0.216495]
}, {
  name: 'E-35.26_A45',
  url: 'E-35.26_A45_D1.4.wav',
  gainFactor: 1,
  coef: [.1250, 0.216495, -0.21653, 0.216495]
}, {
  name: 'E-35.26_A-45',
  url: 'E-35.26_A-45_D1.4.wav',
  gainFactor: 1,
  coef: [.1250, -0.216495, -0.21653, 0.216495]
}];

module.exports = FOASpeakerData;
