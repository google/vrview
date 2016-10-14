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


describe('FOARouter', function () {

  var sampleRate = 48000;
  var renderLength = 0.1 * sampleRate;
  var context;
  var testBuffer;

  // A common task for router tests. Create OAC for rendering.
  beforeEach(function (done) {
    context = new OfflineAudioContext(4, renderLength, sampleRate);

    testBuffer = context.createBuffer(4, renderLength, sampleRate);
    for (var c = 0; c < testBuffer.numberOfChannels; c++) {
      var channelData = testBuffer.getChannelData(c);
      for (var i = 0; i < channelData.length; i++) {
        channelData[i] = c;
      }
    }

    done();
  });


  it('Passing a channel map array to the constructor should work properly.', 
      function (done) {
        // Use constructor to set the channel map.
        var router = Omnitone.createFOARouter(context, [1, 2, 0, 3]);
        var source = context.createBufferSource();
        source.buffer = testBuffer;

        source.connect(router.input);
        router.output.connect(context.destination);
        source.start();

        // With the router configuration above, this is what must be rendered.
        //   Channel #0: value [0] => (to channel #1) => value [2]
        //   Channel #1: value [1] => (to channel #2) => value [0]
        //   Channel #2: value [2] => (to channel #0) => value [1]
        //   Channel #3: value [3] => (to channel #3) => value [3]
        var expectedValues = [2, 0, 1, 3];
        var passed = false;
        context.startRendering().then(function (renderedBuffer) {
          for (c = 0; c < renderedBuffer.numberOfChannels; c++) {
            passed = isConstantValueOf(
              renderedBuffer.getChannelData(c), expectedValues[c]);
            expect(passed).to.equal(true);
          }
          done();
        });
      }
  );


  it('Using #setChannelMap to change the channel map should work properly.', 
      function (done) {
        var router = Omnitone.createFOARouter(context);
        var source = context.createBufferSource();
        source.buffer = testBuffer;

        source.connect(router.input);
        router.output.connect(context.destination);
        source.start();

        // Use setChannleMap() method.
        router.setChannelMap([0, 3, 1, 2]);

        // With the router configuration above, this is what must be rendered.
        //   Channel #0: value [0] => (to channel #0) => value [0]
        //   Channel #1: value [1] => (to channel #3) => value [2]
        //   Channel #2: value [2] => (to channel #1) => value [3]
        //   Channel #3: value [3] => (to channel #2) => value [1]
        var expectedValues = [0, 2, 3, 1];
        var passed = false;
        context.startRendering().then(function (renderedBuffer) {
          for (c = 0; c < renderedBuffer.numberOfChannels; c++) {
            passed = isConstantValueOf(
              renderedBuffer.getChannelData(c), expectedValues[c]);
            expect(passed).to.equal(true);
          }
          done();
        });
      }
  );


});
