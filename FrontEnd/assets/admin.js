// Fonction pour afficher ou masquer les éléments en mode admin
function handleAdminElement () {
	const adminElement = document.querySelectorAll('.admin-element')
	adminElement.forEach((item) => {
		if (item.classList.contains('hidden')) {
			item.classList.remove('hidden')
		} else {
			item.classList.add('hidden')
		}
	})
}

function handleLogout () {
	const logout = document.querySelector('.logout')

	logout.addEventListener('click', function () {
		sessionStorage.removeItem('authToken')
		location.href = ''
	})
}

// Affiche le mode admin si l'utilisateur est authentifié
if (sessionStorage.getItem('authToken')) {
	handleAdminElement()
	handleLogout()
}

// Fonction pour ajouter des éléments figure dans la galerie
async function displayModalWorks () {
	const gallery = document.querySelector('.modal-gallery')

	if (!gallery) {
		console.error('Conteneur de la galerie non trouvé')
		return
	}

	let works = await getWorks() // Implémentez getWorks pour obtenir les projets depuis votre API
	gallery.innerHTML = '' // Vide la galerie avant de la remplir
	works.forEach(work => {
		const modalItem = document.createElement('div')
		modalItem.className = 'modal-item'
		const img = document.createElement('img')
		img.src = work.imageUrl
		img.alt = 'image'
		const icon = document.createElement('i')
		modalItem.className = 'modal-item'
		modalItem.dataset.id = work.id
		icon.className = 'fa-solid fa-trash-can'
		icon.style.cursor = 'pointer' // À déplacer dans le CSS
		icon.addEventListener('click', function () {
			deleteWork(work.id)
		})

		modalItem.appendChild(img)
		modalItem.appendChild(icon)
		gallery.appendChild(modalItem)
	})
}

// Supprimer une photo
function deleteWork (id) {
	const token = sessionStorage.getItem('authToken')
	const errorMsg = document.querySelector('.remove-error-message')

	fetch(`http://localhost:5678/api/works/${id}`, {
		method: 'DELETE', headers: {
			'Authorization': `Bearer ${token}`,
		},
	}).then(response => {
		if (response.ok) {
			displayWorks()
			displayModalWorks() // Afficher les images à l'ouverture de la page
		} else {
			throw new Error('Erreur lors de la suppression de l\'image.')
		}
	}).catch(error => {
		errorMsg.style.display = 'block'
		console.error('Erreur réseau:', error)
	})
}

// Ajout photos 
let img = document.createElement('img')

document.querySelector('#file').style.display = 'none'
document.getElementById('file').addEventListener('change', function (event) {
	let file = event.target.files[0] // Assignez le fichier à une variable globale
	if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
		const reader = new FileReader()

		reader.onload = function (e) {
			img.src = e.target.result
			img.alt = 'Uploaded Photo'
			document.getElementById('photo-container').appendChild(img)
		}

		reader.readAsDataURL(file)
		document.querySelectorAll('.picture-loaded').forEach((e) => (e.style.display = 'none'))
	} else {
		alert('Veuillez sélectionner une image au format JPG ou PNG.')
	}
})

// Ajout de la photo via la modale au projet
function handleSubmitProject () {
	// Récupère le bouton "Ajouter une photo" par son ID
	const submitButton = document.getElementById('add-photo-button')
	submitButton.addEventListener('click', function (event) {
		event.preventDefault()
		// Appelle la fonction pour ajouter le projet
		addProject()
	})
}

// Fonction pour ajouter un nouveau projet
async function addProject () {
	const errorMsg = document.querySelector('.add-error-message')
	// Récupère le fichier image sélectionné
	const file = document.getElementById('file').files[0]
	const title = document.getElementById('title').value // Récupère le titre du projet saisi
	const category = document.getElementById('form-category').value  // Récupère la catégorie sélectionnée
	const formData = new FormData() // Crée un nouvel objet FormData pour envoyer les données à l'api
	formData.append('image', file) // Ajoute l'image au FormData
	formData.append('title', title) // Ajoute le titre
	formData.append('category', category) // et Ajoute la catégorie

	try {
		// Envoie une requête POST asynchrone au serveur(api) pour ajouter le projet
		const response = await fetch('http://localhost:5678/api/works', {
			method: 'POST', headers: {
				'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
			}, body: formData,
		})

		// Vérifie si la réponse du serveur est positive
		if (response.ok) {
			await displayWorks()
			await displayModalWorks() // Afficher les images à l'ouverture de la page
			resetModale()
		} else {
			throw new Error('Erreur lors de l\'ajout de l\'image.')
		}
	} catch (error) {
		errorMsg.style.display = 'block'
		console.error('Erreur réseau:', error)
	}
}

// Fonction pour obtenir les catégories depuis l'API
async function getCategories () {
	try {
		const response = await fetch('http://localhost:5678/api/categories')
		if (!response.ok) {
			throw new Error(`Erreur HTTP: ${response.status}`)
		}
		return await response.json() // Retourne les catégories sous forme de tableau JSON
	} catch (error) {
		console.error('Erreur lors du chargement des catégories :', error)
		return [] // Retourne un tableau vide en cas d'erreur
	}
}

