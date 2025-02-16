import { mergedData, loadData, yearSelect, variableSelect, selectedCountries } from './data.js';

// Ajout du CSS directement dans le JavaScript
const style = document.createElement('style');
style.textContent = `
    /* Ajout des styles pour les labels sur la carte */
    .country-label {
        position: absolute;
        background: rgba(255, 255, 255, 0.9);
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        pointer-events: none;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: opacity 0.3s, transform 0.3s;
        z-index: 1000;
    }

    .country-info-popup {
        position: absolute;
        background: rgba(255, 255, 255, 0.95);
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        z-index: 999;
        max-width: 280px;
        opacity: 0;
        transform: translateY(10px);
    }

    .country-info-popup.active {
        opacity: 1;
        transform: translateY(0);
    }

    .map-controls {
        position: absolute;
        left: 20px;
        bottom: 20px;
        display: flex;
        gap: 10px;
        z-index: 1000;
    }

    .map-button {
        background: white;
        border: none;
        padding: 8px;
        border-radius: 1px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .map-button:hover {
        background: #f8f9fa;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    /* Animation pour les pays */
    .countries {
        transition: all 0.3s ease;
    }

    .countries:hover {
        fill-opacity: 0.8;
        filter: brightness(1.1);
    }

    .countries.selected {
        filter: brightness(1.2);
        stroke-width: 1px;
        stroke: #2196F3;
    }

    /* Ajout d'une animation de pulse pour le pays sélectionné */
    @keyframes pulse {
        0% { stroke-width: 2px; }
        50% { stroke-width: 3px; }
        100% { stroke-width: 2px; }
    }

    .countries.selected {
        animation: pulse 2s infinite;
    }
    .country-info-panel {
        position: absolute;
        right: 20px;
        top: 20px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 15px;
        width: 300px;
        max-height: 35vh;
        overflow-y: auto;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        z-index: 1000;
        opacity: 0;
    }

    .country-info-panel.active {
        transform: translateX(0);
        opacity: 0.7;
    }

    .country-info-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
    }

    .country-name {
        font-size: 1.2em;
        font-weight: bold;
        margin: 0;
    }

    .close-panel {
        background: none;
        border: none;
        font-size: 1.2em;
        cursor: pointer;
        padding: 5px;
    }

    .country-data {
        margin-bottom: 15px;
    }

    .country-summary {
        margin-bottom: 20px;
    }

    .section-title {
        font-size: 1.1em;
        color: #333;
        margin: 15px 0 10px 0;
        padding-bottom: 5px;
        border-bottom: 2px solid #eee;
    }

    .data-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
    }

    .data-item {
        background: #f8f9fa;
        padding: 10px;
        border-radius: 6px;
        transition: background-color 0.2s;
    }

    .data-item:hover {
        background: #e9ecef;
    }

    .data-label {
        font-weight: 500;
        color: #666;
        font-size: 0.9em;
        margin-bottom: 5px;
    }

    .data-value {
        font-size: 1.1em;
        color: #333;
        font-weight: 600;
    }

    .trends-section {
        margin-top: 20px;
        padding-top: 15px;
        border-top: 1px solid #eee;
    }

    .trends-chart {
        width: 100%;
        height: 200px;
        margin-top: 10px;
    }

    .countries.selected {
        stroke: #2196F3;
        stroke-width: 2px;
        stroke-opacity: 1;
    }

    .countries {
        transition: fill 0.3s ease;
    }

    .countries:hover {
        fill-opacity: 0.8;
    }

    .tooltip {
        position: absolute;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 8px 12px;
        font-size: 14px;
        pointer-events: none;
        opacity: 0;
        z-index: 1001;
    }
`;
document.head.appendChild(style);

// Fonction utilitaire pour formater les valeurs
function formatValue(value) {
    if (typeof value === 'number') {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
        } else if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'k';
        }
        return value.toFixed(1);
    }
    return value;
}

