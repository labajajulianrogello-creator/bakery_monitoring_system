let breads = JSON.parse(localStorage.getItem("breads")) || [];
let currentDateKey = new Date().toDateString();

let salesHistory =
JSON.parse(localStorage.getItem("salesHistory")) || [];

const tableBody = document.getElementById("reportTableTop");

const lastSaved = document.getElementById("lastSaved");

// ================= LOAD DATA =================

function loadData(){

breads =
JSON.parse(localStorage.getItem("breads")) || [];

salesHistory =
JSON.parse(localStorage.getItem("salesHistory")) || [];

updateDropdown();
renderTable();
renderHistory();
loadDashboardStats();

}

window.onload = function(){
  checkNewDay();
  loadData();
  loadBakeryInfo();

  const savedTheme = localStorage.getItem("theme");
  if(savedTheme === "dark"){
    document.body.classList.add("dark-mode");
  }

  const savedLowStock = localStorage.getItem("lowStockAlert");
  if(savedLowStock){
    document.getElementById("lowStockAlert").value = savedLowStock;
  }
};

// ================= SAVE DATA =================

function saveData(){

localStorage.setItem(
"breads",
JSON.stringify(breads)
);

localStorage.setItem(
"salesHistory",
JSON.stringify(salesHistory)
);

const now = new Date();

lastSaved.innerText =
"Last saved: " + now.toLocaleTimeString();

}

// ================= ADD BREAD =================

function addBreadStock(){

const breadType =
document.getElementById("breadType").value.trim();
const pieces =
Number(document.getElementById("pieces").value) || 0;
const price =
Number(document.getElementById("price").value) || 0;
const kilos =
Number(document.getElementById("kilos").value) || 0;
const purchase =
Number(document.getElementById("purchase").value) || 0;
const lop =
Number(document.getElementById("lop").value) || 0;

if(!breadType){
alert("Enter bread name!");
return;
}

const existing =
breads.find(
b => b.breadType.toLowerCase()
=== breadType.toLowerCase()
);

if(existing){

existing.pieces += pieces;
existing.purchase += purchase;
existing.lop += lop;
existing.kilos += kilos;
existing.price = price;

existing.lot =
existing.pieces +
existing.lop -
existing.purchase -
(existing.sold || 0);

}else{

const bread = {

breadType,
pieces,
price,
kilos,
purchase,
lop,
sold:0,

lot:
pieces + lop - purchase

};

breads.push(bread);

}

saveData();

document.getElementById("breadType").value = "";
document.getElementById("pieces").value = "";
document.getElementById("price").value = "";
document.getElementById("kilos").value = "";
document.getElementById("purchase").value = "";
document.getElementById("lop").value = "";

updateDropdown();
renderTable();
renderHistory();
loadDashboardStats();


}

// ================= DROPDOWN =================

function updateDropdown(){}

document.addEventListener("click", function(event){

const input = document.getElementById("saleBread");
const dropdown = document.getElementById("breadDropdown");

if(!input || !dropdown) return;

const clickedInput = input.contains(event.target);
const clickedDropdown = dropdown.contains(event.target);

if(!clickedInput && !clickedDropdown){
dropdown.style.display = "none";
}

});

function filterBreadOptions(){

const input = document.getElementById("saleBread");
const dropdown = document.getElementById("breadDropdown");
const value = input.value.toLowerCase().trim();

dropdown.innerHTML = "";

if(value === ""){
dropdown.style.display = "none";
return;
}

const matched = breads.filter(b =>
b.breadType.toLowerCase().includes(value)
);

if(matched.length === 0){
dropdown.style.display = "none";
return;
}

matched.forEach(b => {
const div = document.createElement("div");
div.className = "bread-option";
div.innerText = b.breadType;

div.onclick = function(){
input.value = b.breadType;
dropdown.style.display = "none";
};

dropdown.appendChild(div);
});

dropdown.style.display = "block";

}

// ================= RECORD SALE =================

function recordSale(){

const breadName =
document.getElementById("saleBread").value.trim();

const qty =
Number(document.getElementById("saleQty").value);

if(!breadName){
alert("Please select bread");
return;
}

if(qty <= 0){
alert("Enter valid quantity");
return;
}

const bread =
breads.find(
b => b.breadType.trim() === breadName
);

if(!bread){
alert("Bread not found");
return;
}

if(qty > bread.lot){
alert("Not enough stock");
return;
}

bread.sold = (bread.sold || 0) + qty;

bread.lot = (bread.lot || 0) - qty;

const totalAmount = qty * bread.price;

salesHistory.push({

date: new Date().toLocaleString(),

bread_name: breadName,

sold_qty: qty,

total_amount: totalAmount

});

saveData();

loadData();

document.getElementById("saleQty").value = "";


}

