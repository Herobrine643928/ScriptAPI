import { ModalFormData } from "@minecraft/server-ui";
class ModalFormDropdown {
    constructor(label, options, defaultValueIndex) {
        this.label = label;
        this.options = options;
        this.defaultValueIndex = defaultValueIndex;
    }
    ;
}
;
class ModalFormSlider {
    constructor(label, minimumValue, maximumValue, valueStep, defaultValue) {
        this.label = label;
        this.minimumValue = minimumValue;
        this.maximumValue = maximumValue;
        this.valueStep = valueStep;
        this.defaultValue = defaultValue;
    }
    ;
}
;
class ModalFormTextField {
    constructor(label, placeholderText, defaultValue) {
        this.label = label;
        this.placeholderText = placeholderText;
        this.defaultValue = defaultValue;
    }
    ;
}
;
class ModalFormToggle {
    constructor(label, defaultValue) {
        this.label = label;
        this.defaultValue = defaultValue;
    }
    ;
}
;
/**
 * Used to create a fully customizable pop-up form for a
 * player.
 */
class ModalFormBuilder extends ModalFormData {
    constructor() {
        super(...arguments);
        /**
         * Content of the pop-up form.
         */
        this.content = [];
    }
    dropdown(label, options, defaultValueIndex) {
        this.content.push(new ModalFormDropdown(label, options, defaultValueIndex));
        return this;
    }
    show(player) {
        if (!!this.titleText)
            super.title(this.titleText);
        for (const item of this.content) {
            if (item instanceof ModalFormDropdown)
                super.dropdown(item.label, item.options, item.defaultValueIndex);
            else if (item instanceof ModalFormSlider)
                super.slider(item.label, item.minimumValue, item.maximumValue, item.valueStep, item.defaultValue);
            else if (item instanceof ModalFormTextField)
                super.textField(item.label, item.placeholderText, item.defaultValue);
            else if (item instanceof ModalFormToggle)
                super.toggle(item.label, item.defaultValue);
        }
        ;
        return super.show(player);
    }
    slider(label, minimumValue, maximumValue, valueStep = 1, defaultValue) {
        this.content.push(new ModalFormSlider(label, minimumValue, maximumValue, valueStep, defaultValue));
        return this;
    }
    textField(label, placeholderText, defaultValue) {
        this.content.push(new ModalFormTextField(label, placeholderText, defaultValue));
        return this;
    }
    title(titleText) {
        this.titleText = titleText;
        return this;
    }
    toggle(label, defaultValue) {
        this.content.push(new ModalFormToggle(label, defaultValue));
        return this;
    }
}
;
export { ModalFormBuilder };
