// ========================================
// GOOGLE DRIVE API
// ========================================

const GOOGLE_DRIVE_API =
  "https://script.google.com/macros/s/AKfycbz8f5hAhgZePLPuwvW6Aybca4huCUgrK1eVhPlgqZ0FpSI6VirR7O3LWCgaD_Gi3Cowgw/exec";


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

const EMAIL_PETUGAS =
  "tbtmr5757@gmail.com";

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
      await supabaseClient.auth
        .signInWithPassword({

          email:
            email,

          password:
            password

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

    console.error(
      error
    );

    pesan.textContent =
      "Terjadi kesalahan saat login.";

  }

}


// ========================================
// LOGOUT
// ========================================

async function logout() {

  try {

    await supabaseClient.auth.signOut();

  } catch (error) {

    console.error(
      error
    );

  }


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
      await supabaseClient.auth
        .getSession();


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
// FILE KE BASE64
// ========================================

function fileKeBase64(file) {

  return new Promise(
    function(resolve, reject) {

      const reader =
        new FileReader();


      reader.onload =
        function() {

          try {

            const hasil =
              reader.result;


            const posisi =
              hasil.indexOf(",");


            if (
              posisi === -1
            ) {

              reject(
                new Error(
                  "Format file tidak valid."
                )
              );

              return;

            }


            const base64 =
              hasil.substring(
                posisi + 1
              );


            resolve(
              base64
            );

          } catch (error) {

            reject(
              error
            );

          }

        };


      reader.onerror =
        function() {

          reject(
            new Error(
              "Gagal membaca file."
            )
          );

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


// ========================================
// KIRIM DATA KE GOOGLE APPS SCRIPT
// ========================================

async function kirimKeGoogleDrive(data) {

  console.log(
    "📤 Mengirim data ke Google Apps Script..."
  );


  const response =
    await fetch(
      GOOGLE_DRIVE_API,
      {

        method:
          "POST",

        redirect:
          "follow",

        headers: {

          "Content-Type":
            "text/plain;charset=utf-8"

        },

        body:
          JSON.stringify(
            data
          )

      }
    );


  console.log(
    "Status response:",
    response.status
  );


  const text =
    await response.text();


  console.log(
    "Response Apps Script:",
    text
  );


  let hasil;


  try {

    hasil =
      JSON.parse(
        text
      );

  } catch (error) {

    console.error(
      "Response bukan JSON:",
      text
    );

    throw new Error(
      "Respons Google Apps Script tidak dapat dibaca."
    );

  }


  return hasil;

}


// ========================================
// UPLOAD KE GOOGLE DRIVE
// ========================================

async function uploadKeGoogleDrive(
  file,
  folder
) {

  console.log(
    "📤 Mulai upload ke Google Drive..."
  );


  console.log(
    "Nama:",
    file.name
  );


  console.log(
    "Folder:",
    folder
  );


  const base64 =
    await fileKeBase64(
      file
    );


  const data = {

    action:
      "upload",

    folder:
      folder,

    fileName:
      file.name,

    fileType:
      file.type ||
      "application/octet-stream",

    file:
      base64

  };


  const hasil =
    await kirimKeGoogleDrive(
      data
    );


  if (
    !hasil ||
    !hasil.success
  ) {

    throw new Error(
      hasil && hasil.error
        ? hasil.error
        : "Upload Google Drive gagal."
    );

  }


  if (
    !hasil.fileId
  ) {

    throw new Error(
      "Google Drive tidak mengembalikan ID file."
    );

  }


  console.log(
    "✅ File ID Google Drive:",
    hasil.fileId
  );


  return {

    success:
      true,

    fileId:
      hasil.fileId,

    fileName:
      hasil.fileName,

    folder:
      hasil.folder,

    url:
      hasil.url

  };

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
    5 * 1024 * 1024
  ) {

    status.textContent =
      "Ukuran file maksimal 5 MB untuk pengujian.";

    return;

  }


  const folder =
    tentukanFolder(
      file
    );


  if (!folder) {

    status.textContent =
      "Jenis file tidak didukung.";

    return;

  }


  status.textContent =
    "⏳ Mengupload ke Google Drive...";


  try {

    const drive =
      await uploadKeGoogleDrive(
        file,
        folder
      );


    console.log(
      "Hasil Google Drive:",
      drive
    );


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
            "gdrive:" +
            drive.fileId,

          file_type:
            file.type

        })
        .select()
        .single();


    if (
      database.error
    ) {

      console.error(
        database.error
      );


      status.textContent =
        "⚠️ File masuk Google Drive, tetapi data gagal disimpan ke database.";

      return;

    }


    console.log(
      "✅ Data Supabase:",
      database.data
    );


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

    console.error(
      "UPLOAD ERROR:",
      error
    );


    status.textContent =
      "❌ Upload gagal: " +
      error.message;

  }

}


// ========================================
// ICON DOKUMEN
// ========================================

function ambilIcon(folder) {

  if (
    folder === "Word"
  ) {

    return "📄";

  }


  if (
    folder === "Excel"
  ) {

    return "📊";

  }


  if (
    folder === "PDF"
  ) {

    return "📕";

  }


  if (
    folder === "Foto Dokumentasi"
  ) {

    return "📷";

  }


  return "📄";

}


// ========================================
// CEK GOOGLE DRIVE
// ========================================

function apakahGoogleDrive(
  filePath
) {

  return (
    typeof filePath === "string" &&
    filePath.startsWith(
      "gdrive:"
    )
  );

}


// ========================================
// AMBIL ID GOOGLE DRIVE
// ========================================

function ambilGoogleDriveId(
  filePath
) {

  if (
    !apakahGoogleDrive(
      filePath
    )
  ) {

    return null;

  }


  return filePath.substring(
    "gdrive:".length
  );

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
            ascending:
              false
          }
        );


    if (
      hasil.error
    ) {

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

    console.error(
      error
    );


    daftar.innerHTML =
      "<p>Terjadi kesalahan mengambil dokumen.</p>";

  }

}


