// ================================
// KONFIGURASI
// ================================
const CONFIG = {
  tanggalPernikahan: new Date('2025-07-20T08:00:00+07:00'),
  namaPengantin: {
    wanita: 'Arum Lestari',
    pria: 'Budi Santoso'
  }
};

// ================================
// AMBIL NAMA TAMU DARI URL
// ================================
function getNamaTamuFromURL() {
  const params = new URLSearchParams(window.location.search);
  const nama = params.get('to') || params.get('nama') || params.get('tamu');
  
  if (nama) {
    // Decode URL encoding dan kapitalisasi
    return decodeURIComponent(nama);
  }
  return 'Bapak/Ibu/Saudara/i';
}

// ================================
// GENERATE LINK UNDANGAN DARI EXCEL
// ================================
async function generateLinksFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Ambil sheet pertama
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert ke JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Generate links
        const baseURL = window.location.origin + window.location.pathname;
        const links = jsonData.map(row => {
          // Sesuaikan dengan nama kolom di Excel Anda
          // Contoh: kolom "Nama", "nama", "NAMA", atau "Nama Tamu"
          const nama = row.Nama || row.nama || row.NAMA || row['Nama Tamu'] || row['nama tamu'];
          
          if (nama) {
            const encodedNama = encodeURIComponent(nama.trim());
            return {
              nama: nama,
              link: `${baseURL}?to=${encodedNama}`
            };
          }
          return null;
        }).filter(item => item !== null);
        
        resolve(links);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ================================
// INISIALISASI HALAMAN
// ================================
document.addEventListener('DOMContentLoaded', function() {
  // Set nama tamu dari URL
  const namaTamu = getNamaTamuFromURL();
  document.getElementById('nama-tamu').textContent = namaTamu;
  
  // Setup tombol buka undangan
  setupBukaUndangan();
  
  // Setup countdown
  setupCountdown();
  
  // Setup form ucapan
  setupFormUcapan();
  
  // Setup musik
  setupMusic();
  
  // Load ucapan yang tersimpan
  loadUcapan();
});

// ================================
// BUKA UNDANGAN
// ================================
function setupBukaUndangan() {
  const btnBuka = document.getElementById('btn-buka');
  const cover = document.getElementById('cover');
  const sections = document.querySelectorAll('.section:not(#cover), .footer');
  
  btnBuka.addEventListener('click', function() {
    // Play musik
    const music = document.getElementById('bg-music');
    music.play().catch(e => console.log('Autoplay blocked'));
    document.getElementById('btn-music').textContent = '🔊';
    
    // Sembunyikan cover dengan animasi
    cover.style.opacity = '0';
    cover.style.transform = 'translateY(-100%)';
    
    setTimeout(() => {
      cover.classList.add('hidden');
      
      // Tampilkan semua section dengan animasi
      sections.forEach((section, index) => {
        setTimeout(() => {
          section.classList.remove('hidden');
          section.classList.add('animate-in');
        }, index * 200);
      });
    }, 500);
  });
}

// ================================
// COUNTDOWN TIMER
// ================================
function setupCountdown() {
  function updateCountdown() {
    const now = new Date().getTime();
    const target = CONFIG.tanggalPernikahan.getTime();
    const diff = target - now;
    
    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      document.getElementById('days').textContent = String(days).padStart(2, '0');
      document.getElementById('hours').textContent = String(hours).padStart(2, '0');
      document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
      document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    } else {
      // Acara sudah lewat
      document.getElementById('days').textContent = '00';
      document.getElementById('hours').textContent = '00';
      document.getElementById('minutes').textContent = '00';
      document.getElementById('seconds').textContent = '00';
    }
  }
  
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// ================================
// FORM UCAPAN
// ================================
function setupFormUcapan() {
  const form = document.getElementById('form-ucapan');
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nama = document.getElementById('input-nama').value.trim();
    const pesan = document.getElementById('input-pesan').value.trim();
    const kehadiran = document.getElementById('input-kehadiran').value;
    
    if (nama && pesan) {
      const ucapan = {
        nama,
        pesan,
        kehadiran,
        waktu: new Date().toISOString()
      };
      
      // Simpan ke localStorage (dalam produksi, kirim ke backend)
      saveUcapan(ucapan);
      
      // Tampilkan
      displayUcapan(ucapan, true);
      
      // Reset form
      form.reset();
    }
  });
}

