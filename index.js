"use strict";

function mainIndex()
{
    // Store the URL of the Data to Read
    const dataURL = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
    
    // Control Dimensions for the graph
    const graphContainer = document.querySelector("#vis-container");

    const margin = {
        top: 100,
        right: 20,
        bottom: 30,
        left: 60
    };

    const dims = {
        width: graphContainer.offsetWidth - margin.left - margin.right,
        height: graphContainer.offsetHeight - margin.top - margin.bottom
    };

    // Define limits for x and y
    const x = d3.scaleLinear().range([0, dims.width]);
    const y = d3.scaleTime().range([0, dims.height]);

    // Define colors for labels
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const timeFormat = d3.timeFormat('%M:%S');

    const xAxis = d3.axisBottom(x).tickFormat(d3.format('d'));
    const yAxis = d3.axisLeft(y).tickFormat(timeFormat);

    // Create the div for the tooltip
    const tooltip = d3.select("#vis-container")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip")
        .style("opacity", 0);

    // Create the SVG for the chart
    const svg = d3.select("#vis-container")
        .append("svg")
        .attr("width", dims.width + margin.left + margin.right)
        .attr("height", dims.height + margin.top + margin.bottom)
        .attr("class", "graph")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Grab the JSON data
    d3.json(dataURL)
        .then(data => {
            data.forEach(d => {
                d.Place = +d.Place;
                const parsedTime = d.Time.split(":");
                d.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
            });

            x.domain([
                d3.min(data, d => {
                    return d.Year - 1;
                    }),
                d3.max(data, d => {
                return d.Year + 1;
                })
            ]);

            y.domain(
                d3.extent(data, d => {
                return d.Time;
              }));

            // Add the x-axis
            svg
                .append("g")
                .attr("id", "x-axis")
                .attr("class", "x axis")
                .attr("transform", `translate(0, ${dims.height})`)
                .call(xAxis);
            
            // Add the y-axis
            svg
              .append("g")
              .attr("id", "y-axis")
              .attr("class", "y axis")
              .call(yAxis);
            
            // Add the label for the x-axis
            svg
              .append('text')
              .attr('x', dims.width / 2)
              .attr('y', dims.height + 30)
              .style('font-size', 15)
              .text('Year');
            
            
            // Add the label for the y-axis
            svg
              .append('text')
              .attr('transform', 'rotate(-90)')
              .attr('x', -160)
              .attr('y', -44)
              .style('font-size', 15)
              .text('Time in Minutes');
            
            // Add the dots
            svg
              .selectAll("dot")
              .data(data)
              .enter()
              .append("circle")
              .attr("class", "dot")
              .attr("r", 6)
              .attr("cx", d => x(d.Year))
              .attr("cy", d => y(d.Time))
              .attr("data-xvalue", d => d.Year)
              .attr("data-yvalue", d => d.Time.toISOString())
              .style("fill", d => color(d.Doping !== ''))
              .on("mouseover", function (event, d) {
                tooltip.style("opacity", 0.9);
                tooltip.attr("data-year", d.Year);
                tooltip
                    .html(`${d.Name}:${d.Nationality}<br>Year:${d.Year}, Time:${timeFormat(d.Time)}${(d.Doping) ? '<br><br>' + d.Doping : ''}`)
                    .style("left", event.pageX + "px")
                    .style("top", event.pageY - 28 + "px");
              })
              .on("mouseout", () => tooltip.style("opacity", 0));
            
            
            const legendContainer = svg
                .append("g")
                .attr("id", "legend");
            
            const legend = legendContainer
              .selectAll("#legend")
              .data(color.domain())
              .enter()
              .append("g")
              .attr("class", "legend-label")
              .attr("transform", (d, i) => 'translate(0,' + (dims.height / 2 - i * 20) + ')');
        
            legend
            .append('rect')
            .attr('x', dims.width - 18)
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', color);
        
            legend
              .append('text')
              .attr('x', dims.width - 24)
              .attr('y', 9)
              .attr('dy', '.35em')
              .style('text-anchor', 'end')
              .text(function (d) {
                if (d) {
                  return 'Riders with doping allegations';
                } else {
                  return 'No doping allegations';
                }
              });
        })
        .catch(e => console.log(e));
}

document.addEventListener("DOMContentLoaded", mainIndex);