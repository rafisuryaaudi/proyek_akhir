import FormPresenter from './form-presenter';

class FormPage {
  async render() {
    return `
      <section class="px-6 py-10 max-w-2xl mx-auto">
        <h2 class="text-3xl font-extrabold text-center text-blue-700 mb-8 tracking-tight">Tambah Cerita Baru</h2>
        <form id="formStory" class="space-y-6 bg-white p-6 rounded-xl shadow-lg border border-blue-100">
          <div>
            <label for="description" class="block text-sm font-semibold mb-1 text-gray-700">
              <i class="fas fa-align-left mr-2 text-blue-500"></i>Deskripsi Cerita
            </label>
            <textarea id="description" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" rows="4" required aria-label="Deskripsi Cerita"></textarea>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2 text-gray-700">
              <i class="fas fa-camera-retro mr-2 text-blue-500"></i>Pilih Foto Cerita
            </label>
            <div class="flex gap-4">
              <button type="button" id="cameraButton" class="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition text-sm" aria-label="Ambil foto menggunakan kamera">
                <i class="fas fa-camera mr-2"></i> Ambil Foto
              </button>
              <button type="button" id="galleryButton" class="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition text-sm" aria-label="Pilih foto dari galeri">
                <i class="fas fa-image mr-2"></i> Dari Galeri
              </button>
            </div>
            <video id="video" class="w-full mt-4 border rounded-lg" autoplay aria-label="Preview video kamera" style="display: none;"></video>
            <button type="button" id="captureButton" class="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition hidden">
              <i class="fas fa-check-circle mr-2"></i> Ambil Foto
            </button>
            <canvas id="canvas" class="hidden"></canvas>
            <input type="file" id="photo" class="hidden" accept="image/*" />
            <div id="photoPreviewContainer" class="mt-4 hidden">
              <p class="text-sm text-gray-600 mb-2">Preview Foto:</p>
              <img id="photoPreview" class="w-full max-h-[400px] object-contain rounded-lg shadow" alt="Preview Foto Cerita" />
              <button type="button" id="deletePhoto" class="w-full bg-red-600 text-white py-2 mt-3 rounded-md hover:bg-red-700 transition">
                <i class="fas fa-trash mr-2"></i> Hapus Foto
              </button>
            </div>
          </div>
          <div id="mapContainer">
            <label class="block text-sm font-semibold mb-1 text-gray-700">
              <i class="fas fa-map-marker-alt mr-2 text-blue-500"></i> Lokasi Cerita
            </label>
            <div id="map" class="w-full h-64 border rounded-lg shadow-sm"></div>
            <p class="text-xs text-gray-500 mt-1">Klik peta untuk memilih lokasi</p>
          </div>
          <button type="submit" class="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 font-semibold tracking-wide transition">
            <i class="fas fa-plus-circle mr-2"></i> Tambahkan Cerita
          </button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const map = L.map('map').setView([-2.5, 118], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    let selectedLat = 51.505;
    let selectedLon = -0.09;
    let marker = L.marker([selectedLat, selectedLon], { draggable: true }).addTo(map);
    marker.bindPopup("Lokasi Anda").openPopup();

    try {
      const position = await this.getCurrentLocation();
      selectedLat = position.coords.latitude;
      selectedLon = position.coords.longitude;
      map.setView([selectedLat, selectedLon], 13);
      marker.setLatLng([selectedLat, selectedLon]);
    } catch (error) {
      alert('Tidak dapat mendeteksi lokasi Anda. Menggunakan lokasi default.');
    }

    const videoElement = document.getElementById('video');
    const captureButton = document.getElementById('captureButton');
    const canvasElement = document.getElementById('canvas');
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photoPreview');
    const photoPreviewContainer = document.getElementById('photoPreviewContainer');
    const deletePhotoButton = document.getElementById('deletePhoto');
    let cameraStream;

    const startCamera = async () => {
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        alert('Akses kamera hanya diizinkan melalui HTTPS atau localhost.');
        return;
     }

     const loading = document.createElement('p');
      loading.innerText = 'Mengaktifkan kamera...';
      loading.className = 'text-center text-sm text-gray-500 mt-2';
      videoElement.parentNode.insertBefore(loading, videoElement);

     try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideoInput = devices.some(device => device.kind === 'videoinput');
    
      if (!hasVideoInput) {
        alert('Kamera tidak ditemukan pada perangkat ini.');
        return;
      }

    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 720, height: 480, facingMode: 'user' }
    });

    videoElement.srcObject = cameraStream;
    videoElement.style.display = 'block';
    captureButton.classList.remove('hidden');
    photoInput.classList.add('hidden');
    } catch (err) {
      console.error('Gagal mengakses kamera:', err);
      alert('Tidak dapat mengakses kamera: ' + err.message);
      } finally {
      loading.remove();
      }
    };

    const stopCamera = () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      videoElement.style.display = 'none';
      captureButton.classList.add('hidden');
    };

    const dataURLtoBlob = (dataURL) => {
      const byteString = atob(dataURL.split(',')[1]);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
      }
      return new Blob([uint8Array], { type: 'image/jpeg' });
    };

    const showPreview = (dataURL) => {
      photoPreview.src = dataURL;
      photoPreviewContainer.classList.remove('hidden');
    };

    document.getElementById('cameraButton').addEventListener('click', () => {
      stopCamera();
      startCamera();
    });

    document.getElementById('galleryButton').addEventListener('click', () => {
      stopCamera();
      photoInput.classList.remove('hidden');
      photoInput.click();
    });

    captureButton.addEventListener('click', () => {
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      const ctx = canvasElement.getContext('2d');
      ctx.drawImage(videoElement, 0, 0);
      const dataURL = canvasElement.toDataURL('image/jpeg');
      const photoBlob = dataURLtoBlob(dataURL);
      const file = new File([photoBlob], 'photo.jpg', { type: 'image/jpeg' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      photoInput.files = dataTransfer.files;
      showPreview(dataURL);
    });

    photoInput.addEventListener('change', () => {
      const file = photoInput.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          alert("Ukuran gambar terlalu besar. Maksimal 2MB.");
          photoInput.value = '';
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => showPreview(e.target.result);
        reader.readAsDataURL(file);
      }
    });

    deletePhotoButton.addEventListener('click', () => {
      photoInput.value = '';
      photoPreview.src = '';
      photoPreviewContainer.classList.add('hidden');
      stopCamera();
    });

    const form = document.getElementById('formStory');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const description = form.description.value;
      const photo = form.photo.files[0];
      const formData = new FormData();
      formData.append('description', description);
      formData.append('photo', photo);
      formData.append('lat', selectedLat);
      formData.append('lon', selectedLon);
      const token = localStorage.getItem('token');
      const result = await FormPresenter.submitStory(formData, token);
      if (!result.error) {
        alert('Cerita berhasil ditambahkan!');
        form.reset();
        photoPreview.src = '';
        photoPreviewContainer.classList.add('hidden');
        window.location.hash = '/';
      } else {
        alert(`Gagal menambahkan cerita: ${result.message}`);
      }
    });

    window.addEventListener('beforeunload', stopCamera);
    window.addEventListener('hashchange', stopCamera);

    map.on('click', function (e) {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      selectedLat = lat;
      selectedLon = lng;
      marker.bindPopup(`Lokasi: Latitude: ${lat}, Longitude: ${lng}`).openPopup();
    });
  }

  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      } else {
        reject("Geolocation is not supported by this browser.");
      }
    });
  }
}

export default FormPage;
