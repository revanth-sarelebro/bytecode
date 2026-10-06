const prisma = require("./prisma");

const createAuditLog = async ({
  userId = null,
  action,
  entity,
  entityId = null,
  details = null,
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
      },
    });
  } catch (error) {
    // Audit logging should not break the main application request.
    console.error("Audit log error:", error);
  }
};

module.exports = { createAuditLog };