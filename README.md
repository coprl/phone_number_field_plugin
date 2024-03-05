# Phone number field Presenter Plugin

A [COPRL](https://github.com/coprl/coprl) plugin that accepts, formats, and validates phone number input.

The front-end interactions are handled by the [International Telephone Input](https://github.com/jackocnr/intl-tel-input)
JavaScript library.

## Installation

Add this line to your application's Gemfile:

```ruby
gem 'phone_number_field_presenter_plugin', git: 'https://github.com/coprl/phone_number_field_plugin', require: false
```

And then execute:

    $ bundle


## Usage in POMs

Declare the plugin in your POM, `plugin :phone_number_field`.

Drop in `phone_number_field` as a replacement for a standard `text_field` when asking the user to
provide a phone number:

```ruby
form do
  phone_number_field name: :phone_number, required: true do
    label "Phone number"
    value user.phone_number
  end

  button "Save", type: :raised do
    event :click do
      updates "/users/123"
    end
  end
end
```

Users can pick a country code from the dropdown in the leading area of the text field or by typing
a country code directly into the text field. Input is formatted as it is typed according to the
format for the current country code.

The plugin submits the field's value normalized and formatted as an international phone number in
standard [E.164](https://en.wikipedia.org/wiki/E.164) format.

## Configuration

The plugin has no configurable options, but accepts any attributes a standard COPRL `text_field`
does.

## Validation

The plugin performs best-effort formatting and validation on user input.

* Numbers that are too long, too short, or otherwise invalid for the selected country mark the field
  as invalid and prevent submission.
* Extraneous country codes are removed.
* National numbers are prefixed with the selected country code.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/coprl/phone_number_field_plugin.

## License

The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).

## Code of Conduct

Everyone interacting in the COPRL project's codebases, issue trackers, chat rooms and mailing lists is expected to follow the [code of conduct](https://github.com/coprl/coprl/blob/master/CODE-OF-CONDUCT.md).
