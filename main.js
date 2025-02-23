import { mergedData2 ,loadData2} from './scripts/data.js';

document.getElementById('exportButton').addEventListener('click', async() => {
        await loadData2();
    
    const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    const tableHeaders = document.getElementById('tableHeaders');
    console.log("l",mergedData2);

    // Définir les colonnes à afficher dans l'ordre souhaité
    const columns = ['Area', 'VariableGroup', 'Subgroup', 'Variable', 'Unit', 'Value','Year'];

    // Créer les en-têtes de table en fonction des colonnes sélectionnées
    tableHeaders.innerHTML = '';
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;  // Noms des colonnes
        tableHeaders.appendChild(th);
    });

    // Créer des ensembles uniques pour les filtres basés sur mergedData
    const areas = new Set();
    const variableGroups = new Set();
    const subgroupsMap = {};  // Map pour stocker les sous-groupes par groupe de variables
    const years = new Set();

    mergedData2.forEach(data => {
        areas.add(data['Area']);
        variableGroups.add(data['VariableGroup']);
        years.add(data['Year']);

        // Grouper les sous-groupes par groupe de variables
        if (!subgroupsMap[data['VariableGroup']]) {
            subgroupsMap[data['VariableGroup']] = new Set();
        }
        subgroupsMap[data['VariableGroup']].add(data['Subgroup']);
    });

    // Fonction pour peupler les options des filtres
    function populateFilterOptions(selectId, options, defaultText) {
        const select = document.getElementById(selectId);
        select.innerHTML = '';  // Effacer les options précédentes
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = defaultText;
        select.appendChild(defaultOption);

        options.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option;
            optElement.textContent = option;
            select.appendChild(optElement);
        });
    }

    // Peupler les filtres avec des valeurs uniques
    populateFilterOptions('areaFilter', areas, 'Toutes les zones');
    populateFilterOptions('variableGroupFilter', variableGroups, 'Tous les groupes de variables');
    populateFilterOptions('yearFilter', years, 'Toutes les années');

    // Mettre à jour les sous-groupes dynamiquement en fonction de la sélection du groupe de variables
    function updateSubgroupOptions() {
        const variableGroupFilter = document.getElementById('variableGroupFilter').value;
        const subgroupFilter = document.getElementById('subgroupFilter');

        // Effacer les sous-groupes existants
        subgroupFilter.innerHTML = '<option value="">Tous les sous-groupes</option>';

        // Ajouter de nouveaux sous-groupes en fonction des groupes de variables sélectionnés
        if (variableGroupFilter && subgroupsMap[variableGroupFilter]) {
            subgroupsMap[variableGroupFilter].forEach(subgroup => {
                const option = document.createElement('option');
                option.value = subgroup;
                option.textContent = subgroup;
                subgroupFilter.appendChild(option);
            });
        }
    }

    // Appliquer les filtres et mettre à jour le tableau
    function applyFilters() {
        const areaFilter = document.getElementById('areaFilter').value;
        const variableGroupFilter = document.getElementById('variableGroupFilter').value;
        const subgroupFilter = document.getElementById('subgroupFilter').value;
        const yearFilter = document.getElementById('yearFilter').value;

        // Filtrer les données en fonction des valeurs des filtres sélectionnés
        const filteredData = mergedData2.filter(data => {
            return (!areaFilter || data['Area'] === areaFilter) &&
                (!variableGroupFilter || data['VariableGroup'] === variableGroupFilter) &&
                (!subgroupFilter || data['Subgroup'] === subgroupFilter) &&
                (!yearFilter || data['Year'] === yearFilter);
        });

        // Limiter aux 100 premières lignes après application du filtre
        const dataToDisplay = filteredData.slice(0, 1000);

        // Effacer le corps de la table et ajouter les lignes filtrées
        tableBody.innerHTML = '';
        dataToDisplay.forEach(data => {
            const row = tableBody.insertRow();
            columns.forEach(col => {
                const cell = row.insertCell();
                cell.textContent = data[col] || ''; // Ajouter une chaîne vide si les données sont manquantes
            });
        });
    }

    // Appliquer les filtres lors du changement de sélection
    document.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', () => {
            if (select.id === 'variableGroupFilter') {
                updateSubgroupOptions();  // Mettre à jour les sous-groupes lorsque le groupe de variables change
            }
            applyFilters();
        });
    });

    // Appliquer les filtres initialement pour afficher les premières données filtrées
    updateSubgroupOptions();  // S'assurer que les sous-groupes sont mis à jour au chargement initial
    applyFilters();
});

