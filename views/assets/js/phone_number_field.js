class PhoneNumberField {
    constructor(element) {
        this.element = element
        this.mdcWrapperElement = this.element.querySelector('.mdc-text-field')
        this.input = this.element.querySelector('.mdc-text-field__input')
        this.originalName = this.input.name
        this.input.name = `${this.input.name}_raw`

        this.intlTelInput = window.intlTelInput(this.input, {
            utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@19.5.5/build/js/utils.js",
            dropdownContainer: document.body,
            autoPlaceholder: "off", // placeholders aren't compatible with Material Design.
            nationalMode: false,
            showFlags: false, // TODO: emoji flags?
            showSelectedDialCode: true
        })
        this.mdcWrapperElement.classList.add("mdc-text-field--with-leading-icon")

        this.input.addEventListener("countrychange", (event) => {
            this.labelPaddingLeft = getComputedStyle(this.input).paddingLeft
        })

        this.input.addEventListener("focus", (event) => {
            const label = this.element.querySelector("label")
            label.style.removeProperty("left")
        })

        this.input.addEventListener("blur", (event) => {
            const label = this.element.querySelector("label")
            if (!this.input.value) {
                label.style.left = this.labelPaddingLeft
            }
        })

        if (this.input.value) {
            this.intlTelInput.setNumber(this.input.value)
        }
    }

    validate(formData) {
        // https://github.com/jackocnr/intl-tel-input/blob/d6552cbb95172e81a79b3b528a5a350c8db1db33/src/js/utils.js#L177-L185
        switch (this.intlTelInput.getValidationError()) {
        case intlTelInputUtils.validationError.IS_POSSIBLE:
        case intlTelInputUtils.validationError.IS_POSSIBLE_LOCAL_ONLY:
            // LOCAL_ONLY is fine, as the plugin submits a full international number with country
            // code.
            return true
        case intlTelInputUtils.validationError.INVALID_COUNTRY_CODE:
            return {[this.input.id]: "Invalid country code"}
        case intlTelInputUtils.validationError.TOO_SHORT:
            return {[this.input.id]: "Phone number is too short"}
        case intlTelInputUtils.validationError.TOO_LONG:
            return {[this.input.id]: "Phone number is too long"}
        case intlTelInputUtils.validationError.INVALID_LENGTH:
            return {[this.input.id]: "Phone number is of an invalid length"}
        default:
            return {[this.input.id]: "Phone number is not valid"}
        }
    }

    prepareSubmit(params) {
        params.push([this.originalName, this.intlTelInput.getNumber()])
    }
}
