/* global describe it before afterEach beforeEach after xit */
/* eslint-disable no-unused-expressions */
var jet = require('../lib/jet')
var sinon = require('sinon')
var expect = require('chai').expect
var util = require('util')
var MessageSocket = require('../lib/jet/message-socket').MessageSocket

var waitTime = (process.env.TRAVIS && 100) || 40

var StateArray = function (peer) {
  this.peer = peer
}

util.inherits(StateArray, Array)

StateArray.prototype.addAll = function (states) {
  var that = this
  states = states || []
  states.forEach(function (state) {
    that.push(state)
  })
  for (var i = 0; i < this.length; ++i) {
    this[i] = new jet.State(this[i].path, this[i].value)
  }
  return Promise.all(this.map(function (state) {
    return that.peer.add(state)
  }))
}

StateArray.prototype.removeAll = function (done) {
  Promise.all(this.map(function (state) {
    return state.remove()
  })).then(function () {
    done()
  }).catch(done)
}

var portBase = 4345

;['full', 'simple'].forEach(function (fetchType) {
  describe('Fetch (' + fetchType + ') tests with daemon and peer ', function () {
    var daemon
    var peer
    var port = ++portBase

    before(function (done) {
      daemon = new jet.Daemon({
        features: {
          fetch: fetchType
        }
      })

      daemon.listen({
        wsPort: port
      })

      peer = new jet.Peer({
        url: 'ws://localhost:' + port
      })

      peer.connect().then(function () {
        done()
      })
    })

    after(function () {
      peer.close()
    })

    it('can do fetch / unfetch immediatly', function (done) {
      var fetcher = new jet.Fetcher()
        .path('startsWith', 'a')
        .on('data', function () {})
      peer.fetch(fetcher)
      fetcher.unfetch().then(done)
    })

    describe('fetch chaining', function () {
      var states

      beforeEach(function () {
        states = new StateArray(peer)
      })

      afterEach(function (done) {
        states.removeAll(function () {
          done()
        })
      })

      it('fetch().path("startsWith", ...).run(cb)', function (done) {
        states.push({
          path: 'abc',
          value: 1
        })

        states.push({
          path: 'Aa',
          value: 2
        })

        states.push({
          path: 'ca',
          value: 3
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()

          var a2 = new jet.State('aXXX', 3)
          peer.add(a2)

          var fetcher = new jet.Fetcher()
            .path('startsWith', 'a')
            .on('data', fetchSpy)

          peer.fetch(fetcher)
            .then(function () {
              a2.remove().then(function () {
                setTimeout(function () {
                  expect(fetchSpy.callCount).to.equal(3)
                  expect(fetchSpy.calledWith({
                    path: 'abc',
                    event: 'add',
                    value: 1,
                    fetchOnly: true
                  })).to.be.true
                  expect(fetchSpy.calledWith({
                    path: 'aXXX',
                    event: 'add',
                    value: 3,
                    fetchOnly: true
                  })).to.be.true
                  expect(fetchSpy.calledWith({
                    path: 'aXXX',
                    event: 'remove',
                    value: 3
                  })).to.be.true
                  fetcher.unfetch().then(function () {
                    done()
                  })
                }, waitTime)
              })
            }).catch(done)
        })
      })

      xit('fetch promise resolves before fetch data arrives', function (done) {
        states.push({
          path: 'abc',
          value: 1
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()
          var fetcher = new jet.Fetcher()
            .path('equals', 'abc')
            .on('data', fetchSpy)

          peer.fetch(fetcher).then(function () {
            expect(fetchSpy.callCount).to.equal(0)
            fetcher.unfetch().then(function () {
              done()
            })
          })
        })
      })

      it('immediate value changes are fetch in correct order', function (done) {
        states.push({
          path: 'abc',
          value: 1
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()
          var fetcher = new jet.Fetcher()
            .path('equals', 'abc')
            .on('data', fetchSpy)

          peer.fetch(fetcher)

          states[0].value(2)

          setTimeout(function () {
            expect(fetchSpy.callCount).to.equal(2)
            expect(fetchSpy.calledWith({
              path: 'abc',
              event: 'add',
              value: 1,
              fetchOnly: true
            })).to.be.true
            expect(fetchSpy.calledWith({
              path: 'abc',
              event: 'change',
              value: 2
            })).to.be.true
            fetcher.unfetch().then(function () {
              done()
            })
          }, waitTime)
        })
      })

      it('fetch().path("equalsOneOf", [...])', function (done) {
        states.push({
          path: 'abc',
          value: 1
        })

        states.push({
          path: 'Aa',
          value: 2
        })

        states.push({
          path: 'Aaa',
          value: 3
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()

          var fetcher = new jet.Fetcher()
            .path('equalsOneOf', ['abc', 'Aa'])
            .on('data', fetchSpy)

          peer.fetch(fetcher)

          setTimeout(function () {
            expect(fetchSpy.callCount).to.equal(2)
            expect(fetchSpy.calledWith({
              path: 'abc',
              event: 'add',
              value: 1,
              fetchOnly: true
            })).to.be.true
            expect(fetchSpy.calledWith({
              path: 'Aa',
              event: 'add',
              value: 2,
              fetchOnly: true
            })).to.be.true
            fetcher.unfetch().then(function () {
              done()
            })
          }, waitTime)
        }).catch(done)
      })

      it('startsWith case insensitive', function (done) {
        states.push({
          path: 'abc',
          value: 1
        })

        states.push({
          path: 'Aa',
          value: 2
        })

        states.push({
          path: 'ca',
          value: 3
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()
          var a2 = new jet.State('aXXX', 3)
          peer.add(a2)

          var fetcher = new jet.Fetcher()
            .path('startsWith', 'a')
            .pathCaseInsensitive()
            .on('data', fetchSpy)

          peer.fetch(fetcher)
            .then(function () {
              a2.remove()
            })

          setTimeout(function () {
            expect(fetchSpy.callCount).to.equal(4)
            expect(fetchSpy.calledWith({
              path: 'Aa',
              event: 'add',
              value: 2,
              fetchOnly: true
            })).to.be.true
            expect(fetchSpy.calledWith({
              path: 'abc',
              event: 'add',
              value: 1,
              fetchOnly: true
            })).to.be.true
            expect(fetchSpy.calledWith({
              path: 'aXXX',
              event: 'add',
              value: 3,
              fetchOnly: true
            })).to.be.true
            expect(fetchSpy.calledWith({
              path: 'aXXX',
              event: 'remove',
              value: 3
            })).to.be.true
            fetcher.unfetch().then(function () {
              done()
            })
          }, waitTime)
        }).catch(done)
      })

      it('contains (explicit)', function (done) {
        states.push({
          path: 'abc',
          value: 1
        })

        states.push({
          path: 'Abcd',
          value: 2
        })

        states.push({
          path: 'ca',
          value: 3
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()
          var fetcher = new jet.Fetcher()
            .path('contains', 'bc')
            .on('data', fetchSpy)

          peer.fetch(fetcher)

          setTimeout(function () {
            expect(fetchSpy.callCount).to.equal(2)
            expect(fetchSpy.calledWith({
              path: 'Abcd',
              event: 'add',
              value: 2,
              fetchOnly: true
            })).to.be.true
            expect(fetchSpy.calledWith({
              path: 'abc',
              event: 'add',
              value: 1,
              fetchOnly: true
            })).to.be.true
            fetcher.unfetch().then(function () {
              done()
            })
          }, waitTime)
        }).catch(done)
      })

      it('equals', function (done) {
        states.push({
          path: 'abc',
          value: 1
        })

        states.push({
          path: 'Abcd',
          value: 2
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()
          var fetcher = new jet.Fetcher()
            .path('equals', 'abc')
            .on('data', fetchSpy)

          peer.fetch(fetcher)
          setTimeout(function () {
            expect(fetchSpy.callCount).to.equal(1)
            expect(fetchSpy.calledWith({
              path: 'abc',
              event: 'add',
              value: 1,
              fetchOnly: true
            })).to.be.true
            fetcher.unfetch().then(function () {
              done()
            })
          }, waitTime)
        })
      })

      it('equalsNot', function (done) {
        states.push({
          path: 'abc',
          value: 1
        })

        states.push({
          path: 'Abcd',
          value: 2
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()
          var fetcher = new jet.Fetcher()
            .path('equalsNot', 'abc')
            .on('data', fetchSpy)

          peer.fetch(fetcher)
          setTimeout(function () {
            expect(fetchSpy.callCount).to.equal(1)
            expect(fetchSpy.calledWith({
              path: 'Abcd',
              event: 'add',
              value: 2,
              fetchOnly: true
            })).to.be.true
            fetcher.unfetch().then(function () {
              done()
            })
          }, waitTime)
        })
      })

      it('containsOneOf', function (done) {
        states.push({
          path: 'abc',
          value: 1
        })

        states.push({
          path: 'Abcd',
          value: 2
        })

        states.push({
          path: 'x',
          value: 2
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()
          var fetcher = new jet.Fetcher()
            .path('containsOneOf', ['d', 'a'])
            .on('data', fetchSpy)

          peer.fetch(fetcher)
          setTimeout(function () {
            expect(fetchSpy.callCount).to.equal(2)
            expect(fetchSpy.calledWith({
              path: 'Abcd',
              event: 'add',
              value: 2,
              fetchOnly: true
            })).to.be.true
            expect(fetchSpy.calledWith({
              path: 'abc',
              event: 'add',
              value: 1,
              fetchOnly: true
            })).to.be.true
            fetcher.unfetch().then(function () {
              done()
            })
          }, waitTime)
        }).catch(done)
      })

      it('containsAllOf and startsWith', function (done) {
        states.push({
          path: '1abc',
          value: 1
        })

        states.push({
          path: '1Abcd',
          value: 2
        })

        states.push({
          path: '1Abd',
          value: 2
        })

        states.push({
          path: 'x',
          value: 2
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()
          var fetcher = new jet.Fetcher()
            .path('startsWith', '1')
            .path('containsAllOf', ['b', 'c'])
            .on('data', fetchSpy)
          peer.fetch(fetcher)
          setTimeout(function () {
            expect(fetchSpy.callCount).to.equal(2)
            expect(fetchSpy.calledWith({
              path: '1Abcd',
              event: 'add',
              value: 2,
              fetchOnly: true
            })).to.be.true
            expect(fetchSpy.calledWith({
              path: '1abc',
              event: 'add',
              value: 1,
              fetchOnly: true
            })).to.be.true
            fetcher.unfetch().then(function () {
              done()
            })
          }, waitTime)
        })
      })
    })

    describe('by value', function () {
      var states

      beforeEach(function () {
        states = new StateArray(peer)
      })

      afterEach(function (done) {
        states.removeAll(function () {
          done()
        })
      })

      it('equals', function (done) {
        states.push({
          path: 'a',
          value: 1
        })

        states.push({
          path: 'b',
          value: '1'
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()

          var fetcher = new jet.Fetcher()
            .value('equals', 1)
            .on('data', fetchSpy)
          peer.fetch(fetcher)
          setTimeout(function () {
            expect(fetchSpy.callCount).to.equal(1)
            expect(fetchSpy.calledWith({
              path: 'a',
              event: 'add',
              value: 1,
              fetchOnly: true
            })).to.be.true
            fetcher.unfetch().then(function () {
              done()
            })
          }, waitTime)
        }).catch(done)
      })

      it('greaterThan', function (done) {
        states.push({
          path: 'a',
          value: 3
        })

        states.push({
          path: 'b',
          value: 2
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()

          var fetcher = new jet.Fetcher()
            .value('greaterThan', 2)
            .on('data', fetchSpy)

          peer.fetch(fetcher)

          setTimeout(function () {
            expect(fetchSpy.callCount).to.equal(1)
            expect(fetchSpy.calledWith({
              path: 'a',
              event: 'add',
              value: 3,
              fetchOnly: true
            })).to.be.true
            fetcher.unfetch().then(function () {
              done()
            })
          }, waitTime)
        })
      })

      it('lessThan', function (done) {
        states.push({
          path: 'a',
          value: 3
        })

        states.push({
          path: 'b',
          value: 2
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()

          var fetcher = new jet.Fetcher()
            .value('lessThan', 3)
            .on('data', fetchSpy)

          peer.fetch(fetcher)

          setTimeout(function () {
            expect(fetchSpy.callCount).to.equal(1)
            expect(fetchSpy.calledWith({
              path: 'b',
              event: 'add',
              value: 2,
              fetchOnly: true
            })).to.be.true
            fetcher.unfetch().then(function () {
              done()
            })
          }, waitTime)
        })
      })

      it('isType', function (done) {
        states.push({
          path: 'a',
          value: 1
        })

        states.push({
          path: 'b',
          value: '1'
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()

          var fetcher = new jet.Fetcher()
            .value('isType', 'string')
            .on('data', fetchSpy)

          peer.fetch(fetcher)

          setTimeout(function () {
            expect(fetchSpy.callCount).to.equal(1)
            expect(fetchSpy.calledWith({
              path: 'b',
              event: 'add',
              value: '1',
              fetchOnly: true
            })).to.be.true
            fetcher.unfetch().then(function () {
              done()
            })
          }, waitTime)
        }).catch(done)
      })
    })

    describe('by key (valueField)', function () {
      var states

      beforeEach(function () {
        states = new StateArray(peer)
      })

      afterEach(function (done) {
        states.removeAll(function () {
          done()
        })
      })

      it('equals', function (done) {
        var john = {
          age: 35,
          name: 'John',
          parents: {
            mom: 'Liz',
            dad: 'Paul'
          }
        }

        states.push({
          path: 'a',
          value: john
        })

        states.push({
          path: 'b',
          value: {
            age: 31,
            name: 'Nick',
            parents: {
              mom: 'Liz',
              dad: 'Paul'
            }
          }
        })

        states.push({
          path: 'g',
          value: '1'
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()

          var fetcher = new jet.Fetcher()
            .key('age', 'equals', 35)
            .on('data', fetchSpy)
          peer.fetch(fetcher)

          setTimeout(function () {
            expect(fetchSpy.callCount).to.equal(1)
            expect(fetchSpy.calledWith({
              path: 'a',
              event: 'add',
              value: john,
              fetchOnly: true
            })).to.be.true
            fetcher.unfetch().then(function () {
              done()
            })
          }, waitTime)
        })
      })

      it('greaterThan', function (done) {
        var john = {
          age: 35,
          name: 'John',
          parents: {
            mom: 'Liz',
            dad: 'Paul'
          }
        }

        states.push({
          path: 'a',
          value: john
        })

        states.push({
          path: 'b',
          value: {
            age: 31,
            name: 'Nick',
            parents: {
              mom: 'Liz',
              dad: 'Paul'
            }
          }
        })

        states.push({
          path: 'g',
          value: '1'
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()

          var fetcher = new jet.Fetcher()
            .key('age', 'greaterThan', 31)
            .on('data', fetchSpy)

          peer.fetch(fetcher)

          setTimeout(function () {
            expect(fetchSpy.callCount).to.equal(1)
            expect(fetchSpy.calledWith({
              path: 'a',
              event: 'add',
              value: john,
              fetchOnly: true
            })).to.be.true
            states[1].value({
              name: 'Nick',
              age: 32,
              parents: {
                mom: 'Liz',
                dad: 'Paul'
              }
            })
            var nick = states[1].value()
            setTimeout(function () {
              expect(fetchSpy.callCount).to.equal(2)
              expect(fetchSpy.calledWith({
                path: 'b',
                event: 'add',
                value: nick,
                fetchOnly: true
              })).to.be.true
              fetcher.unfetch().then(function () {
                done()
              })
            }, waitTime)
          }, waitTime)
        }).catch(done)
      })

      it('equals and lessThan', function (done) {
        var john = {
          age: 35,
          name: 'John',
          parents: {
            mom: 'Liz',
            dad: 'Paul'
          }
        }

        states.push({
          path: 'a',
          value: john
        })

        states.push({
          path: 'ab',
          value: {
            age: 40,
            name: 'John',
            parents: {
              mom: 'Anna',
              dad: 'Paul'
            }
          }
        })

        states.push({
          path: 'b',
          value: {
            age: 31,
            name: 'Nick',
            parents: {
              mom: 'Liz',
              dad: 'Paul'
            }
          }
        })

        states.push({
          path: 'g',
          value: '1'
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()

          var fetcher = new jet.Fetcher()
            .key('age', 'lessThan', 40)
            .key('name', 'equals', 'John')
            .on('data', fetchSpy)

          peer.fetch(fetcher)

          setTimeout(function () {
            expect(fetchSpy.callCount).to.equal(1)
            expect(fetchSpy.calledWith({
              path: 'a',
              event: 'add',
              value: john,
              fetchOnly: true
            })).to.be.true
            fetcher.unfetch().then(function () {
              done()
            })
          }, waitTime)
        }).catch(done)
      })
    })

    describe('sorting', function () {
      var states

      beforeEach(function () {
        states = new StateArray(peer)
      })

      afterEach(function (done) {
        states.removeAll(function () {
          done()
        })
      })

      it('sort by path and differential', function (done) {
        for (var i = 10; i < 30; ++i) {
          states.push({
            path: i.toString(),
            value: i
          })
        }

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()
          var fetchOK

          var fetcher = new jet.Fetcher()
            .sortByPath()
            .range(1, 10)
            .differential()
            .on('data', fetchSpy)

          peer.fetch(fetcher)
            .then(function () {
              fetchOK = true
            })

          setTimeout(function () {
            var expectedChanges = []
            for (var i = 10; i < 20; ++i) {
              expectedChanges.push({
                path: i.toString(),
                value: i,
                index: i - 9,
                fetchOnly: true
              })
            }
            expect(fetchSpy.callCount).to.equal(1)
            expect(fetchSpy.calledWith(expectedChanges, 10)).to.be.true
            expect(fetchOK).to.be.true
            fetcher.unfetch()
            done()
          }, waitTime * 2)
        })
      })

      it('from / to works', function (done) {
        for (var i = 10; i < 30; ++i) {
          states.push({
            path: i.toString(),
            value: i
          })
        }

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()

          var fetcher = new jet.Fetcher()
            .sortByPath()
            .range(11, 13)
            .differential()
            .on('data', fetchSpy)

          peer.fetch(fetcher)

          setTimeout(function () {
            var expectedChanges = []
            for (var i = 20; i < 23; ++i) {
              expectedChanges.push({
                path: i.toString(),
                value: i,
                index: i - 9,
                fetchOnly: true
              })
            }
            expect(fetchSpy.callCount).to.equal(1)
            expect(fetchSpy.calledWith(expectedChanges, 3)).to.be.true
            fetcher.unfetch().then(function () {
              done()
            })
          }, waitTime * 2)
        })
      })

      it('n callback param indicates number of matches within from/to', function (done) {
        for (var i = 10; i < 13; ++i) {
          states.push({
            path: i.toString(),
            value: i
          })
        }

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()

          var fetcher = new jet.Fetcher()
            .sortByPath()
            .range(2, 5)
            .differential()
            .on('data', fetchSpy)

          peer.fetch(fetcher)

          setTimeout(function () {
            var expectedChanges = []
            for (var i = 11; i < 13; ++i) {
              expectedChanges.push({
                path: i.toString(),
                value: i,
                index: i - 9,
                fetchOnly: true
              })
            }

            expect(fetchSpy.callCount).to.equal(1)
            expect(fetchSpy.calledWith(expectedChanges, 2)).to.be.true

            // insert path between '11' and '12'
            var s = new jet.State('112', 123)
            peer.add(s)

            setTimeout(function () {
              expectedChanges = [
                {
                  path: '112',
                  value: 123,
                  index: 3,
                  fetchOnly: true
                },
                {
                  path: '12',
                  value: 12,
                  index: 4,
                  fetchOnly: true
                }
              ]
              expect(fetchSpy.callCount).to.equal(2)
              expect(fetchSpy.calledWith(expectedChanges, 3)).to.be.true
              fetcher.unfetch().then(function () {
                s.remove()
                done()
              })
            }, waitTime)
          }, waitTime * 2)
        })
      })

      it('sort standard (non-differential) feeds callback with complete array', function (done) {
        for (var i = 10; i < 13; ++i) {
          states.push({
            path: i.toString(),
            value: i
          })
        }

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()

          var fetcher = new jet.Fetcher()
            .sortByPath()
            .range(2, 5)
            .on('data', fetchSpy)

          peer.fetch(fetcher)

          setTimeout(function () {
            var expectedArray = []
            for (var i = 11; i < 13; ++i) {
              expectedArray.push({
                path: i.toString(),
                value: i,
                index: i - 9,
                fetchOnly: true
              })
            }

            expect(fetchSpy.callCount).to.equal(1)
            expect(fetchSpy.calledWith(expectedArray)).to.be.true

            // insert path between '11' and '12'
            var s = new jet.State('112', 123)
            peer.add(s)

            setTimeout(function () {
              expectedArray[1] = {
                path: '112',
                value: 123,
                index: 3,
                fetchOnly: true
              }
              expectedArray[2] = {
                path: '12',
                value: 12,
                index: 4,
                fetchOnly: true
              }
              expect(fetchSpy.callCount).to.equal(2)
              expect(fetchSpy.calledWith(expectedArray)).to.be.true
              fetcher.unfetch()
              s.remove()
              done()
            }, waitTime)
          }, waitTime * 2)
        })
      })

      it('byValue works', function (done) {
        for (var i = 10; i < 30; ++i) {
          states.push({
            path: i.toString(),
            value: i * i
          })
        }

        states.push({
          path: '50',
          value: 'asd'
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()

          var fetcher = new jet.Fetcher()
            .sortByValue('number')
            .range(11, 13)
            .differential()
            .on('data', fetchSpy)

          peer.fetch(fetcher).then(function () {
            setTimeout(function () {
              var expectedChanges = []
              for (var i = 20; i < 23; ++i) {
                expectedChanges.push({
                  path: i.toString(),
                  value: i * i,
                  index: i - 9,
                  fetchOnly: true
                })
              }
              expect(fetchSpy.callCount).to.equal(1)
              expect(fetchSpy.calledWith(expectedChanges, 3)).to.be.true
              fetcher.unfetch()
              done()
            }, waitTime)
          })
        })
      })

      it('byValue works when state is removed', function (done) {
        for (var i = 10; i < 30; ++i) {
          states.push({
            path: i.toString(),
            value: i * i
          })
        }

        states.push({
          path: '50',
          value: 'asd'
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()

          var fetcher = new jet.Fetcher()
            .sortByValue('number')
            .range(11, 13)
            .differential()
            .on('data', fetchSpy)

          peer.fetch(fetcher)
            .then(function () {
              // change value type --> type mismatch --> element removed
              states[10].value('asd')
            })

          setTimeout(function () {
            var expectedChanges = []
            for (var i = 20; i < 23; ++i) {
              expectedChanges.push({
                path: i.toString(),
                value: i * i,
                index: i - 9,
                fetchOnly: true
              })
            }
            expect(fetchSpy.callCount).to.equal(2)
            expect(fetchSpy.calledWith(expectedChanges, 3)).to.be.true
            expectedChanges = []
            for (i = 21; i < 24; ++i) {
              expectedChanges.push({
                path: i.toString(),
                value: i * i,
                index: i - 10,
                fetchOnly: true
              })
            }
            expect(fetchSpy.calledWith(expectedChanges, 3)).to.be.true
            done()
          }, waitTime)
        })
      })

      it('byValueField works', function (done) {
        states.push({
          path: 'aaa',
          value: {
            age: 3
          }
        })

        states.push({
          path: 'b',
          value: {
            age: 2
          }
        })

        states.push({
          path: 'c',
          value: {
            age: 10
          }
        })

        states.push({
          path: 'ddd',
          value: {
            age: 11
          }
        })

        states.push({
          path: 'e',
          value: {
            age: 1
          }
        })

        states.push({
          path: '50',
          value: 'asd'
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()

          var fetcher = new jet.Fetcher()
            .sortByKey('age', 'number')
            .range(2, 4)
            .differential()
            .on('data', fetchSpy)

          peer.fetch(fetcher).then(function () {
            setTimeout(function () {
              var expectedChanges = []
              expectedChanges.push({
                path: 'b',
                value: {
                  age: 2
                },
                index: 2,
                fetchOnly: true
              })
              expectedChanges.push({
                path: 'aaa',
                value: {
                  age: 3
                },
                index: 3,
                fetchOnly: true
              })

              expectedChanges.push({
                path: 'c',
                value: {
                  age: 10
                },
                index: 4,
                fetchOnly: true
              })
              expect(fetchSpy.callCount).to.equal(1)
              expect(fetchSpy.calledWith(expectedChanges, 3)).to.be.true

              // change value, order stays same
              states[0].value({
                age: 4
              })

              setTimeout(function () {
                expect(fetchSpy.callCount).to.equal(2)
                expect(fetchSpy.calledWith([{
                  path: 'aaa',
                  value: {
                    age: 4
                  },
                  index: 3,
                  fetchOnly: true
                }], 3)).to.be.true

                // change value -> change order
                states[2].value({
                  age: 3
                })

                setTimeout(function () {
                  expect(fetchSpy.callCount).to.equal(3)
                  expect(fetchSpy.calledWith([{
                    path: 'c',
                    value: {
                      age: 3
                    },
                    index: 3,
                    fetchOnly: true
                  }, {
                    path: 'aaa',
                    value: {
                      age: 4
                    },
                    index: 4,
                    fetchOnly: true
                  }], 3)).to.be.true
                  fetcher.unfetch()
                  done()
                }, waitTime)
              }, waitTime)
            }, waitTime)
          })
        })
      })

      it('byValueField nested works', function (done) {
        for (var i = 10; i < 30; ++i) {
          states.push({
            path: i.toString(),
            value: {
              deep: {
                age: i * i
              }
            }
          })
        }

        states.push({
          path: '50',
          value: 'asd'
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()

          var fetcher = new jet.Fetcher()
            .sortByKey('deep.age', 'number')
            .differential()
            .range(11, 13)
            .on('data', fetchSpy)

          peer.fetch(fetcher)

          setTimeout(function () {
            var expectedChanges = []
            for (var i = 20; i < 23; ++i) {
              expectedChanges.push({
                path: i.toString(),
                value: {
                  deep: {
                    age: i * i
                  }
                },
                index: i - 9,
                fetchOnly: true
              })
            }
            expect(fetchSpy.callCount).to.equal(1)
            expect(fetchSpy.calledWith(expectedChanges, 3)).to.be.true
            fetcher.unfetch()
            done()
          }, waitTime)
        })
      })
    })

    describe('byPath and byValue', function () {
      var states

      beforeEach(function () {
        states = new StateArray(peer)
      })

      afterEach(function (done) {
        states.removeAll(function () {
          done()
        })
      })

      it('chain .path().value()', function (done) {
        states.push({
          path: 'abc',
          value: 1
        })
        states.push({
          path: 'abde',
          value: 3
        })
        states.push({
          path: 'aca',
          value: 1
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()

          var fetcher = new jet.Fetcher()
            .path('startsWith', 'ab')
            .value('lessThan', 3)
            .on('data', fetchSpy)

          peer.fetch(fetcher)

          setTimeout(function () {
            expect(fetchSpy.callCount).to.equal(1)
            expect(fetchSpy.calledWith({
              path: 'abc',
              event: 'add',
              value: 1,
              fetchOnly: true
            })).to.be.true
            fetcher.unfetch()
            done()
          }, waitTime)
        })
      })

      it('startsWith and lessThan', function (done) {
        states.push({
          path: 'abc',
          value: 1
        })
        states.push({
          path: 'abde',
          value: 3
        })
        states.push({
          path: 'aca',
          value: 1
        })

        states.addAll().then(function () {
          var fetchSpy = sinon.spy()

          var fetcher = new jet.Fetcher()
            .path('startsWith', 'ab')
            .value('lessThan', 3)
            .on('data', fetchSpy)

          peer.fetch(fetcher)

          setTimeout(function () {
            expect(fetchSpy.callCount).to.equal(1)
            expect(fetchSpy.calledWith({
              path: 'abc',
              event: 'add',
              value: 1,
              fetchOnly: true
            })).to.be.true
            fetcher.unfetch()
            done()
          }, waitTime)
        })
      })
    })
  })
})

