// ========================================
// KONEKSI SUPABASE
// ========================================

const SUPABASE_URL =
  "https://cakrhepxmgzfepeizeqs.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_yfwobeRSxWKwrJSmxy4CWA_v9cbhwOe";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


// ========================================
// PENGATURAN AKUN
// ========================================

// Email akun PETUGAS
const EMAIL_PETUGAS =
  "tbtmr5757@gmail.com";


// Menyimpan status pengguna yang sedang login
let penggunaSekarang = null;

let rolePengguna = "";


// ========================================
// TENTUKAN ROLE
// ========================================

function tentukanRole(email) {

  if (
    email &&
    email.toLowerCase() ===
    EMAIL_PETUGAS.toLowerCase()
  ) {

    return "petugas";

  }

  // Selain email petugas dianggap ADMIN
  return "admin";
}


// ========================================
// LOGIN
// ========================================

async function login() {

  const email =
    document
      .getElementById("email")
      .value
      .trim();

  const password =
    document
      .getElementById("password")
      .value;

  const pesan =
    document.getElementById("pesan");

  pesan.textContent = "";


  if (!email || !password) {

    pesan.textContent =
      "Email dan password harus diisi.";

    return;
  }


  try {

    const hasil =
      await supabaseClient.auth.signInWithPassword({

        email: email,

        password: password

      });


    if (hasil.error) {

      console.error(
        hasil.error
      );

      pesan.textContent =
        "Email atau password salah.";

      return;
    }


    penggunaSekarang =
      hasil.data.user;

    rolePengguna =
      tentukanRole(
        penggunaSekarang.email
      );


    console.log(
      "Login sebagai:",
      rolePengguna
    );


    document
      .getElementById("loginPage")
      .classList.add("hidden");


    document
      .getElementById("appPage")
      .classList.remove("hidden");


    tampilkanDokumen();


  } catch (error) {

    console.error(error);

    pesan.textContent =
      "Terjadi kesalahan saat login.";

  }
}


// ========================================
// LOGOUT
// ========================================

async function logout() {

  await supabaseClient.auth.signOut();


  penggunaSekarang = null;

  rolePengguna = "";


  document
    .getElementById("appPage")
    .classList.add("hidden");


  document
    .getElementById("loginPage")
    .classList.remove("hidden");


  document
    .getElementById("email")
    .value = "";


  document
    .getElementById("password")
    .value = "";

}


// ========================================
// CEK LOGIN
// ========================================

async function cekLogin() {

  try {

    const hasil =
      await supabaseClient.auth.getSession();


    if (
      hasil.data &&
      hasil.data.session
    ) {

      penggunaSekarang =
        hasil.data.session.user;


      rolePengguna =
        tentukanRole(
          penggunaSekarang.email
        );


      console.log(
        "Session aktif sebagai:",
        rolePengguna
      );


      document
        .getElementById("loginPage")
        .classList.add("hidden");


      document
        .getElementById("appPage")
        .classList.remove("hidden");


      tampilkanDokumen();

    }


  } catch (error) {

    console.error(
      "Gagal mengecek login:",
      error
    );

  }
}


// ========================================
// TENTUKAN FOLDER
// ========================================

function tentukanFolder(file) {

  const nama =
    file.name.toLowerCase();


  if (
    nama.endsWith(".doc") ||
    nama.endsWith(".docx")
  ) {

    return "Word";

  }


  if (
    nama.endsWith(".xls") ||
    nama.endsWith(".xlsx")
  ) {

    return "Excel";

  }


  if (
    nama.endsWith(".pdf")
  ) {

    return "PDF";

  }


  if (
    nama.endsWith(".jpg") ||
    nama.endsWith(".jpeg") ||
    nama.endsWith(".png")
  ) {

    return "Foto Dokumentasi";

  }


  return null;
}


// ========================================
// UPLOAD DOKUMEN
// ========================================

