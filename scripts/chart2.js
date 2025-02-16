import { mergedData, loadData, yearSelect, variableSelect, selectedCountries } from './data.js';

document.addEventListener("DOMContentLoaded", async function () {
    await loadData();

    const width = document.getElementById("chart2").clientWidth;
    const height = document.getElementById("chart2").clientHeight;
    const parseYear = d3.timeParse("%Y");

    const data = mergedData.map(item => ({
        ...item,
        Value: parseFloat(item.Value),
        Year: parseYear(item.Year),
    }));

    // Ajout des styles CSS pour l'interactivité
    const style = document.createElement('style');
    style.textContent = `
        .line-path {
            transition: stroke-width 0.2s, opacity 0.2s;
            cursor: pointer;
        }
        .line-path:hover {
            stroke-width: 4px !important;
            opacity: 1 !important;
        }
        .line-path.dimmed {
            opacity: 0.2 !important;
        }
        .data-point {
            transition: r 0.2s, opacity 0.2s;
            cursor: pointer;
        }
        .data-point:hover {
            r: 6px;
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
        const svg = createLineChart({
            data: filteredData,
            height: height,
            xKey: "Year",
            yKey: "Value",
            colorKey: "Area",
        });

        const chartContainer = document.getElementById("chart2");
        chartContainer.innerHTML = '';
        chartContainer.appendChild(svg);
    }

    renderChart();
});

function createLineChart({
    data,
    height = 460,
    margin = { top: 30, right: 120, bottom: 50, left: 60 },
    xKey,
    yKey,
    colorKey,
}) {
    const width = document.getElementById("chart2").clientWidth;
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

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d[xKey]))
        .range([margin.left, margin.left + innerWidth])
        .nice();

    const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d[yKey]))
        .range([height - margin.bottom, margin.top])
        .nice();

    const color = d3.scaleOrdinal()
        .range(['#2563eb', '#db2777', '#16a34a', '#9333ea', '#ea580c', '#0891b2']);

    // Grille améliorée
    function createGrid() {
        const xGrid = g => g
            .attr("stroke", "#e2e8f0")
            .attr("stroke-opacity", 0.8)
            .call(d3.axisBottom(x).tickSize(innerHeight).tickFormat(""));

        const yGrid = g => g
            .attr("stroke", "#e2e8f0")
            .attr("stroke-opacity", 0.8)
            .call(d3.axisLeft(y).tickSize(-innerWidth).tickFormat(""));

        svg.append("g")
            .attr("transform", `translate(0,${margin.top})`)
            .call(xGrid);

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(yGrid);
    }

    createGrid();

    const line = d3.line()
        .curve(d3.curveMonotoneX)
        .x(d => x(d[xKey]))
        .y(d => y(d[yKey]));

    const grouped_data = d3.group(data, d => d[colorKey]);

    // Création du tooltip amélioré
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Fonction pour gérer l'interaction avec les lignes
    function handleLineInteraction(countryName, active) {
        // Configuration des animations
        const duration = 400;
        const easing = d3.easeCubicOut;
    
        // Mise à jour des lignes avec animation améliorée
        svg.selectAll(".line-path")
            .classed("dimmed", active ? d => d[0] !== countryName : false)
            .transition()
            .duration(duration)
            .ease(easing)
            .style("stroke-width", d => {
                if (!active) return "2.5px";
                return d[0] === countryName ? "6px" : "1.5px";
            })
            .style("filter", d => {
                if (!active) return "drop-shadow(0px 1px 1px rgba(0,0,0,0.1))";
                return d[0] === countryName ? 
                    "drop-shadow(0px 6px 8px rgba(0,0,0,0.25))" : 
                    "none";
            });
    
        // Animation des points de données
        svg.selectAll(".data-point")
            .transition()
            .duration(duration)
            .ease(easing)
            .style("opacity", active ? d => d[colorKey] === countryName ? 1 : 0.1 : 1)
            .attr("r", d => {
                if (!active) return 4;
                return d[colorKey] === countryName ? 8 : 3;
            })
            .style("stroke-width", d => {
                if (!active) return "2px";
                return d[colorKey] === countryName ? "3px" : "1px";
            })
            .style("filter", d => {
                if (!active) return "none";
                return d[colorKey] === countryName ? 
                    "drop-shadow(0px 4px 4px rgba(0,0,0,0.2))" : 
                    "none";
            });
    
        // Gestion des étiquettes de valeurs
        const valueLabels = svg.selectAll(".value-label")
            .data(active && countryName ? 
                data.filter(d => d[colorKey] === countryName) : 
                [], 
                d => d[xKey]); // Clé stable pour les transitions
    
        // Entrée des nouvelles étiquettes
        const valueLabelsEnter = valueLabels.enter()
            .append("g")
            .attr("class", "value-label")
            .attr("transform", d => `translate(${x(d[xKey])},${y(d[yKey]) - 15})`);
    
        valueLabelsEnter.append("rect")
            .attr("class", "value-label-bg")
            .attr("x", -22)
            .attr("y", -14)
            .attr("width", 44)
            .attr("height", 20)
            .attr("rx", 4)
            .attr("fill", "white")
            .attr("opacity", 0.9)
            .style("filter", "drop-shadow(0px 1px 2px rgba(0,0,0,0.1))");
    
        valueLabelsEnter.append("text")
            .attr("dy", "0.32em")
            .style("text-anchor", "middle")
            .style("font-size", "11px")
            .style("font-weight", "600")
            .style("fill", d => color(d[colorKey]));
    
        // Mise à jour des étiquettes existantes
        const valueLabelsUpdate = valueLabels.merge(valueLabelsEnter);
        
        valueLabelsUpdate
            .transition()
            .duration(duration)
            .ease(easing)
            .attr("transform", d => `translate(${x(d[xKey])},${y(d[yKey]) - 15})`);
    
        valueLabelsUpdate.select("text")
            .text(d => d[yKey].toFixed(1));
    
        // Sortie des étiquettes
        valueLabels.exit()
            .transition()
            .duration(duration/2)
            .style("opacity", 0)
            .remove();
    
        // Mise à jour de la légende (fixe, sans translation)
        svg.selectAll(".legend-item")
            .transition()
            .duration(duration)
            .ease(easing)
            .style("opacity", active ? d => d === countryName ? 1 : 0.3 : 1)
            .selectAll("text")
            .style("font-weight", d => active && d === countryName ? "600" : "400");
    
        // Ligne de référence animée
        const refLineData = active && countryName ? [data.filter(d => d[colorKey] === countryName)] : [];
        
        const refLine = svg.selectAll(".reference-line-group")
            .data(refLineData);
    
        // Entrée de la ligne de référence
        const refLineEnter = refLine.enter()
            .append("g")
            .attr("class", "reference-line-group");
    
        refLineEnter.append("line")
            .attr("class", "reference-line")
            .attr("x1", margin.left)
            .attr("x2", width - margin.right)
            .style("stroke-dasharray", "4 4")
            .style("stroke-width", 1)
            .style("opacity", 0);
    
        // Mise à jour de la ligne de référence
        const refLineUpdate = refLine.merge(refLineEnter);
        
        refLineUpdate.select(".reference-line")
            .transition()
            .duration(duration)
            .ease(easing)
            .attr("y1", d => y(d[d.length-1][yKey]))
            .attr("y2", d => y(d[d.length-1][yKey]))
            .style("stroke", d => color(d[0][colorKey]))
            .style("opacity", 0.3);
    
        // Sortie de la ligne de référence
        refLine.exit()
            .transition()
            .duration(duration/2)
            .style("opacity", 0)
            .remove();
    
        // Ajout d'un effet de focus
        if (active) {
            svg.select(".focus-highlight")
                .transition()
                .duration(duration)
                .ease(easing)
                .style("opacity", 0.1);
        }
    }
    
    // Styles CSS mis à jour
    const styles = `
        .line-path {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .line-path:hover {
            cursor: pointer;
        }
        
        .data-point {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
        }
        
        .value-label {
            pointer-events: none;
        }
        
        .value-label-bg {
            transition: all 0.4s ease;
        }
        
        .legend-item {
            transition: opacity 0.4s ease;
            cursor: pointer;
        }
        
        .reference-line {
            transition: all 0.4s ease;
        }
        
        .focus-highlight {
            pointer-events: none;
        }
    `;
    
    // Ajout des styles au document
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    // Fonction auxiliaire pour initialiser les effets visuels
    function initializeVisualEffects(svg) {
        // Ajout d'un filtre pour l'ombre portée
        const defs = svg.append("defs");
        
        const filter = defs.append("filter")
            .attr("id", "glow")
            .attr("height", "130%");
    
        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 3)
            .attr("result", "blur");
    
        filter.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 0)
            .attr("dy", 3)
            .attr("result", "offsetBlur");
    
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode")
            .attr("in", "offsetBlur");
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");
    }
    // Ajout des lignes avec animation et interactivité
    svg.append("g")
        .selectAll("path")
        .data(grouped_data)
        .join("path")
        .attr("class", "line-path")
        .attr("fill", "none")
        .attr("stroke", d => color(d[0]))
        .attr("stroke-width", 2.5)
        .attr("d", d => line(d[1]))
        .style("filter", "drop-shadow(0px 1px 1px rgba(0,0,0,0.1))")
        .on("mouseover", (event, d) => handleLineInteraction(d[0], true))
        .on("mouseout", () => handleLineInteraction(null, false))
        .on("click", (event, d) => {
            const countryName = d[0];
            // Ajoutez ici la logique pour afficher plus d'informations sur le pays
            console.log(`Clicked on country: ${countryName}`);
        }
    );
        


    // Ajout des points avec tooltip amélioré
    grouped_data.forEach((points, key) => {
        svg.append("g")
            .selectAll("circle")
            .data(points)
            .join("circle")
            .attr("class", "data-point")
            .attr("cx", d => x(d[xKey]))
            .attr("cy", d => y(d[yKey]))
            .attr("r", 4)
            .attr("fill", "#fff")
            .attr("stroke", color(key))
            .attr("stroke-width", 2)
            .style("filter", "drop-shadow(0px 1px 2px rgba(141, 31, 31, 0.1))")
            .on("mouseover", (event, d) => {
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
            .on("mouseout", () => {
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
            .on("mouseover", (event, d) => handleLineInteraction(d, true))
            .on("mouseout", () => handleLineInteraction(null, false))
            .on("click", (event, d) => {
                console.log(`Legend clicked: ${d}`);
                // Ajoutez ici la logique pour afficher/masquer la ligne
            });

        legendItems.append("rect")
            .attr("x", -10)
            .attr("y", -5)
            .attr("width", 100)
            .attr("height", 22)
            .attr("fill", "#fff")
            .attr("rx", 4)
            .attr("opacity", 0);

        legendItems.append("line")
            .attr("x1", 0)
            .attr("x2", 15)
            .attr("y1", 5)
            .attr("y2", 5)
            .attr("stroke", d => color(d))
            .attr("stroke-width", 2.5);

        legendItems.append("text")
            .attr("x", 25)
            .attr("y", 9)
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
            .text(xKey);
    }

    createAxisLabels();

    return svg.node();
}