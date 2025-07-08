// require("dotenv").config();
// const { systemLogger } = require("../../config/logger");
// const db = require("../../models");
// const bcrypt = require("bcrypt");

// module.exports = async () => {
//   try {
//     // Default roles
//     const defaultRoles = [
//       { role_name: "dataentry_operator", role_type: "INTERNAL" },
//       { role_name: "AO", role_type: "INTERNAL" }
//     ];

//     // Check if roles already exist
//     const existingRoles = await db.role.findAll();
//     if (existingRoles.length > 0) {
//       systemLogger.info("Roles already exist. Skipping role creation.");
//     } else {
//       // Create default roles
//       await db.role.bulkCreate(defaultRoles);
//       systemLogger.info("Default roles created successfully");
//     }

//     // Create default users if they don't exist
//     const usersToCreate = [
//       {
//         nic: process.env.DATAENTRY_OPERATOR_NIC || "123456789V",
//         password: process.env.DATAENTRY_OPERATOR_PASSWORD || "operator123",
//         role_name: "dataentry_operator"
//       },
//       {
//         nic: process.env.AO_NIC || "987654321V",
//         password: process.env.AO_PASSWORD || "ao123456",
//         role_name: "AO"
//       }
//     ];

//     for (const userData of usersToCreate) {
//       const { nic, password, role_name } = userData;
      
//       // Check if user exists
//       const existingUser = await db.user.findOne({ where: { nic } });
      
//       if (!existingUser) {
//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);
        
//         // Create user
//         const user = await db.user.create({
//           nic,
//           password: hashedPassword
//         });
        
//         // Assign role
//         const role = await db.role.findOne({ where: { role_name } });
//         if (role) {
//           await user.addRole(role);
//           systemLogger.info(`Created ${role_name} user with NIC: ${nic}`);
//         }
//       }
//     }

//     systemLogger.info("Database seeding completed successfully");
//   } catch (error) {
//     systemLogger.error("Error during database seeding:", error);
//     throw error;
//   }
// };