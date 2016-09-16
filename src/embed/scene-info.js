/*
 * Copyright 2015 Google Inc. All Rights Reserved.
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

var camelToUnderscore = {
  video: 'video',
  image: 'image',
  preview: 'preview',
  isStereo: 'is_stereo',
  defaultYaw: 'default_yaw',
  isYawOnly: 'is_yaw_only',
  isDebug: 'is_debug',
  isVROff: 'is_vr_off',
  isAutopanOff: 'is_autopan_off',
};

/**
 * Contains all information about a given scene.
 */
function SceneInfo(opt_params) {
  var params = opt_params || {};

  this.image = params.image;
  this.preview = params.preview;
  this.video = params.video;
  this.defaultYaw = THREE.Math.degToRad(params.defaultYaw || 0);

  this.isStereo = Util.parseBoolean(params.isStereo);
  this.isYawOnly = Util.parseBoolean(params.isYawOnly);
  this.isDebug = Util.parseBoolean(params.isDebug);
  this.isVROff = Util.parseBoolean(params.isVROff);
  this.isAutopanOff = Util.parseBoolean(params.isAutopanOff);
}

SceneInfo.loadFromGetParams = function() {
  var params = {};
  for (var camelCase in camelToUnderscore) {
    var underscore = camelToUnderscore[camelCase];
    params[camelCase] = Util.getQueryParameter(underscore);
  }
  var scene = new SceneInfo(params);
  if (!scene.isValid()) {
    return false;
  }
  return scene;
};

SceneInfo.loadFromAPIParams = function(underscoreParams) {
  var params = {};
  for (var camelCase in camelToUnderscore) {
    var underscore = camelToUnderscore[camelCase];
    if (underscoreParams[underscore]) {
      params[camelCase] = underscoreParams[underscore];
    }
  }
  var scene = new SceneInfo(params);
  if (!scene.isValid()) {
    return false;
  }
  return scene;
};

SceneInfo.prototype.isComplete = function() {
  return !!this.image || !!this.video;
};

SceneInfo.prototype.isValid = function() {
  // Either it's an image or a video.
  var imageXorVideo = (this.image && !this.video) || (!this.image && this.video);
  if (!imageXorVideo) {
    this.errorMessage = 'Image or video (and not both) must be specified.';
    return false;
  }
  this.errorMessage = null;
  return true;
};


module.exports = SceneInfo;
