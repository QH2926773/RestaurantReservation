import React, { useState, useEffect } from "react";
import {
  getAllTableReservations,
  deleteTableReservation,
} from "../../utils/api";
import ErrorAlert from "../ErrorAlert";

import "./tables.css";

function DisplayTableReservations({ refreshDashboard }) {
  const [tables, setTables] = useState();
  const [error, setError] = useState("");

  useEffect(loadTableReservations, []);

  function loadTableReservations() {
    const abortController = new AbortController();
    setError(null);
    getAllTableReservations(abortController.signal)
      .then(setTables)
      .catch(setError);
    return () => abortController.abort();
  }

  function handleTableFinish(event, reservationID) {
    const tableID = event.target.value;
    const abortController = new AbortController();

    if (window.confirm("Is this table ready to seat new guests?") === true) {
      deleteTableReservation(tableID, abortController.signal)
        .then(loadTableReservations)
        .then(() => refreshDashboard())
        .catch(setError);

      return () => abortController.abort();
    } else {
      return;
    }
  }

  const list = () => {
    if (tables) {
      return tables.map((table) => {
        return (
          <div className="card tables-cards" key={table.table_id}>
            <div className="card-header" style={{ backgroundColor: "black" }}>
              <h5 className="card-title" style={{ color: "white" }}>
                {table.table_name}
              </h5>
            </div>
            <div className="card-body table-cancel">
              <p>Capacity: {table.capacity}</p>
              <p data-table-id-status={table.table_id}>
                {table.reservation_id ? "occupied" : "free"}
              </p>
              {table.reservation_id && (
                <button
                  className="btn bottom-button-cancel"
                  onClick={(event) =>
                    handleTableFinish(event, table.reservation_id)
                  }
                  value={table.table_id}
                  data-table-id-finish={table.table_id}
                >
                  Finish
                </button>
              )}
            </div>
          </div>
        );
      });
    }
  };
  return (
    <div className="table-titles">
      <h2 className="tables-title" style={{ alignSelf: "center" }}>
        Table Reservations
      </h2>
      <ErrorAlert error={error} />
      <div className="bottom-tables">{list()}</div>
    </div>
  );
}

export default DisplayTableReservations;