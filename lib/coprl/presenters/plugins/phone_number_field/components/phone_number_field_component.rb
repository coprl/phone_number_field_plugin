module Coprl
  module Presenters
    module Plugins
      module PhoneNumberField
        class PhoneNumberFieldComponent < DSL::Components::TextField
          def initialize(**attributes, &block)
            super(type: :phone_number_field, **attributes, &block)
            expand!
          end
        end
      end
    end
  end
end
