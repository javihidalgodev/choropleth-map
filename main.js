import './style.css'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'

let countyURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'
let educationURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'

let countyData
let educationData

let drawMap = (svg) => {
  svg.selectAll('path')
  .data(countyData)
  .enter()
  .append('path')
  .attr('d', d3.geoPath())
  .attr('class', 'county')
  .attr('fill', (countyDataItem) => {
    let id = countyDataItem.id
    let county = educationData.find(item => {
     return item.fips === id
    })

    let percentage = county.bachelorsOrHigher

    if(percentage <= 15) {return 'tomato'}
      else if (percentage <= 30) {return 'orange'}
      else if (percentage <= 45) {return 'lightgreen'}
    else {return 'limegreen'}
  })
  .attr('data-fips', countyDataItem => {return countyDataItem.id})
  .attr('data-education', countyDataItem => {
    let id = countyDataItem.id
    let county = educationData.find(item => {
      return item.fips === id
    })
    
    return county.bachelorsOrHigher
  })
  .attr('data-area-name', countyDataItem => {
    let id = countyDataItem.id
    let areaName = educationData.find(item => {
      return item.fips === id 
    })
    
    return areaName.area_name
  })
  .on('mouseover', function (e, countyDataItem) {
    let id = countyDataItem.id
    let county = educationData.find(item => {
      return item.fips === id
    })

    let posX = e.target.getBoundingClientRect().x
    let posY = e.target.getBoundingClientRect().y
    console.log(posX, posY)

    d3.select('#tooltip')
    .html(`<p>${county.area_name}, ${county.state}: ${county.bachelorsOrHigher}%</p>`)
    .attr('data-education', county.bachelorsOrHigher)
    .style('display', 'inline')
    .style('transform', `translate(${posX}px, ${posY}px)`)
  })
  .on('mouseleave', () => {
    d3.select('#tooltip')
    .style('display', 'none')
  })
}

d3.json(countyURL).then(
  (data, error) => {
    if(error){console.log(error)}
    else {
      countyData = topojson.feature(data, data.objects.counties).features

      d3.json(educationURL).then(
        (data, error) => {
          if(error){console.log(error)}
          else {
            educationData = data

            const app = d3.select('#app')
            app.append('div')
            .attr('id', 'tooltip')

            app.append('h1')
            .attr('id', 'title')
            .text('United States Educational Attainment')
            app.append('h3')
            .attr('id', 'description')
            .text('Percentage of adults age 25 and older with a bachelor\'s degree or higher (2010-2014)')

            app.append('svg')
            .attr('id', 'canvas')

            const svg = d3.select('#canvas')

            drawMap(svg)

            const x = d3.scaleLinear().domain([2.6, 75.1]).rangeRound([600, 860])

            const color = d3.scaleThreshold()
            .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
            .range(d3.schemeRdYlGn[9])

            svg.append('g')
            .attr('id', 'legend')
            .selectAll('rect')
            .data(
              color.range().map(function (d) {
                d = color.invertExtent(d);
                if (d[0] === null) {
                  d[0] = x.domain()[0];
                }
                if (d[1] === null) {
                  d[1] = x.domain()[1];
                }
                return d;
              })
            )
            .enter()
            .append('rect')
            .attr('height', 8)
            .attr('x', function (d) {
              return x(d[0]);
            })
            .attr('width', function (d) {
              return d[0] && d[1] ? x(d[1]) - x(d[0]) : x(null);
            })
            .attr('fill', function (d) {
              return color(d[0]);
            });
          
          svg.append('text')
            .attr('class', 'caption')
            .attr('x', x.range()[0])
            .attr('y', -6)
            .attr('fill', '#000')
            .attr('text-anchor', 'start')
            .attr('font-weight', 'bold');
          
          svg.call(
            d3
              .axisBottom(x)
              .tickSize(13)
              .tickFormat(function (x) {
                return Math.round(x) + '%';
              })
              .tickValues(color.domain())
          )
            .select('.domain')
            .remove();
          }
        }
      )
    }
  }
)