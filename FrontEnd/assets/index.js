// Fonction pour récupérer les travaux depuis le back-end
async function getWorks() {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        const works = await response.json();
        console.log(works);

        return works;
    } catch (error) {
        console.error('Erreur lors de la récupération des travaux:', error);
    }
}

// Fonction pour ajouter des éléments figure dans la galerie
async function displayWorks(id = -1) {
    const gallery = document.querySelector('.gallery');
    if (!gallery) {
        console.error('Conteneur de la galerie non trouvé');
        return;
    }
    let works = await getWorks();
    if (id != -1) {
        works = works.filter(work => work.categoryId === id);
    }

    gallery.innerHTML = ''; // Vide la galerie avant de la remplir
    works.forEach(work => {
        const figure = document.createElement("figure");
        const img = document.createElement("img")
        const figcaption = document.createElement("figcaption")
        img.src = work.imageUrl
        img.alt = work.title
        figcaption.textContent = work.title
        figure.appendChild(img)
        figure.appendChild(figcaption)
        gallery.appendChild(figure);
    });
}

// Fonction pour récupérer les catégories depuis le back-end
async function getCategories() {
    try {
        const response = await fetch("http://localhost:5678/api/categories");
        const categories = await response.json();
        console.log('Catégories:', categories);
        return categories
    } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
    }
}

// Fonction pour ajouter des filtres dynamiques dans le DOM
async function displayCategories() {
    const filtersContainer = document.querySelector('.filters');
    if (!filtersContainer) {
        console.error('Conteneur des filtres non trouvé');
        return;
    }
    const categories = await getCategories()
    filtersContainer.innerHTML = ''; // Vider les filtres avant de les remplir

    // Ajouter un filtre "Tous" pour afficher tous les travaux
    const allFilter = document.createElement("div");
    allFilter.className = "filter";
    allFilter.textContent = "Tous";
    allFilter.addEventListener('click', async () => {
        displayWorks();
    });

    filtersContainer.appendChild(allFilter);

    // Ajoute des filtres pour chaque catégorie
    categories.forEach(category => {
        const filter = document.createElement("div");
        filter.className = "filter";
        filter.textContent = category.name;

        filter.addEventListener('click', async () => {
            displayWorks(category.id);
        });

        filtersContainer.appendChild(filter);
    });
}

// Appel des fonctions lorsque le DOM est entièrement chargé
document.addEventListener('DOMContentLoaded', () => {
    displayWorks(); // Chargement des travaux
    displayCategories(); // Chargement des catégories
});




