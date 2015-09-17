import {DEFAULT_SIZE_UNIT, DEFAULT_FONT_SIZE, applyFontSize} from './iGotTime.provider.helpers';

function iGotTimeConfigProviderFct() {


	let _defaultConfig = {
		fontSize : applyFontSize(DEFAULT_FONT_SIZE, DEFAULT_SIZE_UNIT)
	}	
	let _customization 	= initCustomization();
	
	
	this.getFontSize 		= getFontSizeFct;
	this.setFontSize 		= setFontSizeFct;
	/* jshint validthis:true */
	this.$get 					= iGotTimeConfig;	
	
	
	/**
	 * applies default config to customization
	 */
	function initCustomization(){
		return angular.copy(_defaultConfig);
	} 

	function getFontSizeFct(){
		return _customization.fontSize;
	}
	
	function setFontSizeFct(targetFontSize, targetFontSizeUnit){
		console.warn(`applyFontSize(targetFontSize, targetFontSizeUnit); 
		= ${applyFontSize(targetFontSize, targetFontSizeUnit)} 
		avec targetFontSize = ${targetFontSize}
		et targetFontSizeUnit = ${targetFontSizeUnit}`);
		
		_customization.fontSize = applyFontSize(targetFontSize, targetFontSizeUnit); 
	}
	
	
	//$get injection here
	iGotTimeConfig.$inject = [];
	function iGotTimeConfig() {
		
		let service = {
			getDefaultFontSize 	: getDefaultFontSize,
			getFontSize 				: getFontSizeFct,
			setFontSize 				: setFontSizeFct
		};
		return service;
		
		
		/**
		 * return default font size value
		 */
		function getDefaultFontSize(){
			return _defaultConfig.fontSize;
		}
		/**
		 * retuns actual customized font size
		 */
		function getFontSizeFct(){
			let actualFontSize = angular.copy(_customization.fontSize);
			return actualFontSize;
		}
		/**
		 * set a new font size */	
		function setFontSizeFct(targetFontSize, targetFontSizeUnit){
			_customization.fontSize = applyFontSize(targetFontSize, targetFontSizeUnit); 
		}
		
		
	}
	
}

iGotTimeConfigProviderFct.$inject = [];
export default iGotTimeConfigProviderFct;