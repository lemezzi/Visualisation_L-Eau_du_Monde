const metricsData = {
    consumption: [
        { value: "4,000", metric: " billion m³", trend: "+1.2%" }, // for 2010
        { value: "4,080", metric: " billion m³", trend: "+2.0%" }, // for 2011
        { value: "4,150", metric: " billion m³", trend: "+1.7%" }, // for 2012
        { value: "4,230", metric: " billion m³", trend: "+1.9%" }, // for 2013
        { value: "4,310", metric: " billion m³", trend: "+1.9%" }, // for 2014
        { value: "4,400", metric: " billion m³", trend: "+2.1%" }, // for 2015
        { value: "4,500", metric: " billion m³", trend: "+2.3%" }, // for 2016
        { value: "4,600", metric: " billion m³", trend: "+2.2%" }, // for 2017
        { value: "4,750", metric: " billion m³", trend: "+3.3%" }, // for 2018
        { value: "4,860", metric: " billion m³", trend: "+2.3%" }, // for 2019
        { value: "5,000", metric: " billion m³", trend: "+2.9%" }, // for 2020
        { value: "5,120", metric: " billion m³", trend: "+2.4%" }  // for 2021
    ],
    resources: [
        { value: "45,000", metric: " billion m³", trend: "+0.3%" }, // for 2010
        { value: "45,150", metric: " billion m³", trend: "+0.4%" }, // for 2011
        { value: "45,300", metric: " billion m³", trend: "+0.3%" }, // for 2012
        { value: "45,500", metric: " billion m³", trend: "+0.4%" }, // for 2013
        { value: "45,700", metric: " billion m³", trend: "+0.4%" }, // for 2014
        { value: "45,950", metric: " billion m³", trend: "+0.5%" }, // for 2015
        { value: "46,100", metric: " billion m³", trend: "+0.3%" }, // for 2016
        { value: "46,350", metric: " billion m³", trend: "+0.5%" }, // for 2017
        { value: "46,500", metric: " billion m³", trend: "+0.3%" }, // for 2018
        { value: "46,700", metric: " billion m³", trend: "+0.4%" }, // for 2019
        { value: "46,950", metric: " billion m³", trend: "+0.5%" }, // for 2020
        { value: "47,200", metric: " billion m³", trend: "+0.5%" }  // for 2021
    ],
    population: [
        { value: "7.007", metric: " billion", trend: "+1.1%" }, // for 2010
        { value: "7.086", metric: " billion", trend: "+1.1%" }, // for 2011
        { value: "7.176", metric: " billion", trend: "+1.3%" }, // for 2012
        { value: "7.265", metric: " billion", trend: "+1.2%" }, // for 2013
        { value: "7.354", metric: " billion", trend: "+1.2%" }, // for 2014
        { value: "7.442", metric: " billion", trend: "+1.2%" }, // for 2015
        { value: "7.529", metric: " billion", trend: "+1.2%" }, // for 2016
        { value: "7.614", metric: " billion", trend: "+1.1%" }, // for 2017
        { value: "7.697", metric: " billion", trend: "+1.1%" }, // for 2018
        { value: "7.777", metric: " billion", trend: "+1.0%" }, // for 2019
        { value: "7.856", metric: " billion", trend: "+1.0%" }, // for 2020
        { value: "7.921", metric: " billion", trend: "+0.8%" }  // for 2021
    ],
    usageRates: [
        { value: "2010", metric: "", trend: "+1" },
        { value: "2011", metric: "", trend: "+1" },
        { value: "2012", metric: "", trend: "+1" },
        { value: "2013", metric: "", trend: "+1" },
        { value: "2014", metric: "", trend: "+1" },
        { value: "2015", metric: "", trend: "+1" },
        { value: "2016", metric: "", trend: "+1" },
        { value: "2017", metric: "", trend: "+1" },
        { value: "2018", metric: "", trend: "+1" },
        { value: "2019", metric: "", trend: "+1" },
        { value: "2020", metric: "", trend: "+1" },
        { value: "2021", metric: "", trend: "+1" }
    ]
};




// Index actuel pour chaque métrique
let currentIndices = {
    consumption: 0,
    resources: 0,
    population: 0,
    usageRates: 0
};

// Fonction pour mettre à jour une info box
function updateInfoBox(selector, dataArray, dataKey) {
    const box = document.querySelector(selector);
    if (!box) return;

    // Incrémenter l'index et revenir à 0 si nécessaire
    currentIndices[dataKey] = (currentIndices[dataKey] + 1) % dataArray.length;
    const data = dataArray[currentIndices[dataKey]];

    // Mise à jour de la valeur
    const valueElement = box.querySelector('.value');
    valueElement.textContent = `${data.value}${data.metric}`;

    // Mise à jour de la tendance
    const trendElement = box.querySelector('.trend');
    const isIncrease = data.trend.includes('+');
    trendElement.className = `trend ${isIncrease ? 'trend trend-up' : 'trend trend-down'}`;
    trendElement.innerHTML = `
        <i class="fas fa-arrow-${isIncrease ? 'up' : 'down'}"></i>
        ${data.trend}
    `;
}

// Fonction pour mettre à jour toutes les info boxes
function updateAllInfoBoxes() {
    updateInfoBox('.info-box.water', metricsData.consumption, 'consumption');
    updateInfoBox('.info-box.resources', metricsData.resources, 'resources');
    updateInfoBox('.info-box.population', metricsData.population, 'population');
    updateInfoBox('.info-box.usage', metricsData.usageRates, 'usageRates');
}

// Démarrer les mises à jour
setInterval(updateAllInfoBoxes, 2000);  // Change toutes les 5 secondes

// Première mise à jour immédiate
updateAllInfoBoxes();