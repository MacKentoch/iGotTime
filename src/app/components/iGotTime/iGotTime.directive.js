import iGotTimeController from './iGotTime.controller';
import iGotTimeTemplate   from "./iGotTimeTemplate.html!text";

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
    
    scope.style = {};
    
    angular.extend(scope.style, {
      fontSize: `font-size:${scope.iGotTimeCtrl.currentFontSize};`,
      
    });

    
      
    console.info('from directive, font size is : ' + scope.iGotTimeCtrl.currentFontSize);
    
    
    
    const MESSAGE = `don't tap this timer, it is delicate!`;  
    element.on('click', () => console.log(MESSAGE));      
  }
  
}


iGotTimeDirective.$inject = [];

export default iGotTimeDirective;