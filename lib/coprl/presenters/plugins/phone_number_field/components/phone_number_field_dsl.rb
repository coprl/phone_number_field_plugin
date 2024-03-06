require_relative 'phone_number_field_component'

module Coprl
  module Presenters
    module Plugins
      module PhoneNumberField
        module DSLComponents
          def phone_number_field(**attributes, &block)
            self << PhoneNumberField::PhoneNumberFieldComponent.new(parent: self, **attributes, &block)
          end
        end
      end
    end
  end
end
