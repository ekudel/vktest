var autoUpdateEnabled = true;
var autoUpdateCanceled = false;

function cancelOrder(orderId, orderBlock, link) {
  var errorPlaceholder = link.prevAll('.error-placeholder');
  link.before('<div class="progress"></div>');
  var progress = initProgress(link.prev());

  ajaxCancelOrder(orderId, function () {
    progress.remove();
    removeOrderBlock(orderBlock, orderId);
    reload(false, 1);
  }, function (errorMessage, errorCode) {
    progress.remove();

    if (errorCode == ERROR_CODE_NO_OBJECT) {
      errorMessage = msg('already.executed.error');
    }
    errorPlaceholder.show();
    errorPlaceholder.text(errorMessage);
  });
}

function validateNewOrderForm() {
  var description = $('#new-order-description');
  var result = true;

  if (!description.val().trim()) {
    var descriptionErrorPlaceholder = description.next('.error-placeholder');
    descriptionErrorPlaceholder.text(msg('no.description'));
    descriptionErrorPlaceholder.show();
    result = false;
  }
  var price = $('#new-order-price');
  var priceErrorPlaceholder = price.next('.error-placeholder');

  if (!price.val()) {
    priceErrorPlaceholder.text(msg('no.price'));
    priceErrorPlaceholder.show();
    return false;
  }
  var floatPrice = parseFloat(price.val());
  var decPrice = isNaN(floatPrice) ? '' : floatPrice.toFixed(2);

  if (decPrice.indexOf(price.val()) != 0) {
    priceErrorPlaceholder.text(msg('price.must.be.number'));
    priceErrorPlaceholder.show();
    return false;
  }
  if (decPrice.indexOf('0') == 0) {
    priceErrorPlaceholder.text(msg('min.price.error') + ' 1 ' + msg('currency'));
    priceErrorPlaceholder.show();
    return false;
  }
  return result;
}

function scheduleCheckingUpdatesForCustomer() {
  setTimeout(function () {
    if (viewMode != 'done' || !autoUpdateEnabled) {
      scheduleCheckingUpdatesForCustomer();
      return;
    }
    autoUpdateCanceled = false;
    var params = buildParamsNewerThanFirstOrder('done_time');
    params['done'] = 1;

    ajaxGetMyOrders(params, function (response) {
      if (!autoUpdateCanceled) {
        prependLoadedOrdersToFeed(response);
      }
      scheduleCheckingUpdatesForCustomer();
    }, function (errorMessage) {
      if (!autoUpdateCanceled) {
        $('#main-error-placeholder').text(errorMessage);
      }
      scheduleCheckingUpdatesForCustomer();
    });
  }, 5000);
}

function createOrder(button) {
  var form = button.parents('form');
  button.before('<div class="progress"></div>');
  var progress = initProgress(button.prev());

  ajaxSubmitForm(AJAX_CREATE_ORDER, form, function (response) {
    progress.remove();
    $('#new-order-form').parent().hide();
    clearNewOrderFields();

    if (viewMode == 'waiting') {
      prependOrdersToFeed([response['order']]);
    } else {
      chooseViewMode('waiting', true);
    }
  }, function (errorMessage) {
    progress.remove();
    var errorPlaceholder = $('#new-order-error-placeholder');
    errorPlaceholder.show();
    errorPlaceholder.text(errorMessage);
  });
}

function clearNewOrderFields() {
  $('#new-order-description').val('');
  $('#new-order-price').val('');
}

buildOrderBlockInFeed = function (data) {
  var doneTime = data['done_time'];
  var addToBottomPanel = '';

  if (!doneTime) {
    var cancelButton =
      '<input class="button cancel-order-button" type="button" ' +
      'data-order-id="' + data['order_id'] + '" ' +
      'value="' + msg('cancel.order') + '"/>';
    addToBottomPanel = '<div class="action-panel""><span class="error-placeholder"></span>' +
    cancelButton + '</div>';
  }
  return buildBaseOrderBlock(data, false, true, addToBottomPanel);
};

reload = function (reload, count, errorPlaceholder, runAfter) {
  if (reload) {
    autoUpdateEnabled = false;
    autoUpdateCanceled = true;
    removeAllFromFeed();
  }
  var done = viewMode == 'done' ? 1 : 0;
  var params = buildParamsOlderThanLastOrder(done ? 'done_time' : 'time');
  params['done'] = done;

  if (count) {
    params['count'] = count;
  }
  ajaxGetMyOrders(params, function (response) {
    appendLoadedOrdersToFeed(response);

    if (runAfter) {
      runAfter();
    }
    if (reload) {
      autoUpdateEnabled = true;
      updateRefreshWaitingOrdersButton();
    }
  }, function (errorMessage) {
    if (!errorPlaceholder) {
      errorPlaceholder = $('#main-error-placeholder');
    }
    errorPlaceholder.text(errorMessage);
    errorPlaceholder.show();

    if (runAfter) {
      runAfter();
    }
  });
};

function updateRefreshWaitingOrdersButton() {
  if (viewMode == 'waiting') {
    $('#refresh-waiting-orders').show();
  } else {
    $('#refresh-waiting-orders').hide();
  }
}

$(document).ready(function () {
  var viewModeButtons = init('waiting');

  viewModeButtons.click(function () {
    $('#refresh-waiting-orders').hide();
  });

  $('#refresh-waiting-orders').click(function (e) {
    e.preventDefault();
    $(this).after('<div class="progress"></div>');
    var progress = initProgress($(this).next());

    reload(true, null, null, function() {
      progress.remove();
    });
  });

  $('#orders').on('click', '.cancel-order-button', function (e) {
    e.preventDefault();
    clearErrors();
    var link = $(this);
    cancelOrder(link.data('order-id'), link.parents('.order'), link);
  });

  $('#new-order-button').click(function (e) {
    e.preventDefault();
    $('#new-order-form').parent().slideDown('fast');
    clearErrors();
  });
  $('#new-order-cancel').click(function () {
    $('#new-order-form').parent().slideUp('fast');
    clearNewOrderFields();
    clearErrors();
  });
  $('#new-order-ok').click(function (e) {
    e.preventDefault();
    clearErrors();

    if (validateNewOrderForm()) {
      createOrder($(this));
    }
  });
  scheduleCheckingUpdatesForCustomer();
});