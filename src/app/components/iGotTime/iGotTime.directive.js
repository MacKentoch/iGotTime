import iGotTimeController from './iGotTime.controller';
import iGotTimeTemplate   from './iGotTimeTemplate.html!text';
import {iGotTimeTimerCss} from './iGotTimeTemplateCss';

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
    
    scope.customization = {}; //customization object
    
    angular.extend(scope.customization, {
      style : {
        fontSize: `font-size:${scope.iGotTimeCtrl.currentFontSize};`,  
      },
      cssClass : {
        iGotTimeTimerClass : iGotTimeTimerCss
      }
    });

    
      
    console.info('from directive, font size is : ' + scope.iGotTimeCtrl.currentFontSize);
    
    
    
    const MESSAGE = `don't tap this timer, it is delicate!`;  
    element.on('click', () => console.log(MESSAGE));      
  }
  
}


iGotTimeDirective.$inject = [];

export default iGotTimeDirective;