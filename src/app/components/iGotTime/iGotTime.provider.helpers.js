const FONT_SIZE_UNITS 	= ['px', 'em'];
const DEFAULT_SIZE_UNIT = FONT_SIZE_UNITS[0];
const DEFAULT_FONT_SIZE = 12;





/**
 * check is targetFontSizeUnit exists in managed font size (FONT_SIZE_UNITS)
 */
const isValidFontSizeUnit = (targetFontSizeUnit) => {
	let isValid = false;
	if (angular.isDefined(targetFontSizeUnit)) {
		angular.forEach(FONT_SIZE_UNITS, (value) => {
			isValid = targetFontSizeUnit === value ? 
					isValid || true 
				: isValid || false; 
		});
	}
	return isValid;
}



/**
 * return valid font-size (string)
 * 
 * NOTE : To return target font size and unit : 
 * - target font-size 
 * - target font size unit 
 * -> must be both valid
 */
const applyFontSize = (targetFontSize, targetFontSizeUnit) => {
	let fontSizeApplied = `${DEFAULT_FONT_SIZE}${DEFAULT_SIZE_UNIT}`;

	if(isValidFontSizeUnit(targetFontSizeUnit)){		
		if (angular.isDefined(targetFontSize)) {
			fontSizeApplied =  `${targetFontSize}${targetFontSizeUnit}`;
		}
	}
	return fontSizeApplied;
}






export {DEFAULT_SIZE_UNIT, DEFAULT_FONT_SIZE, applyFontSize} 