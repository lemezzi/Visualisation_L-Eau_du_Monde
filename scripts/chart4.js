import { mergedData, loadData, yearSelect, variableSelect, selectedCountries } from './data.js';

document.addEventListener("DOMContentLoaded", async function () {
    await loadData();

    const container = document.getElementById("chart4");
    const width = container.clientWidth;
    const height = container.clientHeight;

    const data = mergedData.map(item => ({
        ...item,
        Value: parseFloat(item.Value),
        Year: item.Year
    }));

    const style = document.createElement('style');
    style.textContent = `
        .node {
            stroke: white;
            stroke-width: 2px;
            rx: 5;
            ry: 5;
        }
        .tooltip {
            position: absolute;
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 10px;
            border-radius: 6px;
            font-size: 13px;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease-in-out;
        }
        .label {
            font-size: 12px;
            fill: white;
            font-weight: bold;
            pointer-events: none;
        }
        .legend {
            display: flex;
            flex-wrap: wrap;
            margin-top: 10px;
            font-size: 13px;
        }
        .legend-item {
            display: flex;
            align-items: center;
            margin-right: 15px;
            margin-bottom: 5px;
        }
        .legend-color {
            width: 12px;
            height: 12px;
            border-radius: 3px;
            margin-right: 5px;
        }
    `;
    document.head.appendChild(style);

    document.addEventListener('selectedCountriesChange', renderChart);
    yearSelect.addEventListener("change", renderChart);
    variableSelect.addEventListener("change", renderChart);

    function renderChart() {
        const filteredData = data.filter(d =>
            d.Variable === variableSelect.value &&
            selectedCountries.has(d.Area) &&
            d.Year === yearSelect.value
        );

        const svg = createTreemapChart({
            data: filteredData,
            width: width,
            height: height - 50, // Leave space for legend
            valueKey: "Value",
            categoryKey: "Area"
        });

        container.innerHTML = '';
        container.appendChild(svg);

        // Ajouter la légende après avoir rendu le graphique
        renderLegend(filteredData);
    }

    renderChart();
});

function createTreemapChart({ data, width = 800, height = 500, valueKey, categoryKey }) {
    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height])
        .style("font-family", "Inter, system-ui, sans-serif");

    const root = d3.hierarchy({ children: data })
        .sum(d => d[valueKey]);

    d3.treemap()
        .size([width, height])
        .padding(4)(root);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");

    const nodes = svg.selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    nodes.append("rect")
        .attr("class", "node")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", (d, i) => colorScale(d.data[categoryKey]))
        .style("filter", "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))") // Soft shadow effect
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`
                <strong>${d.data[categoryKey]}</strong><br>
                Valeur: ${d.data[valueKey].toFixed(2)}
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 15) + "px");
        })
        .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0));

    nodes.append("text")
        .attr("class", "label")
        .attr("x", 5)
        .attr("y", 15)
        .text(d => d.data[categoryKey])
        .style("opacity", d => (d.x1 - d.x0 > 50 && d.y1 - d.y0 > 20) ? 1 : 0); // Show text only if box is big enough

    return svg.node();
}

// Fonction pour créer la légende avec les pays sélectionnés
function renderLegend(data) {
    const legendContainer = document.createElement("div");
    legendContainer.className = "legend";

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    data.forEach(d => {
        const item = document.createElement("div");
        item.className = "legend-item";

        const colorBox = document.createElement("div");
        colorBox.className = "legend-color";
        colorBox.style.backgroundColor = colorScale(d.Area);

        const text = document.createElement("span");
        text.textContent = d.Area;

        item.appendChild(colorBox);
        item.appendChild(text);
        legendContainer.appendChild(item);
    });

    // Supprime l'ancienne légende et ajoute la nouvelle
    const existingLegend = document.querySelector(".legend");
    if (existingLegend) {
        existingLegend.remove();
    }

    document.getElementById("chart4").appendChild(legendContainer);
}
