document.addEventListener("DOMContentLoaded", () => {
    // Funcionalidad para el botón de retroceso
    const backButton = document.querySelector(".back-button")
    backButton.addEventListener("click", () => {
      // En una aplicación real, esto podría navegar hacia atrás
      alert("Volviendo a la página anterior")
    })
  
    // Funcionalidad para el botón de perfil
    const profileIcon = document.querySelector(".profile-container")
    profileIcon.addEventListener("click", () => {
      alert("Abriendo perfil de usuario")
    })
  
    // Funcionalidad para el botón de ruta
    const routeButton = document.querySelector(".route-button")
    routeButton.addEventListener("click", () => {
      alert("Visualizando ruta de entregas")
    })
  
    // Funcionalidad para la barra de búsqueda
    const searchInput = document.querySelector(".search-bar input")
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase()
      const orderCards = document.querySelectorAll(".order-card")
  
      orderCards.forEach((card) => {
        const orderId = card.querySelector(".order-id").textContent.toLowerCase()
        const orderAddress = card.querySelector(".order-address span").textContent.toLowerCase()
  
        if (orderId.includes(searchTerm) || orderAddress.includes(searchTerm)) {
          card.style.display = "block"
        } else {
          card.style.display = "none"
        }
      })
    })
  
    // Hacer que las tarjetas de pedidos sean interactivas
    const orderCards = document.querySelectorAll(".order-card")
    orderCards.forEach((card) => {
      card.addEventListener("click", function () {
        const orderId = this.querySelector(".order-id").textContent
        alert(`Detalles del pedido ${orderId}`)
      })
    })
  })
  
  