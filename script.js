const buttons = document.querySelectorAll('.section button:not(#add-rice):not(.red):not(.green):not(#new-order):not(#history):not(#checkout):not(#view-transaction):not(#delete-order)');
const addRiceBtn = document.getElementById('add-rice');
const riceInput = document.querySelector('.rice-input input');
const newOrderBtn = document.getElementById('new-order');
const historyBtn = document.getElementById('history');
const checkoutBtn = document.getElementById('checkout');
const viewTransactionBtn = document.getElementById('view-transaction');
const deleteOrderBtn = document.getElementById('delete-order');

const screen = document.querySelector('.screen');
const keypadButtons = document.querySelectorAll('.keypad button');

let currentOrder = {};
let history = [];
let numpadInput = "";
let waitingForPayment = false;
let totalAmount = 0;

const prices = {
  water: 10, coke: 20, sprite: 20, royal: 20, "zest-o": 15,
  "fried-chicken": 65, fish: 70, bulalo: 120, kare2x: 110, hamburger: 50,
  beef: 85, halang2x: 90, "bicol-express": 75, porkchop: 70,
  "mango-ice-cream": 30, "choco-ice-cream": 30, sundae: 25, halo2x: 45,
  popsicle: 15, "strawberry-ice-cream": 35, cookie: 15,
  buffet: 199, "family-specials": 499, "lechon-baboy": 650,
  rice: 10
};

function updateScreen(text) {
  screen.textContent = text;
}

function addItem(item) {
  if (!currentOrder[item]) {
    currentOrder[item] = 1;
  } else {
    currentOrder[item]++;
  }
  alert(`${item.replace(/-/g, " ")}: ${currentOrder[item]} pcs`);
}

function resetOrder() {
  if (confirm("Are you sure you want to start a new order?")) {
    currentOrder = {};
    updateScreen('0');
    numpadInput = '';
    waitingForPayment = false;
    alert("New order started!");
  }
}

function deleteOrder() {
  if (confirm("Are you sure you want to delete the current order?")) {
    currentOrder = {};
    updateScreen('0');
    numpadInput = '';
    waitingForPayment = false;
    alert("Order deleted.");
  }
}

function calculateTotal(order) {
  let total = 0;
  for (let item in order) {
    total += (prices[item] * order[item]);
  }
  return total;
}

function checkout() {
  totalAmount = calculateTotal(currentOrder);
  if (totalAmount === 0) {
    alert("No items to checkout.");
    return;
  }
  alert(`Total amount: ₱${totalAmount}\nPlease enter the customer's payment amount to calculate the change.`);
  updateScreen('0');
  numpadInput = '';
  waitingForPayment = true;
}

function viewTransaction() {
  if (Object.keys(currentOrder).length === 0) {
    alert("No active order.");
    return;
  }

  let details = "Current Order:\n";
  for (let item in currentOrder) {
    details += `${item.replace(/-/g, " ")}: ${currentOrder[item]} pcs (₱${prices[item]} each)\n`;
  }
  details += `Total: ₱${calculateTotal(currentOrder)}`;
  alert(details);
}

function viewHistory() {
  if (history.length === 0) {
    alert("No order history yet.");
    return;
  }
  let message = "Order History:\n\n";
  history.forEach((order, index) => {
    message += `Order #${index + 1}:\n`;
    for (let item in order) {
      if (item !== 'total' && item !== 'paid' && item !== 'change') {
        message += `- ${item.replace(/-/g, " ")}: ${order[item]} pcs\n`;
      }
    }
    message += `Total: ₱${order.total}\nPaid: ₱${order.paid}\nChange: ₱${order.change}\n\n`;
  });
  alert(message);
}

keypadButtons.forEach(btn => {
  btn.addEventListener('click', function () {
    if (!waitingForPayment) {
      return; // Ignore if not checking out
    }
    if (btn.id === 'clear') {
      numpadInput = "";
      updateScreen('0');
    } else if (btn.id === 'enter') {
      let payment = parseFloat(numpadInput);
      if (isNaN(payment)) {
        alert("Please enter a valid amount.");
        return;
      }
      if (payment >= totalAmount) {
        let change = payment - totalAmount;
        alert(`Payment accepted! Change: ₱${change}`);
        history.push({ ...currentOrder, total: totalAmount, paid: payment, change: change });
        currentOrder = {};
        numpadInput = '';
        waitingForPayment = false;
        updateScreen('0');
      } else {
        alert(`Insufficient payment. You need ₱${totalAmount - payment} more.`);
      }
    } else {
      numpadInput += btn.textContent;
      updateScreen(numpadInput);
    }
  });
});

buttons.forEach(button => {
  button.addEventListener('click', function () {
    addItem(button.id);
  });
});

addRiceBtn.addEventListener('click', function () {
  let qty = parseInt(riceInput.value);
  if (qty > 0) {
    if (!currentOrder['rice']) {
      currentOrder['rice'] = qty;
    } else {
      currentOrder['rice'] += qty;
    }
    alert(`Rice: ${currentOrder['rice']} cups`);
    riceInput.value = 0;
  } else {
    alert("Please enter a valid rice quantity.");
  }
});

newOrderBtn.addEventListener('click', resetOrder);
deleteOrderBtn.addEventListener('click', deleteOrder);
checkoutBtn.addEventListener('click', checkout);
viewTransactionBtn.addEventListener('click', viewTransaction);
historyBtn.addEventListener('click', viewHistory);