// ================= RENDER TABLE =================

function renderTable(){

let dashboardSales = 0;
let dashboardSold = 0;
let dashboardRemaining = 0;
let dashboardPullouts = 0;

tableBody.innerHTML = "";

let totalSoldAmount = 0;

breads.forEach((b,index)=>{

const pieces = b.pieces || 0;
const lop = b.lop || 0;
const purchase = b.purchase || 0;
const price = b.price || 0;
const lot = b.lot || 0;
const sold = b.sold || 0;

const piecesAmount = pieces * price;
const lopAmount = lop * price;
const pullOutAmount = purchase * price;
const lotAmount = lot * price;
const soldAmount = sold * price;

dashboardSales += soldAmount;
dashboardSold += sold;
dashboardRemaining += lot;
dashboardPullouts += purchase;

totalSoldAmount += soldAmount;

const row = document.createElement("tr");

const lowStockLimit =
Number(localStorage.getItem("lowStockAlert")) || 10;

if(lot <= 5){
row.classList.add("critical-stock");
}

else if(lot <= lowStockLimit){
row.classList.add("lowstock");
}

row.innerHTML = `
<td>${b.breadType}</td>
<td>${b.kilos}</td>
<td>${price}</td>
<td>${pieces}</td>
<td>${piecesAmount}</td>
<td>${lop}</td>
<td>${lopAmount}</td>
<td>${purchase}</td>
<td>${pullOutAmount}</td>
<td>${lot}</td>
<td>${lotAmount}</td>
<td>${sold}</td>
<td>${soldAmount}</td>

<td>
<button onclick="editRow(${index})">
Edit
</button>

<button onclick="deleteRow(${index})">
Delete
</button>
</td>
`;

tableBody.appendChild(row);

});

const totalRow = document.createElement("tr");

totalRow.innerHTML = `
<td colspan="11" style="text-align:right; font-weight:bold;">
Total Sold Amount:
</td>

<td colspan="2" style="font-weight:bold; text-align:center;">
₱${totalSoldAmount}
</td>

<td></td>
`;

tableBody.appendChild(totalRow);

document.getElementById("totalBreadSold").innerText =
dashboardSold + " pcs";

document.getElementById("remainingStock").innerText =
dashboardRemaining + " pcs";

document.getElementById("pullOuts").innerText =
dashboardPullouts + " pcs";

}

// ================= HISTORY =================

function renderHistory(){

const searchInput =
document.getElementById("historySearch");

const search =
searchInput ? searchInput.value.toLowerCase() : "";

const historyTable =
document.getElementById("historyTable");

historyTable.innerHTML = "";

salesHistory
.filter(sale =>
sale.bread_name
.toLowerCase()
.includes(search)
)

.forEach(sale => {

const row =
document.createElement("tr");

row.innerHTML = `
<td>${sale.date}</td>
<td>${sale.bread_name}</td>
<td>${sale.sold_qty}</td>
<td>₱${sale.total_amount}</td>
`;

historyTable.appendChild(row);

});

}

// ================= EDIT =================

function editRow(index){

const row = tableBody.rows[index];

const editable=[0,1,2,3,5,7];

editable.forEach(i=>{

row.cells[i].contentEditable=true;

row.cells[i].style.background="#fff3cd";

});

row.cells[13].innerHTML=`

<button onclick="saveEdit(${index})">
Save
</button>

<button onclick="renderTable()">
Cancel
</button>

`;

}

function saveEdit(index){

const row = tableBody.rows[index];

breads[index].breadType =
row.cells[0].innerText;

breads[index].kilos =
Number(row.cells[1].innerText) || 0;

breads[index].price =
Number(row.cells[2].innerText) || 0;

breads[index].pieces =
Number(row.cells[3].innerText) || 0;

breads[index].lop =
Number(row.cells[5].innerText) || 0;

breads[index].purchase =
Number(row.cells[7].innerText) || 0;

breads[index].lot =
breads[index].pieces +
breads[index].lop -
breads[index].purchase -
breads[index].sold;

saveData();

updateDropdown();

renderTable();

}

// ================= DELETE =================

function deleteRow(index){

if(confirm("Delete this bread permanently?")){

breads.splice(index,1);

saveData();

renderTable();

updateDropdown();

loadDashboardStats();

}

}

// ================= CSV =================

