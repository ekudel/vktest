const AJAX_REGISTER = 'ajax/register.php';
const AJAX_LOGIN = 'ajax/login.php';
const AJAX_CREATE_ORDER = 'ajax/create_order.php';

function handleSuccessResponse(response, successCallback, errorCallback) {
  var errorMessage = response['error_message'];

  if (errorMessage) {
    errorCallback(errorMessage);
  } else {
    successCallback(response);
  }
}

function handleErrorResponse(xhr, error, errorCallback) {
  errorCallback(msg('internal.error'));
  var responseTest = xhr['responseText'];

  if (responseTest) {
    console.error(responseTest);
  }
  console.error(error);
}

/**
 * Params:
 *   done,
 *   since_time, since_customer_id, since_order_id,
 *   until_time, until_customer_id, until_order_id
 */
function ajaxGetMyOrders(params, successCallback, errorCallback) {
  var paramsStr = buildParamsStr(params);

  $.ajax({
    url: 'ajax/get_my_orders.php' + paramsStr,
    type: "GET",
    dataType: "json",
    success: function (response) {
      handleSuccessResponse(response, successCallback, errorCallback);
    },
    error: function (xhr, status, error) {
      handleErrorResponse(xhr, error, errorCallback);
    }
  });
}

/**
 * Params:
 *   since_time, since_customer_id, since_order_id,
 *   until_time, until_customer_id, until_order_id
 */
function ajaxGetWaitingOrders(params, successCallback, errorCallback) {
  var paramsStr = buildParamsStr(params);

  $.ajax({
    url: 'ajax/get_waiting_orders.php' + paramsStr,
    type: "GET",
    dataType: "json",
    success: function (response) {
      handleSuccessResponse(response, successCallback, errorCallback);
    },
    error: function (xhr, status, error) {
      handleErrorResponse(xhr, error, errorCallback);
    }
  });
}

function ajaxCancelOrder(orderId, successCallback, errorCallback) {
  $.ajax({
    url: 'ajax/cancel_order.php',
    type: "POST",
    dataType: "json",
    data: {
      'order_id': orderId
    },
    success: function (response) {
      handleSuccessResponse(response, successCallback, errorCallback);
    },
    error: function (xhr, status, error) {
      handleErrorResponse(xhr, error, errorCallback);
    }
  });
}

function ajaxExecuteOrder(orderId, customerId, successCallback, errorCallback) {
  $.ajax({
    url: 'ajax/execute_order.php',
    type: "POST",
    dataType: "json",
    data: {
      'order_id': orderId,
      'customer_id': customerId
    },
    success: function (response) {
      handleSuccessResponse(response, successCallback, errorCallback);
    },
    error: function (xhr, status, error) {
      handleErrorResponse(xhr, error, errorCallback);
    }
  });
}

function ajaxSubmitForm(url, form, successCallback, errorCallback) {
  $.ajax({
    url: url,
    type: "POST",
    dataType: "json",
    data: form.serialize(),
    success: function (response) {
      handleSuccessResponse(response, successCallback, errorCallback);
    },
    error: function (xhr, status, error) {
      handleErrorResponse(xhr, error, errorCallback);
    }
  });
}