async function uploadDokumen() {

  const namaDokumen =
    document
      .getElementById("namaDokumen")
      .value
      .trim();


  const fileInput =
    document.getElementById(
      "fileInput"
    );


  const status =
    document.getElementById(
      "uploadStatus"
    );


  const file =
    fileInput.files[0];


  status.textContent = "";


  if (!namaDokumen) {

    status.textContent =
      "Silakan isi nama dokumen.";

    return;
  }


  if (!file) {

    status.textContent =
      "Silakan pilih file.";

    return;
  }


  if (
    file.size >
    50 * 1024 * 1024
  ) {

    status.textContent =
      "Ukuran file maksimal 50 MB.";

    return;
  }


  const folder =
    tentukanFolder(file);


  if (!folder) {

    status.textContent =
      "Jenis file tidak didukung.";

    return;
  }


  status.textContent =
    "Sedang mengupload...";


  try {

    const namaUnik =
      Date.now() +
      "_" +
      file.name;


    const filePath =
      folder +
      "/" +
      namaUnik;


    // UPLOAD KE STORAGE

    const upload =
      await supabaseClient.storage
        .from("Dokumen")
        .upload(
          filePath,
          file
        );


    if (upload.error) {

      console.error(
        upload.error
      );

      status.textContent =
        "Upload gagal: " +
        upload.error.message;

      return;
    }


    // SIMPAN KE DATABASE

    const database =
      await supabaseClient
        .from("documents")
        .insert({

          name:
            namaDokumen,

          folder:
            folder,

          file_name:
            file.name,

          file_path:
            filePath,

          file_type:
            file.type

        });


    if (database.error) {

      console.error(
        database.error
      );

      status.textContent =
        "File sudah terupload, tetapi data gagal disimpan.";

      return;
    }


    status.textContent =
      "✅ Dokumen berhasil diupload.";


    document
      .getElementById(
        "namaDokumen"
      )
      .value = "";


    document
      .getElementById(
        "fileInput"
      )
      .value = "";


    tampilkanDokumen();


  } catch (error) {

    console.error(error);

    status.textContent =
      "Terjadi kesalahan saat upload.";

  }
}


// ========================================
// ICON DOKUMEN
// ========================================

function ambilIcon(folder) {

  if (folder === "Word") {

    return "📄";

  }


  if (folder === "Excel") {

    return "📊";

  }


  if (folder === "PDF") {

    return "📕";

  }


  if (
    folder ===
    "Foto Dokumentasi"
  ) {

    return "📷";

  }


  return "📄";
}


// ========================================
// TAMPILKAN DOKUMEN
// ========================================

async function tampilkanDokumen() {

  const daftar =
    document.getElementById(
      "documentList"
    );


  daftar.innerHTML =
    "<p>Memuat dokumen...</p>";


  try {

    const hasil =
      await supabaseClient
        .from("documents")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (hasil.error) {

      console.error(
        hasil.error
      );

      daftar.innerHTML =
        "<p>Gagal mengambil dokumen.</p>";

      return;
    }


    if (
      !hasil.data ||
      hasil.data.length === 0
    ) {

      daftar.innerHTML =
        "<p>Belum ada dokumen.</p>";

      return;
    }


    tampilkanDaftar(
      hasil.data
    );


  } catch (error) {

    console.error(error);

    daftar.innerHTML =
      "<p>Terjadi kesalahan mengambil dokumen.</p>";

  }
}


// ========================================
// TAMPILKAN DAFTAR
// ========================================

function tampilkanDaftar(data) {

  const daftar =
    document.getElementById(
      "documentList"
    );


  daftar.innerHTML = "";


  data.forEach(
    function(doc) {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "document-item";


      // ==================================
      // INFORMASI DOKUMEN
      // ==================================

      const info =
        document.createElement(
          "div"
        );


      const nama =
        document.createElement(
          "strong"
        );


      nama.textContent =
        ambilIcon(
          doc.folder
        ) +
        " " +
        doc.name;


      const file =
        document.createElement(
          "small"
        );


      file.textContent =
        doc.folder +
        " • " +
        doc.file_name;


      info.appendChild(
        nama
      );


      info.appendChild(
        file
      );


      // ==================================
      // TOMBOL BUKA
      // ==================================

      const tombolBuka =
        document.createElement(
          "button"
        );


      tombolBuka.textContent =
        "👁️ Buka";


      tombolBuka.onclick =
        function() {

          bukaDokumen(
            doc.file_path
          );

        };


      // ==================================
      // TOMBOL DOWNLOAD
      // ==================================

      const tombolDownload =
        document.createElement(
          "button"
        );


      tombolDownload.textContent =
        "⬇️ Download";


      tombolDownload.onclick =
        function() {

          downloadDokumen(
            doc.file_path
          );

        };


      // ==================================
      // MASUKKAN KE ITEM
      // ==================================

      item.appendChild(
        info
      );


      item.appendChild(
        tombolBuka
      );


      item.appendChild(
        tombolDownload
      );


      // ==================================
      // TOMBOL HAPUS
      // KHUSUS ADMIN
      // ==================================

      if (
        rolePengguna ===
        "admin"
      ) {

        const tombolHapus =
          document.createElement(
            "button"
          );


        tombolHapus.textContent =
          "🗑️ Hapus";


        tombolHapus.onclick =
          function() {

            hapusDokumen(
              doc.file_path,
              doc.id
            );

          };


        item.appendChild(
          tombolHapus
        );

      }


      daftar.appendChild(
        item
      );

    }
  );
}


// ========================================
// BUKA DOKUMEN
// ========================================

