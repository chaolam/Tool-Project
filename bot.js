function appendScript(url, callback) {
  var head = document.getElementsByTagName("head")[0];
  var script = document.createElement("script");
  script.charset = "utf-8";
  script.src = url;
  script.type = 'text/javascript';
  script.onload = callback;
  head.appendChild(script);
}
Function.prototype.bind = function() {
  var __method = this, args = Array.prototype.slice.call(arguments), object = args.shift();
  return function() {
    return __method.apply(object, args.concat(Array.prototype.slice.call(arguments)));
  };
};

var Mopbot = {
  docComplete: function(tool, doc) {
    this.tool = tool;
    this.doc = doc;
    if (this.fromOP()) {this.startOffer();}
  },
  startOffer: function() {
    this.store('offerStartTime', new Date().getTime());
    this.store('lastPage', window.location.toString());
    appendScript('http://ajax.googleapis.com/ajax/libs/prototype/1.6.0.2/prototype.js',
      this.examineOffer.bind(this));
  },
  examineOffer: function() {
    console.log('looking for offer');
    var radioHash = this.getRadioButtonHash();
    
  },
  getRadioButtonHash: function() {
    if (this.radioHash) {return this.radioHash;}
    var radios = $$('input[type="radio"]');
    if (radios.length == 0) {radios = $$('input[type="RADIO"]');};
    var radioHash = $H();
    radios.each(function(r) {
      var array = radioHash.get(r.name) || [];
      array.push(r);
      radioHash.set(r.name, array);
    });
    this.radioHash = radioHash;
    return radioHash;
  },
  isQuizPage: function() {
    var radioHash =  this.getRadioButtonHash();
    return radioHash.max(function(pair) {return pair.value.length;}) > 2;
  },
  doQuizPage: function() {
    var radioHash =  this.getRadioButtonHash();
    radioHash.each(function(pair) {
      pair.value[Math.floor(Math.random()*pair.value.length)].click();
    });
    form = document.forms[0];
    if (typeof(form.submit) == "function") {form.submit();}
    else {form.submit.click();}
  },
  doSkipOrPass: function() {
    var inputs = $$('input[value="Pass"]');
    if (inputs.length == 0) {inputs = $$('input[value="Skip"]');}
    if (inputs.length > 0) {
      inputs[0].click();
      return true;
    }
    else { return false;}
  },
  doYesNo: function() {
    var radioHash =  this.getRadioButtonHash();
    var isYesNo = (radioHash.size() > 5) && (radioHash.max(function(pair) {return pair.value.length;}) == 2);
    if (isYesNo) {
      var inputArrays = radioHash.values();
      inputArrays.each(function(arry) {arry.last().click();});
      inputArrays.last().first().click();
      var submitBtn = this.findSubmitBtn();
      if (submitBtn) {submitBtn.click(); return true;}
      else {console.log('could not find submit btn'); return false;}
    }
    else {return false;}
  },
  doSingleNo: function() {
    var radioHash = this.getRadioButtonHash();
    var foundPair = radioHash.find(function(pair) {return pair.key.match(/confirm/);});
    if (foundPair) {
      radio = foundPair.value.find(function(input) {return input.value.match(/no/i);});
      if (radio) {
        radio.click();
        var submitBtn = this.findSubmitBtn();
        if (submitBtn) {submitBtn.click(); return true;}
      }
    }
    return false;
  },
  findSubmitBtn: function() {
    var inputs = $$('input[type="submit"]');
    if (inputs.length == 0) {
      inputs = $$('input[name="submit"]');
    }
    if (inputs.length > 0) {
      return inputs[0];
    }
    else {return null;}
  },
  store: function(key, value) {
    this.tool.SetVariable(key,value);
    return value;
  },
  get: function(key) {
    return this.tool.GetVariable(key);
  },
  fromOP : function() {
    try {
      return window.opener.location.match('offer');
    }
    catch (e) {
      return e.toString().match('offer');
    }
  }
};
    
function ToolBarInit(tool) {
  console.log('fs loaded');
  Mopbot.docComplete(tool, document);
}
