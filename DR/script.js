// ================================
// KONFIGURASI
// ================================
const CONFIG = {
  tanggalPernikahan: new Date('2027-01-17T08:00:00+07:00'),
  namaPengantin: {
    wanita: 'Rahmanisya',
    pria: 'Dicky Abdul Rachman'
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
const GOOGLE_SHEET_WEBHOOK = 'https://script.google.com/macros/d/{YOUR_SHEET_ID}/usercallback'; // Replace with your Google Apps Script Web App URL

function setupFormUcapan() {
  const form = document.getElementById('form-ucapan');
  const btnWhatsapp = document.getElementById('btn-whatsapp');
  const btnSaveUcapan = document.getElementById('btn-save-ucapan');
  const btnSaveRsvp = document.getElementById('btn-save-rsvp');

  
  function ambilDataForm() {
    const nama = document.getElementById('input-nama').value.trim();
    const pesan = document.getElementById('input-pesan').value.trim();
    const kehadiran = document.getElementById('input-kehadiran').value;
    const jumlahOrang = document.getElementById('input-jumlah-orang').value;

    return { nama, pesan, kehadiran, jumlahOrang };
  }
  
  // Submit/Save Ucapan (pesan wajib)
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const { nama, pesan, kehadiran, jumlahOrang } = ambilDataForm();

    if (nama && pesan && jumlahOrang) {

      const ucapan = {
        nama,
        pesan,
        kehadiran,
        jumlahOrang: Number(jumlahOrang),
        waktu: new Date().toISOString()
      };
      
      // Save to localStorage
      saveUcapan(ucapan);
      
      // Send to Google Sheets (optional)
      sendToGoogleSheets(ucapan);
      
      // Display message
      displayUcapan(ucapan, true);
      
      // Reset form
      form.reset();
      alert('Your message has been sent successfully!');
    }
  });
  
  // Save RSVP (tanpa pesan)
  if (btnSaveRsvp) {
    btnSaveRsvp.addEventListener('click', function() {
      const { nama, pesan, kehadiran, jumlahOrang } = ambilDataForm();
      if (nama && kehadiran && jumlahOrang) {
        const rsvp = {
          nama,
          pesan: pesan || '(Tanpa pesan)',
          kehadiran,
          jumlahOrang: Number(jumlahOrang),
          waktu: new Date().toISOString()
        };

        saveUcapan(rsvp);
        sendToGoogleSheets(rsvp);
        displayUcapan(rsvp, true);
        form.reset();
        alert('Konfirmasi kehadiran berhasil disimpan!');
      } else {
        alert('Lengkapi Nama, Konfirmasi Kehadiran, dan Jumlah Orang.');
      }
    });
  }

  // WhatsApp Share
  if (btnWhatsapp) {
    btnWhatsapp.addEventListener('click', function() {
      shareToWhatsApp();
    });
  }
}

function saveUcapan(ucapan) {
  const ucapans = JSON.parse(localStorage.getItem('ucapan-pernikahan') || '[]');
  ucapans.unshift(ucapan);
  localStorage.setItem('ucapan-pernikahan', JSON.stringify(ucapans));
}

function loadUcapan() {
  // HAPUS NAMA YANG TELAH MENGISI MESSAGES & RSVP
  // Jadi setiap halaman dibuka, pesan yang tersimpan tidak ditampilkan lagi.
  localStorage.removeItem('ucapan-pernikahan');
  document.getElementById('daftar-ucapan').innerHTML = '';
}