async function bukaDokumen(
  filePath
) {

  try {

    const hasil =
      await supabaseClient.storage
        .from("Dokumen")
        .createSignedUrl(
          filePath,
          3600
        );


    if (hasil.error) {

      console.error(
        hasil.error
      );

      alert(
        "Dokumen tidak dapat dibuka."
      );

      return;
    }


    window.open(
      hasil.data.signedUrl,
      "_blank"
    );


  } catch (error) {

    console.error(error);

    alert(
      "Dokumen tidak dapat dibuka."
    );

  }
}


// ========================================
// DOWNLOAD DOKUMEN
// ========================================

async function downloadDokumen(
  filePath
) {

  try {

    const hasil =
      await supabaseClient.storage
        .from("Dokumen")
        .download(
          filePath
        );


    if (hasil.error) {

      console.error(
        hasil.error
      );

      alert(
        "Dokumen tidak dapat didownload."
      );

      return;
    }


    const url =
      URL.createObjectURL(
        hasil.data
      );


    const a =
      document.createElement(
        "a"
      );


    a.href =
      url;


    a.download =
      filePath
        .split("/")
        .pop();


    document.body.appendChild(
      a
    );


    a.click();


    a.remove();


    setTimeout(
      function() {

        URL.revokeObjectURL(
          url
        );

      },
      1000
    );


  } catch (error) {

    console.error(error);

    alert(
      "Dokumen tidak dapat didownload."
    );

  }
}


// ========================================
// PENCARIAN CEPAT
// ========================================