// Fonction pour ajouter des options dans le select
async function addOptionInSelect () {
	const select = document.getElementById('form-category')
	const categories = await getCategories() // Obtenir les catégories

	const allowedCategories = ['Objets', 'Appartements', 'Hotels & restaurants']

	// Vider le select tout en gardant l'option vide initiale
	select.innerHTML = '<option></option>'

	// Ajouter les options filtrées au select
	categories.forEach(category => {
		if (allowedCategories.includes(category.name.trim())) {
			const option = document.createElement('option')
			option.value = category.id
			option.textContent = category.name
			select.appendChild(option)
		}
	})

	// Si aucune catégorie valide n'est ajoutée, ajouter une option informative
	if (select.options.length === 1) { // Cela signifie qu'il n'y a que l'option vide
		const option = document.createElement('option')
		option.textContent = 'Aucune catégorie disponible'
		select.appendChild(option)
	}
}

function toggleModalView () {
	const galleryModal = document.querySelector('.modal-gallery-view')
	const addModal = document.querySelector('.modal-add-view')

	if (galleryModal.style.display === 'block' || galleryModal.style.display === '') {
		galleryModal.style.display = 'none'
		addModal.style.display = 'block'
	} else {
		galleryModal.style.display = 'block'
		addModal.style.display = 'none'
	}
}

function resetModale () {
	document.querySelectorAll('.picture-loaded').forEach((e) => (e.style.display = 'flex'))
	document.querySelector('#photo-container img').src = ''
	document.querySelector('#photo-container').style.display = 'none'
	document.getElementById('file').files[0] = ''
	document.getElementById('title').value = ''
	document.getElementById('form-category').value = ''
	document.getElementById('modal1').style.display = 'none'
	document.querySelector('.modal-gallery-view').style.display = 'block'
	document.querySelector('.modal-add-view').style.display = 'none'
	document.querySelector('.remove-error-message').style.display = 'none'
	document.querySelector('.add-error-message').style.display = 'none'
}

function handleSubmitModalButton () {
	const file = document.getElementById('file')
	const title = document.getElementById('title')
	const category = document.getElementById('form-category')

	file.addEventListener('change', validateForm)
	title.addEventListener('input', validateForm)
	category.addEventListener('input', validateForm)

	function validateForm () {
		document.getElementById('add-photo-button').disabled = !(file.files[0] && title.value && category.value)
	}
}

document.addEventListener('DOMContentLoaded', function () {
	addOptionInSelect() // Charger les options dans le select lors du chargement de la page
	displayModalWorks() // Afficher les images à l'ouverture de la page
	// Initialiser le formulaire d'ajout de projet
	handleSubmitProject()
	handleSubmitModalButton()

	// Sélectionne le bouton "Modifier" et le bouton "Mode édition"
	const editModeButton = document.getElementById('edit-mode-button')
	const editModeToggle = document.getElementById('edit-mode-toggle')

	if (editModeButton) {
		editModeButton.addEventListener('click', function () {
			openModal()
		})
	} else {
		console.error('Le bouton \'Modifier\' n\'a pas été trouvé.')
	}

	if (editModeToggle) {
		editModeToggle.addEventListener('click', function () {
			openModal()
		})
	} else {
		console.error('Le bouton \'Mode édition\' n\'a pas été trouvé.')
	}

	let modal = null
	const focusableSelector = 'button, a, input, textarea'
	let focusables = []

	const openModal = function () {
		modal = document.querySelector('#modal1')
		if (modal) {
			focusables = Array.from(modal.querySelectorAll(focusableSelector))
			if (focusables.length > 0) focusables[0].focus()
			modal.style.display = 'flex'
			modal.removeAttribute('aria-hidden')
			modal.setAttribute('aria-modal', 'true')
			modal.addEventListener('click', closeModal)
			modal.querySelectorAll('.modal-close-button').forEach((e) => e.addEventListener('click', closeModal))
			modal.querySelector('.modal-stop-propagation').addEventListener('click', stopPropagation)
		} else {
			console.error('La modale n\'a pas été trouvée.')
		}
	}

	const closeModal = function (e) {
		if (modal === null) return
		e.preventDefault()
		modal.style.display = 'none'
		modal.setAttribute('aria-hidden', 'true')
		modal.removeAttribute('aria-modal')
		modal.removeEventListener('click', closeModal)
		modal.querySelector('.modal-close-button').removeEventListener('click', closeModal)
		modal.querySelector('.modal-stop-propagation').removeEventListener('click', stopPropagation)
		modal = null
	}

	const stopPropagation = function (e) {
		e.stopPropagation()
	}

	// Gestion du basculement entre la vue galerie et la vue ajout de photo
	const addPhotoButton = document.querySelector('.add-photo-toggle')
	const backButton = document.querySelector('.modal-back-button')

	if (addPhotoButton) {
		addPhotoButton.addEventListener('click', toggleModalView)
	}

	if (backButton) {
		backButton.addEventListener('click', toggleModalView)
	}
})
