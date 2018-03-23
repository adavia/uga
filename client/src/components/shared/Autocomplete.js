import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import Autosuggest from 'react-autosuggest';

import { AUTOCOMPLETE_CLIENTS_QUERY } from '../../graphql/queries/client';

class Autocomplete extends Component {
  constructor() {
    super();

    this.state = { value: '' }
  }

  onChange = (event, { newValue }) => {
    this.setState({ value: newValue });
  }

  render() {
    const {
      onSuggestionSelected,
      renderSuggestion,
      onSuggestionsFetchRequested,
      suggestions
    } = this.props;

    const inputProps = {
      placeholder: 'Client',
      value: this.state.value,
      className: 'form-control',
      onChange: this.onChange
    }

    return (
      <Autosuggest
        suggestions={suggestions || []}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={() => []}
        getSuggestionValue={suggestion => suggestion.comercialName}
        renderSuggestion={renderSuggestion}
        onSuggestionSelected={onSuggestionSelected}
        inputProps={inputProps}
      />
    );
  }
}

export default graphql(AUTOCOMPLETE_CLIENTS_QUERY, {
  options: ({ value }) => ({
    variables: {
      searchText: value
    },
    fetchPolicy: 'network-only'
  })
})(Autocomplete)
