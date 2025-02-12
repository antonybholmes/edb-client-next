import { createDropShadowFilter } from './dropshadow'
import { LineGraph } from './linegraph'
import { Slider } from './slider'

export function NelderMead1d(div) {
  this.div = div
  this.graph = LineGraph()
  this.plot = null
  this.states = []
  this.stateIndex = 0
  this.initial = 0
  this.cycle = 0
  this.params = { chi: 1, psi: -1, sigma: 1, rho: 1 }

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  var obj = this,
    params = this.params

  div.select('.function_floor').on('click', function () {
    obj.graph
      .xDomain([25, 75])
      .yDomain([0, 25])
      .f(function (x) {
        return Math.floor(Math.abs(x - 50))
      })
    obj.redraw()
    obj.initialize([30])
    div.select('.function_label').html(d3.select(this).html())
  })

  div.select('.function_smooth').on('click', function () {
    obj.graph
      .xDomain([-4.9, 6])
      .yDomain([0, 5])
      .f(function (x) {
        return Math.log(1 + Math.pow(Math.abs(x), 2 + Math.sin(x)))
      })
    obj.redraw()
    obj.initialize([-4.5])
    div.select('.function_label').html(d3.select(this).html())
  })

  div.select('.function_noisy').on('click', function () {
    obj.graph
      .xDomain([-5, 5])
      .yDomain([0, 4])
      .f(function (x) {
        return (2 + Math.sin(50 * x) / 50) * Math.atan(x) * Math.atan(x)
      })
    obj.redraw()
    obj.initialize([-4.5])
    div.select('.function_label').html(d3.select(this).html())
  })

  this.redraw()
  this.initialize([-4.5])
  this.expansion = Slider(
    div.select('#expansion'),
    [1, 5],
    function (x) {
      div.select('#expansionvalue').text(' = ' + x.toFixed(1) + 'x')
      params.chi = x
      obj.initialize(obj.initial)
    },
    {
      format: function (d) {
        return d.toFixed(1) + 'x'
      },
      initial: 1.0,
    }
  )

  this.contraction = Slider(
    div.select('#contraction'),
    [0.2, 1],
    function (x) {
      div.select('#contractionvalue').text(' = ' + x.toFixed(2) + 'x')
      obj.params.sigma = x
      obj.params.psi = -1 * x
      obj.initialize(obj.initial)
    },
    {
      format: function (d) {
        return d.toFixed(1) + 'x'
      },
      initial: 1.0,
    }
  )
}

NelderMead1d.prototype.redraw = function () {
  this.div.select('svg').data([]).exit().remove()
  this.plot = this.graph(this.div.select('#vis'))
  createDropShadowFilter(this.plot.svg)
  var obj = this
  this.plot.svg.on('click', function () {
    var pos = d3.mouse(this)
    obj.initialize([obj.plot.xScale.invert(pos[0])])
  })
}

NelderMead1d.prototype.initialize = function (initial) {
  // stopunknown previous iteration
  this.stop()

  this.initial = initial.slice()
  this.stateIndex = 0

  var states = (this.states = [])

  this.params.history = states

  fmin.nelderMead((x) => this.graph.f()(x[0]), initial, this.params)

  this.increment(this.cycle, 1500)
}

NelderMead1d.prototype.stop = function () {
  this.cycle += 1
}

NelderMead1d.prototype.start = function () {
  this.initialize(this.initial)
}

NelderMead1d.prototype.increment = function (currentCycle, duration) {
  if (this.cycle != currentCycle) {
    return
  }
  this.div
    .select('.iterations')
    .text(
      'Iteration ' +
        (this.stateIndex + 1) +
        '/' +
        this.states.length +
        ', Loss=' +
        this.states[this.stateIndex].fx.toFixed(5)
    )

  duration = duration || 500

  this.stateIndex += 1
  if (this.stateIndex >= this.states.length) {
    this.stateIndex = 0
    duration = 5000
  }
  this.plot.svg
    .transition()
    .duration(duration)
    .on('end', () => this.increment(currentCycle))
}
