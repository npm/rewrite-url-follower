/* global describe it */

var fs = require('fs')
var RewriteUrlFollower = require('../')

require('chai').should()

describe('rewrite-url-follower', function () {
  describe('rewriteDoc', function () {
    it('handles old urls', function () {
      var rewriteUrlFollower = new RewriteUrlFollower({
        rewrite: 'https://127.0.0.1'
      })
      var doc = JSON.parse(fs.readFileSync(
        './test/fixtures/old-style-url.json'
      ))
      rewriteUrlFollower.rewriteDoc(doc)
      doc.versions['1.0.4'].dist.tarball.should.equal(
        'https://127.0.0.1/required-keys/-/required-keys-1.0.4.tgz'
      )
    })

    it('handles new urls', function () {
      var rewriteUrlFollower = new RewriteUrlFollower()
      var doc = JSON.parse(fs.readFileSync(
        './test/fixtures/new-style-url.json'
      ))
      rewriteUrlFollower.rewriteDoc(doc)
      doc.versions['1.0.4'].dist.tarball.should.equal(
        'http://127.0.0.1:8080/@/@airgap/pork-chop-sandwiches/_attachments/pork-chop-sandwiches-1.0.4.tgz'
      )
    })
  })

  describe('shouldRewrite', function () {
    it('should return false if URLs are already rewritten', function () {
      var rewriteUrlFollower = new RewriteUrlFollower({
        rewrite: 'http://50.193.14.69:8080'
      })
      var doc = JSON.parse(fs.readFileSync(
        './test/fixtures/new-style-url.json'
      ))
      rewriteUrlFollower.shouldRewrite(doc).should.equal(false)
    })

    it('should return true if URLs have not been rewritten', function () {
      var rewriteUrlFollower = new RewriteUrlFollower({
        rewrite: 'http://example.com:8080'
      })
      var doc = JSON.parse(fs.readFileSync(
        './test/fixtures/new-style-url.json'
      ))
      rewriteUrlFollower.shouldRewrite(doc).should.equal(true)
    })
  })
})
