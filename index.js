var assign = require('lodash.assign')
var chalk = require('chalk')
var ChangesStream = require('changes-stream')
var Request = require('request')
var npmUrls = require('./lib/npm-urls')
var Url = require('url')
var queue = require('async').queue

var RewriteUrlFollower = function (opts) {
  assign(this, {
    rewrite: 'http://127.0.0.1:8080' // what hosts should URLs be rewritten to?
  }, opts)
}

RewriteUrlFollower.prototype.start = function () {
  var _this = this

  var SeqFile = require('seq-file', {
    frequency: 10
  })
  var seqFile = new SeqFile(this.seqFile)

  var changes = new ChangesStream({
    db: this.couchDB(),
    include_docs: true,
    since: seqFile.readSync()
  })

  var length = 8

  var q = queue(function (change, callback) {
    var doc = change.doc
    if (_this.shouldRewrite(doc)) {
      _this.rewriteDoc(doc)
      _this.save(doc, function (err, msg) {
        if (err) console.error(chalk.red(err.message))
        else {
          seqFile.save(change.seq)
          console.info(chalk.green(msg))
        }
        return callback()
      })
    } else {
      console.info(chalk.yellow('skipped ' + doc._id))
      return callback()
    }
  }, length)

  q.drain = function () {
    changes.resume()
  }

  setInterval(function () {
    console.log('queue length = ' + q.length())
    if (q.length() === 0) changes.resume()
  }, 3000)

  console.log('rewrite package URLs in:', this.couchDB())

  changes.on('readable', function () {
    var change = changes.read()
    if (q.length() === length) {
      changes.pause()
    }

    if (change.seq % 200 === 0) {
      Request.get({
        url: _this.couchDB(),
        json: true
      }, function (err, res, obj) {
        if (err) console.log(chalk.red(err.message))
        else if (obj) console.log('rewrite package ' + change.seq + ' of ' + obj.update_seq)
      })
    }
    q.push(change)
  })
}

RewriteUrlFollower.prototype.couchDB = function () {
  return this.scheme + '://' + this.user + ':' + this.pass + '@' + this.host + ':' + this.port + '/registry'
}

RewriteUrlFollower.prototype.shouldRewrite = function (doc) {
  var _this = this
  var toRewrite = Object.keys(doc.versions).filter(function (key) {
    var version = doc.versions[key]
    var url = version.dist.tarball
    return url.indexOf(_this.rewrite) === -1
  })

  return !!toRewrite.length
}

RewriteUrlFollower.prototype.rewriteDoc = function (doc) {
  var _this = this

  Object.keys(doc.versions).forEach(function (key) {
    var version = doc.versions[key]
    var path = npmUrls.oldTarballUrlToNew(
      doc._id,
      version.dist.tarball
    )
    doc.versions[key].dist.tarball = Url.resolve(_this.rewrite, path)
  })
}

RewriteUrlFollower.prototype.save = function (doc, callback) {
  var name = doc._id.replace(/\//g, '%2F')
  var url = this.couchDB() + '/' + name

  delete doc._rev

  this.getPackageJson(name, function (err, body) {
    if (err && err.message !== 'unexpected status code 404') return callback(err)
    // packge not yet indexed, use different url.
    if (body) doc._rev = body._rev

    var opts = {
      method: 'PUT',
      url: url,
      json: doc
    }

    Request(opts, function (err, response, body) {
      if (err) return callback(err)
      if (response.statusCode === 409) {
        // conflict! just move along.
        callback(null, 'conflict with ' + name)
        return
      }

      if (response.statusCode < 200 || response.statusCode >= 400) {
        var error = new Error('unexpected status code ' + response.statusCode)
        error.details = body
        return callback(error)
      }

      callback(null, 'published ' + name)
    })
  })
}

RewriteUrlFollower.prototype.getPackageJson = function (name, callback) {
  var opts = {
    method: 'GET',
    url: this.couchDB() + '/' + name + '?revs=true',
    json: true
  }

  Request(opts, function (err, response, body) {
    if (err) return callback(err)
    if (response.statusCode < 200 || response.statusCode >= 400) {
      return callback(new Error('unexpected status code ' + response.statusCode))
    }
    callback(null, body)
  })
}

module.exports = RewriteUrlFollower