describe('A Daemon with features.fetch = "simple" and two states', function () {
  var daemon
  var peer
  var port = ++portBase

  before(function (done) {
    daemon = new jet.Daemon({
      features: {
        fetch: 'simple'
      }
    })

    daemon.listen({
      tcpPort: port
    })

    peer = new jet.Peer({
      port: port
    })

    Promise.all([
      peer.connect(),
      peer.add(new jet.State('abc', 123)),
      peer.add(new jet.State('def', 123))
    ]).then(function () {
      done()
    }).catch(done)
  })

  after(function () {
    peer.close()
  })

  describe('raw message tests', function () {
    var sock

    beforeEach(function (done) {
      sock = new MessageSocket(port)
      sock.once('open', function () {
        done()
      })
    })

    it('"fetch" call returns a string and ignores fetch params and triggers fetch ALL', function (done) {
      var cnt = 0
      var fetchId
      var request = {
        id: 99,
        method: 'fetch',
        params: {
          id: 'asd' // gets ignored for simple fetch
        }
      }

      sock.on('message', function (resp) {
        resp = JSON.parse(resp)
        if (cnt === 0) {
          expect(resp.result).to.be.a('string')
          fetchId = resp.result
          expect(resp.id).to.equal(99)
        } else {
          expect(resp.method).to.equal(fetchId)
          expect(resp.params.path).to.be.a('string')
          expect(resp.params.value).to.equal(123)
        }
        ++cnt
        if (cnt === 3) {
          done()
        }
      })

      sock.send(JSON.stringify(request))
    })

    it('fetching twice fails', function (done) {
      var cnt = 0
      var request = {
        id: 100,
        method: 'fetch',
        params: {}
      }
      sock.on('message', function (resp) {
        resp = JSON.parse(resp)
        if (cnt === 0) {
          expect(resp.result).to.be.a('string')
          expect(resp.id).to.equal(100)
        } else if (resp.id) {
          expect(resp.error.code).to.equal(-32602)
          expect(resp.error.message).to.equal('Invalid params')
          done()
        }
        ++cnt
      })
      sock.send(JSON.stringify(request))
      request.id = 101
      sock.send(JSON.stringify(request))
    })

    it('fetch/unfetch succeeds', function (done) {
      var cnt = 0
      var request = {
        id: 200,
        method: 'fetch',
        params: {}
      }
      sock.on('message', function (resp) {
        resp = JSON.parse(resp)
        if (cnt === 0) {
          expect(resp.result).to.be.a('string')
          expect(resp.id).to.equal(200)
        } else if (cnt === 3) {
          expect(resp.result).to.equal(true)
          expect(resp.id).to.equal(201)
          done()
        }
        ++cnt
      })
      sock.send(JSON.stringify(request))
      request.method = 'unfetch'
      request.id = 201
      sock.send(JSON.stringify(request))
    })

    it('unfetch fails', function (done) {
      var request = {
        id: 300,
        method: 'unfetch',
        params: {}
      }
      sock.on('message', function (resp) {
        resp = JSON.parse(resp)
        expect(resp.error.code).to.equal(-32602)
        expect(resp.error.message).to.equal('Invalid params')
        done()
      })
      sock.send(JSON.stringify(request))
    })
  })
})
