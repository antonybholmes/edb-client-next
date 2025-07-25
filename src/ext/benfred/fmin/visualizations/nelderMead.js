import { AnimatedContour } from './animatedContour'
import { flower } from './functions'
import { Slider } from './slider'

export function NelderMeadContour(div) {
  this.colour = d3.schemeCategory10[0]
  this.current = flower
  this.duration = 500
  this.params = { chi: 2, psi: -0.5, sigma: 0.5, rho: 1 }
  AnimatedContour.call(this, div)
}

NelderMeadContour.prototype = Object.create(AnimatedContour.prototype)

NelderMeadContour.prototype.drawControls = function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  var obj = this,
    params = this.params,
    div = this.div
  Slider(
    div.select('#expansion'),
    [1, 5],
    function (x) {
      params.chi = x
      obj.initialize(obj.initial)
      div.select('#expansionvalue').text(' = ' + x.toFixed(1) + 'x')
    },
    {
      format: function (d) {
        return d.toFixed(1) + 'x'
      },
      initial: 2.0,
    }
  )

  Slider(
    div.select('#contraction'),
    [0.2, 1],
    function (x) {
      params.sigma = x
      params.psi = -1 * x
      obj.initialize(obj.initial)
      div.select('#contractionvalue').text(' = ' + x.toFixed(2) + 'x')
    },
    {
      format: function (d) {
        return d.toFixed(1) + 'x'
      },
      initial: 0.5,
    }
  )
}

NelderMeadContour.prototype.initialize = function (initial) {
  this.stop()
  this.initial = initial.slice()
  var states = (this.states = [])
  this.stateIndex = 0
  this.params.history = states
  fmin.nelderMead(this.current.f, initial, this.params)

  var lines = this.plot.svg
    .selectAll('.simplex_line')
    .data(this.states[0].simplex)
  lines
    .enter()
    .append('line')
    .attr('class', 'simplex_line')
    .attr('stroke-opacity', 0.7)
    .attr('stroke', 'red')
    .attr('stroke-width', 2)

  var circles = this.plot.svg.selectAll('circle').data(this.states[0].simplex)

  circles
    .enter()
    .append('circle')
    .style('fill', 'red')
    .style('fill-opacity', 0.9)
    .attr('r', 5)
    .attr('cx', d => this.plot.xScale(d[0]))
    .attr('cy', d => this.plot.yScale(d[1]))
    .attr('filter', 'url(#dropshadow)')
  this.increment(this.cycle, this.duration)
}
