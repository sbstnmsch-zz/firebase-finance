(function(ctx) {
  var config = {
        appId: 'beerCount',
        databaseURL: "https://fir-finance-github.firebaseio.com"
      };
  var uid = ctx.localStorage.getItem(config.appId) ||
    (Date.now() + location.search.replace(/[^a-z]/ig, '-'));

  ctx.localStorage.setItem(config.appId, uid);

  app = firebase.initializeApp(config);

  // Expire all data older than 30 days
  app.database()
    .ref(uid)
    .orderByChild('timestamp')
    .endAt(Date.now() - 30 *24 * 60 * 60000) // 30 days expiry
    .limitToLast(1)
    .on('child_added', function(snapshot) {
      snapshot.ref.remove();
    });

  // Update statistics
  app.database()
    .ref(uid)
    .on('value', function(snapshot) {
      var data = snapshot.val();
      var expenses = {};
      for (var i in data) {
        if (!expenses[data[i].account]) {
          expenses[data[i].account] = 0;
        }
        expenses[data[i].account] += data[i].expense;
      }
      var summary = document.querySelector('.summary');
      var fragment = document.createDocumentFragment();
      var sorted = Object.keys(expenses).sort(function(a,b) {return expenses[b] - expenses[a];});
      for (var i in sorted) {
        var item = document.createElement('div');
        var itemExpense = document.createElement('span');
        var itemAccount = document.createElement('span');
        item.className = 'summary-item';
        itemExpense.className = 'summary-item-expense';
        itemExpense.textContent = Math.round(expenses[sorted[i]]);
        itemAccount.className = 'summary-item-account';
        itemAccount.textContent = sorted[i];
        item.appendChild(itemExpense);
        item.appendChild(itemAccount);
        fragment.appendChild(item);
      }
      if (!sorted.length) {
        var empty = document.createElement('div');
        empty.textContent = 'You have no expenses... lucky you!';
        fragment.appendChild(empty);
      }
      summary.innerHTML = '';
      summary.appendChild(fragment);
    });

  // Hacky way of binding onclick events to every account category button
  [].forEach.call(document.querySelectorAll('.button-account'), function(div) {
    div.onclick = function() { ctx.route({ account: div.innerText }); };
  });
  // Bind onclick to summary buttons
  [].forEach.call(document.querySelectorAll('.button-summary'), function(div) {
    div.onclick = function() { ctx.route({ state: 'summary' }); };
  });
  // Bind reset onclick to cancel buttons
  [].forEach.call(document.querySelectorAll('.button-cancel'), function(div) {
    div.onclick = function() { ctx.route(); };
  });
  // Bind submit button
  document.querySelector('.button-submit').onclick = function() {
    route({ expense: document.getElementById('expense').value });
  };

  ctx.route = function(payload) {
    if (!payload) {
      // If no payload given assume reset
      ctx.store = {};
      route({});
    } else {
      var
        accountPane = document.querySelector('.pane-account'),
        summaryPane = document.querySelector('.pane-summary'),
        expensePane = document.querySelector('.pane-expense');

      ctx.store = Object.assign(ctx.store, payload);

      if (ctx.store.state === 'expense') {
        // Account data
        var expense = parseFloat(ctx.store.expense.replace(/,/, '.'));

        if (isNaN(expense)) {
          alert('Expense is not a number');
        } else {
          app.database().ref(uid).push(
            {
              timestamp: Date.now(),
              account: '#' + store.account,
              expense: expense || 0
            },
            function() { ctx.route(); }
          );
        }
      } else
      if (ctx.store.state === 'account') {
        ctx.store.state = 'expense';
        accountPane.style.display = 'none';
        summaryPane.style.display = 'none';
        expensePane.style.display = 'block';
        document.getElementById('expense').value = '';
        document.getElementById('expense').focus();
      } else
      if (ctx.store.state === 'summary') {
        accountPane.style.display = 'none';
        summaryPane.style.display = 'block';
        expensePane.style.display = 'none';
      } else {
        ctx.store.state = 'account' ;
        expensePane.style.display = 'none';
        summaryPane.style.display = 'none';
        accountPane.style.display = 'block';
      }
    }
  }

  ctx.onload = function() { route(); };
})(window);