function downloadCSV(){

let csv =
"Bread,Kilos,Price,Pieces,Pieces Amount,L.O.P,L.O.P Amount,Pull Out,Pull Out Amount,L.O.T,L.O.T Amount,Sold,Sold Amount\n";

let total = 0;

breads.forEach(b => {

const pieces = b.pieces || 0;
const price = b.price || 0;
const lop = b.lop || 0;
const purchase = b.purchase || 0;
const lot = b.lot || 0;
const sold = b.sold || 0;

const piecesAmount = pieces * price;
const lopAmount = lop * price;
const pullOutAmount = purchase * price;
const lotAmount = lot * price;
const soldAmount = sold * price;

total += soldAmount;

csv += `${b.breadType},${b.kilos},${price},${pieces},${piecesAmount},${lop},${lopAmount},${purchase},${pullOutAmount},${lot},${lotAmount},${sold},${soldAmount}\n`;

});

csv += `,,,,,,,,,,,Total,${total}`;

const blob =
new Blob([csv], {type:"text/csv"});

const link =
document.createElement("a");

link.href =
URL.createObjectURL(blob);

link.download =
"Bakery_Report.csv";

link.click();

}

// ================= QUICK ADD =================

function quickAdd(num){

const qtyInput =
document.getElementById("saleQty");

qtyInput.value =
Number(qtyInput.value || 0) + num;

}

// ================= PAGE SWITCH =================

function showPage(pageId, element){

document.querySelectorAll(".page")
.forEach(page=>{
page.style.display = "none";
});

document.getElementById(pageId)
.style.display = "block";

document.querySelectorAll(".menu-item")
.forEach(item=>{
item.classList.remove("active");
});

element.classList.add("active");

document.getElementById("pageTitle")
.innerText = element.innerText;

if(window.innerWidth <= 1000){
document.querySelector(".sidebar")
.classList.remove("show");  
}

if(window.innerWidth <= 1000){

const sidebar = document.querySelector(".sidebar");
const button = document.querySelector(".menu-toggle");

sidebar.classList.remove("show");
button.classList.remove("hide-toggle");

}

}

// ================= THEME =================

function setTheme(mode){

if(mode === "dark"){

document.body.classList.add("dark-mode");

localStorage.setItem("theme","dark");

}else{

document.body.classList.remove("dark-mode");

localStorage.setItem("theme","light");

}

}

// ================= BAKERY INFO =================

function saveBakeryInfo(){

const bakeryName =
document.getElementById("bakeryName").value;

const ownerName =
document.getElementById("ownerName").value;

const contactNumber =
document.getElementById("contactNumber").value;

localStorage.setItem("bakeryName", bakeryName);
localStorage.setItem("ownerName", ownerName);
localStorage.setItem("contactNumber", contactNumber);

loadBakeryInfo();

alert("Bakery info saved!");

}

// ================= LOW STOCK =================

function saveLowStock(){

const input = document.getElementById("lowStockAlert").value;

// convert to number
const lowStock = Number(input);

// validate
if(isNaN(lowStock) || lowStock <= 0){
alert("Please enter a valid number greater than 0");
return;
}

// save as number
localStorage.setItem("lowStockAlert", lowStock);

// update UI
renderTable();
loadDashboardStats();

alert("Low stock alert saved!");

}

const savedLowStock = localStorage.getItem("lowStockAlert");
if(savedLowStock){
document.getElementById("lowStockAlert").value = savedLowStock;
}

// ================= CLEAR HISTORY =================

function clearHistory(){

if(confirm("Clear all history?")){

salesHistory = [];

saveData();

renderHistory();

}

}


// ================= RESET =================

function resetSystem(){

if(confirm("Reset entire system?")){

breads = [];

salesHistory = [];

localStorage.clear();

renderTable();

renderHistory();

updateDropdown();

loadDashboardStats();

alert("System reset!");

}

}

// ================= SIDEBAR =================

function toggleSidebar(){

const sidebar = document.querySelector(".sidebar");
const button = document.querySelector(".menu-toggle");

sidebar.classList.toggle("show");

button.classList.toggle("hide-toggle");

}

// ================= DASHBOARD =================

