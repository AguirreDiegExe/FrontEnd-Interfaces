document.addEventListener("DOMContentLoaded", () => {
    // Variables globales
    let map
    const markers = []
    let routeLine
    const deliveryPoints = []
  
    // Inicializar el mapa
    initMap()
  
    // Configurar las pestañas
    setupTabs()
  
    // Configurar eventos para añadir productos
    setupProductEvents()
  
    // Configurar eventos para añadir paradas
    setupStopEvents()
  
    // Funcionalidad para el botón de retroceso
    const backButton = document.querySelector(".back-button")
    backButton.addEventListener("click", () => {
      // En una aplicación real, esto podría navegar hacia atrás
      alert("Volviendo a la página anterior")
    })
  
    // Funcionalidad para el botón de enviar
    const submitButton = document.getElementById("submit-button")
    submitButton.addEventListener("click", () => {
      const description = document.getElementById("description").value.trim()
  
      if (description) {
        // En una aplicación real, aquí se enviaría la información al servidor
        alert("Notificación de faltante enviada correctamente")
        document.getElementById("description").value = ""
      } else {
        alert("Por favor, detalle los faltantes antes de enviar")
      }
    })
  
    // Ajustar el placeholder del textarea para que se vea como en la imagen
    const textarea = document.getElementById("description")
    const originalPlaceholder = textarea.placeholder
  
    textarea.addEventListener("focus", function () {
      if (this.placeholder === originalPlaceholder) {
        this.placeholder = ""
      }
    })
  
    textarea.addEventListener("blur", function () {
      if (this.placeholder === "") {
        this.placeholder = originalPlaceholder
      }
    })
  
    // Funcionalidad para el botón de perfil
    const profileButton = document.querySelector(".profile-button")
    profileButton.addEventListener("click", () => {
      // En una aplicación real, esto podría abrir un menú de perfil
      alert("Abriendo perfil de usuario")
    })
  
    // Funcionalidad para los botones de ver detalle
    const detailButtons = document.querySelectorAll(".btn-detail")
    detailButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const orderId = this.closest(".order-card").querySelector(".order-id").textContent
        alert(`Ver detalles del pedido ${orderId}`)
      })
    })
  
    // Funcionalidad para los botones de emitir faltante
    const missingButtons = document.querySelectorAll(".btn-missing")
    missingButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const orderId = this.closest(".order-card").querySelector(".order-id").textContent
        alert(`Emitir faltante para el pedido ${orderId}`)
      })
    })
  
    // Funcionalidad para el botón de marcar como armado
    const packedButton = document.querySelector(".btn-packed")
    packedButton.addEventListener("click", function () {
      const orderCard = this.closest(".order-card")
      const orderId = orderCard.querySelector(".order-id").textContent
  
      // Cambiar el estado visual de la tarjeta
      orderCard.classList.add("completed")
  
      // Cambiar el botón
      this.innerHTML = '<i class="fas fa-check-circle"></i> Armado'
      this.classList.remove("btn-packed")
      this.classList.add("btn-completed")
  
      alert(`Pedido ${orderId} marcado como armado`)
    })
  })
  
  // Inicializar el mapa con Leaflet
  function initMap() {
    // Coordenadas de ejemplo para el centro del mapa (Córdoba, Argentina)
    const centerLat = -31.4201
    const centerLng = -64.1888
  
    // Crear el mapa
    map = L.map("map").setView([centerLat, centerLng], 15)
  
    // Añadir capa de mapa base (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)
  
    // Ocultar el placeholder una vez que el mapa esté cargado
    map.on("load", () => {
      document.querySelector(".map-placeholder").style.display = "none"
    })
  
    // Añadir marcador para la distribuidora (rojo)
    const distribuidoraIcon = createCustomMarker("#e53935")
    const distribuidora = L.marker([centerLat + 0.003, centerLng + 0.005], { icon: distribuidoraIcon }).addTo(map)
    distribuidora.bindPopup("<b>Distribuidora Verona</b>")
  
    // Obtener la ubicación actual del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude
          const userLng = position.coords.longitude
  
          // Añadir marcador para la ubicación del usuario
          const userIcon = createCustomMarker("#7b1fa2") // Púrpura
          const userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map)
          userMarker.bindPopup("<b>Tu ubicación actual</b>").openPopup()
  
          // Centrar el mapa en la ubicación del usuario
          map.setView([userLat, userLng], 15)
  
          // Actualizar los campos de latitud y longitud en el formulario
          document.getElementById("stop-lat").value = userLat.toFixed(6)
          document.getElementById("stop-lng").value = userLng.toFixed(6)
        },
        (error) => {
          console.error("Error obteniendo la ubicación:", error)
        },
      )
    }
  }
  
  // Crear un marcador personalizado con el color especificado
  function createCustomMarker(color) {
    return L.divIcon({
      className: "custom-marker",
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    })
  }
  
  // Configurar eventos para añadir productos
  function setupProductEvents() {
    const addProductBtn = document.getElementById("add-product-btn")
    const newProductInput = document.getElementById("new-product")
    const productsList = document.getElementById("products-list")
  
    addProductBtn.addEventListener("click", () => {
      const productText = newProductInput.value.trim()
      if (productText) {
        addProduct(productText)
        newProductInput.value = ""
      }
    })
  
    newProductInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const productText = newProductInput.value.trim()
        if (productText) {
          addProduct(productText)
          newProductInput.value = ""
        }
      }
    })
  
    function addProduct(text) {
      const li = document.createElement("li")
      li.innerHTML = `
        ${text}
        <span class="delete-btn"><i class="fas fa-times"></i></span>
      `
  
      const deleteBtn = li.querySelector(".delete-btn")
      deleteBtn.addEventListener("click", () => {
        li.remove()
      })
  
      productsList.appendChild(li)
    }
  }
  
  // Configurar eventos para añadir paradas
  function setupStopEvents() {
    const addStopBtn = document.getElementById("add-stop-btn")
    const useCurrentLocationBtn = document.getElementById("use-current-location-btn")
    const stopNameInput = document.getElementById("stop-name")
    const stopAddressInput = document.getElementById("stop-address")
    const stopLatInput = document.getElementById("stop-lat")
    const stopLngInput = document.getElementById("stop-lng")
  
    addStopBtn.addEventListener("click", () => {
      const name = stopNameInput.value.trim()
      const address = stopAddressInput.value.trim()
      const lat = Number.parseFloat(stopLatInput.value)
      const lng = Number.parseFloat(stopLngInput.value)
  
      if (name && address && !isNaN(lat) && !isNaN(lng)) {
        addStop(name, address, lat, lng)
        stopNameInput.value = ""
        stopAddressInput.value = ""
      } else {
        alert("Por favor complete todos los campos correctamente")
      }
    })
  
    useCurrentLocationBtn.addEventListener("click", () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude
            const lng = position.coords.longitude
  
            stopLatInput.value = lat.toFixed(6)
            stopLngInput.value = lng.toFixed(6)
  
            // Opcional: Obtener dirección mediante geocodificación inversa
            reverseGeocode(lat, lng)
          },
          (error) => {
            console.error("Error obteniendo la ubicación:", error)
            alert("No se pudo obtener la ubicación actual")
          },
        )
      } else {
        alert("La geolocalización no está disponible en este dispositivo")
      }
    })
  }
  
  // Añadir una parada a la lista y al mapa
  function addStop(name, address, lat, lng) {
    // Añadir a la lista de puntos
    deliveryPoints.push({ name, address, lat, lng })
  
    // Actualizar la lista en la UI
    updateStopsList()
  
    // Añadir marcador al mapa
    const deliveryIcon = createCustomMarker("#1e88e5")
    const marker = L.marker([lat, lng], { icon: deliveryIcon }).addTo(map)
    marker.bindPopup(`<b>${name}</b><br>${address}`)
    markers.push(marker)
  
    // Actualizar la ruta en el mapa
    updateRoute()
  
    // Calcular y mostrar la distancia total y tiempo estimado
    calculateRouteStats()
  }
  
  // Actualizar la lista de paradas en la UI
  function updateStopsList() {
    const stopsList = document.getElementById("stops-list")
    stopsList.innerHTML = ""
  
    deliveryPoints.forEach((point, index) => {
      const li = document.createElement("li")
      li.innerHTML = `
        <div class="stop-marker">${index + 1}</div>
        <div class="stop-info">
          <div class="stop-name">${point.name}</div>
          <div class="stop-address">${point.address}</div>
        </div>
        <div class="delete-stop" data-index="${index}"><i class="fas fa-times"></i></div>
      `
  
      const deleteBtn = li.querySelector(".delete-stop")
      deleteBtn.addEventListener("click", function () {
        const index = Number.parseInt(this.getAttribute("data-index"))
        removeStop(index)
      })
  
      stopsList.appendChild(li)
    })
  }
  
  // Eliminar una parada
  function removeStop(index) {
    // Eliminar del array
    deliveryPoints.splice(index, 1)
  
    // Eliminar marcador del mapa
    map.removeLayer(markers[index])
    markers.splice(index, 1)
  
    // Actualizar la UI
    updateStopsList()
  
    // Actualizar la ruta
    updateRoute()
  
    // Recalcular estadísticas
    calculateRouteStats()
  }
  
  // Actualizar la ruta en el mapa
  function updateRoute() {
    // Eliminar la ruta anterior si existe
    if (routeLine) {
      map.removeLayer(routeLine)
    }
  
    // Si hay al menos 2 puntos, crear una nueva ruta
    if (deliveryPoints.length >= 2) {
      const routePoints = deliveryPoints.map((point) => [point.lat, point.lng])
      routeLine = L.polyline(routePoints, { color: "#1e88e5", weight: 4, opacity: 0.7 }).addTo(map)
  
      // Ajustar el mapa para mostrar toda la ruta
      map.fitBounds(routeLine.getBounds(), { padding: [30, 30] })
    }
  }
  
  // Calcular estadísticas de la ruta (distancia y tiempo)
  function calculateRouteStats() {
    if (deliveryPoints.length < 2) {
      document.getElementById("total-distance").textContent = "0.0 km"
      document.getElementById("estimated-time").textContent = "0 min"
      return
    }
  
    // Calcular distancia total (en km)
    let totalDistance = 0
    for (let i = 0; i < deliveryPoints.length - 1; i++) {
      totalDistance += calculateDistance(
        deliveryPoints[i].lat,
        deliveryPoints[i].lng,
        deliveryPoints[i + 1].lat,
        deliveryPoints[i + 1].lng,
      )
    }
  
    // Estimar tiempo (asumiendo 30 km/h en ciudad)
    const estimatedTimeHours = totalDistance / 30
    const estimatedTimeMinutes = Math.round(estimatedTimeHours * 60)
  
    // Actualizar la UI
    document.getElementById("total-distance").textContent = `${totalDistance.toFixed(1)} km`
    document.getElementById("estimated-time").textContent = `${estimatedTimeMinutes} min`
  }
  
  // Calcular distancia entre dos puntos usando la fórmula de Haversine
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Radio de la Tierra en km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distancia en km
    return distance
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI / 180)
  }
  
  // Configurar las pestañas
  function setupTabs() {
    const tabButtons = document.querySelectorAll(".tab-button")
    const tabContents = document.querySelectorAll(".tab-content")
  
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Remover clase active de todos los botones
        tabButtons.forEach((btn) => btn.classList.remove("active"))
  
        // Añadir clase active al botón clickeado
        button.classList.add("active")
  
        // Ocultar todos los contenidos
        tabContents.forEach((content) => content.classList.add("hidden"))
  
        // Mostrar el contenido correspondiente
        const tabId = button.getAttribute("data-tab")
        document.getElementById(tabId).classList.remove("hidden")
      })
    })
  }
  
  // Geocodificación inversa (obtener dirección a partir de coordenadas)
  function reverseGeocode(lat, lng) {
    // En una aplicación real, aquí se haría una llamada a una API de geocodificación
    // Por ejemplo, usando la API de Nominatim de OpenStreetMap:
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.display_name) {
          document.getElementById("stop-address").value = data.display_name
        }
      })
      .catch((error) => {
        console.error("Error en geocodificación inversa:", error)
      })
  }
  
  // Import Leaflet library
  var L = require("leaflet")
  
  