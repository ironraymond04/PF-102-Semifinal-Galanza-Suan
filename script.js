let selectedPaymentType = null;

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
  showModal(`
    <h3>Add ${item.replace(/-/g, " ")} to Order</h3>
    <p>Enter Quantity:</p>
    <input id="qty-input" type="number" min="1" value="1" style="width: 60px; padding: 5px;" />
    <br><br>
    <button onclick="confirmAddItem('${item}')">Confirm</button>
    <button onclick="closeModal()">Cancel</button>
  `);
}

function confirmAddItem(item) {
  const qty = parseInt(document.getElementById("qty-input").value);
  if (!isNaN(qty) && qty > 0) {
    if (currentOrder[item]) {
      currentOrder[item] += qty;
    } else {
      currentOrder[item] = qty;
    }
    alert(`${item.replace(/-/g, " ")}: ${currentOrder[item]} pcs`);
    closeModal();
  } else {
    alert("Please enter a valid quantity.");
  }
}

function resetOrder() {
  showModal(`
    <h3>Start New Order?</h3>
    <p>This will clear the current order.</p>
    <button onclick="confirmNewOrder(true)">Yes</button>
    <button onclick="closeModal()">No</button>
  `);
}

function confirmNewOrder(confirmed) {
  if (confirmed) {
    currentOrder = {};
    updateScreen('0');
    numpadInput = '';
    waitingForPayment = false;
    alert("New order started!");
  }
  closeModal();
}

function deleteOrder() {
  showModal(`
    <h3>Delete Current Order?</h3>
    <button onclick="confirmDeleteOrder(true)">Yes</button>
    <button onclick="closeModal()">No</button>
  `);
}

function confirmDeleteOrder(confirmed) {
  if (confirmed) {
    currentOrder = {};
    updateScreen('0');
    numpadInput = '';
    waitingForPayment = false;
    alert("Order deleted.");
  }
  closeModal();
}

function calculateTotal(order) {
  let total = 0;
  for (let item in order) {
    total += (prices[item] * order[item]);
  }
  return total;
}

function viewTransaction() {
  if (Object.keys(currentOrder).length === 0) {
    showModal(`<p>No active order.</p>`);
    return;
  }

  let details = "<h3>Current Order</h3><div style='text-align:left;'>";
  for (let item in currentOrder) {
    details += `${item.replace(/-/g, " ")}: ${currentOrder[item]} pcs (₱${prices[item]} each)<br>`;
  }
  details += `Total: ₱${calculateTotal(currentOrder)}</div>`;
  showModal(details);
}

function viewHistory() {
  if (history.length === 0) {
    showModal(`<p>No order history yet.</p>`);
    return;
  }
  let message = "<h3>Order History</h3><div style='text-align:left;'>";
  history.forEach((order, index) => {
    message += `<strong>Order #${index + 1}</strong><br>`;
    for (let item in order) {
      if (item !== 'total' && item !== 'paid' && item !== 'change') {
        message += `- ${item.replace(/-/g, " ")}: ${order[item]} pcs<br>`;
      }
    }
    message += `Total: ₱${order.total}<br>Paid: ₱${order.paid}<br>Change: ₱${order.change}<br><br>`;
  });
  message += "</div>";
  showModal(message);
}

keypadButtons.forEach(btn => {
  btn.addEventListener('click', function () {
    if (!waitingForPayment) return;

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
  button.addEventListener('click', () => addItem(button.id));
});

addRiceBtn.addEventListener('click', () => {
  let qty = parseInt(riceInput.value);
  if (qty > 0) {
    currentOrder['rice'] = (currentOrder['rice'] || 0) + qty;
    alert(`Rice: ${currentOrder['rice']} cups`);
    riceInput.value = 0;
  } else {
    alert("Please enter a valid rice quantity.");
  }
});

newOrderBtn.addEventListener('click', resetOrder);
deleteOrderBtn.addEventListener('click', deleteOrder);
checkoutBtn.addEventListener('click', () => {
  totalAmount = calculateTotal(currentOrder);
  if (totalAmount === 0) {
    showModal(`<p>No items to checkout.</p>`);
    return;
  }

  showModal(`
    <h3>Total: ₱${totalAmount}</h3>
    <p>Select Payment Type:</p>
    <button id="pay-cash">Cash</button>
    <button id="pay-credit">Credit</button>
    <p>Use the numpad to enter payment and press ENTER.</p>
  `);
});

viewTransactionBtn.addEventListener('click', viewTransaction);
historyBtn.addEventListener('click', viewHistory);

// Modal Handlers
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

modalClose.addEventListener('click', closeModal);
window.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

function showModal(contentHTML) {
  modalBody.innerHTML = contentHTML;
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
}

// Handle dynamic buttons inside modal
modal.addEventListener('click', (e) => {
  if (e.target.id === 'pay-cash') {
    selectedPaymentType = 'cash';
    closeModal();
    waitingForPayment = true;
    updateScreen('0');
    numpadInput = '';
  }

  if (e.target.id === 'pay-credit') {
    selectedPaymentType = 'credit';
    modalBody.innerHTML = `
      <h3>Enter Account No.</h3>
      <input type="text" id="account-no" style="padding: 5px;" />
      <br><br>
      <button id="confirm-credit">Proceed to Checkout</button>
      <button onclick="closeModal()">Cancel</button>
    `;
  }

  if (e.target.id === 'confirm-credit') {
    const acc = document.getElementById('account-no').value.trim();
    if (acc === "") {
      alert("Please enter account number.");
    } else {
      closeModal();
      waitingForPayment = true;
      updateScreen('0');
      numpadInput = '';
    }
  }
});

// Show Welcome Modal on Load
window.onload = function () {
  showModal(`
    <h2>Welcome to Kapamilya Eatery!</h2>
    <p>Click below to begin.</p>
    <button onclick="closeModal()">Begin</button>
  `);
};