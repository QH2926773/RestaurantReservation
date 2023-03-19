const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");
const { today } = require("../utils/date-time");


async function reservationExists(req, res, next) {
  const { reservationId } = req.params;
  const reservation = await service.read(reservationId);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
   return next({
    status: 404,
    message: `Reservation ${reservationId} cannot be found.`,
  });
}

function read(req, res) {
  const reservation = res.locals.reservation;
  res.json({ data: reservation });
}

async function list(req, res) {
  const {date}=req.query;
  const {mobile_number}=req.query;

  if(date){
    const data=await service.list(date)
    res.json({data})
  }
  else if(mobile_number){
    const data=await service.search(mobile_number);
    res.json({data})
  }
  else {
    const data = await service.list(today());
    res.json({ data });
  }
}

function hasData(req, res, next) {
  if (req.body.data) {
    return next();
  }
  return next({
    status: 400,
    message: "Body must have data property."
  })
}   
const VALID_PROPERTIES = [
  "reservation_id",
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
  "status",
  "created_at",
  "updated_at"
];
function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;
  const invalidProperties = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );
  if (invalidProperties.length) {
    next({ status: 400, message: `Invalid field(s): ${invalidProperties.join(", ")}`});
  }
  next();
}

async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data: data });
}

function peopleIsPositiveInteger(req, res, next) {
  let { people } = req.body.data;

  if (people > 0 && Number.isInteger(people)) {
    return next();
  }
  return next({
    status: 400,
    message: `Invalid people field. People must be a positive integer greater than 0`,
  });
}


function dateIsValid(req, res, next) {
  const { data:{reservation_date} } = req.body;
  if (
    new Date(reservation_date) !== "Invalid Date" &&
    !isNaN(new Date(reservation_date))
  ) {
    return next();
  }
  return next({
    status: 400,
    message: `reservation_date must be a valid date`,
  });
}

function hasValidTime(req, res, next) {
  const { reservation_time } = req.body.data;
  const timeRegex = new RegExp(/^(0\d|1\d|2\d):[0-5]\d$/);
  if (reservation_time && reservation_time !== "" && reservation_time.match(timeRegex)) {
    next();
  } else {
    next({ status: 400, message: "reservation_time must be a valid time"});
  }
}

function dateIsFuture(req, res, next) {
  const { reservation_date, reservation_time } = req.body.data;
  const [hour, minute] = reservation_time.split(":");
  let [year, month, date] = reservation_date.split("-");
  month -= 1;
  const reservationDate = new Date(year, month, date, hour, minute, 59, 59);
  const today = new Date();

  if (today <= reservationDate) {
    return next();
  }
  return next({
    status: 400,
    message: `reservation_date must be set in the future`,
  });
}

function dateIsNotTuesday(req, res, next) {
  const { reservation_date } = req.body.data;
  let [year, month, date] = reservation_date.split("-");
  month -= 1;
  const day = new Date(year, month, date).getDay();
  if (day !== 2) {
    return next();
  }
  return next({
    status: 400,
    message: `We are closed on Tuesdays`,
  });
}

function restaurantIsOpen(req, res, next) {
  let isOpen = false;
  const { reservation_time } = req.body.data;
  let [hour, minute] = reservation_time.split(":");
  hour = Number(hour);
  minute = Number(minute);

  if (hour > 10 && hour < 21) {
    isOpen = true;
  }
  if (hour === 10) {
    if (minute >= 30) {
      isOpen = true;
    }
  }
  if (hour === 21) {
    if (minute <= 30) {
      isOpen = true;
    }
  }

  if (isOpen) {
    return next();
  }
  return next({
    status: 400,
    message: `Reservations must be made between 10:30am to 9:30pm`,
  });
}


function statusIsValid(req, res, next) {
  const { status } = req.body.data;
  const validStatus = ["booked", "seated", "finished", "cancelled"];

  if (!validStatus.includes(status) && status) {
  next({
    status: 400,
    message: `${status} is not a valid status. Status must be booked, seated, or finished`,
  });
} else {
  next();
}}


  
  function hasDefaultBookedStatus(req, res, next) {
    const { status } = req.body.data;
    if (status && status !== "booked") {
      next({ status: 400, message: `A new reservation cannot have a status of ${status}` });
    } else {
      next();
    }
  }


function currentStatusIsNotFinished(req, res, next) {
  const currentStatus=res.locals.reservation.status;
  if (currentStatus === "finished") {
    return next({
      status: 400,
      message: `Reservations that are finished cannot be updated.`,
    });
  }
  next();
}

async function update(req, res) {
  const updatedReservation = {   
    ...req.body.data,
    reservation_id: res.locals.reservation.reservation_id,
  };
  const data = await service.update(updatedReservation);
  res.json({ data });
}

module.exports = {
  read: [asyncErrorBoundary(reservationExists), read],
  create: [
    hasData, 
    hasOnlyValidProperties,
    hasProperties("first_name","last_name","mobile_number","reservation_date","reservation_time","people"),
    dateIsValid,
    hasValidTime,
    peopleIsPositiveInteger, 
    dateIsNotTuesday,
    dateIsFuture,
    restaurantIsOpen,
    hasDefaultBookedStatus,
    asyncErrorBoundary(create),
  ],
   list: [asyncErrorBoundary(list)],
  update: [
    asyncErrorBoundary(reservationExists),
    hasData,
    hasProperties("first_name","last_name","mobile_number","reservation_date","reservation_time","people"),
    hasOnlyValidProperties,
    dateIsValid,
    hasValidTime,
    peopleIsPositiveInteger,   
    dateIsNotTuesday,
    dateIsFuture,
    restaurantIsOpen,
    hasDefaultBookedStatus,   
    asyncErrorBoundary(update),
  ],

  updateStatus: [
    hasData,
    asyncErrorBoundary(reservationExists),
    statusIsValid,
    currentStatusIsNotFinished,
    asyncErrorBoundary(update),
  ],
};