// Fonction pour créer le graphique d'évolution
function createTrendsChart(countryName) {
    const selectedVariable = variableSelect.value;
    
    // Récupérer les données historiques pour ce pays et cette variable
    const trendsData = mergedData.filter(d => 
        d.Area === countryName && 
        d.Variable === selectedVariable
    ).sort((a, b) => a.Year - b.Year);

    if (trendsData.length > 0) {
        const margin = {top: 20, right: 20, bottom: 30, left: 50};
        const width = document.querySelector('.trends-chart').clientWidth - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;

        // Nettoyer le graphique existant
        d3.select('#trendsChart').html('');

        const svg = d3.select('#trendsChart')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Échelles
        const x = d3.scaleLinear()
            .domain(d3.extent(trendsData, d => +d.Year))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(trendsData, d => +d.Value)])
            .range([height, 0]);

        // Ligne
        const line = d3.line()
            .x(d => x(+d.Year))
            .y(d => y(+d.Value));

        // Axes
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('d')));

        svg.append('g')
            .call(d3.axisLeft(y));

        // Dessiner la ligne
        svg.append('path')
            .datum(trendsData)
            .attr('fill', 'none')
            .attr('stroke', '#2196F3')
            .attr('stroke-width', 2)
            .attr('d', line);

        // Points
        svg.selectAll('circle')
            .data(trendsData)
            .enter()
            .append('circle')
            .attr('cx', d => x(+d.Year))
            .attr('cy', d => y(+d.Value))
            .attr('r', 4)
            .attr('fill', '#2196F3')
            .attr('stroke', 'white')
            .attr('stroke-width', 2);
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    await loadData();
    const world = await d3.json("assets/world-110m.geo.json");

    const width = document.getElementById("chart").clientWidth;
    const height = document.getElementById("chart").clientHeight;
    let path;
    let projection;

    try {
        // Create the main SVG
        const svg = d3.select("#chart")
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("width", "100%")
            .attr("height", "100%");

        const g = svg.append("g");

        // Créer le panneau d'information
        const infoPanel = d3.select("#chart")
            .append("div")
            .attr("class", "country-info-panel")
            .html(`
                <div class="country-info-header">
                    <h3 class="country-name"></h3>
                    <button class="close-panel">×</button>
                </div>
                <div class="country-data"></div>
            `);

        // Create tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip");

        // Define zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", zoomed);

        svg.call(zoom);

        function updateInfoPanel(countryData) {
            const selectedYear = yearSelect.value;
            const countryName = countryData.properties.brk_name;
            
            // Récupérer toutes les données pour ce pays
            const allCountryData = mergedData.filter(d => 
                d.Year === selectedYear && 
                d.Area === countryName
            );

            infoPanel.select(".country-name")
                .text(countryName);

            const dataContainer = infoPanel.select(".country-data");
            dataContainer.html("");

            if (allCountryData.length > 0) {
                // Créer une section pour chaque type de données
                let html = `
                    <div class="country-summary">
                        <h4 class="section-title">Résumé ${selectedYear}</h4>
                    </div>
                    <div class="data-grid">
                `;

                // Trier les données par variable
                allCountryData.forEach(data => {
                    html += `
                        <div class="data-item">
                            <div class="data-label">${data.Variable}</div>
                            <div class="data-value">${formatValue(data.Value)} ${data.Unit}</div>
                        </div>
                    `;
                });

                html += `</div>`;

                // Ajouter un graphique d'évolution si disponible
                if (mergedData.some(d => d.Area === countryName)) {
                    html += `
                        <div class="trends-section">
                            <h4 class="section-title">Évolution</h4>
                            <div class="trends-chart" id="trendsChart"></div>
                        </div>
                    `;
                }

                dataContainer.html(html);

                // Mettre à jour le graphique d'évolution
                if (mergedData.some(d => d.Area === countryName)) {
                    createTrendsChart(countryName);
                }
            } else {
                dataContainer.html(`
                    <div class="data-item">
                        <div class="data-label">Données non disponibles pour ${countryName}</div>
                    </div>
                `);
            }
        }

        function updateMap() {
            const selectedYear = yearSelect.value;
            const selectedVariable = variableSelect.value;

            const filteredData = mergedData.filter(d => 
                d.Year === selectedYear && d.Variable === selectedVariable
            );

            projection = d3.geoMercator()
                .fitSize([width, height], world);
            
            path = d3.geoPath().projection(projection);

            const colorScale = d3.scaleSequential()
                .interpolator(d3.interpolateRdYlBu)
                .domain(d3.extent(filteredData, d => +d.Value));

            g.selectAll("path.countries")
                .data(world.features)
                .join("path")
                .attr("class", "countries")
                .attr("d", path)
                .attr("stroke", "white")
                .attr("fill", d => {
                    const countryData = filteredData.find(entry => 
                        entry.Area === d.properties.brk_name
                    );
                    return countryData ? colorScale(+countryData.Value) : "#ccc";
                })
                .on("click", clicked)
                .on("mouseover", handleMouseOver)
                .on("mousemove", handleMouseMove)
                .on("mouseout", handleMouseOut);

            updateLegend(colorScale, filteredData);
        }

        function handleMapControls() {
    const controls = d3.select('#chart')
        .append('div')
        .attr('class', 'map-controls');

    // Bouton de réinitialisation
    controls.append('button')
        .attr('class', 'map-button reset-button')
        .html('🔄')
        .on('click', reset);

    // Bouton de zoom in
    controls.append('button')
        .attr('class', 'map-button zoom-in')
        .html('➕')
        .on('click', () => {
            const currentTransform = d3.zoomTransform(svg.node());
            svg.transition()
                .duration(300)
                .call(zoom.scaleBy, 1.5);
        });

    // Bouton de zoom out
    controls.append('button')
        .attr('class', 'map-button zoom-out')
        .html('➖')
        .on('click', () => {
            const currentTransform = d3.zoomTransform(svg.node());
            svg.transition()
                .duration(300)
                .call(zoom.scaleBy, 0.75);
        });
}

function handleMouseOver(event, d) {
            const selectedYear = yearSelect.value;
            const selectedVariable = variableSelect.value;
            const filteredData = mergedData.filter(d => 
                d.Year === selectedYear && d.Variable === selectedVariable
            );
            
            const countryData = filteredData.find(entry => 
                entry.Area === d.properties.brk_name
            );
            
            tooltip.style("opacity", 1)
                .html(countryData ? 
                    `<strong>${d.properties.brk_name}</strong><br>Value: ${countryData.Value} ${countryData.Unit}` :
                    `<strong>${d.properties.brk_name}</strong><br>No data available`
                );
        
            if (!selectedCountries.has(d.properties.brk_name)) {
                d3.select(this)
                    .style("stroke", "black")
                    .style("stroke-width", "2px");
            }
        }
        
        function handleMouseOut(event, d) {
            tooltip.style("opacity", 0);
        
            if (!selectedCountries.has(d.properties.brk_name)) {
                d3.select(this)
                    .style("stroke", "white")
                    .style("stroke-width", "1px");
            }
        }
        
        function handleMouseMove(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 30) + "px");
        }

        function updateLegend(colorScale, data) {
            svg.selectAll(".legend").remove();

            const legendWidth = 200, legendHeight = 10;
            const legendSvg = svg.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${width -200}, ${height - 40})`);

            const legendScale = d3.scaleLinear()
                .domain(d3.extent(data, d => +d.Value))
                .range([0, legendWidth]);

            const legendAxis = d3.axisBottom(legendScale)
                .ticks(5, ".0s");

            const defs = svg.append("defs");
            const linearGradient = defs.append("linearGradient")
                .attr("id", "legend-gradient")
                .attr("x1", "0%")
                .attr("x2", "100%");

            linearGradient.selectAll("stop")
                .data(d3.range(0, 1.01, 0.2))
                .enter().append("stop")
                .attr("offset", d => `${d * 100}%`)
                .attr("stop-color", d => colorScale(
                    legendScale.domain()[0] + d * (legendScale.domain()[1] - legendScale.domain()[0])
                ));

            legendSvg.append("rect")
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .style("fill", "url(#legend-gradient)");

            legendSvg.append("g")
                .attr("transform", `translate(0, ${legendHeight})`)
                .call(legendAxis);

            legendSvg.append("text")
                .attr("x", -70)
                .attr("y", 9)
                .attr("fill", "black")
                .style("font-size", "13px")
                .text(`${data[0].Unit}`);
        }

        // Fonction pour afficher les informations sur la carte


function clicked(event, d) {
            if (!path) return;
            
            const [[x0, y0], [x1, y1]] = path.bounds(d);
            const countryName = d.properties.brk_name;
            
            event.stopPropagation();

            // Mise à jour du panneau d'information
            updateInfoPanel(d);
            
            if (selectedCountries.has(countryName)) {
                selectedCountries.delete(countryName);
                d3.select(this)
                    .classed("selected", false);
                infoPanel.classed("active", false);
            } else {
                selectedCountries.add(countryName);
                d3.select(this)
                    .classed("selected", true);
                infoPanel.classed("active", true);
            }

            document.dispatchEvent(new CustomEvent('selectedCountriesChange', { 
                detail: Array.from(selectedCountries) 
            }));

            const scale = Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height));
            const translate = [width / 2 - scale * (x0 + x1) / 2, height / 2 - scale * (y0 + y1) / 2];
        
            svg.transition()
                .duration(750)
                .call(zoom.transform, 
                    d3.zoomIdentity
                        .translate(translate[0], translate[1])
                        .scale(scale)
                );
        }

        function zoomed(event) {
            const {transform} = event;
            g.attr("transform", transform);
            g.attr("stroke-width", 1 / transform.k);
        }

        function reset() {
            g.selectAll("path.countries")
                .classed("selected", false);
            
            selectedCountries.clear();
            infoPanel.classed("active", false);
            
            svg.transition()
                .duration(750)
                .call(zoom.transform, d3.zoomIdentity);

            document.dispatchEvent(new CustomEvent('selectedCountriesChange', { 
                detail: Array.from(selectedCountries) 
            }));
        }

        // Gestion de la fermeture du panneau
        infoPanel.select(".close-panel").on("click", function() {
            infoPanel.classed("active", false);
         
            
            document.dispatchEvent(new CustomEvent('selectedCountriesChange', { 
                detail: Array.from(selectedCountries) 
            }));
        });

        // Add event listeners
        yearSelect.addEventListener("change", updateMap);
        variableSelect.addEventListener("change", updateMap);
        svg.on("click", reset);

        // Ajouter le popup sur la carte
        const mapPopup = d3.select('#chart')
            .append('div')
            .attr('id', 'map-popup')
            .attr('class', 'country-info-popup');

        // Ajouter les contrôles de la carte
        handleMapControls();

        // Initial render
        updateMap();

        // Animation smooth pour le zoom
        svg.call(zoom)
            .transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity);

    } catch (error) {
        console.error("Error loading or processing data:", error);
        d3.select("#chart")
            .append("div")
            .attr("class", "error-message")
            .style("color", "red")
            .style("padding", "20px")
            .text("Error loading visualization. Please check the console for details.");
    }
});

