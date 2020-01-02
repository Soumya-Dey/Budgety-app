// BUDGET CONTROLLER
var budgetController = (function () {
  var Expense = function (id, description, amount) {
    this.id = id;
    this.description = description;
    this.amount = amount;
  };

  var Income = function (id, description, amount) {
    this.id = id;
    this.description = description;
    this.amount = amount;
  };

  var calculateTotal = function (type) {
    var sum = 0.0;
    data.items[type].forEach(curr => {
      sum += curr.amount;
    });

    data.totals[type] = sum;
  };

  var data = {
    items: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function (type, des, amnt) {
      var newItem;
      var ID =
        data.items[type].length > 0
          ? data.items[type][data.items[type].length - 1].id + 1
          : 0;

      // creating a new item based on the type
      if (type === "exp") newItem = new Expense(ID, des, amnt);
      else if (type === "inc") newItem = new Income(ID, des, amnt);

      // pushing the new item to the respective array
      data.items[type].push(newItem);

      return newItem;
    },

    deleteItem: function (type, id) {
      var idArr = data.items[type].map(function (current) {
        return current.id; // returns a array with ids of every element
      });

      var index = idArr.indexOf(id); // index of the id of the element to delete

      if (index !== -1) {
        data.items[type].splice(index, 1);
        // first arg: index to start deleting
        // second arg: how many items to delete
      }
    },

    calculateBudget: function () {
      // calculate the totals of exp and inc
      calculateTotal("inc");
      calculateTotal("exp");

      // calculate the budget
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage
      data.percentage =
        data.totals.inc > 0
          ? Math.round((data.totals.exp / data.totals.inc) * 100)
          : -1;
    },

    getBudget: function () {
      return {
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        budget: data.budget,
        percentage: data.percentage
      };
    },

    // for testing purposes. Don't need it in the final project
    test: function () {
      console.log(data);
    }
  };
})();

// UI CONTROLLER
var uiController = (function () {
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

  return {
    getDOMstrings: function () {
      return DOMstrings;
    },

    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // will be wither inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        amount: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function (itemObj, type) {
      var html, element;

      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %amount%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %amount%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      html = html.replace("%id%", itemObj.id);
      html = html.replace("%description%", itemObj.description);
      html = html.replace("%amount%", itemObj.amount);

      document.querySelector(element).insertAdjacentHTML("beforeend", html);
      // for more info about insertAdjacentHTML -> https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
    },

    deleteListItem: function(itemDOMId){
      var DOMElement = document.getElementById(itemDOMId);

      DOMElement.parentNode.removeChild(DOMElement);
    },

    clearFields: function () {
      document.querySelector(DOMstrings.inputDescription).value = "";
      document.querySelector(DOMstrings.inputValue).value = "";
      document.querySelector(DOMstrings.inputDescription).focus();
    },

    displayBudget: function (budgetObj) {
      document.querySelector(DOMstrings.budgetLabel).textContent =
        budgetObj.budget >= 0 ? "+ " + budgetObj.budget : budgetObj.budget;

      document.querySelector(DOMstrings.incomeLabel).textContent =
        budgetObj.totalInc >= 0
          ? "+ " + budgetObj.totalInc
          : budgetObj.totalInc;

      document.querySelector(DOMstrings.expensesLabel).textContent =
        budgetObj.totalExp >= 0
          ? "- " + budgetObj.totalExp
          : budgetObj.totalExp;

      document.querySelector(DOMstrings.percentageLabel).textContent =
        budgetObj.percentage > 0 ? budgetObj.percentage + " %" : "--";
    }
  };
})();

// GLOBAL APP CONTROLLER
var controller = (function (budgtCtrl, uiCtrl) {
  var setupEventListener = function () {
    document
      .querySelector(uiCtrl.getDOMstrings().inputBtn)
      .addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (e) {
      if (e.keyCode === 13 || e.which === 13) ctrlAddItem();
    });

    document
      .querySelector(uiCtrl.getDOMstrings().container)
      .addEventListener("click", ctrlDeleteItem);
  };

  var updateBudget = function () {
    // Calculate and return budget
    budgetController.calculateBudget();
    var budget = budgetController.getBudget();

    // show in ui
    uiCtrl.displayBudget(budget);
  };

  var ctrlAddItem = function () {
    var input = uiCtrl.getInput();

    if (input.description != "" && input.amount > 0 && !isNaN(input.amount)) {
      // add item to budget controller
      var newItem = budgtCtrl.addItem(
        input.type,
        input.description,
        input.amount
      );

      // add item to ui and clear the input fields
      uiController.addListItem(newItem, input.type);
      uiController.clearFields();

      // Calculate and update budget
      updateBudget();
    }
  };

  var ctrlDeleteItem = function (event) {
    var itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemId) {
      var splitId = itemId.split("-"); // splits inc-1 to inc, 1

      // delete the item from data structure
      budgtCtrl.deleteItem(splitId[0], parseInt(splitId[1]));

      // delete the item from ui
      uiCtrl.deleteListItem(itemId);

      // calculate new budget and show it
      updateBudget();
    }
  };

  return {
    init: function () {
      setupEventListener();
      uiCtrl.displayBudget({
        totalInc: "no incomes",
        totalExp: "no expenses",
        budget: "+ 0,000.00",
        percentage: -1
      });
    }
  };
})(budgetController, uiController);

controller.init();
