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
  
  function linkfct(){
    return (scope, element, attrs, ctrl, transclude) => {
      element.on('click', function(){
        console.log(`don't tap this timer, it is delicate!`);
      });      
    }
  }
  
}


iGotTimeDirective.$inject = [];

export default iGotTimeDirective;