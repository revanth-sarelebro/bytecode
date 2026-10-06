const prisma = require("./prisma");

// A doctor may work with a patient once they share an appointment that is
// confirmed, in progress or finished.
const TREATING_STATUSES = ["CONFIRMED", "CHECKED_IN", "IN_PROGRESS", "COMPLETED"];

const doctorTreatsPatient = async (doctorId, patientId) => {
  const appointment = await prisma.appointment.findFirst({
    where: { doctorId, patientId, status: { in: TREATING_STATUSES } },
    select: { id: true },
  });
  return Boolean(appointment);
};

module.exports = { doctorTreatsPatient };
