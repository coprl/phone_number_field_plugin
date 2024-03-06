module Coprl
  module Presenters
    module Plugins
      module PhoneNumberField
        class PhoneNumberFieldComponent < DSL::Components::TextField
          def initialize(**attributes, &block)
            attributes = {
              behavior: :tel,
              auto_complete: "tel-national"
            }.merge(attributes)
            super(type: :phone_number_field, **attributes, &block)
            expand!
          end
        end
      end
    end
  end
end
