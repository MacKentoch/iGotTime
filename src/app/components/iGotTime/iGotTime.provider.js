
function iGotTimeConfigProviderFct() {
	
	this.customization 	= customizationFct;
	this.setFontSize 		= setFontSizeFct;
	/* jshint validthis:true */
	this.$get = iGotTimeConfig;	
	
	
	
	function customizationFct(){
		return 	() => {
			let _defaultConfig = {
			fontSize : `12px`
			}
			return _defaultConfig;
		}
	} 

	function setFontSizeFct(fontSize){
		return (fontSize) => this.customization.fontSize = fontSize; 
	}
	
	
	//$get injection here
	iGotTimeConfig.$inject = [];
	function iGotTimeConfig() {
		
		let service = {
			getFontSize : getFontSizeFct,
			setFontSize : setFontSizefct
		};
		return service;
		
		
		function getFontSizeFct(){
			return () => {
				let actualFontSize = angular.copy(this.customization.fontSize);
				return actualFontSize;
			}
		}
		
		function setFontSizefct(fontSize){
			return (fontSize) => this.setFontSize(fontSize)
		}
		
		
		
	}
	
}

iGotTimeConfigProviderFct.$inject = [];
export default iGotTimeConfigProviderFct;