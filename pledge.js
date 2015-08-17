/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:

function $Promise(){
  this.state = "pending";
  this.handlerGroups   = [];
  this.next = null;

}



function Deferral(){
  this.$promise = new $Promise();
}

function defer(){
  return new Deferral();
}

Deferral.prototype.resolve = function(somedata){
  if(this.$promise.state === "pending")
  {
    this.$promise.state = "resolved";
    this.$promise.value = somedata;
    this.$promise.callHandlers();
  }
};

Deferral.prototype.reject = function(somedata){
  if(this.$promise.state === "pending"){
    this.$promise.state = "rejected";
    this.$promise.value = somedata;
    this.$promise.callHandlers();
  }
};

function isFunction(func){
    if(typeof func === 'function') return func;
    else return null;
}

$Promise.prototype.then = function(succesCb, errorCb) {
  var test1 = isFunction(succesCb);
  var test2 = isFunction(errorCb);
  this.handlerGroups.push({'successCb': test1, 'errorCb': test2, 'forwarder': new Deferral()});
  var saved = this.handlerGroups[this.handlerGroups.length-1].forwarder.$promise;
  this.callHandlers();
  return saved;
};

$Promise.prototype.callHandlers = function() {
  if(this.state === "pending") return;
  while(this.handlerGroups.length > 0){
    var func = this.handlerGroups.shift();
    if(this.state === "resolved" && func.successCb !== null){
    try
      {
        var currentValue = func.successCb(this.value);
        if (currentValue.constructor === $Promise)
        {
          currentValue.then
          (
            function(value)
            {
              func.forwarder.resolve(value);
            },
            function(reason)
            {
              func.forwarder.reject(reason);
            }
          )
        }else
        {
          func.forwarder.resolve(currentValue);
        }
      }
    catch(e)
    {
        func.forwarder.reject(e);
    }
    }else if(this.state === "resolved" && func.successCb === null){
      func.forwarder.resolve(this.value);
    }else if(this.state === "rejected" && func.errorCb !== null){
      try
        {
          var currentValue = func.errorCb(this.value);
          if (currentValue.constructor === $Promise)
          {
            currentValue.then
            (
              function(value)
              {
                func.forwarder.resolve(value);
              },
              function(reason)
              {
                func.forwarder.reject(reason);
              }
            )
          }else
          {
            func.forwarder.resolve(currentValue);
          }
        }
      catch(e) {
        func.forwarder.reject(e);
      }
    }else if(this.state === "rejected" && func.errorCb === null){
      func.forwarder.reject(this.value);
    }
  }
};

$Promise.prototype.catch = function(errorCb){
  return this.then(null,errorCb)
};















/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = {
  defer: defer,
};

So in a Node-based project we could write things like this:

var pledge = require('pledge');
…
var myDeferral = pledge.defer();
var myPromise1 = myDeferral.$promise;
--------------------------------------------------------*/
