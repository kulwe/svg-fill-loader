var chai = require('chai');
var sinon = require('sinon');
chai.should();
chai.use(require('sinon-chai'));

var loader = require('../lib/loader');
var parseQuery = loader.parseQuery;
var mockContext = require('../../webpack-toolkit/lib/MockedLoaderContext');

/**
 * @param {String} content
 * @param {Object} context
 * @returns {Promise}
 */
function runInFakeContext(content, context) {
  var context = mockContext(context);
  return context.run(loader, content);
}

describe('SVG fill loader', function() {

  describe('parseQuery', function () {
    it('should properly parse param values which contains comma', function() {
      parseQuery('?query=a,b').should.eql({
        query: 'a,b'
      });
    });
  });

  it('should be cacheable', function (done) {
    var context = mockContext();

    context.run(loader, '')
      .then(function () {
        context.isCacheable.should.eql(true);
        done();
      })
      .catch(done);
  });

  it('`raw` option is true by default', function(done) {
    runInFakeContext('<svg></svg>', {query: ''})
      .then(function(result) {
        result.should.not.contain('module.exports');
        done();
      })
      .catch(done);
  });

  it('should allow to disable `raw` properly', function(done) {
    runInFakeContext('<svg></svg>', {query: '?raw=false'})
      .then(function(result) {
        result.should.contain('module.exports');
        done();
      })
      .catch(done);
  });

  it('should allow to configure default options via loader config', function(done) {
    var input = '<path /><circle /><polygon />';
    var expected = '<path fill="red" /><circle fill="red" /><polygon />';

    runInFakeContext(input, {
      query: '?selector=path,circle&fill=red'
    })
      .then(function(result) {
        result.should.eql(expected);
        done();
      })
      .catch(done);
  });

  it('should allow to mix loader config with resource query params', function(done) {
    var input = '<path /><circle />';
    var expected = '<path fill="blue" /><circle />';

    runInFakeContext(input, {
      query: '?selector=path',
      resourceQuery: '?fill=blue'
    })
      .then(function(result) {
        result.should.eql(expected);
        done();
      })
      .catch(done);
  });

});