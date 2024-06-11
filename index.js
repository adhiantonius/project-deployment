document.addEventListener('DOMContentLoaded', () => {
  // Deklarasi variabel untuk menyimpan data dan elemen chart
  let jsonData = [];
  let filteredData = [];
  let currentPage = 1;
  const pageSize = 100;
  let myPieChartBorough;
  let myUnitsSoldChart;
  let mySalePriceChart;
  let myBarChart;
  let myChart;

  // Fungsi untuk mendapatkan bulan dan tahun dari string tanggal
  function getMonthYear(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
  }

  // Fungsi untuk inisialisasi pie chart berdasarkan borough
  function initPieChartBorough() {
    if (myPieChartBorough) {
      myPieChartBorough.destroy();
    }

    const dataInPercent = {
      'Manhattan': '21.61%',
      'Bronx': '8.35%',
      'Brooklyn': '28.46%',
      'Queens': '31.69%',
      'Staten Island': '9.90%'
    };

    const labels = Object.keys(dataInPercent);
    const values = Object.values(dataInPercent).map(value => parseFloat(value));

    const ctx = document.getElementById('myPieChart').getContext('2d');
    myPieChartBorough = new Chart(ctx, {
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
          legend: { position: 'left' },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function (tooltipItem) {
                return `${tooltipItem.label}: ${tooltipItem.raw}%`;
              }
            }
          }
        }
      }
    });
  }

  // Fungsi untuk membuat chart unit terjual dan harga penjualan
  function chart3(data) {
    if (myUnitsSoldChart) {
      myUnitsSoldChart.destroy();
    }
    if (mySalePriceChart) {
      mySalePriceChart.destroy();
    }

    const unitsSoldByMonth = {};
    const salePriceByMonth = {};

    // Mengelompokkan data berdasarkan bulan dan tahun penjualan
    data.forEach(sale => {
      const saleDate = getMonthYear(sale.SALE_DATE);
      if (!unitsSoldByMonth[saleDate]) {
        unitsSoldByMonth[saleDate] = 0;
        salePriceByMonth[saleDate] = 0;
      }
      unitsSoldByMonth[saleDate] += parseFloat(sale.TOTAL_UNITS);
      salePriceByMonth[saleDate] += parseFloat(sale.SALE_PRICE);
    });

    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(2016, 8 + i);
      const monthYear = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      months.push(monthYear);
      if (!unitsSoldByMonth[monthYear]) {
        unitsSoldByMonth[monthYear] = 0;
        salePriceByMonth[monthYear] = 0;
      }
    }

    const unitsSold = months.map(month => unitsSoldByMonth[month]);
    const salePrices = months.map(month => salePriceByMonth[month]);
    const unitsSoldCtx = document.getElementById('unitsSoldChart').getContext('2d');
    myUnitsSoldChart = new Chart(unitsSoldCtx, {
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
          y: { beginAtZero: true }
        }
      }
    });

    const salePriceCtx = document.getElementById('salePriceChart').getContext('2d');
    mySalePriceChart = new Chart(salePriceCtx, {
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
          y: { beginAtZero: true }
        }
      }
    });
  }

  // Fungsi untuk memproses data unit penjualan per neighborhood
  function processData(data) {
    const unitsData = {};
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

  // Fungsi untuk membuat bar chart unit penjualan per neighborhood
  function chart4(data) {
    if (myBarChart) {
      myBarChart.destroy();
    }

    const salesData = processData(data);
    const regions = Object.keys(salesData);
    const totalUnits = Object.values(salesData);

    const colors = regions.map((_, index) => `hsl(${index * 30 % 360}, 70%, 50%)`);

    const ctxBar = document.getElementById('totalSalesChart').getContext('2d');
    myBarChart = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: regions,
        datasets: [{
          label: 'Total Units',
          data: totalUnits,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: colors,
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          x: {
            ticks: { font: { size: 8 } }
          },
          y: {
            beginAtZero: true,
            ticks: { callback: value => value.toLocaleString() }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: context => 'Total Units: ' + context.parsed.y.toLocaleString()
            }
          }
        }
      }
    });
  }

  // Fungsi untuk mengisi selector neighborhood
  function populateNeighborhoodSelector(data) {
    const neighborhoods = new Set(data.map(item => item.NEIGHBORHOOD));
    const neighborhoodSelector = document.getElementById('neighborhoodSelector');

    const allOption = document.createElement('option');
    allOption.value = 'ALL NEIGHBORHOOD';
    allOption.textContent = 'ALL NEIGHBORHOOD';
    neighborhoodSelector.appendChild(allOption);

    neighborhoods.forEach(neighborhood => {
      const option = document.createElement('option');
      option.value = neighborhood;
      option.textContent = neighborhood;
      neighborhoodSelector.appendChild(option);
    });
  }

  // Fungsi untuk mengambil data dan menampilkan grafik serta tabel
  function fetchDataAndDisplay() {
    const selectedNeighborhood = document.getElementById('neighborhoodSelector').value;
    filteredData = selectedNeighborhood === 'ALL NEIGHBORHOOD' ? jsonData : jsonData.filter(item => item.NEIGHBORHOOD === selectedNeighborhood);

    const buildingClassCategories = {};
    filteredData.forEach(item => {
      const buildingClassCategory = item.BUILDING_CLASS_CATEGORY;
      if (buildingClassCategories[buildingClassCategory]) {
        buildingClassCategories[buildingClassCategory] += parseInt(item.TOTAL_UNITS);
      } else {
        buildingClassCategories[buildingClassCategory] = parseInt(item.TOTAL_UNITS);
      }
    });

    const labels = Object.keys(buildingClassCategories);
    const dataValues = Object.values(buildingClassCategories);

    displayPieChart(labels, dataValues);
    updateTable();
    updatePaginationButtons();
  }

  // Fungsi untuk menampilkan pie chart
  function displayPieChart(labels, dataValues) {
    if (myChart) {
      myChart.destroy();
    }
    const ctx = document.getElementById('buildingChart').getContext('2d');
    myChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54,             162, 235, 0.2)',
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
          legend: { display: false },
          tooltip: { enabled: true }
        }
      }
    });
  }

  // Mengambil data JSON dari file dan memulai inisialisasi grafik serta tabel
  fetch('Data_Team_11.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      jsonData = data;
      filteredData = jsonData;
      console.log(jsonData);

      // Initialize charts after data is loaded
      initPieChartBorough();
      chart3(jsonData);
      chart4(jsonData);
      populateNeighborhoodSelector(jsonData);
      fetchDataAndDisplay();
      updateTotalSalePrice();
      updateTable();
      updatePaginationButtons();
    })
    .catch(error => {
      console.error('Error fetching the data:', error);
    });

  function updateTotalSalePrice() {
    // Menghitung total harga penjualan dari seluruh data
    const TotalSalePrice = jsonData.reduce((total, sale) => total + parseFloat(sale.SALE_PRICE), 0);
    // Menampilkan total harga penjualan di elemen dengan id "TotalSalePrice"
    document.getElementById("TotalSalePrice").textContent = "$" + TotalSalePrice.toFixed(0);
  }

  function reload() {
    // Mengatur ulang data yang difilter ke data awal
    filteredData = jsonData;
    currentPage = 1;
     // Mengosongkan nilai input filter dan sort
    document.getElementById('filter-key').value = '';
    document.getElementById('filter-value').value = '';
    document.getElementById('sort-key').value = '';
    // Memanggil fungsi untuk menampilkan data dan grafik
    fetchDataAndDisplay();
  }

  function preLoadCalculation() {
    // Menghitung total halaman yang dibutuhkan berdasarkan jumlah data dan ukuran halaman
    const array_length = jsonData.length;
    max_index = Math.ceil(array_length / pageSize);
  }

  function sorting() {
    // Mendapatkan kunci sort dari input
    const sortKey = document.getElementById("sort-key").value;
    // Melakukan sorting berdasarkan kunci yang dipilih
    switch (sortKey) {
      case "borough":
        filteredData.sort((a, b) => a.BOROUGH.localeCompare(b.BOROUGH));
        break;
      case "sale price":
        filteredData.sort((a, b) => a.SALE_PRICE - b.SALE_PRICE);
        break;
      case "sale date":
        filteredData.sort((a, b) => new Date(a.SALE_DATE) - new Date(b.SALE_DATE));
        break;
      default:
        alert("Anda Harus Memilih Kategori");
        return;
    }
    // Mengatur ulang halaman saat ini dan memperbarui tabel serta tombol pagination
    currentPage = 1;
    updateTable();
    updatePaginationButtons();
  }

  function filter() {
    // Mendapatkan kunci filter dan nilai filter dari input
    const filterKey = document.getElementById("filter-key").value;
    const filterValue = document.getElementById("filter-value").value;
    const filterMonth = filterValue.padStart(2, "0");

    // Melakukan filtering berdasarkan kunci yang dipilih
    switch (filterKey) {
      case "borough":
        filteredData = jsonData.filter(item => item.BOROUGH.toString().toLowerCase() === filterValue.toLowerCase());
        break;
      case "building class category":
        filteredData = jsonData.filter(item => item.BUILDING_CLASS_CATEGORY.toLowerCase().includes(filterValue.toLowerCase()));
        break;
      case "sale month":
        filteredData = jsonData.filter(item => {
          const saleDate = new Date(item.SALE_DATE);
          const saleMonth = (saleDate.getMonth() + 1).toString().padStart(2, "0");
          return saleMonth === filterMonth;
        });
        break;
      default:
        filteredData = jsonData; // Reset filteredData jika filterKey tidak valid
    }

    currentPage = 1;
    updateTable();
    updatePaginationButtons();
  }

  // Fungsi untuk mengupdate tabel data
  function updateTable() {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredData.length);

    const table = document.getElementById("data-table");
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = ""; // Bersihkan tbody

    for (let i = startIndex; i < endIndex; i++) {
      const item = filteredData[i];
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
      tbody.appendChild(row);
    }

    highlightIndex();
  }

  // Fungsi untuk mengupdate tombol pagination
  function updatePaginationButtons() {
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const indexButtonsContainer = document.querySelector('.index_button');
    indexButtonsContainer.innerHTML = '';

    const prevButton = document.createElement("button");
    prevButton.textContent = "Prev";
    prevButton.addEventListener("click", prevIndex);
    indexButtonsContainer.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
      const indexButton = document.createElement('button');
      indexButton.textContent = i;
      indexButton.setAttribute("data-index", i);
      indexButton.addEventListener('click', function () {
        currentPage = parseInt(this.getAttribute("data-index"));
        updateTable();
      });
      indexButtonsContainer.appendChild(indexButton);
    }

    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.addEventListener("click", nextIndex);
    indexButtonsContainer.appendChild(nextButton);

    highlightIndex();
  }

  function highlightIndex() {
    // Menghitung indeks awal dan akhir untuk halaman saat ini
    const start_index = (currentPage - 1) * pageSize + 1;
    const end_index = Math.min(start_index + pageSize - 1, filteredData.length);

    // Menampilkan informasi indeks pada elemen span di pagination
    const paginationSpan = document.querySelector(".pagination_button span");
    paginationSpan.textContent = `Showing ${start_index} to ${end_index} of ${filteredData.length} entries`;

    // Mengatur tampilan tombol pagination yang aktif
    const indexButtons = document.querySelectorAll(".index_button button");
    indexButtons.forEach(button => button.classList.remove("active"));

    const activeButton = document.querySelector(`.index_button button[data-index="${currentPage}"]`);
    if (activeButton) {
      activeButton.classList.add("active");
    }
  }

  function nextIndex() {
    // Memeriksa apakah masih ada halaman berikutnya dan memperbarui tabel
    if (currentPage < Math.ceil(filteredData.length / pageSize)) {
      currentPage++;
      updateTable();
    }
  }

  function prevIndex() {
    // Memeriksa apakah masih ada halaman sebelumnya dan memperbarui tabel
    if (currentPage > 1) {
      currentPage--;
      updateTable();
    }
  }

  document.getElementById("go-to-page-button").addEventListener("click", function () {
    // Mendapatkan nomor halaman dari input dan memperbarui tabel jika nomor valid
    const pageNumber = parseInt(document.getElementById("page-number").value);
    if (pageNumber >= 1 && pageNumber <= Math.ceil(filteredData.length / pageSize)) {
      currentPage = pageNumber;
      updateTable();
    } else {
      alert("Nomor halaman tidak valid. Mohon memasukkan nomor halaman yang valid.");
    }
  });

  function displayIndexButtons() {
    // Menghitung jumlah halaman dan memperbarui tombol pagination
    preLoadCalculation();
    updatePaginationButtons();
  }

  // Event listeners untuk elemen-elemen UI
  const neighborhoodSelector = document.getElementById('neighborhoodSelector');
  neighborhoodSelector.addEventListener('change', fetchDataAndDisplay);
  document.getElementById("sort-button").addEventListener("click", sorting);
  document.getElementById("filter-button").addEventListener("click", filter);
  document.getElementById("reset").addEventListener("click", reload);

  // Inisialisasi kalkulasi dan tampilan tombol pagination saat halaman pertama kali dimuat
  preLoadCalculation();
  displayIndexButtons();
});

