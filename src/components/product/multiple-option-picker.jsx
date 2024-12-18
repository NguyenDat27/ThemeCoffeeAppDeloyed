import PropTypes from "prop-types";
import { DisplayPriceChange } from "../../components/display/price-change";
import { Box, Checkbox, Text } from "zmp-ui";
import React from "react";

const MultipleOptionPicker = ({ product, variant, value, onChange }) => {

  const handleChange = (selectedOptions) => {
    onChange(selectedOptions); // Call the passed-in onChange handler
  };

  return (
    <Box my={8} className="space-y-2">
      <Text.Title size="small">{variant.label}</Text.Title>
      <Checkbox.Group
        className="flex flex-col space-y-2"
        name={variant.id}
        options={variant.options.map((option) => ({
          className: "last-of-type:mr-2",
          value: option.id,
          label: (
            <div className="w-full">
              <span className="flex-1">{option.label}</span>
              <span className="absolute right-0">
                <DisplayPriceChange option={option}>
                  {product}
                </DisplayPriceChange>
              </span>
            </div>
          ),
        }))}
        value={value}
        defaultValue={value}
        onChange={handleChange}
      />
    </Box>
  );
};

// Prop validation
MultipleOptionPicker.propTypes = {
  product: PropTypes.shape({
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  variant: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default MultipleOptionPicker;
