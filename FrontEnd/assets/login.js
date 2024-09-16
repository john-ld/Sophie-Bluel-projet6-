// URL de l'API de connexion
const loginApi = 'http://localhost:5678/api/users/login'

// Ajout d'un gestionnaire d'événements pour la soumission du formulaire
document.getElementById('loginform').addEventListener('submit', handleSubmit)

// Fonction asynchrone qui gère la soumission du formulaire
async function handleSubmit (event) {
	// Empêche le comportement par défaut du formulaire (rechargement de la page)
	event.preventDefault()

	// Récupération des éléments du formulaire pour l'email et le mot de passe
	const emailElement = document.getElementById('email')
	const passwordElement = document.getElementById('password')

	// Création de l'objet utilisateur avec les valeurs saisies
	let user = {
		email: emailElement.value,
		password: passwordElement.value,
	}

	// Envoi de la requête de connexion à l'API
	let response = await fetch(loginApi, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(user),
	})

	// Suppression du message d'erreur précédent s'il existe
	const previousError = document.querySelector('.error-login')
	if (previousError) {
		previousError.remove()
	}

	// Gestion de la réponse de l'API
	if (response.status !== 200) {
		// En cas d'échec de la connexion, création et affichage d'un message d'erreur
		const errorBox = document.createElement('div')
		errorBox.className = 'error-login'
		errorBox.innerHTML = 'Veuillez vérifier votre email et/ou votre mot de passe'
		document.querySelector('form').prepend(errorBox)
	} else {
		// récupération du token d'authentification
		let result = await response.json()
		const token = result.token

		// Stockage du token dans le sessionStorage
		sessionStorage.setItem('authToken', token)

		// Redirection vers la page d'accueil
		window.location.href = 'index.html'
	}
}



