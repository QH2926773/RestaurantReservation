import React, { useEffect, useState } from "react";
import { listReservations, cancelReservation, listTables, finishTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { next, previous, today } from "../utils/date-time";
import Reservation from "../layout/Reservation/Reservation";
import Tables from "./Tables";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationDate, setReservationDate] = useState(date);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);

  useEffect(loadDashboard, [reservationDate]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date: reservationDate }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);

    listTables().then(setTables);
    return () => abortController.abort();
  }
  
  function onFinish(table_id, reservation_id) {
    finishTable(table_id, reservation_id)
      .then(loadDashboard)
  }

  function onCancel(reservation_id) {
    const abortController = new AbortController();
    cancelReservation(reservation_id, abortController.signal)
      .then(loadDashboard)
    return () => abortController.abort();
  }

  const reservationList = (
    <ul>
      {reservations.map((res) => (
        <li style={{ listStyleType: "none" }} key={res.reservation_id}>
          <Reservation onCancel={onCancel} reservation={res} />
        </li>
      ))}
    </ul>
  );

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      <button
        type="button"
        onClick={() => {
          setReservationDate(previous(reservationDate));
        }}
        className="btn btn-secondary"
      >
        {`<  Yesterday`}
      </button>
      <button
        type="button"
        onClick={() => {
          setReservationDate(today(reservationDate));
        }}
        className="btn btn-secondary m-2"
      >
        Today
      </button>
      <button
        type="button"
        onClick={() => {
          setReservationDate(next(reservationDate));
        }}
        className="btn btn-secondary"
      >
        {`Tomorrow  >`}
      </button>
      {reservations.length > 0 ? (
        reservationList
      ) : (
        <p>There are currently no reservations for {reservationDate}</p>
      )}

      <Tables onFinish={onFinish} tables={tables} />
    </main>
  );
}

export default Dashboard;