async function cariDokumen() {

  const kata =
    document
      .getElementById(
        "searchInput"
      )
      .value
      .trim();


  if (!kata) {

    tampilkanDokumen();

    return;
  }


  const hasil =
    await supabaseClient
      .from("documents")
      .select("*")
      .ilike(
        "name",
        "%" +
        kata +
        "%"
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (hasil.error) {

    console.error(
      hasil.error
    );

    return;
  }


  const daftar =
    document.getElementById(
      "documentList"
    );


  if (
    !hasil.data ||
    hasil.data.length === 0
  ) {

    daftar.innerHTML =
      "<p>Dokumen tidak ditemukan.</p>";

    return;
  }


  tampilkanDaftar(
    hasil.data
  );
}


// ========================================
// FILTER KATEGORI
// ========================================

async function tampilkanKategori(
  kategori
) {

  const hasil =
    await supabaseClient
      .from("documents")
      .select("*")
      .eq(
        "folder",
        kategori
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (hasil.error) {

    console.error(
      hasil.error
    );

    return;
  }


  const daftar =
    document.getElementById(
      "documentList"
    );


  if (
    !hasil.data ||
    hasil.data.length === 0
  ) {

    daftar.innerHTML =
      "<p>Belum ada dokumen di kategori ini.</p>";

    return;
  }


  tampilkanDaftar(
    hasil.data
  );
}


// ========================================
// HAPUS DOKUMEN
// KHUSUS ADMIN
// ========================================

async function hapusDokumen(
  filePath,
  id
) {

  // CEK ROLE

  if (
    rolePengguna !==
    "admin"
  ) {

    alert(
      "❌ Anda tidak memiliki izin untuk menghapus dokumen."
    );

    return;
  }


  const yakin =
    confirm(
      "Yakin ingin menghapus dokumen ini?"
    );


  if (!yakin) {

    return;
  }


  try {

    // HAPUS FILE STORAGE

    const storage =
      await supabaseClient.storage
        .from("Dokumen")
        .remove([
          filePath
        ]);


    if (storage.error) {

      console.error(
        storage.error
      );

      alert(
        "File gagal dihapus."
      );

      return;
    }


    // HAPUS DATA DATABASE

    const database =
      await supabaseClient
        .from("documents")
        .delete()
        .eq(
          "id",
          id
        );


    if (database.error) {

      console.error(
        database.error
      );

      alert(
        "File sudah dihapus dari Storage, tetapi data gagal dihapus."
      );

      return;
    }


    alert(
      "✅ Dokumen berhasil dihapus."
    );


    tampilkanDokumen();


  } catch (error) {

    console.error(error);

    alert(
      "Terjadi kesalahan saat menghapus dokumen."
    );

  }
}


// ========================================
// BACKUP ARSIP
// ========================================

async function backupArsip() {

  // CEK JSZIP

  if (
    typeof JSZip ===
    "undefined"
  ) {

    alert(
      "Library ZIP belum tersedia.\n\n" +
      "Periksa JSZip di index.html."
    );

    return;
  }


  // PILIH TAHUN

  const tahun =
    prompt(
      "Masukkan tahun arsip yang ingin dibackup:\n\n" +
      "Contoh: 2025"
    );


  if (tahun === null) {

    return;
  }


  const tahunBersih =
    tahun.trim();


  // CEK TAHUN

  if (
    !/^\d{4}$/.test(
      tahunBersih
    )
  ) {

    alert(
      "Tahun harus 4 angka.\n\n" +
      "Contoh: 2025"
    );

    return;
  }


  // PILIH JENIS BACKUP

  const pilihan =
    prompt(
      "JENIS BACKUP:\n\n" +

      "1 = Semua Arsip\n" +
      "2 = Foto Saja\n" +
      "3 = PDF Saja\n" +
      "4 = Word Saja\n" +
      "5 = Excel Saja\n\n" +

      "Masukkan angka 1 - 5:"
    );


  if (
    pilihan === null
  ) {

    return;
  }


  // TENTUKAN KATEGORI

  let folderBackup =
    null;

  let namaBackup =
    "Arsip";

  let jenisBackup =
    "Semua Arsip";


  if (
    pilihan === "2"
  ) {

    folderBackup =
      "Foto Dokumentasi";

    namaBackup =
      "Foto";

    jenisBackup =
      "Foto Saja";

  }


  else if (
    pilihan === "3"
  ) {

    folderBackup =
      "PDF";

    namaBackup =
      "PDF";

    jenisBackup =
      "PDF Saja";

  }


  else if (
    pilihan === "4"
  ) {

    folderBackup =
      "Word";

    namaBackup =
      "Word";

    jenisBackup =
      "Word Saja";

  }


  else if (
    pilihan === "5"
  ) {

    folderBackup =
      "Excel";

    namaBackup =
      "Excel";

    jenisBackup =
      "Excel Saja";

  }


  else if (
    pilihan !== "1"
  ) {

    alert(
      "Pilihan tidak valid."
    );

    return;
  }


  // AMBIL DATA DATABASE

  let query =
    supabaseClient
      .from("documents")
      .select("*")
      .ilike(
        "name",
        tahunBersih +
        "_%"
      );


  // FILTER JENIS

  if (
    folderBackup !==
    null
  ) {

    query =
      query.eq(
        "folder",
        folderBackup
      );

  }


  const hasil =
    await query.order(
      "created_at",
      {
        ascending: true
      }
    );


  // CEK ERROR

  if (
    hasil.error
  ) {

    console.error(
      hasil.error
    );

    alert(
      "Gagal mengambil data arsip."
    );

    return;
  }


  // CEK DATA KOSONG

  if (
    !hasil.data ||
    hasil.data.length === 0
  ) {

    alert(
      "Tidak ditemukan " +
      jenisBackup.toLowerCase() +
      " tahun " +
      tahunBersih +
      ".\n\n" +

      "Pastikan nama dokumen diawali:\n" +
      tahunBersih +
      "_"
    );

    return;
  }


  // KONFIRMASI

  const lanjut =
    confirm(

      "Ditemukan " +
      hasil.data.length +
      " file.\n\n" +

      "Tahun: " +
      tahunBersih +
      "\n" +

      "Jenis: " +
      jenisBackup +
      "\n\n" +

      "Apakah ingin membuat file ZIP?"

    );


  if (!lanjut) {

    return;
  }


  // BUAT ZIP

  const zip =
    new JSZip();


  let berhasil =
    0;


  // MASUKKAN FILE

  for (
    let i = 0;
    i < hasil.data.length;
    i++
  ) {

    const doc =
      hasil.data[i];


    try {

      const fileHasil =
        await supabaseClient.storage
          .from("Dokumen")
          .download(
            doc.file_path
          );


      if (
        fileHasil.error
      ) {

        console.error(
          fileHasil.error
        );

        continue;
      }


      zip.file(
        doc.file_name,
        fileHasil.data
      );


      berhasil++;


    } catch (error) {

      console.error(
        error
      );

    }
  }


  // TIDAK ADA FILE

  if (
    berhasil === 0
  ) {

    alert(
      "Tidak ada file yang berhasil dimasukkan ke ZIP."
    );

    return;
  }


  // BUAT FILE ZIP

  try {

    const zipBlob =
      await zip.generateAsync({

        type:
          "blob"

      });


    const url =
      URL.createObjectURL(
        zipBlob
      );


    const a =
      document.createElement(
        "a"
      );


    a.href =
      url;


    a.download =
      "Backup_" +
      namaBackup +
      "_" +
      tahunBersih +
      ".zip";


    document.body.appendChild(
      a
    );


    a.click();


    a.remove();


    setTimeout(
      function() {

        URL.revokeObjectURL(
          url
        );

      },
      1000
    );


    alert(

      "✅ Backup berhasil!\n\n" +

      "Tahun: " +
      tahunBersih +
      "\n" +

      "Jenis: " +
      jenisBackup +
      "\n" +

      "Jumlah file: " +
      berhasil

    );


  } catch (error) {

    console.error(
      error
    );

    alert(
      "Gagal membuat file ZIP."
    );

  }
}


// ========================================
// MULAI APLIKASI
// ========================================

cekLogin();