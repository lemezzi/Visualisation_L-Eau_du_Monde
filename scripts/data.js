export let mergedData;
export let mergedData2;

export let hierarchy;
export let yearSelect;
export let variableSelect;
export let selectedCountries;


export async function loadData() {
    const exploitableWaterResourcesDataRaw = await d3.csv("assets/AQUASTAT_Dissemination_System_Ressources.csv");
    const exploitableWaterUseDataRaw = await d3.csv("assets/AQUASTAT_Dissemination_System_Use.csv");

    const mergedDataRaw = [...exploitableWaterResourcesDataRaw, ...exploitableWaterUseDataRaw];

    mergedData = mergedDataRaw.map(item => ({
        ...item,
        Area: item.Area === "United States of America" ? "United States" : 
              item.Area === "Türkiye" ? "Turkey" :
              item.Area === "Iran (Islamic Republic of)" ? "Iran" :
              item.Area === "United Kingdom of Great Britain and Northern Ireland" ? "United Kingdom" :
              item.Area === "Russian Federation" ? "Russia" : item.Area,

    }));

    console.log(mergedData);

    hierarchy = buildHierarchy(mergedData);

    // Create dropdowns
    yearSelect = document.getElementById("yearSelect");
    variableSelect = document.getElementById("variableSelect");

    // Populate dropdowns
    function populateDropdowns() {
        const years = [...new Set(mergedData.map(d => d.Year))].sort();
        const variables = [...new Set(mergedData.map(d => d.Variable))].sort();

        yearSelect.innerHTML = years.map(year => 
            `<option value="${year}">${year}</option>`
        ).join('');

        variableSelect.innerHTML = variables.map(variable => 
            `<option value="${variable}">${variable}</option>`
        ).join('');
    }

    

    populateDropdowns();
    selectedCountries = new Set();
}

export async function loadData2() {
    const exploitableWaterResourcesDataRaw = await d3.csv("assets/AQUASTAT_Dissemination_System_Ressources.csv");
    const exploitableWaterUseDataRaw = await d3.csv("assets/AQUASTAT_Dissemination_System_Use.csv");

    const mergedDataRaw = [...exploitableWaterResourcesDataRaw, ...exploitableWaterUseDataRaw];

    mergedData2 = mergedDataRaw.map(item => ({
        ...item,
        Area: item.Area === "United States of America" ? "United States" : 
              item.Area === "Türkiye" ? "Turkey" :
              item.Area === "Iran (Islamic Republic of)" ? "Iran" :
              item.Area === "United Kingdom of Great Britain and Northern Ireland" ? "United Kingdom" :
              item.Area === "Russian Federation" ? "Russia" : item.Area,

    }));

    console.log(mergedData2);

    hierarchy = buildHierarchy(mergedData2);

  

}


function buildHierarchy(data) {
    const hierarchy = {};

    data.forEach(item => {
        const { VariableGroup, Subgroup, Variable } = item;

        if (!hierarchy[VariableGroup]) {
            hierarchy[VariableGroup] = {};
        }

        if (!hierarchy[VariableGroup][Subgroup]) {
            hierarchy[VariableGroup][Subgroup] = [];
        }

        if (!hierarchy[VariableGroup][Subgroup].includes(Variable)) {
            hierarchy[VariableGroup][Subgroup].push(Variable);
        }
    });

    return hierarchy;
}