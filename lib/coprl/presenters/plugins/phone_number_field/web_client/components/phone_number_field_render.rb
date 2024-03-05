module Coprl
  module Presenters
    module Plugins
      module PhoneNumberField
        module WebClientComponents
          def view_dir_phone_number_field(_pom)
            File.join(__dir__, '../../../../../../..', 'views', 'components')
          end

          def render_header_phone_number_field(pom, render:)
            render.call :erb, :phone_number_field_header, views: view_dir_phone_number_field(pom)
          end

          def render_phone_number_field(comp, render:, components:, index:)
            render.call :erb, :phone_number_field,
              views: view_dir_phone_number_field(comp),
              locals: {
                comp: comp,
                components: components,
                index: index
              }
          end
        end
      end
    end
  end
end
