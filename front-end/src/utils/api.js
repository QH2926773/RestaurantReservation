/**
 * Defines the base URL for the API.
 * The default values is overridden by the `API_BASE_URL` environment variable.
 */
import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-time";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

/**
 * Defines the default headers for these functions to work with `json-server`
 */
const headers = new Headers();
headers.append("Content-Type", "application/json");

/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the requst.
 * @param options
 *  any options for fetch
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range the promise is rejected.
 */
async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return null;
    }

    const payload = await response.json();

    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}

/**
 * Retrieves all existing reservation.
 * @returns {Promise<[reservation]>}
 */

export async function listReservations(params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  );

  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
}

/**
 * Creates a reservation.
 * @returns {Promise<reservation>}
 */

export async function createReservation(reservation, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  const options = {
    method: "POST",
    mode: "cors",
    headers,
    body: JSON.stringify({ data: reservation }),
    signal,
  };
  const response = await fetchJson(url, options, reservation);
  return response;
}

/**
 * Retrieves a reservation.
 * @returns {Promise<reservation>}
 */
export async function readReservation(reservation_id, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${reservation_id}`);
  const options = {
    method: "GET",
    mode: "cors",
    headers,
    signal,
  };
  return await fetchJson(url, options, reservation_id)
    .then(formatReservationDate)
    .then(formatReservationTime);
}

/**
 * Updates status of reservation and
 * @returns {Promise<reservation>}
 */
export async function seatReservation(reservation_id, table_id, signal) {
  const url = `${API_BASE_URL}/tables/${table_id}/seat`;
  const options = {
    method: "PUT",
    mode: "cors",
    headers,
    body: JSON.stringify({ data: { reservation_id } }),
    signal,
  };
  return await fetchJson(url, options, {});
}

export async function updateReservation(reservation, signal) {
  const { reservation_date, reservation_time, reservation_id } = reservation;
  const url = `${API_BASE_URL}/reservations/${reservation_id}`;

  const data = {
    ...reservation,
    reservation_date,
    reservation_time,
  };

  const options = {
    method: "PUT",
    mode: "cors",
    body: JSON.stringify({ data }),
    headers,
    signal,
  };
  const response = await fetchJson(url, options, reservation);

  return Array.isArray(response) ? response[0] : response;
}

export async function cancelReservation(reservation_id, signal) {
  const url = `${API_BASE_URL}/reservations/${reservation_id}/status`;
  const options = {
    method: "PUT",
    mode: "cors",
    headers,
    body: JSON.stringify({
      data: {
        status: "cancelled",
      },
    }),
    signal,
  };
  return await fetchJson(url, options, {});
}

/**
 * Retrieves all existing tables.
 * @returns {Promise<[table]>}
 *  a promise that resolves to a possibly empty array of tables saved in the database.
 */
export async function listTables(signal) {
  const url = new URL(`${API_BASE_URL}/tables`);
  return await fetchJson(url, { headers, signal }, []);
}

/**
 * Creates a table.
 * @returns {Promise<table>}
 *  a promise that resolves to a table saved in the database.
 */
export async function createTable(table, signal) {
  const url = new URL(`${API_BASE_URL}/tables`);
  const options = {
    method: "POST",
    mode: "cors",
    headers,
    body: JSON.stringify({ data: table }),
    signal,
  };

  return await fetchJson(url, options, table);
}

/**
 * Finishes a table.
 * @returns {Promise<table>}
 *  a promise that resolves to a table updated in the database.
 *  the table is freed of its reservation.
 */
export async function finishTable(table_id) {
  const url = `${API_BASE_URL}/tables/${table_id}/seat`;
  const options = {
    method: "DELETE",
    headers,
  };
  return await fetchJson(url, options, {});
}