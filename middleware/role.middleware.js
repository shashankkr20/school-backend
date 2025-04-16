const { ApiError } = require('../utils/apiError');
const httpStatus = require('http-status');

/**
 * Role-based access control middleware
 * @param {...String} allowedRoles - List of roles allowed to access the route
 * @returns {Function} Express middleware function
 */
const role = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // 1. Check if user exists (should come after auth middleware)
      if (!req.user || !req.user.role) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
      }

      // 2. Check if user has at least one of the required roles
      if (!allowedRoles.includes(req.user.role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          `Forbidden: Requires ${allowedRoles.join(' or ')} role`,
          {
            requiredRoles: allowedRoles,
            userRole: req.user.role
          }
        );
      }

      // 3. Check for special conditions (example: teacher can only access their own resources)
      if (req.user.role === 'teacher') {
        // If route has :teacherId param, verify it matches the user's ID
        if (req.params.teacherId && req.params.teacherId !== req.user.id) {
          throw new ApiError(
            httpStatus.FORBIDDEN,
            'Teachers can only access their own resources'
          );
        }
      }

      // 4. Check for parent-specific restrictions
      if (req.user.role === 'parent') {
        // Parents can only access their children's data
        if (req.params.studentId) {
          const isChild = await checkIfStudentBelongsToParent(
            req.params.studentId, 
            req.user.id
          );
          if (!isChild) {
            throw new ApiError(
              httpStatus.FORBIDDEN,
              'Parents can only access their children\'s data'
            );
          }
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Helper function to verify parent-child relationship
async function checkIfStudentBelongsToParent(studentId, parentId) {
  const { Student } = require('../models');
  const student = await Student.findOne({
    where: {
      id: studentId,
      parent_id: parentId
    }
  });
  return !!student;
}

module.exports = role;