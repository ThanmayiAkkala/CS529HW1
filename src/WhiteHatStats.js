import React, { useEffect, useRef, useMemo } from 'react';
import useSVGCanvas from './useSVGCanvas.js';
import * as d3 from 'd3';

//change the code below to modify the bottom plot view
export default function WhiteHatStats(props) {
  //this is a generic component for plotting a d3 plot
  const d3Container = useRef(null);
  //this automatically constructs an svg canvas the size of the parent container (height and width)
  //tTip automatically attaches a div of the class 'tooltip' if it doesn't already exist
  //this will automatically resize when the window changes so passing svg to a useeffect will re-trigger
  const [svg, height, width, tTip] = useSVGCanvas(d3Container);

  const margin = 80;
  const radius = 10;

  //TODO: modify or replace the code below to draw a more truthful or insightful representation of the dataset. This other representation could be a histogram, a stacked bar chart, etc.
  //this loop updates when the props.data changes or the window resizes
  //we can edit it to also use props.brushedState if you want to use linking
  useEffect(() => {
    //wait until the data loads
    // Wait until the data loads
    if (svg === undefined || props.data === undefined) {
      return;
    }

    // Aggregate gun deaths by state
    const data = props.data.states;

    // Extract ease of drawing and gun death count
    const easeOfDrawingValues = data.map((state) =>
      drawingDifficulty[state.abreviation] === undefined
        ? 5
        : drawingDifficulty[state.abreviation]
    );
    const gunDeathCounts = data.map((state) => state.count);

    // Define histogram bins
    const numBins = 10;
    const xMin = Math.min(...easeOfDrawingValues);
    const xMax = Math.max(...easeOfDrawingValues);
    const binWidth = (xMax - xMin) / numBins;

    // Create a histogram generator
    const histogram = d3.histogram().domain([xMin, xMax]).thresholds(numBins);

    // Bin the data
    const bins = histogram(easeOfDrawingValues);
    const colorScale1 = d3
      .scaleSequential(d3.interpolateYlGnBu)
      .domain([0, numBins - 1]); // Use the Rainbow color scale

    // Create x and y scales for the histogram
    const xScale = d3
      .scaleLinear()
      .domain([xMin, xMax])
      .range([margin, width - margin]);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(bins, (bin) => bin.length)])
      .range([height - margin, margin]);

    // Create color scale for the bars
    const colorScale = d3
      .scaleDiverging()
      .domain([0, 0.5, 1])
      .range(['grey', 'blue', 'navy']);

    // Remove existing elements
    svg.selectAll('*').remove();

    // Draw the histogram bars
    svg
      .selectAll('.bar')
      .data(bins)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.x0))
      .attr('y', (d) => yScale(d.length))
      .attr('width', xScale(bins[0].x1) - xScale(bins[0].x0) - 1) // Adjust for spacing
      .attr('height', (d) => height - margin - yScale(d.length))
      .attr('fill', (d, i) => colorScale1(i)) // Assign a different color to each bar
      .on('mouseover', (e, d) => {
        const binCenter = (d.x0 + d.x1) / 2;
        const gunDeathsInBin = d3.mean(
          d,
          (value) => gunDeathCounts[easeOfDrawingValues.indexOf(value)]
        );
        const string = `Difficulty Range: ${d.x0.toFixed(2)} - ${d.x1.toFixed(
          2
        )}</br>Average Gun Deaths: ${gunDeathsInBin.toFixed(2)}`;
        props.ToolTip.moveTTipEvent(tTip, e);
        tTip.html(string);
      })
      .on('mousemove', (e) => {
        props.ToolTip.moveTTipEvent(tTip, e);
      })
      .on('mouseout', (e, d) => {
        props.ToolTip.hideTTip(tTip);
      });

    // Add axes
    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin})`)
      .call(d3.axisBottom(xScale));

    svg
      .append('g')
      .attr('transform', `translate(${margin},0)`)
      .call(d3.axisLeft(yScale));

    // Add labels
    const labelSize = margin / 2;
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height - margin / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', 20)
      .attr('font-weight', 'bold')
      .attr('fill', 'black')
      .text('Distribution of Gun Deaths by Drawing Difficulty');

    // Add disclaimer
    svg
      .append('text')
      .attr('x', width - 80)
      .attr('y', height / 3)
      .attr('text-anchor', 'end')
      .attr('font-size', 10)
      .text("I'm just asking questions");
  }, [props.data, svg]);

  return (
    <div
      className={'d3-component'}
      style={{ height: '99%', width: '99%' }}
      ref={d3Container}
    ></div>
  );
}
//END of TODO #1.

const drawingDifficulty = {
  IL: 9,
  AL: 2,
  AK: 1,
  AR: 3,
  CA: 9.51,
  CO: 0,
  DE: 3.1,
  DC: 1.3,
  FL: 8.9,
  GA: 3.9,
  HI: 4.5,
  ID: 4,
  IN: 4.3,
  IA: 4.1,
  KS: 1.6,
  KY: 7,
  LA: 6.5,
  MN: 2.1,
  MO: 5.5,
  ME: 7.44,
  MD: 10,
  MA: 6.8,
  MI: 9.7,
  MN: 5.1,
  MS: 3.8,
  MT: 1.4,
  NE: 1.9,
  NV: 0.5,
  NH: 3.7,
  NJ: 9.1,
  NM: 0.2,
  NY: 8.7,
  NC: 8.5,
  ND: 2.3,
  OH: 5.8,
  OK: 6.05,
  OR: 4.7,
  PA: 4.01,
  RI: 8.4,
  SC: 7.1,
  SD: 0.9,
  TN: 3.333333,
  TX: 8.1,
  UT: 2.8,
  VT: 2.6,
  VA: 8.2,
  WA: 9.2,
  WV: 7.9,
  WY: 0,
};
