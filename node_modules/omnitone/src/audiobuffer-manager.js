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
 * @fileOverview Audio buffer loading utility.
 */

'use strict';

var Utils = require('./utils.js');

/**
 * Streamlined audio file loader supports Promise.
 * @param {Object} context          AudioContext
 * @param {Object} audioFileData    Audio file info as [{name, url}]
 * @param {Function} resolve        Resolution handler for promise.
 * @param {Function} reject         Rejection handler for promise.
 * @param {Function} progress       Progress event handler.
 */
function AudioBufferManager(context, audioFileData, resolve, reject, progress) {
  this._context = context;

  this._buffers = new Map();
  this._loadingTasks = {};

  this._resolve = resolve;
  this._reject = reject;
  this._progress = progress;

  // Iterating file loading.
  for (var i = 0; i < audioFileData.length; i++) {
    var fileInfo = audioFileData[i];

    // Check for duplicates filename and quit if it happens.
    if (this._loadingTasks.hasOwnProperty(fileInfo.name)) {
      Utils.LOG('Duplicated filename when loading: ' + fileInfo.name);
      return;
    }

    // Mark it as pending (0)
    this._loadingTasks[fileInfo.name] = 0;
    this._loadAudioFile(fileInfo);
  }
}

AudioBufferManager.prototype._loadAudioFile = function (fileInfo) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', fileInfo.url);
  xhr.responseType = 'arraybuffer';

  var that = this;
  xhr.onload = function () {
    if (xhr.status === 200) {
      that._context.decodeAudioData(xhr.response,
        function (buffer) {
          // Utils.LOG('File loaded: ' + fileInfo.url);
          that._done(fileInfo.name, buffer);
        },
        function (message) {
          Utils.LOG('Decoding failure: '
            + fileInfo.url + ' (' + message + ')');
          that._done(fileInfo.name, null);
        });
    } else {
      Utils.LOG('XHR Error: ' + fileInfo.url + ' (' + xhr.statusText 
        + ')');
      that._done(fileInfo.name, null);
    }
  };

  // TODO: fetch local resources if XHR fails.
  xhr.onerror = function (event) {
    Utils.LOG('XHR Network failure: ' + fileInfo.url);
    that._done(fileInfo.name, null);
  };

  xhr.send();
};

AudioBufferManager.prototype._done = function (filename, buffer) {
  // Label the loading task.
  this._loadingTasks[filename] = buffer !== null ? 'loaded' : 'failed';

  // A failed task will be a null buffer.
  this._buffers.set(filename, buffer);

  this._updateProgress(filename);
};

AudioBufferManager.prototype._updateProgress = function (filename) {
  var numberOfFinishedTasks = 0, numberOfFailedTask = 0;
  var numberOfTasks = 0;

  for (var task in this._loadingTasks) {
    numberOfTasks++;
    if (this._loadingTasks[task] === 'loaded')
      numberOfFinishedTasks++;
    else if (this._loadingTasks[task] === 'failed')
      numberOfFailedTask++;
  }

  if (typeof this._progress === 'function')
    this._progress(filename, numberOfFinishedTasks, numberOfTasks);

  if (numberOfFinishedTasks === numberOfTasks)
    this._resolve(this._buffers);

  if (numberOfFinishedTasks + numberOfFailedTask === numberOfTasks)
    this._reject(this._buffers);
};

module.exports = AudioBufferManager;
