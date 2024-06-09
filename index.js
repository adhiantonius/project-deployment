// CHART 1 NOT USE DATA JSON
// Event listener untuk memastikan bahwa kode dijalankan setelah DOM sepenuhnya dimuat
let jsonData
document.addEventListener('DOMContentLoaded', () => {
  // Data jumlah properti di setiap borough
  const boroughCounts = {
    'Manhattan': 18102,
    'Bronx': 6994,
    'Brooklyn': 23843,
    'Queens': 26548,
    'Staten Island': 8296
  };

  // Mendapatkan label dan nilai dari data boroughCounts
  const labels = Object.keys(boroughCounts);
  const values = Object.values(boroughCounts);

  // Mengambil konteks dari canvas untuk Pie Chart
  const ctx = document.getElementById('myPieChart').getContext('2d');
  // Membuat Pie Chart menggunakan Chart.js
  const myPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'left', // Posisi legenda di kiri
        },
        tooltip: {
          enabled: true // Mengaktifkan tooltip
        }
      }
    }
  });
});

// CHART 2 DAN 3 LINE CHART
// Fungsi untuk memformat tanggal menjadi bulan-tahun
function getMonthYear(dateStr) {
  const date = new Date(dateStr); // Mengubah string tanggal menjadi objek Date
  const options = { year: 'numeric', month: 'short' }; // Opsi format bulan-tahun
  return date.toLocaleDateString('en-US', options); // Mengembalikan tanggal yang diformat
}

// Membuat Line Chart untuk total unit yang terjual dan harga penjualan
function chart3(data) {
  const unitsSoldByMonth = {};
  const salePriceByMonth = {};

  // Mengonversi tanggal penjualan menjadi format bulan-tahun dan menghitung total penjualan per bulan
  data.forEach(sale => {
    const saleDate = getMonthYear(sale.SALE_DATE);
    if (!unitsSoldByMonth[saleDate]) {
      unitsSoldByMonth[saleDate] = 0; // Inisialisasi jika belum ada data untuk bulan tersebut
      salePriceByMonth[saleDate] = 0;
    }
    unitsSoldByMonth[saleDate] += parseFloat(sale.TOTAL_UNITS); // Menambahkan jumlah unit terjual
    salePriceByMonth[saleDate] += parseFloat(sale.SALE_PRICE); // Menambahkan harga penjualan
  });

  // Memastikan semua bulan dari September 2016 hingga Agustus 2017 ada dalam data
  const months = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(2016, 8 + i); // Mulai dari September 2016
    const monthYear = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    months.push(monthYear);
    if (!unitsSoldByMonth[monthYear]) {
      unitsSoldByMonth[monthYear] = 0; // Inisialisasi jika belum ada data untuk bulan tersebut
      salePriceByMonth[monthYear] = 0;
    }
  }

  // Ekstrak data untuk digunakan dalam chart
  const unitsSold = months.map(month => unitsSoldByMonth[month]);
  const salePrices = months.map(month => salePriceByMonth[month]);

  // Membuat Line Chart untuk total unit yang terjual
  const unitsSoldCtx = document.getElementById('unitsSoldChart').getContext('2d');
  new Chart(unitsSoldCtx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: 'Total Units Sold',
        data: unitsSold,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true // Mengatur sumbu y agar dimulai dari nol
        }
      }
    }
  });

  // Membuat Line Chart untuk total harga penjualan
  const salePriceCtx = document.getElementById('salePriceChart').getContext('2d');
  new Chart(salePriceCtx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: 'Total Sale Price',
        data: salePrices,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true // Mengatur sumbu y agar dimulai dari nol
        }
      }
    }
  });
}

// CHART 4 BAR CHART
// Fungsi untuk memproses data JSON dan menghitung total unit per wilayah
function processData(data) {
  const unitsData = {};

  // Menghitung total unit per wilayah
  data.forEach(entry => {
    const region = entry.NEIGHBORHOOD;
    const units = parseInt(entry.TOTAL_UNITS);
    if (unitsData[region]) {
      unitsData[region] += units;
    } else {
      unitsData[region] = units;
    }
  });

  return unitsData;
}

