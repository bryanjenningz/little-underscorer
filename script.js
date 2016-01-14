$(function() {
  var keys = {
    '13': 'enter',
    '17': 'control'
  };

  var downKeys = {};

  var tests = {
    each: [
      function(each) {
        var total = 0;
        each([1, 2, 3, 4], (value) => { total += value; });
        return total;
      }
    ],
    map: [
      function(map) {
        return map([1, 2, 3, 4], (value) => value * value);
      }
    ],
    filter: [
      function(filter) {
        return map([1, 2, 3, 4], (value) => value > 2);
      }
    ]
  }

  var state = {
    code: $('#terminal').val(),
    level: 0,
    funcNames: ['each', 'map', 'filter', 'reduce', 'reduceRight', 'find'],
    funcName: 'each',
    error: false,
  };

  var terminal = $('#terminal');
  var errorDiv = $('.error');

  terminal.keydown(watchControl);
  terminal.keydown(update);

  function watchControl(event) {
    if (keys[event.keyCode] === 'control') {
      downKeys[event.keyCode] = true;

      terminal.keyup(function(event) {
        if (downKeys[event.keyCode]) {
          delete downKeys[event.keyCode];
          terminal.off('keyup');
        }
      });
    }
  }

  function update(event) {
    if (downKeys['17'] && keys[event.keyCode] === 'enter') {
      render(changeState(passesTests(extract(terminal.val()))));
    }
  }

  // Extracts the user-defined function from the terminal code
  function extract(code) {
    // Assumes that the user didn't alter the initial parameters
    var args = code.split('\n')[0].match(/\(([^)]+)\)/)[1].split(', ');

    // Assumes that there is nothing important on the first or last lines (just parameters and brackets)
    var body = code.trim().split('\n').slice(1, -1).join('');

    // Oh JavaScript...
    var func = args.length === 0 ? new Function(body) :
               args.length === 1 ? new Function(args[0], body) :
               args.length === 2 ? new Function(args[0], args[1], body) :
               args.length === 3 ? new Function(args[0], args[1], args[2], body) :
               args.length === 4 ? new Function(args[0], args[1], args[2], args[3], body) : null;

    return func;
  }

  function passesTests(func) {
    var underscoreFunc = _[state.funcName];
    var underscoreTests = tests[state.funcName];

    return _.every(underscoreTests, function(test) {
      return _.isEqual(test(underscoreFunc), test(func));
    });
  }

  function changeState(isPassing) {
    if (isPassing) {
      state.level++;
      state.funcName = state.funcNames[state.level];
      state.error = false;
    } else {
      state.error = true;
    }
    state.code = terminal.val();
    return state;
  }

  function render(state) {
    errorDiv.prop('hidden', !state.error);
  }
});
