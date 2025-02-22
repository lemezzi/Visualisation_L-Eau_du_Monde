// Create the tree layout
const width = 1200;
const height = 1200;
const margin = { top: 20, right: 120, bottom: 20, left: 120 };

// Clear any existing SVG
d3.select("svg").selectAll("*").remove();

// Set up the SVG
const svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);


    const dataStructure = {
        "Water resources": {
            "Exploitable water resources and dam capacity": [
                "Dam capacity per capita",
                "Exploitable: irregular renewable surface water",
                "Exploitable: regular renewable groundwater",
                "Exploitable: regular renewable surface water",
                "Exploitable: total renewable surface water",
                "Interannual variability (WRI)",
                "Seasonal variability (WRI)",
                "Total dam capacity",
                "Total exploitable water resources"
            ],
            "External renewable water resources": [
                "Groundwater: accounted inflow",
                "Groundwater: accounted outflow to other countries",
                "Groundwater: entering the country (total)",
                "Groundwater: leaving the country to other countries (total)",
                "Surface water: accounted flow of border rivers",
                "Surface water: accounted inflow",
                "Surface water: entering the country (total)",
                "Surface water: inflow not submitted to treaties",
                "Surface water: inflow secured through treaties",
                "Surface water: inflow submitted to treaties",
                "Surface water: leaving the country to other countries (total)",
                "Surface water: outflow to other countries not submitted to treaties",
                "Surface water: outflow to other countries secured through treaties",
                "Surface water: outflow to other countries submitted to treaties",
                "Surface water: total external renewable",
                "Surface water: total flow of border rivers",
                "Water resources: total external renewable"
            ],
            "Internal renewable water resources": [
                "Groundwater produced internally",
                "Overlap between surface water and groundwater"
            ]
        },
        "Water use": {
            "Pressure on water resources": [
                "Agricultural water withdrawal as % of total renewable water resources",
                "SDG 6.4.1. Industrial Water Use Efficiency",
                "SDG 6.4.1. Irrigated Agriculture Water Use Efficiency",
                "SDG 6.4.1. Services Water Use Efficiency",
                "SDG 6.4.1. Water Use Efficiency",
                "SDG 6.4.2. Agricultural Sector Contribution to Water Stress",
                "SDG 6.4.2. Industrial Sector Contribution to Water Stress",
                "SDG 6.4.2. Municipal Sector Contribution to Water Stress",
                "SDG 6.4.2. Water Stress"
            ],
            "Wastewater": [
                "Area equipped for irrigation by direct use of not treated municipal wastewater",
                "Area equipped for irrigation by direct use of treated municipal wastewater",
                "Capacity of the municipal wastewater treatment facilities",
                "Collected municipal wastewater",
                "Direct use of not treated municipal wastewater for irrigation purposes",
                "Direct use of treated municipal wastewater for irrigation purposes",
                "Not treated municipal wastewater",
                "Not treated municipal wastewater discharged (secondary water)",
                "Number of municipal wastewater treatment facilities",
                "Produced municipal wastewater",
                "Treated municipal wastewater",
                "Treated municipal wastewater discharged (secondary water)"
            ],
            "Water withdrawal by sector": [
                "Agricultural water withdrawal",
                "Agricultural water withdrawal as % of total water withdrawal",
                "Agricultural water withdrawal per capita",
                "Environmental Flow Requirements",
                "Industrial water withdrawal",
                "Industrial water withdrawal as % of total water withdrawal",
                "Industrial water withdrawal per capita",
                "Irrigation water requirement",
                "Irrigation water withdrawal",
                "Municipal water withdrawal",
                "Municipal water withdrawal as % of total withdrawal",
                "Municipal water withdrawal per capita (total population)",
                "Total water withdrawal",
                "Total water withdrawal per capita",
                "Water withdrawal for aquaculture"
            ]
        }
    };    

// Create hierarchy from data
function createHierarchy(data) {
    let root = { name: "Water Resources Overview", children: [] };
    Object.entries(data).forEach(([category, subcategories]) => {
        let categoryNode = { name: category, children: [] };
        Object.entries(subcategories).forEach(([subcategory, variables]) => {
            let subcategoryNode = { name: subcategory, children: [] };
            variables.forEach(variable => {
                subcategoryNode.children.push({ name: variable });
            });
            categoryNode.children.push(subcategoryNode);
        });
        root.children.push(categoryNode);
    });
    return root;
}

// Create the tree layout
const treeData = createHierarchy(dataStructure);
const root = d3.hierarchy(treeData);

const treeLayout = d3.tree()
    .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

treeLayout(root);

// Add links with smooth curves
const links = svg.selectAll(".link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x))
    .style("fill", "none")
    .style("stroke", "#052c65")
    .style("stroke-opacity", 0.4)
    .style("stroke-width", 1.5)
    .style("transition", "all 0.3s ease");

// Add nodes
const nodes = svg.selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.y},${d.x})`);

// Add node circles with gradient fill
nodes.append("circle")
    .attr("r", d => d.children ? 6 : 4)
    .style("fill", d => d.children ? "#052c65" : "#4fc3f7")
    .style("stroke", "#fff")
    .style("stroke-width", 2)
    .style("cursor", "pointer")
    .style("transition", "all 0.3s ease")
    .on("mouseover", function() {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("r", d => d.children ? 8 : 6)
            .style("fill", "#0d47a1");
    })
    .on("mouseout", function() {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("r", d => d.children ? 6 : 4)
            .style("fill", d => d.children ? "#052c65" : "#4fc3f7");
    });

// Add labels
nodes.append("text")
    .attr("dy", ".31em")
    .attr("x", d => d.children ? -10 : 10)
    .style("text-anchor", d => d.children ? "end" : "start")
    .style("font-size", d => d.depth === 0 ? "16px" : "12px")
    .style("font-weight", d => d.depth === 0 ? "bold" : "normal")
    .style("fill", "#333")
    .style("cursor", "pointer")
    .text(d => d.data.name)
    .style("transition", "all 0.3s ease")
    .on("mouseover", function() {
        d3.select(this)
            .transition()
            .duration(200)
            .style("fill", "#0d47a1");
    })
    .on("mouseout", function() {
        d3.select(this)
            .transition()
            .duration(200)
            .style("fill", "#333");
    });

// Add white background to text for better readability
nodes.insert("rect", "text")
    .attr("x", d => d.children ? -10 - (d.data.name.length * 6.5) : 10)
    .attr("y", -9)
    .attr("width", d => d.data.name.length * 6.5)
    .attr("height", 18)
    .style("fill", "white")
    .style("fill-opacity", 0.8)
    .attr("rx", 4)
    .attr("transform", d => d.children ? `translate(-${d.data.name.length * 6.5}, 0)` : "translate(0, 0)");

// Add hover effect for links
links.on("mouseover", function() {
    d3.select(this)
        .transition()
        .duration(200)
        .style("stroke-opacity", 0.8)
        .style("stroke-width", 2);
})
.on("mouseout", function() {
    d3.select(this)
        .transition()
        .duration(200)
        .style("stroke-opacity", 0.4)
        .style("stroke-width", 1.5);
});