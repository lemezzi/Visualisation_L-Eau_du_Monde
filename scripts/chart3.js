import { mergedData, loadData, yearSelect, variableSelect, selectedCountries } from './data.js';

document.addEventListener("DOMContentLoaded", async function () {
    await loadData();

    const width = document.getElementById("chart3").clientWidth;
    const height = document.getElementById("chart3").clientHeight;
    const parseYear = d3.timeParse("%Y");

    const data = mergedData.map(item => ({
        ...item,
        Value: parseFloat(item.Value),
        Year: parseYear(item.Year),
    }));

    // Ajout des styles CSS pour l'interactivité
    const style = document.createElement('style');
    style.textContent = `
        .bar-rect {
            transition: opacity 0.2s;
            cursor: pointer;
        }
        .bar-rect:hover {
            opacity: 1 !important;
        }
        .bar-rect.dimmed {
            opacity: 0.2 !important;
        }
        .tooltip {
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
            font-size: 14px;
            transition: all 0.2s;
        }
        .tooltip-title {
            font-weight: 600;
            margin-bottom: 4px;
            color:rgb(255, 255, 255);
        }
        .tooltip-value {
            color:rgb(255, 255, 255);
        }
        .legend-item {
            cursor: pointer;
            transition: opacity 0.2s;
        }
        .legend-item:hover {
            opacity: 0.7;
        }
    `;
    document.head.appendChild(style);

    document.addEventListener('selectedCountriesChange', renderChart);
    yearSelect.addEventListener("change", renderChart);
    variableSelect.addEventListener("change", renderChart);

    function renderChart() {
        const filteredData = data.filter(d => 
            d.Variable === variableSelect.value && selectedCountries.has(d.Area)
        );
        const svg = createHistogram({
            data: filteredData,
            height: height,
            xKey: "Year",
            yKey: "Value",
            colorKey: "Area",
        });

        const chartContainer = document.getElementById("chart3");
        chartContainer.innerHTML = '';
        chartContainer.appendChild(svg);
    }

    renderChart();
});

function createHistogram({
    data,
    height = 460,
    margin = { top: 30, right: 120, bottom: 50, left: 60 },
    xKey,
    yKey,
    colorKey,
}) {
    const width = document.getElementById("chart3").clientWidth;
    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height])
        .style("font-family", "Inter, system-ui, sans-serif");

    // Fond amélioré
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f8fafc");

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Modification de l'échelle x pour les barres
    const x = d3.scaleBand()
        .domain(data.map(d => d3.timeFormat("%Y")(d[xKey])))
        .range([margin.left, margin.left + innerWidth])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[yKey])])
        .range([height - margin.bottom, margin.top])
        .nice();

    const color = d3.scaleOrdinal()
        .range(['#2563eb', '#db2777', '#16a34a', '#9333ea', '#ea580c', '#0891b2']);

    // Grille améliorée
    function createGrid() {
        const yGrid = g => g
            .attr("stroke", "#e2e8f0")
            .attr("stroke-opacity", 0.8)
            .call(d3.axisLeft(y).tickSize(-innerWidth).tickFormat(""));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(yGrid);
    }

    createGrid();

    const grouped_data = d3.group(data, d => d[colorKey]);
    const countries = Array.from(grouped_data.keys());
    const barWidth = x.bandwidth() / countries.length;

    // Création du tooltip amélioré
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Fonction pour gérer l'interaction avec les barres
    function handleBarInteraction(countryName, active) {
        const duration = 400;
        const easing = d3.easeCubicOut;

        svg.selectAll(".bar-rect")
            .transition()
            .duration(duration)
            .ease(easing)
            .style("opacity", active ? d => d.Area === countryName ? 1 : 0.2 : 0.8);

        // Mise à jour de la légende
        svg.selectAll(".legend-item")
            .transition()
            .duration(duration)
            .ease(easing)
            .style("opacity", active ? d => d === countryName ? 1 : 0.3 : 1);
    }

    // Ajout des barres avec animation et interactivité
    grouped_data.forEach((countryData, country) => {
        const countryIndex = countries.indexOf(country);
        
        svg.append("g")
            .selectAll("rect")
            .data(countryData)
            .join("rect")
            .attr("class", "bar-rect")
            .attr("x", d => x(d3.timeFormat("%Y")(d[xKey])) + countryIndex * barWidth)
            .attr("y", d => y(d[yKey]))
            .attr("width", barWidth)
            .attr("height", d => height - margin.bottom - y(d[yKey]))
            .attr("fill", color(country))
            .style("opacity", 0.8)
            .on("mouseover", (event, d) => {
                handleBarInteraction(d[colorKey], true);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                tooltip.html(`
                    <div class="tooltip-title">${d[colorKey]}</div>
                    <div class="tooltip-value">Année: ${d3.timeFormat("%Y")(d[xKey])}</div>
                    <div class="tooltip-value">Valeur: ${d[yKey].toFixed(2)} ${d.Unit}</div>
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 15) + "px");
            })
            .on("mouseout", (event, d) => {
                handleBarInteraction(null, false);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    });

    // Axes améliorés
    function createAxes() {
        const xAxis = g => g
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x)
                .tickSize(6)
                .tickPadding(8))
            .call(g => g.select(".domain").attr("stroke", "#cbd5e1"))
            .call(g => g.selectAll(".tick line").attr("stroke", "#cbd5e1"))
            .call(g => g.selectAll(".tick text")
                .attr("fill", "#64748b")
                .style("font-size", "12px"));

        const yAxis = g => g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y)
                .tickSize(6)
                .tickPadding(8))
            .call(g => g.select(".domain").attr("stroke", "#cbd5e1"))
            .call(g => g.selectAll(".tick line").attr("stroke", "#cbd5e1"))
            .call(g => g.selectAll(".tick text")
                .attr("fill", "#64748b")
                .style("font-size", "12px"));

        svg.append("g").call(xAxis);
        svg.append("g").call(yAxis);
    }

    createAxes();

    // Légende interactive améliorée
    function createLegend() {
        const legendGroup = svg.append("g")
            .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);

        const legendItems = legendGroup.selectAll("g")
            .data(color.domain())
            .join("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 25})`)
            .on("mouseover", (event, d) => handleBarInteraction(d, true))
            .on("mouseout", () => handleBarInteraction(null, false));

        legendItems.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", d => color(d))
            .attr("rx", 2);

        legendItems.append("text")
            .attr("x", 25)
            .attr("y", 12)
            .text(d => d)
            .style("font-size", "12px")
            .style("font-weight", "500")
            .style("fill", "#475569");
    }

    createLegend();

    // Labels des axes
    function createAxisLabels() {
        const unit = data.length > 0 ? data[0].Unit : '';

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", margin.left - 40)
            .attr("x", -(height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "500")
            .style("fill", "#475569")
            .text(`${yKey} (${unit})`);

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height - 10)
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "500")
            .style("fill", "#475569")
            .text("Année");
    }

    createAxisLabels();

    return svg.node();
}