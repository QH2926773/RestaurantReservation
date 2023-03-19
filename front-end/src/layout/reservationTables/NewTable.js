import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../../utils/api";
import ErrorAlert from "../ErrorAlert";

import "./tables.css";

function NewTable() {
  const [table, setTable] = useState({ table_name: "", capacity: null });
  const [error, setError] = useState("");
  const history = useHistory();
  const submitHandler = (event) => {
    event.preventDefault();
    const abortController = new AbortController();
    createTable({ data: table })
      .then(() => history.push("/dashboard"))
      .catch(setError);

    return () => abortController.Abort();
  };

  return (
    <div className="tables-form">
      <ErrorAlert error={error} />
      <h4>New Table</h4>
      <form onSubmit={submitHandler}>
        <div className="form-group">
          <label>Table Name</label>
          <input
            name="table_name"
            required
            className="form-control"
            onChange={(update) => {
              setTable({
                ...table,
                table_name: update.target.value,
              });
            }}
          ></input>
          <label>Capacity</label>
          <input
            name="capacity"
            className="form-control"
            type="number"
            onChange={(update) => {
              setTable({
                ...table,
                capacity: Number(update.target.value),
              });
            }}
          ></input>
        </div>
        <div className="tables-reservation-form-buttons">
          <button type="submit" className="btn bottom-button">
            submit
          </button>
          <button
            className="btn bottom-button-cancel"
            onClick={() => history.goBack()}
          >
            cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewTable;