import React, { useState, useEffect } from "react";
import ErrorAlert from "../ErrorAlert";
import { useHistory, useParams } from "react-router-dom";
import { listTables, seatReservation, readReservation } from "../../utils/api";

function SeatReservation(onSubmit) {
  const history = useHistory();
  const { reservation_id } = useParams();
  const [reservation, setReservation] = useState({});
  const [tables, setTables] = useState([]);
  const [tableId, setTableId] = useState("");
  const [tableErrors, setTableErrors] = useState(null);

  useEffect(loadTables, []);
  useEffect(() => {
    readReservation(reservation_id).then(setReservation);
  }, [reservation_id]);

  function loadTables() {
    const abortController = new AbortController();
    setTableErrors(null);
    listTables(abortController.signal).then(setTables).catch(setTableErrors);
    return () => abortController.abort();
  }

  function changeHandler({ target: { value } }) {
    setTableErrors(null);
    const errors = validate(value);
    if (errors.length) {
      console.log(errors);
      return setTableErrors(errors);
    }

    setTableId(value);
  }

  function validate(table_id) {
    const errors = [];
    const selectedTable = tables.find(
      (table) => table.table_id === Number(table_id)
    );
    if (selectedTable.reservation_id) {
      errors.push(new Error(`Table ${table_id} is occupied`));
    }

    if (reservation.people > selectedTable.capacity) {
      errors.push(
        new Error(
          `Table capacity not big enough to fit a party of ${reservation.people}`
        )
      );
    }
    return errors;
  }

  function submitHandler(event) {
    event.preventDefault();
    const abortController = new AbortController();

    seatReservation(reservation_id, tableId, abortController.signal)
      .then(() => history.push("/dashboard"))
      .catch(setTableErrors);
    return () => abortController.abort();
  }

  return (
    <>
      <form onSubmit={submitHandler}>
        <select
          className="m-2"
          id="table_id"
          name="table_id"
          value={tableId}
          required={true}
          onChange={changeHandler}
        >
          <option value="">Table</option>
          {tables.map((table) => (
            <option key={table.table_id} value={table.table_id}>
              {table.table_name} - {table.capacity}
            </option>
          ))}
        </select>
        <button
        type="submit"
        className="btn btn-primary m-2"
      >
        Submit
      </button>
      </form>
      <button
        type="button"
        className="btn btn-secondary m-2"
        onClick={() => history.goBack()}
      >
        Cancel
      </button>
      <ErrorAlert error={tableErrors ? tableErrors[0] : null} />
    </>
  );
}

export default SeatReservation;
