function i18nData(locale) {
    const countries = intlTelInputGlobals.getCountryData()
    const i18n = []
    const translator = new Intl.DisplayNames([locale], {type: "region"})

    for (const country of countries) {
        const name = translator.of(country.iso2.toUpperCase())
        i18n[country.iso2] = `${countryFlag(country.iso2)} ${name}`
    }

    return i18n
}

function countryFlag(alpha2) {
    const codePoints = alpha2.toUpperCase().split("").map(s => 0x1F1A5 + s.charCodeAt())
    return String.fromCodePoint(...codePoints)
}

class PhoneNumberField {
    constructor(element) {
        this.element = element
        this.mdcWrapperElement = this.element.querySelector(".mdc-text-field")
        this.input = this.element.querySelector(".mdc-text-field__input")
        this.originalName = this.input.name
        this.originalValue = this.input.value
        this.label = this.element.querySelector("label")
        this.mdcWrapperElement.vComponent.isDirty = this.isDirty.bind(this)

        this.intlTelInput = window.intlTelInput(this.input, {
            i18n: i18nData(this.locale),
            utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@19.5.5/build/js/utils.js",
            dropdownContainer: document.body,
            autoPlaceholder: "off", // Material Design doesn't support placeholders.
            nationalMode: false,
            showFlags: false,
            showSelectedDialCode: true,
            initialCountry: this.element.dataset.defaultCountry,
            defaultToFirstCountry: Boolean(this.element.dataset.defaultCountry),
            useFullscreenPopup: this.isMobile
        })

        // need to adjust the MDC floating label's left offset to account for the country code
        // picker:
        this.input.addEventListener("countrychange", () => this.updateDropdown())
        this.input.addEventListener("input", () => this.updateDropdown())
        this.input.addEventListener("blur", () => this.updateDropdown())
        this.input.addEventListener("focus", () => this.updateDropdown())

        this.input.addEventListener("open:countrydropdown", (event) => {
            if (this.isMobile) {
                return
            }

            // IntlTelInput seems to not play nice with COPRL's layout when the body is scrolled
            // beyond the top of the viewport, so manually adjust the dropdown container:
            const elementRect = this.element.getBoundingClientRect()
            const dropdownRect = this.intlTelInput.dropdown.querySelector(".iti__dropdown-content").getBoundingClientRect()
            const scrollBottom = document.scrollingElement.scrollTop + window.innerHeight

            if (dropdownRect.bottom > scrollBottom) {
                this.intlTelInput.dropdown.style.top = `${elementRect.top + 5}px`
                this.intlTelInput.dropdown.classList.add("iti--inline-dropdown--flipped")
            } else {
                this.intlTelInput.dropdown.style.top = `${elementRect.bottom - 5}px`
            }
        })

        this.input.addEventListener("close:countrydropdown", (event) => {
            this.intlTelInput.dropdown.classList.remove("iti--inline-dropdown--flipped")
        })

        // PhoneNumberField wraps a text field, which also submits params. Since the plugin is
        // responsible for submitting a value, ensure the enclosed text field doesn't submit
        // anything:
        this.input.vComponent.prepareSubmit = () => {}

        if (this.input.value) {
            // input may be coming in with or without leading `+`, so normalize and trim:
            const normalized = `+${this.originalValue}`.replace(/^\++/, "+")
            this.intlTelInput.setNumber(normalized)
        }

        this.mdcWrapperElement.classList.add("mdc-text-field--with-leading-icon")
        this.updateDropdown()
    }

    onShow() {
        // updateDropdown won't correctly calculate label and dropdown metrics when the field is
        // hidden, as getClientBoundingRect() returns all zeros. Update the dropdown when the field
        // is shown to account for this:
        this.updateDropdown()
    }

    validate(formData) {
        if (!this.input.reportValidity()) {
            return {[this.input.id]: this.input.validationMessage}
        }

        if (!this.input.value && !this.input.required) {
            return true
        }

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
        let number = this.intlTelInput.getNumber(0)
        const extension = this.intlTelInput.getExtension()

        if (extension) {
            number = `${number} x${extension}`
        }

        params.push([this.originalName, number])
    }

    reset() {
        this.input.value = this.input.vComponent.originalValue
        this.intlTelInput.setNumber(this.input.value)
    }

    isDirty() {
        const current = this.intlTelInput.getNumber()
        const original = intlTelInputUtils.formatNumber(this.originalValue)

        return current.localeCompare(original) != 0
    }

    destroy() {
        this.intlTelInput.destroy()
    }

    /** @private */
    updateDropdown() {
        // set flag in leading input area:
        const country = this.intlTelInput.getSelectedCountryData()
        let text = "🌐"

        if ("iso2" in country) {
            text = `${countryFlag(country.iso2)} +${country.dialCode}`
        }

        const dialCode = this.intlTelInput.selectedFlag.querySelector(".iti__selected-dial-code")
        dialCode.textContent = text

        const rect = this.intlTelInput.selectedFlag.getBoundingClientRect()
        this.input.style.paddingLeft = `${rect.width + 6}px`
        
        if (!this.input.value && document.activeElement != this.input) {
            this.label.style.left = `${rect.width}px`
        } else {
            this.label.style.removeProperty("left")
        }
    }

    /** @private */
    get locale() {
        return this.element.dataset.locale || (new Intl.NumberFormat()).resolvedOptions().locale
    }

    /** @private */
    get isMobile() {
        // from IntlTelInput
        return window.innerWidth <= 500
    }
}
