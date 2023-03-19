const knex = require("../db/connection")

function list(date) {

  return knex("reservations")
    .select("*")
    .where({reservation_date: date})
    .andWhereNot({status: "finished"})
    .orderBy("reservation_time");
}

function search(mobile_number) {
  return knex("reservations")
    .select("*")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

function read(reservationId){
    return knex("reservations")
    .select("*")
    .where({"reservation_id":reservationId})
    .first()
}

function create(newReservation){
    return knex("reservations")
    .insert(newReservation)
    .returning("*")
    .then((result)=>result[0])
}

function update(updatedReservation) {
    return knex("reservations")
      .select("*")
      .where({ "reservation_id": updatedReservation.reservation_id })
      .update(updatedReservation, "*")
      .then(updatedRecords=>updatedRecords[0]);
  }

module.exports = {
   search,
    read,
    create,
    list,
    update,
  };
  