// ========================================
// TAMPILKAN DAFTAR
// ========================================

function tampilkanDaftar(
  data
) {

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


      item.appendChild(
        info
      );


      item.appendChild(
        tombolBuka
      );


      item.appendChild(
        tombolDownload
      );


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

  if (
    apakahGoogleDrive(
      filePath
    )
  ) {

    const fileId =
      ambilGoogleDriveId(
        filePath
      );


    if (
      !fileId ||
      fileId === "pending"
    ) {

      alert(
        "File Google Drive lama belum memiliki ID yang tersimpan."
      );

      return;

    }


    const url =
      "https://drive.google.com/file/d/" +
      encodeURIComponent(fileId) +
      "/view";


    window.open(
      url,
      "_blank"
    );


    return;

  }


  try {

    const hasil =
      await supabaseClient.storage
        .from("Dokumen")
        .createSignedUrl(
          filePath,
          3600
        );


    if (
      hasil.error
    ) {

      throw hasil.error;

    }


    window.open(
      hasil.data.signedUrl,
      "_blank"
    );


  } catch (error) {

    console.error(
      error
    );


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

  if (
    apakahGoogleDrive(
      filePath
    )
  ) {

    const fileId =
      ambilGoogleDriveId(
        filePath
      );


    if (
      !fileId ||
      fileId === "pending"
    ) {

      alert(
        "File Google Drive lama belum memiliki ID yang tersimpan."
      );

      return;

    }


    const url =
      "https://drive.google.com/uc?export=download&id=" +
      encodeURIComponent(fileId);


    window.open(
      url,
      "_blank"
    );


    return;

  }


  try {

    const hasil =
      await supabaseClient.storage
        .from("Dokumen")
        .download(
          filePath
        );


    if (
      hasil.error
    ) {

      throw hasil.error;

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

    console.error(
      error
    );


    alert(
      "Dokumen tidak dapat didownload."
    );

  }

}


// ========================================
// HAPUS DOKUMEN
// ========================================

async function hapusDokumen(
  filePath,
  id
) {

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
      "Yakin ingin menghapus dokumen ini?\n\nFile akan dipindahkan ke Sampah Google Drive dan data Supabase akan dihapus."
    );


  if (!yakin) {

    return;

  }


  if (
    apakahGoogleDrive(
      filePath
    )
  ) {

    const fileId =
      ambilGoogleDriveId(
        filePath
      );


    if (
      !fileId ||
      fileId === "pending"
    ) {

      alert(
        "File Google Drive lama belum memiliki ID yang tersimpan."
      );

      return;

    }


    try {

      const hasil =
        await kirimKeGoogleDrive({

          action:
            "delete",

          fileId:
            fileId

        });


      if (
        !hasil ||
        !hasil.success
      ) {

        throw new Error(
          hasil && hasil.error
            ? hasil.error
            : "File Google Drive gagal dihapus."
        );

      }


      const database =
        await supabaseClient
          .from("documents")
          .delete()
          .eq(
            "id",
            id
          );


      if (
        database.error
      ) {

        console.error(
          database.error
        );


        alert(
          "⚠️ File Google Drive sudah dihapus, tetapi data Supabase gagal dihapus."
        );

        tampilkanDokumen();

        return;

      }


      alert(
        "✅ Dokumen berhasil dihapus."
      );


      tampilkanDokumen();


      return;


    } catch (error) {

      console.error(
        "DELETE ERROR:",
        error
      );


      alert(
        "❌ Dokumen gagal dihapus: " +
        error.message
      );


      return;

    }

  }


  try {

    const storage =
      await supabaseClient.storage
        .from("Dokumen")
        .remove([
          filePath
        ]);


    if (
      storage.error
    ) {

      console.error(
        storage.error
      );


      alert(
        "File gagal dihapus."
      );

      return;

    }


    const database =
      await supabaseClient
        .from("documents")
        .delete()
        .eq(
          "id",
          id
        );


    if (
      database.error
    ) {

      console.error(
        database.error
      );


      alert(
        "Data database gagal dihapus."
      );

      return;

    }


    alert(
      "✅ Dokumen berhasil dihapus."
    );


    tampilkanDokumen();


  } catch (error) {

    console.error(
      error
    );


    alert(
      "Terjadi kesalahan saat menghapus dokumen."
    );

  }

}


// ========================================
// PENCARIAN
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
          ascending:
            false
        }
      );


  if (
    hasil.error
  ) {

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
          ascending:
            false
        }
      );


  if (
    hasil.error
  ) {

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
// BACKUP ARSIP
// ========================================

async function backupArsip() {

  const tahun =
    prompt(
      "Masukkan tahun arsip yang ingin dibackup:\n\nContoh: 2025"
    );


  if (
    tahun === null
  ) {

    return;

  }


  const tahunBersih =
    tahun.trim();


  if (
    !/^\d{4}$/.test(
      tahunBersih
    )
  ) {

    alert(
      "Tahun harus 4 angka."
    );

    return;

  }


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


  let kategori;


  if (
    pilihan === "1"
  ) {

    kategori =
      "Semua Arsip";

  }

  else if (
    pilihan === "2"
  ) {

    kategori =
      "Foto Saja";

  }

  else if (
    pilihan === "3"
  ) {

    kategori =
      "PDF Saja";

  }

  else if (
    pilihan === "4"
  ) {

    kategori =
      "Word Saja";

  }

  else if (
    pilihan === "5"
  ) {

    kategori =
      "Excel Saja";

  }

  else {

    alert(
      "Pilihan tidak valid."
    );

    return;

  }


  const yakin =
    confirm(

      "Backup akan dibuat dengan pilihan:\n\n" +

      "Tahun: " +
      tahunBersih +
      "\n" +

      "Jenis: " +
      kategori +
      "\n\n" +

      "Lanjut membuat backup ZIP?"

    );


  if (
    !yakin
  ) {

    return;

  }


  alert(
    "⏳ Backup sedang dibuat.\n\n" +
    "Mohon tunggu..."
  );


  try {

    console.log(
      "📦 Memulai backup..."
    );


    const hasil =
      await kirimKeGoogleDrive({

        action:
          "backup",

        tahun:
          tahunBersih,

        kategori:
          kategori

      });


    console.log(
      "Hasil backup:",
      hasil
    );


    if (
      !hasil ||
      !hasil.success
    ) {

      throw new Error(

        hasil && hasil.error
          ? hasil.error
          : "Backup gagal dibuat."

      );

    }


    if (
      !hasil.url
    ) {

      throw new Error(
        "URL download backup tidak tersedia."
      );

    }


    const lanjutDownload =
      confirm(

        "✅ Backup berhasil dibuat!\n\n" +

        "Nama file: " +
        hasil.fileName +
        "\n" +

        "Jumlah file: " +
        hasil.jumlahFile +
        "\n\n" +

        "Download ZIP sekarang?"

      );


    if (
      lanjutDownload
    ) {

      window.open(
        hasil.url,
        "_blank"
      );

    }


  }

  catch (error) {

    console.error(
      "BACKUP ERROR:",
      error
    );


    alert(

      "❌ Backup gagal.\n\n" +

      error.message

    );

  }

}


// ========================================
// MULAI APLIKASI
// ========================================

cekLogin();
