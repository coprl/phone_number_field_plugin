module Coprl
  module Presenters
    module Plugins
      module PhoneNumberField
        class PhoneNumberFieldComponent < DSL::Components::TextField
          attr_reader :locale, :default_country

          def initialize(**attributes, &block)
            attributes = {
              behavior: :tel,
              auto_complete: "tel-national"
            }.merge(attributes)

            super(type: :phone_number_field, **attributes, &block)

            @locale = attributes[:locale]
            @default_country = normalize_country(attributes[:default_country])

            expand!
          end

          private

          def normalize_country(value)
            return if value.to_s.strip.empty?

            value.to_s.strip.upcase
          end
        end
      end
    end
  end
end
