import React from "react";
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
  } from "use-places-autocomplete";
  import {
    Combobox,
    ComboboxInput,
    ComboboxPopover,
    ComboboxList,
    ComboboxOption,
  } from "@reach/combobox";

function Search({ panTo }) {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
      } = usePlacesAutocomplete({
        requestOptions: {
          location: { lat: () => -32.221512, lng: () => 116.008072 },
          radius: 100 * 1000,
        },
      }
      );
    
      // https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompletionRequest
    
      const handleInput = (e) => {
        setValue(e.target.value);
      };
    
      const handleSelect = async (address) => {
        setValue(address, false);
        clearSuggestions();
    
        try {
          const results = await getGeocode({ address });
          const { lat, lng } = await getLatLng(results[0]);
          console.log( lat, lng )
          panTo({ lat, lng });
        } catch (error) {
          console.log("😱 Error: ", error);
        }
      };
      console.log("results", ready, value)
      return (
        <div className="search">
          <Combobox onSelect={handleSelect}>
            <ComboboxInput
              value={value}
              onChange={handleInput}
              disabled={!ready}
              placeholder="Search your location"
            />
            <ComboboxPopover>
              <ComboboxList>
                {status === "OK" &&
                  data.map(({ id, description }) => (
                    <ComboboxOption key={id} value={description} />
                  ))}
              </ComboboxList>
            </ComboboxPopover>
          </Combobox>
        </div>
      );
}

export default Search