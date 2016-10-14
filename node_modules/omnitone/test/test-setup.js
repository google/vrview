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

var expect = chai.expect;
var should = chai.should();


/**
 * Check if the array is filled with the specified value only.
 * @param  {Float32Array} channelData The target array for testing.
 * @param  {Number} value             A value for the testing.
 * @return {Boolean}
 */
function isConstantValueOf(channelData, value) {
  var mismatches = {};
  for (var i = 0; i < channelData.length; i++) {
      if (channelData[i] !== value)
      mismatches[i] = channelData[i];
  }

  var numberOfmismatches = Object.keys(mismatches).length;
  return numberOfmismatches === 0;
};