function loadDashboardStats(){

let totalSales = 0;

let topBread = "None";

let topQty = 0;

let lowStock = [];

breads.forEach(b => {

totalSales +=
(b.sold || 0) * b.price;

if((b.sold || 0) > topQty){

topQty = b.sold;

topBread = b.breadType;

}

const lowStockLimit =
Number(localStorage.getItem("lowStockAlert")) || 10;

if(b.lot <= lowStockLimit){

lowStock.push({
bread_name:b.breadType,
stock:b.lot,
critical: b.lot <= 5
});

}

});

document.getElementById("todaySales").innerText =
"₱" + totalSales;

document.getElementById("topBread").innerText =
topBread;

document.getElementById("topQty").innerText =
topQty + " pcs";

document.getElementById("lowStockCount").innerText =
lowStock.length + " items";

const list =
document.getElementById("lowStockList");

list.innerHTML = "";

if(lowStock.length === 0){

list.innerHTML =
"<li>All stocks are sufficient</li>";

}else{

lowStock.forEach(item => {

const li =
document.createElement("li");

li.innerText =
`${item.bread_name} - ${item.stock} pcs left`;

if(item.critical){
li.style.color = "#d62828";
li.style.fontWeight = "700";
}

list.appendChild(li);

});

}

}

document.addEventListener("click", function(event){

if(window.innerWidth > 1000) return;

const sidebar = document.querySelector(".sidebar");
const button = document.querySelector(".menu-toggle");

const clickedInside = sidebar.contains(event.target);
const clickedButton = button.contains(event.target);

if(sidebar.classList.contains("show") && !clickedInside && !clickedButton){

sidebar.classList.remove("show");
button.classList.remove("hide-toggle");

}

});

// ================= SWIPE GESTURE FOR SIDEBAR =================


let touchStartX = 0;
let touchEndX = 0;

document.addEventListener("touchstart", function(e){
touchStartX = e.changedTouches[0].clientX;
}, {passive:true});

document.addEventListener("touchend", function(e){
touchEndX = e.changedTouches[0].clientX;
handleSwipe();
}, {passive:true});

function handleSwipe(){

if(window.innerWidth > 1000) return;

const sidebar = document.querySelector(".sidebar");
const button = document.querySelector(".menu-toggle");

const swipeDistance = touchEndX - touchStartX;

if(Math.abs(swipeDistance) < 80) return;

// OPEN
if(swipeDistance > 0){
sidebar.classList.add("show");
button.classList.add("hide-toggle");
}

// CLOSE
else{
sidebar.classList.remove("show");
button.classList.remove("hide-toggle");
}

}

function loadBakeryInfo(){

const bakeryName = localStorage.getItem("bakeryName");

const display = document.getElementById("bakeryDisplay");

if(bakeryName && bakeryName.trim() !== ""){
display.innerText = bakeryName;
}else{
display.innerText = "";
}

}   

function checkNewDay(){

  const today = new Date().toDateString();
  const savedDate = localStorage.getItem("lastDate");

  if(savedDate && savedDate !== today){

    // 1. EXPORT YESTERDAY REPORT FIRST
    autoEndOfDayReport(savedDate);

    // 2. RESET DAILY DATA
    resetDailyData();

    // 3. UPDATE STORED DATE
    localStorage.setItem("lastDate", today);
  }

  // first time setup
  if(!savedDate){
    localStorage.setItem("lastDate", today);
  }
}

function resetDailyData(){

  breads.forEach(b => {

    b.sold = 0;

    // recompute stock properly
    b.lot =
      (b.pieces || 0) +
      (b.lop || 0) -
      (b.purchase || 0);

  });

  saveData();
  renderTable();
  renderHistory();
  loadDashboardStats();
}

function archiveDailyData(date){

  if(!date || date === "Invalid Date") return;

  const dailySummary = {
    date: date,
    breads: breads,
    salesHistory: salesHistory
  };

  let archive = JSON.parse(localStorage.getItem("dailyArchive")) || [];

  archive.push(dailySummary);

  localStorage.setItem("dailyArchive", JSON.stringify(archive));
}

function autoEndOfDayReport(oldDate){

  if(!oldDate) return;

  let total = 0;

  const data = breads.map(b => {

    const sold = b.sold || 0;
    const price = b.price || 0;
    const revenue = sold * price;

    total += revenue;

    return {
      Bread: b.breadType,
      Kilos: b.kilos,
      Price: price,
      Pieces: b.pieces,
      Sold: sold,
      Revenue: revenue
    };
  });

  data.push({
    Bread: "TOTAL",
    Kilos: "",
    Price: "",
    Pieces: "",
    Sold: "",
    Revenue: total
  });

  exportToExcel(
    `End_of_Day_Report_${oldDate}`,
    "Daily Report",
    data
  );
}

// ================= EXCEL EXPORT MODULE =================

function exportToExcel(filename, sheetName, data){

  if(!data || data.length === 0){
    alert("No data to export");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Optional: auto column width (basic improvement)
  const cols = Object.keys(data[0]).map(key => ({
    wch: Math.max(key.length, 12)
  }));
  worksheet["!cols"] = cols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, filename + ".xlsx");
}