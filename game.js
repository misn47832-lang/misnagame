const farmGrid = document.getElementById("farmGrid");
const coinsEl = document.getElementById("coins");
const seedsEl = document.getElementById("seeds");
const harvestedEl = document.getElementById("harvested");
const messageEl = document.getElementById("message");
const plantBtn = document.getElementById("plantBtn");
const waterBtn = document.getElementById("waterBtn");
const harvestBtn = document.getElementById("harvestBtn");
const buySeedsBtn = document.getElementById("buySeedsBtn");
const sellBtn = document.getElementById("sellBtn");

const farmSize = 9;
const farm = [];
let selectedTile = 0;
let coins = 10;
let seeds = 5;
let harvested = 0;
let inventory = {
  carrot: 0,
  tomato: 0,
  broccoli: 0,
};

const plantTypes = [
  { name: "Wortel", emoji: "🥕", growTime: 8, value: 6 },
  { name: "Tomat", emoji: "🍅", growTime: 10, value: 8 },
  { name: "Brokoli", emoji: "🥦", growTime: 14, value: 12 },
];

function randomPlantType() {
  const index = Math.floor(Math.random() * plantTypes.length);
  return plantTypes[index];
}

function setMessage(text) {
  messageEl.textContent = text;
}

function updateStatus() {
  coinsEl.textContent = coins;
  seedsEl.textContent = seeds;
  harvestedEl.textContent = inventory.carrot + inventory.tomato + inventory.broccoli;
}

function createFarm() {
  for (let i = 0; i < farmSize; i++) {
    farm.push({ planted: false, type: null, age: 0, watered: false });
    const tile = document.createElement("button");
    tile.className = "farm-tile";
    tile.type = "button";
    tile.dataset.index = i;
    tile.innerHTML = `
      <div class="tile-label">Petak ${i + 1}</div>
      <div class="tile-state">🟫 Kosong</div>
      <div class="tile-progress"><span style="width:0%"></span></div>
    `;
    tile.addEventListener("click", () => selectTile(i));
    farmGrid.appendChild(tile);
  }
}

function selectTile(index) {
  selectedTile = index;
  const tile = farmGrid.children[index];
  tile.classList.add("selected");
  setTimeout(() => tile.classList.remove("selected"), 130);
  const plot = farm[index];

  if (!plot.planted) {
    setMessage(`Petak ${index + 1} kosong. Klik Tanam untuk mulai menanam.`);
  } else {
    const timeLeft = Math.max(0, plot.type.growTime - plot.age);
    const status = plot.age >= plot.type.growTime ? "Siap dipanen!" : `Tumbuh, sisa ${timeLeft} detik.`;
    setMessage(`Petak ${index + 1}: ${plot.type.emoji} ${plot.type.name}. ${status}`);
  }
}

function renderFarm() {
  for (let i = 0; i < farmSize; i++) {
    const plot = farm[i];
    const tile = farmGrid.children[i];
    const status = tile.querySelector(".tile-state");
    const bar = tile.querySelector(".tile-progress span");

    if (!plot.planted) {
      status.textContent = "🟫 Kosong";
      bar.style.width = "0%";
      tile.style.opacity = "1";
      tile.style.background = "linear-gradient(180deg, #e8ffee 0%, #daf4d9 100%)";
    } else {
      const percent = Math.min(100, (plot.age / plot.type.growTime) * 100);
      status.textContent = `${plot.type.emoji} ${plot.type.name} ${plot.watered ? "💧" : ""}`;
      bar.style.width = `${percent}%`;
      tile.style.background = plot.age >= plot.type.growTime ? "linear-gradient(180deg, #fff7d7 0%, #fceab7 100%)" : "linear-gradient(180deg, #e8fff4 0%, #cfe9d8 100%)";
      tile.style.opacity = plot.watered ? "1" : "0.85";
    }
  }
}

function plantSeed() {
  const plot = farm[selectedTile];
  if (plot.planted) {
    setMessage("Petak sudah terisi. Panen dulu atau pilih petak lain.");
    return;
  }
  if (seeds <= 0) {
    setMessage("Tidak cukup benih. Beli lebih banyak di toko.");
    return;
  }

  const type = randomPlantType();
  plot.planted = true;
  plot.type = type;
  plot.age = 0;
  plot.watered = true;
  seeds -= 1;
  setMessage(`Berhasil menanam ${type.emoji} ${type.name}! Siram lagi untuk mempercepat.`);
  updateStatus();
  renderFarm();
}

function waterPlant() {
  const plot = farm[selectedTile];
  if (!plot.planted) {
    setMessage("Pilih petak dengan tanaman dulu.");
    return;
  }
  if (plot.age >= plot.type.growTime) {
    setMessage("Tanaman sudah siap panen. Ambil hasilnya dulu.");
    return;
  }
  plot.watered = true;
  setMessage(`Tanaman ${plot.type.emoji} ${plot.type.name} disiram! Cepat tumbuh.`);
  renderFarm();
}

function harvestPlant() {
  const plot = farm[selectedTile];
  if (!plot.planted) {
    setMessage("Tidak ada tanaman untuk dipanen di petak ini.");
    return;
  }
  if (plot.age < plot.type.growTime) {
    setMessage(`Masih tumbuh. Tunggu ${plot.type.growTime - plot.age} detik lagi.`);
    return;
  }

  inventory[plot.type.name.toLowerCase()] += 1;
  setMessage(`Yeay! Panen ${plot.type.emoji} ${plot.type.name} berhasil.`);
  plot.planted = false;
  plot.type = null;
  plot.age = 0;
  plot.watered = false;
  updateStatus();
  renderFarm();
}

function buySeeds() {
  if (coins < 5) {
    setMessage("Koin tidak cukup untuk membeli benih.");
    return;
  }
  coins -= 5;
  seeds += 3;
  setMessage("Kamu membeli 3 benih baru. Siap menanam!");
  updateStatus();
}

function sellHarvest() {
  const total = inventory.carrot * 6 + inventory.tomato * 8 + inventory.broccoli * 12;
  if (total === 0) {
    setMessage("Belum ada hasil panen untuk dijual.");
    return;
  }

  coins += total;
  const sold = `${inventory.carrot} 🥕, ${inventory.tomato} 🍅, ${inventory.broccoli} 🥦`;
  inventory.carrot = 0;
  inventory.tomato = 0;
  inventory.broccoli = 0;
  setMessage(`Sukses! Kamu menjual ${sold} seharga ${total} koin.`);
  updateStatus();
}

function tickGrowth() {
  farm.forEach((plot) => {
    if (!plot.planted) return;
    if (!plot.watered) return;
    if (plot.age < plot.type.growTime) {
      plot.age += 1;
    }
    if (plot.age >= plot.type.growTime) {
      plot.watered = false;
    }
  });
  renderFarm();
}

plantBtn.addEventListener("click", plantSeed);
waterBtn.addEventListener("click", waterPlant);
harvestBtn.addEventListener("click", harvestPlant);
buySeedsBtn.addEventListener("click", buySeeds);
sellBtn.addEventListener("click", sellHarvest);

createFarm();
updateStatus();
setMessage("Pilih petak kebun di kiri, lalu tanam benihmu.");
setInterval(tickGrowth, 1000);
