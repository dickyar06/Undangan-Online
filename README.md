# Undangan-Online
Undangan Nikah Online 

Cara pakai undangan online untuk kirim berdasarkan nama di Excel (folder ../Undangan-Online/DR/):

Siapkan Excel

Buka: ../Undangan-Online/DR/data/tamu.xlsx
Pastikan ada kolom nama dengan salah satu header ini:
Nama, nama, NAMA, Nama Tamu, atau nama tamu
Generate link massal dari Excel

Buka: ../Undangan-Online/DR/index.html di browser
Buka Console (F12) lalu jalankan:

generateAllLinks()
Pilih file tamu.xlsx
Setelah selesai akan muncul output link di Console dan dibuat file:
daftar-link-undangan.csv
Kirim undangan per nama

Buka daftar-link-undangan.csv
Untuk setiap baris:
Kirim Link Undangan ke tamu sesuai Nama
Yang terjadi saat tamu membuka link

Halaman membaca parameter URL ?to=...
Lalu menampilkan nama di elemen id="nama-tamu"