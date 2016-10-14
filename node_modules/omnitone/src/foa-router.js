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
 * @fileOverview An audio channel re-router to resolve different channel layouts
 *               between various platforms.
 */

var DEFAULT_CHANNEL_MAP = [0, 1, 2, 3];
var IOS_CHANNEL_MAP = [2, 0, 1, 3];
var FUMA_2_ACN_CHANNEL_MAP = [0, 3, 1, 2];


/**
 * @class A simple channel re-router.
 * @param {AudioContext} context      Associated AudioContext.
 * @param {Array} channelMap  Routing destination array.
 *                                    e.g.) Chrome: [0, 1, 2, 3],
 *                                    iOS: [2, 0, 1, 3]
 */
function FOARouter (context, channelMap) {
  this._context = context;

  this._splitter = this._context.createChannelSplitter(4);
  this._merger = this._context.createChannelMerger(4);

  this._channelMap = channelMap || DEFAULT_CHANNEL_MAP;

  this._splitter.connect(this._merger, 0, this._channelMap[0]);
  this._splitter.connect(this._merger, 1, this._channelMap[1]);
  this._splitter.connect(this._merger, 2, this._channelMap[2]);
  this._splitter.connect(this._merger, 3, this._channelMap[3]);
  
  // input/output proxy.
  this.input = this._splitter;
  this.output = this._merger;
}

FOARouter.prototype.setChannelMap = function (channelMap) {
  if (!channelMap)
    return;

  this._channelMap = channelMap;
  this._splitter.disconnect();
  this._splitter.connect(this._merger, 0, this._channelMap[0]);
  this._splitter.connect(this._merger, 1, this._channelMap[1]);
  this._splitter.connect(this._merger, 2, this._channelMap[2]);
  this._splitter.connect(this._merger, 3, this._channelMap[3]);
}

module.exports = FOARouter;
