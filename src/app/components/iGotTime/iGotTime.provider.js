
function iGotTimeConfigProviderFct() {
	
	let _customization 	= initCustomization();
	
	this.getFontSize 		= getFontSizeFct;
	this.setFontSize 		= setFontSizeFct;
	/* jshint validthis:true */
	this.$get 					= iGotTimeConfig;	
	
	
	
	function initCustomization(){
		let _defaultConfig = {
			fontSize : `12px`
		}
		return _defaultConfig;
	} 



	function getFontSizeFct(){
		return _customization.fontSize;
	}
	
	function setFontSizeFct(fontSize){
		_customization.fontSize = fontSize; 
	}
	
	
	//$get injection here
	iGotTimeConfig.$inject = [];
	function iGotTimeConfig() {
		
		let service = {
			getFontSize : getFontSizeFct,
			setFontSize : setFontSizeFct
		};
		return service;
		
		
		function getFontSizeFct(){
			let actualFontSize = angular.copy(_customization.fontSize);
			return actualFontSize;
		}
		
		function setFontSizeFct(fontSize){
			_customization.fontSize = fontSize; 
		}
		
		
	}
	
}

iGotTimeConfigProviderFct.$inject = [];
export default iGotTimeConfigProviderFct;