// Membuat Bar Chart untuk total unit per wilayah
function chart4(data) {
  const salesData = processData(data); // Memproses data untuk bar chart
  const regions = Object.keys(salesData);
  const totalUnits = Object.values(salesData);

  // Membuat array warna untuk bar chart
  const colors = regions.map((_, index) => `hsl(${index * 30 % 360}, 70%, 50%)`);

  // Membuat Bar Chart menggunakan Chart.js
  const ctxBar = document.getElementById('totalSalesChart').getContext('2d');
  new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: regions,
      datasets: [{
        label: 'Total Units',
        data: totalUnits,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: colors,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: {
          ticks: {
            font: {
              size: 8 // Ukuran font untuk label sumbu x
            }
          }
        },
        y: {
          beginAtZero: true, // Mengatur sumbu y agar dimulai dari nol
          ticks: {
            callback: function (value) {
              return value.toLocaleString(); // Format angka pada sumbu y
            }
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return 'Total Units: ' + context.parsed.y.toLocaleString(); // Format tooltip
            }
          }
        }
      }
    }
  });
}

//CHART 5 PIE CHART
// Tambahkan event listener saat dokumen selesai dimuat
document.addEventListener('DOMContentLoaded', function () {
  // Ambil elemen dengan id 'neighborhoodSelector'
  const neighborhoodSelector = document.getElementById('neighborhoodSelector');
  // Tambahkan event listener untuk perubahan pilihan pada 'neighborhoodSelector'
  neighborhoodSelector.addEventListener('change', fetchDataAndDisplay);
  // Tampilkan chart saat halaman pertama kali dimuat
  fetchDataAndDisplay();
});

let myChart; // Variabel untuk menyimpan instance chart

// Fungsi untuk mempopulasi neighborhoodSelector dengan opsi dari data
function populateNeighborhoodSelector(data) {
  // Buat Set untuk menyimpan nilai unik dari NEIGHBORHOOD
  const neighborhoods = new Set(data.map(item => item.NEIGHBORHOOD));
  const neighborhoodSelector = document.getElementById('neighborhoodSelector');

  // Tambahkan opsi "ALL NEIGHBORHOOD"
  const allOption = document.createElement('option');
  allOption.value = 'ALL NEIGHBORHOOD';
  allOption.textContent = 'ALL NEIGHBORHOOD';
  neighborhoodSelector.appendChild(allOption);

  // Tambahkan opsi untuk setiap nilai NEIGHBORHOOD yang unik
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.value = neighborhood;
    option.textContent = neighborhood;
    neighborhoodSelector.appendChild(option);
  });
}

// Fungsi untuk mengambil data dan menampilkan chart sesuai pilihan wilayah
function fetchDataAndDisplay() {
  // Ambil nilai wilayah yang dipilih dari dropdown
  const selectedNeighborhood = document.getElementById('neighborhoodSelector').value;

  let filteredData; // Variabel untuk menyimpan data yang telah difilter

  // Periksa apakah wilayah yang dipilih adalah 'ALL NEIGHBORHOOD'
  if (selectedNeighborhood === 'ALL NEIGHBORHOOD') {
    filteredData = jsonData; // Ambil semua data tanpa filter jika dipilih "ALL NEIGHBORHOOD"
  } else {
    // Filter data sesuai wilayah yang dipilih
    filteredData = jsonData.filter(item => item.NEIGHBORHOOD === selectedNeighborhood);
  }

  // Hitung total unit per kategori kelas bangunan
  const buildingClassCategories = {};
  filteredData.forEach(item => {
    const buildingClassCategory = item.BUILDING_CLASS_CATEGORY;
    // Tambahkan jumlah unit ke kategori yang sesuai
    if (buildingClassCategories[buildingClassCategory]) {
      buildingClassCategories[buildingClassCategory] += parseInt(item.TOTAL_UNITS);
    } else {
      buildingClassCategories[buildingClassCategory] = parseInt(item.TOTAL_UNITS);
    }
  });

  // Ekstrak label dan nilai untuk chart
  const labels = Object.keys(buildingClassCategories);
  const dataValues = Object.values(buildingClassCategories);

  // Hapus chart sebelumnya jika ada
  if (myChart) {
    myChart.destroy();
  }

  // Tampilkan chart baru menggunakan data yang diperoleh
  displayPieChart(labels, dataValues);
}