function saveUcapan(ucapan) {
  const ucapans = JSON.parse(localStorage.getItem('ucapan-pernikahan') || '[]');
  ucapans.unshift(ucapan);
  localStorage.setItem('ucapan-pernikahan', JSON.stringify(ucapans));
}

function loadUcapan() {
  const ucapans = JSON.parse(localStorage.getItem('ucapan-pernikahan') || '[]');
  ucapans.forEach(ucapan => displayUcapan(ucapan, false));
}

function displayUcapan(ucapan, prepend = true) {
  const container = document.getElementById('daftar-ucapan');
  
  const div = document.createElement('div');
  div.className = 'ucapan-item';
  if (prepend) div.classList.add('animate-in');
  
  let kehadiranText = '';
  if (ucapan.kehadiran === 'hadir') kehadiranText = '✅ Akan Hadir';
  else if (ucapan.kehadiran === 'tidak') kehadiranText = '❌ Tidak Bisa Hadir';
  else if (ucapan.kehadiran === 'ragu') kehadiranText = '🤔 Masih Ragu';
  
  div.innerHTML = `
    <p class="nama">${escapeHtml(ucapan.nama)}</p>
    <p class="pesan">${escapeHtml(ucapan.pesan)}</p>
    ${kehadiranText ? `<p class="kehadiran">${kehadiranText}</p>` : ''}
  `;
  
  if (prepend) {
    container.insertBefore(div, container.firstChild);
  } else {
    container.appendChild(div);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ================================
// COPY REKENING
// ================================
function copyRekening(nomor) {
  navigator.clipboard.writeText(nomor).then(() => {
    alert('Nomor rekening berhasil disalin!');
  }).catch(() => {
    // Fallback
    const input = document.createElement('input');
    input.value = nomor;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    alert('Nomor rekening berhasil disalin!');
  });
}

// ================================
// MUSIK BACKGROUND
// ================================
function setupMusic() {
  const btnMusic = document.getElementById('btn-music');
  const music = document.getElementById('bg-music');
  let isPlaying = false;
  
  btnMusic.addEventListener('click', function() {
    if (isPlaying) {
      music.pause();
      btnMusic.textContent = '🔇';
    } else {
      music.play();
      btnMusic.textContent = '🔊';
    }
    isPlaying = !isPlaying;
  });
}

// ================================
// TOOL: GENERATE SEMUA LINK DARI EXCEL
// Panggil fungsi ini untuk generate link semua tamu
// ================================
async function generateAllLinks() {
  // Buat input file
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls';
  
  input.onchange = async function(e) {
    const file = e.target.files[0];
    if (file) {
      try {
        const links = await generateLinksFromExcel(file);
        
        // Tampilkan hasil
        console.log('=== DAFTAR LINK UNDANGAN ===');
        links.forEach((item, index) => {
          console.log(`${index + 1}. ${item.nama}`);
          console.log(`   ${item.link}`);
          console.log('');
        });
        
        // Download sebagai file
        downloadLinksAsCSV(links);
        
      } catch (error) {
        console.error('Error:', error);
        alert('Gagal membaca file Excel. Pastikan format file benar.');
      }
    }
  };
  
  input.click();
}

function downloadLinksAsCSV(links) {
  let csv = 'Nama,Link Undangan\n';
  links.forEach(item => {
    csv += `"${item.nama}","${item.link}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'daftar-link-undangan.csv';
  a.click();
  URL.revokeObjectURL(url);
}
