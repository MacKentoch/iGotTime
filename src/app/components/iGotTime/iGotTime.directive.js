import iGotTimeController from './iGotTime.controller';
import iGotTimeTemplate from "./iGotTimeTemplate.html!text";

function iGotTimeDirective() {
  let directive =  {
    restrict: "E",
    scope: {},
    template: iGotTimeTemplate,
    bindToController: true,
    controllerAs: "iGotTimeCtrl",
    controller: iGotTimeController,
    link : linkfct
  };
  return directive;
  
  function linkfct(scope, element, attrs, ctrl, transclude){
    const MESSAGE = `don't tap this timer, it is delicate!`;  
    element.on('click', () => console.log(MESSAGE));      
  }
  
}


iGotTimeDirective.$inject = [];

export default iGotTimeDirective;