// Fungsi untuk menampilkan diagram lingkaran dengan label dan nilai yang diberikan
function displayPieChart(labels, dataValues) {
  const ctx = document.getElementById('buildingChart').getContext('2d');
  // Buat instance chart baru
  myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: dataValues,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        legend: {
          display: false // Sembunyikan legenda
        },
        tooltip: {
          enabled: true // Aktifkan tooltip
        }
      }
    }
  });
}

// Menampilkan data pada console untuk memastikan data telah diambil dengan benar
fetch('Data_Team_11.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    jsonData = data;
    chart3(data)
    chart4(data)
    populateNeighborhoodSelector(data)
    fetchDataAndDisplay()
    var array = [];
    var array_length = 0;
    var table_size = 100;
    var start_index = 1;
    var end_index = 0;
    var current_index = 1;
    var max_index = 0;

    //Fungsi untuk me-reload halaman atau komponen tertentu dalam halaman.
    function reload() {
      location.reload();
    }

    // Tambahan
    //Fungsi untuk melakukan perhitungan atau pemrosesan sebelum konten halaman dimuat.
    function preLoadCalculation() {
      array = data;
      array_length = array.length;
      max_index = array_length / table_size;

      if (array_length % table_size > 0) {
        max_index++;
      }
    }

    //Fungsi untuk melakukan pengurutan data (Sorting)
    function sorting() {
      const sortKey = document.getElementById("sort-key").value;
      switch (sortKey) {
        case "borough":
          data.sort((a, b) => a.BOROUGH - b.BOROUGH);

          break;
        case "sale price":
          data.sort((a, b) => a.SALE_PRICE - b.SALE_PRICE);

          break;
        case "sale date":
          data.sort((a, b) => new Date(a.SALE_DATE) - new Date(b.SALE_DATE));
          break;
        default:
          alert("Anda Harus Memilih Kategori")
          location.reload();
          break;
      }
      displayTable();
    }
    let filteredData = []; // Deklarasi global untuk data yang sudah difilter
    let currentPage = 1; // Deklarasi global untuk halaman saat ini
    const pageSize = 100; // Jumlah item per halaman, sesuaikan dengan kebutuhan Anda

    //Fungsi untuk melakukan penyaringan atau filtrasi data.
    function filter() {
      const filterKey = document.getElementById("filter-key").value;
      const filterValue = document.getElementById("filter-value").value;
      const filterMonth = filterValue.padStart(2, "0");

      switch (filterKey) {
        case "borough":
          filteredData = data.filter(
            (item) =>
              item.BOROUGH.toString().toLowerCase() ===
              filterValue.toLowerCase()
          );
          break;
        case "building class category":
          filteredData = data.filter((item) =>
            item.BUILDING_CLASS_CATEGORY.toLowerCase().includes(
              filterValue.toLowerCase()
            )
          );
          break;
        case "sale month":
          filteredData = data.filter((item) => {
            const saleDate = new Date(item.SALE_DATE);
            const saleMonth = (saleDate.getMonth() + 1)
              .toString()
              .padStart(2, "0");
            return saleMonth === filterMonth;
          });
          break;
        default:
          alert("Anda Harus memilih kategori");
          location.reload();
          return;
      }

      // Jika nilai filter kosong, tampilkan pesan kesalahan dan muat ulang halaman
      if (filterValue === "") {
        alert("Anda harus memasukkan kata kunci");
        location.reload();
        return;
      } else if (filterKey === "sale month" && isNaN(Number(filterValue))) {
        alert("Kata Kunci yang dimasukkan Harus Angka"); // Jika kunci filter adalah "sale month" dan nilai filter bukan angka, tampilkan pesan kesalahan dan muat ulang halaman
        location.reload();
        return;
      }

      currentPage = 1; // Reset ke halaman pertama saat filter diterapkan
      updateTable(filteredData);
      updatePaginationButtons(filteredData.length);
    }

    //Fungsi untuk memperbarui tabel dengan data yang diberikan.
    function updateTable(data) {
      const table = document.getElementById("data-table");
      const oldTbody = table.querySelector("tbody");
      if (oldTbody) {
        table.removeChild(oldTbody);
      }

      const newTbody = document.createElement("tbody");

      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, data.length);

      data.slice(startIndex, endIndex).forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td>${item["NEIGHBORHOOD"]}</td>
      <td>${item["BUILDING_CLASS_CATEGORY"]}</td>
      <td>${item["ADDRESS"]}</td>
      <td>${item["TOTAL_UNITS"]}</td>
      <td>${item["LAND_SQUARE_FEET"]}</td>
      <td>${item["GROSS_SQUARE_FEET"]}</td>
      <td>${item["YEAR_BUILT"]}</td>
      <td>${item["SALE_PRICE"]}</td>
      <td>${item["SALE_DATE"]}</td>
    `;
        newTbody.appendChild(row);
      });

      table.appendChild(newTbody);
    }

    //Fungsi untuk memperbarui tombol-tombol navigasi halaman berdasarkan total item.
    function updatePaginationButtons(totalItems) {
      const indexButtonsContainer = document.querySelector(".index_button");

      while (indexButtonsContainer.firstChild) {
        indexButtonsContainer.removeChild(indexButtonsContainer.firstChild);
      }

      const totalPages = Math.ceil(totalItems / pageSize);

      const prevButton = document.createElement("button");
      prevButton.textContent = "Prev";
      prevButton.disabled = currentPage === 1;
      prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          updateTable(filteredData);
          updatePaginationButtons(filteredData.length);
        }
      });
      indexButtonsContainer.appendChild(prevButton);

      for (let i = 1; i <= totalPages; i++) {
        const indexButton = document.createElement("button");
        indexButton.textContent = i;
        indexButton.disabled = currentPage === i;
        indexButton.addEventListener("click", () => {
          currentPage = i;
          updateTable(filteredData);
          updatePaginationButtons(filteredData.length);
        });
        indexButtonsContainer.appendChild(indexButton);
      }

      const nextButton = document.createElement("button");
      nextButton.textContent = "Next";
      nextButton.disabled = currentPage === totalPages;
      nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
          currentPage++;
          updateTable(filteredData);
          updatePaginationButtons(filteredData.length);
        }
      });
      indexButtonsContainer.appendChild(nextButton);

      const indexButtons = document.querySelectorAll(".index_button button");
      indexButtons.forEach(function (button) {
        button.classList.remove("active");
      });

      const activeButton = document.querySelector(
        `.index_button button[data-index="${currentPage}"]`
      );
      if (activeButton) {
        activeButton.classList.add("active");
      }
    }

    //Fungsi untuk menampilkan tombol-tombol indeks.
    function displayIndexButtons() {
      preLoadCalculation(); // Pastikan fungsi ini didefinisikan jika diperlukan
      var indexButtonsContainer = document.querySelector(".index_button");

      // Menghapus semua elemen di dalam .index_buttons
      while (indexButtonsContainer.firstChild) {
        indexButtonsContainer.removeChild(indexButtonsContainer.firstChild);
      }

      // Menambahkan tombol "Prev"
      var prevButton = document.createElement("button");
      prevButton.textContent = "Prev";
      indexButtonsContainer.appendChild(prevButton);
      prevButton.addEventListener("click", function () { //menambahkan event listener untuk event "click" pada tombol "prevButton"
        // Logika yang ingin dijalankan saat tombol "Prev" diklik
        console.log("Prev");
        prevIndex();
        // Tambahkan logika Anda di sini
      });

      // Menambahkan tombol-tombol indeks
      for (var i = 1; i <= max_index; i++) {
        var indexButton = document.createElement("button");
        indexButton.textContent = i;
        indexButton.setAttribute("data-index", i);
        indexButton.addEventListener("click", function () { //menambahkan event listener untuk event "click" pada tombol "prevButton"
          current_index = this.getAttribute("data-index"); // Mengambil nilai indeks dari atribut data-index
          indexPagination(current_index);
          // Lakukan sesuatu dengan nilai indeks, misalnya memanggil fungsi untuk menampilkan data pada indeks tersebut
        });
        indexButtonsContainer.appendChild(indexButton);
      }

      // Menambahkan tombol "Next"
      var nextButton = document.createElement("button");
      nextButton.textContent = "Next";
      indexButtonsContainer.appendChild(nextButton);
      nextButton.addEventListener("click", function () { //menambahkan event listener untuk event "click" pada tombol "nextButton".
        // Logika yang ingin dijalankan saat tombol "Prev" diklik
        nextIndex();
        // Tambahkan logika Anda di sini
      });
      highlightIndex();
    }
    //Fungsi untuk menyorot indeks yang dipilih.
    function highlightIndex() {
      start_index = (current_index - 1) * table_size + 1;
      end_index = start_index + table_size - 1;
      if (end_index > array_length) {
        end_index = array_length;
      }

      document
        .getElementById("go-to-page-button")
        .addEventListener("click", function () {
          const pageNumber = parseInt(
            document.getElementById("page-number").value
          );
          if (pageNumber >= 1 && pageNumber <= max_index) {
            current_index = pageNumber;
            highlightIndex();
          } else {
            alert(
              "Invalid page number. Please enter a number between 1 and 51."
            );
          }
        });

      // Mengupdate teks dalam elemen span dengan kelas pagination_button
      var paginationSpan = document.querySelector(".pagination_button span");
      paginationSpan.textContent = `Showing ${start_index} to ${end_index} of ${array_length} entries`;

      // Menghapus kelas 'active' dari semua tombol dengan kelas index_button
      var indexButtons = document.querySelectorAll(".index_button button");
      indexButtons.forEach(function (button) {
        button.classList.remove("active");
      });

      // Menambahkan kelas 'active' pada tombol dengan atribut index yang sesuai
      var activeButton = document.querySelector(
        `.index_button button[index="${current_index}"]`
      );
      if (activeButton) {
        activeButton.classList.add("active");
      }
      displayTable();
    }

    //Fungsi untuk menampilkan tabel.
    function displayTable() {
      // Menghapus elemen tbody yang ada di dalam tabel dengan id data-table
      var table = document.getElementById("data-table");
      var oldTbody = table.querySelector("tbody");
      if (oldTbody) {
        table.removeChild(oldTbody);
      }

      // Membuat elemen tbody baru
      var newTbody = document.createElement("tbody");

      // Menentukan indeks mulai dan akhir
      var tab_start = start_index - 1;
      var tab_end = end_index;

      data.slice(tab_start, tab_end + 1).forEach((datas) => {
        var row = document.createElement("tr");
        row.innerHTML = `
      <td>${datas["NEIGHBORHOOD"]}</td>
      <td>${datas["BUILDING_CLASS_CATEGORY"]}</td>
      <td>${datas["ADDRESS"]}</td>
      <td>${datas["TOTAL_UNITS"]}</td>
      <td>${datas["LAND_SQUARE_FEET"]}</td>
      <td>${datas["GROSS_SQUARE_FEET"]}</td>
      <td>${datas["YEAR_BUILT"]}</td>
      <td>${datas["SALE_PRICE"]}</td>
      <td>${datas["SALE_DATE"]}</td>
    `;
        newTbody.appendChild(row);
      });

      // Menambahkan tbody baru ke tabel
      table.appendChild(newTbody);
    }

    //Fungsi untuk menavigasi ke indeks berikutnya.
    function nextIndex() {
      if (current_index < max_index) {
        current_index++;
        highlightIndex();
      }
    }

    // Fungsi untuk menavigasi ke indeks sebelumnya.
    function prevIndex() {
      if (current_index > 1) {
        current_index--;
        highlightIndex();
      }
    }

    //Fungsi untuk menavigasi ke indeks tertentu.
    function indexPagination(index) {
      current_index = parseInt(index);
      highlightIndex();
    }

    // Memanggil fungsi untuk menampilkan tombol-tombol indeks
    displayIndexButtons();
    // Menambahkan event listener untuk neighborhoodSelector
    const neighborhoodSelector = document.getElementById('neighborhoodSelector');
    neighborhoodSelector.addEventListener('change', fetchDataAndDisplay);
    document.getElementById("sort-button").addEventListener("click", sorting);
    document.getElementById("filter-button").addEventListener("click", filter);
    document.getElementById("reset").addEventListener("click", reload);
    // Inisialisasi tampilan awal (opsional, bisa dipanggil saat halaman dimuat)
    preLoadCalculation();
  })
  .catch(error => console.error('Error fetching the data:', error));
