import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../../utils/api";
import ErrorAlert from "../ErrorAlert";

/**
 * Defines the new table for this application.
 *
 * @returns {JSX.Element}
 */

function NewTable() {
  const history = useHistory();
  const initialState = {
    table_name: "",
    capacity: 0,
  };

  const [table, setTable] = useState(initialState);
  const [errors, setErrors] = useState(null);

  function validate(table) {
    const errors = [];

    function isValidName({ table_name }) {
      if (table_name.length < 2) {
        errors.push(
          new Error(`Table name '${table_name}' must be 2 or more characters`)
        );
      }
    }

    function isValidCapacity({ capacity }) {
      if (capacity <= 0) {
        errors.push(new Error("Capacity must be at least 1"));
      }
    }

    isValidName(table);
    isValidCapacity(table);

    return errors;
  }

  const handleChange = ({ target: { name, value } }) => {
    let newValue = value;
    if(name === 'capacity') {
      newValue = Number(value); 
    }
    setTable({
      ...table,
      [name]: newValue,
    });
  };

  function handleSubmit(event) {
    event.preventDefault();

    const errors = validate(table);
    if (errors.length) {
      console.log(errors);
      return setErrors(errors);
    }

    const abortController = new AbortController();
    setErrors(null);
    createTable(table, abortController.signal)
      .then(() => history.push(`/dashboard`))
      .catch((error) => {
        setErrors(error);
      });
    return () => abortController.abort();
  }

  return (
    <main>
      <h1>Create Table</h1>
      <ErrorAlert error={ errors ? errors[0] : null } />
      <form name="table-form" onSubmit={handleSubmit}>
        <div className="form-group d-md-flex mb-3">
          <label htmlFor="table-name">Name</label>
          <input
            id="table-name"
            name="table_name"
            type="text"
            onChange={handleChange}
            value={table.table_name}
            required
          />
        </div>
        <div className="form-group d-md-flex mb-3">
          <label htmlFor="table-capacity">Capacity</label>
          <input
            id="table-capacity"
            name="capacity"
            type="number"
            onChange={handleChange}
            value={table.capacity}
            required
          />
        </div>
        <button
          type="button"
          className="btn btn-secondary mr-2"
          onClick={() => history.goBack()}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </main>
  );
}

export default NewTable;