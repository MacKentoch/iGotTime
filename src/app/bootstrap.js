import mainModule from './main.module';

angular.element(document).ready(function() {
  /**
   * working with bundles sfx only
   */
  angular.bootstrap(document, [mainModule.name], { strictDi: true });
  //angular.bootstrap(document, [mainModule.name]);
});