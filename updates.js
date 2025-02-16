// Données multiples pour chaque métrique
const metricsData = {
    consumption: [
        { value: "2.5M", metric: "m³/jour", trend: "+5.2%" },
        { value: "750K", metric: "L/heure", trend: "-3.1%" },
        { value: "1.8M", metric: "m³/jour", trend: "+2.4%" },
        { value: "3.2M", metric: "m³/jour", trend: "-4.7%" }
    ],
    resources: [
        { value: "4.8M", metric: "m³", trend: "-2.1%" },
        { value: "3.9M", metric: "m³", trend: "+1.8%" },
        { value: "5.2M", metric: "m³", trend: "-3.5%" },
        { value: "4.1M", metric: "m³", trend: "+4.2%" }
    ],
    population: [
        { value: "1.2M", metric: "habitants", trend: "+3.8%" },
        { value: "950K", metric: "habitants", trend: "+2.5%" },
        { value: "1.4M", metric: "habitants", trend: "-1.2%" },
        { value: "1.1M", metric: "habitants", trend: "+5.1%" }
    ],
    usageRates: [
        { value: "52.1", metric: "%", trend: "+1.5%" },
        { value: "48.3", metric: "%", trend: "-2.8%" },
        { value: "55.7", metric: "%", trend: "+3.2%" },
        { value: "49.9", metric: "%", trend: "-1.9%" }
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