function displayUcapan(ucapan, prepend = true) {
  const container = document.getElementById('daftar-ucapan');
  
  const div = document.createElement('div');
  div.className = 'ucapan-item';
  if (prepend) div.classList.add('animate-in');
  
  let kehadiranText = '';
  if (ucapan.kehadiran === 'hadir') kehadiranText = '✅ Akan Hadir';
  else if (ucapan.kehadiran === 'tidak') kehadiranText = '❌ Tidak Hadir';
  else if (ucapan.kehadiran === 'ragu') kehadiranText = '🤔 Ragu-Ragu';

  
  const jumlahOrangText = (typeof ucapan.jumlahOrang === 'number' && !Number.isNaN(ucapan.jumlahOrang))
    ? `🧾 ${ucapan.jumlahOrang} orang`
    : '';

  div.innerHTML = `
    <p class="nama">${escapeHtml(ucapan.nama)}</p>
    <p class="pesan">${escapeHtml(ucapan.pesan)}</p>
    ${kehadiranText ? `<p class="kehadiran">${kehadiranText}</p>` : ''}
    ${jumlahOrangText ? `<p class="kehadiran">${jumlahOrangText}</p>` : ''}
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
    alert('Bank account number copied to clipboard!');
  }).catch(() => {
    // Fallback
    const input = document.createElement('input');
    input.value = nomor;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    alert('Bank account number copied to clipboard!');
  });
}

// ================================
// SEND TO GOOGLE SHEETS
// ================================
function sendToGoogleSheets(ucapan) {
  // Format: https://script.google.com/macros/d/YOUR_SHEET_ID/usercallback
  // Untuk setup: buat Google Apps Script yang handle POST request
  if (GOOGLE_SHEET_WEBHOOK && !GOOGLE_SHEET_WEBHOOK.includes('YOUR_SHEET_ID')) {
      const payload = {
      timestamp: new Date().toLocaleString('id-ID'),
      nama: ucapan.nama,
      pesan: ucapan.pesan,
      kehadiran: ucapan.kehadiran,
      jumlahOrang: ucapan.jumlahOrang
    };
    
    fetch(GOOGLE_SHEET_WEBHOOK, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(payload)
    }).catch(e => console.log('Sheet update:', e));
  }
}

// ================================
// SHARE TO WHATSAPP
// ================================
function shareToWhatsApp() {
  // Add Assalamualaikum + guest name in WhatsApp share message

  const nama = CONFIG.namaPengantin.wanita + ' & ' + CONFIG.namaPengantin.pria;
  const tanggal = CONFIG.tanggalPernikahan.toLocaleDateString('en-GB', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const message = `Assalamu'alaikum Warahmatullahi Wabarakatuh \n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada acara pernikahan kami: \n\n${nama}\n${tanggal} \n\nUntuk informasi lengkap mengenai waktu, lokasi, dan rangkaian acara, silakan mengunjungi undangan digital kami melalui tautan berikut: \n\n${window.location.href} \n\nKehadiran dan doa restu dari Bapak/Ibu/Saudara/i akan menjadi hadiah terindah bagi kami. Terima kasih atas doa dan dukungannya. 🙏🏻💐 \nMohon maaf karena undangan ini kami sampaikan melalui pesan digital. \nAtas perhatian dan kehadirannya, kami ucapkan terima kasih. \n\nWassalamu'alaikum Warahmatullahi Wabarakatuh`;
  const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, '_blank');
}

// ================================
// GIFT POPUP
// ================================
function openGiftModal() {
  const modal = document.getElementById('gift-modal');
  const content = document.getElementById('gift-modal-content');
  const html = `
    <h3>Info Hadiah</h3>
    <p class="gift-desc">Berikut detail rekening dan alamat hadiah.</p>

    <div class="gift-details-block">
      <div class="gift-section">
        <h4>Bank BCA</h4>
        <p class="rekening">1234567890</p>
        <p class="atas-nama">a.n. Rahmanisya</p>
        <button type="button" class="btn-copy" onclick="copyRekening('1234567890')">📋 Copy Number</button>
      </div>
      <div class="gift-section">
        <h4>Bank Mandiri</h4>
        <p class="rekening">0987654321</p>
        <p class="atas-nama">a.n. Dicky Abdul Rachman</p>
        <button type="button" class="btn-copy" onclick="copyRekening('0987654321')">📋 Copy Number</button>
      </div>
      <div class="gift-section">
        <h4>Physical Gift Address</h4>
        <p>Jl. Mangga Dua Gg. Babakan Ciamis I No. 30B RT 01 RW 01 Desa Sukapura</p>
        <p>Kec. Dayeuhkolot, Kabupaten Bandung</p>
        <p>Phone: 0813-1332-0994 (Dicky)</p>
      </div>
    </div>
  `;

  if (modal && content) {
    content.innerHTML = html;
    modal.classList.remove('hidden');
  }
}

function closeGiftModal() {
  const modal = document.getElementById('gift-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
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
