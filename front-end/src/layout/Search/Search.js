import React, { useState } from "react";
import ErrorAlert from "../ErrorAlert";
import { listReservations, cancelReservation } from "../../utils/api";
import Reservation from "../Reservation/Reservation";

function Search() {
  const [reservations, setReservations] = useState([]);
  const [mobileNumber, setMobileNumber] = useState("");
  const [errors, setErrors] = useState(null);

  function handleChange({ target: { value } }) {
    setMobileNumber(value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    loadReservations();
  }

  function loadReservations() {
    listReservations({ mobile_number: mobileNumber })
    .then(setReservations)
    .catch(setErrors);
  }

  function onCancel(reservation_id) {
    const abortController = new AbortController();
    cancelReservation(reservation_id, abortController.signal)
      .then(loadReservations)
    return () => abortController.abort();
  }

  const reservationList = reservations.length ? (
    <ul>
      {reservations.map((res) => (
        <li style={{ listStyleType: "none" }} key={res.reservation_id}>
          <Reservation onCancel={onCancel} reservation={res} />
        </li>
      ))}
    </ul>
  ) : <p>No reservations found</p>

  return (
    <main>
      <h3>Search for reservation by phone number</h3>
      <ErrorAlert error={errors ? errors[0] : null} />
      <form onSubmit={handleSubmit}>
        <label>
          <input
            type="text"
            id="mobile_number"
            name="mobile_number"
            className="form-control"
            onChange={handleChange}
            value={mobileNumber}
            placeholder="mobile number"
          />
        </label>
        <button type="submit">Submit</button>
      </form>
      {reservationList}
    </main>
  );
}

export default Search;

